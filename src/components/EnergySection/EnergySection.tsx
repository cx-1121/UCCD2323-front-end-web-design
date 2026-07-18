import styles from "./EnergySection.module.css";
import type { EnergySource } from "../../data/EnergySources";

type EnergySectionProps = {
  source: EnergySource;
};

function EnergySection({ source }: EnergySectionProps) {
  return (
    <section id={source.id} className={styles.energySection}>
      <div className={styles.header}>
        <p className={styles.label}>Renewable Energy</p>
        <h2 className={styles.title}>{source.name}</h2>
        <p className={styles.description}>{source.description}</p>
      </div>

      <div className={styles.contentGrid}>
        <article className={styles.infoCard}>
          <h3>How it works</h3>
          <p>{source.howItWorks}</p>
        </article>

        <article className={styles.infoCard}>
          <h3>Advantages</h3>
          <ul>
            {source.advantages.map((advantage) => (
              <li key={advantage}>{advantage}</li>
            ))}
          </ul>
        </article>

        <article className={styles.infoCard}>
          <h3>Limitations</h3>
          <ul>
            {source.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </article>

        <article className={styles.infoCard}>
          <h3>Real-world applications</h3>
          <ul>
            {source.applications.map((application) => (
              <li key={application}>{application}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default EnergySection;