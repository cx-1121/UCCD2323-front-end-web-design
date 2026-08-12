import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CARBON_CACHE_KEY } from '../utils/storageKeys';

const fetchSeriesMock = vi.fn();

vi.mock('./worldBank', async () => {
  const actual = await vi.importActual<typeof import('./worldBank')>('./worldBank');
  return {
    ...actual,
    fetchWorldBankSeries: (...args: unknown[]) => fetchSeriesMock(...args),
  };
});

const { getCarbonSnapshot, FALLBACK_CARBON, SECTOR_GROUPS, EMITTERS, MIX_COUNTRIES } =
  await import('./carbonApi');

const S = (k: string) => `EN.GHG.CO2.${k}.MT.CE.AR5`;

/** Real 2024 World Bank readings, so the assertions mean something. */
const SECTOR_2024: Record<string, number> = {
  PI: 15485.8, TR: 8299.2, IC: 6457.0, IP: 3192.4,
  BU: 3253.8, AG: 143.5, WA: 13.4, FE: 2787.6,
};

function sectorCells(years: number[]) {
  return years.flatMap((year) =>
    Object.entries(SECTOR_2024).map(([suffix, value]) => ({
      country: 'WLD',
      series: S(suffix),
      year,
      value,
    })),
  );
}

function emitterCells(year: number) {
  return EMITTERS.flatMap((e) => [
    { country: e.iso3, series: 'EN.GHG.CO2.MT.CE.AR5', year, value: 1000 },
    { country: e.iso3, series: 'EN.GHG.CO2.PC.CE.AR5', year, value: 5 },
  ]);
}

function mixCells(year: number) {
  return MIX_COUNTRIES.flatMap((c) => [
    { country: c.iso3, series: 'EG.ELC.FOSL.ZS', year, value: 60 },
    { country: c.iso3, series: 'EG.ELC.NUCL.ZS', year, value: 18 },
    { country: c.iso3, series: 'EG.ELC.RNEW.ZS', year, value: 20 },
  ]);
}

/** Wires the three concurrent calls in the order getCarbonSnapshot issues them. */
function mockAllThree(sectors: unknown[], emitters: unknown[], mix: unknown[]) {
  fetchSeriesMock
    .mockResolvedValueOnce(sectors)
    .mockResolvedValueOnce(emitters)
    .mockResolvedValueOnce(mix);
}

beforeEach(() => {
  sessionStorage.clear();
  fetchSeriesMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('getCarbonSnapshot', () => {
  it('merges the eight World Bank sectors into six display groups', async () => {
    mockAllThree(sectorCells([2024]), emitterCells(2024), mixCells(2021));

    const { snapshot } = await getCarbonSnapshot();
    const latest = snapshot.sectorTrend[snapshot.sectorTrend.length - 1];

    expect(latest.sectors.map((s) => s.key)).toEqual(SECTOR_GROUPS.map((g) => g.key));

    // Industry merges industrial combustion + processes.
    const industry = latest.sectors.find((s) => s.key === 'industry');
    expect(industry?.value).toBeCloseTo(SECTOR_2024.IC + SECTOR_2024.IP, 1);

    // Other merges agriculture + waste.
    const other = latest.sectors.find((s) => s.key === 'other');
    expect(other?.value).toBeCloseTo(SECTOR_2024.AG + SECTOR_2024.WA, 1);
  });

  it('derives the annual total in gigatonnes from the sector sum', async () => {
    mockAllThree(sectorCells([2024]), emitterCells(2024), mixCells(2021));

    const { snapshot } = await getCarbonSnapshot();

    // 39,632.7 Mt -> 39.6 Gt
    expect(snapshot.annualTotalGt).toBeCloseTo(39.6, 1);
    expect(snapshot.dataYear).toBe(2024);
  });

  it('converts emitter totals to Gt and sorts descending', async () => {
    const cells = emitterCells(2024).map((c) =>
      c.country === 'CHN' && c.series === 'EN.GHG.CO2.MT.CE.AR5'
        ? { ...c, value: 13021.2 }
        : c,
    );
    mockAllThree(sectorCells([2024]), cells, mixCells(2021));

    const { snapshot } = await getCarbonSnapshot();

    expect(snapshot.emitters[0].code).toBe('CN');
    expect(snapshot.emitters[0].total).toBeCloseTo(13.02, 2);
    expect(snapshot.emittersYear).toBe(2024);
  });

  it('carries the unattributed remainder as an explicit Other share', async () => {
    mockAllThree(sectorCells([2024]), emitterCells(2024), mixCells(2021));

    const { snapshot } = await getCarbonSnapshot();

    // 60 + 18 + 20 = 98, so 2% is real generation we cannot attribute.
    expect(snapshot.energyMix[0].other).toBeCloseTo(2, 1);
    expect(snapshot.mixYear).toBe(2021);
  });

  it('never lets the Other share go negative when shares round past 100', async () => {
    const over = MIX_COUNTRIES.flatMap((c) => [
      { country: c.iso3, series: 'EG.ELC.FOSL.ZS', year: 2021, value: 60.4 },
      { country: c.iso3, series: 'EG.ELC.NUCL.ZS', year: 2021, value: 20.4 },
      { country: c.iso3, series: 'EG.ELC.RNEW.ZS', year: 2021, value: 19.4 },
    ]);
    mockAllThree(sectorCells([2024]), emitterCells(2024), over);

    const { snapshot } = await getCarbonSnapshot();

    // A negative width would render as an inverted or overflowing segment.
    expect(snapshot.energyMix.every((row) => row.other >= 0)).toBe(true);
  });

  it('picks the latest year where every mix series reports, not each series own latest', async () => {
    const staggered = MIX_COUNTRIES.flatMap((c) => [
      { country: c.iso3, series: 'EG.ELC.FOSL.ZS', year: 2023, value: 60 },
      { country: c.iso3, series: 'EG.ELC.NUCL.ZS', year: 2023, value: 18 },
      ...mixCells(2021).filter((m) => m.country === c.iso3),
    ]);
    mockAllThree(sectorCells([2024]), emitterCells(2024), staggered);

    const { snapshot } = await getCarbonSnapshot();

    expect(snapshot.mixYear).toBe(2021);
  });

  it('rejects when the sector series yields nothing usable', async () => {
    mockAllThree([], emitterCells(2024), mixCells(2021));

    await expect(getCarbonSnapshot()).rejects.toMatchObject({ kind: 'shape' });
    expect(sessionStorage.getItem(CARBON_CACHE_KEY)).toBeNull();
  });

  it('serves a cached snapshot without issuing requests', async () => {
    mockAllThree(sectorCells([2024]), emitterCells(2024), mixCells(2021));
    await getCarbonSnapshot();
    expect(fetchSeriesMock).toHaveBeenCalledTimes(3);

    fetchSeriesMock.mockClear();
    const second = await getCarbonSnapshot();

    expect(second.source).toBe('cache');
    expect(fetchSeriesMock).not.toHaveBeenCalled();
  });

  it('force bypasses the cache', async () => {
    mockAllThree(sectorCells([2024]), emitterCells(2024), mixCells(2021));
    await getCarbonSnapshot();

    fetchSeriesMock.mockClear();
    mockAllThree(sectorCells([2024]), emitterCells(2024), mixCells(2021));
    const forced = await getCarbonSnapshot(true);

    expect(forced.source).toBe('live');
    expect(fetchSeriesMock).toHaveBeenCalledTimes(3);
  });

  it('propagates an upstream failure rather than caching a partial snapshot', async () => {
    fetchSeriesMock
      .mockRejectedValueOnce({ kind: 'server', status: 503, message: 'down' })
      .mockResolvedValueOnce(emitterCells(2024))
      .mockResolvedValueOnce(mixCells(2021));

    await expect(getCarbonSnapshot()).rejects.toMatchObject({ kind: 'server' });
    expect(sessionStorage.getItem(CARBON_CACHE_KEY)).toBeNull();
  });
});

describe('FALLBACK_CARBON', () => {
  it('is internally consistent so a degraded dashboard is not self-contradictory', () => {
    const latest = FALLBACK_CARBON.sectorTrend[FALLBACK_CARBON.sectorTrend.length - 1];

    expect(latest.year).toBe(FALLBACK_CARBON.dataYear);
    expect(latest.totalGt).toBeCloseTo(FALLBACK_CARBON.annualTotalGt, 1);
    expect(latest.sectors).toHaveLength(SECTOR_GROUPS.length);
  });

  it('keeps every mix row within 0–100 including the remainder', () => {
    for (const row of FALLBACK_CARBON.energyMix) {
      const total = row.fossil + row.nuclear + row.renewables + row.other;
      expect(total).toBeCloseTo(100, 1);
      expect(row.other).toBeGreaterThanOrEqual(0);
    }
  });
});
