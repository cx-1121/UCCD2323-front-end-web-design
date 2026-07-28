# Pumpjack SVG — Mechanical Reverse-Engineering Specification

> Source: `pumpjack-video/public/pumpjack.svg`
> ViewBox: `0 0 2798 1536`
> SVG Structure: Flat paths with fill colors, no semantic `<g>` groups, no component IDs

---

## STEP 1 — Component Identification

The SVG contains ~120 `<path>` elements distinguished only by fill color. Paths are grouped below into mechanical components by spatial position and color cluster analysis cross-referenced with visual inspection.

| # | Component Name | SVG Paths (by fill color & position) | Function | Static/Movable | Material Role | Parent Assembly |
|---|---------------|--------------------------------------|----------|----------------|---------------|-----------------|
| 1 | **Base Platform** | `#103246`, `#385060`, `#153548` paths at y > 1350 | Ground-level foundation; supports all structures | Static | Cast steel/concrete pad | Root |
| 2 | **Samson Post (A-Frame Tower)** | `#103246`, `#385060`, `#3A5061`, `#3C5263` paths in x: 1200–1700, y: 350–1400 | Vertical truss supporting the walking beam pivot | Static | Structural steel (I-beam or tubular) | Base Platform |
| 3 | **Tower Cross-Bracing & Ladder** | `#385060`, `#FCFCFC`, `#F5F7F8` paths inside tower outline | Structural rigidity + maintenance access | Static | Steel angle/flat bar | Samson Post |
| 4 | **Walking Beam** | `#103246`, `#3C5263` paths in y: 30–560, x: 640–2290 | Lever arm; transmits rotary crank motion to linear rod motion | **Movable** (oscillating) | Structural steel beam | Samson Post (via pivot bearing) |
| 5 | **Horsehead** | `#1B7C94`, `#147E97` teal shield-shaped paths at x: 1850–2200, y: 100–560 | Curved profile at beam end; converts arc motion to near-vertical rod pull | **Movable** (fixed to beam) | Cast steel | Walking Beam |
| 6 | **Beam Pivot Bearing** | Small circular element at ~(1489, 418) | Revolute joint between beam and Samson post | Static (bearing housing) | Steel bearing + housing | Samson Post |
| 7 | **Pitman Arm** | Not explicitly drawn in SVG (rendered as `<line>` in animation code) | Rigid connecting rod; links crank pin to walking beam tail | **Movable** (two-bar linkage) | Steel rod | Crank → Walking Beam |
| 8 | **Primary Crank (Flywheel)** | `#1B7C94`, `#354D5E`, `#3C5263` circular paths centered ~(556, 1084) | Converts motor rotation to eccentric crank motion | **Movable** (continuous rotation) | Cast iron/steel | Drive Assembly |
| 9 | **Counterweight** | `#354D5E`, `#394F60` paths near crank, x: 400–700, y: 900–1200 | Balances beam load to reduce motor torque peak | **Movable** (fixed to crank) | Cast iron | Primary Crank |
| 10 | **Secondary Gear/Sheave** | Circular paths centered ~(420, 1300), r≈160 | Speed reduction / belt drive sheave | **Movable** (continuous rotation) | Cast iron | Drive Assembly |
| 11 | **Drive Belt** | `#103246` path connecting two gear outlines | Transmits power from motor sheave to crank sheave | **Movable** (translating loop) | V-belt / flat belt | Motor → Primary Crank |
| 12 | **Motor Housing** | `#103246`, `#385060` rectangular block at x: 200–500, y: 1200–1450 | Houses electric motor | Static | Steel enclosure | Base Platform |
| 13 | **Equalizer / Beam-End Bracket** | `#354D5E`, `#3A5061` paths at beam tail (x: 640–900, y: 400–600) | Connection point where pitman arm meets walking beam | **Movable** (fixed to beam) | Forged steel bracket | Walking Beam |
| 14 | **Polish Rod (Bridle Cable)** | Vertical element at x: ~2200, y: 550–1000 | Vertical rod transferring horsehead motion to downhole pump | **Movable** (reciprocating vertical) | Steel rod / wire rope | Horsehead |
| 15 | **Wellhead Assembly** | `#1B7C94`, `#385060`, `#3A5061` paths at x: 2200–2400, y: 1200–1520 | Surface valve tree and stuffing box | Static | Steel fittings | Base Platform |
| 16 | **Wellhead Valve Handle** | Small teal element at wellhead | Flow control valve | Static (manually operated) | Cast steel | Wellhead Assembly |
| 17 | **Ground Structure (Left Ramp)** | `#103246`, `#385060` triangular block x: 100–750, y: 1200–1520 | Inclined support base for motor/drive assembly | Static | Concrete/steel | Base Platform |
| 18 | **Oil Pump Mechanism (Downhole)** | Not visible in SVG | Sucker rod pump below ground | **Movable** | Steel | Polish Rod (below grade) |

**Confidence: 85%** — Component boundaries are estimated from color clustering and spatial analysis since the SVG has no semantic grouping.

---

## STEP 2 — Hierarchy Analysis

```
Root (SVG Canvas: 2798 × 1536)
├── Base Platform [STATIC]
│   ├── Ground Structure (Left Ramp) [STATIC]
│   │   └── Motor Housing [STATIC]
│   │       └── Drive Assembly
│   │           ├── Secondary Gear/Sheave [ROTATING]
│   │           ├── Drive Belt [TRANSLATING]
│   │           └── Primary Crank (Flywheel) [ROTATING]
│   │               └── Counterweight [FIXED TO CRANK]
│   ├── Samson Post (A-Frame Tower) [STATIC]
│   │   ├── Tower Cross-Bracing & Ladder [STATIC]
│   │   ├── Beam Pivot Bearing [STATIC]
│   │   └── Walking Beam [OSCILLATING — pivots at bearing]
│   │       ├── Horsehead [FIXED TO BEAM]
│   │       │   └── Polish Rod / Bridle Cable [RECIPROCATING]
│   │       └── Equalizer / Beam-End Bracket [FIXED TO BEAM]
│   └── Wellhead Assembly [STATIC]
│       └── Wellhead Valve Handle [STATIC]
└── Pitman Arm [TWO-BAR LINK — connects Crank pin to Beam equalizer]
```

### Transform Inheritance

| Child | Inherits From | Transform Type |
|-------|--------------|----------------|
| Horsehead | Walking Beam | Rotation about beam pivot |
| Equalizer | Walking Beam | Rotation about beam pivot |
| Polish Rod | Horsehead (partial) | Vertical translation derived from horsehead arc |
| Counterweight | Primary Crank | Rotation about crank center |
| Secondary Gear | Motor (implicit) | Rotation about its own center |
| Drive Belt | Crank + Sheave | Runs along path between two sheaves |

---

## STEP 3 — Joint Detection

| Joint ID | Joint Type | Component A | Component B | DoF | Axis of Motion | Estimated Pivot (X, Y) | Confidence |
|----------|-----------|-------------|-------------|-----|-----------------|------------------------|------------|
| J1 | **Revolute (Pin)** | Samson Post | Walking Beam | 1 | Z-axis (out of plane) | **(1489, 418)** | 95% — confirmed by existing animation code |
| J2 | **Revolute (Pin)** | Primary Crank | Crank Pin | 1 | Z-axis | **(556, 1084)** | 95% — confirmed by animation code |
| J3 | **Revolute (Pin)** | Pitman Arm (top) | Equalizer on Beam | 1 | Z-axis | **Beam tail end, ~(800, 540)** — varies with beam angle | 75% — estimated |
| J4 | **Revolute (Pin)** | Pitman Arm (bottom) | Crank Pin | 1 | Z-axis | **On crank circle, r=80 from (556, 1084)** | 90% — from CR=80 in code |
| J5 | **Slider (Virtual)** | Polish Rod | Wellhead Stuffing Box | 1 | Local Y (vertical) | **~(2200, 1000)** entry point | 80% — estimated |
| J6 | **Fixed (Rigid)** | Horsehead | Walking Beam | 0 | — | — | 95% |
| J7 | **Fixed (Rigid)** | Counterweight | Primary Crank | 0 | — | — | 95% |
| J8 | **Fixed (Rigid)** | Equalizer | Walking Beam | 0 | — | — | 90% |
| J9 | **Revolute** | Motor Shaft | Secondary Gear | 1 | Z-axis | **(420, 1300)** | 85% |
| J10 | **Belt Drive** | Secondary Gear | Primary Crank | 1 (coupled) | Z-axis (both) | Linked by belt path | 85% |
| J11 | **Fixed** | Samson Post | Base Platform | 0 | — | — | 99% |
| J12 | **Wire/Cable** | Horsehead | Polish Rod | 1 | Tangent to horsehead curve | **~(2100, 500)** wrap point | 75% |

---

## STEP 4 — Pivot Analysis

| Component | Pivot X | Pivot Y | Rotation Axis | Rotation Range | Reasoning |
|-----------|---------|---------|--------------|----------------|-----------|
| Walking Beam | **1489** | **418** | Z (perpendicular to SVG plane) | **±8° to ±12°** from horizontal | Confirmed by animation code (PX, PY). Beam tilts CW (horsehead down) and CCW (horsehead up). Typical industrial range. |
| Primary Crank | **556** | **1084** | Z | **Full 360°** continuous | Confirmed by animation code (CX, CY). Motor drives continuous rotation. |
| Secondary Gear | **420** | **1300** | Z | **Full 360°** continuous | Visual center of smaller gear circle. Coupled to crank via belt. |
| Pitman Arm (top pin) | ~**800** | ~**540** | Z | Limited by beam oscillation | End of beam tail. Moves along arc as beam oscillates. Estimated from beam clip polygon. |
| Pitman Arm (bottom pin) | Varies | Varies | Z | Full 360° (traces circle r=80 around crank center) | Rides on crank pin at radius CR=80 from (556, 1084). |
| Polish Rod | **~2200** | ~**550–1000** | — (linear) | Vertical travel ≈ **200–400 SVG units** | Horsehead arc radius determines stroke length. |
| Horsehead (wire wrap) | ~**2100** | ~**450** | Z (inherits beam rotation) | Same as beam | Fixed to beam; the cable wraps around its curved surface. |

---

## STEP 5 — Motion Chain

```
Electric Motor (implicit, inside motor housing)
    ↓ [shaft coupling]
Secondary Gear/Sheave — rotates at (420, 1300)
    ↓ [belt drive — speed reduction]
Primary Crank — rotates at (556, 1084)
    ↓ [crank pin at radius CR=80]
Pitman Arm — rigid link, length PM=607
    ↓ [pin joint at beam tail]
Walking Beam — oscillates about pivot (1489, 418)
    ↓ [rigid attachment at beam head]
Horsehead — arc motion
    ↓ [wire rope / bridle cable, tangent to curve]
Polish Rod — reciprocates vertically
    ↓ [through stuffing box]
Downhole Sucker Rod Pump (not shown)
```

### Drive Relationships

| Driver | Driven | Mechanism | Ratio |
|--------|--------|-----------|-------|
| Motor | Secondary Gear | Direct shaft | 1:1 |
| Secondary Gear | Primary Crank | Belt drive | Estimated **3:1 to 5:1** reduction (sheave diameter ratio ~160:200 visible, but actual ratio depends on pulley mounting) |
| Crank Pin | Pitman Arm (bottom) | Eccentric pin | Crank radius CR = 80 |
| Pitman Arm (top) | Walking Beam | Pin joint | Lever ratio ≈ BL/(beam total length) |
| Beam Head | Horsehead | Rigid | 1:1 angular |
| Horsehead | Polish Rod | Cable wrap | Near-linear vertical translation |

---

## STEP 6 — Mechanical Constraints

| # | Constraint | Description |
|---|-----------|-------------|
| C1 | **Rigid beam** | Walking beam cannot flex, stretch, compress, or deform. It is a rigid lever arm. |
| C2 | **Constant pitman length** | Pitman arm length PM=607 is constant. No telescoping, no scaling. |
| C3 | **Constant crank radius** | Crank pin orbits at fixed CR=80 from crank center. No eccentricity change. |
| C4 | **Constant beam length** | BL=742 (pivot to pitman connection) is constant. |
| C5 | **Beam rotates only about pivot** | Walking beam has one rotational DoF about (1489, 418). No translation. |
| C6 | **Crank rotates only about center** | Primary crank has one rotational DoF about (556, 1084). |
| C7 | **Polish rod vertical only** | Rod moves purely vertically through the stuffing box. No lateral displacement. |
| C8 | **No self-intersection** | Counterweight, pitman arm, and beam must not intersect each other or the tower at any crank angle. |
| C9 | **Counterweight fixed to crank** | Rotates rigidly with the crank — same angular velocity, same pivot. |
| C10 | **Horsehead fixed to beam** | No relative motion between horsehead and beam. |
| C11 | **Four-bar linkage closure** | The system forms a four-bar linkage: Ground (fixed) → Crank → Pitman → Beam → Ground. The linkage must close at all crank angles. |
| C12 | **Grashof condition** | Crank must be the shortest link to enable full rotation (crank-rocker configuration). CR=80 < PM=607 < BL=742. Verified. |
| C13 | **Belt tangency** | Drive belt maintains tangent contact with both sheaves at all times. |
| C14 | **No beam tipping** | Beam cannot rotate past the tower structure. Angular limits enforced by geometry. |
| C15 | **Tower is grounded** | Samson post does not translate or rotate. Fixed to base. |

---

## STEP 7 — Degrees of Freedom

| Component | Allowed Translation | Allowed Rotation | Allowed Scale | Allowed Deformation | Movement Axis | Maximum Range |
|-----------|-------------------|------------------|---------------|--------------------|--------------|--------------| 
| Base Platform | None | None | None | None | — | Fixed |
| Samson Post | None | None | None | None | — | Fixed |
| Tower Bracing/Ladder | None | None | None | None | — | Fixed |
| Walking Beam | None | **Z-axis rotation about (1489, 418)** | None | None | Z | ≈ ±10° (estimated 20° total sweep) |
| Horsehead | None (inherits beam) | **Z-axis** (same as beam) | None | None | Z | Same as beam |
| Primary Crank | None | **Z-axis rotation about (556, 1084)** | None | None | Z | **360° continuous** |
| Counterweight | None (inherits crank) | **Z-axis** (same as crank) | None | None | Z | 360° continuous |
| Secondary Gear | None | **Z-axis rotation about (420, 1300)** | None | None | Z | 360° continuous |
| Pitman Arm | **Both ends translate along arcs** | **Z-axis** (changes orientation) | None | None | Z | Limited by linkage geometry |
| Polish Rod | **Y-axis only** | None | None | None | Vertical | ≈ 200–400 SVG units stroke |
| Drive Belt | Along belt path | None | None | None | Tangent path | Continuous |
| Motor Housing | None | None | None | None | — | Fixed |
| Wellhead Assembly | None | None | None | None | — | Fixed |

**System DoF = 1** — The entire mechanism has exactly one degree of freedom. Specifying the crank angle fully determines all other positions.

---

## STEP 8 — Motion Characteristics

### Driving Component
**Primary Crank** at (556, 1084), driven by the motor through the belt/sheave system.

### Cycle Period
- Motor speed: Typical field pumpjack runs at **6–15 strokes per minute**
- For animation at 30 fps, 90 frames = 3 seconds = **1 complete revolution** (per existing code)
- Real-world: ~4–10 second cycle period

### Motion Analysis by Component

| Component | Motion Type | Profile | Phase (relative to crank angle θ) | Velocity |
|-----------|-----------|---------|------------------------------------|-----------| 
| Primary Crank | **Circular** | Constant angular velocity | θ (reference) | ω = 2π / T |
| Counterweight | **Circular** | Same as crank | θ (same) | Same as crank |
| Secondary Gear | **Circular** | Constant (belt-coupled) | θ × ratio | ω × belt ratio |
| Pitman Arm | **Compound** (translation + rotation) | Complex — orientation varies sinusoidally | θ | Non-uniform |
| Walking Beam | **Oscillatory** | **Near-sinusoidal** but asymmetric (due to linkage geometry) | Peaks near θ = 0° and 180° | Non-uniform angular velocity |
| Horsehead | **Oscillatory arc** | Same as beam | Same as beam | Same as beam angular × radius |
| Polish Rod | **Reciprocating linear** | **Near-sinusoidal** but with harmonic distortion from four-bar linkage | ~90° phase lag from crank TDC | Approximately SHM with 2nd harmonic |
| Drive Belt | **Linear (tangent)** | Constant surface speed | Continuous | v = ω × sheave radius |

### Beam Angle Computation (from existing code)

The beam angle `β` is computed from crank angle `θ` using the four-bar linkage solution:

```
kx = CX + CR × cos(θ)
ky = CY + CR × sin(θ)
dx = kx - PX
dy = ky - PY
d = √(dx² + dy²)
γ = atan2(dy, dx)
β = γ + acos((BL² + d² - PM²) / (2 × BL × d))
```

This produces a **compound oscillatory** motion — not purely sinusoidal, but close. The asymmetry comes from the linkage geometry where the crank center is offset below and to the left of the beam pivot.

### Acceleration Profile
- **Crank**: Zero angular acceleration (constant speed motor)
- **Beam**: Non-zero, non-constant angular acceleration — peaks at top and bottom dead center
- **Polish Rod**: Acceleration peaks drive the sucker rod pump stroke — maximum deceleration at top of stroke, maximum acceleration at bottom

---

## STEP 9 — Physical Realism Violations to Avoid

| # | Violation | Why It's Wrong | How to Prevent |
|---|-----------|---------------|----------------|
| V1 | **Pitman arm stretching** | If pitman is drawn as a simple line from beam to crank, and one end moves without proper linkage math, the arm length changes | Always compute both endpoints using the four-bar linkage solution |
| V2 | **Beam floating off pivot** | If beam translation is applied instead of rotation | Beam must only rotate about (1489, 418), never translate |
| V3 | **Crank orbit drifting** | If crank center shifts during animation | Crank center (556, 1084) must be absolutely fixed |
| V4 | **Counterweight not tracking crank** | If counterweight rotates independently | Counterweight MUST have identical rotation as crank |
| V5 | **Polish rod lateral motion** | Rod swinging side to side | Rod must remain strictly vertical |
| V6 | **Horsehead separating from beam** | If animated separately | Horsehead must be rigidly grouped with beam |
| V7 | **Beam-tower intersection** | If beam oscillation range is too large | Clamp beam angle to ±12° maximum |
| V8 | **Belt slipping off sheaves** | If belt animation doesn't maintain tangency | Belt must follow mathematical tangent path between circles |
| V9 | **Impossible pitman angle** | At certain crank angles, the acos in the linkage solution may be out of range [-1, 1] | Clamp the cosine value (already done in existing code) |
| V10 | **Constant angular velocity on beam** | Beam does NOT rotate at constant speed | Must use full four-bar solution, not simple sine |
| V11 | **Secondary gear counter-rotating** | If gear animation rotates backward | Both gears rotate in the same direction (belt drive, not mesh) — unless belt is crossed |
| V12 | **Deforming structural elements** | Tower, base, or beam stretching/scaling | Only apply rotation transforms to movable parts; never scale |

---

## STEP 10 — Animation Specification

### A. Walking Beam

| Property | Value |
|----------|-------|
| Transform Origin | **(1489, 418)** |
| Animation Type | Rotation |
| Rotation Range | **±8° to ±12°** (computed from four-bar linkage) |
| Parent | Samson Post (static) |
| Driver | Pitman Arm (from Crank) |
| Follower | Horsehead, Equalizer |
| Timing | 1 full oscillation per crank revolution |
| Ease Curve | **None** — motion is physically computed, not eased |
| Loop | Seamless — crank angle 0 → 2π |
| SVG Clip Region | `polygon: 640,30 2290,30 2290,740 1900,740 1900,560 640,560` |
| Constraints | Rigid body, no deformation, rotation only |

### B. Primary Crank + Counterweight

| Property | Value |
|----------|-------|
| Transform Origin | **(556, 1084)** |
| Animation Type | Continuous rotation |
| Rotation Range | **0° → 360°** per cycle |
| Parent | Drive Assembly (static) |
| Driver | Motor (implicit) |
| Follower | Pitman Arm |
| Timing | Constant angular velocity |
| Ease Curve | **Linear** (constant speed motor) |
| Loop | `rotate(0deg)` → `rotate(360deg)` seamless |
| SVG Clip Regions | `circle(556, 1084, 200)` for main crank, `circle(420, 1300, 160)` for secondary gear |
| Constraints | Constant radius, fixed center |

### C. Pitman Arm

| Property | Value |
|----------|-------|
| Transform Origin | N/A (both ends move) |
| Animation Type | Two-point rigid link |
| Endpoint 1 | Crank pin: `(556 + 80×cos(θ), 1084 + 80×sin(θ))` |
| Endpoint 2 | Beam tail: `(1489 + 742×cos(β), 418 + 742×sin(β))` |
| Parent | None (free link) |
| Driver | Crank pin |
| Follower | Walking Beam |
| Timing | Continuous, phase-locked to crank |
| Rendering | `<line>` or `<rect>` drawn between computed endpoints |
| Constraints | Constant length PM=607, no stretching |
| Stroke Style | `stroke="#384D5E"`, `strokeWidth=20`, `strokeLinecap="round"` |

### D. Polish Rod

| Property | Value |
|----------|-------|
| Transform Origin | Fixed at wellhead entry point (~2200, 1000) |
| Animation Type | Vertical translation |
| Translation Range | **±100 to ±200 SVG units** (derived from horsehead arc) |
| Parent | Wellhead (static base) |
| Driver | Horsehead cable wrap point |
| Follower | Downhole pump (not shown) |
| Timing | Same period as beam oscillation |
| Ease Curve | Physically computed from horsehead geometry |
| Constraints | Vertical only, no lateral movement, no rotation |
| Note | Currently not separately animated in existing code — part of static clip |

### E. Secondary Gear

| Property | Value |
|----------|-------|
| Transform Origin | **(420, 1300)** |
| Animation Type | Continuous rotation |
| Rotation Range | **0° → 360°** (may be geared — multiply by belt ratio) |
| Timing | Phase-locked to primary crank via belt |
| Ease Curve | Linear |
| Constraints | Fixed center, constant speed |
| Note | Currently grouped with crank clip in existing code |

### F. Drive Belt

| Property | Value |
|----------|-------|
| Animation Type | Path animation (belt surface translates along path) |
| Path | Tangent lines between two circles + arc segments |
| Timing | Surface speed = crank angular velocity × crank sheave radius |
| Note | Complex to animate — consider using dashed stroke with `stroke-dashoffset` animation |
| Confidence | 60% — belt is drawn as static fill, exact path unclear |

### Synchronization Requirements

1. **Crank angle θ** is the single master variable
2. **Beam angle β** is computed from θ via four-bar linkage equation
3. **Pitman endpoints** are computed from θ (bottom) and β (top)
4. **Polish rod Y** is computed from horsehead geometry + β
5. **Counterweight** uses same θ as crank
6. **Secondary gear** uses θ × gear ratio
7. **All moving parts must update in the same frame — no lag**

---

## STEP 11 — SVG Optimization Suggestions

### Critical Optimizations

| # | Suggestion | Priority | Description |
|---|-----------|----------|-------------|
| 1 | **Add `<g>` groups with IDs** | **HIGH** | Group paths into semantic components: `<g id="walking-beam">`, `<g id="crank-assembly">`, `<g id="tower">`, `<g id="base">`, `<g id="horsehead">`, `<g id="polish-rod">`, `<g id="wellhead">`, `<g id="counterweight">`, `<g id="pitman-arm">` |
| 2 | **Separate movable from static** | **HIGH** | Split all movable components into their own groups. Currently, movable and static geometry share the same color/fill and cannot be distinguished without clip paths. |
| 3 | **Move pivots to group `transform-origin`** | **HIGH** | Set `transform-origin` on each movable group to its mechanical pivot point. Walking beam: `1489 418`. Crank: `556 1084`. |
| 4 | **Extract pitman arm as explicit element** | **HIGH** | The pitman arm is not drawn in the SVG at all — it exists only as a `<line>` in the animation code. Either add it as a `<rect>` / `<line>` element, or accept the programmatic approach. |
| 5 | **Separate polish rod** | **MEDIUM** | The polish rod (vertical hanging element) is currently part of the static body. Extract it into its own `<g id="polish-rod">` for vertical translation animation. |
| 6 | **Merge redundant paths** | **MEDIUM** | Many paths of identical fill color that belong to the same rigid body could be merged into compound paths, reducing element count. |
| 7 | **Rename the single root group** | **LOW** | Currently `id="Layer_1"` — rename to `id="pumpjack"`. |
| 8 | **Add machine-readable pivot markers** | **LOW** | Add invisible `<circle>` elements at pivot points with `class="pivot"` for programmatic pivot detection. |
| 9 | **Remove background fill** | **LOW** | The first path (`#FEFEFE`) fills the entire canvas as a white background. Remove it and use CSS `background-color` instead. |
| 10 | **Separate belt path** | **MEDIUM** | The drive belt path should be its own `<path>` with a dasharray for animated belt movement. |

### Recommended Group Structure

```xml
<svg viewBox="0 0 2798 1536">
  <!-- Static elements -->
  <g id="base-platform">...</g>
  <g id="ground-ramp">...</g>
  <g id="samson-post">
    <g id="tower-frame">...</g>
    <g id="cross-bracing">...</g>
    <g id="ladder">...</g>
  </g>
  <g id="motor-housing">...</g>
  <g id="wellhead">...</g>

  <!-- Movable: Crank assembly (rotates around 556, 1084) -->
  <g id="crank-assembly" transform-origin="556 1084">
    <g id="primary-crank">...</g>
    <g id="counterweight">...</g>
  </g>

  <!-- Movable: Secondary gear (rotates around 420, 1300) -->
  <g id="secondary-gear" transform-origin="420 1300">...</g>

  <!-- Movable: Drive belt -->
  <g id="drive-belt">...</g>

  <!-- Movable: Pitman arm (drawn programmatically) -->
  <line id="pitman-arm" stroke="#384D5E" stroke-width="20" stroke-linecap="round" />

  <!-- Movable: Walking beam (rotates around 1489, 418) -->
  <g id="walking-beam" transform-origin="1489 418">
    <g id="beam-body">...</g>
    <g id="horsehead">...</g>
    <g id="equalizer">...</g>
  </g>

  <!-- Movable: Polish rod (vertical translation) -->
  <g id="polish-rod">...</g>

  <!-- Pivot markers (invisible) -->
  <circle class="pivot" id="beam-pivot" cx="1489" cy="418" r="0" />
  <circle class="pivot" id="crank-pivot" cx="556" cy="1084" r="0" />
  <circle class="pivot" id="gear-pivot" cx="420" cy="1300" r="0" />
</svg>
```

---

## Appendix A — Key Dimensions (SVG Units)

| Parameter | Symbol | Value | Source |
|-----------|--------|-------|--------|
| SVG Width | — | 2798 | SVG viewBox |
| SVG Height | — | 1536 | SVG viewBox |
| Beam Pivot X | PX | **1489** | Animation code |
| Beam Pivot Y | PY | **418** | Animation code |
| Crank Center X | CX | **556** | Animation code |
| Crank Center Y | CY | **1084** | Animation code |
| Crank Radius | CR | **80** | Animation code |
| Beam Length (pivot to pitman) | BL | **742** | Animation code |
| Pitman Arm Length | PM | **607** | Animation code |
| Initial Crank Angle | — | **0.1 rad** (~5.7°) | Animation code |
| Secondary Gear Center | — | **(420, 1300)** | Visual estimate |
| Secondary Gear Radius | — | **~160** | From clip circle |
| Primary Crank Visual Radius | — | **~200** | From clip circle |
| Beam Clip Region | — | `640,30 → 2290,30 → 2290,740 → 1900,740 → 1900,560 → 640,560` | Animation code |

## Appendix B — Color-to-Region Mapping

| Color | Hex | Region |
|-------|-----|--------|
| White/Background | `#FEFEFE`, `#FDFDFD`, `#FCFCFC`, `#FCFDFD` | Sky, background fill, tower interior voids |
| Near-white | `#F5F7F8`, `#F6F8F9`, `#F9FAFA`, `#FAFBFB`, `#F5FAFA` | Light structural highlights, tower details |
| Dark Navy | `#103246` | Main structural mass (beam body, tower frame, base) |
| Very Dark Navy | `#0D3347` | Deepest shadows (inner mechanism, pump housing interior) |
| Dark Teal | `#153548` | Foundation elements, connection joints |
| Dark Slate | `#354D5E`, `#364E5F` | Structural shadows, counterweight, motion linkage |
| Blue-Gray | `#385060` | Tower cross-members, base structure, beam brackets |
| Slate Blue | `#3A5061` | A-frame elements, additional structure |
| Steel Gray | `#394F60` | Drive mechanism housing, tower details |
| Medium Gray-Blue | `#3C5263` | Beam surface, crank face |
| Teal (Primary) | `#1B7C94` | Horsehead fill, wellhead accents, gear highlights, pump |
| Teal (Light) | `#1D7891` | Cable, rod, belt accents |
| Teal (Dark) | `#177C94` | Gear teeth, flywheel spokes |
| Teal (Medium) | `#187C94` | Pump mechanism internal details |
| Teal (Bright) | `#147E97` | Horsehead bright face |
| Mid Slate | `#516774` | Fine detail paths (tiny connectors) |

## Appendix C — Four-Bar Linkage Diagram

```
                        BL = 742
    Beam Pivot ●─────────────────────● Equalizer (Pitman top)
    (1489,418) |                      |
               |                      | PM = 607
               | Ground Link          |
               | (fixed frame)        |
               |                      |
    Crank Ctr  ●──────● Crank Pin     
    (556,1084)  CR=80  (moves on circle)
```

The four-bar linkage type is **crank-rocker**:
- **Crank** (CR=80): shortest link — full rotation
- **Coupler/Pitman** (PM=607): connecting link
- **Rocker/Beam arm** (BL=742): longest link — oscillates
- **Ground link**: distance from crank center to beam pivot = √((1489-556)² + (418-1084)²) = √(933² + 666²) = √(870489 + 443556) = √1314045 ≈ **1146**

Grashof check: shortest + longest < sum of other two?
80 + 1146 = 1226 vs 607 + 742 = 1349
1226 < 1349 ✓ — **Grashof linkage confirmed**, crank can make full revolution.

---

*This specification is intended to be sufficient for another AI system to animate the pumpjack SVG without additional human instructions, while preserving physically realistic kinematics.*
