import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCookie, removeCookie, setCookie } from '../utils/cookies';
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS } from '../utils/storageKeys';
import { ConsentContext, type ConsentStatus, type ConsentValue } from './consentContext';

/** Cookie value written on acceptance (FR-STO-004). */
const CONSENT_GRANTED = 'granted';

/** Cookie value written on refusal (FR-STO-004). */
const CONSENT_DENIED = 'denied';

/**
 * Reads the persisted decision.
 *
 * Any value other than the two we write is treated as `'unset'` — a
 * hand-edited or truncated cookie must not be interpreted as consent.
 */
function readPersistedConsent(): ConsentStatus {
  const raw = getCookie(CONSENT_COOKIE);

  if (raw === CONSENT_GRANTED) return CONSENT_GRANTED;
  if (raw === CONSENT_DENIED) return CONSENT_DENIED;
  return 'unset';
}

/**
 * Supplies consent state to the tree and keeps it in sync with the cookie.
 *
 * The cookie is read once via lazy `useState` initialisation rather than in an
 * effect: an effect would render one frame with `'unset'`, flashing the consent
 * banner at visitors who already decided.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>(readPersistedConsent);

  /**
   * Re-reads the cookie when the tab regains focus (SEC-M1-STORAGE-001).
   *
   * The in-memory status is a mirror, and a mirror can go stale: withdrawing
   * consent in a second tab, or clearing the cookie in devtools, leaves this
   * tab believing it may still load third-party scripts. There is no storage
   * event for cookies, so focus is the reliable resync point. Withdrawal has to
   * be as effective as granting, not merely as available.
   */
  useEffect(() => {
    const resync = () => setStatus(readPersistedConsent());
    window.addEventListener('focus', resync);
    return () => window.removeEventListener('focus', resync);
  }, []);

  const persist = useCallback((next: typeof CONSENT_GRANTED | typeof CONSENT_DENIED) => {
    setCookie(CONSENT_COOKIE, next, {
      days: CONSENT_MAX_AGE_DAYS,
      path: '/',
      sameSite: 'Lax',
    });
    setStatus(next);
  }, []);

  const grant = useCallback(() => persist(CONSENT_GRANTED), [persist]);
  const deny = useCallback(() => persist(CONSENT_DENIED), [persist]);

  const reset = useCallback(() => {
    removeCookie(CONSENT_COOKIE, '/');
    setStatus('unset');
  }, []);

  const value = useMemo<ConsentValue>(
    () => ({
      status,
      hasDecided: status !== 'unset',
      canLoadThirdParty: status === CONSENT_GRANTED,
      grant,
      deny,
      reset,
    }),
    [status, grant, deny, reset],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export default ConsentProvider;
