import styles from './InfoCard.module.css';

/**
 * Glassmorphic description card for Scene 1.5 (Fossil Energy).
 * Ported from past_landing_page.html lines 953-956.
 * Note: the legacy markup also applies a `carbon-highlight` class to the
 * highlighted span, but past_landing_page.css never defines that selector
 * (dead/unstyled class in the source) — kept here unstyled for 1:1 fidelity
 * rather than inventing new styling not present in the legacy stylesheet.
 */
function InfoCard() {
  return (
    <div className={styles.infoCard}>
      <h2>01.5 Fossil Energy</h2>
      <p>
        The industrial foundation. Extraction pumps and combustion stacks exhaust heavy carbon
        footprint, driving fossil machinery of past centuries.{' '}
        <span className={`${styles.highlight} carbon-highlight`}>Is this the only way?</span>
      </p>
    </div>
  );
}

export default InfoCard;
