import { useEffect, useState } from 'react';
import HudHeader from '../../components/HudHeader/HudHeader';
import {
  Action,
  Bench,
  Chapter,
  Instrument,
  Prose,
  Settle,
  Stamped,
  Typed,
} from '../../components/accession/Accession';
import {
  BiomassScene,
  GeothermalScene,
  HydroScene,
  SolarScene,
  WindScene,
} from '../../components/accession/SourceScenes';
import { useSettle } from '../../components/accession/useSettle';
import { energySources, type EnergySource } from '../../data/EnergySources';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useCurrentChapter } from '../../hooks/useCurrentChapter';
import styles from './ExplorePage.module.css';

/**
 * EXPLORE — the field guide.
 *
 * This is the site's hope chapter, and the counterweight to Home's pressed
 * specimen: five sources that are alive rather than accessioned, each opened
 * to its own plate. Where the vault holds what the fossil century left, this
 * holds what replaces it.
 *
 * The argument of the page is MECHANISM. A guide that illustrates solar with
 * a sun has told the reader nothing; every plate therefore draws the whole
 * chain from source to grid, and the drawing does the explaining that a
 * paragraph would only restate.
 *
 * The old page put every reading inside a card, inside a section card, with
 * the applications as rounded chips inside that — three levels of container
 * for a list of sentences. Nothing here is boxed. Grouping is a rule, a typed
 * column head, and space.
 */

type Stop = 'firstlight' | 'daylight' | 'sky' | 'living';

/**
 * Where each source stands on the ladder, and the drawing it opens to.
 *
 * The ground climbs monotonically across the page — sunrise to full daylight
 * to open sky to green — so the reader is walking further into the light with
 * every source, which is the same journey the site makes as a whole.
 *
 * Geothermal is the one section that overrides its stop's accent: its
 * mechanism is heat held in rock, and the ladder has no warm accent left by
 * the time the page reaches it.
 */
const PLATES: {
  id: string;
  stop: Stop;
  from?: Stop;
  Scene: () => JSX.Element;
  /** The one line the plate turns on. */
  determination: [string, string];
  caption: string;
  warmAccent?: boolean;
}[] = [
  {
    id: 'solar',
    stop: 'firstlight',
    Scene: SolarScene,
    determination: ['Light arrives whether we collect it or not.', 'Silicon is how we collect it.'],
    caption: 'Photovoltaic array · inverter · meter · grid',
  },
  {
    id: 'wind',
    stop: 'daylight',
    from: 'firstlight',
    Scene: WindScene,
    determination: ['The oldest machine we have.', 'Rebuilt at the scale of a nation.'],
    caption: 'Rotor · nacelle · tower · grid. Land beneath stays farmed.',
  },
  {
    id: 'hydroelectric',
    stop: 'sky',
    from: 'daylight',
    Scene: HydroScene,
    determination: ['Water that has fallen has already done the work.', 'The turbine only collects it.'],
    caption: 'Reservoir · head · penstock · turbine · generator',
  },
  {
    id: 'biomass',
    stop: 'sky',
    Scene: BiomassScene,
    determination: [
      'The carbon released went into the plant this decade,',
      'not three hundred million years ago.',
    ],
    caption: 'Growth · harvest · combustion · regrowth. A closed loop, if it is replanted.',
  },
  {
    id: 'geothermal',
    stop: 'living',
    from: 'sky',
    Scene: GeothermalScene,
    determination: ['The heat was already there.', 'We are drilling toward it, not making it.'],
    caption: 'Injection well · heat reservoir · production well · plant',
    warmAccent: true,
  },
];

/** Two-digit accession number for a source, by position. */
const plateNo = (index: number) => String(index + 1).padStart(2, '0');

/* ==========================================================================
   One plate.
   ========================================================================== */

function Plate({
  source,
  index,
  config,
}: {
  source: EnergySource;
  index: number;
  config: (typeof PLATES)[number];
}) {
  const { Scene } = config;

  return (
    <Chapter
      id={source.id}
      stop={config.stop}
      from={config.from}
      to={PLATES[index + 1]?.stop ?? 'living'}
      aria-label={source.name}
      className={config.warmAccent ? styles.warm : undefined}
    >
      <Bench>
        {/* ---- The plate: drawing beside its own reading ---- */}
        <div className={styles.plate}>
          <Settle index={1} className={styles.plateScene}>
            <Scene />
            <Instrument className={styles.sceneCaption}>{config.caption}</Instrument>
          </Settle>

          <div className={styles.plateCopy}>
            <Settle index={2}>
              <Instrument ruled>
                Source {plateNo(index)} of {String(energySources.length).padStart(2, '0')}
              </Instrument>
              <Stamped as="h2" scale="section" className={styles.plateName}>
                {source.name}
              </Stamped>
            </Settle>

            <Settle index={3}>
              <Typed lines={[config.determination[0], [config.determination[1], true]]} />
            </Settle>

            <Settle index={4}>
              <Prose>{source.description}</Prose>
            </Settle>

            <Settle index={5} className={styles.mechanism}>
              <Instrument ruled>How it works</Instrument>
              <Prose>{source.howItWorks}</Prose>
            </Settle>
          </div>
        </div>

        {/* ---- The ledger. Three ruled columns, no containers: the column
                head and the rules do the grouping that three cards used to. ---- */}
        <Settle index={6} className={styles.ledger}>
          <section className={styles.column}>
            <Instrument ruled>Advantages</Instrument>
            <ul className={styles.entries}>
              {source.advantages.map((entry) => (
                <li key={entry} className={styles.entry}>
                  <span className={`${styles.mark} ${styles.markUp}`} aria-hidden="true" />
                  {entry}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.column}>
            <Instrument ruled>Limitations</Instrument>
            <ul className={styles.entries}>
              {source.limitations.map((entry) => (
                <li key={entry} className={styles.entry}>
                  <span className={`${styles.mark} ${styles.markDown}`} aria-hidden="true" />
                  {entry}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.column}>
            <Instrument ruled>In the field</Instrument>
            <ul className={styles.entries}>
              {source.applications.map((entry) => (
                <li key={entry} className={styles.entry}>
                  <span className={styles.mark} aria-hidden="true" />
                  {entry}
                </li>
              ))}
            </ul>
          </section>
        </Settle>
      </Bench>
    </Chapter>
  );
}

/* ==========================================================================
   The page.
   ========================================================================== */

function ExplorePage() {
  const pageRef = useSettle<HTMLElement>();
  const navStop = useCurrentChapter();
  useBodyBackground('#e9dfd0');

  /**
   * Which plate the reader is standing in, for the index in the margin.
   * Its own observer rather than `useCurrentChapter`: that one measures a
   * 1px band at the header line, which is right for re-inking the header and
   * wrong for "which section am I reading" — a plate should read as current
   * while it occupies the screen, not only while its top edge is under the
   * nav.
   */
  const [current, setCurrent] = useState(energySources[0]?.id ?? '');

  useEffect(() => {
    const nodes = energySources
      .map((source) => document.getElementById(source.id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrent(visible.target.id);
      },
      { rootMargin: '-25% 0px -45% 0px', threshold: [0.05, 0.3, 0.6] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={pageRef} className={styles.page} data-nav-stop={navStop ?? undefined}>
      <HudHeader />

      {/* ==================================================================
          Opening. One statement, and the index of what follows.
          ================================================================== */}
      <Chapter stop="firstlight" to="firstlight" aria-label="The field guide" className={styles.open}>
        <Bench className={styles.openStack}>
          <Settle index={1} onMount>
            <Instrument ruled>Green Tech Club · Herbarium of Energy</Instrument>
            <Stamped as="h1" scale="display" className={styles.title}>
              Five ways to make electricity without burning anything
            </Stamped>
          </Settle>

          <Settle index={2} onMount>
            <Typed
              lines={[
                'Every one of these was a curiosity within living memory.',
                ['Four of the five now outbid coal on price.', true],
              ]}
            />
          </Settle>

          <Settle index={3} onMount className={styles.openProse}>
            <Prose>
              None of them is a silver bullet, and any page telling you otherwise is
              selling something. Each plate below opens to the mechanism — the actual
              chain from source to grid — then what it is good at, where it runs into
              a limit, and where it already works today.
            </Prose>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          The index. Sticky in the margin on a wide screen, a strip on a
          narrow one — the same information, composed twice.
          ================================================================== */}
      <nav className={styles.index} aria-label="Sources">
        <p className={styles.indexHead}>Plates</p>
        <ul className={styles.indexList}>
          {energySources.map((source, i) => (
            <li key={source.id}>
              <a
                href={`#${source.id}`}
                className={
                  current === source.id ? `${styles.indexLink} ${styles.indexCurrent}` : styles.indexLink
                }
                aria-current={current === source.id ? 'true' : undefined}
              >
                <span className={styles.indexNo}>{plateNo(i)}</span>
                <span className={styles.indexName}>{source.name.replace(/ (Energy|Power)$/, '')}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {energySources.map((source, index) => {
        const config = PLATES.find((plate) => plate.id === source.id);
        if (!config) return null;
        return <Plate key={source.id} source={source} index={index} config={config} />;
      })}

      {/* ==================================================================
          Close.
          ================================================================== */}
      <Chapter stop="living" aria-label="Next" className={styles.close}>
        <Bench>
          <Settle index={1}>
            <Typed
              lines={['Five mechanisms, no magic.', ['The hard part was never the physics.', true]]}
              className={styles.closeStatement}
            />
          </Settle>

          <Settle index={2} className={styles.closeActions}>
            <Action to="/dashboard">See what the grid actually runs on</Action>
            <Action to="/quiz-challenge" ghost>
              Test what stuck
            </Action>
          </Settle>
        </Bench>
      </Chapter>
    </main>
  );
}

export default ExplorePage;
