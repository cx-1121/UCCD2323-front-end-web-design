import { useEffect, useState } from 'react';
import HudHeader from '../../components/HudHeader/HudHeader';
import EnergySection from '../../components/EnergySection/EnergySection';
import { energySources } from '../../data/EnergySources';
import styles from './ExplorePage.module.css';
import { Link } from 'react-router-dom';

function ExplorePage() {
  const [activeEnergy, setActiveEnergy] = useState(energySources[0]?.id ?? '');

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

  return (
    <main className={styles.page}>
      <div className={styles.headerBar}>
        <HudHeader />
      </div>

      <div className={styles.layout}>
        <div className={styles.energyContent}>
          {energySources.map((source) => (
            <EnergySection key={source.id} source={source} />
          ))}
        </div>

        <div className={styles.sidebarColumn}>
          <aside className={styles.sidebar}>
            <p className={styles.sidebarLabel}>Explore Energy</p>

            <nav aria-label="Renewable energy navigation">
              <ul className={styles.sidebarList}>
                {energySources.map((source) => (
                  <li key={source.id}>
                    <a
                      href={`#${source.id}`}
                      className={activeEnergy === source.id ? styles.activeLink : ''}
                    >
                      {source.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <aside className={styles.sidebar}>
            <p className={styles.sidebarLabel}>Learn more?</p>

            <p className={styles.sidebarText}>Take a short quiz to learn more.</p>

            <Link to="/quiz-challenge" className={styles.sidebarLink}>
              Start Quiz
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ExplorePage;
