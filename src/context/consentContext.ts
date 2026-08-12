import { createContext, useContext } from 'react';

/**
 * Consent state shared across the app (architecture §2, consent write path).
 *
 * Split from `ConsentProvider.tsx` deliberately: a module that exports both a
 * component and non-component values breaks React Fast Refresh's ability to
 * hot-swap that component, which `eslint-plugin-react-refresh` flags. Context
 * object and hook live here; the component lives next door.
 */

/**
 * `'unset'` is a distinct third state, not a synonym for `'denied'`. The banner
 * must appear only when no decision exists, and third-party scripts must stay
 * unloaded in both `'unset'` and `'denied'` — collapsing the two would either
 * re-prompt someone who already declined or leak scripts before they chose.
 */
export type ConsentStatus = 'granted' | 'denied' | 'unset';

export interface ConsentValue {
  /** The visitor's current decision. */
  status: ConsentStatus;
  /** True once a decision exists — i.e. the banner should stay hidden. */
  hasDecided: boolean;
  /** True only for `'granted'`. The single gate third-party embeds check. */
  canLoadThirdParty: boolean;
  /** Records acceptance and persists it for `CONSENT_MAX_AGE_DAYS`. */
  grant: () => void;
  /** Records refusal and persists it for `CONSENT_MAX_AGE_DAYS`. */
  deny: () => void;
  /** Clears the decision, returning to `'unset'`. Used by the debug console. */
  reset: () => void;
}

export const ConsentContext = createContext<ConsentValue | null>(null);

/**
 * Reads consent state.
 *
 * @throws If called outside `ConsentProvider`. Returning a permissive default
 *         instead would let a mis-mounted component load third-party scripts
 *         with no consent record at all — failing loudly at the boundary is the
 *         safer contract.
 */
export function useConsent(): ConsentValue {
  const value = useContext(ConsentContext);

  if (value === null) {
    throw new Error('useConsent() must be called inside <ConsentProvider>.');
  }

  return value;
}
