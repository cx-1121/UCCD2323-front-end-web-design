import styles from './ScrollHint.module.css';

/**
 * Bottom "SCROLL DOWN" mouse-wheel hint. Ported from past_landing_page.html
 * <div class="scroll-indicator-mouse" id="scroll-hint"> (lines 74-80).
 * Fade-after-first-scroll behavior is wired up in M2; M1 renders it fully
 * visible (its legacy resting state).
 */
function ScrollHint() {
  return (
    <div className={styles.scrollIndicatorMouse} id="scroll-hint">
      <div className={styles.mouseFrame}>
        <div className={styles.mouseWheel} />
      </div>
      <span>SCROLL DOWN</span>
    </div>
  );
}

export default ScrollHint;
