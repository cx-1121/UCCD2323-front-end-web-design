import { useEffect, useRef, useState } from 'react';
import {
  ArrowGlyph,
  BoltGlyph,
  CompassGlyph,
  HorizonGlyph,
  LayersGlyph,
  OrbitGlyph,
  TargetGlyph,
} from '../../components/icons';
import styles from './RevisitOverlay.module.css';

interface RevisitOverlayProps {
  level: number;
  onLeave: (targetPath?: string) => void;
}

/** When the level 3 gateway unseals. */
const GATEWAY_DELAY_MS = 4200;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Destination = {
  label: string;
  detail: string;
  Glyph: (props: { className?: string }) => JSX.Element;
  /** Omitted while the route does not exist yet; the tile renders inert. */
  path?: string;
  span: 'wide' | 'half' | 'full';
};

/**
 * The six gateway destinations. Only the two with a `path` are routed today;
 * the rest render as sealed tiles rather than sending the reader to a blank
 * screen. Giving one a `path` is all it takes to light it up.
 */
const DESTINATIONS: Destination[] = [
  {
    label: 'Explore energy',
    detail: 'Five renewable sources, mechanism by mechanism',
    Glyph: CompassGlyph,
    path: '/explore',
    span: 'wide',
  },
  { label: 'Green tech', detail: 'The hardware of the transition', Glyph: BoltGlyph, span: 'half' },
  { label: 'Projects', detail: 'What the club is building', Glyph: LayersGlyph, span: 'half' },
  { label: 'Quiz', detail: 'Test what stuck', Glyph: TargetGlyph, span: 'half' },
  { label: 'Future vision', detail: 'The grid in 2050', Glyph: HorizonGlyph, span: 'half' },
  {
    label: 'Join the movement',
    detail: 'Step into the club and start building',
    Glyph: OrbitGlyph,
    path: '/home',
    span: 'full',
  },
];

function RevisitOverlay({ level, onLeave }: RevisitOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stage = level >= 3 ? 3 : level;

  /**
   * Under reduced motion the gateway is open from the first frame: making the
   * reader wait 4.2s for a sealed panel is the timing, and the timing is the
   * thing being opted out of. Derived here rather than assigned from inside an
   * effect, which would cost an extra render pass on every mount.
   */
  const [gatewayOpen, setGatewayOpen] = useState(
    () => stage >= 3 && prefersReducedMotion(),
  );

  /**
   * Atmosphere. Smoke at the lower levels, rising embers of green once the
   * gateway stage is reached.
   *
   * Rewritten from the original: particles are stamped from a pre-rendered
   * sprite instead of being drawn with a per-particle `shadowBlur`, which was
   * costing a full-canvas blur pass per particle per frame. The loop is also
   * DPR-correct, parked while the tab is hidden, and skipped outright under
   * reduced motion.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isGateway = stage >= 3;
    const tint = isGateway ? '16, 185, 129' : '110, 122, 138';

    let width = 0;
    let height = 0;
    let dpr = 1;

    // One sprite, drawn once, stamped many times.
    const sprite = document.createElement('canvas');
    const spriteCtx = sprite.getContext('2d');
    const SPRITE_SIZE = 128;
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    if (spriteCtx) {
      const r = SPRITE_SIZE / 2;
      const grad = spriteCtx.createRadialGradient(r, r, 0, r, r, r);
      grad.addColorStop(0, `rgba(${tint}, ${isGateway ? 0.9 : 0.34})`);
      grad.addColorStop(0.45, `rgba(${tint}, ${isGateway ? 0.22 : 0.12})`);
      grad.addColorStop(1, `rgba(${tint}, 0)`);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    type Mote = { x: number; y: number; size: number; vx: number; vy: number; alpha: number };
    let motes: Mote[] = [];

    const seed = () => {
      const count = isGateway ? 44 : 26;
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isGateway ? Math.random() * 26 + 8 : Math.random() * 180 + 90,
        vx: (Math.random() - 0.5) * (isGateway ? 0.32 : 0.14),
        vy: -(Math.random() * (isGateway ? 0.5 : 0.22) + 0.1),
        alpha: Math.random() * 0.45 + 0.2,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motes.length === 0) {
        seed();
      }
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      motes.forEach((m) => {
        ctx.globalAlpha = m.alpha;
        ctx.drawImage(sprite, m.x - m.size, m.y - m.size, m.size * 2, m.size * 2);
      });
      ctx.globalAlpha = 1;
    };

    resize();

    let frame = 0;
    const step = () => {
      motes.forEach((m) => {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -m.size) {
          m.y = height + m.size;
          m.x = Math.random() * width;
        }
      });
      paint();
      frame = requestAnimationFrame(step);
    };

    if (reduceMotion) {
      paint();
    } else {
      frame = requestAnimationFrame(step);
    }

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !reduceMotion) {
        frame = requestAnimationFrame(step);
      }
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [stage]);

  // Unseal the gateway once the opening lines have landed.
  useEffect(() => {
    if (stage < 3 || prefersReducedMotion()) {
      return;
    }
    const timer = window.setTimeout(() => setGatewayOpen(true), GATEWAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const enter = (
    <button type="button" className={styles.cta} onClick={() => onLeave('/home')}>
      <span className={styles.ctaLabel}>Enter the future</span>
      <span className={styles.ctaIcon} aria-hidden="true">
        <ArrowGlyph />
      </span>
    </button>
  );

  return (
    <div className={`${styles.overlay} ${styles[`stage${stage}`]}`}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.mesh} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbA}`} />
        <span className={`${styles.orb} ${styles.orbB}`} />
      </div>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.frame}>
        <div className={styles.column}>
          {stage === 1 && (
            <>
              <span className={`${styles.eyebrow} ${styles.step0}`}>You turned around</span>
              <p className={`${styles.line} ${styles.step1}`}>
                Once you have reached for a greener future
              </p>
              <p className={`${styles.line} ${styles.lineEmber} ${styles.step2}`}>
                you do not walk back into the smoke.
              </p>
              <p className={`${styles.sub} ${styles.step3}`}>The journey has already begun.</p>
              <div className={`${styles.actions} ${styles.step4}`}>{enter}</div>
            </>
          )}

          {stage === 2 && (
            <>
              <span className={`${styles.eyebrow} ${styles.step0}`}>Back again</span>
              <p className={`${styles.line} ${styles.step1}`}>You have seen what was.</p>
              <p className={`${styles.line} ${styles.lineAccent} ${styles.step2}`}>
                Now discover what can be.
              </p>
              <div className={`${styles.actions} ${styles.step3}`}>{enter}</div>
            </>
          )}

          {stage === 3 && (
            <>
              <div className={gatewayOpen ? `${styles.prologue} ${styles.prologueOut}` : styles.prologue}>
                <span className={`${styles.eyebrow} ${styles.step0}`}>You kept coming back</span>
                <p className={`${styles.line} ${styles.step1}`}>This world once powered us.</p>
                <p className={`${styles.line} ${styles.lineDim} ${styles.step2}`}>
                  But we learned its cost.
                </p>
                <p className={`${styles.line} ${styles.lineAccent} ${styles.step3}`}>
                  So the way back is closed, and the way forward is open.
                </p>
              </div>

              {/* Double-bezel enclosure: outer tray, inner core at a concentric radius. */}
              <aside
                className={gatewayOpen ? `${styles.gateway} ${styles.gatewayOpen}` : styles.gateway}
                aria-hidden={!gatewayOpen}
              >
                <div className={styles.gatewayCore}>
                  <p className={styles.gatewayLabel}>
                    <span>Gateway</span>
                    <span className={styles.gatewayCount}>
                      {DESTINATIONS.filter((d) => d.path).length}/{DESTINATIONS.length} open
                    </span>
                  </p>

                  <div className={styles.bento}>
                    {DESTINATIONS.map((destination, index) => {
                      const { Glyph } = destination;
                      const body = (
                        <>
                          <span className={styles.tileGlyph} aria-hidden="true">
                            <Glyph />
                          </span>
                          <span className={styles.tileLabel}>{destination.label}</span>
                          <span className={styles.tileDetail}>{destination.detail}</span>
                        </>
                      );
                      const tileClass = `${styles.tile} ${styles[destination.span]}`;

                      if (!destination.path) {
                        return (
                          <div
                            key={destination.label}
                            className={`${tileClass} ${styles.tileSealed}`}
                            style={{ transitionDelay: `${index * 60}ms` }}
                          >
                            {body}
                            <span className={styles.tileSeal}>Sealed</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={destination.label}
                          type="button"
                          className={tileClass}
                          style={{ transitionDelay: `${index * 60}ms` }}
                          onClick={() => onLeave(destination.path)}
                        >
                          {body}
                          <span className={styles.tileArrow} aria-hidden="true">
                            <ArrowGlyph />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className={styles.quote}>
                    The future is not behind you. It is something we build together.
                  </p>
                </div>
              </aside>

              {/* Always reachable, so the reader is never held here waiting. */}
              <div className={`${styles.actions} ${styles.step4}`}>{enter}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RevisitOverlay;
