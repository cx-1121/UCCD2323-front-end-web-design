import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Parks every route at the top when the reader arrives on it.
 *
 * React Router does not touch the scroll position on a client-side navigation,
 * so without this a reader who was 2500px down /explore lands 2500px down
 * /projects — mid-page, with no idea what they are looking at.
 *
 * Only PUSH and REPLACE are reset. A POP is the browser's own back/forward
 * button, where the reader is returning to something they have already read and
 * expects to find it where they left it; `history.scrollRestoration` is left on
 * its default `auto` so the browser can do exactly that.
 *
 * Renders nothing. Mount it inside the router, above the routes.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  /**
   * Layout effect, not a plain effect: this runs before the browser paints, so
   * the new route is never shown at the old scroll offset for a frame first.
   */
  useLayoutEffect(() => {
    if (navigationType === 'POP') return;

    // An anchored link asked for a specific place on the page. Honour it.
    if (hash) return;

    /**
     * `instant` overrides the global `html { scroll-behavior: smooth }`. Left
     * to inherit, a route change from deep in a long page would animate the
     * whole way back up — several seconds of scenery in the wrong direction.
     */
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, navigationType]);

  return null;
}

export default ScrollToTop;
