import styles from './SourceScenes.module.css';

/**
 * MECHANISM SCENES — one drawing per renewable source, showing how the thing
 * actually works rather than symbolising it.
 *
 * These are the page's proof. A field guide that illustrates solar with a sun
 * icon has told the reader nothing they did not already know; a panel wired to
 * an inverter wired to a meter, with the current visibly running down the
 * cable, is the mechanism itself. Every scene therefore draws the whole chain
 * from source to grid.
 *
 * Drafting marks at the same hairline weight as icons.tsx, flat fields, no
 * gradients. Colour comes entirely from the chapter each scene stands in, so
 * they re-ink as the ladder climbs.
 *
 * Components only in this module, so react-refresh can hot-replace it.
 */

/* ==========================================================================
   Solar — light falling on silicon, and the current it frees.
   ========================================================================== */

export function SolarScene() {
  return (
    <svg className={styles.scene} viewBox="0 0 400 300" role="presentation" aria-hidden="true">
      {/* The sun and its light */}
      <g className={styles.sunRays}>
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            className={styles.accentLine}
            x1="300"
            y1="40"
            x2="300"
            y2="22"
            transform={`rotate(${i * 30} 300 74)`}
          />
        ))}
      </g>
      <circle className={styles.accentField} cx="300" cy="74" r="19" />

      {/* Three rays actually landing on the panel — the drawing has to connect
          the source to the collector or it is two objects, not a mechanism. */}
      <path className={styles.hair} d="M283 90 L176 150M292 95 L196 162M272 84 L156 139" />

      {/* The panel, in three-quarter view, with its cell grid */}
      <g>
        <path className={styles.field} d="M92 132 L214 108 L246 150 L124 178 Z" />
        <path className={styles.rule} d="M92 132 L214 108 L246 150 L124 178 Z" />
        <path
          className={styles.hair}
          d="M122 127 L152 167M152 121 L182 161M182 115 L212 155M104 147 L228 121M113 162 L238 135"
        />
        {/* Mounting leg, so the panel is installed rather than floating */}
        <path className={styles.rule} d="M150 172 L150 214M136 214 L164 214" />
      </g>

      {/* Panel -> inverter -> meter. The dash running the cable is the current. */}
      <path
        className={`${styles.liveLine} ${styles.current}`}
        d="M246 152 L272 152 Q286 152 286 166 L286 196"
      />
      <rect className={styles.rule} x="268" y="196" width="36" height="30" rx="2" />
      <path className={styles.hair} d="M276 206 h20M276 214 h13" />
      <path className={`${styles.liveLine} ${styles.current}`} d="M304 211 L340 211" />

      {/* The grid it feeds */}
      <path className={styles.rule} d="M340 226 L340 186M330 192 L340 200 L350 192" />
      <circle className={styles.live} cx="340" cy="182" r="3.5" />

      {/* Ground */}
      <path className={styles.rule} d="M40 240 h320" />
      <path className={styles.hair} d="M56 248 h26M96 248 h18M300 248 h30" />
    </svg>
  );
}

/* ==========================================================================
   Wind — moving air, and the only scene on the site where the whole frame is
   in motion. Deliberate contrast with the stalled, smog-bound opening.
   ========================================================================== */

export function WindScene() {
  return (
    <svg className={styles.scene} viewBox="0 0 400 300" role="presentation" aria-hidden="true">
      {/* Air, made visible. Two clouds at different speeds read as depth. */}
      <g className={styles.cloud}>
        <path
          className={styles.hair}
          d="M40 52 q10-13 24-8 q6-13 21-9 q14 3 13 17 z"
        />
      </g>
      <g className={styles.cloudSlow}>
        <path className={styles.hair} d="M40 92 q8-10 19-6 q5-10 17-7 q11 2 10 13 z" />
      </g>

      {/* Wind lines */}
      <path className={styles.hair} d="M28 130 h44 q10 0 10-7M28 146 h30" />

      {/* Tower and nacelle */}
      <path className={styles.rule} d="M150 240 L144 106 h12 L150 240Z" />
      <rect className={styles.rule} x="140" y="88" width="22" height="14" rx="4" />

      {/* Rotor. One group, one continuous turn — three blades drawn as real
          aerofoils rather than lines, so the direction of rotation reads. */}
      <g className={styles.rotor}>
        {[0, 120, 240].map((deg) => (
          <path
            key={deg}
            className={styles.accentField}
            d="M150 96 q5-4 5.5-14 L152 26 q-2-5-4 0 L145 82 q0.5 10 5 14 z"
            transform={`rotate(${deg} 150 96)`}
          />
        ))}
      </g>
      <circle className={styles.rule} cx="150" cy="96" r="5" />

      {/* A second, smaller turbine — a wind FARM, which is how they exist */}
      <g opacity="0.45">
        <path className={styles.rule} d="M246 240 L242 158 h8 L246 240Z" />
        <g className={styles.rotor} style={{ transformOrigin: '246px 152px' }}>
          {[0, 120, 240].map((deg) => (
            <path
              key={deg}
              className={styles.accentField}
              d="M246 152 q3-3 3.5-9 L248 112 q-1-3-2 0 L243 143 q0.5 6 3 9 z"
              transform={`rotate(${deg} 246 152)`}
            />
          ))}
        </g>
      </g>

      {/* Cable to the grid */}
      <path className={`${styles.liveLine} ${styles.current}`} d="M150 240 L150 252 L330 252" />
      <path className={styles.rule} d="M330 252 L330 214M320 220 L330 228 L340 220" />
      <circle className={styles.live} cx="330" cy="210" r="3.5" />

      {/* Ground and grass, still farmable — the land-use advantage, drawn */}
      <path className={styles.rule} d="M30 240 h340" />
      {[62, 84, 104, 190, 210, 292, 312, 356].map((x) => (
        <path key={x} className={`${styles.hair} ${styles.grass}`} d={`M${x} 240 v-13`} />
      ))}
    </svg>
  );
}

/* ==========================================================================
   Hydro — stored height released through a turbine.
   ========================================================================== */

export function HydroScene() {
  return (
    <svg className={styles.scene} viewBox="0 0 400 300" role="presentation" aria-hidden="true">
      {/* Reservoir: the stored energy IS the height, so the drawing has to
          show the head difference, not just a lake. */}
      <path className={styles.field} d="M28 104 h150 v78 H28 Z" />
      <path className={styles.rule} d="M28 104 h150" />
      {[116, 132, 148].map((y) => (
        <path key={y} className={`${styles.hair} ${styles.wave}`} d={`M40 ${y} q14-5 28 0 t28 0 t28 0`} />
      ))}

      {/* Dam wall */}
      <path className={styles.field} d="M178 96 h30 l10 116 h-50 z" />
      <path className={styles.rule} d="M178 96 h30 l10 116 h-50 z" />

      {/* Head measurement — the drawing states the quantity that matters */}
      <path className={styles.hair} d="M162 104 v78M156 104 h12M156 182 h12" />

      {/* Penstock: water falling through the wall */}
      <path className={styles.rule} d="M186 130 L214 196" />
      <path className={`${styles.accentLine} ${styles.fall}`} d="M190 132 L216 194" />

      {/* Turbine wheel */}
      <g className={styles.wheel}>
        <circle className={styles.rule} cx="236" cy="214" r="20" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={deg}
            className={styles.rule}
            d="M236 214 L236 196"
            transform={`rotate(${deg} 236 214)`}
          />
        ))}
      </g>
      <circle className={styles.accentField} cx="236" cy="214" r="4" />

      {/* Generator and grid */}
      <path className={`${styles.liveLine} ${styles.current}`} d="M256 214 L292 214" />
      <rect className={styles.rule} x="292" y="198" width="34" height="32" rx="2" />
      <path className={styles.hair} d="M300 208 h18M300 218 h11" />
      <path className={`${styles.liveLine} ${styles.current}`} d="M326 214 L358 214" />
      <circle className={styles.live} cx="362" cy="214" r="3.5" />

      {/* Tailrace: the water leaves, lower than it arrived */}
      <path className={styles.rule} d="M28 246 h344" />
      {[254, 264].map((y) => (
        <path
          key={y}
          className={`${styles.hair} ${styles.wave}`}
          d={`M40 ${y} q16-5 32 0 t32 0 t32 0 t32 0 t32 0`}
        />
      ))}
    </svg>
  );
}

/* ==========================================================================
   Biomass — a closed carbon loop. The ring is the whole argument.
   ========================================================================== */

export function BiomassScene() {
  return (
    <svg className={styles.scene} viewBox="0 0 400 300" role="presentation" aria-hidden="true">
      {/* The cycle, drawn as one travelling ring so it reads as continuous
          rather than as four separate stages. */}
      <circle
        className={`${styles.liveLine} ${styles.cycle}`}
        cx="200"
        cy="150"
        r="96"
        opacity="0.75"
      />
      <path className={styles.liveLine} d="M288 112 l10 -6 m-10 6 l3 11" />

      {/* Growing: the plant takes carbon out of the air */}
      <g className={styles.leaf}>
        <path className={styles.rule} d="M96 246 v-44" />
        <path className={styles.live} d="M96 218 q-22-6-26-28 q22 2 26 28z" />
        <path className={styles.live} d="M96 230 q22-8 26-30 q-22 2-26 30z" />
      </g>
      {/* CO2 uptake / cloud arcs over the plant */}
      <path
        className={styles.hair}
        d="M60 192 q-4-24 22-26 q14 -2 18 12 q8 -14 24 -10 q12 4 8 24"
      />

      {/* Harvest and fuel pile — centered directly inside the carbon loop */}
      <g>
        <path className={styles.rule} d="M172 168 L180 132 h40 L228 168 Z" />
        <path className={styles.hair} d="M178 143 h44M175 152 h50M174 160 h52" />
      </g>

      {/* Combustion: heat to steam to generator */}
      <rect className={styles.rule} x="234" y="184" width="52" height="52" rx="3" />
      <path
        className={styles.accentField}
        d="M260 228 q-11-7-9-19 q4 5 8 4 q-3-11 6-17 q-2 12 7 17 q4 7 -1 13 q-4 4 -11 2z"
      />
      <path className={styles.hair} d="M286 200 h22 q6 0 6 6 v14" />

      {/* Generator and grid */}
      <rect className={styles.rule} x="298" y="220" width="32" height="26" rx="2" />
      <path className={`${styles.liveLine} ${styles.current}`} d="M330 233 L362 233" />
      <circle className={styles.live} cx="366" cy="233" r="3.5" />

      {/* Released carbon returning to the plant — the loop closing */}
      <path className={styles.hair} d="M256 182 q-4-16 6-26M268 180 q-2-13 8-22" />
      <text
        x="200"
        y="46"
        textAnchor="middle"
        fill="var(--ink-faint)"
        fontFamily="var(--typed)"
        fontSize="11"
        letterSpacing="2"
      >
        CO₂ RETURNS
      </text>

      {/* Ground line */}
      <path className={styles.rule} d="M40 246 h320" />
    </svg>
  );
}

/* ==========================================================================
   Geothermal — the one scene that goes underground. The ground line is high
   in the frame and most of the drawing is below it, because that is where
   the mechanism is.
   ========================================================================== */

export function GeothermalScene() {
  return (
    <svg className={styles.scene} viewBox="0 0 400 300" role="presentation" aria-hidden="true">
      {/* Surface plant */}
      <rect className={styles.rule} x="228" y="52" width="58" height="34" rx="2" />
      <path className={styles.hair} d="M238 64 h20M238 74 h32" />
      <path className={styles.rule} d="M258 52 v-16" />

      {/* Steam, rising and dissipating */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          className={`${styles.hair} ${styles.steam}`}
          d={`M${252 + i * 5} 34 q-7-9 0-17 q7-8 0-16`}
        />
      ))}

      {/* The ground line, and the strata below it */}
      <path className={styles.rule} d="M20 96 h360" />
      <path className={styles.hair} d="M20 128 h360M20 168 h360M20 212 h360" />
      <path className={styles.field} d="M20 212 h360 v70 H20 Z" />

      {/* Heat, held in the rock */}
      <g className={styles.heat}>
        <path className={styles.accentField} d="M20 252 h360 v30 H20 Z" opacity="0.5" />
        {[70, 140, 210, 280, 340].map((x) => (
          <path
            key={x}
            className={styles.accentLine}
            d={`M${x} 244 q-7-11 0-20 q7-9 0-18`}
            opacity="0.8"
          />
        ))}
      </g>

      {/* Injection well down, production well up — a doublet, which is how
          these are actually drilled. */}
      <path className={styles.rule} d="M170 96 V250" />
      <path className={styles.rule} d="M258 86 V250" />
      <path className={styles.rule} d="M170 250 h88" />

      {/* Cold water down, hot fluid up */}
      <path className={`${styles.hair} ${styles.fall}`} d="M170 106 V244" />
      <path className={`${styles.accentLine} ${styles.current}`} d="M258 244 V96" />

      {/* Wellheads */}
      <rect className={styles.rule} x="160" y="86" width="20" height="12" rx="2" />

      {/* Grid */}
      <path className={`${styles.liveLine} ${styles.current}`} d="M286 70 L344 70" />
      <circle className={styles.live} cx="348" cy="70" r="3.5" />

      <text
        x="30"
        y="272"
        fill="var(--ink-faint)"
        fontFamily="var(--typed)"
        fontSize="11"
        letterSpacing="2"
      >
        HEAT RESERVOIR
      </text>
    </svg>
  );
}
