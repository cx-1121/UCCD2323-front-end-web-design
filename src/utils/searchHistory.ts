/**
 * Recent project-search terms. Device-local (SafeStore/localStorage), not
 * account-synced — there is no account system to sync to. Plain search
 * keywords only, never full result payloads, so no encryption or TTL beyond
 * "most recent N" is warranted.
 */
import { safeLocal } from './storage';
import { PROJECT_SEARCH_HISTORY_KEY } from './storageKeys';

const MAX_ENTRIES = 10;

function readAll(): string[] {
  const stored = safeLocal.getJSON<unknown>(PROJECT_SEARCH_HISTORY_KEY);
  if (!Array.isArray(stored)) return [];
  return stored.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function writeAll(entries: string[]): string[] {
  const capped = entries.slice(0, MAX_ENTRIES);
  safeLocal.setJSON(PROJECT_SEARCH_HISTORY_KEY, capped);
  return capped;
}

/** Most recent terms first. */
export function getSearchHistory(): string[] {
  return readAll();
}

/** Records a term, de-duplicated case-insensitively and moved to the front. */
export function addSearchHistoryEntry(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return readAll();

  const withoutDuplicate = readAll().filter(
    (entry) => entry.toLowerCase() !== trimmed.toLowerCase()
  );
  return writeAll([trimmed, ...withoutDuplicate]);
}

export function removeSearchHistoryEntry(term: string): string[] {
  return writeAll(readAll().filter((entry) => entry !== term));
}

export function clearSearchHistory(): string[] {
  safeLocal.remove(PROJECT_SEARCH_HISTORY_KEY);
  return [];
}
