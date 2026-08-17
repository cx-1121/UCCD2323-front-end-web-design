import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCookie, removeCookie, setCookie } from '../utils/cookies';
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS } from '../utils/storageKeys';
import { ConsentContext, type ConsentStatus, type ConsentValue } from './consentContext';

/** Cookie value for acceptance. */
const CONSENT_GRANTED = 'granted';

/** Cookie value for refusal. */
const CONSENT_DENIED = 'denied';

/** Reads the saved consent decision from the cookie. */
function readPersistedConsent(): ConsentStatus {
  const raw = getCookie(CONSENT_COOKIE);

  if (raw === CONSENT_GRANTED) return CONSENT_GRANTED;
  if (raw === CONSENT_DENIED) return CONSENT_DENIED;
  return 'unset';
}

/**
 * Provides consent state to the component tree.
 * Reads the cookie on mount and stays in sync with it.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>(readPersistedConsent);

  // Re-read the cookie when the tab regains focus (in case user
  // changed consent in another tab or cleared cookies in devtools)
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
