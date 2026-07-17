import { useEffect, useState } from 'react';
import gsap from 'gsap';
import styles from './HudHeader.module.css';

function HudHeader() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    gsap.set(`.${styles.logo} svg`, { transformOrigin: "50% 50%" });
  }, []);

  const handleLogoClick = () => {
    const nextState = !unlocked;
    setUnlocked(nextState);

    if (nextState) {
      gsap.to(`.${styles.logo} svg`, { rotation: 90, duration: 1.2, ease: "back.out(2)" });
      gsap.to(`.${styles.logoTextGroup}`, { x: 30, opacity: 0, duration: 0.8, ease: "power2.out" });

      gsap.set(`.${styles.logoLine}`, { x: 0, width: 0, opacity: 1 });
      const lineTl = gsap.timeline();
      lineTl.to(`.${styles.logoLine}`, { width: "120px", duration: 0.4, ease: "power1.out", delay: 0.2 })
            .to(`.${styles.logoLine}`, { x: 120, width: 0, opacity: 0, duration: 0.5, ease: "power1.inOut" });

      gsap.set(`.${styles.globalNav}`, { pointerEvents: "auto" });
      gsap.to(`.${styles.navItem}`, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.4,
      });
    } else {
      gsap.set(`.${styles.globalNav}`, { pointerEvents: "none" });
      gsap.to(`.${styles.navItem}`, {
        opacity: 0,
        x: -15,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.in",
      });

      gsap.set(`.${styles.logoLine}`, { x: 0, width: 0, opacity: 1 });
      gsap.to(`.${styles.logo} svg`, { rotation: 0, duration: 1.2, ease: "back.out(2)", delay: 0.1 });
      gsap.to(`.${styles.logoTextGroup}`, { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.1 });
    }
  };

  return (
    <header className={styles.hudHeader}>
      <div className={styles.logo} onClick={handleLogoClick}>
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 22h9V12h2v10h9L12 2z" />
        </svg>
        <div className={styles.logoTextGroup}>
          <span className={styles.logoText}>RE:FUTURE</span>
          <span className={styles.logoSubtext}>• Tap to navigate</span>
        </div>
        <div className={styles.logoLine} />
        <nav className={styles.globalNav}>
          <a href="#" className={styles.navItem}>
            Home
          </a>
          <a href="#" className={styles.navItem}>
            Projects
          </a>
          <a href="#" className={styles.navItem}>
            About
          </a>
          <a href="#" className={styles.navItem}>
            Contact Us
          </a>
        </nav>
      </div>
    </header>
  );
}

export default HudHeader;
