import styles from './IntroText.module.css';

/**
 * Headline text sequence for Scene 1 (Intro): "Our world runs on energy"
 * -> "CARBON" -> "Fossil fuels power our lives, but drain our planet".
 * Ported from past_landing_page.html lines 93-108. The three <h1> resting
 * states (main title visible, carbon/fossil titles hidden at opacity 0) are
 * the legacy scroll-top state; GSAP crossfades between them in M2.
 */
function IntroText() {
  return (
    <div className={styles.introText} id="intro-text-container">
      <div className={styles.titleWrapper}>
        <h1 id="intro-main-title" className={styles.mainTitle}>
          Our world runs on
          <br />
          energy.
        </h1>
        <h1 id="intro-carbon-title" className={styles.carbonTitle}>
          CARBON
        </h1>
        <h1 id="intro-fossil-title" className={styles.fossilTitle}>
          <span className={`${styles.fossilPart1} fossil-part-1`}>Fossil fuels power our lives, </span>
          <br />
          <span className={`${styles.fossilPart2} fossil-part-2`}>but drain our planet.</span>
        </h1>
      </div>
      <p id="intro-subtitle">But at what cost?</p>
    </div>
  );
}

export default IntroText;
