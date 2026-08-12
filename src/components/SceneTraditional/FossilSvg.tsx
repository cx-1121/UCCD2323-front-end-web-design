import styles from './FossilSvg.module.css';

/**
 * Fossil-energy visual component rendering public/assets/pumpjack.svg.
 */
function FossilSvg() {
  return (
    <img
      src="/assets/pumpjack.svg?v=3"
      alt="Fossil Energy Pumpjack"
      className={styles.pumpjackImg}
    />
  );
}

export default FossilSvg;

