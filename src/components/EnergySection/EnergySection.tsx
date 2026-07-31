import styles from './EnergySection.module.css';
import type { EnergySource } from '../../data/EnergySources';
import { useReveal } from '../../hooks/useReveal';
import {
  BiomassGlyph,
  FieldGlyph,
  GeoGlyph,
  HydroGlyph,
  LimitGlyph,
  MechanismGlyph,
  SolarGlyph,
  UpsideGlyph,
  WindGlyph,
} from '../icons';

/** Source id → signature glyph. Unknown ids fall back to the solar mark. */
const sourceGlyphs = {
  solar: SolarGlyph,
  wind: WindGlyph,
  hydroelectric: HydroGlyph,
  biomass: BiomassGlyph,
  geothermal: GeoGlyph,
} as const;

type EnergySectionProps = {
  source: EnergySource;
  /** Zero-based position, rendered as the editorial folio number (01 … 05). */
  index: number;
};

function EnergySection({ source, index }: EnergySectionProps) {
  const hostRef = useReveal<HTMLElement>(styles.revealed);
  const SourceGlyph = sourceGlyphs[source.id as keyof typeof sourceGlyphs] ?? SolarGlyph;
  const folio = String(index + 1).padStart(2, '0');

  return (
    <section
      id={source.id}
      ref={hostRef}
      className={styles.shell}
      aria-labelledby={`${source.id}-title`}
    >
      <div className={styles.core}>
        {/* ---- Masthead: folio + oversized title + lede ---- */}
        <header className={styles.masthead} data-reveal data-reveal-index="0">
          <div className={styles.folioRow}>
            <span className={styles.folio}>{folio}</span>
            <span className={styles.rule} aria-hidden="true" />
            <span className={styles.kind}>Renewable source</span>
          </div>

          <h2 id={`${source.id}-title`} className={styles.title}>
            {source.name}
          </h2>

          <p className={styles.lede}>{source.description}</p>
        </header>

        {/* ---- Asymmetrical bento ---- */}
        <div className={styles.bento}>
          <article className={`${styles.tile} ${styles.tileMechanism}`} data-reveal data-reveal-index="1">
            <div className={styles.tileHead}>
              <span className={styles.tileIcon}>
                <MechanismGlyph />
              </span>
              <h3 className={styles.tileTitle}>How it works</h3>
            </div>
            <p className={styles.tileBody}>{source.howItWorks}</p>
          </article>

          {/* Signature plate — the visual anchor that breaks the text rhythm */}
          <div className={`${styles.tile} ${styles.tileSignature}`} data-reveal data-reveal-index="2">
            <span className={styles.signatureGlyph} aria-hidden="true">
              <SourceGlyph />
            </span>
            <span className={styles.signatureName} aria-hidden="true">
              {source.name.split(' ')[0]}
            </span>
          </div>

          <article className={`${styles.tile} ${styles.tileUpside}`} data-reveal data-reveal-index="3">
            <div className={styles.tileHead}>
              <span className={styles.tileIcon}>
                <UpsideGlyph />
              </span>
              <h3 className={styles.tileTitle}>Advantages</h3>
            </div>
            <ul className={styles.ledger}>
              {source.advantages.map((advantage) => (
                <li key={advantage}>{advantage}</li>
              ))}
            </ul>
          </article>

          <article className={`${styles.tile} ${styles.tileLimit}`} data-reveal data-reveal-index="4">
            <div className={styles.tileHead}>
              <span className={styles.tileIcon}>
                <LimitGlyph />
              </span>
              <h3 className={styles.tileTitle}>Limitations</h3>
            </div>
            <ul className={`${styles.ledger} ${styles.ledgerMuted}`}>
              {source.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </article>

          <article className={`${styles.tile} ${styles.tileField}`} data-reveal data-reveal-index="5">
            <div className={styles.tileHead}>
              <span className={styles.tileIcon}>
                <FieldGlyph />
              </span>
              <h3 className={styles.tileTitle}>In the field</h3>
              <span className={styles.tileCount}>{source.applications.length} deployments</span>
            </div>
            <ul className={styles.chips}>
              {source.applications.map((application) => (
                <li key={application} className={styles.chip}>
                  {application}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

export default EnergySection;
