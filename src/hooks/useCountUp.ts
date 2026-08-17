import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number counting up from zero when `active` becomes true.
 * Preserves any prefix/suffix around the number (e.g. "24+", "14.2%").
 */
const NUMERIC = /^(\D*)(\d+(?:\.\d+)?)(.*)$/s;

export function useCountUp(value: string, active: boolean, durationMs = 1400) {
  const [tally, setTally] = useState<string | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const parsed = NUMERIC.exec(value);

    if (!active || !parsed) {
      return;
    }

    const [, prefix, digits, suffix] = parsed;
    const target = Number(digits);
    const decimals = digits.includes('.') ? digits.split('.')[1].length : 0;
    const start = performance.now();

    const tick = () => {
      const t = Math.min(Math.max((performance.now() - start) / durationMs, 0), 1);
      // Ease-out curve for smooth animation
      const eased = 1 - Math.pow(1 - t, 4);

      if (t < 1) {
        setTally(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      // Animation complete - show the original value
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
