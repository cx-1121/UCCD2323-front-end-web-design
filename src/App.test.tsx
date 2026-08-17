import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * Smoke test — confirms the app mounts without throwing
 * and renders the landing page correctly.
 */
describe('App', () => {
  it('renders the landing page furniture without throwing', () => {
    render(<App />);
    expect(screen.getByText('SCROLL DOWN')).toBeInTheDocument();
  });

  /* The cinematic carries no navigation of any kind: no HudHeader, and no
     scene radar either — it went when the fossil scene did, leaving nothing
     to navigate between. */
  it('mounts no navigation over the cinematic', () => {
    render(<App />);
    expect(screen.queryByText('RE:FUTURE')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Explore' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Scene navigation')).not.toBeInTheDocument();
  });

  it('renders both scenes', () => {
    render(<App />);
    expect(document.getElementById('scene-intro')).toBeInTheDocument();
    expect(document.getElementById('scene-dawn')).toBeInTheDocument();
    // The fossil scene is gone; the dawn is the whole second half now.
    expect(document.getElementById('scene-traditional')).not.toBeInTheDocument();
  });

  /* These are the ids `buildDawn()` choreographs, so the contract between the
     copy and the timeline is worth pinning. */
  it('renders the dawn subtitles and the only answer to them', () => {
    render(<App />);
    ['dawn-line-1', 'dawn-line-2', 'dawn-line-3', 'dawn-line-4', 'dawn-welcome'].forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Yes, I’m in/ })).toBeInTheDocument();
    // There is no way past the question except through it.
    expect(screen.queryByRole('button', { name: /No|Skip|Enter the future/ })).not.toBeInTheDocument();
  });
});
