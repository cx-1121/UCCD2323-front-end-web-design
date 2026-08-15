---
name: RE:FUTURE — Green Tech Club
description: A story-driven club site that carries the visitor from an industrial past into a clean future, and records the fact that they came out the other side.
colors:
  surface: "#f7f8fa"
  surface-raised: "#ffffff"
  surface-mint: "#eef6f2"
  ink: "#0c1a13"
  ink-soft: "rgba(12, 26, 19, 0.72)"
  ink-faint: "rgba(12, 26, 19, 0.66)"
  signal: "#047857"
  signal-deep: "#065f46"
  signal-teal: "#0f766e"
  signal-lime: "#4d7c0f"
  hairline: "rgba(12, 46, 32, 0.11)"
  vault-deep: "#060908"
  vault: "#0b0f0e"
  sheet: "#c4cfc8"
  sheet-edge: "#a9b5ad"
  vault-ink: "#1b2320"
  vault-ink-faint: "rgba(27, 35, 32, 0.75)"
  aniline: "#6b3fa0"
  living: "#1fa363"
  living-ink: "#0a5c34"
  living-stamp: "#0f7a45"
  crisis-ember: "#d9482a"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(2rem, 8vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  display-quiet:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(1.9rem, 5.4vw, 4rem)"
    fontWeight: 200
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.2em"
  control:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.005em"
  typed:
    fontFamily: "Courier Prime, ui-monospace, monospace"
    fontSize: "clamp(0.95rem, 2.1vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  stamped:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "clamp(1.25rem, 4.4vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  shell: "2.125rem"
  core: "1.75rem"
  tile: "1.375rem"
  pill: "999px"
  paper: "0px"
spacing:
  xs: "0.3125rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "7px 7px 7px 20px"
    typography: "{typography.control}"
  button-primary-hover:
    backgroundColor: "{colors.signal-deep}"
    textColor: "{colors.surface}"
  button-vault:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.vault-ink}"
    rounded: "{rounded.pill}"
    padding: "7px 7px 7px 20px"
    typography: "{typography.stamped}"
  drawer:
    backgroundColor: "rgba(196, 207, 200, 0.04)"
    textColor: "{colors.sheet}"
    rounded: "{rounded.paper}"
    padding: "12px 14px"
  drawer-hover:
    backgroundColor: "rgba(31, 163, 99, 0.1)"
    textColor: "{colors.sheet}"
  specimen-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.vault-ink}"
    rounded: "{rounded.paper}"
    padding: "clamp(1rem, 2.4vw, 1.5rem)"
---

# Design

## Overview

**North star: the site is a journey with a record.** RE:FUTURE is not a club
site with pages; it is one authored descent and climb that the visitor scrolls
through, and it remembers that they came out the other side.

The project runs **three deliberate worlds**, and they do not converge. Mixing
them is the main way new work goes wrong here.

1. **The cinematic** (`/`) — the industrial descent. Loud, heavy, urgent: Outfit
   at 800/900, solid ember ink on near-black, smoke and particle canvas.
2. **The paper interior** (`/home`, `/explore`, `/projects`, …) — off-white
   `--surface` with a green cast, `--ink` type, concentric double-bezel
   enclosures, restrained motion.
3. **The vault** (`/?replay=true`) — the revisit surface. A herbarium specimen
   sheet held in a seed vault at −18 °C. Documented in full below.

Anti-reference, confirmed by the user: **a dark full-screen overlay with a
blurred backdrop, a centred message and one primary button.** That is what the
revisit levels were before this system, and it is the thing being replaced.

## Colors

Three palettes, one per world. Never borrow across them.

**Cinematic** — `--intro-ink` `#f1f5f9` on near-black, `--intro-ember`
`#d9482a` for the crisis beats. Gradient-clipped text is banned: it has no
standard fallback and renders the headline invisible where the `-webkit` pair
is ignored. Emphasis comes from weight and scale.

**Paper interior** — `--surface` `#f7f8fa` ground, `--ink` type, `--signal`
family for action. Never pure `#ffffff` for the page: pure values flatten the
elevation between page, tray and card.

**Vault** — four named roles, and the discipline is what makes it work:

| role | token | use |
|---|---|---|
| ground | `--vault` `#0b0f0e` over `--vault-deep` | the room, worked in tonal depth |
| object | `--sheet` `#c4cfc8` | the specimen card, lit cold |
| record | `--aniline` `#6b3fa0` | accession stamps and annotation rules |
| life | `--living` `#1fa363` | reserved for what is alive |

**The sheet is never parchment.** It reads pale steel-green because it is lit at
−18 °C. Cream, ivory, or lamplight on this surface is an execution failure, not
a variation — parchment is the default this world was chosen against.

**One colour has two inks.** Living green is `--living` `#1fa363` in the vault
dark (5.95:1) and `--living-ink` `#0a5c34` on the pale sheet (5.05:1). A lit
thing in the dark and ink on paper are not the same colour, and using one value
for both fails contrast on one of the two grounds.

Contrast floors that are load-bearing, each measured against its real composited
ground: `--vault-ink-faint` at **0.75** alpha (5.36:1 on the sheet, 4.76:1 on
the older annotation slips); vault-side small type at **0.62** alpha (5.16:1).
Below those the type drops under 4.5:1.

## Typography

Five roles across the project. Two of them are shared by every world; the rest
belong to exactly one.

- **display** (shared shape, per-world face) — Outfit 800 in the cinematic,
  Plus Jakarta Sans 200 in the revisit prologue-era interior. Tracking floor
  `-0.04em`; never a pixel value, which loosens as a clamped size grows.
- **label** — JetBrains Mono, `0.6875rem`, `0.2em`, uppercase. The one role
  every world shares, because it is instrumentation rather than voice.
- **control** — Plus Jakarta Sans 600, `0.9375rem`. Every button label.
- **typed** — Courier Prime. The vault only. This is not monospace-as-technical:
  a determination label is literally typewritten, so it is the artifact's own
  type.
- **stamped** — Archivo Narrow 700, uppercase, tracked. The vault only, for
  rubber-stamp and engraved lettering.

Body measure stays in 45–75ch. Small light text on dark grounds carries one
extra weight step, because it loses a perceptual step there.

## Layout

Mobile-first, single column, expanding at `60rem` where the vault's bench
becomes a two-column grid with the sheet in column 2 and the annotation slips
pasted off its left edge.

`.vault` is a scroll container and uses `justify-content: safe center`, never
plain centring — ordinary centring pushes overflowing content out through the
top of a scroll container where it can never be reached. At level 3 the
catalogue makes the content taller than the viewport, so this is load-bearing.

Landing scroll fuel is 630vh desktop / 400vh mobile, carrying 93s of scrubbed
timeline.

## Elevation & Depth

**Layered, and always with an offset.** Shadows carry both an offset and a soft
blur; a zero-offset coloured halo is decoration, not depth.

The paper interior uses concentric **double-bezel** enclosures: an outer tray at
`{rounded.shell}` holding an inner core at `{rounded.core}`, the core carrying
an inset top highlight so it reads as machined rather than drawn.

The vault does not use bezels. Its depth is physical instead: the sheet casts a
long soft shadow onto the vault floor, mounting straps cast 1px shadows onto the
sheet, and annotation slips cast their own. Ground texture is *worked* —
stacked repeating radial gradients — never a single gradient wash.

## Shapes

Two form languages, chosen by world.

- **Pill and squircle** — the paper interior and every control everywhere.
  `{rounded.pill}` for buttons, `{rounded.shell}`/`{rounded.core}` concentric.
- **Square** — the vault. Paper, slips, drawers and the mount all have
  `{rounded.paper}` (0). A rounded specimen sheet is not a specimen sheet.
  The only rounded object in the vault is the leave control, because a control
  belongs to the site rather than to the artifact.

## Components

**button (island, all worlds)** — outer tray `5px` padding with a hairline ring,
inner core at `7px 7px 7px 20px`, gap `12px`, trailing glyph in its own `2rem`
circular well. Hover moves the glyph `translate3d(3px, -1px, 0) scale(1.05)`;
active scales the whole control to `0.98`. The tray and core are one design in
two tonal variants — never two designs.

**specimen sheet** — `overflow: hidden`, so ink stays on paper and the rotated
stamp can never escape into the viewport. Lifts toward the pointer via a custom
property written from a rAF-throttled `pointermove`, so the effect is one
compositor-only change and React never re-renders.

**stamp** — Archivo Narrow 700 caps, boxed, rotated `-8deg` with
`transform-origin: 100% 50%`, masked with a radial so the impression inks
unevenly. Presses in over 420ms on `cubic-bezier(0.05, 0.7, 0.1, 1)`: a strike,
never an overshoot. The rotation must be restated inside the keyframes or the
tilt drops for the duration.

**drawer** — full-width, flush, `2px` left rule, stacked like a filing run with
a `2px` gap. Hover slides `padding-left` `0.875rem → 1.375rem`, which reads as
the drawer pulling out. Unaccessioned routes stay fully legible at 0.62 alpha
and are marked by a state label; they are records, not disabled controls.

## Do's and Don'ts

**Do**

- Pick ink from the ground it actually lands on. On the landing dawn the
  background travels near-black → olive → cream, so the ink walks cool white →
  warm white → lit white → warm dark. Measure the composited stack, not the
  token.
- Spend the club's green once per surface, on the thing that earns it.
- Animate transform and opacity only; reach past them with blur, mask and
  clip-path when they stay smooth.
- Resolve motion-heavy sequences to their end state under
  `prefers-reduced-motion` rather than withholding the content.

**Don't**

- Don't render the vault warm. No cream, parchment, ivory or lamplight.
- Don't use gradient-clipped text anywhere.
- Don't put a kicker or eyebrow above a heading. The revisit levels' opening
  lines are the first line of the statement, not a label above it.
- Don't let a rounded corner into the vault's paper objects.
- Don't reintroduce fixed navigation over the cinematic; the only way onward is
  the surface's own answer.
- Don't use bounce or elastic easing. Exponential ease-out from an
  already-visible default.

### Not canonized

Two things the build carries that are **not** system rules. `Montserrat` is
still loaded in `index.html` across four weights while sitting only behind
Outfit as a fallback, so it can never be selected — a dead download, recorded
here as a defect rather than as a type decision. And nothing in `src/` themes
`::selection` or `caret-color`; the browser defaults ship, which belongs to no
world in this file.
