import { useEffect, useState } from 'react';

/**
 * Which chapter of the ladder is currently passing under the fixed header.
 *
 * The header is one element standing over a page whose ground walks from a
 * near-black vault to daylight, so a single ink is wrong for half the scroll.
 * This reports the stop beneath it and the page re-points HudHeader's
 * `--hud-*` tokens from that, which is why the header itself needs no
 * knowledge of the ladder at all.
 *
 * A 1px band immediately below the header, rather than rects measured on every
 * scroll frame: an element intersects the band only while it is the thing the
 * header is actually floating over, so the last entry to report an
 * intersection is the current chapter. Cheap, steady, and correct at any
 * viewport height.
 *
 * Sections opt in by carrying `data-chapter`. A surface that is not a ladder
 * stop and has no tokens to lend — a photograph — carries `data-nav="image"`
 * and reports as `image`.
 *
 * @param headerHeight Distance from the top of the viewport to measure at.
 * @param deps Re-scan trigger. Pass the pathname: each route has its own
 *   chapters, and the observer must be rebuilt when they change.
 */
export function useCurrentChapter(headerHeight = 72, deps: unknown = null) {
  const [stop, setStop] = useState<string | null>(null);

  useEffect(() => {
    const tracked = Array.from(
      document.querySelectorAll<HTMLElement>('[data-chapter], [data-nav="image"]'),
    );
    if (tracked.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          setStop(node.dataset.nav === 'image' ? 'image' : (node.dataset.chapter ?? null));
        });
      },
      {
        rootMargin: `-${headerHeight}px 0px -${Math.max(
          0,
          window.innerHeight - headerHeight - 1,
        )}px 0px`,
      },
    );

    tracked.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [headerHeight, deps]);

  return stop;
}

export default useCurrentChapter;
