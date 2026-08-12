import { describe, expect, it } from 'vitest';
import { buildLandingTimeline, sectionsProgress, totalDuration } from './useScrollTimeline';

/**
 * The landing cinematic is a 50-second scrubbed sequence. It was refactored
 * from one flat timeline of ~20 absolutely-positioned tweens into four nested
 * scene timelines placed at labels, and that rewrite must not move a single
 * beat.
 *
 * These are the absolute times from the original flat timeline, transcribed
 * before the change. If a scene is ever retimed, this file is the thing that
 * says so out loud.
 */
describe('landing timeline choreography', () => {
  const scenes = () => {
    const master = buildLandingTimeline({ paused: true });
    // Direct children only: the four scene timelines, in build order.
    const children = master.getChildren(false, false, true);
    return { master, children };
  };

  it('places every scene at the time the flat timeline used', () => {
    const { children } = scenes();

    expect(children).toHaveLength(4);

    const schedule = children.map((scene) => ({
      start: scene.startTime(),
      duration: scene.duration(),
    }));

    expect(schedule).toEqual([
      { start: 0, duration: 14 }, // crisis      last beat 11s + 3s
      { start: 18, duration: 14 }, // burst       last beat +8s + 6s
      { start: 35, duration: 4 }, // exit
      { start: 39, duration: 11 }, // traditional last beat +8s + 3s
    ]);
  });

  it('runs for exactly as long as it did before the refactor', () => {
    const { master } = scenes();
    expect(master.duration()).toBe(50);
  });

  it('exposes the scene labels the sequence is written against', () => {
    const { master } = scenes();
    expect(master.labels).toMatchObject({
      crisis: 0,
      burst: 18,
      exit: 35,
      traditional: 39,
    });
  });

  /**
   * Pins a pre-existing discrepancy so a deliberate fix trips this test rather
   * than slipping through unnoticed.
   *
   * `sectionsProgress` is computed against a declared `totalDuration` of 54,
   * but the timeline's content actually ends at 50. Under `scrub`, scroll
   * progress maps linearly onto the real duration, so ProgressHud's second dot
   * targets 72.2% of the scroll range and lands ~2.9s BEFORE the "traditional"
   * label it is named for. Predates the refactor; left alone deliberately,
   * because correcting it moves where that dot scrolls to.
   */
  it('records that the declared totalDuration overshoots the real one', () => {
    const { master } = scenes();

    expect(totalDuration).toBe(54);
    expect(master.duration()).toBe(50);

    const whereTheDotLands = sectionsProgress[1] * master.duration();
    expect(whereTheDotLands).toBeCloseTo(36.1, 1);
    expect(whereTheDotLands).not.toBe(master.labels.traditional);
  });
});
