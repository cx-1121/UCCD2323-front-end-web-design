import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowGlyph, CloseGlyph, SearchGlyph } from '../icons';
import { highlightMatches } from '../../utils/fuzzySearch';
import {
  addSearchHistoryEntry,
  clearSearchHistory,
  getSearchHistory,
  removeSearchHistoryEntry,
} from '../../utils/searchHistory';
import styles from './SearchField.module.css';

/**
 * The search control.
 *
 * Owns the *draft* the visitor is typing; the page owns the *committed*
 * query that the results are filtered by. The two are kept in step by a
 * 300ms debounce, so results track typing without a re-filter per keystroke,
 * while Enter / the search button / picking a suggestion commit immediately.
 *
 * Deliberately generic about what it is searching: suggestions arrive through
 * `getSuggestions`, so adding a second searchable collection — or a voice
 * button in the trailing slot — does not touch the logic here.
 */

export type SearchSuggestion = {
  id: string;
  label: string;
  /** Secondary line: category, year, whatever locates the hit. */
  hint?: string;
};

type SearchFieldProps = {
  /** The committed query. */
  value: string;
  /** Fires on commit and on the debounced draft. */
  onSearch: (term: string) => void;
  getSuggestions: (draft: string) => SearchSuggestion[];
  /** Announced politely whenever the result set changes size. */
  resultCount?: number;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  /** Show the pending indicator while the page is resolving results. */
  isSearching?: boolean;
};

const MAX_SUGGESTIONS = 8;
const DEBOUNCE_MS = 300;

/** Flat, keyboard-navigable model of whatever the panel is showing. */
type PanelRow =
  | { kind: 'history'; term: string }
  | { kind: 'suggestion'; suggestion: SearchSuggestion }
  | { kind: 'all'; term: string };

export default function SearchField({
  value,
  onSearch,
  getSuggestions,
  resultCount,
  label = 'Search projects',
  placeholder = 'Search projects, technologies…',
  maxLength = 100,
  isSearching = false,
}: SearchFieldProps) {
  const [draft, setDraft] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /**
   * True between compositionstart and compositionend. Pinyin and other IMEs
   * fire `input` for every intermediate keystroke of a composition, and
   * searching on those means searching for letters the visitor never meant
   * to type — so the debounce is held until the composition resolves.
   */
  const isComposingRef = useRef(false);
  /** Last value this field emitted, so external resets can be told apart. */
  const lastEmittedRef = useRef(value);

  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  /* An external reset (Clear filters) must reach the input; the field's own
     debounced emissions must not bounce back and clobber in-flight typing. */
  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value;
      setDraft(value);
    }
  }, [value]);

  const emit = useCallback(
    (term: string) => {
      lastEmittedRef.current = term;
      onSearch(term);
    },
    [onSearch]
  );

  /* Live search, debounced. Held during IME composition. */
  useEffect(() => {
    if (isComposingRef.current) return;
    if (draft === lastEmittedRef.current) return;

    const timer = window.setTimeout(() => emit(draft), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, emit]);

  const suggestions = useMemo(() => {
    const trimmed = draft.trim();
    if (!trimmed) return [];
    return getSuggestions(trimmed);
  }, [draft, getSuggestions]);

  const visibleSuggestions = suggestions.slice(0, MAX_SUGGESTIONS);
  const hasOverflow = suggestions.length > MAX_SUGGESTIONS;

  const rows = useMemo<PanelRow[]>(() => {
    if (!draft.trim()) {
      return history.map((term) => ({ kind: 'history', term }) as PanelRow);
    }
    const suggestionRows = visibleSuggestions.map(
      (suggestion) => ({ kind: 'suggestion', suggestion }) as PanelRow
    );
    return hasOverflow
      ? [...suggestionRows, { kind: 'all', term: draft.trim() } as PanelRow]
      : suggestionRows;
    // visibleSuggestions is derived from suggestions; listing it would churn.
  }, [draft, history, suggestions, hasOverflow, visibleSuggestions]);

  const isPanelOpen = isOpen && rows.length > 0;

  useEffect(() => {
    if (activeIndex >= rows.length) setActiveIndex(-1);
  }, [rows.length, activeIndex]);

  /* Dismiss on outside pointer press. */
  useEffect(() => {
    if (!isPanelOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isPanelOpen]);

  const commit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      setDraft(trimmed);
      emit(trimmed);
      if (trimmed) setHistory(addSearchHistoryEntry(trimmed));
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [emit]
  );

  const commitRow = useCallback(
    (row: PanelRow) => {
      commit(row.kind === 'suggestion' ? row.suggestion.label : row.term);
    },
    [commit]
  );

  const handleClear = useCallback(() => {
    setDraft('');
    emit('');
    setActiveIndex(-1);
    // Focus stays in the field so the visitor can retype straight away.
    inputRef.current?.focus();
    setIsOpen(getSearchHistory().length > 0);
  }, [emit]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Never steer the listbox with the keys the IME is currently using.
    if (isComposingRef.current) return;

    if (event.key === 'ArrowDown' && rows.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index + 1) % rows.length);
      return;
    }

    if (event.key === 'ArrowUp' && rows.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index <= 0 ? rows.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (isPanelOpen && activeIndex >= 0) commitRow(rows[activeIndex]);
      else commit(draft);
      return;
    }

    if (event.key === 'Escape') {
      // First Escape retreats the panel; a second one clears the field.
      if (isPanelOpen) {
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      } else if (draft) {
        event.preventDefault();
        handleClear();
      }
    }
  };

  const atLimit = draft.length >= maxLength;

  /* Real pending signal rather than a decorative timer: the field is behind
     whenever the draft has not reached the results yet — the debounce window,
     plus any genuinely async work the page reports through `isSearching`. */
  const isPending = isSearching || draft.trim() !== value.trim();

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.field}>
        {/* Clicking the icon runs the search, so it is a button, not decor. */}
        <button
          type="button"
          className={styles.leading}
          onClick={() => commit(draft)}
          aria-label="Search"
        >
          {isPending ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <SearchGlyph className={styles.glyph} />
          )}
        </button>

        <input
          ref={inputRef}
          id={baseId}
          type="search"
          className={styles.input}
          value={draft}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-label={label}
          autoComplete="off"
          role="combobox"
          aria-expanded={isPanelOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-describedby={atLimit ? `${baseId}-limit` : undefined}
          aria-activedescendant={
            isPanelOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          onChange={(event) => {
            setDraft(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={(event) => {
            isComposingRef.current = false;
            // Re-enter through state so the debounce restarts from the
            // resolved text rather than the half-composed romanisation.
            setDraft(event.currentTarget.value);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {draft && (
          <button
            type="button"
            className={styles.clear}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <CloseGlyph className={styles.glyph} />
          </button>
        )}

        {/* The dedicated submit, kept as its own control beside the glyph so
            there are still three ways in. It carries the arrow rather than a
            second magnifier: two identical icons doing different jobs is
            worse than either, and the arrow is already this system's "go". */}
        <button
          type="button"
          className={styles.submit}
          onClick={() => commit(draft)}
          aria-label="Submit search"
        >
          <ArrowGlyph className={styles.glyph} />
        </button>
      </div>

      {atLimit && (
        <p id={`${baseId}-limit`} className={styles.limit}>
          Maximum {maxLength} characters.
        </p>
      )}

      {/* Result counts are announced, not just rendered — a filtered grid is
          a silent change for anyone not looking at it. */}
      <p className={styles.srOnly} role="status" aria-live="polite">
        {value.trim() && resultCount !== undefined
          ? `${resultCount} ${resultCount === 1 ? 'project' : 'projects'} found for ${value.trim()}`
          : ''}
      </p>

      {isPanelOpen && (
        <div className={styles.panel}>
          {!draft.trim() && (
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Recent searches</span>
              <button
                type="button"
                className={styles.panelAction}
                onClick={() => {
                  setHistory(clearSearchHistory());
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
              >
                Clear all
              </button>
            </div>
          )}

          <ul className={styles.list} id={listboxId} role="listbox" aria-label={label}>
            {rows.map((row, index) => {
              const isActive = index === activeIndex;
              const rowClass = [styles.row, isActive && styles.rowActive]
                .filter(Boolean)
                .join(' ');

              if (row.kind === 'history') {
                return (
                  <li key={`history-${row.term}`} className={styles.rowShell}>
                    <div
                      id={optionId(index)}
                      role="option"
                      aria-selected={isActive}
                      className={rowClass}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commitRow(row)}
                    >
                      <span className={styles.rowLabel}>{row.term}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.rowRemove}
                      aria-label={`Remove ${row.term} from recent searches`}
                      onClick={() => setHistory(removeSearchHistoryEntry(row.term))}
                    >
                      <CloseGlyph className={styles.glyphSmall} />
                    </button>
                  </li>
                );
              }

              if (row.kind === 'all') {
                return (
                  <li key="all" className={styles.rowShell}>
                    <div
                      id={optionId(index)}
                      role="option"
                      aria-selected={isActive}
                      className={`${rowClass} ${styles.rowAll}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commitRow(row)}
                    >
                      See all {suggestions.length} results
                    </div>
                  </li>
                );
              }

              const { suggestion } = row;
              return (
                <li key={suggestion.id} className={styles.rowShell}>
                  <div
                    id={optionId(index)}
                    role="option"
                    aria-selected={isActive}
                    className={rowClass}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commitRow(row)}
                  >
                    <span className={styles.rowLabel}>
                      {highlightMatches(suggestion.label, draft).map((segment, i) =>
                        segment.matched ? (
                          <mark key={i} className={styles.mark}>
                            {segment.text}
                          </mark>
                        ) : (
                          <span key={i}>{segment.text}</span>
                        )
                      )}
                    </span>
                    {suggestion.hint && (
                      <span className={styles.rowHint}>{suggestion.hint}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
