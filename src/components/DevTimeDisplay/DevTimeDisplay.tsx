import { useEffect, useState } from 'react';
import styles from './DevTimeDisplay.module.css';

function DevTimeDisplay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.location.search.includes('debug')) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div id="dev-time-display" className={styles.devTimeDisplay}>
      Time: 0.00s
    </div>
  );
}

export default DevTimeDisplay;
