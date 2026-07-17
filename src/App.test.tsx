import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * M1 placeholder smoke test — confirms the static composition root mounts
 * without throwing and renders the HUD's logo text. Full per-component/hook
 * unit-test coverage (mocking GSAP/ScrollTrigger, canvas, etc.) is Milestone
 * 3 (PRD §4/§6 M3 contract); this just proves the Vitest + RTL harness works
 * end-to-end for M1's static markup.
 */
describe('App', () => {
  it('renders the HUD logo text without throwing', () => {
    render(<App />);
    expect(screen.getByText('RE:FUTURE')).toBeInTheDocument();
  });

  it('renders both scenes', () => {
    render(<App />);
    expect(document.getElementById('scene-intro')).toBeInTheDocument();
    expect(document.getElementById('scene-traditional')).toBeInTheDocument();
  });
});
