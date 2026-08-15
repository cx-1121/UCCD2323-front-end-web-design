import { useEffect, useRef, useState } from 'react';
import { Link, useNavigationType } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import { ArrowGlyph, CompassGlyph, ReplayGlyph } from '../../components/icons';
import { getSettledPathname } from '../../hooks/routeHistory';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useReveal } from '../../hooks/useReveal';
import styles from './HomePage.module.css';

/** Must match `.arrival`'s animation-duration in the stylesheet. */
const ARRIVAL_MS = 900;

/**
 * HomePage - the threshold, and the gateway reached after the cinematic intro.
 * The landing page is deliberately dark, choked with industrial smoke; the walk
 * out of it is SceneDawn, which now plays as the closing act of that page's own
 * scroll rather than as a timed curtain over this one — so the reader arrives
 * here on an already-clear morning, whichever route they came in by. The
 * composition is a Z-axis cascade of destination plates over a dawn wash,
 * sharing the Explore page's token layer, type stack and double-bezel
 * enclosures so the interior routes read as one system without repeating its
 * Editorial Split.
 */
function HomePage() {
  const navigationType = useNavigationType();

  /**
   * The dawn hands over mid-dissolve, on a full-screen wash of this page's own
   * surface colour, so this page has to come up out of that same colour rather
   * than cut in under it. Gated, because it is only a handover when the reader
   * actually walked here:
   *   - PUSH rules out a direct load or refresh (POP) and RootRouteGuard's
   *     redirect (REPLACE), neither of which is a journey.
   *   - the route being left being "/" rules out an ordinary nav click from
   *     /explore, which is also a PUSH but has nothing to dissolve from.
   * Computed once on mount, so a later re-render cannot restart it mid-fade.
   */
  const [arriving, setArriving] = useState(
    () =>
      navigationType === 'PUSH' &&
      getSettledPathname() === '/' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  /* Reveals are deferred until the wash has lifted. Above-the-fold plates would
     otherwise resolve behind it and land already-finished — the one case
     `useReveal`'s `enabled` flag exists for. */
  const pageRef = useReveal<HTMLElement>(styles.revealed, !arriving);

  useEffect(() => {
    if (!arriving) return;
    const timer = window.setTimeout(() => setArriving(false), ARRIVAL_MS);
    return () => window.clearTimeout(timer);
  }, [arriving]);

  /**
   * The nav carries no panel of its own, so its ink has to answer to whatever
   * it is floating over: white while it sits on the photograph, the interior
   * routes' dark palette once the reader has scrolled onto the paper. Watching
   * the hero rather than a scroll offset keeps the swap correct at any
   * viewport height, and `rootMargin` pulls the trigger line down to the nav's
   * own row so the ink turns exactly as the links leave the frame.
   */
  const heroRef = useRef<HTMLElement>(null);
  const [navOnPaper, setNavOnPaper] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNavOnPaper(!entry.isIntersecting),
      { rootMargin: '-72px 0px 0px 0px' },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useBodyBackground('#f7f8fa');

  return (
    <main ref={pageRef} className={styles.page}>
      {/* Picks up the dawn's last frame and lifts off it. Unmounted the moment
          it is transparent, so it never sits over the page as an inert layer. */}
      {arriving && <div className={styles.arrival} aria-hidden="true" />}

      <div className={styles.grain} aria-hidden="true" />

      <div
        className={navOnPaper ? `${styles.headerBar} ${styles.headerBarOnPaper}` : styles.headerBar}
      >
        <HudHeader variant="static" />
      </div>

      {/* ---- Full-bleed photographic hero. The photo IS the atmosphere here,
              so no gradient bloom sits behind it. ---- */}
      <header ref={heroRef} className={styles.hero}>
        {/* A real <img> rather than a CSS background, so this — the page's LCP
            element — is a plain element the browser can decode early rather
            than a URL buried in a stylesheet. No fetchPriority hint: React 18
            has no such prop, and an index.html preload would cost every other
            route the same download. Decorative — the scrim and the copy over
            it carry the meaning. */}
        <img className={styles.heroPhoto} src="/assets/forest-hero.jpeg" alt="" decoding="async" />
        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={styles.heroInner}>
          <h1 className={styles.title} data-reveal data-reveal-index="1">
            You came through
            <span className={styles.titleAccent}> the smoke.</span>
          </h1>

          <p className={styles.lede} data-reveal data-reveal-index="2">
            Behind you is the century that burned everything it could find. Ahead is the
            workshop of what replaces it, running on sunlight, moving air, falling water,
            living matter, and the heat under your feet.
          </p>

          <Link
            to="/explore"
            className={`${styles.action} ${styles.heroCta}`}
            data-reveal
            data-reveal-index="3"
          >
            <span className={styles.actionLabel}>Start exploring</span>
            <span className={styles.actionIcon} aria-hidden="true">
              <ArrowGlyph />
            </span>
          </Link>
        </div>
      </header>

      <div className={styles.container}>
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
            className={`${styles.plate} ${styles.plateSecond}`}
            data-reveal
            data-reveal-index="4"
          >
            <div className={styles.plateCore}>
              <span className={styles.plateGlyph} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <path d="M12 11v6M9 14h6" />
                </svg>
              </span>

              <h2 className={styles.plateTitle}>Impact & prototypes</h2>
              <p className={styles.plateText}>
                Explore student-built digital twins, solar vehicle prototypes, AI waste sorters, and campus carbon audit reports.
              </p>

              <Link to="/projects" className={styles.action}>
                <span className={styles.actionLabel}>View projects</span>
                <span className={styles.actionIcon} aria-hidden="true">
                  <ArrowGlyph />
                </span>
              </Link>
            </div>
          </article>

          <article
            className={`${styles.plate} ${styles.plateTrail}`}
            data-reveal
            data-reveal-index="5"
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
