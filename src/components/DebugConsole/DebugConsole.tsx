import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DebugConsole.module.css';

/**
 * Zero-intrusion Debug Console component.
 * Displays local storage states and provides jump shortcuts for testing transitions.
 * Only mounted if URL has ?debug=true.
 */
function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(() => localStorage.getItem('greenTechJourneyStarted') || 'false');
  const [revisitCount, setRevisitCount] = useState(() => localStorage.getItem('landingRevisitCount') || '0');
  const navigate = useNavigate();

  // Sync state values with LocalStorage
  const syncLocalStates = () => {
    setJourneyStarted(localStorage.getItem('greenTechJourneyStarted') || 'false');
    setRevisitCount(localStorage.getItem('landingRevisitCount') || '0');
  };

  useEffect(() => {
    // Only register the timer callback (asynchronous, safe from setState warning)
    const interval = setInterval(syncLocalStates, 1000);
    return () => clearInterval(interval);
  }, []);


  const handleToggle = () => {
    syncLocalStates();
    setIsOpen(!isOpen);
  };

  const handleResetAll = () => {
    localStorage.removeItem('greenTechJourneyStarted');
    localStorage.removeItem('landingRevisitCount');
    syncLocalStates();
    // Route back to clean root to simulate a fresh user
    navigate('/');
  };

  const handleSetRevisit = (count: number) => {
    localStorage.setItem('greenTechJourneyStarted', 'true');
    localStorage.setItem('landingRevisitCount', count.toString());
    syncLocalStates();
    // Route to replay mode
    navigate('/?replay=true');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className={`${styles.wrapper} ${isOpen ? styles.active : ''}`}>
      <button className={styles.triggerButton} onClick={handleToggle} title="Open Debug Panel">
        {isOpen ? '✕' : '⚙️'}
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <h4 className={styles.title}>🛠️ Debug Dashboard</h4>
          
          <div className={styles.section}>
            <h5>Inspect States</h5>
            <div className={styles.stateRow}>
              <span>journeyStarted:</span>
              <span className={journeyStarted === 'true' ? styles.trueText : styles.falseText}>
                {journeyStarted}
              </span>
            </div>
            <div className={styles.stateRow}>
              <span>revisitCount:</span>
              <span className={styles.countText}>{revisitCount}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h5>Commands</h5>
            <div className={styles.btnGrid}>
              <button onClick={handleResetAll} className={`${styles.cmdBtn} ${styles.dangerBtn}`}>
                Reset All (Fresh UI)
              </button>
              <button onClick={() => handleSetRevisit(0)} className={styles.cmdBtn}>
                Set Revisit 1
              </button>
              <button onClick={() => handleSetRevisit(1)} className={styles.cmdBtn}>
                Set Revisit 2
              </button>
              <button onClick={() => handleSetRevisit(2)} className={styles.cmdBtn}>
                Set Revisit 3
              </button>
              <button onClick={handleGoHome} className={`${styles.cmdBtn} ${styles.homeBtn}`}>
                Go To /home
              </button>
            </div>
          </div>
          
          <div className={styles.tip}>
            * Tip: Replay counts will lock in only when you click "ENTER THE FUTURE" or navigate away.
          </div>
        </div>
      )}
    </div>
  );
}

export default DebugConsole;
