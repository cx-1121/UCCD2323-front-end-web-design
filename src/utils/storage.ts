/**
 * Safe wrappers for localStorage and sessionStorage.
 *
 * These handle errors gracefully (e.g. Safari private mode throws,
 * and setItem throws when storage is full). Falls back to in-memory
 * storage when the real store is unavailable.
 */

type StorageKind = 'local' | 'session';

/** Public interface for a safe storage wrapper. */
export interface SafeStore {
  /** Reads a raw string. Returns null if absent or unreadable. */
  get(key: string): string | null;
  /** Writes a raw string. Returns false if it could not be saved. */
  set(key: string, value: string): boolean;
  /** Deletes a key. Returns false if it could not be removed. */
  remove(key: string): boolean;
  /** Reads and parses JSON. Returns null if absent or malformed. */
  getJSON<T>(key: string): T | null;
  /** Serializes and writes JSON. Returns false if it could not be saved. */
  setJSON(key: string, value: unknown): boolean;
}

/** Creates a safe wrapper around localStorage or sessionStorage. */
function createSafeStore(kind: StorageKind): SafeStore {
  /** In-memory fallback when the real store is unavailable. */
  const memory = new Map<string, string>();

  /** Only warn once per store to avoid spam. */
  let hasWarned = false;

  function warnOnce(operation: string, error: unknown): void {
    if (hasWarned) return;
    hasWarned = true;
    console.warn(
      `[storage] ${kind}Storage is unavailable (${operation}); ` +
        'falling back to in-memory values for this page load.',
      error,
    );
  }

  function store(): Storage {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  }

  function get(key: string): string | null {
    try {
      return store().getItem(key);
    } catch (error) {
      warnOnce('get', error);
      return memory.has(key) ? (memory.get(key) as string) : null;
    }
  }

  function set(key: string, value: string): boolean {
    memory.set(key, value);
    try {
      store().setItem(key, value);
      return true;
    } catch (error) {
      warnOnce('set', error);
      return false;
    }
  }

  function remove(key: string): boolean {
    memory.delete(key);
    try {
      store().removeItem(key);
      return true;
    } catch (error) {
      warnOnce('remove', error);
      return false;
    }
  }

  function getJSON<T>(key: string): T | null {
    const raw = get(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      warnOnce('getJSON', error);
      remove(key);
      return null;
    }
  }

  function setJSON(key: string, value: unknown): boolean {
    try {
      return set(key, JSON.stringify(value));
    } catch (error) {
      warnOnce('setJSON', error);
      return false;
    }
  }

  return { get, set, remove, getJSON, setJSON };
}

/** Persistent storage (survives tab close). */
export const safeLocal: SafeStore = createSafeStore('local');

/** Per-tab storage (cleared when the tab closes). */
export const safeSession: SafeStore = createSafeStore('session');
