import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeLocal, safeSession } from './storage';

/**
 * AC-STO-001 — the storage wrappers must absorb failures rather than throw.
 *
 * Failure is simulated by spying on `Storage.prototype`, which is what both
 * `localStorage` and `sessionStorage` delegate to. That reproduces the real
 * Safari-private-mode / quota-exceeded shape more faithfully than replacing the
 * global object, because the wrapper resolves the store on every call.
 */
describe('safeLocal / safeSession', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('round-trips a value through the real store', () => {
    expect(safeLocal.set('unit:key', 'value')).toBe(true);
    expect(safeLocal.get('unit:key')).toBe('value');

    expect(safeLocal.remove('unit:key')).toBe(true);
    expect(safeLocal.get('unit:key')).toBeNull();
  });

  it('AC-STO-001: returns false instead of throwing when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => safeLocal.set('quota:key', 'value')).not.toThrow();
    expect(safeLocal.set('quota:key', 'value')).toBe(false);
  });

  it('AC-STO-001: returns null instead of throwing when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => safeSession.get('blocked:key')).not.toThrow();
    expect(safeSession.get('blocked:key')).toBeNull();
  });

  it('serves the in-memory mirror when persistence is unavailable', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    // The write fails to persist...
    expect(safeSession.set('mirror:key', 'still-here')).toBe(false);

    // ...but the value remains readable for the life of the page (NFR-008).
    setSpy.mockRestore();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    expect(safeSession.get('mirror:key')).toBe('still-here');
  });

  it('round-trips JSON and drops a corrupt entry rather than throwing', () => {
    expect(safeSession.setJSON('json:key', { a: 1 })).toBe(true);
    expect(safeSession.getJSON<{ a: number }>('json:key')).toEqual({ a: 1 });

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    sessionStorage.setItem('json:broken', '{not valid json');

    expect(safeSession.getJSON('json:broken')).toBeNull();
    // The unreadable entry is evicted so it cannot fail again on every read.
    expect(sessionStorage.getItem('json:broken')).toBeNull();
  });

  it('returns false rather than throwing on a non-serializable value', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() => safeLocal.setJSON('circular:key', circular)).not.toThrow();
    expect(safeLocal.setJSON('circular:key', circular)).toBe(false);
  });
});
