import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCarbonSnapshotMock = vi.fn();

vi.mock('../api/carbonApi', async () => {
  const actual = await vi.importActual<typeof import('../api/carbonApi')>('../api/carbonApi');
  return {
    ...actual,
    getCarbonSnapshot: (...args: unknown[]) => getCarbonSnapshotMock(...args),
  };
});

const { FALLBACK_CARBON } = await import('../api/carbonApi');
const { useCarbonLiveData } = await import('./useCarbonLiveData');

beforeEach(() => {
  getCarbonSnapshotMock.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('useCarbonLiveData', () => {
  it('renders bundled figures immediately, before the network settles', () => {
    getCarbonSnapshotMock.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCarbonLiveData());

    // Synchronously after mount: a complete dataset, no empty state.
    expect(result.current.sectorTrend.length).toBeGreaterThan(0);
    expect(result.current.annualTotalGt).toBe(FALLBACK_CARBON.annualTotalGt);
    expect(result.current.isDegraded).toBe(true);
  });

  it('adopts live figures and clears the degraded flag', async () => {
    getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));
    expect(result.current.dataYear).toBe(FALLBACK_CARBON.dataYear);
  });

  it('keeps bundled figures and flags degraded when the fetch fails', async () => {
    getCarbonSnapshotMock.mockRejectedValue({ kind: 'network', status: 0, message: 'offline' });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isDegraded).toBe(true);
    expect(result.current.sectorTrend.length).toBeGreaterThan(0);
  });

  it('derives donut shares that sum to 100', async () => {
    getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));

    const total = result.current.sectorBreakdown.reduce((sum, s) => sum + s.share, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it('returns 0 rather than NaN when every sector reports zero', async () => {
    // A zero total makes share = 0/0 = NaN, which renders as `stroke-dasharray:
    // NaN` and silently blanks every arc of the donut.
    getCarbonSnapshotMock.mockResolvedValue({
      source: 'live',
      snapshot: {
        ...FALLBACK_CARBON,
        annualTotalGt: 0,
        sectorTrend: [
          {
            year: 2024,
            totalGt: 0,
            sectors: FALLBACK_CARBON.sectorTrend[0].sectors.map((s) => ({ ...s, value: 0 })),
          },
        ],
      },
    });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));

    expect(result.current.sectorBreakdown.every((s) => Number.isFinite(s.share))).toBe(true);
    expect(result.current.sectorBreakdown.every((s) => s.share === 0)).toBe(true);
  });

  describe('KPI row', () => {
    it('derives the annual-total tile and its sparkline from the same series', async () => {
      getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

      const { result } = renderHook(() => useCarbonLiveData());
      await waitFor(() => expect(result.current.isDegraded).toBe(false));

      const tile = result.current.kpis.find((k) => k.label === 'Annual global CO₂');

      // The tile used to show a live 39.6 above a bundled sparkline ending at
      // 37.1 — a number and a chart disagreeing on the same card.
      expect(tile?.value).toBe(FALLBACK_CARBON.annualTotalGt);
      expect(tile?.trend.at(-1)).toBeCloseTo(FALLBACK_CARBON.annualTotalGt, 1);
      expect(tile?.provenance).toBe('World Bank');
    });

    it('computes year-over-year change from the plotted totals', async () => {
      getCarbonSnapshotMock.mockResolvedValue({
        source: 'live',
        snapshot: {
          ...FALLBACK_CARBON,
          sectorTrend: [
            { year: 2023, totalGt: 100, sectors: FALLBACK_CARBON.sectorTrend[0].sectors },
            { year: 2024, totalGt: 110, sectors: FALLBACK_CARBON.sectorTrend[0].sectors },
          ],
        },
      });

      const { result } = renderHook(() => useCarbonLiveData());
      await waitFor(() => expect(result.current.isDegraded).toBe(false));

      const tile = result.current.kpis.find((k) => k.label === 'Year-over-year change');
      expect(tile?.value).toBe(10);
      // One point shorter than the totals: the first year has no predecessor.
      expect(tile?.trend).toHaveLength(1);
      expect(tile?.trendRange).toEqual([2024, 2024]);
    });

    it('reads per capita from the world series, flat rather than rising', async () => {
      getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

      const { result } = renderHook(() => useCarbonLiveData());
      await waitFor(() => expect(result.current.isDegraded).toBe(false));

      const tile = result.current.kpis.find((k) => k.label === 'Per capita average');
      const expected = FALLBACK_CARBON.perCapitaTrend;

      expect(tile?.value).toBe(expected.at(-1)?.value);
      expect(tile?.trend).toHaveLength(expected.length);
      // The replaced mock series climbed 4.3 -> 4.7; the real one barely moves.
      const spread = Math.max(...tile!.trend) - Math.min(...tile!.trend);
      expect(spread).toBeLessThan(0.4);
    });

    it('ships the budget tile with no sparkline and an IPCC citation', async () => {
      getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

      const { result } = renderHook(() => useCarbonLiveData());
      await waitFor(() => expect(result.current.isDegraded).toBe(false));

      const tile = result.current.kpis.find((k) => k.label === '1.5°C budget remaining');

      // The declining line it used to draw was invented, not measured.
      expect(tile?.trend).toEqual([]);
      expect(tile?.trendRange).toBeNull();
      expect(tile?.provenance).toBe('IPCC AR6 (bundled)');
    });

    it('never cites the World Bank for a figure it did not supply', async () => {
      getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

      const { result } = renderHook(() => useCarbonLiveData());
      await waitFor(() => expect(result.current.isDegraded).toBe(false));

      for (const tile of result.current.kpis) {
        const bundled = tile.provenance === 'IPCC AR6 (bundled)';
        expect(bundled).toBe(tile.label === '1.5°C budget remaining');
      }
    });

    it('survives a single-year series without dividing by zero', async () => {
      getCarbonSnapshotMock.mockResolvedValue({
        source: 'live',
        snapshot: {
          ...FALLBACK_CARBON,
          sectorTrend: [FALLBACK_CARBON.sectorTrend[0]],
          perCapitaTrend: [],
        },
      });

      const { result } = renderHook(() => useCarbonLiveData());
      await waitFor(() => expect(result.current.isDegraded).toBe(false));

      const yoy = result.current.kpis.find((k) => k.label === 'Year-over-year change');
      const perCapita = result.current.kpis.find((k) => k.label === 'Per capita average');

      expect(yoy?.trend).toEqual([]);
      expect(yoy?.trendRange).toBeNull();
      expect(perCapita?.value).toBe(0);
      expect(result.current.kpis.every((k) => Number.isFinite(k.value))).toBe(true);
    });
  });

  it('rebases the ticking counter on the fetched annual total', async () => {
    const doubled = { ...FALLBACK_CARBON, annualTotalGt: FALLBACK_CARBON.annualTotalGt * 2 };
    getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: doubled });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));

    // The counter used to extrapolate a hardcoded constant regardless of what
    // came back, so a different annual total produced an identical rate.
    await waitFor(() => expect(result.current.counter).toBeGreaterThan(0));
    expect(result.current.annualTotalGt).toBe(doubled.annualTotalGt);
  });
});
