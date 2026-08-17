import HudHeader from '../../components/HudHeader/HudHeader';
import SocialEmbed from '../../components/SocialEmbed/SocialEmbed';
import {
  Action,
  Bench,
  Chapter,
  Instrument,
  Prose,
  Settle,
  Sheet,
  SheetHead,
  Stamped,
  Typed,
} from '../../components/accession/Accession';
import { useSettle } from '../../components/accession/useSettle';
import { ExternalGlyph } from '../../components/icons';
import { advisor, committee, references } from '../../data/ClubInfo';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useCurrentChapter } from '../../hooks/useCurrentChapter';
import styles from './AboutPage.module.css';

/**
 * ABOUT — the record of who keeps the record.
 *
 * Of every route on this site, this is the one where the archival grammar is
 * not a costume. A committee roster IS an accession list; a bibliography IS an
 * index; a faculty advisor IS the hand that countersigns a determination. So
 * the page is composed as the institution's own front matter, and the ladder
 * climbs firstlight -> daylight -> sky -> living exactly as Explore and
 * Projects do, which is what makes the interior read as one building.
 *
 * The old page had the right instinct — it had already refused cards for the
 * roster and the bibliography — but it drew its own dawn, its own grain and
 * its own header bar, and it stated three hierarchies (kicker, plate, core)
 * where one rule and a column head do the work. All of that is now the
 * chapter's, and the page declares only what is specific to it.
 *
 * Two things here are fixes rather than redesign, and both were the same
 * defect: a row that promised a destination and had none. Every reference
 * carries a URL in the data and rendered as an inert div with an external
 * arrow beside it; it is now the link the arrow was advertising.
 */
function AboutPage() {
  const pageRef = useSettle<HTMLElement>();
  const navStop = useCurrentChapter();

  /* The stop the page opens on, so an overscroll bounce shows the room rather
     than the app's dark default. */
  useBodyBackground('#e9dfd0');

  return (
    <main ref={pageRef} className={styles.page} data-nav-stop={navStop ?? undefined}>
      <HudHeader />

      {/* ==================================================================
          I. THE MASTHEAD. A title page, so it owns the viewport.
          ================================================================== */}
      <Chapter stop="firstlight" opening aria-label="Green Tech Club" className={styles.open}>
        <Bench className={styles.openStack}>
          {/* Everything in the first viewport enters on mount: the reveal
              band stops short of the fold, so an observer never reaches the
              actions at the bottom of an opening screen. */}
          <Settle index={1} onMount>
            <Instrument ruled>Green Tech Club · Universiti Tunku Abdul Rahman</Instrument>
            <Stamped as="h1" scale="display" className={styles.title}>
              Who keeps this record
            </Stamped>
          </Settle>

          <Settle index={2} onMount>
            <Typed
              lines={[
                'A student club that builds, tests and explains renewable energy.',
                ['Every figure on this site traces back to a name on this page.', true],
              ]}
            />
          </Settle>

          <Settle index={3} onMount className={styles.openProse}>
            <Prose>
              We are not a lecture series and we are not a pressure group. We are a room
              with equipment in it, a standing invitation, and a habit of finishing
              things. What follows is what we are for, who is accountable for it, and
              where the numbers came from.
            </Prose>
          </Settle>

          <Settle index={4} onMount className={styles.openActions}>
            <Action to="/contact">Get in touch</Action>
            <Action href="#references" ghost>
              Our sources
            </Action>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          II. THE CHARTER. Two statements, two ruled columns. The old page
          put each in a plate holding a core holding a kicker; a column head
          and a hairline group them at no cost in containers.
          ================================================================== */}
      <Chapter
        stop="firstlight"
        to="daylight"
        aria-labelledby="charter-heading"
        className={styles.charterChapter}
      >
        <Bench className={styles.stack}>
          <Settle index={1}>
            <Stamped as="h2" id="charter-heading" scale="section">
              What we are here for
            </Stamped>
          </Settle>

          <Settle index={2} className={styles.charter}>
            <section className={styles.charterColumn}>
              <Instrument ruled>Mission</Instrument>
              <Prose>
                Make the energy transition legible. We take the systems that will run the
                next century apart in public, explain what each one actually does, and
                stay honest about where each one strains.
              </Prose>
            </section>

            <section className={styles.charterColumn}>
              <Instrument ruled>Vision</Instrument>
              <Prose>
                A campus where every graduate can read an energy system and argue with
                it, and a grid they are equipped to help rebuild.
              </Prose>
            </section>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          III. THE COMMITTEE. A filed run, numbered, with the hairline as the
          only separator — and one paper object, because the advisor is the
          hand outside the club that reads what the club publishes.
          ================================================================== */}
      <Chapter
        stop="daylight"
        from="firstlight"
        to="sky"
        aria-labelledby="committee-heading"
      >
        <Bench className={styles.stack}>
          <Settle index={1} className={styles.sectionHead}>
            <Stamped as="h2" id="committee-heading" scale="section">
              The committee
            </Stamped>
            <Instrument>
              {String(committee.length).padStart(2, '0')} members · session in progress
            </Instrument>
          </Settle>

          <Settle index={2}>
            <ol className={styles.roster}>
              {committee.map((member, position) => (
                <li key={member.role} className={styles.rosterRow}>
                  <span className={styles.rosterNo}>{String(position + 1).padStart(2, '0')}</span>
                  <span className={styles.rosterName}>{member.name}</span>
                  <span className={styles.rosterRole}>{member.role}</span>
                  <span className={styles.rosterFocus}>{member.focus}</span>
                </li>
              ))}
            </ol>
          </Settle>

          <Settle index={3} className={styles.advisorRow}>
            <Sheet live className={styles.advisor}>
              <SheetHead of={advisor.title} no="ADV·01" />
              <Stamped as="p" scale="plate" className={styles.advisorName}>
                {advisor.name}
              </Stamped>
              <Instrument onObject className={styles.advisorDept}>
                {advisor.department}
              </Instrument>
              <Prose onObject>{advisor.note}</Prose>
            </Sheet>

            <div className={styles.advisorAside}>
              <Instrument ruled>Standing</Instrument>
              <Prose>
                The committee turns over with the academic year. The advisor does not,
                which is why the technical claims on this site have a reader who was not
                involved in making them.
              </Prose>
            </div>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          IV. THE SOURCES. An index, and the feed of the body most of the
          index draws on — placed together because they are the same claim.
          ================================================================== */}
      <Chapter
        stop="sky"
        from="daylight"
        to="living"
        id="references"
        aria-labelledby="references-heading"
        className={styles.sources}
      >
        <Bench className={styles.stack}>
          <Settle index={1} className={styles.sectionHead}>
            <Stamped as="h2" id="references-heading" scale="section">
              References
            </Stamped>
            <Instrument>Cited at the organisation level</Instrument>
          </Settle>

          <Settle index={2}>
            <ol className={styles.index}>
              {references.map((reference, position) => (
                <li key={reference.abbreviation}>
                  {/* The arrow on this row always claimed it went somewhere.
                      The URL was in the data the whole time; the row is now
                      the link it was advertising. */}
                  <a
                    className={styles.indexRow}
                    href={reference.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className={styles.indexNo}>
                      {String(position + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.indexBody}>
                      <span className={styles.indexName}>
                        {reference.organisation}
                        <span className={styles.indexAbbr}>{reference.abbreviation}</span>
                      </span>
                      <span className={styles.indexScope}>{reference.scope}</span>
                    </span>
                    <span className={styles.indexPull} aria-hidden="true">
                      <ExternalGlyph />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </Settle>

          <Settle index={3} className={styles.indexNote}>
            <Prose>
              Deliberately cited by organisation rather than by report title and year: a
              fabricated citation is worse than a general one. Where a specific figure
              comes from a specific report, that report is named beside the figure.
            </Prose>
          </Settle>

          {/* Consent-gated feed (FR-SOC-005). It sits with the bibliography
              because it is drawn from the IEA — the first entry in it. */}
          <Settle index={4} className={styles.feed}>
            <Instrument ruled>Live from the first entry</Instrument>
            <SocialEmbed />
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          V. THE CLOSE. The arc lands, and the only thing left is the way in.
          ================================================================== */}
      <Chapter stop="living" from="sky" aria-label="Join the club" className={styles.close}>
        <Bench className={styles.stack}>
          <Settle index={1}>
            <Typed
              lines={[
                'None of this is a spectator record.',
                ['It is written by whoever turns up.', true],
              ]}
              className={styles.closeStatement}
            />
          </Settle>

          <Settle index={2} className={styles.closeActions}>
            <Action to="/contact">Join the club</Action>
            <Action to="/projects" ghost>
              See what we built
            </Action>
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

export default AboutPage;
