import { Link } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import SocialEmbed from '../../components/SocialEmbed/SocialEmbed';
import {
  ArrowGlyph,
  ExternalGlyph,
  UsersGlyph,
} from '../../components/icons';
import {
  advisor,
  committee,
  references,
} from '../../data/ClubInfo';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useReveal } from '../../hooks/useReveal';
import styles from './AboutPage.module.css';

/**
 * About / References — "Join the Movement".
 *
 * Shares the interior token layer, type stack and double-bezel enclosures with
 * the Explore and Home pages. Contact and support have moved to /contact.
 */
function AboutPage() {
  const pageRef = useReveal<HTMLElement>(styles.revealed);
  const navHidden = useHideOnScroll(140);

  useBodyBackground('#f7f8fa');

  return (
    <main ref={pageRef} className={styles.page}>
      <div className={styles.dawn} aria-hidden="true">
        <span className={styles.bloom} />
      </div>
      <div className={styles.grain} aria-hidden="true" />

      <div
        className={navHidden ? `${styles.headerBar} ${styles.headerBarHidden}` : styles.headerBar}
        data-hidden={navHidden || undefined}
      >
        <HudHeader variant="static" />
      </div>

      <div className={styles.container}>
        {/* ---- Masthead ---- */}
        <header className={styles.hero}>
          <h1 className={styles.heroTitle} data-reveal data-reveal-index="1">
            Join the
            <span className={styles.heroAccent}> movement.</span>
          </h1>
          <p className={styles.heroLede} data-reveal data-reveal-index="2">
            We are a student club at UTAR building, testing and explaining renewable energy. This
            page is who we are, how to reach us, and where our numbers come from.
          </p>
          <div className={styles.heroActions} data-reveal data-reveal-index="3">
            <Link to="/contact" className={styles.cta}>
              <span className={styles.ctaLabel}>Get in touch</span>
              <span className={styles.ctaIcon} aria-hidden="true">
                <ArrowGlyph />
              </span>
            </Link>
            <a href="#references" className={styles.ctaGhost}>
              <span className={styles.ctaLabel}>Our sources</span>
            </a>
          </div>
        </header>

        {/* ---- Mission and vision: two plates, vertically offset ---- */}
        <section className={styles.section} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.sectionTitle} data-reveal data-reveal-index="0">
            What we are here for
          </h2>

          <div className={styles.plates}>
            <article className={`${styles.plate} ${styles.plateMission}`} data-reveal data-reveal-index="1">
              <div className={styles.plateCore}>
                <span className={styles.plateKicker}>Mission</span>
                <p className={styles.plateBody}>
                  Make the energy transition legible. We take the systems that will run the next
                  century apart in public, explain what each one actually does, and stay honest
                  about where each one strains.
                </p>
              </div>
            </article>

            <article className={`${styles.plate} ${styles.plateVision}`} data-reveal data-reveal-index="2">
              <div className={styles.plateCore}>
                <span className={styles.plateKicker}>Vision</span>
                <p className={styles.plateBody}>
                  A campus where every graduate can read an energy system and argue with it, and a
                  grid they are equipped to help rebuild.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ---- Committee: hairline roster rows, not cards ---- */}
        <section className={styles.section} aria-labelledby="committee-heading">
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 id="committee-heading" className={styles.sectionTitle}>
              The committee
            </h2>
            <span className={styles.sectionMeta}>
              <UsersGlyph />
              {committee.length} members
            </span>
          </div>

          <ul className={styles.roster} data-reveal data-reveal-index="1">
            {committee.map((member) => (
              <li key={member.role} className={styles.rosterRow}>
                <span className={styles.rosterRole}>{member.role}</span>
                <span className={styles.rosterName}>{member.name}</span>
                <span className={styles.rosterFocus}>{member.focus}</span>
              </li>
            ))}
          </ul>

          <article className={styles.advisor} data-reveal data-reveal-index="2">
            <div className={styles.advisorCore}>
              <span className={styles.plateKicker}>{advisor.title}</span>
              <p className={styles.advisorName}>{advisor.name}</p>
              <p className={styles.advisorDept}>{advisor.department}</p>
              <p className={styles.plateBody}>{advisor.note}</p>
            </div>
          </article>
        </section>

        {/* ---- References: a numbered index, not cards ---- */}
        <section className={styles.section} id="references" aria-labelledby="references-heading">
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 id="references-heading" className={styles.sectionTitle}>
              References
            </h2>
            <span className={styles.sectionMeta}>Sources used across this site</span>
          </div>

          <ol className={styles.index} data-reveal data-reveal-index="1">
            {references.map((reference, position) => (
              <li key={reference.abbreviation}>
                <div className={styles.indexRow}>
                  <span className={styles.indexNumber}>
                    {String(position + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.indexBody}>
                    <span className={styles.indexName}>
                      {reference.organisation}
                      <span className={styles.indexAbbr}>{reference.abbreviation}</span>
                    </span>
                    <span className={styles.indexScope}>{reference.scope}</span>
                  </span>
                  <span className={styles.indexArrow} aria-hidden="true">
                    <ExternalGlyph />
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <p className={styles.indexNote} data-reveal data-reveal-index="2">
            Cited at the organisation level. Specific reports are named inline wherever a figure
            comes from one.
          </p>
        </section>

        {/* Embedded social feed, gated on consent (FR-SOC-005). Placed with the
            references because it is sourced from the same body the citations
            above draw on. */}
        <section className={styles.section} aria-labelledby="feed-heading">
          <h2 id="feed-heading" className={styles.srOnlyHeading}>
            Live social feed
          </h2>
          <div data-reveal data-reveal-index="1">
            <SocialEmbed />
          </div>
        </section>

        <footer className={styles.footer} data-reveal data-reveal-index="0">
          <p>Green Tech Club</p>
          <p>Built for a grid that outlives us</p>
        </footer>
      </div>
    </main>
  );
}

export default AboutPage;
