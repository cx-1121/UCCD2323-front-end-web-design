import type { RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { animState } from '../utils/animState';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export const totalDuration = 54;
export const sectionsProgress = [
  0.0,
  39 / totalDuration, // Traditional / Fossil
];

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
  traditional: 39,
} as const;

declare global {
  interface Window {
    scrollToSection?: (index: number) => void;
    scrollToTop?: (event: Event) => void;
  }
}

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

/** Scene 4 — the fossil comparison arrives and the CTA settles. Ends at +11s. */
function buildTraditional() {
  const tl = gsap.timeline({ defaults: { duration: 3, ease: 'power2.out' } });

  tl.fromTo(
    '#scene-traditional',
    { scale: 1.25, opacity: 0 },
    { scale: 1.0, opacity: 1, pointerEvents: 'auto' },
    0,
  )
    .to('#fossil-question-text', { opacity: 1, scale: 1 }, 5)
    .fromTo(
      '#fossil-cta-container',
      { opacity: 0, scale: 0.9, pointerEvents: 'none' },
      { opacity: 1, scale: 1, pointerEvents: 'auto' },
      8,
    );

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
    .addLabel('traditional', BEAT.traditional);

  master
    .add(buildCrisis(), 'crisis')
    .add(buildBurst(), 'burst')
    .add(buildExit(), 'exit')
    .add(buildTraditional(), 'traditional');

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
      gsap.set('#scene-traditional', { scale: 1.25, opacity: 0, pointerEvents: 'none' });
      gsap.set('#fossil-question-text', { opacity: 0, scale: 0.95 });
      gsap.set('#fossil-cta-container', { opacity: 0, scale: 0.95, pointerEvents: 'none' });
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
            const progress = self.progress;
            let activeIndex = 0;
            for (let i = 0; i < sectionsProgress.length; i++) {
              if (progress >= sectionsProgress[i] - 0.02) {
                activeIndex = i;
              }
            }

            window.dispatchEvent(
              new CustomEvent('active-section-changed', { detail: { activeIndex } }),
            );

            // Act on the crossing, not on every frame.
            const shouldHide = progress > 0.02;
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

      // Global scroll control bindings, consumed by ProgressHud.
      window.scrollToSection = (index: number) => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = scrollHeight * sectionsProgress[index];
        gsap.to(window, { scrollTo: { y: targetScroll }, duration: 2, ease: 'power3.inOut' });
      };

      window.scrollToTop = (event: Event) => {
        event.preventDefault();
        gsap.to(window, { scrollTo: { y: 0 }, duration: 3, ease: 'power4.inOut' });
      };

      // The master, its ScrollTrigger and every nested scene are reverted by
      // useGSAP; only the window bindings need unhooking by hand.
      return () => {
        delete window.scrollToSection;
        delete window.scrollToTop;
      };
    },
    { scope: triggerRef, dependencies: [triggerRef] },
  );
}
