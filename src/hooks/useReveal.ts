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

    // Land everything in its resolved state immediately when animating is
    // unwanted or unavailable. The IntersectionObserver guard matters: these
    // elements start at opacity 0, so without observer support the content
    // would be stranded invisible.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      const settleAll = () => {
        host.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add(revealedClass));
      };
      settleAll();
      if (typeof MutationObserver === 'undefined') return;
      const fallbackObserver = new MutationObserver(settleAll);
      fallbackObserver.observe(host, { childList: true, subtree: true });
      return () => fallbackObserver.disconnect();
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

    const watch = (node: Element) => {
      if (node.classList.contains(revealedClass)) return;
      observer.observe(node);
    };

    const initialTargets = host.querySelectorAll('[data-reveal]');
    if (initialTargets.length > 0) {
      initialTargets.forEach(watch);
    } else {
      observer.observe(host);
    }

    // Filtered/paginated content swaps DOM nodes rather than mutating the
    // ones already observed — a search that empties and refills the list
    // remounts fresh `[data-reveal]` cards the observer above never saw, and
    // they were stranded at opacity 0 forever. Watch for those arrivals too.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((added) => {
          if (!(added instanceof Element)) return;
          if (added.matches('[data-reveal]')) watch(added);
          added.querySelectorAll?.('[data-reveal]').forEach(watch);
        });
      }
    });
    mutationObserver.observe(host, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [revealedClass, enabled]);

  return ref;
}

export default useReveal;
