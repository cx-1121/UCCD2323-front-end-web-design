import { useEffect } from 'react';

/**
 * Paints <body> for the lifetime of a route, then hands the previous value
 * back on unmount.
 *
 * The app-wide body is dark, because the cinematic landing page is dark. The
 * interior routes are light, and without this their overscroll bounce flashes
 * near-black past the top and bottom edges.
 *
 * This lives in JS rather than a CSS Module because `:global(body)` is emitted
 * into the shared stylesheet bundle, so it would repaint every other route too.
 */
export function useBodyBackground(color: string) {
  useEffect(() => {
    const { body } = document;
    const previous = body.style.backgroundColor;
    body.style.backgroundColor = color;
    return () => {
      body.style.backgroundColor = previous;
    };
  }, [color]);
}

export default useBodyBackground;
