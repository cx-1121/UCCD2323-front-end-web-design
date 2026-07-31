import { useEffect, useRef, useState } from 'react';
import styles from './RevisitOverlay.module.css';

interface RevisitOverlayProps {
  level: number;
  onLeave: (targetPath?: string) => void;
}

function RevisitOverlay({ level, onLeave }: RevisitOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showNav, setShowNav] = useState(false);

  // Canvas animations for background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class for atmospheric effects
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      decay: number;

      constructor(colorType: 'smoke' | 'green') {
        this.x = Math.random() * width;
        // Smoke drifts up, green particles drift around and float up
        this.y = colorType === 'smoke' ? height + Math.random() * 100 : Math.random() * height;
        this.size = Math.random() * (colorType === 'smoke' ? 120 : 6) + (colorType === 'smoke' ? 40 : 2);
        this.speedX = (Math.random() - 0.5) * (colorType === 'smoke' ? 0.5 : 2);
        this.speedY = -(Math.random() * (colorType === 'smoke' ? 1.5 : 3) + 0.5);
        this.alpha = Math.random() * 0.4 + 0.1;
        this.decay = Math.random() * 0.002 + 0.001;
        this.color = colorType === 'smoke' ? '71, 85, 105' : '16, 185, 129'; // Slate vs Emerald
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < -150) {
          this.y = height + 50;
          this.x = Math.random() * width;
          this.alpha = Math.random() * 0.4 + 0.1;
        }
      }

      draw() {
        ctx!.save();
        ctx!.globalAlpha = this.alpha;
        if (this.color === '71, 85, 105') {
          // Smoke: Radial gradient blur
          const grad = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
          grad.addColorStop(0, `rgba(${this.color}, 0.15)`);
          grad.addColorStop(1, `rgba(${this.color}, 0)`);
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          // Green tech particles: Glow points
          ctx!.shadowBlur = 15;
          ctx!.shadowColor = `rgb(${this.color})`;
          ctx!.fillStyle = `rgba(${this.color}, ${this.alpha})`;
          ctx!.beginPath();
          ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }
    }

    const particleCount = level >= 3 ? 120 : 35;
    const colorType = level >= 3 ? 'green' : 'smoke';
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(colorType));
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Level specific canvas backgrounds
      if (level === 1) {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
      } else if (level === 2) {
        const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
        grad.addColorStop(0, '#062016'); // Dark teal center
        grad.addColorStop(1, '#020504');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // level 3: transition colors
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#040b08');
        grad.addColorStop(1, '#0c2419');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    // Revisit 3 secret nav timing
    if (level >= 3) {
      const timer = setTimeout(() => {
        setShowNav(true);
      }, 5500); // Navigation appears after text animation finishes
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [level]);

  // Handle redirect inside hidden nav to prevent reloading
  const handleNavClick = (path: string) => {
    onLeave(path);
  };

  return (
    <div className={styles.overlay}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.content}>
        {level === 1 && (
          <div className={styles.textContainer}>
            <p className={`${styles.line} ${styles.delay1}`}>Once you've reached for a greener future...</p>
            <p className={`${styles.line} ${styles.delay2} ${styles.warning}`}>You don't walk back into the smoke.</p>
            <p className={`${styles.line} ${styles.delay3}`}>The journey has already begun.</p>
            
            <div className={`${styles.btnContainer} ${styles.delay4}`}>
              <button className={styles.btn} onClick={() => onLeave('/home')}>
                ENTER THE FUTURE →
              </button>
            </div>
          </div>
        )}

        {level === 2 && (
          <div className={styles.textContainer}>
            <p className={`${styles.line} ${styles.delay1}`}>You have seen what was.</p>
            <p className={`${styles.line} ${styles.delay2} ${styles.accent}`}>Now discover what can be.</p>
            
            <div className={`${styles.btnContainer} ${styles.delay3}`}>
              <button className={styles.btn} onClick={() => onLeave('/home')}>
                ENTER THE FUTURE →
              </button>
            </div>
          </div>
        )}

        {level >= 3 && (
          <div className={styles.textContainer}>
            <div className={styles.reversedSceneWrapper}>
              <p className={`${styles.line} ${styles.delay1}`}>This world once powered us.</p>
              <p className={`${styles.line} ${styles.delay2} ${styles.dim}`}>But we learned its cost.</p>
              <p className={`${styles.line} ${styles.delay3} ${styles.accent}`}>
                Once you've reached for a greener future... You don't walk back.
              </p>
            </div>

            {showNav && (
              <div className={styles.navContainer}>
                <h3 className={styles.navTitle}>Future Navigation Gateway</h3>
                <div className={styles.grid}>
                  <button onClick={() => handleNavClick('/explore')} className={styles.navLink}>
                    🌲 Explore Energy
                  </button>
                  <button onClick={() => handleNavClick('/green-tech')} className={styles.navLink}>
                    ⚡ Green Tech
                  </button>
                  <button onClick={() => handleNavClick('/projects')} className={styles.navLink}>
                    💼 Projects
                  </button>
                  <button onClick={() => handleNavClick('/quiz')} className={styles.navLink}>
                    🏆 Quiz & Challenge
                  </button>
                  <button onClick={() => handleNavClick('/future')} className={styles.navLink}>
                    🏙️ Future Vision
                  </button>
                  <button onClick={() => onLeave('/home')} className={styles.navLink}>
                    🤝 Join Movement
                  </button>
                </div>
                
                <p className={styles.quote}>
                  "The future is not behind you. It is something we build together."
                </p>
                <div className={styles.btnContainer}>
                  <button className={styles.btn} onClick={() => onLeave('/home')}>
                    ENTER THE FUTURE →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RevisitOverlay;
