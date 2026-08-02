import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import {
  ArrowGlyph,
  ExternalGlyph,
  MailGlyph,
  OrbitGlyph,
  PinGlyph,
  UsersGlyph,
} from '../../components/icons';
import {
  advisor,
  channels,
  committee,
  location as clubLocation,
  references,
  supportRoutes,
} from '../../data/ClubInfo';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useReveal } from '../../hooks/useReveal';
import styles from './AboutPage.module.css';

const CONTACT_ADDRESS = channels.find((channel) => channel.id === 'email')?.value ?? '';

/**
 * About / Contact / References — "Join the Movement".
 *
 * Shares the interior token layer, type stack and double-bezel enclosures with
 * the Explore and Home pages. The layout deliberately changes family section by
 * section rather than repeating one archetype down the page: editorial masthead,
 * then offset plates, then a hairline roster, then a plate holding the form,
 * then asymmetric support cards, then a numbered citation index.
 */
function AboutPage() {
  const pageRef = useReveal<HTMLElement>(styles.revealed);
  const navHidden = useHideOnScroll(140);
  const [formError, setFormError] = useState<string | null>(null);
  const { hash, key: locationKey } = useLocation();

  useBodyBackground('#f7f8fa');

  /**
   * React Router does not act on hash fragments, so arriving at /about#contact
   * from the nav would leave the reader at the top of the page. Sections carry
   * scroll-margin-top, so scrollIntoView lands clear of the floating nav.
   *
   * `key` is in the dependencies alongside `hash`: it changes on every
   * navigation, including one to the URL already showing. Without it, clicking
   * "Contact Us" while sitting on /about#contact would be inert, because the
   * hash never changed.
   */
  useEffect(() => {
    if (!hash) {
      return;
    }
    const target = document.querySelector(hash);
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

    // Two frames: the first lets React commit, the second lets layout settle
    // after the entry transitions, so the scroll target has stopped moving.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => target.scrollIntoView({ behavior, block: 'start' }));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [hash, locationKey]);

  /**
   * There is no backend behind this site, so the form hands off to the
   * reader's mail client with the message prefilled rather than showing a
   * success state it cannot honour. Swap this for a POST when an endpoint
   * exists; the markup and validation stay as they are.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (!name || !email || !message) {
      setFormError('Please fill in your name, email and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('That email address does not look right.');
      return;
    }

    setFormError(null);
    const subject = encodeURIComponent(`Green Tech Club enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n---\nFrom: ${name}\nReply to: ${email}`);
    window.location.href = `mailto:${CONTACT_ADDRESS}?subject=${subject}&body=${body}`;
  };

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
          <span className={styles.eyebrow} data-reveal data-reveal-index="0">
            About the club
          </span>
          <h1 className={styles.heroTitle} data-reveal data-reveal-index="1">
            Join the
            <span className={styles.heroAccent}> movement.</span>
          </h1>
          <p className={styles.heroLede} data-reveal data-reveal-index="2">
            We are a student club at UTAR building, testing and explaining renewable energy. This
            page is who we are, how to reach us, and where our numbers come from.
          </p>
          <div className={styles.heroActions} data-reveal data-reveal-index="3">
            <a href="#contact" className={styles.cta}>
              <span className={styles.ctaLabel}>Get in touch</span>
              <span className={styles.ctaIcon} aria-hidden="true">
                <ArrowGlyph />
              </span>
            </a>
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

        {/* ---- Contact: one plate holding the form and the channels ---- */}
        <section className={styles.section} id="contact" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className={styles.sectionTitle} data-reveal data-reveal-index="0">
            Reach us
          </h2>

          <div className={styles.contactShell} data-reveal data-reveal-index="1">
            <div className={styles.contactCore}>
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="contact-name">Name</label>
                  <input id="contact-name" name="name" type="text" autoComplete="name" required />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-email">Email</label>
                  <input id="contact-email" name="email" type="email" autoComplete="email" required />
                  <p className={styles.hint}>We reply to this address, nowhere else.</p>
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" rows={5} required />
                </div>

                {formError && (
                  <p className={styles.error} role="alert">
                    {formError}
                  </p>
                )}

                <button type="submit" className={styles.cta}>
                  <span className={styles.ctaLabel}>Send message</span>
                  <span className={styles.ctaIcon} aria-hidden="true">
                    <ArrowGlyph />
                  </span>
                </button>

                <p className={styles.formNote}>
                  This opens your mail app with the message ready to send.
                </p>
              </form>

              <aside className={styles.channels}>
                <span className={styles.plateKicker}>Direct</span>
                <ul className={styles.channelList}>
                  {channels.map((channel) => (
                    <li key={channel.id}>
                      <a
                        href={channel.href}
                        className={styles.channel}
                        {...(channel.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        <span className={styles.channelGlyph} aria-hidden="true">
                          {channel.id === 'email' ? <MailGlyph /> : <OrbitGlyph />}
                        </span>
                        <span className={styles.channelText}>
                          <span className={styles.channelLabel}>{channel.label}</span>
                          <span className={styles.channelValue}>{channel.value}</span>
                        </span>
                        <span className={styles.channelArrow} aria-hidden="true">
                          {channel.external ? <ExternalGlyph /> : <ArrowGlyph />}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className={styles.locationBlock}>
                  <span className={styles.channelGlyph} aria-hidden="true">
                    <PinGlyph />
                  </span>
                  <p className={styles.locationRoom}>{clubLocation.room}</p>
                  <p className={styles.locationCampus}>{clubLocation.campus}</p>
                  <p className={styles.locationHours}>{clubLocation.hours}</p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ---- Support: three cards at three different widths ---- */}
        <section className={styles.section} aria-labelledby="support-heading">
          <h2 id="support-heading" className={styles.sectionTitle} data-reveal data-reveal-index="0">
            Ways in
          </h2>

          <div className={styles.support}>
            {supportRoutes.map((route, index) => (
              <article
                key={route.title}
                className={`${styles.supportCard} ${styles[route.span]}`}
                data-reveal
                data-reveal-index={String(index + 1)}
              >
                <h3 className={styles.supportTitle}>{route.title}</h3>
                <p className={styles.supportBody}>{route.body}</p>
                <a href={route.href} className={styles.supportAction}>
                  {route.action}
                  <span className={styles.supportArrow} aria-hidden="true">
                    <ArrowGlyph />
                  </span>
                </a>
              </article>
            ))}
          </div>
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
                <a
                  href={reference.href}
                  className={styles.indexRow}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
                </a>
              </li>
            ))}
          </ol>

          <p className={styles.indexNote} data-reveal data-reveal-index="2">
            Cited at the organisation level. Specific reports are named inline wherever a figure
            comes from one.
          </p>
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
