import { useEffect, useRef } from 'react';

/**
 * Tilts a paper object a few degrees toward the pointer, the way a mounted
 * sheet does when you lift it under the light.
 *
 * The rotation is written to two custom properties and read by a transform in
 * CSS, so the whole effect is one compositor-only change per frame and React
 * never re-renders on pointer move. Throttled to one rAF, because pointermove
 * fires far faster than the compositor can use.
 *
 * Skipped entirely without a fine pointer — a thumb has no hover, and the
 * listener would be pure cost on touch — and under reduced motion.
 */
export function useSheetLift<T extends HTMLElement>(maxDeg = 3.2) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        node.style.setProperty('--lift-x', `${(-y * maxDeg).toFixed(2)}deg`);
        node.style.setProperty('--lift-y', `${(x * maxDeg * 1.25).toFixed(2)}deg`);
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [maxDeg]);

  return ref;
}

export default useSheetLift;
