import { beforeEach, describe, expect, it, vi } from 'vitest';

const getJsonMock = vi.fn();

vi.mock('./http', () => ({
  getJson: (...args: unknown[]) => getJsonMock(...args),
  SLOW_REQUEST_TIMEOUT_MS: 30_000,
  SLOW_MAX_RETRIES: 1,
}));

const { fetchWorldBankSeries, indexCells, latestCommonYear } = await import('./worldBank');

/** A row in the classic `[metadata, rows]` envelope. */
function row(country: string, year: number, value: number | null) {
  return { countryiso3code: country, date: String(year), value };
}

const envelope = (rows: unknown[], pages = 1) => [{ pages, total: rows.length }, rows];

beforeEach(() => {
  getJsonMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchWorldBankSeries', () => {
  it('uses the CORS-enabled classic route, one request per indicator', async () => {
    getJsonMock.mockResolvedValue(envelope([]));

    await fetchWorldBankSeries(['WLD', 'CHN'], ['A', 'B'], [2023, 2024]);

    // The batch /sources/{id}/…/series/… route carries no CORS header and is
    // blocked in browsers, so each indicator gets its own classic request.
    expect(getJsonMock).toHaveBeenCalledTimes(2);

    const [url, params, options] = getJsonMock.mock.calls[0];
    expect(url).toContain('/country/WLD;CHN/indicator/A');
    expect(url).not.toContain('/sources/');
    expect((params as { date: string }).date).toBe('2023:2024');
    // 2 countries x 2 years, and must clear the API's default of 50.
    expect((params as { per_page: number }).per_page).toBeGreaterThan(50);

    // This upstream has been measured at 28 s; the default 8 s ceiling turned
    // every late-but-correct response into a dashboard-wide degradation.
    expect((options as { timeoutMs: number }).timeoutMs).toBeGreaterThanOrEqual(30_000);
    expect((options as { maxRetries: number }).maxRetries).toBeLessThan(2);
  });

  it('merges rows from every indicator into one flat cell list', async () => {
    getJsonMock
      .mockResolvedValueOnce(envelope([row('WLD', 2024, 15485.8)]))
      .mockResolvedValueOnce(envelope([row('WLD', 2024, 8299.2)]));

    const cells = await fetchWorldBankSeries(['WLD'], ['PI', 'TR'], [2024]);

    expect(cells).toEqual([
      { country: 'WLD', series: 'PI', year: 2024, value: 15485.8 },
      { country: 'WLD', series: 'TR', year: 2024, value: 8299.2 },
    ]);
  });

  it('drops null rows rather than plotting them as zero', async () => {
    getJsonMock.mockResolvedValueOnce(envelope([row('WLD', 2023, null), row('WLD', 2024, 10)]));

    const cells = await fetchWorldBankSeries(['WLD'], ['A'], [2023, 2024]);

    // A missing year is a gap to skip; a zero would be a claim of no emissions.
    expect(cells).toHaveLength(1);
    expect(cells[0].year).toBe(2024);
  });

  it('rejects the error body the World Bank serves with HTTP 200', async () => {
    getJsonMock.mockResolvedValueOnce([{ message: [{ key: 'Invalid value' }] }]);

    await expect(fetchWorldBankSeries(['WLD'], ['A'], [2024])).rejects.toMatchObject({
      kind: 'shape',
    });
  });

  it('rejects a paginated result instead of silently truncating the series', async () => {
    getJsonMock.mockResolvedValueOnce(envelope([row('WLD', 2024, 1)], 3));

    // Truncation would read downstream as "the upstream stopped reporting".
    await expect(fetchWorldBankSeries(['WLD'], ['A'], [2024])).rejects.toMatchObject({
      kind: 'shape',
    });
  });

  it('skips rows with no ISO3 code', async () => {
    // Some aggregates come back with an empty countryiso3code.
    getJsonMock.mockResolvedValueOnce(envelope([{ countryiso3code: '', date: '2024', value: 5 }]));

    await expect(fetchWorldBankSeries(['WLD'], ['A'], [2024])).resolves.toEqual([]);
  });

  it('returns empty without a request when asked for nothing', async () => {
    await expect(fetchWorldBankSeries([], ['A'], [2024])).resolves.toEqual([]);
    expect(getJsonMock).not.toHaveBeenCalled();
  });
});

describe('latestCommonYear', () => {
  const countries = ['DEU', 'BRA'];
  const series = ['FOSSIL', 'NUCLEAR', 'RENEW'];

  it('returns the newest year complete across every country and series', () => {
    const cells = [
      // Fossil and nuclear run one year ahead of renewables — the real shape
      // of the World Bank electricity-mix indicators.
      ...countries.flatMap((c) => [
        { country: c, series: 'FOSSIL', year: 2023, value: 1 },
        { country: c, series: 'NUCLEAR', year: 2023, value: 1 },
        { country: c, series: 'FOSSIL', year: 2021, value: 1 },
        { country: c, series: 'NUCLEAR', year: 2021, value: 1 },
        { country: c, series: 'RENEW', year: 2021, value: 1 },
      ]),
    ];

    // 2023 would stack 2023 fossil against 2021 renewables in one 100% bar.
    expect(latestCommonYear(cells, countries, series)).toBe(2021);
  });

  it('returns null when no year is complete for every country', () => {
    const cells = [
      { country: 'DEU', series: 'FOSSIL', year: 2021, value: 1 },
      { country: 'DEU', series: 'NUCLEAR', year: 2021, value: 1 },
      { country: 'DEU', series: 'RENEW', year: 2021, value: 1 },
      // BRA reports nothing.
    ];

    expect(latestCommonYear(cells, countries, series)).toBeNull();
  });

  it('returns null for an empty result set', () => {
    expect(latestCommonYear([], countries, series)).toBeNull();
  });
});

describe('indexCells', () => {
  it('nests country -> series -> year', () => {
    const index = indexCells([{ country: 'WLD', series: 'A', year: 2024, value: 42 }]);

    expect(index.get('WLD')?.get('A')?.get(2024)).toBe(42);
    expect(index.get('CHN')).toBeUndefined();
  });
});
