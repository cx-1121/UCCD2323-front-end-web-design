/**
 * Frozen storage identifiers (architecture §6).
 *
 * Every web-storage key and cookie name used anywhere in the app is declared
 * here. Call sites import these constants — a raw string literal naming a
 * storage key is a review failure, because a typo in one of two places is
 * silent data loss rather than a compile error.
 *
 * New keys are namespaced `refuture:<domain>:<name>:v<n>`. The three legacy
 * keys predate that convention and must keep their original names: renaming
 * them would strand the journey state of anyone who has already visited.
 */

/** Prefix for all keys introduced after the storage boundary was established. */
const NAMESPACE = 'refuture';

/* ── sessionStorage keys (per-tab, cleared when the tab closes) ─────────── */

/** In-progress quiz state, so a mid-quiz refresh can be resumed. */
export const QUIZ_PROGRESS_KEY = `${NAMESPACE}:quiz:progress:v1`;

/** TTL cache for the live energy API snapshot. */
export const ENERGY_CACHE_KEY = `${NAMESPACE}:cache:energy:v1`;

/** TTL cache for the World Bank carbon snapshot (day-long TTL, yearly data). */
export const CARBON_CACHE_KEY = `${NAMESPACE}:cache:carbon:v1`;

/* ── localStorage keys (persist across sessions) ────────────────────────── */

/** Set once the visitor has left the landing sequence for the main site. */
export const HAS_CHOSEN_FUTURE_KEY = 'hasChosenFuture';

/** Easter-egg counter for repeat visits to the landing sequence. */
export const REVISIT_ATTEMPTS_KEY = 'attemptsToReturnToPast';

/** Local-only debug console toggle. */
export const DEBUG_MODE_KEY = 'debugModeActive';

/* ── Cookie names ───────────────────────────────────────────────────────── */

/** Records the visitor's third-party cookie/plugin decision. */
export const CONSENT_COOKIE = `${NAMESPACE}_consent`;

/** Consent decisions are remembered for a year before we ask again. */
export const CONSENT_MAX_AGE_DAYS = 365;
