import { useEffect, useRef, useState } from 'react';
import { useNavigationType } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import HudHeader from '../../components/HudHeader/HudHeader';
import {
  Action,
  Bench,
  Chapter,
  Column,
  Drawer,
  Drawers,
  Figure,
  Figures,
  Instrument,
  Prose,
  Settle,
  Sheet,
  SheetHead,
  Slip,
  Slips,
  Stamp,
  Stamped,
  Typed,
} from '../../components/accession/Accession';
import IndustrialSilhouette from '../../components/SceneIntro/IndustrialSilhouette';
import {
  BiomassGlyph,
  GeoGlyph,
  HydroGlyph,
  LayersGlyph,
  OrbitGlyph,
  ReplayGlyph,
  SolarGlyph,
  UsersGlyph,
  WindGlyph,
} from '../../components/icons';
import { useSettle } from '../../components/accession/useSettle';
import { getSettledPathname } from '../../hooks/routeHistory';
import { useCurrentChapter } from '../../hooks/useCurrentChapter';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useCarbonFigures } from '../../hooks/useCarbonFigures';
import styles from './HomePage.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Must match `.arrival`'s animation-duration in the stylesheet. */
const ARRIVAL_MS = 900;

/** Last entry of a series, or undefined for an empty one. */
const latest = <T,>(series: T[]): T | undefined => series[series.length - 1];

/**
 * HOME — the spine.
 *
 * The landing cinematic descends into the smoke and the dawn walks back out
 * of it. This page is what the reader walks out INTO, and it carries the whole
 * argument in one scroll rather than deferring it to a menu of pages: the
 * scale of the system, what it has cost, the turn, what replaces it, who is
 * building it, and how to join.
 *
 * The chapters are stops on the ladder (styles/chapters.css), and the page
 * gets darker before it gets lighter. That is deliberate and it is the whole
 * shape: the reader arrives in morning light, is taken back down into the
 * airshed and the soot to be shown what still runs the world, and is brought
 * up through sunrise into daylight. A page that only ever brightened would
 * have no argument in it.
 *
 * Density climbs with the ladder. The hero is one sentence; by the third
 * chapter the page is running live World Bank figures and a comparative
 * electricity mix. The reader moves from feeling, to understanding, to acting.
 */
function HomePage() {
  const navigationType = useNavigationType();
  const { snapshot, source } = useCarbonFigures();
  const [activeMixSource, setActiveMixSource] = useState<{
    country?: string;
    type: 'fossil' | 'nuclear' | 'renewables' | 'other';
  } | null>(null);

  /**
   * The dawn hands over mid-dissolve on a full-screen wash of this page's own
   * surface colour, so this page has to come up out of that colour rather than
   * cut in under it. Gated, because it is only a handover when the reader
   * actually walked here: PUSH rules out a direct load, a refresh and the root
   * guard's redirect; the previous route being "/" rules out an ordinary nav
   * click, which is also a PUSH but has nothing to dissolve from.
   */
  const [arriving, setArriving] = useState(
    () =>
      navigationType === 'PUSH' &&
      getSettledPathname() === '/' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  /* Reveals are deferred until the wash has lifted — above-the-fold content
     would otherwise resolve behind it and land already-finished. */
  const pageRef = useSettle<HTMLElement>(!arriving);

  useEffect(() => {
    if (!arriving) return;
    const timer = window.setTimeout(() => setArriving(false), ARRIVAL_MS);
    return () => window.clearTimeout(timer);
  }, [arriving]);

  useBodyBackground('#0b0f0e');

  /* Which stop the fixed header is currently floating over. */
  const navStop = useCurrentChapter();

  /* ── The turn ──────────────────────────────────────────────────────────
     The one scrubbed moment on the page. The sun is not decoration here: it
     is the hinge the whole site turns on, so it is the only element whose
     position the reader controls directly.

     matchMedia rather than a breakpoint check, so the desktop timeline is
     never even built on a phone: the horizontal travel and the long scrub
     that read as cinematic on a wide screen read as jitter on a small one,
     where the same beat is better served by a single settle. */
  const turnRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          wide: '(min-width: 60rem) and (prefers-reduced-motion: no-preference)',
          narrow: '(max-width: 59.99rem) and (prefers-reduced-motion: no-preference)',
          still: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { wide, narrow, still } = context.conditions as Record<string, boolean>;

          if (still) {
            gsap.set(`.${styles.sun}`, { yPercent: -14, scale: 1, opacity: 1 });
            gsap.set(`.${styles.rays}`, { opacity: 0.7, scale: 1, transformOrigin: '200px 200px' });
            return;
          }

          if (wide) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: turnRef.current,
                  start: 'top top',
                  end: '+=100%',
                  pin: true,
                  scrub: 1,
                  anticipatePin: 1,
                },
              })
              .fromTo(
                `.${styles.sun}`,
                { yPercent: 70, scale: 0.78, opacity: 0.15 },
                /* Negative is up. The disc's rest position clears the horizon
                   rule — a sun that stops under its own horizon reads as
                   setting, which is the opposite of this chapter — while
                   still sitting well below the headline, because the disc is
                   a solid field and the line is all this chapter says. */
                { yPercent: -14, scale: 1, opacity: 1, ease: 'none' },
                0,
              )
              .fromTo(
                `.${styles.rays}`,
                { opacity: 0, scale: 0.6, transformOrigin: '200px 200px' },
                { opacity: 0.8, scale: 1, transformOrigin: '200px 200px', ease: 'none' },
                0.1,
              )
              .fromTo(`.${styles.turnGlow}`, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0);
          }

          if (narrow) {
            /* One settle, triggered once. No scrub: on a phone the reader's
               thumb is the scrub wheel and a scrubbed sun fights it. */
            gsap.fromTo(
              `.${styles.sunWrap}`,
              { yPercent: 18, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: { trigger: turnRef.current, start: 'top 72%' },
              },
            );
            gsap.set(`.${styles.rays}`, { opacity: 0.55, scale: 1, transformOrigin: '200px 200px' });
          }
        },
      );

      return () => media.revert();
    },
    { scope: turnRef },
  );

  const mixYear = snapshot.mixYear;
  /**
   * What the reader is told about where a figure came from. `cache` is an
   * implementation detail of this site, not a provenance — a cached World
   * Bank figure IS a World Bank figure. Only the bundled fallback is a
   * different claim, so only it changes the credit.
   */
  const provenance = source === 'fallback' ? 'World Bank · bundled' : 'World Bank';

  return (
    /**
     * `data-nav-stop` re-points HudHeader's `--hud-*` tokens as the ladder
     * climbs. The header is the same static component every other interior
     * route mounts, with the same links and the same design — it only needs
     * its ink re-pointed here, because this is the one page whose ground goes
     * from near-black to daylight underneath a fixed element.
     */
    <main ref={pageRef} className={styles.page} data-nav-stop={navStop ?? undefined}>
      <HudHeader />

      {/* Picks up the dawn's last frame and lifts off it. Unmounted the moment
          it is transparent, so it never sits over the page as an inert layer. */}
      {arriving && <div className={styles.arrival} aria-hidden="true" />}

      {/* ==================================================================
          HERO — the first light. Kept: this is the site's emotional hinge
          and it already works. Re-set in the interior's own lettering.
          ================================================================== */}
      <header className={styles.hero} data-nav="image">
        <img className={styles.heroPhoto} src="/assets/forest-hero.jpeg" alt="" decoding="async" />
        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={styles.heroInner}>
          {/* Mount entrances, not scroll reveals: this is the first viewport,
              and the actions sit low enough in it that the observer's band
              never reaches them. */}
          <Settle index={1} onMount>
            <Stamped as="h1" scale="display" className={styles.heroTitle}>
              You came through the smoke
            </Stamped>
          </Settle>

          <Settle index={2} onMount>
            <p className={styles.heroLede}>
              Behind you is the century that burned everything it could find. Ahead is the
              workshop of what replaces it — running on sunlight, moving air, falling water,
              living matter, and the heat under your feet.
            </p>
          </Settle>

          <Settle index={3} onMount>
            <div className={styles.heroActions}>
              <Action to="/explore">Start exploring</Action>
              <Action to="/?replay=true" ghost icon={<ReplayGlyph />}>
                Replay the descent
              </Action>
            </div>
          </Settle>
        </div>

        <span className={styles.heroFade} aria-hidden="true" />
      </header>

      {/* ==================================================================
          I. THE WORLD RUNS ON ENERGY — the airshed, seen in daylight.
          Live figures, cited. This is where the page stops being a hero.
          ================================================================== */}
      <Chapter
        stop="haze"
        to="soot"
        aria-label="The world runs on energy"
      >
        <Bench>
          <div className={styles.statement}>
            <Settle index={1}>
              <Typed
                lines={[
                  'Every light you switch on has a story behind it.',
                  ['Most of that story is still on fire.', true],
                ]}
              />
            </Settle>

            <Settle index={2} className={styles.statementAside}>
              <Prose>
                Electricity does not arrive from nowhere. It is burned, split, spun or
                caught somewhere upstream, and the choice of which one decides what the
                air over a city is made of. These are the numbers the club works from —
                fetched live, and cited where they came from.
              </Prose>
            </Settle>
          </div>

          <Settle index={3}>
            <Figures row className={styles.figureRow}>
              <Figure
                value={snapshot.annualTotalGt.toFixed(1)}
                unit="Gt"
                source={`${provenance} · ${snapshot.dataYear}`}
              >
                Carbon dioxide released worldwide in a single year, across every
                reporting sector.
              </Figure>

              <Figure
                value={(latest(snapshot.perCapitaTrend)?.value ?? 0).toFixed(1)}
                unit="t / person"
                source={`${provenance} · ${latest(snapshot.perCapitaTrend)?.year ?? snapshot.dataYear}`}
              >
                The world average, per person, per year. A figure that hides how
                unevenly it is actually distributed.
              </Figure>

              <Figure
                value={String(snapshot.emitters.length)}
                unit="economies"
                source={`${provenance} · ${snapshot.emittersYear}`}
              >
                Tracked here by total output and by head — the two rankings
                disagree, and the disagreement is the argument.
              </Figure>
            </Figures>
          </Settle>

          {/* The comparative strip. Not a chart for decoration: five real
              national grids side by side is the fastest proof that the mix is
              a choice rather than a law of physics. */}
          <Settle index={4} className={styles.mixBlock}>
            <Instrument ruled>Electricity mix · {mixYear}</Instrument>

            <ul className={styles.mix}>
              {snapshot.energyMix.map((row) => {
                const otherPercent =
                  row.other > 0
                    ? row.other
                    : Math.max(0, 100 - (row.fossil + row.nuclear + row.renewables));

                const currentType =
                  (activeMixSource?.country === row.country || !activeMixSource?.country) &&
                  activeMixSource?.type
                    ? activeMixSource.type
                    : 'fossil';

                const currentValue = (
                  currentType === 'other' ? otherPercent : row[currentType]
                ).toFixed(1);

                return (
                  <li key={row.country} className={styles.mixRow}>
                    <span className={styles.mixCountry}>{row.country}</span>
                    <span
                      className={styles.mixBar}
                      role="group"
                      aria-label={`${row.country} electricity mix`}
                    >
                      <span
                        className={`${styles.mixSegment} ${styles.mixFossil} ${activeMixSource?.type && activeMixSource.type !== 'fossil' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixMuted : ''} ${activeMixSource?.type === 'fossil' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixActive : ''}`}
                        style={{ width: `${row.fossil}%` }}
                        title={`${row.country} · Fossil: ${row.fossil.toFixed(1)}%`}
                        onMouseEnter={() => setActiveMixSource({ country: row.country, type: 'fossil' })}
                        onMouseLeave={() => setActiveMixSource(null)}
                      />
                      <span
                        className={`${styles.mixSegment} ${styles.mixNuclear} ${activeMixSource?.type && activeMixSource.type !== 'nuclear' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixMuted : ''} ${activeMixSource?.type === 'nuclear' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixActive : ''}`}
                        style={{ width: `${row.nuclear}%` }}
                        title={`${row.country} · Nuclear: ${row.nuclear.toFixed(1)}%`}
                        onMouseEnter={() => setActiveMixSource({ country: row.country, type: 'nuclear' })}
                        onMouseLeave={() => setActiveMixSource(null)}
                      />
                      <span
                        className={`${styles.mixSegment} ${styles.mixRenew} ${activeMixSource?.type && activeMixSource.type !== 'renewables' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixMuted : ''} ${activeMixSource?.type === 'renewables' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixActive : ''}`}
                        style={{ width: `${row.renewables}%` }}
                        title={`${row.country} · Renewables: ${row.renewables.toFixed(1)}%`}
                        onMouseEnter={() => setActiveMixSource({ country: row.country, type: 'renewables' })}
                        onMouseLeave={() => setActiveMixSource(null)}
                      />
                      {otherPercent > 0 && (
                        <span
                          className={`${styles.mixSegment} ${styles.mixOther} ${activeMixSource?.type && activeMixSource.type !== 'other' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixMuted : ''} ${activeMixSource?.type === 'other' && (activeMixSource.country === row.country || !activeMixSource.country) ? styles.mixActive : ''}`}
                          style={{ width: `${otherPercent}%` }}
                          title={`${row.country} · Other: ${otherPercent.toFixed(1)}%`}
                          onMouseEnter={() => setActiveMixSource({ country: row.country, type: 'other' })}
                          onMouseLeave={() => setActiveMixSource(null)}
                        />
                      )}
                    </span>
                    <span className={styles.mixValue} data-figure>
                      <strong>{currentValue}%</strong> {currentType}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className={styles.mixKey}>
              <button
                type="button"
                className={`${styles.keyButton} ${activeMixSource?.type === 'fossil' && !activeMixSource.country ? styles.keyActive : ''}`}
                onMouseEnter={() => setActiveMixSource({ type: 'fossil' })}
                onMouseLeave={() => setActiveMixSource(null)}
                onClick={() => setActiveMixSource((prev) => (prev?.type === 'fossil' && !prev.country ? null : { type: 'fossil' }))}
              >
                <span className={styles.keyFossil} /> Fossil
              </button>
              <button
                type="button"
                className={`${styles.keyButton} ${activeMixSource?.type === 'nuclear' && !activeMixSource.country ? styles.keyActive : ''}`}
                onMouseEnter={() => setActiveMixSource({ type: 'nuclear' })}
                onMouseLeave={() => setActiveMixSource(null)}
                onClick={() => setActiveMixSource((prev) => (prev?.type === 'nuclear' && !prev.country ? null : { type: 'nuclear' }))}
              >
                <span className={styles.keyNuclear} /> Nuclear
              </button>
              <button
                type="button"
                className={`${styles.keyButton} ${activeMixSource?.type === 'renewables' && !activeMixSource.country ? styles.keyActive : ''}`}
                onMouseEnter={() => setActiveMixSource({ type: 'renewables' })}
                onMouseLeave={() => setActiveMixSource(null)}
                onClick={() => setActiveMixSource((prev) => (prev?.type === 'renewables' && !prev.country ? null : { type: 'renewables' }))}
              >
                <span className={styles.keyRenew} /> Renewables
              </button>
              <button
                type="button"
                className={`${styles.keyButton} ${activeMixSource?.type === 'other' && !activeMixSource.country ? styles.keyActive : ''}`}
                onMouseEnter={() => setActiveMixSource({ type: 'other' })}
                onMouseLeave={() => setActiveMixSource(null)}
                onClick={() => setActiveMixSource((prev) => (prev?.type === 'other' && !prev.country ? null : { type: 'other' }))}
              >
                <span className={styles.keyOther} /> Other
              </button>
              <span className={styles.keyNote}>
                Shares are of electricity generated. &lsquo;Other&rsquo; is a calculated fill (the unattributed remainder to 100%) rather than an individually reported source from the primary data.
              </span>
            </div>

            <div className={styles.blockAction}>
              <Action to="/dashboard">Open the live dashboard</Action>
            </div>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          II. THE COST OF PROGRESS — the darkest point of the page.
          An editorial split, and the one place the pressed specimen returns.
          ================================================================== */}
      <Chapter
        stop="soot"
        from="haze"
        to="thaw"
        aria-label="The cost of progress"
        className={styles.cost}
      >
        <Bench className={styles.costSplit}>
          <Settle index={1} className={styles.costScene}>
            <Sheet live className={styles.costSheet}>
              <SheetHead of="Green Tech Club · Herbarium of Energy" no="GTC·0891" />

              <div className={styles.specimen}>
                <IndustrialSilhouette variant="specimen" />
              </div>

              <Stamp pressed top="26%">
                Superseded
              </Stamp>

              <p className={styles.specimenLabel}>
                <strong>Coal, oil and gas.</strong> Collected across the industrial
                century. Pressed, catalogued, and no longer growing.
              </p>
            </Sheet>
          </Settle>

          <div className={styles.costText}>
            <Settle index={2}>
              <Stamped as="h2" scale="section">
                The cost of progress
              </Stamped>
            </Settle>

            <Settle index={3}>
              <Prose>
                Industrial progress changed our world, and it is worth being honest
                about how much of it we would not give back. Light after dark. Food
                that keeps. Medicine that travels. But every pipeline, refinery and
                pumpjack in that drawing is also a bill, and the bill was always
                being written somewhere the buyer could not see it.
              </Prose>
            </Settle>

            <Settle index={4}>
              <Typed
                lines={['We do not erase history.', ['We learn from it.', true]]}
                className={styles.costDetermination}
              />
            </Settle>

            <Settle index={5}>
              <Slips>
                <Slip hand="det. i">
                  The machinery worked. That was never the objection.
                </Slip>
                <Slip hand="det. ii">
                  The exhaust had nowhere to go but the shared air.
                </Slip>
                <Slip hand="det. iii">
                  Growth observed at the margins. Revise.
                </Slip>
              </Slips>
            </Settle>
          </div>
        </Bench>
      </Chapter>

      {/* ==================================================================
          III. THE TURN — the hinge. One line, one sun, no data.
          The page has been dense for two chapters and has earned the quiet.
          ================================================================== */}
      <Chapter
        stop="thaw"
        from="soot"
        to="firstlight"
        aria-label="Sunrise"
        className={styles.turn}
      >
        <div className={styles.turnScene} ref={turnRef}>
          <span className={styles.turnGlow} aria-hidden="true" />

          <span className={styles.sunWrap} aria-hidden="true">
            <svg className={styles.sun} viewBox="0 0 400 400" role="presentation">
              {/* Rays of three alternating lengths and weights, drawn from
                  outside the disc rather than through it. Twenty-four
                  identical spokes from dead centre is a clipart sunburst;
                  the irregularity is what makes it read as light. */}
              <g className={styles.rays}>
                {Array.from({ length: 24 }, (_, i) => {
                  const reach = [174, 148, 132][i % 3];
                  return (
                    <line
                      key={i}
                      x1="200"
                      y1={200 - 96}
                      x2="200"
                      y2={200 - reach}
                      stroke="currentColor"
                      strokeWidth={i % 3 === 0 ? 1.6 : 0.7}
                      strokeLinecap="round"
                      transform={`rotate(${i * 15} 200 200)`}
                    />
                  );
                })}
              </g>
              <circle cx="200" cy="200" r="86" fill="currentColor" />
            </svg>
          </span>

          <Column className={styles.turnCopy}>
            <Stamped as="h2" scale="display" className={styles.turnTitle}>
              From sunrise to clean electricity
            </Stamped>
          </Column>

          <span className={styles.horizon} aria-hidden="true" />
        </div>
      </Chapter>

      {/* ==================================================================
          IV. WHAT REPLACES IT — the five sources, as a filing run.
          Not six equal cards: a cabinet, opened one drawer at a time.
          ================================================================== */}
      <Chapter
        stop="firstlight"
        from="thaw"
        to="daylight"
        aria-label="What replaces it"
      >
        <Bench>
          <div className={styles.sourcesHead}>
            <Settle index={1}>
              <Stamped as="h2" scale="section">
                Five ways to make electricity without burning anything
              </Stamped>
            </Settle>
            <Settle index={2}>
              <Prose>
                None of them is a silver bullet, and any page that tells you otherwise
                is selling something. Each has a mechanism worth understanding, a place
                it already works today, and a limit it runs into. Open a drawer.
              </Prose>
            </Settle>
          </div>

          <Settle index={3}>
            <Drawers>
              <Drawer
                no="01"
                label="Solar"
                detail="Photons knock electrons loose in silicon. No moving parts, no fuel, no noise."
                Glyph={SolarGlyph}
                to="/explore"
              />
              <Drawer
                no="02"
                label="Wind"
                detail="Moving air turns a blade; the blade turns a generator. The oldest trick, rebuilt at scale."
                Glyph={WindGlyph}
                to="/explore"
              />
              <Drawer
                no="03"
                label="Hydro"
                detail="Water falls, and the fall is stored energy. Still the largest renewable source on the grid."
                Glyph={HydroGlyph}
                to="/explore"
              />
              <Drawer
                no="04"
                label="Biomass"
                detail="Carbon the plant took out of the air this decade, not the one it took out 300 million years ago."
                Glyph={BiomassGlyph}
                to="/explore"
              />
              <Drawer
                no="05"
                label="Geothermal"
                detail="The heat under your feet, tapped where the crust is thin enough to reach it."
                Glyph={GeoGlyph}
                to="/explore"
              />
            </Drawers>
          </Settle>

          <Settle index={4} className={styles.blockAction}>
            <Action to="/explore">Explore all five</Action>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          V. GREEN TECH CLUB — from understanding to doing.
          Three records, deliberately unequal: the club is not a card grid.
          ================================================================== */}
      <Chapter
        stop="daylight"
        from="firstlight"
        to="living"
        aria-label="Green Tech Club"
      >
        <Bench>
          <Settle index={1} className={styles.clubHead}>
            <Stamped as="h2" scale="section">
              Innovation begins with students
            </Stamped>
            <Prose>
              The club is not a lecture series. It is a room with equipment in it, a
              standing invitation, and a habit of finishing things. Three ways in.
            </Prose>
          </Settle>

          <div className={styles.records}>
            <Settle index={2} className={styles.recordLead}>
              <Sheet live>
                <SheetHead of="Working method" no="01" />
                <Stamped as="h3" scale="plate">
                  Research
                </Stamped>
                <Prose onObject>
                  Read the mechanism before the marketing. Members take one technology
                  apart a term — how it actually generates, what it costs, where the
                  published numbers come from — and write up what they find. Every
                  figure on this site is traceable to an organisation you can go and
                  check, which is a standard the club set for itself before it was a
                  requirement of anything.
                </Prose>

                <div className={styles.leadFigure}>
                  <Slips>
                    <Slip hand="method">
                      One technology, one term, taken apart to the mechanism.
                    </Slip>
                    <Slip hand="output">
                      A written finding, cited, published here.
                    </Slip>
                  </Slips>
                </div>

                <Stamp>Ongoing</Stamp>
              </Sheet>
            </Settle>

            <Settle index={3}>
              <Sheet>
                <SheetHead of="Working method" no="02" />
                <Stamped as="h3" scale="plate">
                  Community
                </Stamped>
                <Prose onObject>
                  Open to every faculty and every year. No background in energy
                  required — only the willingness to build something and see it
                  through.
                </Prose>
              </Sheet>
            </Settle>

            <Settle index={4}>
              <Sheet>
                <SheetHead of="Working method" no="03" />
                <Stamped as="h3" scale="plate">
                  Innovation
                </Stamped>
                <Prose onObject>
                  Ideas become prototypes, prototypes become evidence. Everything the
                  club builds is documented, including the parts that did not work.
                </Prose>
                <Stamp living>Living</Stamp>
              </Sheet>
            </Settle>
          </div>

          <Settle index={5} className={styles.clubActions}>
            <Action to="/projects">See what we built</Action>
            <Action to="/quiz-challenge" ghost>
              Test what stuck
            </Action>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          VI. JOIN — the close. The arc lands on the club's own paper.
          ================================================================== */}
      <Chapter
        stop="living"
        from="daylight"
        aria-label="Join the club"
        className={styles.closeChapter}
      >
        <Bench className={styles.close}>
          <Settle index={1}>
            <Typed
              lines={["The future isn't waiting.", ['Neither should we.', true]]}
              className={styles.closeStatement}
            />
          </Settle>

          <Settle index={2}>
            <Drawers className={styles.closeDrawers}>
              <Drawer
                no="01"
                label="Join the club"
                detail="Open to every faculty and every year. Come to a session and see the room."
                Glyph={OrbitGlyph}
                to="/contact"
              />
              <Drawer
                no="02"
                label="Who we are"
                detail="The committee, the advisor, and every source this site cites."
                Glyph={UsersGlyph}
                to="/about"
              />
              <Drawer
                no="03"
                label="Collaborate or sponsor"
                detail="Departments, student bodies and companies working on energy or hardware."
                Glyph={LayersGlyph}
                to="/contact"
              />
            </Drawers>
          </Settle>

          <footer className={styles.footer}>
            <Instrument>Green Tech Club · Herbarium of Energy</Instrument>
            <Instrument>Built for a grid that outlives us</Instrument>
          </footer>
        </Bench>
      </Chapter>
    </main>
  );
}

export default HomePage;
