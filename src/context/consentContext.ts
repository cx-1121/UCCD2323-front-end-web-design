import { createContext, useContext } from 'react';

/**
 * Consent state shared across the app.
 *
 * Split from ConsentProvider.tsx so React Fast Refresh works properly
 * (a module that exports both a component and non-component values
 * breaks hot-reload).
 */

/**
 * Three states: 'granted', 'denied', or 'unset' (no decision yet).
 * The banner shows only for 'unset', and third-party scripts
 * only load for 'granted'.
 */
export type ConsentStatus = 'granted' | 'denied' | 'unset';

export interface ConsentValue {
  /** The visitor's current decision. */
  status: ConsentStatus;
  /** True once a decision exists (banner should be hidden). */
  hasDecided: boolean;
  /** True only for 'granted'. Controls third-party script loading. */
  canLoadThirdParty: boolean;
  /** Records acceptance and saves it as a cookie. */
  grant: () => void;
  /** Records refusal and saves it as a cookie. */
  deny: () => void;
  /** Clears the decision, returning to 'unset'. */
  reset: () => void;
}

export const ConsentContext = createContext<ConsentValue | null>(null);

/**
 * Hook to read consent state.
 * Throws if used outside ConsentProvider.
 */
export function useConsent(): ConsentValue {
  const value = useContext(ConsentContext);

  if (value === null) {
    throw new Error('useConsent() must be called inside <ConsentProvider>.');
  }

  return value;
}
