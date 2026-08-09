import { useEffect, useRef, useState } from 'react';

/**
 * Three-beat intro choreography for a route that opens behind a curtain.
 *
 *   booting  → the counter ramps 0…100 while the overlay holds the viewport
 *   lifting  → the overlay translates off-screen; page content starts rising
 *              underneath so the two motions overlap instead of queueing
 *   ready    → curtain gone, scroll-reveal observers may arm
 *
 * Progress is driven by rAF rather than a CSS animation because the number is
 * rendered as text and the manifest ticker keys off the same value; a single
 * source keeps the counter, the rail and the ticker frame-locked.
 */
export type BootPhase = 'booting' | 'lifting' | 'ready';

/** Matches the curtain's translate duration in ProjectsPage.module.css. */
const LIFT_MS = 860;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function useBootSequence(durationMs = 1500) {
  // Resolved at mount, not in an effect: under reduced motion the very first
  // render must already be in the resolved state, or the curtain flashes.
  const [reduceMotion] = useState(prefersReducedMotion);
  const [progress, setProgress] = useState(reduceMotion ? 100 : 0);
  const [phase, setPhase] = useState<BootPhase>(reduceMotion ? 'ready' : 'booting');
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const start = performance.now();
    let liftTimer = 0;

    // Reads performance.now() rather than the rAF timestamp: the two are not
    // guaranteed to share a time origin (jsdom's do not), and a mismatched
    // origin drives the eased value far outside 0…1.
    const tick = () => {
      const t = Math.min(Math.max((performance.now() - start) / durationMs, 0), 1);
      // Cubic ease-out: quick intake, long settle — reads as a real workload
      // resolving rather than a linear bar padding out a fixed delay.
      setProgress(Math.round((1 - Math.pow(1 - t, 3)) * 100));

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      frameRef.current = null;
      setPhase('lifting');
      liftTimer = window.setTimeout(() => setPhase('ready'), LIFT_MS);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      window.clearTimeout(liftTimer);
    };
  }, [durationMs, reduceMotion]);

  return {
    progress,
    phase,
    /** True until the curtain has fully cleared the viewport. */
    isBooting: phase !== 'ready',
    /** True once the curtain starts moving — the cue for content to rise. */
    hasLaunched: phase !== 'booting',
  };
}

export default useBootSequence;
