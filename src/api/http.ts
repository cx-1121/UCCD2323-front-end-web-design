import $ from 'jquery';
import type { ApiError, ApiErrorKind } from './types';

// API helper - handles all HTTP requests using jQuery $.ajax
// with timeout, retry, and error handling.

/** Default timeout per request (8 seconds). */
export const REQUEST_TIMEOUT_MS = 8000;

/** Longer timeout for slow APIs like World Bank (30 seconds). */
export const SLOW_REQUEST_TIMEOUT_MS = 30_000;

/** Number of retries after the first attempt (3 total attempts). */
export const MAX_RETRIES = 2;

/** Fewer retries for slow APIs since each attempt takes much longer. */
export const SLOW_MAX_RETRIES = 1;

/** Per-call overrides for APIs that need different settings. */
export interface RequestOptions {
  timeoutMs?: number;
  maxRetries?: number;
}

/** First backoff step; doubles each retry (500 ms, then 1000 ms). */
export const RETRY_BASE_MS = 500;

/** Lowest HTTP status considered a client error. */
const HTTP_CLIENT_ERROR_FLOOR = 400;

/** Lowest HTTP status considered a server error. */
const HTTP_SERVER_ERROR_FLOOR = 500;

/**
 * Converts jQuery's failure info into an ApiError object.
 */
export function toApiError(
  jqXHR: Pick<jQuery.jqXHR, 'status' | 'statusText'>,
  textStatus: string,
  errorThrown?: string,
): ApiError {
  const status = jqXHR.status ?? 0;

  let kind: ApiErrorKind;
  let message: string;

  if (textStatus === 'timeout') {
    kind = 'timeout';
    message = 'Request timed out.';
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
 * Checks if an error is worth retrying.
 * 4xx errors won't change, so we only retry timeouts, network issues, and 5xx.
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

/** One $.ajax GET request, wrapped in a Promise. */
function requestOnce<T>(
  url: string,
  params: Record<string, string | number>,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    $.ajax({
      url,
      method: 'GET',
      data: params,
      dataType: 'json',
      timeout: timeoutMs,
      xhrFields: { withCredentials: false },
    })
      .done((data: T) => resolve(data))
      .fail((jqXHR: JQuery.jqXHR, textStatus: string, errorThrown: string) => {
        reject(toApiError(jqXHR, textStatus, errorThrown));
      });
  });
}

/**
 * Makes a GET request and returns parsed JSON.
 * Retries on transient failures with exponential backoff.
 *
 * @throws {ApiError} Always throws an ApiError on failure.
 */
export async function getJson<T>(
  url: string,
  params: Record<string, string | number> = {},
  options: RequestOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? MAX_RETRIES;

  let lastError: ApiError = {
    kind: 'network',
    status: 0,
    message: 'Request was never attempted.',
  };

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await requestOnce<T>(url, params, timeoutMs);
    } catch (error) {
      lastError = error as ApiError;

      if (!isRetryable(lastError) || attempt === maxRetries) {
        throw lastError;
      }

      console.warn(
        `[api] ${lastError.kind} on ${url} (attempt ${attempt + 1}/${maxRetries + 1}); retrying.`,
      );

      // Exponential backoff with some randomness to avoid all clients
      // retrying at the exact same time
      const ceiling = RETRY_BASE_MS * 2 ** attempt;
      await delay(ceiling / 2 + Math.random() * (ceiling / 2));
    }
  }

  throw lastError;
}
