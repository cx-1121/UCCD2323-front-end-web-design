import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { animState } from '../utils/animState';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const totalDuration = 54;
export const sectionsProgress = [
  0.0,
  39 / totalDuration, // Traditional / Fossil
];

export function useScrollTimeline(triggerRef: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    // Initialize/reset starting state on mount
    gsap.set("#scene-traditional", { scale: 1.25, opacity: 0, pointerEvents: "none" });
    gsap.set("#fossil-gear-large", { rotation: 0 });
    gsap.set("#fossil-gear-small", { rotation: 0 });
    gsap.set("#fossil-question-text", { opacity: 0, scale: 0.95 });
    gsap.set(animState, { smokeIntensity: 0.0, smokeSpread: 0.0 });

    const mainTl = gsap.timeline({
      onUpdate: function (this: gsap.core.Timeline) {
        const timeEl = document.getElementById('dev-time-display');
        if (timeEl) {
          timeEl.textContent = `Time: ${this.time().toFixed(2)}s`;
        }
      },
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          let activeIndex = 0;
          for (let i = 0; i < sectionsProgress.length; i++) {
            if (progress >= sectionsProgress[i] - 0.02) {
              activeIndex = i;
            }
          }

          // Dispatch active section change event
          window.dispatchEvent(
            new CustomEvent('active-section-changed', {
              detail: { activeIndex },
            })
          );

          // Manage Scroll Hint visibility
          const hint = document.getElementById('scroll-hint');
          if (hint) {
            if (progress > 0.02) {
              gsap.to(hint, { opacity: 0, duration: 1 });
            } else {
              gsap.to(hint, { opacity: 1, duration: 1 });
            }
          }
        },
      },
    });

    /* --- Scene 1: Energy Crisis Intro (0s - 36s) --- */
    mainTl.to(animState, { smokeIntensity: 1.0, duration: 3 }, 3);
    mainTl.to("#intro-main-title", { opacity: 0, duration: 5 }, 7);
    mainTl.to("#intro-carbon-title", { opacity: 1, duration: 5 }, 7);
    mainTl.to("#intro-subtitle", { opacity: 0, duration: 5 }, 7);
    mainTl.to("#scene-intro .intro-bg-overlay", { opacity: 0.7, duration: 5, ease: "power1.inOut" }, 7);
    mainTl.fromTo("#industrial-dark-container", { opacity: 0 }, { opacity: 1, duration: 5, ease: "power1.inOut" }, 7);
    mainTl.to(animState, { smokeIntensity: 1.0, duration: 3 }, 11);

    /* --- 18s Burst & Spread Climax --- */
    mainTl.to("#intro-carbon-title", {
      filter: "blur(25px) drop-shadow(0 0 35px rgba(211, 47, 47, 0))",
      scale: 6.0,
      y: "20vh",
      opacity: 0,
      duration: 6,
      ease: "power2.out",
    }, 18);

    mainTl.fromTo("#intro-fossil-title",
      {
        opacity: 0,
        y: 0,
        scale: 0.85,
        filter: "blur(15px) drop-shadow(0 0 35px rgba(211, 47, 47, 0))",
      },
      {
        opacity: 1,
        y: "20vh",
        scale: 1.0,
        filter: "blur(0px) drop-shadow(0 0 35px rgba(211, 47, 47, 0.35))",
        duration: 6,
        ease: "power2.out",
      },
      18
    );

    mainTl.to(".fossil-part-2", {
      filter: "grayscale(0.6) brightness(0.7)",
      duration: 6,
      ease: "power1.inOut",
    }, 26);

    mainTl.to(animState, { smokeSpread: 1.0, duration: 8, ease: "power1.inOut" }, 18);

    /* --- Transition to scene 1.5 (35s) --- */
    mainTl.to("#scene-intro", { opacity: 0, duration: 4, pointerEvents: "none" }, 35);
    mainTl.to("#industrial-silhouette-container", { scale: 2.8, opacity: 0, duration: 4, ease: "power2.in", pointerEvents: "none" }, 35);
    mainTl.to("#industrial-dark-container", { scale: 2.8, opacity: 0, duration: 4, ease: "power2.in", pointerEvents: "none" }, 35);
    mainTl.to("#intro-text-container", { scale: 2.0, opacity: 0, duration: 4, ease: "power2.in", pointerEvents: "none" }, 35);
    mainTl.to(animState, { smokeIntensity: 0.0, smokeSpread: 1.5, duration: 4, ease: "power2.in" }, 35);

    /* --- Scene 1.5: Fossil Energy 传统能源对比 (39s - 54s) --- */
    mainTl.addLabel("traditional", 39);

    mainTl.fromTo("#scene-traditional",
      { scale: 1.25, opacity: 0 },
      { scale: 1.0, opacity: 1, pointerEvents: "auto", duration: 3, ease: "power2.out" },
      39
    );

    mainTl.to("#fossil-gear-large", { rotation: 360, ease: "none", duration: 12 }, 39);
    mainTl.to("#fossil-gear-small", { rotation: -540, ease: "none", duration: 12 }, 39);
    mainTl.to("#fossil-question-text", { opacity: 1, scale: 1, duration: 3, ease: "power2.out" }, 44);

    // Global scroll control bindings
    (window as any).scrollToSection = (index: number) => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = scrollHeight * sectionsProgress[index];
      gsap.to(window, {
        scrollTo: { y: targetScroll },
        duration: 2,
        ease: "power3.inOut",
      });
    };

    (window as any).scrollToTop = (e: Event) => {
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: 0 },
        duration: 3,
        ease: "power4.inOut",
      });
    };

    return () => {
      mainTl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      delete (window as any).scrollToSection;
      delete (window as any).scrollToTop;
    };
  }, [triggerRef]);
}
