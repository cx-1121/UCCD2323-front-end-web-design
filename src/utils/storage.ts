/**
 * The storage boundary (architecture §1, boundary 1).
 *
 * `localStorage` and `sessionStorage` are hostile APIs: reading `window
 * .localStorage` at all throws in Safari private browsing and under a
 * `SecurityError` from a sandboxed iframe, and `setItem` throws
 * `QuotaExceededError` once the origin's budget is spent. A `try/catch`
 * scattered across every call site is impossible to keep consistent, so every
 * access in the app funnels through the two stores exported here.
 *
 * Failure policy (FR-STO-001): a read that cannot reach the store returns
 * `null`, a write that cannot reach it returns `false`. Nothing throws. Values
 * are additionally mirrored into an in-memory Map so that a session running
 * with storage disabled still behaves coherently within the page's lifetime —
 * it simply forgets everything on reload (NFR-008).
 */

type StorageKind = 'local' | 'session';

/** Public surface of a fault-tolerant store. */
export interface SafeStore {
  /** Reads a raw string. Returns `null` if absent or unreadable. */
  get(key: string): string | null;
  /** Writes a raw string. Returns `false` if the value could not be persisted. */
  set(key: string, value: string): boolean;
  /** Deletes a key. Returns `false` if the removal could not be persisted. */
  remove(key: string): boolean;
  /** Reads and parses JSON. Returns `null` if absent, unreadable, or malformed. */
  getJSON<T>(key: string): T | null;
  /** Serializes and writes JSON. Returns `false` if it could not be persisted. */
  setJSON(key: string, value: unknown): boolean;
}

/**
 * Builds a fault-tolerant façade over one of the two web storage areas.
 *
 * The underlying store is resolved on every call rather than cached at module
 * load. Availability is not a constant — quota can be exhausted mid-session,
 * and a cached "unavailable" verdict from page load would permanently demote a
 * store that recovered.
 */
function createSafeStore(kind: StorageKind): SafeStore {
  /** Mirror of everything written, used when the real store is unreachable. */
  const memory = new Map<string, string>();

  /** One diagnostic per store per session; a warning on every keystroke is noise. */
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

  /** Throws if the store is unreachable — callers must wrap this. */
  function store(): Storage {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  }

  // Declared as closure-scoped functions rather than object methods so they
  // never depend on `this`. A caller writing `const { getJSON } = safeSession`
  // would otherwise get a TypeError at runtime — an easy mistake to make and a
  // hard one to read off a stack trace.
  function get(key: string): string | null {
    try {
      return store().getItem(key);
    } catch (error) {
      warnOnce('get', error);
      return memory.has(key) ? (memory.get(key) as string) : null;
    }
  }

  function set(key: string, value: string): boolean {
    // Mirror first so the in-memory view is correct whether or not the
    // persistent write lands.
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
      // A corrupt entry is worse than no entry: it would fail again on every
      // future read. Drop it and report a miss.
      warnOnce('getJSON', error);
      remove(key);
      return null;
    }
  }

  function setJSON(key: string, value: unknown): boolean {
    try {
      return set(key, JSON.stringify(value));
    } catch (error) {
      // JSON.stringify throws on circular structures and BigInt values.
      warnOnce('setJSON', error);
      return false;
    }
  }

  return { get, set, remove, getJSON, setJSON };
}

/** Persistent, origin-scoped storage. Survives tab close. */
export const safeLocal: SafeStore = createSafeStore('local');

/** Per-tab storage. Cleared when the tab closes — the right home for caches. */
export const safeSession: SafeStore = createSafeStore('session');
