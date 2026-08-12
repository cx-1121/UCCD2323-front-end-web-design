import { useCallback, useEffect, useRef, useState } from 'react';
import { useConsent } from '../../context/consentContext';
import { loadExternalScript } from '../../utils/loadExternalScript';
import styles from './SocialShare.module.css';

/** X's widget bundle attaches itself to `window.twttr` once executed. */
declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

/** X's widget bundle — hydrates `.twitter-share-button` anchors into widgets. */
const X_WIDGETS_SRC = 'https://platform.twitter.com/widgets.js';

/** Facebook's iframe share plugin. Keyless: needs no App ID and no SDK. */
const FB_SHARE_PLUGIN = 'https://www.facebook.com/plugins/share_button.php';

/** How long the "Copied" confirmation stays up. */
const COPIED_FEEDBACK_MS = 2000;

interface SocialShareProps {
  /** Canonical URL to share. Defaults to the current page. */
  url?: string;
  /** Text used as the tweet body and Web Share title. */
  title: string;
  /** Optional heading shown above the controls. */
  label?: string;
}

/**
 * Share surface with real Facebook and X plugins (FR-SOC-002 … FR-SOC-004).
 *
 * The vendor widgets render only when the visitor has granted consent. When
 * they have not — or when an adblocker swallows `widgets.js` — the copy-link
 * and Web Share controls still work, so sharing is never actually broken, only
 * less branded. The X control degrades particularly gracefully: it is a real
 * `twitter.com/intent/tweet` anchor whether or not the widget script ever
 * hydrates it.
 */
function SocialShare({ url, title, label = 'Share this' }: SocialShareProps) {
  const { canLoadThirdParty } = useConsent();

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const [widgetsReady, setWidgetsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Loads and hydrates the X widget, but only behind the consent gate.
   *
   * The cleanup flag matters: consent can be withdrawn (or the component
   * unmounted) while the 6 s script load is still outstanding, and hydrating
   * afterwards would inject vendor DOM into a page that is no longer allowed
   * to have it.
   */
  useEffect(() => {
    // No state reset on the closed-gate path: the vendor block is unmounted
    // entirely when consent is absent, and if consent is later re-granted the
    // script genuinely is still loaded, so `widgetsReady` remaining true is
    // accurate rather than stale.
    if (!canLoadThirdParty) return;

    let cancelled = false;

    loadExternalScript(X_WIDGETS_SRC)
      .then(() => {
        if (cancelled) return;
        setWidgetsReady(true);
        window.twttr?.widgets?.load(containerRef.current ?? undefined);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        // Expected whenever an extension blocks the vendor. The fallback
        // controls are already on screen, so this is informational only.
        console.info(`[social] X widgets unavailable; using fallback controls. ${error.message}`);
        setWidgetsReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadThirdParty, shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard access is refused on insecure origins and in some embedded
      // webviews. Selecting the URL is the honest fallback.
      window.prompt('Copy this link:', shareUrl);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      // A user dismissing the sheet rejects the promise; that is not an error.
    }
  }, [title, shareUrl]);

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(shareUrl)}`;

  const fbHref = `${FB_SHARE_PLUGIN}?href=${encodeURIComponent(
    shareUrl,
  )}&layout=button_count&size=small&width=110&height=20`;

  return (
    <div className={styles.wrap} ref={containerRef}>
      <span className={styles.label}>{label}</span>

      <div className={styles.controls}>
        {canLoadThirdParty && (
          <>
            {/* Facebook's keyless iframe plugin — no SDK, no App ID.

                Deliberately no `allow` attribute: the documented embed snippet
                requests clipboard-write, but granting a third-party frame the
                ability to overwrite the user's clipboard buys nothing here. The
                button opens a share popup, and our own copy-link control sits
                beside it. Least privilege over copy-pasting the vendor snippet. */}
            <iframe
              className={styles.fbFrame}
              src={fbHref}
              width={110}
              height={20}
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              title="Share on Facebook"
            />

            {/* Hydrated into a widget by widgets.js; a working intent link
                regardless of whether that script ever arrives. */}
            <a
              className={`twitter-share-button ${styles.xLink}`}
              href={tweetHref}
              data-size="small"
              target="_blank"
              rel="noopener noreferrer"
            >
              {widgetsReady ? 'Tweet' : 'Share on X'}
            </a>
          </>
        )}

        {canNativeShare && (
          <button type="button" className={styles.fallbackBtn} onClick={handleNativeShare}>
            Share…
          </button>
        )}

        <button
          type="button"
          className={styles.fallbackBtn}
          onClick={handleCopy}
          aria-live="polite"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      {!canLoadThirdParty && (
        <p className={styles.note}>
          Facebook and X buttons are hidden because you declined social cookies. Copy link still
          works.
        </p>
      )}
    </div>
  );
}

export default SocialShare;
