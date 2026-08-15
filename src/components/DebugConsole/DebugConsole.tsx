import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsent } from '../../context/consentContext';
import {
  ArrowGlyph,
  BoltGlyph,
  CloseGlyph,
  CompassGlyph,
  HorizonGlyph,
  LayersGlyph,
  MailGlyph,
  ReplayGlyph,
  TargetGlyph,
  UsersGlyph,
} from '../icons';
import { safeLocal } from '../../utils/storage';
import {
  DEBUG_MODE_KEY,
  HAS_CHOSEN_FUTURE_KEY,
  REVISIT_ATTEMPTS_KEY,
} from '../../utils/storageKeys';
import styles from './DebugConsole.module.css';

/**
 * Every route the app serves, in the order they appear in App.tsx, so the
 * numbering below is the app's own route table rather than a second opinion
 * about it. Index 00 is the cinematic at "/" — page zero.
 */
const ROUTES = [
  { to: '/', label: 'Landing', note: 'Cinematic intro', Glyph: ReplayGlyph },
  { to: '/home', label: 'Home', note: 'Gateway', Glyph: HorizonGlyph },
  { to: '/explore', label: 'Explore', note: 'Field guide', Glyph: CompassGlyph },
  { to: '/projects', label: 'Projects', note: 'Impact', Glyph: LayersGlyph },
  { to: '/quiz-challenge', label: 'Quiz', note: 'Challenge', Glyph: TargetGlyph },
  { to: '/dashboard', label: 'Dashboard', note: 'Live carbon', Glyph: BoltGlyph },
  { to: '/about', label: 'About', note: 'References', Glyph: UsersGlyph },
  { to: '/contact', label: 'Contact', note: 'Support', Glyph: MailGlyph },
] as const;

/**
 * Zero-intrusion debug console. Reads the journey's stored state, jumps to any
 * route, and forces the revisit easter egg. Only mounted under ?debug=true or
 * on localhost.
 */
function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  /**
   * The panel is unmounted by `isOpen`, which gives it no chance to animate
   * out — it simply vanishes. `isClosing` keeps it mounted for the length of
   * the exit animation, and the animation's own `animationend` is what
   * finally drops it, so the CSS stays the single source of truth for timing.
   */
  const [isClosing, setIsClosing] = useState(false);
  const [hasChosenFuture, setHasChosenFuture] = useState(
    () => safeLocal.get(HAS_CHOSEN_FUTURE_KEY) || 'false',
  );
  const [attemptsToReturnToPast, setAttemptsToReturnToPast] = useState(
    () => safeLocal.get(REVISIT_ATTEMPTS_KEY) || '0',
  );
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { status: consentStatus, reset: resetConsent } = useConsent();

  // Sync state values with LocalStorage
  const syncLocalStates = () => {
    setHasChosenFuture(safeLocal.get(HAS_CHOSEN_FUTURE_KEY) || 'false');
    setAttemptsToReturnToPast(safeLocal.get(REVISIT_ATTEMPTS_KEY) || '0');
  };

  /**
   * Polls only while the panel is open. The readout is the only consumer of
   * these values, so a timer ticking behind a closed panel would wake a render
   * on every page of the app once per second for nothing.
   */
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(syncLocalStates, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  /**
   * Starts the exit animation instead of unmounting outright. Under reduced
   * motion the animation is suppressed in CSS, so `animationend` would never
   * arrive and the panel would stick open — that case closes immediately.
   */
  const closePanel = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsOpen(false);
      return;
    }
    setIsClosing(true);
  };

  /**
   * Only the shell's own animation ends the close — the sections inside run
   * their staggered entry animations through this same handler on the way up,
   * and an unguarded listener would tear the panel down as the first of them
   * finished.
   */
  const handleShellAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !isClosing) return;
    setIsClosing(false);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (isClosing) {
      // Caught mid-exit: treat the click as "keep it open" rather than queueing
      // a second toggle behind an animation the reader has already overridden.
      setIsClosing(false);
      return;
    }
    if (isOpen) {
      closePanel();
      return;
    }
    syncLocalStates();
    setIsOpen(true);
  };

  const handleResetAll = () => {
    safeLocal.remove(HAS_CHOSEN_FUTURE_KEY);
    safeLocal.remove(REVISIT_ATTEMPTS_KEY);
    safeLocal.set(DEBUG_MODE_KEY, 'false');
    syncLocalStates();
    setIsOpen(false);
    // Route back to clean root, reload to completely purge all global caches & controllers
    navigate('/');
    window.location.reload();
  };

  const handleSetRevisit = (count: number) => {
    safeLocal.set(HAS_CHOSEN_FUTURE_KEY, 'true');
    safeLocal.set(REVISIT_ATTEMPTS_KEY, count.toString());
    syncLocalStates();
    // Route to replay mode
    navigate('/?replay=true');
  };

  /**
   * Page zero is guarded: RootRouteGuard bounces "/" to /home the moment
   * `hasChosenFuture` is set, so a bare navigate would land somewhere else
   * entirely. Clearing the flag first is what actually makes the cinematic
   * reachable — and it is the same flag the guard reads, so no reload is
   * needed for the guard to see it.
   *
   * Already standing on "/" the route is unchanged and React Router would not
   * remount LandingPage, so that one case reloads to replay from the first
   * frame.
   */
  const handleVisitRoute = (to: string) => {
    if (to === '/') {
      safeLocal.remove(HAS_CHOSEN_FUTURE_KEY);
      syncLocalStates();
      if (pathname === '/') {
        window.location.assign('/');
        return;
      }
    }
    closePanel();
    navigate(to);
  };

  /** Open as far as the reader is concerned — a panel on its way out is not. */
  const shown = isOpen && !isClosing;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        /* Reads the effective state, not the mount flag: the moment a close
           starts, the plus turns back into an X alongside the falling panel
           rather than waiting for the unmount. */
        className={shown ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger}
        onClick={handleToggle}
        aria-expanded={shown}
        aria-label={shown ? 'Close debug console' : 'Open debug console'}
      >
        {/* One hairline cross for both states. Closed it reads as an X; open
            it rotates 45° into a plus, so the two states stay distinguishable
            without swapping the glyph out from under the transition. */}
        <span className={styles.triggerCore}>
          <CloseGlyph />
        </span>
      </button>

      {isOpen && (
        <div
          className={isClosing ? `${styles.shell} ${styles.shellClosing}` : styles.shell}
          onAnimationEnd={handleShellAnimationEnd}
          role="dialog"
          aria-label="Debug console"
        >
          {/* Mesh orbs: the only colour in the panel, held on an inert layer
              behind the core so nothing above them repaints when they move. */}
          <div className={styles.mesh} aria-hidden="true">
            <span className={`${styles.orb} ${styles.orbA}`} />
            <span className={`${styles.orb} ${styles.orbB}`} />
          </div>

          <div className={styles.core}>
            <header className={styles.head}>
              <h2 className={styles.title}>Debug console</h2>
              <span className={styles.route}>{pathname}</span>
            </header>

            <div className={styles.scroll}>
              <section className={styles.section} style={{ '--step': 0 } as React.CSSProperties}>
                <h3 className={styles.legend}>State</h3>
                <dl className={styles.readout}>
                  <div className={styles.row}>
                    <dt>hasChosenFuture</dt>
                    <dd className={hasChosenFuture === 'true' ? styles.on : styles.off}>
                      {hasChosenFuture}
                    </dd>
                  </div>
                  <div className={styles.row}>
                    <dt>attemptsToReturnToPast</dt>
                    <dd className={styles.count}>{attemptsToReturnToPast}</dd>
                  </div>
                  <div className={styles.row}>
                    <dt>refuture_consent</dt>
                    <dd className={consentStatus === 'granted' ? styles.on : styles.off}>
                      {consentStatus}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className={styles.section} style={{ '--step': 1 } as React.CSSProperties}>
                <h3 className={styles.legend}>Routes</h3>
                {/* Asymmetrical bento: page zero takes the full width because
                    it is the only tile that rewrites stored state to get you
                    there; the plain jumps pair off below it. */}
                <div className={styles.bento}>
                  {ROUTES.map(({ to, label, note, Glyph }, index) => {
                    const current = pathname === to;
                    return (
                      <button
                        key={to}
                        type="button"
                        onClick={() => handleVisitRoute(to)}
                        aria-current={current ? 'page' : undefined}
                        className={`${styles.tile} ${index === 0 ? styles.tileWide : ''} ${
                          current ? styles.tileCurrent : ''
                        }`}
                      >
                        <span className={styles.tileIndex}>
                          {index.toString().padStart(2, '0')}
                        </span>
                        <span className={styles.tileGlyph} aria-hidden="true">
                          <Glyph />
                        </span>
                        <span className={styles.tileText}>
                          <span className={styles.tileLabel}>{label}</span>
                          <span className={styles.tileNote}>
                            {index === 0 ? 'Clears the guard flag' : note}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.section} style={{ '--step': 2 } as React.CSSProperties}>
                <h3 className={styles.legend}>Revisit overlay</h3>
                <div className={styles.levels}>
                  {[0, 1, 2].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleSetRevisit(count)}
                      className={styles.level}
                    >
                      {count + 1}
                    </button>
                  ))}
                </div>
              </section>

              <section className={styles.section} style={{ '--step': 3 } as React.CSSProperties}>
                <h3 className={styles.legend}>Commands</h3>
                <button type="button" onClick={resetConsent} className={styles.command}>
                  <span className={styles.commandLabel}>Reset consent cookie</span>
                  <span className={styles.commandIcon} aria-hidden="true">
                    <ArrowGlyph />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className={`${styles.command} ${styles.commandDanger}`}
                >
                  <span className={styles.commandLabel}>Reset all &amp; reload</span>
                  <span className={styles.commandIcon} aria-hidden="true">
                    <ArrowGlyph />
                  </span>
                </button>
              </section>

              <p className={styles.tip} style={{ '--step': 4 } as React.CSSProperties}>
                Replay counts lock in only once you click ENTER THE FUTURE or navigate away.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebugConsole;
