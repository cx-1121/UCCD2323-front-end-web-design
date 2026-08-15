import type { RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { animState } from '../utils/animState';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export const totalDuration = 93;

/**
 * Where each scene starts on the master timeline, in seconds.
 *
 * These are the only absolute times in the file. Everything inside a scene is
 * positioned relative to its own zero, so a scene can be retimed by editing one
 * number here instead of hunting for the same magic constant in a dozen tweens.
 */
const BEAT = {
  crisis: 0,
  burst: 18,
  exit: 35,
  dawn: 39,
} as const;

/**
 * Scene 1 — the air thickens and the headline turns over. Ends at +14s.
 *
 * Eases are written out per tween rather than hoisted into `defaults`: several
 * of these deliberately run on GSAP's default ease, and folding an ease into
 * defaults would silently retime them.
 */
function buildCrisis() {
  const tl = gsap.timeline({ defaults: { duration: 5 } });

  tl.to(animState, { smokeIntensity: 1.0, duration: 3 }, 3)
    .to('#intro-main-title', { opacity: 0 }, 7)
    .to('#intro-carbon-title', { opacity: 1 }, 7)
    .to('#intro-subtitle', { opacity: 0 }, 7)
    .to('#scene-intro .intro-bg-overlay', { opacity: 0.7, ease: 'power1.inOut' }, 7)
    .fromTo('#industrial-dark-container', { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 7)
    .to(animState, { smokeIntensity: 1.0, duration: 3 }, 11);

  return tl;
}

/** Scene 2 — the carbon title bursts and the smoke spreads. Ends at +14s. */
function buildBurst() {
  const tl = gsap.timeline({ defaults: { duration: 6, ease: 'power2.out' } });

  tl.to(
    '#intro-carbon-title',
    {
      filter: 'blur(25px) drop-shadow(0 0 35px rgba(211, 47, 47, 0))',
      scale: 6.0,
      y: '20vh',
      opacity: 0,
    },
    0,
  )
    .fromTo(
      '#intro-fossil-title',
      {
        opacity: 0,
        y: 0,
        scale: 0.85,
        filter: 'blur(15px) drop-shadow(0 0 35px rgba(211, 47, 47, 0))',
      },
      {
        opacity: 1,
        y: '20vh',
        scale: 1.0,
        filter: 'blur(0px) drop-shadow(0 0 35px rgba(211, 47, 47, 0.35))',
      },
      0,
    )
    .to(animState, { smokeSpread: 1.0, duration: 8, ease: 'power1.inOut' }, 0)
    .to('.fossil-part-2', { filter: 'grayscale(0.6) brightness(0.7)', ease: 'power1.inOut' }, 8);

  return tl;
}

/** Scene 3 — the intro pulls away toward the camera. Ends at +4s. */
function buildExit() {
  const tl = gsap.timeline({ defaults: { duration: 4 } });

  // #scene-intro intentionally runs on GSAP's default ease, unlike its siblings.
  tl.to('#scene-intro', { opacity: 0, pointerEvents: 'none' }, 0)
    .to('#industrial-silhouette-container', { scale: 2.8, opacity: 0, ease: 'power2.in', pointerEvents: 'none' }, 0)
    .to('#industrial-dark-container', { scale: 2.8, opacity: 0, ease: 'power2.in', pointerEvents: 'none' }, 0)
    .to('#intro-text-container', { scale: 2.0, opacity: 0, ease: 'power2.in', pointerEvents: 'none' }, 0)
    .to(animState, { smokeIntensity: 0.0, smokeSpread: 1.5, ease: 'power2.in' }, 0);

  return tl;
}

/**
 * The subtitles that carry the dawn, in order. These ids are rendered by
 * SceneDawn — the two lists are one contract. "Welcome to Green Tech Club." is
 * deliberately absent: it is not scrolled to at all, but played by SceneDawn's
 * own finale once the reader has answered.
 */
const DAWN_LINES = ['#dawn-line-1', '#dawn-line-2', '#dawn-line-3', '#dawn-line-4'];

/**
 * Where each subtitle lands inside the dawn, in seconds. Not an even step: the
 * lines are pinned to the beats of the sky, not to a metronome — line 2 arrives
 * with the wind, line 3 as the smoke shears, and the question waits out a long
 * wordless stretch while the sun actually comes up.
 */
const DAWN_LINE_AT = [3, 15, 27, 44];
/** On-screen dwell, measured from the start of a line's entrance, not its end. */
const DAWN_LINE_HOLD = 8.8;

/** Every layer of the dawn is selected by its data attribute, never by a
 *  CSS-module class name — those are hashed at build time. */
const D = (name: string) => `[data-dawn="${name}"]`;

/**
 * Scene 4 — Dawn, and the whole second half of the page. Ends at +54s.
 *
 * A port of what used to be DawnTransition's CSS keyframes, scrubbed by the
 * reader's scroll instead of by a 4.6s clock, and then stretched to twice that
 * again so each beat is walked rather than flicked past. The keyframe
 * percentages that used to live in the stylesheet are what these absolute
 * seconds were derived from, which is why the numbers are not round.
 *
 * It stops on gold, mid-morning, with the question on screen and the only
 * answer to it under that. Full daylight, the motes and the club's name are
 * NOT here: they are `buildFinale()` in SceneDawn, off the scroll entirely,
 * because they are what the answer buys.
 */
function buildDawn() {
  const tl = gsap.timeline();

  // The intro has already pulled away toward the camera; the dawn opens under
  // it in the dark it left behind.
  tl.fromTo('#scene-dawn', { opacity: 0 }, { opacity: 1, duration: 6, ease: 'power1.inOut' }, 0)
    // Camera push: a slow creep forward through the whole sequence.
    .fromTo(D('scene'), { scale: 1 }, { scale: 1.12, duration: 54, ease: 'power1.inOut' }, 0);

  // ---- Colour curve. Linear cross-fades: any ease here would read as the
  //      light stalling, and the sky is the one thing that must not. The walk
  //      ends on gold — `buildFinale()` owns the last step to clear. ----
  tl.to(D('sky-soot'), { opacity: 0, duration: 12, ease: 'none' }, 10.8)
    .fromTo(D('sky-deep'), { opacity: 0 }, { opacity: 1, duration: 10.8, ease: 'none' }, 9.6)
    .to(D('sky-deep'), { opacity: 0, duration: 8.4, ease: 'none' }, 30)
    .fromTo(D('sky-warm'), { opacity: 0 }, { opacity: 1, duration: 9.6, ease: 'none' }, 26.4)
    .to(D('sky-warm'), { opacity: 0, duration: 7.2, ease: 'none' }, 40.8)
    .fromTo(D('sky-gold'), { opacity: 0 }, { opacity: 1, duration: 9.6, ease: 'none' }, 37.2);

  // ---- Smoke. Beat 1 is the whole trick: it gets worse before it gets
  //      better, and only the wind changes that. ----
  tl.fromTo(
    D('smoke-core'),
    { x: 0, y: 0, scale: 0.9, opacity: 0.75 },
    { scale: 1.15, opacity: 1, duration: 10.8, ease: 'power1.out' },
    0,
  )
    .to(D('smoke-core'), { y: '-6vh', scale: 1.25, opacity: 0.72, duration: 16.8, ease: 'none' }, 10.8)
    .to(D('smoke-core'), { y: '-22vh', scale: 1.5, opacity: 0.12, duration: 18, ease: 'power1.in' }, 27.6)
    .to(D('smoke-core'), { y: '-34vh', scale: 1.7, opacity: 0, duration: 8.4, ease: 'none' }, 45.6);

  tl.fromTo(
    D('smoke-left'),
    { x: '6vw', y: 0, scale: 0.92, opacity: 0.7 },
    { x: '2vw', scale: 1.12, opacity: 0.95, duration: 10.8, ease: 'power1.out' },
    0,
  )
    .to(D('smoke-left'), { x: '-22vw', y: '-4vh', scale: 1.3, opacity: 0.6, duration: 20.4, ease: 'power1.in' }, 10.8)
    .to(D('smoke-left'), { x: '-72vw', y: '-12vh', scale: 1.6, opacity: 0, duration: 22.8, ease: 'none' }, 31.2);

  tl.fromTo(
    D('smoke-right'),
    { x: '-6vw', y: 0, scale: 0.94, opacity: 0.68 },
    { x: '-2vw', scale: 1.14, opacity: 0.95, duration: 10.8, ease: 'power1.out' },
    0,
  )
    .to(D('smoke-right'), { x: '24vw', y: '-3vh', scale: 1.32, opacity: 0.58, duration: 20.4, ease: 'power1.in' }, 10.8)
    .to(D('smoke-right'), { x: '76vw', y: '-10vh', scale: 1.62, opacity: 0, duration: 22.8, ease: 'none' }, 31.2);

  // ---- Wind, arriving before any light. ----
  tl.fromTo(
    D('gust'),
    { x: '-50vw' },
    { x: '130vw', duration: 26.4, ease: 'power2.out', stagger: 1.6 },
    7.2,
  )
    .fromTo(D('gust'), { opacity: 0 }, { opacity: 0.85, duration: 4.8, ease: 'none', stagger: 1.6 }, 7.2)
    .to(D('gust'), { opacity: 0, duration: 16.8, ease: 'none', stagger: 1.6 }, 16.8);

  // ---- Then the light. It rises to full and stays there: the last swell is
  //      the finale's, not the scroll's. ----
  tl.fromTo(
    D('sun'),
    { scale: 0.06, opacity: 0 },
    { scale: 0.16, opacity: 0.5, duration: 7.2, ease: 'power2.out' },
    15.6,
  )
    .to(D('sun'), { scale: 0.55, opacity: 0.95, duration: 14.4, ease: 'none' }, 22.8)
    .to(D('sun'), { scale: 1, opacity: 1, duration: 13.2, ease: 'none' }, 37.2);

  // yPercent carries the centring the stylesheet deliberately left off, so the
  // scaleX streak below cannot clobber it.
  tl.fromTo(
    D('flare'),
    { yPercent: -50, scaleX: 0.3, opacity: 0 },
    { scaleX: 1, opacity: 0.9, duration: 10.8, ease: 'power2.out' },
    31.2,
  ).to(D('flare'), { opacity: 0.45, duration: 10.8, ease: 'none' }, 42);

  tl.to(D('vignette'), { opacity: 0.55, duration: 25.2, ease: 'none' }, 12)
    .to(D('vignette'), { opacity: 0, duration: 16.8, ease: 'none' }, 37.2);

  // The ink flips from light to dark as the sky goes gold, so its readability
  // floor flips with it — both settled before the question arrives at 44.
  tl.to(D('scrim-dark'), { opacity: 0, duration: 8, ease: 'none' }, 38)
    .fromTo(D('scrim-light'), { opacity: 0 }, { opacity: 1, duration: 8, ease: 'none' }, 42);

  // ---- Subtitles. All four share one grid cell, so each is pushed back out
  //      before the next arrives — except the question, which has nowhere to go
  //      until it is answered. ----
  DAWN_LINES.forEach((line, i) => {
    const at = DAWN_LINE_AT[i];
    const isQuestion = i === DAWN_LINES.length - 1;

    tl.fromTo(
      line,
      { opacity: 0, y: 40, filter: 'blur(12px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 4, ease: 'power2.out' },
      at,
    );

    if (!isQuestion) {
      tl.to(
        line,
        { opacity: 0, y: -40, filter: 'blur(12px)', duration: 3.2, ease: 'power2.in' },
        at + DAWN_LINE_HOLD,
      );
    }
  });

  // Settles well before the scroll runs out, so the reader is never asked to
  // hunt for the last pixel of the page to reach it.
  tl.fromTo(
    '#dawn-answer',
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 3, ease: 'power2.out' },
    48.5,
  );

  // Nothing animates over the last 2.5s on purpose: the question and its answer
  // are left alone at the bottom of the scroll.
  tl.set({}, {}, 54);

  return tl;
}

/**
 * Composes the master timeline: four nested scene timelines placed at named
 * labels. Deliberately free of ScrollTrigger and of React, so the choreography
 * can be built and asserted in a test without a scroller.
 *
 * @param vars passed to the master timeline (the hook supplies the
 *   ScrollTrigger config and the time-display onUpdate).
 */
export function buildLandingTimeline(vars?: gsap.TimelineVars) {
  const master = gsap.timeline(vars);

  master
    .addLabel('crisis', BEAT.crisis)
    .addLabel('burst', BEAT.burst)
    .addLabel('exit', BEAT.exit)
    .addLabel('dawn', BEAT.dawn);

  master
    .add(buildCrisis(), 'crisis')
    .add(buildBurst(), 'burst')
    .add(buildExit(), 'exit')
    .add(buildDawn(), 'dawn');

  return master;
}

/**
 * The landing page's scroll-linked cinematic.
 *
 * Structure: one master timeline carrying the only ScrollTrigger, with four
 * nested scene timelines added at named labels. ScrollTrigger lives on the
 * master alone — never on a nested timeline — which is what keeps scrubbing
 * coherent.
 *
 * Built with useGSAP so the master, its ScrollTrigger, every nested scene and
 * all the inline styles they write are reverted on unmount. `scope` is the
 * scroll container; every id targeted below lives inside it, so the selectors
 * resolve within this component rather than querying the document.
 */
export function useScrollTimeline(triggerRef: RefObject<HTMLDivElement>) {
  useGSAP(
    () => {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      // Starting state.
      gsap.set('#scene-dawn', { opacity: 0 });
      gsap.set([...DAWN_LINES, '#dawn-welcome'], { opacity: 0, y: 40 });
      // xPercent rather than a CSS translateX: GSAP would otherwise decompose
      // the stylesheet's -50% into a fixed pixel offset the first time it
      // touches this element's transform, and the pill would drift off centre
      // on resize.
      gsap.set('#dawn-answer', { opacity: 0, scale: 0.9, xPercent: -50 });
      gsap.set(animState, { smokeIntensity: 0.0, smokeSpread: 0.0 });

      /**
       * The scroll hint sits outside the scroll container, so it is resolved by
       * id rather than through the scope. Held as one paused tween that gets
       * played and reversed: the previous code called gsap.to() from inside
       * onUpdate, minting a fresh tween on every scroll frame.
       */
      const hint = document.getElementById('scroll-hint');
      const hintFade = hint ? gsap.to(hint, { opacity: 0, duration: 1, paused: true }) : null;
      let hintHidden = false;

      const timeDisplay = document.getElementById('dev-time-display');

      // The ScrollTrigger is attached through the vars, so the returned
      // instance needs no further handling here; useGSAP reverts it.
      buildLandingTimeline({
        onUpdate: function (this: gsap.core.Timeline) {
          if (timeDisplay) {
            timeDisplay.textContent = `Time: ${this.time().toFixed(2)}s`;
          }
        },
        scrollTrigger: {
          id: 'landing-cinematic',
          trigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          onUpdate: (self) => {
            // Act on the crossing, not on every frame.
            const shouldHide = self.progress > 0.02;
            if (hintFade && shouldHide !== hintHidden) {
              hintHidden = shouldHide;
              if (shouldHide) {
                hintFade.play();
              } else {
                hintFade.reverse();
              }
            }
          },
        },
      });

      /* The section index dispatch, the `scrollToSection` / `scrollToTop`
         window bindings and the `sectionsProgress` table all went with the
         scene radar: it was their only consumer. The master, its ScrollTrigger
         and every nested scene are reverted by useGSAP, so nothing is left to
         unhook by hand. */
    },
    { scope: triggerRef, dependencies: [triggerRef] },
  );
}
