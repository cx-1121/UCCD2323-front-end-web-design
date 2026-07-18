import { useEffect, useState } from "react";
import HudHeader from "../../components/HudHeader/HudHeader";
import EnergySection from "../../components/EnergySection/EnergySection";
import { energySources } from "../../data/EnergySources";
import styles from "./ExplorePage.module.css";

function ExplorePage() {
  const [activeEnergy, setActiveEnergy] = useState(energySources[0].id);

  useEffect(() => {
    const sections = energySources
      .map((source) => document.getElementById(source.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter(
          (entry) => entry.isIntersecting
        );

        if (visibleSections.length === 0) {
          return;
        }

        const mostVisibleSection = visibleSections.reduce((current, entry) =>
          entry.intersectionRatio > current.intersectionRatio
            ? entry
            : current
        );

        setActiveEnergy(mostVisibleSection.target.id);
      },
      {
        rootMargin: "-120px 0px -45% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.page}>
      <HudHeader />

      <div className={styles.layout}>
        <div className={styles.energyContent}>
          {energySources.map((source) => (
            <EnergySection key={source.id} source={source} />
          ))}
        </div>

        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Explore Energy</p>

          <nav aria-label="Renewable energy sections">
            <ul className={styles.sidebarList}>
              {energySources.map((source) => (
                <li key={source.id}>
                  <a
                    href={`#${source.id}`}
                    className={
                      activeEnergy === source.id ? styles.activeLink : ""
                    }
                  >
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </main>
  );
}

export default ExplorePage;