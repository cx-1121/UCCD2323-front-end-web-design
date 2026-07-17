import { useEffect, useState } from 'react';
import styles from './ProgressHud.module.css';

interface Section {
  id: number;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 0, label: 'Intro' },
  { id: 1, label: 'Fossil Energy' },
];

function ProgressHud() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleActiveChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ activeIndex: number }>;
      setActiveIndex(customEvent.detail.activeIndex);
    };

    window.addEventListener('active-section-changed', handleActiveChange);
    return () => {
      window.removeEventListener('active-section-changed', handleActiveChange);
    };
  }, []);

  const handleClick = (id: number) => {
    if ((window as any).scrollToSection) {
      (window as any).scrollToSection(id);
    }
  };

  return (
    <nav className={styles.progressHud} aria-label="Scene navigation">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`${styles.dotWrapper} ${section.id === activeIndex ? styles.active : ''}`}
          onClick={() => handleClick(section.id)}
          aria-label={`Navigate to ${section.label}`}
        >
          <span className={styles.dotLabel}>{section.label}</span>
          <div className={styles.hudDot} />
        </button>
      ))}
    </nav>
  );
}

export default ProgressHud;
