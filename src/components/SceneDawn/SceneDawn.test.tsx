import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import gsap from 'gsap';
import SceneDawn from './SceneDawn';

/**
 * The finale — everything after "Yes" — is the one part of the dawn that is not
 * on the scrubbed timeline and so is not covered by useScrollTimeline.test.
 *
 * It runs on GSAP's own ticker, which fake timers would break, so the global
 * timeline is sped up instead and the assertions wait on real (brief) time.
 */
const FAST = 4;

/** jsdom reports no media as matching, so reduced motion has to be forced. */
const forceReducedMotion = (reduce: boolean) => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
};

afterEach(() => {
  gsap.globalTimeline.timeScale(1);
  document.body.style.overflow = '';
  vi.restoreAllMocks();
  cleanup();
});

describe('SceneDawn — the answer', () => {
  it('offers agreement and nothing else', () => {
    render(<SceneDawn onEnterFuture={vi.fn()} />);

    const yes = screen.getByRole('button');
    expect(yes).toHaveTextContent('Yes, I’m in');
    expect(yes).toBeEnabled();
    // One button on the scene: the question is rhetorical by construction.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('plays the welcome, dissolves out, and only then hands over', async () => {
    gsap.globalTimeline.timeScale(FAST);
    const onEnterFuture = vi.fn();
    const user = userEvent.setup();

    render(<SceneDawn onEnterFuture={onEnterFuture} />);
    const welcome = document.getElementById('dawn-welcome')!;
    const wash = document.querySelector<HTMLElement>('[data-dawn="exit-wash"]')!;

    await user.click(screen.getByRole('button'));

    // The button cannot be pressed a second time, and the page is pinned so the
    // answer cannot be scrolled back off screen mid-finale.
    expect(screen.getByRole('button')).toBeDisabled();
    expect(document.body.style.overflow).toBe('hidden');

    // "Welcome to Green Tech Club." arrives without anyone scrolling to it.
    await waitFor(() => expect(Number(welcome.style.opacity)).toBeGreaterThan(0.8), {
      timeout: 4000,
      interval: 20,
    });
    expect(onEnterFuture).not.toHaveBeenCalled();

    // The route only changes once the wash is opaque, so the swap happens
    // behind a frame that is not moving.
    await waitFor(() => expect(onEnterFuture).toHaveBeenCalledTimes(1), { timeout: 4000 });
    expect(Number(wash.style.opacity)).toBeCloseTo(1, 1);
  });

  it('under reduced motion, still shows the welcome and still dissolves', async () => {
    forceReducedMotion(true);
    gsap.globalTimeline.timeScale(FAST);
    const onEnterFuture = vi.fn();
    const user = userEvent.setup();

    render(<SceneDawn onEnterFuture={onEnterFuture} />);
    const welcome = document.getElementById('dawn-welcome')!;

    await user.click(screen.getByRole('button'));

    // Seeked past the weather, straight to the settled name — not skipped, and
    // not stranded either: the handover still fires.
    expect(Number(welcome.style.opacity)).toBeCloseTo(1, 1);
    await waitFor(() => expect(onEnterFuture).toHaveBeenCalledTimes(1), { timeout: 4000 });
  });

  it('releases the scroll lock on unmount, so /home is not left pinned', async () => {
    gsap.globalTimeline.timeScale(FAST);
    const user = userEvent.setup();
    const { unmount } = render(<SceneDawn onEnterFuture={vi.fn()} />);

    await user.click(screen.getByRole('button'));
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
