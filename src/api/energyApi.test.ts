import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ENERGY_CACHE_KEY } from '../utils/storageKeys';

const getJsonMock = vi.fn();

vi.mock('./http', () => ({
  getJson: (...args: unknown[]) => getJsonMock(...args),
  REQUEST_TIMEOUT_MS: 8000,
  MAX_RETRIES: 2,
}));

const { fetchSolarWind, fetchRenewableTrend, getEnergySnapshot } = await import('./energyApi');

/** A minimal valid Open-Meteo response. */
const validForecast = {
  hourly: {
    time: ['2026-08-12T00:00', '2026-08-12T01:00'],
    shortwave_radiation: [32, 188],
    wind_speed_10m: [4.7, 3.1],
  },
  hourly_units: { shortwave_radiation: 'W/m²', wind_speed_10m: 'km/h' },
};

/** A minimal valid World Bank response (note: nulls are normal). */
const validTrend = [
  { page: 1 },
  [
    { date: '2021', value: 4.9 },
    { date: '2020', value: null },
    { date: '2019', value: 4.7 },
  ],
];

beforeEach(() => {
  sessionStorage.clear();
  getJsonMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchSolarWind — validation', () => {
  it('returns the payload when the shape is valid', async () => {
    getJsonMock.mockResolvedValueOnce(validForecast);

    await expect(fetchSolarWind()).resolves.toMatchObject({ hourly: { time: expect.any(Array) } });
  });

  it('rejects when hourly is missing', async () => {
    getJsonMock.mockResolvedValueOnce({ latitude: 3.1, longitude: 101.7 });

    await expect(fetchSolarWind()).rejects.toMatchObject({ kind: 'shape', status: 200 });
  });

  it('rejects when the series lengths disagree', async () => {
    getJsonMock.mockResolvedValueOnce({
      ...validForecast,
      hourly: { ...validForecast.hourly, wind_speed_10m: [4.7] },
    });

    await expect(fetchSolarWind()).rejects.toMatchObject({ kind: 'shape' });
  });

  it('rejects when a series contains a non-numeric entry', async () => {
    getJsonMock.mockResolvedValueOnce({
      ...validForecast,
      hourly: { ...validForecast.hourly, shortwave_radiation: [32, 'n/a'] },
    });

    await expect(fetchSolarWind()).rejects.toMatchObject({ kind: 'shape' });
  });
});

describe('fetchRenewableTrend', () => {
  it('drops null years and sorts ascending', async () => {
    getJsonMock.mockResolvedValueOnce(validTrend);

    await expect(fetchRenewableTrend()).resolves.toEqual([
      { year: 2019, percent: 4.7 },
      { year: 2021, percent: 4.9 },
    ]);
  });

  it('rejects the World Bank error body served with HTTP 200', async () => {
    getJsonMock.mockResolvedValueOnce([{ message: [{ key: 'Invalid value' }] }]);

    await expect(fetchRenewableTrend()).rejects.toMatchObject({ kind: 'shape' });
  });

  it('returns an empty series when every year is null', async () => {
    getJsonMock.mockResolvedValueOnce([{ page: 1 }, [{ date: '2023', value: null }]]);

    await expect(fetchRenewableTrend()).resolves.toEqual([]);
  });
});

describe('getEnergySnapshot', () => {
  it('assembles both API responses into one snapshot and caches it', async () => {
    getJsonMock.mockResolvedValueOnce(validForecast).mockResolvedValueOnce(validTrend);

    const { snapshot, source } = await getEnergySnapshot();

    expect(source).toBe('live');
    expect(snapshot.solar.peakIrradiance).toBe(188);
    expect(snapshot.wind.peakSpeed).toBe(4.7);
    expect(snapshot.latestRenewableShare).toEqual({ year: 2021, percent: 4.9 });
    expect(sessionStorage.getItem(ENERGY_CACHE_KEY)).not.toBeNull();
  });

  it('serves a fresh cache entry without making requests', async () => {
    getJsonMock.mockResolvedValueOnce(validForecast).mockResolvedValueOnce(validTrend);
    await getEnergySnapshot();
    expect(getJsonMock).toHaveBeenCalledTimes(2);

    getJsonMock.mockClear();
    const second = await getEnergySnapshot();

    expect(second.source).toBe('cache');
    expect(getJsonMock).not.toHaveBeenCalled();
  });

  it('force bypasses the cache and re-fetches', async () => {
    getJsonMock.mockResolvedValueOnce(validForecast).mockResolvedValueOnce(validTrend);
    await getEnergySnapshot();

    getJsonMock.mockClear();
    getJsonMock.mockResolvedValueOnce(validForecast).mockResolvedValueOnce(validTrend);
    const forced = await getEnergySnapshot(true);

    expect(forced.source).toBe('live');
    expect(getJsonMock).toHaveBeenCalledTimes(2);
  });

  it('does not cache an invalid response', async () => {
    getJsonMock.mockResolvedValueOnce({ bad: true }).mockResolvedValueOnce(validTrend);

    await expect(getEnergySnapshot()).rejects.toMatchObject({ kind: 'shape' });
    expect(sessionStorage.getItem(ENERGY_CACHE_KEY)).toBeNull();
  });

  it('does not cache when the API is down', async () => {
    getJsonMock
      .mockRejectedValueOnce({ kind: 'server', status: 503, message: 'down' })
      .mockResolvedValueOnce(validTrend);

    await expect(getEnergySnapshot()).rejects.toMatchObject({ kind: 'server' });
    expect(sessionStorage.getItem(ENERGY_CACHE_KEY)).toBeNull();
  });
});
