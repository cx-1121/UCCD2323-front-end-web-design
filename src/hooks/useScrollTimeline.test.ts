import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import App from '../App';
import { buildLandingTimeline, totalDuration } from './useScrollTimeline';

/**
 * The master timeline is built free of ScrollTrigger and of React precisely so
 * it can be seeked here without a scroller. These assertions are on the dawn —
 * the act folded in from the old timed DawnTransition — because its four
 * subtitles and its colour walk are the part with real ordering to get wrong.
 *
 * `App` is rendered only to put the scene in the document: the timeline targets
 * it by id and by `data-dawn`, so the markup has to exist before the tweens are
 * built.
 */

/** Where the dawn scene starts on the master timeline. Mirrors BEAT.dawn. */
const DAWN = 39;

const opacityOf = (id: string) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return Number(el.style.opacity || '1');
};

const dawnLayer = (name: string) => {
  const el = document.querySelector<HTMLElement>(`[data-dawn="${name}"]`);
  if (!el) throw new Error(`missing [data-dawn="${name}"]`);
  return el;
};

const dawnLayerOpacity = (name: string) => Number(dawnLayer(name).style.opacity || '1');

/**
 * jsdom applies no stylesheet, so a layer the timeline has never touched reads
 * back as opaque rather than at its CSS resting state. Asserting that nothing
 * inline was written is the honest form of "the scroll does not own this".
 */
const isUntouchedByScroll = (name: string) => dawnLayer(name).style.opacity === '';

afterEach(cleanup);

describe('landing timeline — dawn', () => {
  const build = () => {
    render(createElement(App));
    return buildLandingTimeline({ paused: true });
  };

  it('runs for the full advertised duration', () => {
    const tl = build();
    expect(tl.duration()).toBeCloseTo(totalDuration, 5);
    tl.kill();
  });

  it('opens the dawn out of the dark the intro left behind', () => {
    const tl = build();

    tl.seek(DAWN - 1);
    expect(opacityOf('scene-dawn')).toBeCloseTo(0, 1);

    tl.seek(DAWN + 8);
    expect(opacityOf('scene-dawn')).toBeCloseTo(1, 1);

    tl.kill();
  });

  it('shows exactly one subtitle at each beat, in order', () => {
    const tl = build();
    const lines = ['dawn-line-1', 'dawn-line-2', 'dawn-line-3', 'dawn-line-4'];
    // Mid-dwell for each line: entrances at 3/15/27/44, each over 4s.
    const beats = [8, 20, 32, 50];

    beats.forEach((offset, i) => {
      tl.seek(DAWN + offset);
      expect(opacityOf(lines[i])).toBeGreaterThan(0.9);
      lines.forEach((other, j) => {
        if (j !== i) expect(opacityOf(other)).toBeLessThan(0.5);
      });
    });

    tl.kill();
  });

  it('walks the sky to gold and stops there, holding the question', () => {
    const tl = build();

    tl.seek(DAWN + 4);
    expect(dawnLayerOpacity('sky-soot')).toBeCloseTo(1, 1);
    expect(dawnLayerOpacity('sky-gold')).toBeCloseTo(0, 1);
    expect(opacityOf('dawn-answer')).toBeCloseTo(0, 1);

    // The sun stays shut until the wind has been working for a while.
    tl.seek(DAWN + 12);
    expect(dawnLayerOpacity('sun')).toBeCloseTo(0, 1);
    expect(dawnLayerOpacity('gust')).toBeGreaterThan(0.1);

    // End of the scroll: gold sky, sun risen, question and answer on screen —
    // and the clear sky, the motes and the welcome all still held back for the
    // finale, which is not on this timeline at all.
    tl.seek(totalDuration);
    expect(dawnLayerOpacity('sky-soot')).toBeCloseTo(0, 1);
    expect(dawnLayerOpacity('sky-gold')).toBeCloseTo(1, 1);
    expect(isUntouchedByScroll('sky-clear')).toBe(true);
    expect(isUntouchedByScroll('mote')).toBe(true);
    expect(dawnLayerOpacity('sun')).toBeCloseTo(1, 1);
    expect(dawnLayerOpacity('vignette')).toBeCloseTo(0, 1);
    expect(opacityOf('dawn-line-4')).toBeCloseTo(1, 1);
    expect(opacityOf('dawn-answer')).toBeCloseTo(1, 1);
    expect(opacityOf('dawn-welcome')).toBeCloseTo(0, 1);

    tl.kill();
  });

  it('rewinds cleanly — scrubbing back restores the opening frame', () => {
    const tl = build();

    tl.seek(totalDuration);
    tl.seek(0);

    expect(opacityOf('scene-dawn')).toBeCloseTo(0, 1);
    expect(opacityOf('dawn-line-4')).toBeCloseTo(0, 1);
    expect(opacityOf('dawn-answer')).toBeCloseTo(0, 1);
    expect(dawnLayerOpacity('sky-soot')).toBeCloseTo(1, 1);

    tl.kill();
  });
});
