/**
 * Lightweight fuzzy search: ranks matches instead of just filtering, and
 * tolerates small typos so "sloar" still surfaces solar projects. No
 * dependency — the corpus here is a few dozen records, not a search index.
 */

/**
 * Optimal-string-alignment edit distance: Levenshtein plus adjacent
 * transpositions counted as a single edit. Swapped letters ("sloar" for
 * "solar") are the single most common typo, and plain Levenshtein charges
 * two substitutions for them — enough to fall outside any sane budget.
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/** How many typos a token of this length may carry and still count as close. */
function typoBudget(tokenLength: number): number {
  if (tokenLength <= 3) return 0; // too short to fuzz without matching everything
  if (tokenLength <= 5) return 1;
  return 2;
}

/**
 * Score a single query token against one field's text. 0 means no match.
 * Substring hits outscore fuzzy (typo-tolerant) hits, and a match at the
 * start of a word outscores one buried in the middle.
 */
function scoreTokenAgainstField(token: string, fieldText: string): number {
  const lower = fieldText.toLowerCase();
  if (!lower) return 0;

  if (lower.includes(token)) {
    const words = lower.split(/[^a-z0-9]+/).filter(Boolean);
    const startsAWord = words.some((word) => word.startsWith(token));
    return startsAWord ? 2 : 1.4;
  }

  const budget = typoBudget(token.length);
  if (budget === 0) return 0;

  const words = lower.split(/[^a-z0-9]+/).filter(Boolean);
  let best = 0;
  for (const word of words) {
    // Skip pairs whose length already rules out a close match.
    if (Math.abs(word.length - token.length) > budget) continue;
    const distance = levenshtein(token, word);
    if (distance <= budget) {
      const closeness = 1 - distance / (budget + 1);
      best = Math.max(best, closeness);
    }
  }
  return best;
}

export type WeightedField = { text: string; weight: number };

/**
 * Score a record against a search query across its weighted fields.
 * Returns 0 when the record should be excluded. Every query token must
 * match something (AND semantics) so multi-word queries keep narrowing;
 * each token individually may match by substring or by typo tolerance.
 */
export function scoreFields(fields: WeightedField[], query: string): number {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return 1;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  let total = 0;

  for (const token of tokens) {
    let tokenScore = 0;
    for (const { text, weight } of fields) {
      const fieldScore = scoreTokenAgainstField(token, text) * weight;
      if (fieldScore > tokenScore) tokenScore = fieldScore;
    }
    if (tokenScore === 0) return 0;
    total += tokenScore;
  }

  return total;
}

export type HighlightSegment = { text: string; matched: boolean };

/**
 * Splits `text` into matched/unmatched segments for the query's literal
 * substrings, for rendering a bold/highlighted suggestion label. Only exact
 * (non-fuzzy) hits are highlighted — a typo match has no contiguous span in
 * the original text to underline, so it renders plain rather than guessing.
 */
export function highlightMatches(text: string, query: string): HighlightSegment[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);

  if (tokens.length === 0) return [{ text, matched: false }];

  const lower = text.toLowerCase();
  const matchedMask = new Array<boolean>(text.length).fill(false);

  for (const token of tokens) {
    let fromIndex = 0;
    while (fromIndex <= lower.length - token.length) {
      const at = lower.indexOf(token, fromIndex);
      if (at === -1) break;
      matchedMask.fill(true, at, at + token.length);
      fromIndex = at + token.length;
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const matched = matchedMask[cursor];
    let end = cursor + 1;
    while (end < text.length && matchedMask[end] === matched) end++;
    segments.push({ text: text.slice(cursor, end), matched });
    cursor = end;
  }
  return segments;
}
