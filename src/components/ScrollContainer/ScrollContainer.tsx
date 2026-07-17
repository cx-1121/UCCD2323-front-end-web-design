import { useRef, type ReactNode } from 'react';
import { useScrollTimeline } from '../../hooks/useScrollTimeline';
import styles from './ScrollContainer.module.css';

interface ScrollContainerProps {
  children: ReactNode;
}

function ScrollContainer({ children }: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollTimeline(containerRef);

  return (
    <div className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stageContainer}>{children}</div>
    </div>
  );
}

export default ScrollContainer;
