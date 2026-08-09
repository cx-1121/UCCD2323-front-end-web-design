import { useEffect, useRef } from 'react';

/**
 * Scroll-entry choreography. Observes every descendant carrying `data-reveal`
 * (falling back to the host node itself) and stamps `revealedClass` on it once
 * it crosses into the viewport, then stops watching it — reveals fire once.
 *
 * IntersectionObserver rather than a scroll listener: no continuous reflow,
 * no main-thread work between intersections. Stagger is expressed in CSS via
 * transition-delay keyed off `data-reveal-index`, so the JS stays layout-free.
 *
 * `enabled` defers the whole observer. Pages that run an intro sequence pass
 * false until it finishes, otherwise above-the-fold nodes reveal themselves
 * behind the curtain and land already-resolved when it lifts.
 */
export function useReveal<T extends HTMLElement>(revealedClass: string, enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || !enabled) {
      return;
    }

    const targets: HTMLElement[] = Array.from(host.querySelectorAll('[data-reveal]'));
    const watched = targets.length > 0 ? targets : [host];

    // Land everything in its resolved state immediately when animating is
    // unwanted or unavailable. The IntersectionObserver guard matters: these
    // elements start at opacity 0, so without observer support the content
    // would be stranded invisible.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      watched.forEach((node) => node.classList.add(revealedClass));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add(revealedClass);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );

    watched.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [revealedClass, enabled]);

  return ref;
}

export default useReveal;
