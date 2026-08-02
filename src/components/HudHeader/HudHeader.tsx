import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import styles from './HudHeader.module.css';

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
  { label: 'Projects' },
  { label: 'About', to: '/about' },
  // The About page carries the contact section; the hash lands on it.
  { label: 'Contact Us', to: '/about#contact' },
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
  const [unlocked, setUnlocked] = useState(false);
  const isStatic = variant === 'static';
  const { pathname, hash } = useLocation();

  /**
   * Hash-aware, so "About" (/about) and "Contact Us" (/about#contact) never
   * both report themselves as current. NavLink cannot express this: it matches
   * on pathname alone and would mark both.
   */
  const isCurrent = (to: string) => {
    const [toPath, toHash] = to.split('#');
    if (pathname !== toPath) {
      return false;
    }
    return toHash ? hash === `#${toHash}` : hash === '';
  };

  useEffect(() => {
    if (isStatic) {
      return;
    }
    gsap.set(`.${styles.logo} svg`, { transformOrigin: "50% 50%" });
  }, [isStatic]);

  const handleLogoClick = () => {
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
  };

  return (
    <header className={styles.hudHeader}>
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
