import $ from 'jquery';
import type { ApiError, ApiErrorKind } from './types';

/**
 * The network boundary (architecture §1, boundary 2).
 *
 * Every upstream call in the app goes through `getJson` here, and it is built
 * on jQuery's `$.ajax` — not `fetch`, not `axios` (FR-API-001). `$.getJSON` is
 * jQuery's shorthand for this exact call with `dataType: 'json'`; a single
 * transport is used rather than mixing both so that timeout, retry and error
 * normalisation apply uniformly.
 *
 * Nothing above this module ever sees a `jqXHR`. jQuery reports failure as the
 * triple `(jqXHR, textStatus, errorThrown)`, where the interesting signal is
 * split across all three — `status === 0` for a CORS rejection, `textStatus ===
 * 'timeout'` for a timeout, `errorThrown` carrying a parser message. Collapsing
 * that into one `ApiError` here is what lets callers write a single switch.
 */

/** Hard ceiling per attempt (NFR-002). */
export const REQUEST_TIMEOUT_MS = 8000;

/** Retries *after* the first attempt, so 3 total attempts (FR-API-003). */
export const MAX_RETRIES = 2;

/** First backoff step; doubles each retry (500 ms, then 1000 ms). */
export const RETRY_BASE_MS = 500;

/** Lowest HTTP status considered a client error. */
const HTTP_CLIENT_ERROR_FLOOR = 400;

/** Lowest HTTP status considered a server error. */
const HTTP_SERVER_ERROR_FLOOR = 500;

/**
 * Translates jQuery's failure triple into one `ApiError`.
 *
 * Order matters: `textStatus` is checked before `status`, because a timeout and
 * an offline failure both surface as `status === 0` and only `textStatus` tells
 * them apart.
 */
export function toApiError(
  jqXHR: Pick<JQuery.jqXHR, 'status' | 'statusText'>,
  textStatus: string,
  errorThrown?: string,
): ApiError {
  const status = jqXHR.status ?? 0;

  let kind: ApiErrorKind;
  let message: string;

  if (textStatus === 'timeout') {
    kind = 'timeout';
    message = `Request timed out after ${REQUEST_TIMEOUT_MS} ms.`;
  } else if (textStatus === 'abort') {
    kind = 'abort';
    message = 'Request was cancelled.';
  } else if (textStatus === 'parsererror') {
    kind = 'shape';
    message = `Response was not valid JSON: ${errorThrown ?? 'parse failed'}`;
  } else if (status === 0) {
    kind = 'network';
    message = 'No response received — the network or a CORS policy blocked the request.';
  } else if (status >= HTTP_SERVER_ERROR_FLOOR) {
    kind = 'server';
    message = `Upstream error ${status} ${jqXHR.statusText ?? ''}`.trim();
  } else if (status >= HTTP_CLIENT_ERROR_FLOOR) {
    kind = 'client';
    message = `Request rejected with ${status} ${jqXHR.statusText ?? ''}`.trim();
  } else {
    kind = 'network';
    message = `Unexpected failure (${textStatus}).`;
  }

  return { kind, status, message };
}

/**
 * Whether another attempt could plausibly succeed.
 *
 * 4xx means we asked wrongly — the same request will be rejected identically,
 * so retrying only delays the fallback. `shape` is deterministic for the same
 * reason. `abort` was our own decision.
 */
export function isRetryable(error: ApiError): boolean {
  return error.kind === 'timeout' || error.kind === 'network' || error.kind === 'server';
}

/** Promise-returning sleep, used for backoff between attempts. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** One `$.ajax` GET, normalised to a native promise. */
function requestOnce<T>(url: string, params: Record<string, string | number>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    $.ajax({
      url,
      method: 'GET',
      data: params,
      dataType: 'json',
      timeout: REQUEST_TIMEOUT_MS,
      // No credentials are ever sent: both upstreams are public and keyless,
      // and withCredentials against a wildcard CORS origin is rejected anyway.
      xhrFields: { withCredentials: false },
    })
      .done((data: T) => resolve(data))
      .fail((jqXHR: JQuery.jqXHR, textStatus: string, errorThrown: string) => {
        reject(toApiError(jqXHR, textStatus, errorThrown));
      });
  });
}

/**
 * Issues a GET and returns parsed JSON, retrying transient failures with
 * exponential backoff (FR-API-002, FR-API-003).
 *
 * @throws {ApiError} Always an `ApiError`, never a raw jqXHR.
 */
export async function getJson<T>(
  url: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  let lastError: ApiError = {
    kind: 'network',
    status: 0,
    message: 'Request was never attempted.',
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await requestOnce<T>(url, params);
    } catch (error) {
      lastError = error as ApiError;

      if (!isRetryable(lastError) || attempt === MAX_RETRIES) {
        throw lastError;
      }

      console.warn(
        `[api] ${lastError.kind} on ${url} (attempt ${attempt + 1}/${MAX_RETRIES + 1}); retrying.`,
      );

      // Full jitter on the backoff. Without it, every client that hit the same
      // upstream outage retries in lockstep at exactly 500 ms and 1000 ms,
      // re-converging on a service that is already struggling.
      const ceiling = RETRY_BASE_MS * 2 ** attempt;
      await delay(ceiling / 2 + Math.random() * (ceiling / 2));
    }
  }

  throw lastError;
}
