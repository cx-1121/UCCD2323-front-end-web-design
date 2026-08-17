import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeLocal, safeSession } from './storage';

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

  it('returns false instead of throwing when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => safeLocal.set('quota:key', 'value')).not.toThrow();
    expect(safeLocal.set('quota:key', 'value')).toBe(false);
  });

  it('returns null instead of throwing when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => safeSession.get('blocked:key')).not.toThrow();
    expect(safeSession.get('blocked:key')).toBeNull();
  });

  it('round-trips JSON and drops a corrupt entry', () => {
    expect(safeSession.setJSON('json:key', { a: 1 })).toBe(true);
    expect(safeSession.getJSON<{ a: number }>('json:key')).toEqual({ a: 1 });

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    sessionStorage.setItem('json:broken', '{not valid json');

    expect(safeSession.getJSON('json:broken')).toBeNull();
    // The broken entry is removed so it doesn't fail again
    expect(sessionStorage.getItem('json:broken')).toBeNull();
  });
});
