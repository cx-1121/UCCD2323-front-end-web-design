import { safeSession } from '../utils/storage';

// Simple sessionStorage cache for API responses.
// Cached data expires after CACHE_TTL_MS milliseconds.

/** Entries older than this are discarded (10 minutes). */
export const CACHE_TTL_MS = 600_000;

/** Shape of what we store in sessionStorage. */
interface CacheEntry<T> {
  payload: T;
  savedAt: number;
}

/** Checks if a value matches our cache entry shape. */
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
 * Reads cached data if it exists and hasn't expired.
 * Removes stale/invalid entries automatically.
 */
export function readCache<T>(key: string, ttlMs: number = CACHE_TTL_MS): T | null {
  const entry = safeSession.getJSON<unknown>(key);
  if (entry === null) return null;

  if (!isCacheEntry<T>(entry)) {
    safeSession.remove(key);
    return null;
  }

  const age = Date.now() - entry.savedAt;

  // Check if the entry has expired
  if (age > ttlMs) {
    safeSession.remove(key);
    return null;
  }

  return entry.payload;
}

/** Saves data with the current timestamp. */
export function writeCache(key: string, payload: unknown): void {
  const entry: CacheEntry<unknown> = { payload, savedAt: Date.now() };
  safeSession.setJSON(key, entry);
}

/** Removes a cached entry. */
export function clearCache(key: string): void {
  safeSession.remove(key);
}
