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
  const [hasChosenFuture, setHasChosenFuture] = useState(() => localStorage.getItem('hasChosenFuture') || 'false');
  const [attemptsToReturnToPast, setAttemptsToReturnToPast] = useState(() => localStorage.getItem('attemptsToReturnToPast') || '0');
  const navigate = useNavigate();

  // Sync state values with LocalStorage
  const syncLocalStates = () => {
    setHasChosenFuture(localStorage.getItem('hasChosenFuture') || 'false');
    setAttemptsToReturnToPast(localStorage.getItem('attemptsToReturnToPast') || '0');
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
    localStorage.removeItem('hasChosenFuture');
    localStorage.removeItem('attemptsToReturnToPast');
    localStorage.setItem('debugModeActive', 'false');
    syncLocalStates();
    setIsOpen(false);
    // Route back to clean root, reload to completely purge all global caches & controllers
    navigate('/');
    window.location.reload();
  };

  const handleSetRevisit = (count: number) => {
    localStorage.setItem('hasChosenFuture', 'true');
    localStorage.setItem('attemptsToReturnToPast', count.toString());
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
              <span>hasChosenFuture:</span>
              <span className={hasChosenFuture === 'true' ? styles.trueText : styles.falseText}>
                {hasChosenFuture}
              </span>
            </div>
            <div className={styles.stateRow}>
              <span>attemptsToReturnToPast:</span>
              <span className={styles.countText}>{attemptsToReturnToPast}</span>
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
