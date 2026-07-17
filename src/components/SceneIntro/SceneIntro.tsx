import styles from './SceneIntro.module.css';
import ParticleCanvas from './ParticleCanvas';
import IndustrialSilhouette from './IndustrialSilhouette';
import IntroText from './IntroText';

/**
 * Scene 1 — Energy Crisis Intro. Ported from past_landing_page.html
 * lines 85-887 (#scene-intro section + intro-text/industrial-silhouette
 * siblings — see note below on DOM normalization).
 *
 * Deviation from legacy markup (flagged per PRD instructions): the legacy
 * HTML has an unbalanced </section> (past_landing_page.html:887) that closes
 * #scene-intro one tag early, so intro-text-container,
 * industrial-silhouette-container and industrial-dark-container are actually
 * parsed by the browser as *siblings* of <section id="scene-intro">, not
 * children (verified: 2 <section> opens vs 3 </section> closes in the
 * source). This has zero visual effect (all four elements are
 * absolutely/fixed positioned against the same containing block), but JSX
 * requires balanced tags, so this component normalizes them into one
 * fragment rather than reproducing the parser quirk.
 *
 * The shared `.scene` base layout (past_landing_page.css:54-68) lives in
 * global.css as a plain (non-module) class since SceneIntro and
 * SceneTraditional both apply it verbatim — referenced here by its literal
 * string name, not through the `styles` import.
 */
function SceneIntro() {
  return (
    <>
      <section id="scene-intro" className="scene" style={{ opacity: 1, zIndex: 1 }}>
        <div className={`${styles.introBgOverlay} intro-bg-overlay`} />
      </section>
      <ParticleCanvas />
      <IndustrialSilhouette />
      <IntroText />
    </>
  );
}

export default SceneIntro;
