import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsent } from '../../context/consentContext';
import { safeLocal } from '../../utils/storage';
import {
  DEBUG_MODE_KEY,
  HAS_CHOSEN_FUTURE_KEY,
  REVISIT_ATTEMPTS_KEY,
} from '../../utils/storageKeys';
import styles from './DebugConsole.module.css';

/**
 * Zero-intrusion Debug Console component.
 * Displays local storage states and provides jump shortcuts for testing transitions.
 * Only mounted if URL has ?debug=true.
 */
function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChosenFuture, setHasChosenFuture] = useState(
    () => safeLocal.get(HAS_CHOSEN_FUTURE_KEY) || 'false',
  );
  const [attemptsToReturnToPast, setAttemptsToReturnToPast] = useState(
    () => safeLocal.get(REVISIT_ATTEMPTS_KEY) || '0',
  );
  const navigate = useNavigate();
  const { status: consentStatus, reset: resetConsent } = useConsent();

  // Sync state values with LocalStorage
  const syncLocalStates = () => {
    setHasChosenFuture(safeLocal.get(HAS_CHOSEN_FUTURE_KEY) || 'false');
    setAttemptsToReturnToPast(safeLocal.get(REVISIT_ATTEMPTS_KEY) || '0');
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
    safeLocal.remove(HAS_CHOSEN_FUTURE_KEY);
    safeLocal.remove(REVISIT_ATTEMPTS_KEY);
    safeLocal.set(DEBUG_MODE_KEY, 'false');
    syncLocalStates();
    setIsOpen(false);
    // Route back to clean root, reload to completely purge all global caches & controllers
    navigate('/');
    window.location.reload();
  };

  const handleSetRevisit = (count: number) => {
    safeLocal.set(HAS_CHOSEN_FUTURE_KEY, 'true');
    safeLocal.set(REVISIT_ATTEMPTS_KEY, count.toString());
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
            <div className={styles.stateRow}>
              <span>refuture_consent:</span>
              <span className={consentStatus === 'granted' ? styles.trueText : styles.falseText}>
                {consentStatus}
              </span>
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
              <button onClick={resetConsent} className={styles.cmdBtn}>
                Reset Consent Cookie
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
