import { useEffect, useRef, useState } from 'react';
import IndustrialSilhouette from '../../components/SceneIntro/IndustrialSilhouette';
import {
  ArrowGlyph,
  BoltGlyph,
  CompassGlyph,
  HorizonGlyph,
  LayersGlyph,
  OrbitGlyph,
  TargetGlyph,
} from '../../components/icons';
import styles from './RevisitOverlay.module.css';

/**
 * THE ACCESSION — the revisit surface.
 *
 * THESIS: a returning visitor is an accession, not a cache-miss. A herbarium
 * sheet gains a dated annotation slip every time a new botanist re-examines
 * it, so the sheet's own history is a stack of return visits — which is
 * exactly what `attemptsToReturnToPast` counts. The pressed specimen is this
 * project's own industrial city: the fossil past, collected, flattened,
 * labelled, and no longer growing.
 *
 * OWN-WORLD: the interior of a seed vault at -18C. Cold near-black ground,
 * the sheet reading pale steel-green under cold light rather than parchment,
 * violet aniline accession ink, and ONE living green held back for whatever is
 * actually alive. Typed in Courier Prime, stamped in Archivo Narrow.
 *
 * FORM: herbarium specimen sheet & seed vault; candidate 6 of 7; seed f7aee1de.
 *
 * The three levels are the fixed product constraint (PRODUCT.md): each return
 * goes further than the last, and the third opens the vault catalogue.
 */

interface RevisitOverlayProps {
  level: number;
  onLeave: (targetPath?: string) => void;
}

/** When the level 3 catalogue unseals, after the determination lands. */
const CATALOGUE_DELAY_MS = 4200;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * What each return writes onto the sheet. The narrative lines are the
 * annotations themselves — what the examiner wrote — so the copy and the
 * artifact are the same object rather than text laid over a picture.
 */
type Annotation = { hand: string; note: string; determined?: boolean };

const RECORD: Record<number, { stamp: string; annotations: Annotation[]; lines: string[] }> = {
  1: {
    stamp: 'Returned',
    annotations: [{ hand: 'det. i', note: 'Specimen re-examined. Unchanged.' }],
    lines: [
      'Once you have reached for a greener future,',
      'you do not walk back into the smoke.',
    ],
  },
  2: {
    stamp: 'Re-examined',
    annotations: [
      { hand: 'det. i', note: 'Specimen re-examined. Unchanged.' },
      { hand: 'det. ii', note: 'Growth observed at the margins. Revise.' },
    ],
    lines: ['You have seen what was.', 'Now discover what can be.'],
  },
  3: {
    stamp: 'Determined',
    annotations: [
      { hand: 'det. i', note: 'Specimen re-examined. Unchanged.' },
      { hand: 'det. ii', note: 'Growth observed at the margins. Revise.' },
      { hand: 'det. iii', note: 'Living. Transfer to the vault.', determined: true },
    ],
    lines: [
      'This world once powered us.',
      'But we learned its cost.',
      'So the way back is closed, and the way forward is open.',
    ],
  },
};

type Drawer = {
  label: string;
  detail: string;
  Glyph: (props: { className?: string }) => JSX.Element;
  /** Omitted while the route does not exist yet; the drawer renders unaccessioned. */
  path?: string;
};

/**
 * The vault catalogue. Routes that do not exist yet are not hidden — a seed
 * vault records what it does not hold, so they read as accessions not yet
 * made. Giving one a `path` is all it takes to open the drawer.
 */
const DRAWERS: Drawer[] = [
  {
    label: 'Explore energy',
    detail: 'Five renewable mechanisms and real-time generation principles',
    Glyph: CompassGlyph,
    path: '/explore',
  },
  {
    label: 'Live dashboard',
    detail: 'Real-time carbon telemetry, national mixes and climate feeds',
    Glyph: BoltGlyph,
    path: '/dashboard',
  },
  {
    label: 'Club projects',
    detail: 'Hardware prototypes, campus microgrids and field deployments',
    Glyph: LayersGlyph,
    path: '/projects',
  },
  {
    label: 'Quiz challenge',
    detail: 'Interactive assessment on clean tech and transition science',
    Glyph: TargetGlyph,
    path: '/quiz-challenge',
  },
  {
    label: 'About the club',
    detail: 'Committee roster, faculty advisor, charter and bibliography',
    Glyph: HorizonGlyph,
    path: '/about',
  },
  {
    label: 'Home & transition',
    detail: 'The historical turning point and the club entry ledger',
    Glyph: OrbitGlyph,
    path: '/home',
  },
];

/** Accession numbers are derived, not decorative: they encode the real count. */
const accessionNo = (level: number) => `GTC·${String(1874 + level * 3).padStart(4, '0')}`;

function RevisitOverlay({ level, onLeave }: RevisitOverlayProps) {
  const stage = level >= 3 ? 3 : level;
  const record = RECORD[stage] ?? RECORD[1];
  const sheetRef = useRef<HTMLDivElement | null>(null);

  /**
   * Under reduced motion the catalogue is open from the first frame: making the
   * reader wait 4.2s for a sealed panel is the timing, and the timing is the
   * thing being opted out of.
   */
  const [catalogueOpen, setCatalogueOpen] = useState(
    () => stage >= 3 && prefersReducedMotion(),
  );

  useEffect(() => {
    if (stage < 3 || prefersReducedMotion()) return;
    const timer = window.setTimeout(() => setCatalogueOpen(true), CATALOGUE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  /**
   * The sheet tilts a few degrees toward the pointer, the way a mounted sheet
   * does when you lift it under the light. Written to a custom property and
   * read by a transform, so the whole effect is one compositor-only change and
   * React never re-renders on pointer move.
   */
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        sheet.style.setProperty('--lift-x', `${(-y * 3.2).toFixed(2)}deg`);
        sheet.style.setProperty('--lift-y', `${(x * 4).toFixed(2)}deg`);
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const leave = (
    <button type="button" className={styles.action} onClick={() => onLeave('/home')}>
      <span className={styles.actionLabel}>Return to the vault</span>
      <span className={styles.actionIcon} aria-hidden="true">
        <ArrowGlyph />
      </span>
    </button>
  );

  return (
    <div className={`${styles.vault} ${styles[`stage${stage}`]}`}>
      {/* Vault ground: worked tonal depth, not a gradient wash. Three inert
          layers — the cold fall of light, the frost bloom, and the grain. */}
      <span className={styles.coldLight} aria-hidden="true" />
      <span className={styles.frost} aria-hidden="true" />
      <span className={styles.grain} aria-hidden="true" />

      <main className={styles.bench}>
        {/* ---- The sheet ---- */}
        <article className={styles.sheet} ref={sheetRef}>
          <header className={styles.sheetHead}>
            <p className={styles.institution}>
              Green Tech Club <span className={styles.institutionSub}>· Herbarium of Energy</span>
            </p>
            <p className={styles.accession}>{accessionNo(stage)}</p>
          </header>

          {/* The specimen: the same city the intro descends through, pressed.
              Its five fills are re-inked from this module's tokens. */}
          <div className={styles.mount}>
            <span className={`${styles.strap} ${styles.strapTop}`} aria-hidden="true" />
            <span className={`${styles.strap} ${styles.strapLow}`} aria-hidden="true" />
            <div className={styles.specimen}>
              <IndustrialSilhouette variant="specimen" />
            </div>
            <span className={styles.scaleBar} aria-hidden="true">
              <i /><i /><i /><i /><i />
            </span>
          </div>

          {/* The stamp. Rubber-cut caps, violet aniline, pressed on arrival. */}
          <span className={styles.stamp} aria-hidden="true">
            <span className={styles.stampInk}>{record.stamp}</span>
          </span>

          {/* The determination label: typed, bottom-right, where it always is. */}
          <footer className={styles.determination}>
            <p className={styles.detTitle}>Determination</p>
            <h1 className={styles.detName}>
              {record.lines.map((line, i) => (
                <span key={line} className={i === record.lines.length - 1 ? styles.detLast : undefined}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={styles.detMeta}>
              Coll. the visitor · returns recorded: {level}
            </p>
          </footer>
        </article>

        {/* ---- Annotation slips: one per return, newest on top ---- */}
        <ul className={styles.slips}>
          {record.annotations.map((a, i) => (
            <li
              key={a.hand}
              className={`${styles.slip} ${a.determined ? styles.slipLive : ''}`}
              style={{ animationDelay: `${420 + i * 260}ms` }}
            >
              <span className={styles.slipHand}>{a.hand}</span>
              <span className={styles.slipNote}>{a.note}</span>
            </li>
          ))}
        </ul>

        {/* Always reachable, so the reader is never held here waiting. */}
        <div className={styles.actions}>{leave}</div>
      </main>

      {/* ---- Level 3: the vault catalogue ---- */}
      {stage === 3 && (
        <section
          className={catalogueOpen ? `${styles.catalogue} ${styles.catalogueOpen}` : styles.catalogue}
          aria-hidden={!catalogueOpen}
          aria-label="Vault catalogue"
        >
          <p className={styles.catalogueHead}>
            <span>Vault catalogue</span>
            <span className={styles.catalogueCount}>
              {DRAWERS.filter((d) => d.path).length} of {DRAWERS.length} accessioned
            </span>
          </p>

          <ul className={styles.drawers}>
            {DRAWERS.map((drawer, index) => {
              const { Glyph } = drawer;
              const body = (
                <>
                  <span className={styles.drawerNo}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.drawerGlyph} aria-hidden="true">
                    <Glyph />
                  </span>
                  <span className={styles.drawerText}>
                    <span className={styles.drawerLabel}>{drawer.label}</span>
                    <span className={styles.drawerDetail}>{drawer.detail}</span>
                  </span>
                </>
              );

              if (!drawer.path) {
                return (
                  <li key={drawer.label} className={`${styles.drawer} ${styles.drawerSealed}`}>
                    {body}
                    <span className={styles.drawerState}>Not yet accessioned</span>
                  </li>
                );
              }

              return (
                <li key={drawer.label}>
                  <button
                    type="button"
                    className={styles.drawer}
                    style={{ transitionDelay: `${index * 55}ms` }}
                    onClick={() => onLeave(drawer.path)}
                  >
                    {body}
                    <span className={styles.drawerPull} aria-hidden="true">
                      <ArrowGlyph />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

export default RevisitOverlay;
