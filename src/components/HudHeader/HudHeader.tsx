import { Link, useLocation } from 'react-router-dom';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import styles from './HudHeader.module.css';

/**
 * The site's five top-level sections. Explore and the cinematic intro are
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

/**
 * The interior header: wordmark left, navigation centred.
 *
 * There used to be a second `interactive` variant here — a clickable triangle
 * that rotated, wiped a line across, and staggered the links in via GSAP. No
 * caller ever asked for it: every route mounts this header plainly, and the
 * landing cinematic carries no navigation at all by design. It has been
 * removed along with the tokens that only ever dressed it.
 */
function HudHeader() {
  const { pathname, hash } = useLocation();

  /**
   * Parks on the way down, returns on the way up.
   *
   * The header draws no ground of its own, so anything scrolling beneath it
   * printed straight through the labels. A scrim would fix that only on a
   * page with one background colour — Explore's ground climbs through four
   * stops, so no single tint is correct for all of it, and a frosted bar
   * would put glass between the reader and a site whose argument is a change
   * of light. Getting out of the way costs nothing and works on every ground.
   */
  const hidden = useHideOnScroll(220);

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

  return (
    <header className={hidden ? `${styles.hudHeader} ${styles.hudHidden}` : styles.hudHeader}>
      <Link to="/home" className={styles.wordmark}>
        RE:FUTURE
      </Link>

      <nav className={styles.staticNav} aria-label="Sections">
        {NAV_LINKS.map((link) => {
          if (!link.to) {
            return (
              <span key={link.label} className={`${styles.navItem} ${styles.navItemPending}`}>
                {link.label}
              </span>
            );
          }

          const current = isCurrent(link.to);

          return (
            <Link
              key={link.label}
              to={link.to}
              className={current ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
              aria-current={current ? 'page' : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Balances the wordmark's track so the centre track is the true centre
          of the header. */}
      <span className={styles.railEnd} aria-hidden="true" />
    </header>
  );
}

export default HudHeader;
