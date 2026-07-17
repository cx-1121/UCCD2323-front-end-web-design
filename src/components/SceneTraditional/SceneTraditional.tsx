import styles from './SceneTraditional.module.css';
import FossilSvg from './FossilSvg';
import InfoCard from './InfoCard';

interface SceneTraditionalProps {
  onEnterFuture: () => void;
}

/**
 * Scene 1.5 — Fossil Energy comparison. Ported from past_landing_page.html
 * lines 892-958 (<section class="scene" id="scene-traditional">).
 * Shares the `.scene` base layout (global.css) with SceneIntro.
 */
function SceneTraditional({ onEnterFuture }: SceneTraditionalProps) {
  return (
    <section id="scene-traditional" className="scene">
      <div className={styles.svgViewport}>
        <div className={styles.visualWrapper}>
          <FossilSvg />
        </div>
      </div>
      <div className={styles.fossilQuestion} id="fossil-question-text">
        Is this the only way?
      </div>
      <InfoCard />
      
      {/* Target for GSAP timeline animation to fade in */}
      <div className={styles.ctaContainer} id="fossil-cta-container">
        <button className={styles.ctaButton} onClick={onEnterFuture}>
          ENTER THE FUTURE →
        </button>
      </div>
    </section>
  );
}

export default SceneTraditional;

