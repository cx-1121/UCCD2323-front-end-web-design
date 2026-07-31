// Vitest setup file (referenced from vite.config.ts `test.setupFiles`).
// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// and their TypeScript types. Full test-suite build-out is Milestone 3
// (PRD §4/§6) — this file just wires the harness so the M1 placeholder
// smoke test can run.
import '@testing-library/jest-dom/vitest';

// Mock window.matchMedia for GSAP ScrollTrigger in jsdom environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
