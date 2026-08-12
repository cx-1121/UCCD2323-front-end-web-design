import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import styles from './DawnTransition.module.css';

/**
 * Single source of truth for the choreography length. Passed into CSS as a
 * custom property so every layer's animation-duration is driven from here and
 * the JS completion timer can never drift out of sync with the visuals.
 */
export const DAWN_DURATION_MS = 4600;

type DawnTransitionProps = {
  /**
   * Called when the cinematic finishes, or when the reader skips it. Must be
   * referentially stable (wrap it in useCallback): it is an effect dependency,
   * so a new identity on every parent render would restart the timer and the
   * sequence could never complete.
   */
  onDone: () => void;
};

/**
 * The walk out of the smoke. Five beats over ~4.6s, played over the HomePage
 * as it settles underneath:
 *
 *   1. Darkness. The smoke thickens rather than lifting.
 *   2. Wind arrives FIRST, before any light. This is the whole point of the
 *      sequence: the world does not regain life because it got brighter, it
 *      gets brighter because something started to move.
 *   3. The smoke shears sideways, a first point of light opens behind it.
 *   4. Sun breaks through. The palette walks black > blue-grey > warm grey >
 *      gold > sky blue.
 *   5. Green returns, motes drift up, the overlay dissolves into the page.
 *
 * Everything animates on transform and opacity only. The colour curve is built
 * from stacked full-screen layers that cross-fade, rather than one layer
 * animating background-color, so no beat costs a repaint.
 */
function DawnTransition({ onDone }: DawnTransitionProps) {
  useEffect(() => {
    // The page underneath is settling into place; keep it still until the
    // curtain is gone so the reader cannot scroll the cinematic off-screen.
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const timer = window.setTimeout(onDone, DAWN_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
      body.style.overflow = previousOverflow;
    };
  }, [onDone]);

  return (
    <div
      className={styles.stage}
      style={{ '--dawn-duration': `${DAWN_DURATION_MS}ms` } as CSSProperties}
    >
      {/* Camera push: the whole scene creeps forward through the sequence. */}
      <div className={styles.scene} aria-hidden="true">
        {/* ---- Colour curve: black > deep blue-grey > warm grey > gold >
                sky blue > green-white. Stacked, cross-faded on opacity. ---- */}
        <span className={`${styles.sky} ${styles.skySoot}`} />
        <span className={`${styles.sky} ${styles.skyDeep}`} />
        <span className={`${styles.sky} ${styles.skyWarm}`} />
        <span className={`${styles.sky} ${styles.skyGold}`} />
        <span className={`${styles.sky} ${styles.skyClear}`} />

        {/* ---- Smoke: thickens first, then shears apart once the wind hits. ---- */}
        <span className={`${styles.smoke} ${styles.smokeLeft}`} />
        <span className={`${styles.smoke} ${styles.smokeRight}`} />
        <span className={`${styles.smoke} ${styles.smokeCore}`} />

        {/* ---- Wind, arriving before any light. ---- */}
        <span className={`${styles.gust} ${styles.gust1}`} />
        <span className={`${styles.gust} ${styles.gust2}`} />
        <span className={`${styles.gust} ${styles.gust3}`} />
        <span className={`${styles.gust} ${styles.gust4}`} />

        {/* ---- Then the light. ---- */}
        <span className={styles.sun} />
        <span className={styles.flare} />

        {/* ---- Life returns last. ---- */}
        <span className={`${styles.mote} ${styles.mote1}`} />
        <span className={`${styles.mote} ${styles.mote2}`} />
        <span className={`${styles.mote} ${styles.mote3}`} />
        <span className={`${styles.mote} ${styles.mote4}`} />
        <span className={`${styles.mote} ${styles.mote5}`} />

        <span className={styles.vignette} />
      </div>

      <button type="button" className={styles.skip} onClick={onDone}>
        Skip
      </button>
    </div>
  );
}

export default DawnTransition;
