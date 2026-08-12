import { safeSession } from '../utils/storage';

/**
 * sessionStorage-backed TTL cache for API responses (FR-API-004).
 *
 * sessionStorage rather than localStorage on purpose: the cached figures are a
 * snapshot of "right now", and a stale entry surviving into a browsing session
 * next week would be worse than a cache miss. Per-tab lifetime matches the data's
 * meaningfulness.
 */

/** Entries older than this are discarded rather than served (NFR-005). */
export const CACHE_TTL_MS = 600_000;

/** Envelope written to storage. `savedAt` is what makes the TTL enforceable. */
interface CacheEntry<T> {
  payload: T;
  savedAt: number;
}

/** Rejects anything that is not our own envelope shape. */
function isCacheEntry<T>(value: unknown): value is CacheEntry<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'payload' in value &&
    'savedAt' in value &&
    typeof (value as CacheEntry<T>).savedAt === 'number' &&
    Number.isFinite((value as CacheEntry<T>).savedAt)
  );
}

/**
 * Returns the cached payload when it exists and is still fresh.
 *
 * A stale or malformed entry is evicted on read rather than left in place — it
 * can never become valid again, and leaving it would mean re-parsing garbage on
 * every subsequent call.
 */
export function readCache<T>(key: string, ttlMs: number = CACHE_TTL_MS): T | null {
  const entry = safeSession.getJSON<unknown>(key);
  if (entry === null) return null;

  if (!isCacheEntry<T>(entry)) {
    safeSession.remove(key);
    return null;
  }

  const age = Date.now() - entry.savedAt;

  // A negative age means the clock moved backwards (NTP correction, manual
  // change). Treat it as untrustworthy rather than infinitely fresh.
  if (age < 0 || age > ttlMs) {
    safeSession.remove(key);
    return null;
  }

  return entry.payload;
}

/** Stores a payload with the current timestamp. */
export function writeCache(key: string, payload: unknown): void {
  const entry: CacheEntry<unknown> = { payload, savedAt: Date.now() };
  safeSession.setJSON(key, entry);
}

/** Drops an entry, forcing the next read to go upstream. */
export function clearCache(key: string): void {
  safeSession.remove(key);
}
