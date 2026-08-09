import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import {
  ArrowGlyph,
  ExternalGlyph,
  MailGlyph,
  OrbitGlyph,
  PinGlyph,
} from '../../components/icons';
import {
  channels,
  location as clubLocation,
  supportRoutes,
} from '../../data/ClubInfo';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useReveal } from '../../hooks/useReveal';
import styles from './ContactPage.module.css';

const CONTACT_ADDRESS = channels.find((channel) => channel.id === 'email')?.value ?? '';

function ContactPage() {
  const pageRef = useReveal<HTMLElement>(styles.revealed);
  const navHidden = useHideOnScroll(140);
  const [formError, setFormError] = useState<string | null>(null);

  useBodyBackground('#f7f8fa');

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
            Get in touch
          </span>
          <h1 className={styles.heroTitle} data-reveal data-reveal-index="1">
            Let&rsquo;s build
            <span className={styles.heroAccent}> together.</span>
          </h1>
          <p className={styles.heroLede} data-reveal data-reveal-index="2">
            Whether you want to join the club, propose a collaboration, or just ask a question
            about renewable energy — we would love to hear from you.
          </p>
          <div className={styles.heroActions} data-reveal data-reveal-index="3">
            <Link to="/about" className={styles.ctaGhost}>
              <span className={styles.ctaLabel}>About the club</span>
            </Link>
          </div>
        </header>

        {/* ---- Contact: form and channels ---- */}
        <section className={styles.section} aria-labelledby="contact-heading">
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
                      <div className={styles.channel}>
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
                      </div>
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

        {/* ---- Support: three cards ---- */}
        <section className={styles.section} aria-labelledby="support-heading">
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 id="support-heading" className={styles.sectionTitle}>
              How to support us
            </h2>
            <span className={styles.sectionMeta}>
              <OrbitGlyph />
              Three ways to help
            </span>
          </div>

          <div className={styles.support} data-reveal data-reveal-index="1">
            {supportRoutes.map((route) => (
              <article
                key={route.title}
                className={`${styles.supportCard} ${styles[route.span]}`}
              >
                <h3 className={styles.supportTitle}>{route.title}</h3>
                <p className={styles.supportBody}>{route.body}</p>
                <a href={`mailto:${CONTACT_ADDRESS}`} className={styles.supportAction}>
                  <span>{route.action}</span>
                  <span className={styles.supportArrow} aria-hidden="true">
                    <ArrowGlyph />
                  </span>
                </a>
              </article>
            ))}
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

export default ContactPage;
