import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './HudHeader.module.css';

gsap.registerPlugin(useGSAP);

/**
 * The site's four top-level sections. Explore and the cinematic intro are
 * deliberately NOT here: they are reached from the HomePage cards, so the
 * header stays a stable frame rather than a second route list.
 *
 * Entries without a `to` have no page behind them yet. They render as inert
 * labels rather than `href="#"` anchors, which would otherwise jump the reader
 * to the top of the page and push a bare `#` into the URL. Give one a `to` the
 * moment its route exists and it becomes a working link with no other change.
 */
const NAV_LINKS: { label: string; to?: string }[] = [
  { label: 'Home', to: '/home' },
  { label: 'Explore', to: '/explore' },
  { label: 'Projects', to: '/projects' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'About', to: '/about' },
];

type HudHeaderProps = {
  /**
   * 'interactive' (default) — the landing-page behaviour: a RE:FUTURE wordmark
   * that has to be clicked before the navigation animates in.
   * 'static' — navigation is always on screen, with no wordmark, no
   * "tap to navigate" hint, and no click affordance.
   */
  variant?: 'interactive' | 'static';
};

function HudHeader({ variant = 'interactive' }: HudHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  /**
   * State rather than a ref: contextSafe re-wraps a fresh closure on every
   * render, so there is no staleness to avoid, and reading a ref inside that
   * callback trips the compiler's "no refs during render" rule, which cannot
   * see that contextSafe only wraps the function instead of calling it.
   */
  const [unlocked, setUnlocked] = useState(false);
  const isStatic = variant === 'static';
  const { pathname, hash } = useLocation();

  /**
   * Hash-aware active detection. NavLink cannot express this: it matches
   * on pathname alone and would mark both a path and its hash variant.
   */
  const isCurrent = (to: string) => {
    const [toPath, toHash] = to.split('#');
    if (pathname !== toPath) {
      return false;
    }
    return toHash ? hash === `#${toHash}` : hash === '';
  };

  /**
   * Scoped to the header element, so every selector below resolves inside this
   * component instead of querying the whole document. That matters here: the
   * class names are CSS Module hashes, but the lookups were still global.
   */
  const { contextSafe } = useGSAP(
    () => {
      if (isStatic) {
        return;
      }
      gsap.set(`.${styles.logo} svg`, { transformOrigin: '50% 50%' });
    },
    { scope: headerRef, dependencies: [isStatic] },
  );

  /**
   * contextSafe is what makes this correct. These tweens are created when the
   * reader clicks, long after useGSAP has run, so without it they belong to no
   * context and survive unmount: nothing reverts them, and the inline styles
   * they write stay on detached nodes.
   */
  const handleLogoClick = contextSafe(() => {
    const nextState = !unlocked;
    setUnlocked(nextState);

    if (nextState) {
      gsap.to(`.${styles.logo} svg`, { rotation: 90, duration: 1.2, ease: "back.out(2)" });
      gsap.to(`.${styles.logoTextGroup}`, { x: 30, opacity: 0, duration: 0.8, ease: "power2.out" });

      gsap.set(`.${styles.logoLine}`, { x: 0, width: 0, opacity: 1 });
      const lineTl = gsap.timeline();
      lineTl.to(`.${styles.logoLine}`, { width: "120px", duration: 0.4, ease: "power1.out", delay: 0.2 })
            .to(`.${styles.logoLine}`, { x: 120, width: 0, opacity: 0, duration: 0.5, ease: "power1.inOut" });

      gsap.set(`.${styles.globalNav}`, { pointerEvents: "auto" });
      gsap.to(`.${styles.globalNav} .${styles.navItem}`, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.4,
      });
    } else {
      gsap.set(`.${styles.globalNav}`, { pointerEvents: "none" });
      gsap.to(`.${styles.globalNav} .${styles.navItem}`, {
        opacity: 0,
        x: -15,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.in",
      });

      gsap.set(`.${styles.logoLine}`, { x: 0, width: 0, opacity: 1 });
      gsap.to(`.${styles.logo} svg`, { rotation: 0, duration: 1.2, ease: "back.out(2)", delay: 0.1 });
      gsap.to(`.${styles.logoTextGroup}`, { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.1 });
    }
  });

  return (
    <header ref={headerRef} className={styles.hudHeader}>
      <div
        className={isStatic ? styles.logoStatic : styles.logo}
        onClick={isStatic ? undefined : handleLogoClick}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 22h9V12h2v10h9L12 2z" />
        </svg>

        {!isStatic && (
          <>
            <div className={styles.logoTextGroup}>
              <span className={styles.logoText}>RE:FUTURE</span>
              <span className={styles.logoSubtext}>• Tap to navigate</span>
            </div>
            <div className={styles.logoLine} />
          </>
        )}

        <nav className={isStatic ? styles.staticNav : styles.globalNav}>
          {NAV_LINKS.map((link) => {
            const base = isStatic
              ? `${styles.navItem} ${styles.navItemVisible}`
              : styles.navItem;

            if (!link.to) {
              return (
                <span key={link.label} className={`${base} ${styles.navItemPending}`}>
                  {link.label}
                </span>
              );
            }

            const current = isCurrent(link.to);

            return (
              <Link
                key={link.label}
                to={link.to}
                className={current ? `${base} ${styles.navItemActive}` : base}
                aria-current={current ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default HudHeader;
