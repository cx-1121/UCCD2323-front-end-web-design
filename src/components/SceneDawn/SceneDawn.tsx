import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowGlyph } from '../icons';
import styles from './SceneDawn.module.css';

interface SceneDawnProps {
  onEnterFuture: () => void;
}

/**
 * The narration that carries the landing page out of the smoke. One line per
 * beat of the sky. The ids are the contract between this copy and `buildDawn()`
 * in useScrollTimeline — renaming one means renaming both.
 *
 * `tone` names the light the line is standing in, not the sentiment it carries,
 * because that is what its colour has to answer to. The ground behind these
 * four beats measures #0a0a0c, #58503d, #655e4d and #fbedcf — near-black, then
 * warm olive twice, then cream — so the ink walks cool white to warm white to
 * lit white to a deep warm dark, and never sits cold on a warm field.
 *
 * The welcome is not in this list: it is no longer scrolled to at all, but
 * played by the finale below, and it is the one beat that carries the club's
 * green.
 */
const DAWN_LINES: ReadonlyArray<{ id: string; text: string; tone?: 'warming' | 'lit' | 'risen' }> = [
  { id: 'dawn-line-1', text: 'Yet, this is not where our story ends.' },
  { id: 'dawn-line-2', text: 'There is another way forward.', tone: 'warming' },
  { id: 'dawn-line-3', text: 'A future powered by possibility.', tone: 'lit' },
  { id: 'dawn-line-4', text: 'Can you help us to save the world?', tone: 'risen' },
];

/**
 * Where the welcome has finished settling, in finale-seconds. Under reduced
 * motion the finale is seeked here instead of played, so the reader still gets
 * the club's name and the dissolve out, just none of the weather.
 */
const WELCOME_SETTLED = 3.4;

/** Every layer of the dawn is selected by its data attribute, never by a
 *  CSS-module class name — those are hashed at build time. */
const D = (name: string) => `[data-dawn="${name}"]`;

/**
 * The moment after "Yes". Not scroll-linked: the reader has stopped scrolling
 * to answer, so the answer is what plays the rest, on its own clock.
 *
 * It picks up exactly where the scrubbed timeline parks — sky on full gold, sun
 * risen, question on screen — and finishes the walk the scroll deliberately did
 * not: the last of the gold burns off, the sky goes clear, the motes rise, and
 * the club's name is the only thing left.
 *
 * Built inside a contextSafe callback, so every selector below resolves within
 * this component and every tween is reverted with it.
 */
function buildFinale() {
  const tl = gsap.timeline();

  // The question is answered, so it can go.
  tl.to('#dawn-answer', { opacity: 0, scale: 0.94, duration: 0.5, ease: 'power2.in' }, 0)
    .to(
      '#dawn-line-4',
      { opacity: 0, y: -40, filter: 'blur(12px)', duration: 0.9, ease: 'power2.in' },
      0.2,
    );

  // Full daylight — the half of the colour walk the scroll held back.
  tl.to(D('sky-gold'), { opacity: 0, duration: 2.2, ease: 'none' }, 0.8)
    .fromTo(D('sky-clear'), { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'none' }, 0.8)
    .to(D('sun'), { scale: 1.5, opacity: 0.7, duration: 3, ease: 'power1.out' }, 0)
    .to(D('flare'), { scaleX: 1.25, opacity: 0, duration: 1.8, ease: 'power2.out' }, 0.3)
    .to(D('vignette'), { opacity: 0, duration: 1.2, ease: 'none' }, 0.5)
    .to(D('scrim-light'), { opacity: 1, duration: 1.2, ease: 'none' }, 0.6);

  // Life returns last — held back until there was an answer to return to.
  tl.fromTo(
    D('mote'),
    { x: 0, y: 0, opacity: 0 },
    { opacity: 0.9, duration: 0.7, ease: 'none', stagger: 0.12 },
    0.6,
  )
    .to(D('mote'), { x: '6vw', y: '-26vh', duration: 3.2, ease: 'power2.out', stagger: 0.12 }, 0.6)
    .to(D('mote'), { opacity: 0, duration: 1.4, ease: 'none', stagger: 0.12 }, 2.4);

  tl.fromTo(
    '#dawn-welcome',
    { opacity: 0, y: 44, scale: 0.94, filter: 'blur(14px)' },
    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power2.out' },
    1.6,
  );

  /* 1.5s alone on the club's name, then the camera pushes through it and the
     scene dissolves into `--surface` — the exact colour HomePage paints itself.
     The route change happens on a frame that does not move, so the reader is
     carried over by the dissolve rather than dropped through a cut. */
  tl.to(
    '#dawn-welcome',
    { opacity: 0, scale: 1.05, filter: 'blur(10px)', duration: 1, ease: 'power2.in' },
    4.9,
  ).fromTo(D('exit-wash'), { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power1.inOut' }, 5);

  return tl;
}

/**
 * Scene 2 — Dawn. The walk out of the smoke, and the whole second half of the
 * landing page now that the fossil scene is gone.
 *
 *   1. Darkness. The smoke thickens rather than lifting.
 *   2. Wind arrives FIRST, before any light. This is the whole point of the
 *      sequence: the world does not regain life because it got brighter, it
 *      gets brighter because something started to move.
 *   3. The smoke shears sideways, a first point of light opens behind it.
 *   4. Sun breaks through. The palette walks black > blue-grey > warm grey >
 *      gold, and stops there, mid-morning, to ask its question.
 *   5. "Yes" — and only then the rest of the day.
 *
 * Beats 1-4 are scrubbed by the reader's scroll. Beat 5 is not: the reader has
 * stopped to answer, and the answer plays the finale on its own clock and hands
 * over to the club. There is no way past this scene except through the answer,
 * which is the point — the question is rhetorical, and the button says so.
 *
 * Every layer animates on transform and opacity alone. The colour curve is
 * built from stacked full-screen layers that cross-fade rather than one layer
 * animating background-color, so no beat costs a repaint.
 */
function SceneDawn({ onEnterFuture }: SceneDawnProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [answered, setAnswered] = useState(false);

  const { contextSafe } = useGSAP({ scope: rootRef });

  /**
   * Once answered, the page is pinned so the reader cannot scroll the finale
   * back off screen while it plays. Released on unmount rather than on the
   * finale's completion: this component's exit IS the route change, and a lock
   * still set at that point would follow the reader onto /home and leave that
   * page unscrollable. Nothing else on the landing page sets `overflow`, so
   * clearing the inline value is the correct restore.
   */
  useEffect(() => {
    if (!answered) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [answered]);

  const handleYes = contextSafe(() => {
    if (answered) return;
    // Disables the button and pins the page (see the effect above). The element
    // stays mounted on purpose: the finale fades it out, and unmounting it here
    // would tear it out from under that tween on the very next render.
    setAnswered(true);

    /* The scrubbed timeline still owns every layer the finale is about to
       animate. Disabling (rather than killing) its ScrollTrigger leaves the
       parked end state exactly where it is and stops it writing over the
       finale, and useGSAP reverts the whole thing on unmount either way. */
    ScrollTrigger.getById('landing-cinematic')?.disable(false);

    /* The route change is the last frame of the finale, not a timer alongside
       it: the dissolve has to be fully opaque before the page swaps underneath,
       and a separate setTimeout could only ever approximate that. The callback
       is attached before the seek below, which would otherwise fire it against
       an empty handler. */
    const finale = buildFinale().eventCallback('onComplete', onEnterFuture);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Skip the weather, keep the ending: the welcome is already settled, and
      // what plays from here is only the hold and the cross-fade out.
      finale.seek(WELCOME_SETTLED);
    }
  });

  return (
    <section id="scene-dawn" ref={rootRef} className={styles.stage}>
      {/* Camera push: the whole scene creeps forward through the sequence. */}
      <div className={styles.scene} data-dawn="scene" aria-hidden="true">
        {/* ---- Colour curve: black > deep blue-grey > warm grey > gold, then
                sky blue once there is an answer. Stacked, cross-faded. ---- */}
        <span className={`${styles.sky} ${styles.skySoot}`} data-dawn="sky-soot" />
        <span className={`${styles.sky} ${styles.skyDeep}`} data-dawn="sky-deep" />
        <span className={`${styles.sky} ${styles.skyWarm}`} data-dawn="sky-warm" />
        <span className={`${styles.sky} ${styles.skyGold}`} data-dawn="sky-gold" />
        <span className={`${styles.sky} ${styles.skyClear}`} data-dawn="sky-clear" />

        {/* ---- Smoke: thickens first, then shears apart once the wind hits. ---- */}
        <span className={`${styles.smoke} ${styles.smokeLeft}`} data-dawn="smoke-left" />
        <span className={`${styles.smoke} ${styles.smokeRight}`} data-dawn="smoke-right" />
        <span className={`${styles.smoke} ${styles.smokeCore}`} data-dawn="smoke-core" />

        {/* ---- Wind, arriving before any light. ---- */}
        <span className={`${styles.gust} ${styles.gust1}`} data-dawn="gust" />
        <span className={`${styles.gust} ${styles.gust2}`} data-dawn="gust" />
        <span className={`${styles.gust} ${styles.gust3}`} data-dawn="gust" />
        <span className={`${styles.gust} ${styles.gust4}`} data-dawn="gust" />

        {/* ---- Then the light. ---- */}
        <span className={styles.sun} data-dawn="sun" />
        <span className={styles.flare} data-dawn="flare" />

        {/* ---- Life returns last, and only after the answer. ---- */}
        <span className={`${styles.mote} ${styles.mote1}`} data-dawn="mote" />
        <span className={`${styles.mote} ${styles.mote2}`} data-dawn="mote" />
        <span className={`${styles.mote} ${styles.mote3}`} data-dawn="mote" />
        <span className={`${styles.mote} ${styles.mote4}`} data-dawn="mote" />
        <span className={`${styles.mote} ${styles.mote5}`} data-dawn="mote" />

        <span className={styles.vignette} data-dawn="vignette" />
      </div>

      {/* Readability floor for the copy. Two stacked washes rather than one
          layer animating its colour: the sky travels from near-black to gold,
          so the ink flips partway and the scrim under it has to flip with it. */}
      <span className={styles.scrimDark} data-dawn="scrim-dark" aria-hidden="true" />
      <span className={styles.scrimLight} data-dawn="scrim-light" aria-hidden="true" />

      {/* Every line shares one grid cell, so they cross-fade in place instead of
          reflowing the scene as each arrives. */}
      <div className={styles.narrative}>
        {DAWN_LINES.map(({ id, text, tone }) => (
          <p
            key={id}
            id={id}
            className={`${styles.narrativeLine} ${tone ? styles[tone] : ''}`}
          >
            {text}
          </p>
        ))}

        <p className={`${styles.narrativeLine} ${styles.welcome}`} id="dawn-welcome">
          <span className={styles.welcomeLead}>Welcome to</span>
          <span className={styles.welcomeBrand}>Green Tech Club.</span>
        </p>
      </div>

      {/* The handover. Blooms to HomePage's own surface colour so the route
          change lands on an unchanged frame. */}
      <span className={styles.exitWash} data-dawn="exit-wash" aria-hidden="true" />

      {/* The only answer. One pill: label and trailing glyph, no enclosure
          around the enclosure. */}
      <div className={styles.answerContainer} id="dawn-answer">
        <button
          type="button"
          className={styles.answer}
          onClick={handleYes}
          disabled={answered}
        >
          <span className={styles.answerLabel}>Yes, I&rsquo;m in</span>
          <span className={styles.answerIcon} aria-hidden="true">
            <ArrowGlyph />
          </span>
        </button>
      </div>
    </section>
  );
}

export default SceneDawn;
