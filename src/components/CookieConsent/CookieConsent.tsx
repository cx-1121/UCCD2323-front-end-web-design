import { useEffect, useRef } from 'react';
import { useConsent } from '../../context/consentContext';
import styles from './CookieConsent.module.css';

/**
 * Cookie consent banner (FR-STO-003, FR-STO-004).
 *
 * Renders only while no decision exists, and writes the visitor's choice to the
 * `refuture_consent` cookie for a year. The decision is load-bearing rather
 * than cosmetic: `SocialShare` and `SocialEmbed` read it before injecting any
 * third-party script, so declining genuinely prevents Facebook and X code from
 * ever reaching the page (FR-SOC-002).
 *
 * Accessibility (NFR-007): the banner is a labelled dialog, both controls are
 * real buttons in the tab order, and neither choice is hidden behind a
 * secondary disclosure — declining is exactly as reachable as accepting.
 */
function CookieConsent() {
  const { hasDecided, grant, deny } = useConsent();
  const dialogRef = useRef<HTMLDivElement>(null);

  /**
   * Focus the dialog itself, never one of the two choices
   * (SEC-M1-STORAGE-001). Autofocusing "Accept" meant a keyboard user pressing
   * Space on arrival consented without deciding, which is not a consent record
   * worth having. Focusing the container announces the banner and puts both
   * buttons one Tab away, without pre-selecting either.
   */
  useEffect(() => {
    if (!hasDecided) {
      dialogRef.current?.focus();
    }
  }, [hasDecided]);

  if (hasDecided) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      className={styles.shell}
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      tabIndex={-1}
    >
      <div className={styles.core}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Privacy</span>
          <h2 id="consent-title" className={styles.title}>
            Cookies &amp; social embeds
          </h2>
          <p id="consent-body" className={styles.body}>
            We store one cookie to remember this choice, and use your browser&apos;s local storage
            to keep your journey and quiz progress. Accepting also lets us load Facebook and X
            share widgets — decline and those scripts are never fetched, but sharing still works
            through a copy-link fallback.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.decline} onClick={deny}>
            Decline
          </button>
          <button type="button" className={styles.accept} onClick={grant}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
