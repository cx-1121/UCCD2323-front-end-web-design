import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Scripted jQuery double.
 *
 * `$.ajax` is replaced with a chainable stub whose behaviour is driven by a
 * queue: each entry describes what the next attempt does. That is what makes
 * the retry assertions meaningful — we can say "fail, fail, then succeed" and
 * count the attempts precisely.
 */
type Scripted =
  | { ok: true; data: unknown }
  | { ok: false; status: number; statusText: string; textStatus: string };

const script: Scripted[] = [];

/** Typed so `ajaxMock.mock.calls[0][0]` is the options object, not `never`. */
const ajaxMock = vi.fn<(options: Record<string, unknown>) => unknown>(() => {
  // Once the queue runs out the last entry repeats, so "always fails" needs
  // only a single entry.
  const step = script[Math.min(ajaxMock.mock.calls.length - 1, script.length - 1)];

  const chain = {
    done(callback: (data: unknown) => void) {
      if (step.ok) callback(step.data);
      return chain;
    },
    fail(callback: (jqXHR: unknown, textStatus: string, errorThrown: string) => void) {
      if (!step.ok) {
        callback({ status: step.status, statusText: step.statusText }, step.textStatus, '');
      }
      return chain;
    },
  };

  return chain;
});

vi.mock('jquery', () => ({
  default: { ajax: (options: Record<string, unknown>) => ajaxMock(options) },
}));

const { getJson, toApiError, isRetryable, MAX_RETRIES } = await import('./http');

beforeEach(() => {
  script.length = 0;
  ajaxMock.mockClear();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('toApiError', () => {
  it('classifies a timeout from textStatus, not status', () => {
    // A timeout and an offline failure both report status 0.
    expect(toApiError({ status: 0, statusText: '' }, 'timeout')).toMatchObject({ kind: 'timeout' });
    expect(toApiError({ status: 0, statusText: '' }, 'error')).toMatchObject({ kind: 'network' });
  });

  it('separates client from server failures', () => {
    expect(toApiError({ status: 404, statusText: 'Not Found' }, 'error').kind).toBe('client');
    expect(toApiError({ status: 503, statusText: 'Unavailable' }, 'error').kind).toBe('server');
  });

  it('maps a JSON parse failure to a shape error', () => {
    expect(toApiError({ status: 200, statusText: 'OK' }, 'parsererror', 'Unexpected token').kind).toBe(
      'shape',
    );
  });
});

describe('isRetryable', () => {
  it('retries transient kinds only', () => {
    expect(isRetryable({ kind: 'timeout', status: 0, message: '' })).toBe(true);
    expect(isRetryable({ kind: 'network', status: 0, message: '' })).toBe(true);
    expect(isRetryable({ kind: 'server', status: 500, message: '' })).toBe(true);

    expect(isRetryable({ kind: 'client', status: 404, message: '' })).toBe(false);
    expect(isRetryable({ kind: 'shape', status: 200, message: '' })).toBe(false);
    expect(isRetryable({ kind: 'abort', status: 0, message: '' })).toBe(false);
  });
});

describe('getJson', () => {
  it('AC-API-001: issues the request through jQuery $.ajax', async () => {
    script.push({ ok: true, data: { hello: 'world' } });

    await getJson('https://example.test/data', { q: 1 });

    // The transport is jQuery's $.ajax, not fetch or axios (FR-API-001).
    expect(ajaxMock).toHaveBeenCalledTimes(1);
    const options = ajaxMock.mock.calls[0][0] as unknown as Record<string, unknown>;
    expect(options.url).toBe('https://example.test/data');
    expect(options.method).toBe('GET');
    expect(options.dataType).toBe('json');
    expect(options.timeout).toBe(8000);
  });

  it('resolves with the parsed payload', async () => {
    script.push({ ok: true, data: { value: 42 } });

    await expect(getJson('https://example.test/data')).resolves.toEqual({ value: 42 });
  });

  it('AC-API-002: rejects with an ApiError carrying kind "timeout"', async () => {
    script.push({ ok: false, status: 0, statusText: '', textStatus: 'timeout' });

    await expect(getJson('https://example.test/slow')).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('AC-API-003: makes exactly 3 attempts on a persistent 500', async () => {
    script.push({ ok: false, status: 500, statusText: 'Server Error', textStatus: 'error' });

    await expect(getJson('https://example.test/boom')).rejects.toMatchObject({ kind: 'server' });

    expect(ajaxMock).toHaveBeenCalledTimes(MAX_RETRIES + 1);
  });

  it('AC-API-003: makes exactly 1 attempt on a 404', async () => {
    script.push({ ok: false, status: 404, statusText: 'Not Found', textStatus: 'error' });

    await expect(getJson('https://example.test/missing')).rejects.toMatchObject({ kind: 'client' });

    // Retrying a 404 only delays the fallback; the same request is rejected again.
    expect(ajaxMock).toHaveBeenCalledTimes(1);
  });

  it('recovers when a transient failure is followed by success', async () => {
    script.push(
      { ok: false, status: 0, statusText: '', textStatus: 'timeout' },
      { ok: true, data: { recovered: true } },
    );

    await expect(getJson('https://example.test/flaky')).resolves.toEqual({ recovered: true });
    expect(ajaxMock).toHaveBeenCalledTimes(2);
  });

  it('never sends credentials to the public upstreams', async () => {
    script.push({ ok: true, data: {} });

    await getJson('https://example.test/data');

    const options = ajaxMock.mock.calls[0][0] as unknown as { xhrFields: { withCredentials: boolean } };
    expect(options.xhrFields.withCredentials).toBe(false);
  });
});
