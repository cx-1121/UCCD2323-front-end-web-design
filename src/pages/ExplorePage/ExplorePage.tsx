import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import EnergySection from '../../components/EnergySection/EnergySection';
import { ArrowGlyph } from '../../components/icons';
import { energySources } from '../../data/EnergySources';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useReveal } from '../../hooks/useReveal';
import styles from './ExplorePage.module.css';

function ExplorePage() {
  const [activeEnergy, setActiveEnergy] = useState(energySources[0]?.id ?? '');
  const heroRef = useReveal<HTMLDivElement>(styles.revealed);
  const navHidden = useHideOnScroll(140);

  useBodyBackground('#f7f8fa');

  useEffect(() => {
    const sections = energySources
      .map((source) => document.getElementById(source.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);

        if (visibleSections.length === 0) {
          return;
        }

        const mostVisibleSection = visibleSections.reduce((current, entry) =>
          entry.intersectionRatio > current.intersectionRatio ? entry : current,
        );

        setActiveEnergy(mostVisibleSection.target.id);
      },
      {
        rootMargin: '-120px 0px -45% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const activeIndex = Math.max(
    0,
    energySources.findIndex((source) => source.id === activeEnergy),
  );

  return (
    <main className={styles.page}>
      <div className={styles.mesh} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbEmerald}`} />
        <span className={`${styles.orb} ${styles.orbTeal}`} />
        <span className={`${styles.orb} ${styles.orbLime}`} />
      </div>
      <div className={styles.grain} aria-hidden="true" />

      <div
        className={navHidden ? `${styles.headerBar} ${styles.headerBarHidden}` : styles.headerBar}
        // Kept in the a11y tree while parked off-screen: it returns on the
        // next upward scroll, and hiding it outright would yank focus.
        data-hidden={navHidden || undefined}
      >
        <HudHeader variant="static" />
      </div>

      <div className={styles.container}>
        {/* ---- Editorial hero ---- */}
        <div ref={heroRef} className={styles.hero}>
          <h1 className={styles.heroTitle} data-reveal data-reveal-index="1">
            The planet is already
            <span className={styles.heroAccent}> generating </span>
            everything we need.
          </h1>

          <p className={styles.heroLede} data-reveal data-reveal-index="2">
            Sunlight, moving air, falling water, living matter, and the heat under our feet. Five
            renewable systems, taken apart mechanism by mechanism: what each one does well, where it
            strains, and where it is already running today.
          </p>


        </div>

        {/* ---- Editorial split: content column + sticky rail ---- */}
        <div className={styles.layout}>
          <div className={styles.content}>
            {energySources.map((source, index) => (
              <EnergySection key={source.id} source={source} index={index} />
            ))}
          </div>

          <div className={styles.railColumn}>
            {/* Index rail — double bezel, with a marker that tracks the
                active section instead of restyling each link on its own. */}
            {/* On mobile this strip pins under the floating nav. It rides up
                into the nav's place when the nav leaves, and is pushed back
                down when it returns. Driven by the sticky offset rather than a
                transform: `top` is inert until an element actually pins, so it
                cannot displace the strip while it is still in normal flow. */}
            <aside
              className={
                navHidden ? `${styles.railShell} ${styles.railRaised}` : styles.railShell
              }
              style={{ '--active': activeIndex } as CSSProperties}
            >
              <div className={styles.railCore}>
                <p className={styles.railLabel}>
                  <span>Index</span>
                  <span className={styles.railCounter}>
                    {String(activeIndex + 1).padStart(2, '0')}/05
                  </span>
                </p>

                <nav aria-label="Renewable energy navigation" className={styles.railNav}>
                  <span className={styles.railTrack} aria-hidden="true">
                    <span className={styles.railMarker} />
                  </span>

                  <ul className={styles.railList}>
                    {energySources.map((source) => (
                      <li key={source.id}>
                        <a
                          href={`#${source.id}`}
                          className={
                            activeEnergy === source.id
                              ? `${styles.railLink} ${styles.railLinkActive}`
                              : styles.railLink
                          }
                          aria-current={activeEnergy === source.id ? 'true' : undefined}
                        >
                          {source.name.replace(/ (Energy|Power)$/, '')}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Quiz CTA — double bezel + button-in-button trailing icon */}
            <aside className={styles.ctaShell}>
              <div className={styles.ctaCore}>
                <span className={styles.ctaEyebrow}>Check yourself</span>
                <p className={styles.ctaText}>
                  Think it landed? Run the short challenge and find out what stuck.
                </p>

                <Link to="/quiz-challenge" className={styles.ctaButton}>
                  <span className={styles.ctaButtonLabel}>Start quiz</span>
                  <span className={styles.ctaButtonIcon} aria-hidden="true">
                    <ArrowGlyph />
                  </span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ExplorePage;
