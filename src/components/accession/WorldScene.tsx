import styles from './WorldScene.module.css';

/**
 * THE WORLD YOU ARE RAISING — the quiz's living specimen.
 *
 * The brief for this page was that the quiz should not look like an exam. So
 * the score is not a number in a corner: it is a place. One drawing, driven by
 * a single `growth` value between 0 and 1, that starts as a stalled industrial
 * yard and ends as something alive.
 *
 * Everything here is derived from `growth` rather than switched at thresholds,
 * so the world does not jump between five canned states — it is continuously
 * further along, and a single correct answer visibly moves it.
 *
 * Colour comes from the chapter the scene stands in, and the quiz advances
 * that chapter as the score climbs, so the ground under the drawing lightens
 * at the same time as the drawing greens.
 */
export function WorldScene({ growth }: { growth: number }) {
  const g = Math.min(1, Math.max(0, growth));

  /** Leaves open in pairs, so the plant gains structure rather than volume. */
  const leaves = Array.from({ length: 6 }, (_, i) => {
    const threshold = i / 6;
    const open = Math.min(1, Math.max(0, (g - threshold) * 6));
    return { i, open };
  });

  /** The stack stops smoking early — the first thing that changes. */
  const smoke = Math.max(0, 1 - g * 2.2);
  /** Turbines arrive in the middle of the run. */
  const turbines = Math.min(1, Math.max(0, (g - 0.3) * 2.2));
  /** The sun clears the horizon last. */
  const sun = Math.min(1, Math.max(0, (g - 0.45) * 2));
  const stemTop = 188 - g * 96;

  return (
    <svg
      className={styles.scene}
      viewBox="0 0 400 240"
      role="img"
      aria-label={`The world you are raising, ${Math.round(g * 100)} percent restored`}
    >
      {/* Sun, rising as the world recovers */}
      <g opacity={sun} style={{ transform: `translateY(${(1 - sun) * 26}px)` }}>
        <circle className={styles.sun} cx="322" cy="70" r="17" />
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={i}
            className={styles.sunRay}
            x1="322"
            y1="44"
            x2="322"
            y2="34"
            transform={`rotate(${i * 36} 322 70)`}
          />
        ))}
      </g>

      {/* The stack. It never disappears — this world is not erased, it is
          learned from — but it stops working, and the smoke goes first. */}
      <g opacity={0.25 + (1 - g) * 0.75}>
        <path className={styles.rule} d="M58 188 V96 h26 v92" />
        <path className={styles.rule} d="M54 96 h34" />
      </g>
      <g className={styles.smoke} opacity={smoke}>
        <path className={styles.hair} d="M71 88 q-9-13 0-24 q9-11 0-22" />
        <path className={styles.hair} d="M82 84 q-7-10 0-19" />
      </g>

      {/* Turbines, arriving */}
      <g opacity={turbines}>
        {[
          { x: 232, s: 1 },
          { x: 284, s: 0.72 },
        ].map(({ x, s }) => (
          <g key={x} transform={`translate(${x} 188) scale(${s}) translate(${-x} -188)`}>
            <path className={styles.rule} d={`M${x} 188 V128`} />
            <g className={styles.rotor} style={{ transformOrigin: `${x}px 128px` }}>
              {[0, 120, 240].map((deg) => (
                <path
                  key={deg}
                  className={styles.live}
                  d={`M${x} 128 q3-3 3.5-9 L${x + 2} 92 q-1-3-2 0 L${x - 3} 119 q0.5 6 3 9 z`}
                  transform={`rotate(${deg} ${x} 128)`}
                />
              ))}
            </g>
            <circle className={styles.rule} cx={x} cy="128" r="3" />
          </g>
        ))}
      </g>

      {/* The plant. The centre of the drawing and the thing the reader is
          actually growing. */}
      <path className={styles.stem} d={`M160 188 V${stemTop}`} strokeLinecap="round" />
      {leaves.map(({ i, open }) => {
        const y = 176 - i * 15 - g * 12;
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <path
            key={i}
            className={styles.leaf}
            d={`M160 ${y} q${side * 26} -6 ${side * 30} -22 q${-side * 26} 5 ${-side * 30} 22 z`}
            opacity={open}
            style={{
              transform: `scale(${0.5 + open * 0.5})`,
              transformOrigin: `160px ${y}px`,
            }}
          />
        );
      })}

      {/* A bud that only opens on a perfect run. */}
      {g >= 0.999 && <circle className={styles.bud} cx="160" cy={stemTop - 6} r="7" />}

      {/* Ground. Bare ticks give way to grass. */}
      <path className={styles.rule} d="M24 188 h352" />
      {[40, 96, 120, 196, 260, 306, 344, 366].map((x, i) => (
        <path
          key={x}
          className={i / 8 < g ? styles.grass : styles.hair}
          d={`M${x} 188 v${i / 8 < g ? -12 : -5}`}
        />
      ))}
    </svg>
  );
}

export default WorldScene;
