import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CACHE_TTL_MS, clearCache, readCache, writeCache } from './cache';

const KEY = 'refuture:cache:test:v1';

describe('TTL cache', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('round-trips a payload', () => {
    writeCache(KEY, { a: 1 });

    expect(readCache<{ a: number }>(KEY)).toEqual({ a: 1 });
  });

  it('serves an entry written 1 minute ago', () => {
    vi.useFakeTimers();
    writeCache(KEY, { fresh: true });

    vi.advanceTimersByTime(60_000);

    expect(readCache(KEY)).toEqual({ fresh: true });
  });

  it('discards an entry written 11 minutes ago', () => {
    vi.useFakeTimers();
    writeCache(KEY, { stale: true });

    vi.advanceTimersByTime(CACHE_TTL_MS + 60_000);

    expect(readCache(KEY)).toBeNull();
    // Expired entries are removed from storage
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('returns null for a key that was never written', () => {
    expect(readCache('refuture:cache:absent:v1')).toBeNull();
  });

  it('discards an entry that is not our expected shape', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ payload: { a: 1 } })); // savedAt missing

    expect(readCache(KEY)).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('clearCache forces the next read to miss', () => {
    writeCache(KEY, { a: 1 });
    clearCache(KEY);

    expect(readCache(KEY)).toBeNull();
  });
});
