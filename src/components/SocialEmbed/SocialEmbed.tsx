import { useEffect, useRef, useState } from 'react';
import { useConsent } from '../../context/consentContext';
import { loadExternalScript } from '../../utils/loadExternalScript';
import styles from './SocialEmbed.module.css';

const X_WIDGETS_SRC = 'https://platform.twitter.com/widgets.js';

/**
 * Public account the feed is drawn from. The IEA is the primary international
 * source for the renewable-energy figures this site cites, so the embed is
 * editorially relevant rather than decorative social filler.
 */
const FEED_HANDLE = 'IEA';
const FEED_URL = `https://twitter.com/${FEED_HANDLE}`;
const FEED_HEIGHT = 420;

/**
 * Only the failure needs to be tracked.
 *
 * A "loading" state was tried and removed: it required a synchronous setState
 * inside the effect (which React flags as a cascading render) to buy a
 * transient caption, while the anchor underneath is already a working link at
 * every moment. Failure is the one outcome that changes what should be shown.
 */
type EmbedState = 'pending' | 'unavailable';

/**
 * Consent-gated embedded social feed (FR-SOC-005).
 *
 * Three distinct states, none of which is an empty box: the live widget when
 * consent is granted and the vendor script arrives; an explanatory placeholder
 * with an enable control when consent is absent or declined; and a "couldn't
 * load" note when the script is blocked. The block case is common — feed
 * embeds are a primary target for content blockers — so it is a designed state,
 * not an error path.
 */
function SocialEmbed() {
  const { canLoadThirdParty, grant, status } = useConsent();
  const [state, setState] = useState<EmbedState>('pending');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canLoadThirdParty) return;

    let cancelled = false;

    loadExternalScript(X_WIDGETS_SRC)
      .then(() => {
        if (cancelled) return;
        window.twttr?.widgets?.load(containerRef.current ?? undefined);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        console.info(`[social] Feed embed unavailable. ${error.message}`);
        setState('unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadThirdParty]);

  if (!canLoadThirdParty) {
    return (
      <div className={styles.shell}>
        <div className={styles.placeholder}>
          <span className={styles.eyebrow}>Social feed</span>
          <h3 className={styles.placeholderTitle}>Live updates from @{FEED_HANDLE}</h3>
          <p className={styles.placeholderBody}>
            {status === 'denied'
              ? 'You declined social cookies, so nothing is loaded from X. Enable them to see the feed here — you can change your mind at any time.'
              : 'This panel embeds a live feed from X. Nothing is requested from their servers until you allow it.'}
          </p>
          <div className={styles.placeholderActions}>
            <button type="button" className={styles.enableBtn} onClick={grant}>
              Enable social embeds
            </button>
            <a
              className={styles.externalLink}
              href={FEED_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on X instead ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.core} ref={containerRef}>
        <span className={styles.eyebrow}>Social feed · @{FEED_HANDLE}</span>

        {state === 'unavailable' ? (
          <p className={styles.placeholderBody}>
            The X widget could not be loaded — a content blocker or network policy is likely
            blocking it.{' '}
            <a
              className={styles.externalLink}
              href={FEED_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the feed on X ↗
            </a>
          </p>
        ) : (
          <>
            {/* widgets.js replaces this anchor with the timeline iframe. Until
                then — and forever, if it is blocked — it stays a working link. */}
            <a
              className="twitter-timeline"
              data-height={FEED_HEIGHT}
              data-dnt="true"
              data-chrome="noheader nofooter transparent"
              href={FEED_URL}
            >
              Posts from @{FEED_HANDLE}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default SocialEmbed;
