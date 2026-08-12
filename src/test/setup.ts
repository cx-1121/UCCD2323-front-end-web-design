// Vitest setup file (referenced from vite.config.ts `test.setupFiles`).
// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// and their TypeScript types. Full test-suite build-out is Milestone 3
// (PRD §4/§6) — this file just wires the harness so the M1 placeholder
// smoke test can run.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library auto-unmounts between tests by hooking a *global* afterEach.
// This project runs Vitest with `globals: false` (vite.config.ts), so that hook
// never registers and renders accumulate — a second render in the same file
// then makes every getByRole throw "found multiple elements". Register it
// explicitly instead.
afterEach(cleanup);

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
