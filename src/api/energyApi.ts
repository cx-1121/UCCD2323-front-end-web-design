import { getJson } from './http';
import { readCache, writeCache, clearCache } from './cache';
import { ENERGY_CACHE_KEY } from '../utils/storageKeys';
import type { ApiError, LiveEnergySnapshot, RenewableSharePoint } from './types';

/**
 * Live renewable-energy data from two public APIs:
 *  - Open-Meteo — solar radiation and wind speed for Kuala Lumpur
 *  - World Bank — renewable share of energy consumption for Malaysia
 */

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const WORLD_BANK_URL = 'https://api.worldbank.org/v2/country';

/** Kuala Lumpur coordinates. */
const SITE_LATITUDE = 3.139;
const SITE_LONGITUDE = 101.6869;

/** ISO-3 country code for the World Bank series. */
const SITE_COUNTRY_ISO3 = 'MYS';

/** How many years of renewable-share history to request. */
const TREND_YEARS = '2000:2023';

/** World Bank paginates at 50 by default; request enough for our range. */
const WORLD_BANK_PAGE_SIZE = 100;

/* ── Response types ─────────────────────────────────────────────────────── */

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    shortwave_radiation: number[];
    wind_speed_10m: number[];
  };
  hourly_units: {
    shortwave_radiation: string;
    wind_speed_10m: string;
  };
}

interface WorldBankRow {
  date: string;
  value: number | null;
}

/* ── Validators ─────────────────────────────────────────────────────────── */

/** Validates the Open-Meteo response has the expected shape. */
function isOpenMeteoResponse(value: unknown): value is OpenMeteoResponse {
  if (typeof value !== 'object' || value === null) return false;

  const { hourly, hourly_units: units } = value as Partial<OpenMeteoResponse>;
  if (typeof hourly !== 'object' || hourly === null) return false;
  if (typeof units !== 'object' || units === null) return false;

  const { time, shortwave_radiation: radiation, wind_speed_10m: wind } = hourly;

  if (!Array.isArray(time) || !Array.isArray(radiation) || !Array.isArray(wind)) return false;
  if (time.length === 0) return false;
  if (radiation.length !== time.length || wind.length !== time.length) return false;

  const allNumeric = (series: unknown[]) => series.every((n) => typeof n === 'number' && !Number.isNaN(n));
  if (!allNumeric(radiation) || !allNumeric(wind)) return false;

  return typeof units.shortwave_radiation === 'string' && typeof units.wind_speed_10m === 'string';
}

/** Validates the World Bank response has the expected [metadata, rows] format. */
function isWorldBankResponse(value: unknown): value is [unknown, WorldBankRow[]] {
  if (!Array.isArray(value) || value.length < 2) return false;

  const rows = value[1];
  if (!Array.isArray(rows)) return false;

  return rows.every(
    (row) =>
      typeof row === 'object' &&
      row !== null &&
      typeof (row as WorldBankRow).date === 'string' &&
      ((row as WorldBankRow).value === null || typeof (row as WorldBankRow).value === 'number'),
  );
}

/** Creates an error for when the API returns 200 but unexpected data. */
function shapeError(source: string, received: unknown): ApiError {
  const keys =
    typeof received === 'object' && received !== null
      ? Object.keys(received as object).join(', ')
      : typeof received;

  console.error(`[api] ${source} returned an unexpected shape. Top-level keys: ${keys}`);

  return {
    kind: 'shape',
    status: 200,
    message: `${source} returned data in an unexpected format.`,
  };
}

/* ── API Clients ────────────────────────────────────────────────────────── */

/** Finds the index matching the current local hour, or 0 if none found. */
function currentHourIndex(times: string[]): number {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`;

  const index = times.indexOf(stamp);
  return index === -1 ? 0 : index;
}

/** Fetches today's solar irradiance and wind-speed forecast from Open-Meteo. */
export async function fetchSolarWind(): Promise<OpenMeteoResponse> {
  const data = await getJson<unknown>(OPEN_METEO_URL, {
    latitude: SITE_LATITUDE,
    longitude: SITE_LONGITUDE,
    hourly: 'shortwave_radiation,wind_speed_10m',
    forecast_days: 1,
    timezone: 'auto',
  });

  if (!isOpenMeteoResponse(data)) {
    throw shapeError('Open-Meteo', data);
  }

  return data;
}

/** Fetches the renewable share of final energy consumption from World Bank. */
export async function fetchRenewableTrend(): Promise<RenewableSharePoint[]> {
  const data = await getJson<unknown>(
    `${WORLD_BANK_URL}/${SITE_COUNTRY_ISO3}/indicator/EG.FEC.RNEW.ZS`,
    { format: 'json', per_page: WORLD_BANK_PAGE_SIZE, date: TREND_YEARS },
  );

  if (!isWorldBankResponse(data)) {
    throw shapeError('World Bank', data);
  }

  return data[1]
    .filter((row): row is WorldBankRow & { value: number } => row.value !== null)
    .map((row) => ({ year: Number.parseInt(row.date, 10), percent: row.value }))
    .filter((point) => Number.isFinite(point.year))
    .sort((a, b) => a.year - b.year);
}

/**
 * Fallback data used when the APIs are unavailable.
 * Real figures for Kuala Lumpur and Malaysia.
 */
export const FALLBACK_SNAPSHOT: LiveEnergySnapshot = {
  solar: { peakIrradiance: 841, currentIrradiance: 394, unit: 'W/m²' },
  wind: { peakSpeed: 9.3, currentSpeed: 6.4, unit: 'km/h' },
  latestRenewableShare: { year: 2021, percent: 4.9 },
  renewableTrend: [
    { year: 2000, percent: 4.1 },
    { year: 2005, percent: 3.4 },
    { year: 2010, percent: 3.2 },
    { year: 2015, percent: 4.6 },
    { year: 2018, percent: 4.8 },
    { year: 2021, percent: 4.9 },
  ],
  fetchedAt: 0,
};

/**
 * Fetches and assembles the full energy panel data.
 * Uses cache to avoid unnecessary network requests.
 *
 * @param force Bypasses the cache (used by the Refresh button).
 */
export async function getEnergySnapshot(
  force = false,
): Promise<{ snapshot: LiveEnergySnapshot; source: 'live' | 'cache' }> {
  if (!force) {
    const cached = readCache<LiveEnergySnapshot>(ENERGY_CACHE_KEY);
    if (cached !== null) return { snapshot: cached, source: 'cache' };
  } else {
    clearCache(ENERGY_CACHE_KEY);
  }

  const [forecast, trend] = await Promise.all([fetchSolarWind(), fetchRenewableTrend()]);

  const hourIndex = currentHourIndex(forecast.hourly.time);

  const snapshot: LiveEnergySnapshot = {
    solar: {
      peakIrradiance: Math.max(...forecast.hourly.shortwave_radiation),
      currentIrradiance: forecast.hourly.shortwave_radiation[hourIndex],
      unit: forecast.hourly_units.shortwave_radiation,
    },
    wind: {
      peakSpeed: Math.max(...forecast.hourly.wind_speed_10m),
      currentSpeed: forecast.hourly.wind_speed_10m[hourIndex],
      unit: forecast.hourly_units.wind_speed_10m,
    },
    latestRenewableShare: trend.length > 0 ? trend[trend.length - 1] : null,
    renewableTrend: trend,
    fetchedAt: Date.now(),
  };

  writeCache(ENERGY_CACHE_KEY, snapshot);

  return { snapshot, source: 'live' };
}
