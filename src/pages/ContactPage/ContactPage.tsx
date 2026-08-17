import { useState } from 'react';
import type { FormEvent } from 'react';
import HudHeader from '../../components/HudHeader/HudHeader';
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
import {
  ArrowGlyph,
  ExternalGlyph,
  MailGlyph,
  OrbitGlyph,
  PinGlyph,
} from '../../components/icons';
import {
  channels,
  contactAddress,
  location as clubLocation,
  supportRoutes,
} from '../../data/ClubInfo';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useCurrentChapter } from '../../hooks/useCurrentChapter';
import styles from './ContactPage.module.css';

/**
 * CONTACT — the accession form.
 *
 * The one interior surface whose primary content is a control, which decides
 * everything about how it is composed. A message to the club is a record being
 * opened, so the form is the page's single paper object: it sits on a sheet,
 * its fields are ruled lines you write on, and it is typed rather than set,
 * because a filled-in form is instrumentation.
 *
 * Nothing else here is boxed. The channels, the room and the three ways of
 * supporting the club are ruled runs of links — the same composition the
 * bibliography on /about uses, so the two pages read as one register.
 *
 * The old page stated the same hierarchy three times over: a contactShell
 * holding a contactCore holding the form, three support cards sized 'wide' /
 * 'mid' / 'narrow' by a bento grid, and channel rows drawn with an arrow
 * glyph but no anchor under them — every one of those rows carried a URL in
 * the data and none of them was clickable. They are links now.
 */
function ContactPage() {
  const pageRef = useSettle<HTMLElement>();
  const navStop = useCurrentChapter();
  const [formError, setFormError] = useState<string | null>(null);

  useBodyBackground('#e9dfd0');

  /**
   * There is no backend to post to, so the form hands the composed message to
   * the reader's own mail client. Validated here rather than left to the
   * browser because `noValidate` is deliberate: a native bubble is styled by
   * the OS and would be the one element on this page that belongs to no world.
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
    window.location.href = `mailto:${contactAddress}?subject=${subject}&body=${body}`;
  };

  return (
    <main ref={pageRef} className={styles.page} data-nav-stop={navStop ?? undefined}>
      <HudHeader />

      {/* ==================================================================
          I. THE MASTHEAD.
          ================================================================== */}
      <Chapter stop="firstlight" opening aria-label="Contact the club" className={styles.open}>
        <Bench className={styles.openStack}>
          {/* Mount entrances: the reveal band stops short of the fold, and the
              action at the bottom of an opening screen never intersects it. */}
          <Settle index={1} onMount>
            <Instrument ruled>Green Tech Club · Accessions desk</Instrument>
            <Stamped as="h1" scale="display" className={styles.title}>
              Open a record
            </Stamped>
          </Settle>

          <Settle index={2} onMount>
            <Typed
              lines={[
                'Joining, collaborating, or just arguing with a number on this site.',
                ['All three arrive at the same desk.', true],
              ]}
            />
          </Settle>

          <Settle index={3} onMount className={styles.openProse}>
            <Prose>
              There is no form-handling service behind this page and no list you will be
              added to. The form below composes a message and hands it to your own mail
              client — you send it, and you can read exactly what you sent.
            </Prose>
          </Settle>

          <Settle index={4} onMount className={styles.openActions}>
            <Action to="/about" ghost>
              Who you are writing to
            </Action>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          II. THE DESK. The form is the page's one paper object; the ways to
          reach the club without it are a ruled run beside it.
          ================================================================== */}
      <Chapter
        stop="daylight"
        from="firstlight"
        to="sky"
        aria-labelledby="reach-heading"
      >
        <Bench className={styles.stack}>
          <Settle index={1} className={styles.sectionHead}>
            <Stamped as="h2" id="reach-heading" scale="section">
              Reach us
            </Stamped>
            <Instrument>Replies come from the address below</Instrument>
          </Settle>

          <Settle index={2} className={styles.desk}>
            <Sheet className={styles.formSheet}>
              <SheetHead of="Enquiry" no="FORM·01" />

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="contact-name">Name</label>
                  <input id="contact-name" name="name" type="text" autoComplete="name" required />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                  <p className={styles.hint}>We reply to this address, nowhere else.</p>
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" rows={6} required />
                </div>

                {/* The state is not carried by colour alone: the rule beside it
                    and the typed marker read without hue. */}
                {formError && (
                  <p className={styles.error} role="alert">
                    <span aria-hidden="true">✕</span>
                    {formError}
                  </p>
                )}

                <div className={styles.formFoot}>
                  <Action submit>Compose the message</Action>
                  {/* A hint, not a reading: it says what the control will do
                      next, which is not what `Instrument` is for. */}
                  <p className={styles.formNote}>Opens your mail app, ready to send.</p>
                </div>
              </form>
            </Sheet>

            <div className={styles.direct}>
              <section className={styles.directBlock}>
                <Instrument ruled>Direct</Instrument>
                <ul className={styles.channels}>
                  {channels.map((channel) => (
                    <li key={channel.id}>
                      {/* Every one of these carried an href in the data and
                          rendered as an inert row with an arrow beside it. */}
                      <a
                        className={styles.channel}
                        href={channel.href}
                        target={channel.external ? '_blank' : undefined}
                        rel={channel.external ? 'noreferrer' : undefined}
                      >
                        <span className={styles.channelGlyph} aria-hidden="true">
                          {channel.id === 'email' ? <MailGlyph /> : <OrbitGlyph />}
                        </span>
                        <span className={styles.channelText}>
                          <span className={styles.channelLabel}>{channel.label}</span>
                          <span className={styles.channelValue}>{channel.value}</span>
                        </span>
                        <span className={styles.channelPull} aria-hidden="true">
                          {channel.external ? <ExternalGlyph /> : <ArrowGlyph />}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.directBlock}>
                <Instrument ruled>In person</Instrument>
                <p className={styles.room}>
                  <span className={styles.roomGlyph} aria-hidden="true">
                    <PinGlyph />
                  </span>
                  <span className={styles.roomText}>
                    <span className={styles.roomNo}>{clubLocation.room}</span>
                    <span className={styles.roomCampus}>{clubLocation.campus}</span>
                  </span>
                </p>
                <Instrument>{clubLocation.hours}</Instrument>
              </section>
            </div>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          III. THE THREE ROUTES. Not three cards sized wide / mid / narrow by
          a grid — a register, each row addressed and pre-filed.
          ================================================================== */}
      <Chapter
        stop="sky"
        from="daylight"
        to="living"
        aria-labelledby="support-heading"
      >
        <Bench className={styles.stack}>
          <Settle index={1} className={styles.sectionHead}>
            <Stamped as="h2" id="support-heading" scale="section">
              How to support us
            </Stamped>
            <Instrument>Three ways in</Instrument>
          </Settle>

          <Settle index={2}>
            <ol className={styles.routes}>
              {supportRoutes.map((route, position) => (
                <li key={route.title}>
                  <a className={styles.route} href={route.href}>
                    <span className={styles.routeNo}>
                      {String(position + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.routeBody}>
                      <span className={styles.routeTitle}>{route.title}</span>
                      <span className={styles.routeText}>{route.body}</span>
                    </span>
                    <span className={styles.routeAction}>
                      {route.action}
                      <span className={styles.routePull} aria-hidden="true">
                        <MailGlyph />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </Settle>

          <Settle index={3} className={styles.routesNote}>
            <Prose>
              Each of these opens your mail client with the subject line already filled
              in, so a message arrives filed under what it is about rather than in a
              queue of untitled enquiries.
            </Prose>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          IV. THE CLOSE.
          ================================================================== */}
      <Chapter stop="living" from="sky" aria-label="Close" className={styles.close}>
        <Bench>
          <Settle index={1}>
            <Typed
              lines={['We answer everything.', ['Including the awkward questions.', true]]}
              className={styles.closeStatement}
            />
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

export default ContactPage;
