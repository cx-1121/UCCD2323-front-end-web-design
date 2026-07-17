import styles from './SceneTraditional.module.css';
import FossilSvg from './FossilSvg';
import InfoCard from './InfoCard';

/**
 * Scene 1.5 — Fossil Energy comparison. Ported from past_landing_page.html
 * lines 892-958 (<section class="scene" id="scene-traditional">).
 * Shares the `.scene` base layout (global.css) with SceneIntro.
 */
function SceneTraditional() {
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
    </section>
  );
}

export default SceneTraditional;
