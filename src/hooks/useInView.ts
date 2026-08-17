import { useEffect, useRef, useState } from 'react';

/**
 * Reports, as React state, whether the host element has entered the viewport.
 *
 * `useReveal` covers the common case by stamping a class from outside React,
 * which keeps entrance choreography off the render path entirely. This hook
 * exists for the narrower case where a component's *behaviour* depends on
 * being seen — a figure that must not start tallying until the reader can
 * watch it count. Those need a re-render, so they need state.
 *
 * Fires once and disconnects: a figure that re-tallies every time it scrolls
 * back into frame reads as a broken instrument rather than a live one.
 *
 * Without IntersectionObserver, or under reduced motion, it reports true from
 * the first render — the content is the point, the timing is not.
 */
export function useInView<T extends HTMLElement>(rootMargin = '0px 0px -15% 0px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(
    () =>
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        setInView(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
}

export default useInView;
