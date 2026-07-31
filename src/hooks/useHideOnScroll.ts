import { useEffect, useRef, useState } from 'react';

/**
 * Directional scroll state for a hide-on-scroll header: returns `true` once the
 * reader is heading down the page past `threshold`, and flips back to `false`
 * the moment they scroll back up.
 *
 * The listener is passive and coalesced into a single rAF callback, and it only
 * ever reads `window.scrollY` — no `getBoundingClientRect`, so it never forces a
 * synchronous layout. State is set from a boolean, so React bails out of the
 * re-render on every scroll event that does not actually flip the direction.
 *
 * @param threshold Distance from the top, in px, that must be passed before the
 *   header is allowed to hide — above it the header always stays put.
 */
export function useHideOnScroll(threshold = 140) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const queued = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const evaluate = () => {
      queued.current = false;
      const y = window.scrollY;
      const delta = y - lastY.current;

      // Asymmetric jitter gate: a little more travel is needed to park the
      // header than to bring it back, so the reveal always feels immediate.
      // Kept small on purpose — a large gate would let `lastY` go stale, and
      // an upward flick right after a sub-gate nudge would still read as
      // downward and leave the header parked.
      if (Math.abs(delta) < (delta > 0 ? 10 : 5)) {
        return;
      }
      lastY.current = y;

      // Near the top the header is always on screen, whichever way we moved.
      setHidden(y > threshold && delta > 0);
    };

    const onScroll = () => {
      if (queued.current) {
        return;
      }
      queued.current = true;
      requestAnimationFrame(evaluate);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return hidden;
}

export default useHideOnScroll;
