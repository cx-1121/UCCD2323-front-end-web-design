import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

/**
 * HomePage - The central hub (Gateway) of the Green Tech Club website.
 * Serves as the landing destination after completing the cinematic introduction.
 */
function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Green Tech Club</h1>
        <p className={styles.subtitle}>Gateway to a Sustainable Future</p>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <h2>Welcome, Future Builder</h2>
          <p>
            You have successfully transited from the industrial smoke of the past into the active incubator of tomorrow's green technology.
          </p>
          <div className={styles.links}>
            <Link to="/?replay=true" className={styles.button}>
              ← Replay Cinematic Landing Page
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Green Tech Club. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
