import { useEffect, useRef, useState } from 'react';

/**
 * Tallies a display string's numeric core up from zero once `active` flips true,
 * preserving whatever decoration surrounds it ("24+", "14.2%", "< 400").
 *
 * Decimal precision is read off the source string so "18.4" counts in tenths
 * and "24" counts in whole units — a value must never gain digits it did not
 * have, or the metric row reflows mid-animation. While no tally is in flight
 * the authored string is returned verbatim, which is also the resting state
 * under reduced motion and before the reveal fires.
 */
const NUMERIC = /^(\D*)(\d+(?:\.\d+)?)(.*)$/s;

export function useCountUp(value: string, active: boolean, durationMs = 1400) {
  const [tally, setTally] = useState<string | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const parsed = NUMERIC.exec(value);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!active || !parsed || reduceMotion) {
      return;
    }

    const [, prefix, digits, suffix] = parsed;
    const target = Number(digits);
    const decimals = digits.includes('.') ? digits.split('.')[1].length : 0;
    const start = performance.now();

    // performance.now() rather than the rAF timestamp — the two need not share
    // a time origin, and a mismatch throws the eased value outside 0…1.
    const tick = () => {
      const t = Math.min(Math.max((performance.now() - start) / durationMs, 0), 1);
      const eased = 1 - Math.pow(1 - t, 4);

      if (t < 1) {
        setTally(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      // Release the tally so the authored string lands, never a re-formatted
      // approximation of it.
      frameRef.current = null;
      setTally(null);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      setTally(null);
    };
  }, [value, active, durationMs]);

  return tally ?? value;
}

export default useCountUp;
