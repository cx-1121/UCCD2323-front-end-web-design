import { useCallback, useState } from 'react';
import { Link, useNavigationType } from 'react-router-dom';
import DawnTransition from '../../components/DawnTransition/DawnTransition';
import HudHeader from '../../components/HudHeader/HudHeader';
import { ArrowGlyph, CompassGlyph, ReplayGlyph } from '../../components/icons';
import { getSettledPathname } from '../../hooks/routeHistory';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useReveal } from '../../hooks/useReveal';
import styles from './HomePage.module.css';

/**
 * HomePage - the threshold, and the gateway reached after the cinematic intro.
 * The landing page is deliberately dark, choked with industrial smoke; arriving
 * here is the moment it clears. The composition is a Z-axis cascade of
 * destination plates over a dawn wash, sharing the Explore page's token layer,
 * type stack and double-bezel enclosures so the interior routes read as one
 * system without repeating its Editorial Split.
 */
function HomePage() {
  const pageRef = useReveal<HTMLElement>(styles.revealed);
  const navigationType = useNavigationType();

  /**
   * The cinematic plays only when the reader actually walked out of the
   * landing page:
   *   - PUSH rules out a direct load or refresh (POP) and RootRouteGuard's
   *     redirect (REPLACE), neither of which is a journey.
   *   - the route being left being "/" rules out an ordinary nav click from
   *     /explore, which is also a PUSH but must not replay 4.6s of curtain.
   * Both signals live on this side, so the landing page needs no change.
   * Computed once on mount, so a later re-render cannot restart it mid-play.
   */
  const [showDawn, setShowDawn] = useState(
    () =>
      navigationType === 'PUSH' &&
      getSettledPathname() === '/' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Stable identity: DawnTransition uses this as an effect dependency.
  const handleDawnDone = useCallback(() => setShowDawn(false), []);

  useBodyBackground('#f7f8fa');

  return (
    <main ref={pageRef} className={styles.page}>
      {showDawn && <DawnTransition onDone={handleDawnDone} />}

      {/* ---- Fixed atmosphere. A residual haze clings to the very top edge,
              the past you just walked out of, while light blooms from below.
              Fixed and inert, so scrolling never repaints it. ---- */}
      <div className={styles.dawn} aria-hidden="true">
        <span className={styles.haze} />
        <span className={styles.sunlight} />
        <span className={styles.flare} />
        <span className={styles.bloom} />
      </div>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.headerBar}>
        <HudHeader variant="static" />
      </div>

      <div className={styles.container}>
        <header className={styles.hero}>
          <span className={styles.eyebrow} data-reveal data-reveal-index="0">
            Green Tech Club
          </span>

          <h1 className={styles.title} data-reveal data-reveal-index="1">
            You came through
            <span className={styles.titleAccent}> the smoke.</span>
          </h1>

          <p className={styles.lede} data-reveal data-reveal-index="2">
            Behind you is the century that burned everything it could find. Ahead is the
            workshop of what replaces it, running on sunlight, moving air, falling water,
            living matter, and the heat under your feet.
          </p>
        </header>

        {/* ---- Z-axis cascade: plates stacked like physical cards, each tilted
                a touch off the grid and overlapping its neighbour. ---- */}
        <div className={styles.cascade}>
          <article
            className={`${styles.plate} ${styles.plateLead}`}
            data-reveal
            data-reveal-index="3"
          >
            <div className={styles.plateCore}>
              <span className={styles.plateGlyph} aria-hidden="true">
                <CompassGlyph />
              </span>

              <h2 className={styles.plateTitle}>The five sources</h2>
              <p className={styles.plateText}>
                Solar, wind, hydro, biomass and geothermal, taken apart one mechanism at a
                time. What each does well, where it strains, and where it already runs today.
              </p>

              <Link to="/explore" className={styles.action}>
                <span className={styles.actionLabel}>Explore energy</span>
                <span className={styles.actionIcon} aria-hidden="true">
                  <ArrowGlyph />
                </span>
              </Link>
            </div>
          </article>

          <article
            className={`${styles.plate} ${styles.plateTrail}`}
            data-reveal
            data-reveal-index="4"
          >
            <div className={styles.plateCore}>
              <span className={`${styles.plateGlyph} ${styles.plateGlyphMuted}`} aria-hidden="true">
                <ReplayGlyph />
              </span>

              <h2 className={styles.plateTitle}>Where you started</h2>
              <p className={styles.plateText}>
                Ride the descent through the smoke again, from the first spark of industry to
                the moment the air clears.
              </p>

              {/* `?replay=true` is required: RootRouteGuard in App.tsx sends "/"
                  straight back to /home once the journey has been started, so a
                  bare "/" here would look like a dead button. */}
              <Link to="/?replay=true" className={`${styles.action} ${styles.actionGhost}`}>
                <span className={styles.actionLabel}>Replay the intro</span>
                <span className={styles.actionIcon} aria-hidden="true">
                  <ReplayGlyph />
                </span>
              </Link>
            </div>
          </article>
        </div>

        <footer className={styles.footer} data-reveal data-reveal-index="5">
          <p>Green Tech Club</p>
          <p>Built for a grid that outlives us</p>
        </footer>
      </div>
    </main>
  );
}

export default HomePage;
