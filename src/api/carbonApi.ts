import { fetchWorldBankSeries, indexCells, latestCommonYear } from './worldBank';
import { readCache, writeCache, clearCache } from './cache';
import { CARBON_CACHE_KEY } from '../utils/storageKeys';
import type {
  CarbonSnapshot,
  EmitterRow,
  EnergyMixRow,
  SectorValue,
  SectorYear,
  YearValue,
} from './types';

/**
 * Live carbon figures for the dashboard, from the World Bank WDI database.
 *
 * Three logical fetches replace the mock data that used to back these charts:
 *   1. eight sector series x ten years for the World  (trend + donut)
 *   2. total and per-capita CO₂ for ten emitters      (top emitters)
 *   3. three electricity-mix shares for five countries (mix comparison)
 *
 * Each resolves to one request per indicator — thirteen in total, issued
 * concurrently — because only the per-indicator route is CORS-enabled. See
 * `worldBank.ts` for why the single-request batch endpoint is unusable here.
 * The day-long cache means a returning visitor pays none of it.
 *
 * A definitional note that belongs in code because it changes what the numbers
 * mean: `EN.GHG.CO2.*` is CO₂ **excluding land use (LULUCF)**, which runs
 * higher than the fossil-fuel-only figure often quoted for global emissions
 * (~39.6 Gt vs ~37 Gt for 2024). The UI cites the source so the two are not
 * silently conflated.
 */

/** Emissions series are published ~2 years behind; ten years covers the chart. */
const TREND_YEARS = Array.from({ length: 10 }, (_, i) => 2015 + i);

/**
 * Same span as the sector trend, deliberately.
 *
 * The world per-capita series is pulled from this request, and its sparkline
 * sits beside the total-emissions sparkline in the KPI row — two charts over
 * different year ranges would invite a comparison that isn't valid. Widening
 * the range costs no extra request, only rows.
 */
const EMITTER_YEARS = TREND_YEARS;

/** Electricity mix lags further; reach back far enough to find a complete year. */
const MIX_YEARS = Array.from({ length: 12 }, (_, i) => 2012 + i);

const WORLD = 'WLD';

/** Builds a sector indicator id from its two-letter World Bank suffix. */
const sectorSeries = (suffix: string) => `EN.GHG.CO2.${suffix}.MT.CE.AR5`;

const CO2_TOTAL = 'EN.GHG.CO2.MT.CE.AR5';
const CO2_PER_CAPITA = 'EN.GHG.CO2.PC.CE.AR5';

const MIX_FOSSIL = 'EG.ELC.FOSL.ZS';
const MIX_NUCLEAR = 'EG.ELC.NUCL.ZS';
const MIX_RENEWABLE = 'EG.ELC.RNEW.ZS';

/**
 * Sector groups, in stacked order (first renders at the baseline).
 *
 * The World Bank publishes eight CO₂ sectors. Two pairs are merged: industrial
 * combustion with industrial processes (both read as "industry" to anyone
 * looking at a chart), and agriculture with waste, which are 0.36% and 0.03%
 * of the total — slivers too thin to see, let alone label.
 *
 * Colours were validated as a six-slot categorical palette in this exact
 * adjacency order (lightness band, chroma floor, CVD separation, normal-vision
 * floor, surface contrast — all pass).
 */
export const SECTOR_GROUPS: {
  key: string;
  label: string;
  color: string;
  suffixes: string[];
}[] = [
  { key: 'power', label: 'Power', color: '#334d9e', suffixes: ['PI'] },
  { key: 'transport', label: 'Transport', color: '#0d9488', suffixes: ['TR'] },
  { key: 'industry', label: 'Industry', color: '#92400e', suffixes: ['IC', 'IP'] },
  { key: 'buildings', label: 'Buildings', color: '#d97706', suffixes: ['BU'] },
  { key: 'fugitive', label: 'Fugitive', color: '#8b5cf6', suffixes: ['FE'] },
  { key: 'other', label: 'Other', color: '#be185d', suffixes: ['AG', 'WA'] },
];

const ALL_SECTOR_SERIES = SECTOR_GROUPS.flatMap((g) => g.suffixes.map(sectorSeries));

/** Countries shown in the emitters bar list, with their display identity. */
export const EMITTERS: { iso3: string; code: string; name: string }[] = [
  { iso3: 'CHN', code: 'CN', name: 'China' },
  { iso3: 'USA', code: 'US', name: 'United States' },
  { iso3: 'IND', code: 'IN', name: 'India' },
  { iso3: 'EUU', code: 'EU', name: 'European Union' },
  { iso3: 'RUS', code: 'RU', name: 'Russia' },
  { iso3: 'JPN', code: 'JP', name: 'Japan' },
  { iso3: 'IRN', code: 'IR', name: 'Iran' },
  { iso3: 'KOR', code: 'KR', name: 'South Korea' },
  { iso3: 'SAU', code: 'SA', name: 'Saudi Arabia' },
  { iso3: 'IDN', code: 'ID', name: 'Indonesia' },
];

/** Countries in the electricity-mix comparison. */
export const MIX_COUNTRIES: { iso3: string; name: string }[] = [
  { iso3: 'CHN', name: 'China' },
  { iso3: 'USA', name: 'USA' },
  { iso3: 'IND', name: 'India' },
  { iso3: 'DEU', name: 'Germany' },
  { iso3: 'BRA', name: 'Brazil' },
];

/** Megatonnes per gigatonne. */
const MT_PER_GT = 1000;

/** Cache for a day: these series change once a year, not once a minute. */
export const CARBON_CACHE_TTL_MS = 86_400_000;

/* ── Bundled fallback ───────────────────────────────────────────────────── */

/**
 * Real World Bank world totals, gigatonnes, 2015–2024.
 *
 * These are exact. The COVID dip at 2020 and the recovery above the 2019 peak
 * by 2021 are both in the real series, so the degraded chart tells the same
 * story as the live one.
 */
const FALLBACK_TOTAL_GT: [number, number][] = [
  [2015, 36.3], [2016, 36.4], [2017, 37.0], [2018, 37.9], [2019, 38.0],
  [2020, 36.2], [2021, 38.2], [2022, 38.5], [2023, 39.1], [2024, 39.6],
];

/**
 * 2024 sector proportions, from the real readings
 * (15485.8 / 8299.2 / 9649.4 / 3253.8 / 2787.6 / 156.9 Mt of 39632.7).
 */
const FALLBACK_SECTOR_SHARE: Record<string, number> = {
  power: 0.3907,
  transport: 0.2094,
  industry: 0.2435,
  buildings: 0.0821,
  fugitive: 0.0703,
  other: 0.004,
};

/**
 * Bundled trend used when the upstream is unreachable.
 *
 * Each year's *total* is the real published figure; the split across sectors
 * holds the 2024 proportions constant, because storing ten years x six sectors
 * of hand-copied numbers invites exactly the drift this fallback exists to
 * avoid. The approximation is in the mix, never in the headline total — and the
 * UI flags the whole panel as bundled when this is what renders.
 */
function buildFallbackTrend(): SectorYear[] {
  return FALLBACK_TOTAL_GT.map(([year, totalGt]) => {
    const totalMt = totalGt * MT_PER_GT;

    const sectors: SectorValue[] = SECTOR_GROUPS.map((group) => ({
      key: group.key,
      label: group.label,
      color: group.color,
      value: Number((totalMt * (FALLBACK_SECTOR_SHARE[group.key] ?? 0)).toFixed(1)),
    }));

    return { year, sectors, totalGt };
  });
}

/**
 * World CO₂ per person, tonnes — the real World Bank series.
 *
 * Worth stating plainly because the chart it feeds says something the hand-made
 * predecessor did not: per-capita emissions have been flat for a decade, with a
 * COVID dip. Total emissions rose over the same period because population did.
 * The mock series this replaces drew a steady climb.
 */
const FALLBACK_PER_CAPITA: YearValue[] = [
  { year: 2015, value: 4.7 },
  { year: 2016, value: 4.65 },
  { year: 2017, value: 4.67 },
  { year: 2018, value: 4.73 },
  { year: 2019, value: 4.7 },
  { year: 2020, value: 4.47 },
  { year: 2021, value: 4.68 },
  { year: 2022, value: 4.67 },
  { year: 2023, value: 4.68 },
  { year: 2024, value: 4.69 },
];

/** Rendered whenever live data is unavailable, with a DEGRADED badge. */
export const FALLBACK_CARBON: CarbonSnapshot = {
  dataYear: 2024,
  sectorTrend: buildFallbackTrend(),
  annualTotalGt: 39.6,
  perCapitaTrend: FALLBACK_PER_CAPITA,
  emitters: [
    { code: 'CN', name: 'China', total: 13.02, perCapita: 9.3 },
    { code: 'US', name: 'United States', total: 4.87, perCapita: 14.3 },
    { code: 'IN', name: 'India', total: 3.13, perCapita: 2.2 },
    { code: 'EU', name: 'European Union', total: 2.51, perCapita: 5.6 },
    { code: 'RU', name: 'Russia', total: 1.85, perCapita: 12.8 },
    { code: 'JP', name: 'Japan', total: 1.01, perCapita: 8.2 },
    { code: 'IR', name: 'Iran', total: 0.79, perCapita: 8.8 },
    { code: 'KR', name: 'South Korea', total: 0.62, perCapita: 12.0 },
    { code: 'SA', name: 'Saudi Arabia', total: 0.61, perCapita: 16.6 },
    { code: 'ID', name: 'Indonesia', total: 0.72, perCapita: 2.5 },
  ],
  emittersYear: 2024,
  energyMix: [
    { country: 'China', fossil: 66.2, nuclear: 4.7, renewables: 28.4, other: 0.7 },
    { country: 'USA', fossil: 60.8, nuclear: 18.6, renewables: 20.3, other: 0.3 },
    { country: 'India', fossil: 75.6, nuclear: 2.9, renewables: 19.1, other: 2.4 },
    { country: 'Germany', fossil: 46.6, nuclear: 11.7, renewables: 39.8, other: 1.9 },
    { country: 'Brazil', fossil: 20.0, nuclear: 2.2, renewables: 77.4, other: 0.4 },
  ],
  mixYear: 2021,
  fetchedAt: 0,
};

/* ── Assembly ───────────────────────────────────────────────────────────── */

/** Builds the stacked sector trend, dropping years with no reported sectors. */
function buildSectorTrend(
  index: Map<string, Map<string, Map<number, number>>>,
): SectorYear[] {
  const worldSeries = index.get(WORLD);
  if (!worldSeries) return [];

  const trend: SectorYear[] = [];

  for (const year of TREND_YEARS) {
    const sectors: SectorValue[] = [];
    let totalMt = 0;

    for (const group of SECTOR_GROUPS) {
      // A merged group sums its members; a member with no figure contributes
      // nothing rather than poisoning the sum with NaN.
      let groupTotal = 0;
      let reported = false;

      for (const suffix of group.suffixes) {
        const value = worldSeries.get(sectorSeries(suffix))?.get(year);
        if (typeof value === 'number') {
          groupTotal += value;
          reported = true;
        }
      }

      if (!reported) continue;

      sectors.push({ key: group.key, label: group.label, color: group.color, value: groupTotal });
      totalMt += groupTotal;
    }

    if (sectors.length === 0) continue;

    trend.push({ year, sectors, totalGt: totalMt / MT_PER_GT });
  }

  return trend;
}

/** Picks the latest year with a total for at least one emitter. */
function buildEmitters(
  index: Map<string, Map<string, Map<number, number>>>,
): { rows: EmitterRow[]; year: number } {
  const candidateYears = [...EMITTER_YEARS].sort((a, b) => b - a);

  for (const year of candidateYears) {
    const rows: EmitterRow[] = [];

    for (const emitter of EMITTERS) {
      const series = index.get(emitter.iso3);
      const total = series?.get(CO2_TOTAL)?.get(year);
      const perCapita = series?.get(CO2_PER_CAPITA)?.get(year);

      if (typeof total !== 'number' || typeof perCapita !== 'number') continue;

      rows.push({
        code: emitter.code,
        name: emitter.name,
        total: Number((total / MT_PER_GT).toFixed(2)),
        perCapita: Number(perCapita.toFixed(1)),
      });
    }

    // Require most of the panel to be present before committing to a year;
    // rendering two of ten bars would misrepresent the ranking entirely.
    if (rows.length >= Math.ceil(EMITTERS.length * 0.7)) {
      return { rows, year };
    }
  }

  return { rows: [], year: 0 };
}

/**
 * Extracts the world per-capita series, ascending by year.
 *
 * Read from the emitters response rather than its own request: that call
 * already asks for `EN.GHG.CO2.PC.CE.AR5`, so adding `WLD` to its country list
 * yields this for free.
 */
function buildPerCapitaTrend(
  index: Map<string, Map<string, Map<number, number>>>,
): YearValue[] {
  const byYear = index.get(WORLD)?.get(CO2_PER_CAPITA);
  if (!byYear) return [];

  return [...byYear.entries()]
    .map(([year, value]) => ({ year, value: Number(value.toFixed(2)) }))
    .sort((a, b) => a.year - b.year);
}

/** Builds mix rows for the latest year complete across every country. */
function buildEnergyMix(
  index: Map<string, Map<string, Map<number, number>>>,
  year: number,
): EnergyMixRow[] {
  return MIX_COUNTRIES.map((country) => {
    const series = index.get(country.iso3);
    const fossil = series?.get(MIX_FOSSIL)?.get(year) ?? 0;
    const nuclear = series?.get(MIX_NUCLEAR)?.get(year) ?? 0;
    const renewables = series?.get(MIX_RENEWABLE)?.get(year) ?? 0;

    const named = fossil + nuclear + renewables;

    return {
      country: country.name,
      fossil: Number(fossil.toFixed(1)),
      nuclear: Number(nuclear.toFixed(1)),
      renewables: Number(renewables.toFixed(1)),
      // Clamped at zero: rounding can push the named shares a hair past 100.
      other: Number(Math.max(0, 100 - named).toFixed(1)),
    };
  });
}

/**
 * Fetches and assembles every live figure the dashboard needs.
 *
 * The three requests run concurrently — they are independent, and serialising
 * them would triple the worst-case wait against the 8 s per-request ceiling.
 *
 * @param force Bypasses the cache; wired to the panel's Refresh control.
 * @throws {ApiError} If any of the three requests fails or returns a bad shape.
 */
export async function getCarbonSnapshot(
  force = false,
): Promise<{ snapshot: CarbonSnapshot; source: 'live' | 'cache' }> {
  if (!force) {
    const cached = readCache<CarbonSnapshot>(CARBON_CACHE_KEY, CARBON_CACHE_TTL_MS);
    if (cached !== null) return { snapshot: cached, source: 'cache' };
  } else {
    clearCache(CARBON_CACHE_KEY);
  }

  const mixSeries = [MIX_FOSSIL, MIX_NUCLEAR, MIX_RENEWABLE];
  const mixCountryCodes = MIX_COUNTRIES.map((c) => c.iso3);

  const [sectorCells, emitterCells, mixCells] = await Promise.all([
    fetchWorldBankSeries([WORLD], ALL_SECTOR_SERIES, TREND_YEARS),
    fetchWorldBankSeries(
      // WLD rides along for the KPI row's per-capita series. It is not an
      // emitter row — `buildEmitters` iterates EMITTERS, so the world
      // aggregate never appears as a bar in the ranking.
      [...EMITTERS.map((e) => e.iso3), WORLD],
      [CO2_TOTAL, CO2_PER_CAPITA],
      EMITTER_YEARS,
    ),
    fetchWorldBankSeries(mixCountryCodes, mixSeries, MIX_YEARS),
  ]);

  const sectorTrend = buildSectorTrend(indexCells(sectorCells));
  if (sectorTrend.length === 0) {
    throw {
      kind: 'shape' as const,
      status: 200,
      message: 'World Bank returned no usable sector data.',
    };
  }

  const latest = sectorTrend[sectorTrend.length - 1];
  const emitterIndex = indexCells(emitterCells);
  const emitters = buildEmitters(emitterIndex);

  const mixYear = latestCommonYear(mixCells, mixCountryCodes, mixSeries);
  const energyMix = mixYear === null ? [] : buildEnergyMix(indexCells(mixCells), mixYear);

  const snapshot: CarbonSnapshot = {
    dataYear: latest.year,
    sectorTrend,
    annualTotalGt: Number(latest.totalGt.toFixed(1)),
    perCapitaTrend: buildPerCapitaTrend(emitterIndex),
    emitters: emitters.rows.sort((a, b) => b.total - a.total),
    emittersYear: emitters.year,
    energyMix,
    mixYear: mixYear ?? 0,
    fetchedAt: Date.now(),
  };

  writeCache(CARBON_CACHE_KEY, snapshot);

  return { snapshot, source: 'live' };
}
