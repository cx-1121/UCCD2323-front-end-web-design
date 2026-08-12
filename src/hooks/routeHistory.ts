import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Minimal "where did we just come from" record.
 *
 * HomePage needs this to decide, on its very first render, whether to play the
 * dawn cinematic. Navigation type alone is not enough: arriving from the
 * landing page and clicking "Home" in the nav from /explore are both a PUSH,
 * and replaying a 4.6s blocking sequence on an ordinary nav click would be
 * hostile.
 */
let settledPathname: string | null = null;

/**
 * The route as of the last *settled* navigation.
 *
 * The timing is the point. React runs every render before any effect, so while
 * the destination page is rendering, this still holds the route the reader is
 * leaving. That is exactly the question HomePage asks, and it answers it during
 * the first render, with no frame of un-curtained page.
 *
 * Returns null before any navigation has settled, which is the correct answer
 * for a cold load straight into a route.
 */
export function getSettledPathname() {
  return settledPathname;
}

/** Records the active route once a navigation has committed. */
export function useRecordSettledRoute() {
  const { pathname } = useLocation();

  useEffect(() => {
    settledPathname = pathname;
  }, [pathname]);
}
