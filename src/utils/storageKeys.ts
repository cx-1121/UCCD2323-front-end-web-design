/**
 * Storage key constants.
 *
 * Every storage key and cookie name used in the app is defined here.
 * Using constants prevents typos from causing silent data loss.
 */

/** Prefix for all keys. */
const NAMESPACE = 'refuture';

/* ── sessionStorage keys ────────────────────────────────────────────────── */

/** In-progress quiz state, so a mid-quiz refresh can be resumed. */
export const QUIZ_PROGRESS_KEY = `${NAMESPACE}:quiz:progress:v1`;

/** Cache for the live energy API snapshot. */
export const ENERGY_CACHE_KEY = `${NAMESPACE}:cache:energy:v1`;

/** Cache for the World Bank carbon snapshot (day-long TTL). */
export const CARBON_CACHE_KEY = `${NAMESPACE}:cache:carbon:v1`;

/** Emitters chart unit: absolute totals or per-capita. */
export const DASHBOARD_EMITTERS_MODE_KEY = `${NAMESPACE}:dashboard:emitters-mode:v1`;

/* ── localStorage keys ──────────────────────────────────────────────────── */

/** Set once the visitor has left the landing sequence for the main site. */
export const HAS_CHOSEN_FUTURE_KEY = 'hasChosenFuture';

/** Easter-egg counter for repeat visits to the landing sequence. */
export const REVISIT_ATTEMPTS_KEY = 'attemptsToReturnToPast';

/** Local-only debug console toggle. */
export const DEBUG_MODE_KEY = 'debugModeActive';

/** Recent project-search terms (device-local, not account-synced). */
export const PROJECT_SEARCH_HISTORY_KEY = `${NAMESPACE}:search-history:projects:v1`;

/* ── Cookie names ───────────────────────────────────────────────────────── */

/** Records the visitor's third-party cookie/plugin decision. */
export const CONSENT_COOKIE = `${NAMESPACE}_consent`;

/** Consent decisions are remembered for a year. */
export const CONSENT_MAX_AGE_DAYS = 365;
