import { useCallback, useEffect, useRef, useState } from 'react';
import { FALLBACK_CARBON, getCarbonSnapshot } from '../api/carbonApi';
import { isApiError, type ApiError, type CarbonSnapshot, type SnapshotSource } from '../api/types';
import { carbonBudget } from '../data/carbonMockData';

/** Where a KPI tile's number came from, so the UI can cite it honestly. */
export type KpiProvenance = 'World Bank' | 'IPCC AR6 (bundled)';

export interface KpiTile {
  label: string;
  value: number;
  unit: string;
  /** Sparkline series. Empty means "no series exists" — draw nothing. */
  trend: number[];
  /** Year range covered by `trend`, or null when there is no series. */
  trendRange: [number, number] | null;
  provenance: KpiProvenance;
}

/** Seconds in an average year, accounting for leap years. */
const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

/** Tonnes per gigatonne. */
const TONNES_PER_GT = 1e9;

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Live carbon figures for the dashboard, backed by the World Bank.
 *
 * Two different things are going on here, and conflating them would be
 * dishonest:
 *
 *  - `sectorTrend`, `emitters` and `energyMix` are **reported statistics**,
 *    fetched once and cached for a day. Each carries its own reference year
 *    because the three series publish on different schedules.
 *  - `counter` is a **projection**, not a measurement. It extrapolates the
 *    latest annual total across elapsed time so the number moves on screen.
 *    It is rebased on whatever total actually came back, rather than the
 *    constant it used to assume.
 */
export function useCarbonLiveData() {
  const [snapshot, setSnapshot] = useState<CarbonSnapshot>(FALLBACK_CARBON);
  const [source, setSource] = useState<SnapshotSource>('fallback');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const inFlight = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async (force = false, announceLoad = true) => {
    if (inFlight.current) return;

    inFlight.current = true;
    if (announceLoad) setIsLoading(true);

    try {
      const result = await getCarbonSnapshot(force);
      if (!isMounted.current) return;

      setSnapshot(result.snapshot);
      setSource(result.source);
      setError(null);
    } catch (caught) {
      if (!isMounted.current) return;

      const normalised: ApiError = isApiError(caught)
        ? caught
        : { kind: 'shape', status: 0, message: String(caught) };

      setError(normalised);
      setSource('fallback');
      console.warn(`[api] Carbon data unavailable (${normalised.kind}); using bundled figures.`);
    } finally {
      inFlight.current = false;
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // See useLiveEnergyApi for why this is suppressed: `announceLoad: false`
    // means no synchronous setState happens on this path.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false, false);
  }, [load]);

  /* ── Ticking projection ───────────────────────────────────────────────── */

  const annualGt = snapshot.annualTotalGt;
  const tonnesPerSecond = (annualGt * TONNES_PER_GT) / SECONDS_PER_YEAR;
  const baseTonnes = (dayOfYear() / 365.25) * annualGt * TONNES_PER_GT;

  const [counter, setCounter] = useState(baseTonnes);
  const startTime = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    // Re-anchored whenever the annual total changes, so the counter picks up
    // the fetched figure instead of continuing from the fallback's rate.
    startTime.current = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      setCounter(baseTonnes + elapsed * tonnesPerSecond);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [baseTonnes, tonnesPerSecond]);

  /* ── Derived views ────────────────────────────────────────────────────── */

  const latestYear = snapshot.sectorTrend[snapshot.sectorTrend.length - 1];

  /**
   * Donut shares for the latest year.
   *
   * Guarded against a zero total: an empty or all-zero series would otherwise
   * produce `0 / 0` and render every arc as `NaN`.
   */
  const sectorBreakdown = latestYear
    ? latestYear.sectors.map((sector) => {
        const totalMt = latestYear.totalGt * 1000;
        return {
          sector: sector.label,
          share: totalMt > 0 ? Number(((sector.value / totalMt) * 100).toFixed(1)) : 0,
          color: sector.color,
        };
      })
    : [];

  /* ── KPI row ──────────────────────────────────────────────────────────── */

  const totals = snapshot.sectorTrend.map((year) => year.totalGt);
  const trendYears = snapshot.sectorTrend.map((year) => year.year);

  /**
   * Year-over-year percentage change, derived from the same totals the trend
   * chart plots — so the tile and the chart can never disagree.
   *
   * One point shorter than `totals` by construction: the first year has no
   * predecessor to compare against.
   */
  const yoySeries = totals.slice(1).map((value, index) => {
    const previous = totals[index];
    return previous > 0 ? ((value - previous) / previous) * 100 : 0;
  });

  const perCapita = snapshot.perCapitaTrend;

  const range = (years: number[]): [number, number] | null =>
    years.length > 0 ? [years[0], years[years.length - 1]] : null;

  const kpis: KpiTile[] = [
    {
      label: 'Annual global CO₂',
      value: snapshot.annualTotalGt,
      unit: 'Gt',
      trend: totals,
      trendRange: range(trendYears),
      provenance: 'World Bank',
    },
    {
      label: 'Year-over-year change',
      value: Number((yoySeries[yoySeries.length - 1] ?? 0).toFixed(1)),
      unit: '%',
      trend: yoySeries,
      trendRange: range(trendYears.slice(1)),
      provenance: 'World Bank',
    },
    {
      label: 'Per capita average',
      value: perCapita[perCapita.length - 1]?.value ?? 0,
      unit: 't/person',
      trend: perCapita.map((point) => point.value),
      trendRange: range(perCapita.map((point) => point.year)),
      provenance: 'World Bank',
    },
    {
      /**
       * The one tile with no live equivalent. The remaining 1.5°C budget comes
       * from periodic IPCC assessments, not a queryable indicator series, so it
       * stays bundled — and ships no sparkline at all, because the declining
       * line it used to draw was invented rather than measured.
       */
      label: '1.5°C budget remaining',
      value: carbonBudget.remaining,
      unit: 'Gt',
      trend: [],
      trendRange: null,
      provenance: 'IPCC AR6 (bundled)',
    },
  ];

  return {
    counter,
    snapshot,
    source,
    isLoading,
    error,
    isDegraded: source === 'fallback',
    refresh: () => load(true),

    /** Reported statistics, each with its own reference year. */
    sectorTrend: snapshot.sectorTrend,
    sectorBreakdown,
    dataYear: snapshot.dataYear,
    annualTotalGt: snapshot.annualTotalGt,
    topEmitters: snapshot.emitters,
    emittersYear: snapshot.emittersYear,
    energyMix: snapshot.energyMix,
    mixYear: snapshot.mixYear,

    /** Values and sparklines, each carrying its own provenance. */
    kpis,

    /**
     * Still bundled: the remaining 1.5°C budget comes from IPCC assessment
     * reports rather than an indicator series. Kept separate so the UI labels
     * it differently from the fetched figures.
     */
    carbonBudget,
  };
}

export default useCarbonLiveData;
