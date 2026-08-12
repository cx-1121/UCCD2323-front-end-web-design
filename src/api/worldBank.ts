import { getJson, SLOW_MAX_RETRIES, SLOW_REQUEST_TIMEOUT_MS } from './http';
import type { ApiError } from './types';

/**
 * World Bank Indicators API client.
 *
 * **On why this is not the batch endpoint.** The `/v2/sources/{id}/country/…/
 * series/…/data` route answers many indicators in one request and looks like
 * the obvious choice — it returns 200 to curl and carries every cell we need.
 * It sends no `Access-Control-Allow-Origin` header, so a browser blocks it
 * outright. Only the classic `/v2/country/{c}/indicator/{i}` route is
 * CORS-enabled (verified 2026-08-12: `Access-Control-Allow-Origin: *`,
 * including for semicolon-joined country lists).
 *
 * So: one request per indicator, each covering every country and year at once,
 * issued concurrently and merged here. Callers see a single flat cell list and
 * do not need to know how many round trips produced it.
 */

const BASE_URL = 'https://api.worldbank.org/v2/country';

/**
 * Rows requested beyond the exact country x year count.
 *
 * The API defaults to 50 rows and silently paginates past it, which downstream
 * would look like "the series stops in 2019" rather than a truncated response.
 */
const PAGE_HEADROOM = 50;

/** One observation: a country/series/year triple and its value. */
export interface WorldBankCell {
  /** ISO3 country or aggregate code, e.g. `WLD`, `CHN`, `EUU`. */
  country: string;
  /** Indicator id, e.g. `EN.GHG.CO2.PI.MT.CE.AR5`. */
  series: string;
  year: number;
  value: number;
}

interface RawRow {
  countryiso3code: string;
  date: string;
  value: number | null;
}

/**
 * Validates the classic `[metadata, rows]` envelope.
 *
 * The World Bank answers a bad indicator with HTTP 200 and an XML error
 * document, and a bad parameter with 200 plus `[{message:[…]}]`, so status
 * alone proves nothing about the body.
 */
function isIndicatorResponse(value: unknown): value is [{ pages?: number }, RawRow[]] {
  if (!Array.isArray(value) || value.length < 2) return false;
  if (!Array.isArray(value[1])) return false;

  return value[1].every(
    (row) =>
      typeof row === 'object' &&
      row !== null &&
      typeof (row as RawRow).date === 'string' &&
      ((row as RawRow).value === null || typeof (row as RawRow).value === 'number'),
  );
}

function shapeError(message: string): ApiError {
  console.error(`[api] World Bank: ${message}`);
  return {
    kind: 'shape',
    status: 200,
    message: 'World Bank returned data in an unexpected format.',
  };
}

/** Fetches one indicator across every requested country and year. */
async function fetchIndicator(
  countries: string[],
  series: string,
  fromYear: number,
  toYear: number,
  expectedRows: number,
): Promise<WorldBankCell[]> {
  const body = await getJson<unknown>(
    `${BASE_URL}/${countries.join(';')}/indicator/${series}`,
    {
      format: 'json',
      // A range is accepted directly and is far shorter than listing every year.
      date: `${fromYear}:${toYear}`,
      per_page: expectedRows + PAGE_HEADROOM,
    },
    // This upstream is slow rather than unreliable — measured at 28 s for a
    // single indicator. The default 8 s ceiling turned every correct-but-late
    // response into a failure and degraded the whole dashboard.
    { timeoutMs: SLOW_REQUEST_TIMEOUT_MS, maxRetries: SLOW_MAX_RETRIES },
  );

  if (!isIndicatorResponse(body)) {
    throw shapeError(`unexpected envelope for ${series}`);
  }

  const [meta, rows] = body;

  // Truncation would read downstream as missing years, not as a failure.
  if (typeof meta.pages === 'number' && meta.pages > 1) {
    throw shapeError(`${series} was paginated into ${meta.pages} pages`);
  }

  const cells: WorldBankCell[] = [];

  for (const row of rows) {
    if (row.value === null) continue;

    // `country.id` is the 2-letter code and is `1W` for the world aggregate;
    // countryiso3code is the one that matches what callers ask for.
    const country = row.countryiso3code;
    if (!country) continue;

    const year = Number.parseInt(row.date, 10);
    if (!Number.isFinite(year)) continue;

    cells.push({ country, series, year, value: row.value });
  }

  return cells;
}

/**
 * Fetches every (country x series x year) combination.
 *
 * Indicators are requested concurrently — they are independent, and
 * serialising eight sector series would multiply the worst case by eight
 * against the 8 s per-request ceiling.
 *
 * Cells the World Bank has no figure for are dropped rather than returned as
 * nulls: a missing year in a trend is a gap to skip, not a zero to plot.
 *
 * @throws {ApiError} On transport failure, an unexpected envelope, or a
 *         truncated (multi-page) result for any indicator.
 */
export async function fetchWorldBankSeries(
  countries: string[],
  series: string[],
  years: number[],
): Promise<WorldBankCell[]> {
  if (countries.length === 0 || series.length === 0 || years.length === 0) return [];

  const fromYear = Math.min(...years);
  const toYear = Math.max(...years);
  const expectedRows = countries.length * (toYear - fromYear + 1);

  const perIndicator = await Promise.all(
    series.map((s) => fetchIndicator(countries, s, fromYear, toYear, expectedRows)),
  );

  return perIndicator.flat();
}

/** Indexes cells as country -> series -> year -> value for O(1) lookup. */
export function indexCells(
  cells: WorldBankCell[],
): Map<string, Map<string, Map<number, number>>> {
  const index = new Map<string, Map<string, Map<number, number>>>();

  for (const cell of cells) {
    let bySeries = index.get(cell.country);
    if (!bySeries) {
      bySeries = new Map();
      index.set(cell.country, bySeries);
    }

    let byYear = bySeries.get(cell.series);
    if (!byYear) {
      byYear = new Map();
      bySeries.set(cell.series, byYear);
    }

    byYear.set(cell.year, cell.value);
  }

  return index;
}

/**
 * Latest year for which *every* requested country/series pair reports.
 *
 * The electricity-mix indicators are the reason this exists: fossil and
 * nuclear currently run to 2023 while renewables stop at 2021, so taking each
 * series' own latest year would stack figures from different years into one
 * 100% bar. Computed rather than hardcoded so it self-corrects when the World
 * Bank publishes the next update.
 *
 * @returns The year, or `null` if no year is complete across the whole set.
 */
export function latestCommonYear(
  cells: WorldBankCell[],
  countries: string[],
  series: string[],
): number | null {
  const index = indexCells(cells);
  const years = [...new Set(cells.map((c) => c.year))].sort((a, b) => b - a);

  for (const year of years) {
    const complete = countries.every((country) =>
      series.every((s) => index.get(country)?.get(s)?.has(year) ?? false),
    );
    if (complete) return year;
  }

  return null;
}
