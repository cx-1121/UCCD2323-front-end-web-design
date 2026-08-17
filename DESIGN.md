---
name: RE:FUTURE — Green Tech Club
description: A seed vault of the fossil century that warms and opens as you read it, told in eight stops of one continuous light.
colors:
  intro-ink: "#f1f5f9"
  intro-ember: "#d9482a"
  ground-stacks: "#0b0f0e"
  ground-soot: "#141210"
  ground-haze: "#2b3033"
  ground-thaw: "#6c6355"
  ground-firstlight: "#e9dfd0"
  ground-daylight: "#f2efe8"
  ground-sky: "#eef3f4"
  ground-living: "#f7f8fa"
  accent-aniline: "#8b63c4"
  accent-ember: "#e8613f"
  accent-cold-signal: "#6fb9c4"
  accent-lamp: "#ffc46b"
  accent-gold: "#a8631a"
  accent-club-green: "#1d6b4a"
  accent-teal: "#0f766e"
  accent-emerald: "#047857"
  sheet-cold: "#c4cfc8"
  sheet-cold-edge: "#a9b5ad"
  paper-white: "#ffffff"
  ink-vault: "#c4cfc8"
  ink-paper: "#0c1a13"
  living: "#1fa363"
  living-ink: "#0a5c34"
  spent: "#a8321a"
  hairline: "rgba(12, 46, 32, 0.11)"
typography:
  display:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "clamp(2.25rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "0.005em"
  section:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "clamp(1.5rem, 3.4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "0.02em"
  plate:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "clamp(1.0625rem, 1.6vw, 1.25rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "0.04em"
  control:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  typed:
    fontFamily: "Courier Prime, ui-monospace, Courier New, monospace"
    fontSize: "clamp(1rem, 1.9vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  instrument:
    fontFamily: "Courier Prime, ui-monospace, Courier New, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.2em"
  micro:
    fontFamily: "Courier Prime, ui-monospace, Courier New, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.12em"
  reading:
    fontFamily: "Courier Prime, ui-monospace, Courier New, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.04em"
  hint:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  note:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  list:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  prose:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
rounded:
  paper: "0px"
  pill: "999px"
  tile: "1.375rem"
  card: "1.75rem"
spacing:
  tight: "0.625rem"
  row: "clamp(0.875rem, 2vw, 1.125rem)"
  block: "clamp(1.5rem, 3.5vw, 2.25rem)"
  section: "clamp(3rem, 6vw, 5rem)"
  chapter: "clamp(4.5rem, 12vh, 9rem)"
components:
  action:
    backgroundColor: "{colors.ink-paper}"
    textColor: "{colors.ground-living}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0.8125rem 1.375rem"
  action-hover:
    backgroundColor: "{colors.living-ink}"
    textColor: "#f4f8f5"
  action-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-paper}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0.8125rem 1.375rem"
  action-ghost-hover:
    backgroundColor: "rgba(31, 163, 99, 0.12)"
    textColor: "{colors.ink-paper}"
  sheet:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-paper}"
    rounded: "{rounded.paper}"
    padding: "clamp(1.125rem, 2.6vw, 1.75rem)"
  sheet-vault:
    backgroundColor: "{colors.sheet-cold}"
    textColor: "#1b2320"
    rounded: "{rounded.paper}"
    padding: "clamp(1.125rem, 2.6vw, 1.75rem)"
  drawer:
    backgroundColor: "rgba(20, 32, 31, 0.04)"
    textColor: "{colors.ink-paper}"
    rounded: "{rounded.paper}"
    padding: "clamp(0.75rem, 1.6vw, 1.125rem) clamp(0.875rem, 1.6vw, 1.25rem)"
  drawer-hover:
    backgroundColor: "rgba(31, 163, 99, 0.1)"
    textColor: "{colors.ink-paper}"
  panel:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-paper}"
    rounded: "{rounded.paper}"
    padding: "clamp(1.125rem, 2.4vw, 1.625rem)"
  field:
    backgroundColor: "rgba(28, 33, 29, 0.04)"
    textColor: "{colors.ink-paper}"
    typography: "{typography.typed}"
    rounded: "{rounded.paper}"
    padding: "0.6875rem 0.75rem"
  toggle:
    backgroundColor: "transparent"
    textColor: "rgba(20, 32, 31, 0.75)"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.875rem"
  toggle-active:
    backgroundColor: "#0d5f59"
    textColor: "#ffffff"
---

# Design System: RE:FUTURE — Green Tech Club

## Overview

**Creative North Star: "The Warming Vault"**

The room is a seed vault at −18 °C holding pressed specimens of the fossil century. The site is not a set of pages decorated in that idea — it is one physical event happening to that room: **the vault warms and opens.** A visitor descends into the industrial past, crosses through a mid-tone thaw, and comes out into working daylight, and the interface performs that passage rather than illustrating it.

That is why the interior's colour is a **ladder of eight stops** and not eight hand-painted palettes. Each stop binds the same set of semantic tokens to a different set of values, a section declares where it stands (`data-chapter="soot"`), and everything inside it re-inks. Moving a section along the arc is a one-word edit and no component ever names a literal colour. The last stop is deliberately the paper interior this project already had, unchanged: the arc does not discard the incumbent system, it **arrives at** it.

The register is archival and unglamorous. Statements are typed determinations, not marketing claims; headings are cut like rubber stamps; figures carry their provenance because a figure without a source is not a figure. Density climbs as the reader descends — an opening screen is one sentence, and by the third chapter the page is running live World Bank data. Confirmed anti-reference: **a dark full-screen overlay with a blurred backdrop, a centred message and one primary button.** That is what the revisit levels were before this system, and it is the thing being replaced.

**Key Characteristics:**
- Colour is a mechanism (eight named stops), never a per-page choice.
- Paper objects are square and cast real shadows; only controls are round.
- Three type roles, each with exactly one job, and none of them borrowed.
- Grouping is a rule, a column head and space — not a container.
- Every accent is declared twice: lit on the ground, and as ink on paper.
- Motion settles. Nothing bounces, nothing overshoots.

## Colors

Three worlds, three palettes, and the discipline of not borrowing between them is what keeps each one legible. Within the interior, colour is not chosen per surface — it is read off the ladder.

### Primary

- **Living Green** (`#1fa363` lit / `#0a5c34` as ink): the one colour that does **not** belong to the ladder. Reserved for what is actually alive — a growing world, a renewable share, the reader's own focus ring — and spent roughly once per surface on the thing that earns it. 5.95:1 on the vault ground, 5.05:1 on pale paper.
- **The stop accents**, one per rung, each the character of its own weather: **Aniline** (`#8b63c4`) is the accession stamp in the cold stacks; **Ember** (`#e8613f`) is the fossil century at full throat; **Cold Signal** (`#6fb9c4`) is the airshed seen in daylight; **Lamp** (`#ffc46b`) is the light coming over the crossing; **Raw Gold** (`#a8631a`) is sunrise; **Club Green** (`#1d6b4a`), **Deep Teal** (`#0f766e`) and **Emerald** (`#047857`) carry the three light stops where the club's own work lives.

### Secondary

- **Fired Red** (`#a8321a`): the interior's one negative ink. It means budget already spent, a mechanism that runs hot, or an error — and nothing else. 6.4:1 on any light stop's paper.

### Neutral

- **The eight grounds**, dark to light: **Vault** (`#0b0f0e`) · **Soot** (`#141210`) · **Haze** (`#2b3033`) · **Thaw** (`#6c6355`) · **Firstlight** (`#e9dfd0`) · **Daylight** (`#f2efe8`) · **Sky** (`#eef3f4`) · **Living** (`#f7f8fa`). The first three are cold, smoke-warm and particulate; the last four are paper.
- **Cold Sheet** (`#c4cfc8`, edge `#a9b5ad`): the specimen card's own ground in the vault. It reads pale steel-green **because it is lit at −18 °C**.
- **Paper White** (`#ffffff`) and **Paper Ink** (`#0c1a13`): the object ground and body ink at the light end of the ladder.
- **Cinematic Ink** (`#f1f5f9`) and **Cinematic Ember** (`#d9482a`): the descent's own two colours, on near-black. They belong to that world and travel nowhere else.

### Named Rules

**The Two Inks Rule.** Every accent is declared twice — `--accent`, correct lit on that stop's ground, and `--accent-ink`, the same hue as ink on that stop's paper object. A lit thing in the dark and ink on paper are not the same colour, and one value always fails contrast on one of the two grounds. Measure against the ground the value actually lands on, never against the token.

**The Crossing Rule.** `thaw` is a mid-tone by design and **carries no small text**. Nothing on a thaw ground may be below display scale, or set anywhere but on an object that brings its own ground. A mid-tone cannot hold 4.5:1 against any ink.

**The Living Reserve Rule.** Living green is not an accent and not a brand fill. If a surface has spent it twice, one of the two is decoration — find it and take it back.

**The Never Parchment Rule.** The vault sheet is never cream, ivory, parchment or lamplight. Parchment is the default this world was chosen against; warming it is an execution failure, not a variation.

**The No Borrowed Palette Rule.** Three worlds — cinematic, paper interior, vault — and no colour crosses between them. The ladder is the one sanctioned passage: it travels from the vault's stops into the paper interior's, in order, and its last rung *is* the paper world's tokens. Anything else that mixes two worlds is a mistake.

## Typography

**Display Font:** Archivo Narrow (with Arial Narrow) — the gothic a rubber stamp is cut in.
**Body Font:** Outfit — the only face allowed to run long-form prose.
**Label/Mono Font:** Courier Prime — not monospace-as-technical. A determination label on a specimen sheet is *literally* typewritten, so this is the artifact's own type, and it is the voice of every instrument reading on the site.

**Character:** Three faces with three jobs and no overlap. A stamped heading is short and struck; a typed line is a conclusion the record has reached; set prose is where explanation is allowed to breathe. The pairing reads as a working archive rather than as a brand system, which is the point.

### Hierarchy

- **Display** (Archivo Narrow 700, `clamp(2.25rem, 7vw, 6rem)`, lh 0.94, uppercase): a page's one title. Capped at 6rem — past that a condensed gothic stops reading as lettering and starts reading as texture.
- **Section** (Archivo Narrow 700, `clamp(1.5rem, 3.4vw, 2.5rem)`, lh 0.94): chapter headings.
- **Plate** (Archivo Narrow 700, `clamp(1.0625rem, 1.6vw, 1.25rem)`, ls 0.04em): a heading on an object — a sheet, a record, a panel.
- **Control** (Archivo Narrow 700, `0.9375rem`, ls 0.04em, uppercase): every button label on the site.
- **Typed** (Courier Prime 400, `clamp(1rem, 1.9vw, 1.25rem)`, lh 1.5): the narrative voice. One line per line, and the line the passage turns on is underscored the way a typist marks a determination — 1px, 5px offset, in the stop's accent.
- **Instrument** (Courier Prime 400, `0.6875rem`, ls 0.2em, uppercase): a unit, an accession number, a column head, a state, a source credit. The most-used role on the site.
- **Micro** (Courier Prime 400, `0.625rem`, ls 0.12em, uppercase): source credits, sealed-record states, badges, chart axis labels. The floor — nothing on this site is smaller.
- **Reading** (Courier Prime 400, `0.75rem`, ls 0.04em): a small typed value — a bar's number, a unit beside a figure, a drawer's detail line.
- **Hint** (Outfit 400, `0.8125rem`, lh 1.5): a form hint, a caption, a line of small prose under a control.
- **Note** (Outfit 400, `0.875rem`, lh 1.6, max 72ch): a panel's interpretation, a figure's meaning. Where the site explains what a number is *for*.
- **List** (Outfit 400, `0.9375rem`, lh 1.55): a ledger entry, a roster row, an index body.
- **Prose** (Outfit 400, `1rem`, lh 1.7, max 68ch): explanatory copy. The measure is enforced on the element rather than hoped for.

The small end of the ramp climbs in 1px steps from `0.625rem` to `1.0625rem`. **The step is a size, not a family** — `0.9375rem` is Outfit as a ledger entry and Archivo Narrow as a control label. Pick the size from the density of the block and the family from the role.

### Named Rules

**The Six Word Rule.** A condensed gothic in caps stops being readable somewhere around six words. Stamped roles take short strings only; if the string will not fit in six words, it is prose and belongs in Outfit.

**The Instrument Is Not An Eyebrow Rule.** Courier Prime small caps are never a label sitting above a heading. They are instrumentation — a fact the reader can act on. A heading carries its own weight; an eyebrow above it is a ban, not a preference.

**The One Prose Face Rule.** Only Outfit runs long. Courier Prime past three lines is a wall, and Archivo Narrow past six words is a texture.

## Layout

Mobile-first and **composed twice**, never scaled. Every wide layout is a genuine recomposition — a stacked roster becomes a four-column register, a plate becomes an editorial split with the drawing sticky beside its own reading, an index strip leaves the flow to stand as a rail in the margin.

Two measures carry everything. The **reading column** is `min(100% − 2.5rem, 42rem)`; the **bench** — where editorial splits, filing runs and figure rows live — is `min(100% − 2.5rem, 72rem)`. Above 60rem both take a 5rem gutter. The Dashboard alone runs to 76rem, because it is a data surface and density is the point.

Vertical rhythm is chapter-scale: `clamp(4.5rem, 12vh, 9rem)` of padding per chapter, `clamp(3rem, 6vw, 5rem)` between sections, `clamp(1.5rem, 3.5vw, 2.25rem)` between blocks inside one. Blocks are spaced by a grid `gap` on the stack, never by `p + p` — every block is wrapped in its own entrance element, so the paragraphs are not siblings and an adjacency rule cannot reach them.

Breakpoints in use: **48rem** (row layouts open), **50rem** (editorial splits), **60rem** (gutters widen), **64rem** (the Dashboard's verdict splits), **90rem** (Explore's index leaves the flow).

### Named Rules

**The Half Above, Half Below Rule.** A chapter crossing is painted on **both** sides of the boundary, each side dissolving toward the colour the two stops share. A one-sided blend puts the whole change on one side of a line, and the line stays visible as a band. Depth is `21vh` on desktop, `13vh` on a phone — the blend paints background only, so every viewport-unit of it is dead air.

**The Scroll, Don't Shrink Rule.** Wide content — a chart, a table, a diagram — holds a legible minimum width and scrolls inside its own `overflow-x` container. SVG text scales with the viewBox, so a 600-unit chart fitted to a phone renders its labels at about 4.6 real pixels. Check `renderedWidth / viewBoxWidth`, not the desktop.

## Elevation & Depth

**Physical, never bezelled.** The interior has no trays, no concentric enclosures, no inset machined lips. Depth is what a paper object actually does in a room: a sheet casts a long soft shadow onto the floor, mounting straps cast 1px shadows onto the sheet, a pasted slip casts its own. Ground texture is *worked* — an off-axis lit radial and an off-axis shadowed one, plus instrument grain at the stop's own opacity — never a single gradient wash.

Shadows split by ground rather than by stop. On a dark ground the shadow is black and long, because the object is far lighter than the room. On a light ground it is tinted to the ground's own hue, because a pure-black shadow on paper reads as dirt.

### Shadow Vocabulary

- **Object, dark ground** (`0 42px 70px -44px rgba(0,0,0,0.85), 0 4px 14px -8px rgba(0,0,0,0.6)`): a sheet resting on the vault floor.
- **Object, light ground** (`0 26px 50px -34px rgba(42,33,24,0.45), 0 3px 10px -6px rgba(42,33,24,0.26)`): the same sheet in daylight.
- **Lifted** (`0 64px 96px -52px rgba(0,0,0,0.9)` dark / `0 44px 74px -44px rgba(42,33,24,0.5)` light): an object raised toward the reader.
- **Object lip** (`inset 0 1px 0 rgba(255,255,255,0.5)` dark / `0.9` light): the cut top edge catching the light. The one inset in the system, and it is an edge, not a bevel.

### Named Rules

**The Offset Rule.** Every shadow carries an offset **and** a blur. A zero-offset coloured halo is decoration, not depth, and does not ship.

**The Masked Lift Rule.** A chapter's light layer is a *child* painting an opaque `--ground-deep`, so unmasked it paints over its own section background and puts the hard seam back into the crossing. It is masked clear of both edges. Keep it that way.

## Shapes

Two form languages, and which one applies is decided by what the thing *is*, not by where it sits.

**Square (`0px`) — everything that is an artifact.** Sheets, slips, drawers, plates, panels, mounts, form fields, badges, chart tracks, and the consent banner. A rounded specimen sheet is not a specimen sheet.

**Pill (`999px`) — everything that is a control.** Buttons, toggles, segmented controls. A control belongs to the site rather than to the artifact, and the radius is what keeps it distinguishable from the square paper it sits on.

**Rounded (`1.75rem` card / `1.375rem` tile) — the debug console only.** It is deliberately not the site's paper surface: it is instrumentation floating over both the dark cinematic and the light interior, and it says so by being the one glass, rounded, concentric thing in the build.

Borders are hairlines: a single 1px cut edge on an object, a 2px left rule where a sheet was held in a filing run, and nothing thicker. The one legal exception is the stamp's 3px box, which is the impression of a rubber die.

### Named Rules

**The Square Paper Rule.** If it holds content, it is square. If you click it, it is round. There is no third case, and a rounded panel is the tell that a card crept back in.

**The Held Edge Rule.** The 2px coloured left rule is a *named physical device*, not an accent stripe: it is the margin a sheet was held on in a filing run (the drawer, the sheet's own `::before`) or the rule a determination is written against (the slip). It appears only on those three, it is always the stop's `--accent-ink` or `--rule`, and it never widens. A coloured left border on a generic callout, alert or card is the single most recognisable tell of a generated interface — this system reads as the opposite only because the device is specific and rationed. Adding a fourth use is how it stops being a filed edge and becomes a stripe.

## Components

### Buttons — `Action`

- **Character:** one element deep, and nothing else.
- **Shape:** fully rounded (`999px`), padding `0.8125rem 1.375rem`, `0.75rem` gap between label and glyph.
- **Primary:** the stop's own ink as fill, the stop's ground as label — so the control re-inks with the chapter it stands in.
- **Hover / Focus:** fill goes to living ink `#0a5c34`, label to `#f4f8f5`, and the trailing glyph travels `translate3d(3px, -3px, 0)`. Active scales the whole control to `0.98`.
- **Ghost:** transparent fill, hairline border, the stop's ink as label. For the secondary route out of a section, never the primary one. The border is transparent rather than absent on the filled variant, so neither reflows by a pixel beside the other.

### Cards / Containers

There is one container — the **Panel** — and it appears only where a reading must be visually independent: a chart plot, a form, a record. Square, one 1px cut edge, one ground, `clamp(1.125rem, 2.4vw, 1.625rem)` of padding. Nothing nests inside it.

### Inputs / Fields

- **Style:** square, no border except a **ruled bottom edge** — the line you write on — over a `4%` tint of the object's own ink so the writing area is unmistakable. Set in Courier Prime at `1rem`, because a filled-in form is instrumentation.
- **Focus:** the baseline rule takes living ink and the tint deepens to `6%`, under the site-wide focus ring.
- **Error:** fired red `#a8321a`, a 2px leading rule and a typed marker — never hue alone.
- **The 16px floor:** field text never drops below `1rem`. Below it, iOS zooms the page on focus and strands the reader in a form they must pinch back out of.

### Navigation — `HudHeader`

Wordmark `RE:FUTURE` left, links centred on a `1fr auto 1fr` grid so the nav is centred on the header rather than on the space the wordmark leaves. It draws **no ground** — it parks itself on scroll-down and returns on scroll-up instead. A scrim would only work on a page with one background colour, and the interior's ground travels through four stops. Below 48rem the wordmark stands down and the links keep the centre.

### Signature: the Chapter

A `<section>` that declares its rung and re-inks everything inside it, carrying its own light layer, its own grain, and a dissolve at each edge toward the colour it shares with its neighbour. This is the system's defining component: it is how a page argues.

### Signature: the Sheet

A paper object with `overflow: hidden` (load-bearing — ink stays on paper, and a rotated stamp can never escape into the viewport), a laid-paper texture of repeating hairlines, a cut edge, and a long cast shadow. `live` gives it the pointer tilt of a mounted sheet lifted under the light, driven by a custom property written from a rAF-throttled `pointermove`, so the whole effect is one compositor change and React never re-renders.

### Signature: the Drawer run

The interior's answer to the card grid. Full-width, flush, stacked with a 2px gap and a 2px left rule, so a list of destinations reads as a cabinet rather than as six equal boxes with icons. Hover increases `padding-left`, which reads as the drawer pulling out. A destination that does not exist yet renders **sealed** — fully legible, marked with a state label, never dropped under the contrast floor. It is a record, not a disabled control.

### Signature: the Stamp

Archivo Narrow 700 caps in a 3px box, rotated `−8deg` about its right edge, masked with a radial so the rubber inks unevenly. It presses in over 420ms on `cubic-bezier(0.05, 0.7, 0.1, 1)` — a strike, never an overshoot, because an overshoot rebounds the impression back past its mark, which is the opposite of what a stamp does to paper. The rotation must be restated inside the keyframes or the tilt drops for the duration.

## Do's and Don'ts

### Do:

- **Do** declare a section's position on the ladder and let it re-ink. `data-chapter="soot"` is the entire mechanism.
- **Do** pick ink from the ground it actually lands on, measured on the composited stack. On the landing dawn the background travels near-black → olive → cream, so the ink walks cool white → warm white → lit white → warm dark.
- **Do** give every accent two values, one lit and one as ink, and put the measured ratio in the comment.
- **Do** group with a typed column head, a hairline and space. A container has to earn its edge by being independent or clickable.
- **Do** enter on mount (`<Settle onMount>`) for anything in the first viewport. The scroll observer's band stops short of the fold, so content low in the opening screen never intersects and sits invisible.
- **Do** resolve motion to its end state under `prefers-reduced-motion` rather than withholding the content. The record is the point; the choreography is not.
- **Do** derive any figure that appears in prose from the same value its chart renders. A hardcoded number beside a live one is a contradiction waiting for the next data refresh.
- **Do** animate transform and opacity, and reach past them with mask, clip-path and blur when they stay smooth.

### Don't:

- **Don't** put a container inside a container. Nested cards are the habit this system was built to remove, and `--shell` / `--inner-lip` are inert precisely so old code collapses to one enclosure without edits.
- **Don't** let a rounded corner into a paper object, or a square corner onto a control.
- **Don't** put a kicker or eyebrow above a heading.
- **Don't** set small text on `thaw`, or anywhere on a mid-tone ground that carries no object.
- **Don't** render the vault warm — no cream, parchment, ivory or lamplight.
- **Don't** use gradient-clipped text. It has no standard fallback and renders the headline invisible where the `-webkit` pair is ignored. Emphasis comes from weight and scale.
- **Don't** use bounce or elastic easing anywhere. Exponential ease-out from an already-visible default.
- **Don't** transition `width`, `height` or any other layout property to animate a chart. Scale from the leading edge, or do not animate it.
- **Don't** hide content behind a flip, a reveal or a hover. It is unreachable by find-in-page, by print and by a screen reader, and on a chart it hides the very thing being explained.
- **Don't** reintroduce fixed navigation over the cinematic. The only way onward is the surface's own answer.
- **Don't** reach for `--accent-ink` to mean *error*. On every light stop it resolves to a green, which is what the rest of the site means "alive" by. Negative states declare their own ink.

## Not canonized

**The drift this section used to record is gone.** Six shared components —
`CookieConsent`, `SocialEmbed`, `ScrollHint`, `SocialShare`, `DebugConsole` and
`SceneDawn` — composed from the pre-redesign token layer and have been moved
onto the three type roles and the square panel. A seventh, `EnergySection`, was
imported by nothing and was deleted rather than converted. Plus Jakarta Sans and
JetBrains Mono are no longer downloaded: `index.html` now requests exactly the
three families this file documents, in one request instead of two.

The compatibility layer went with them. `--shell`, `--core`, `--inner-lip`,
`--r-shell` and `--r-core` were kept inert so old surfaces would collapse to one
container without edits; every such surface has been rewritten, so they are
deleted, along with `--shadow-soft`, `--signal-teal`, `--signal-lime` and the
three `--font-*` tokens — all measured at zero uses.

One thing remains worth knowing, and it is a fact rather than a defect:

**The Dashboard restates the focus ring.** The interior's one focus ring (`2px solid var(--living)`, 3px offset) is scoped to `[data-chapter]`. Any surface that pins the ladder tokens directly instead of declaring a stop — `/dashboard` does — does not inherit it and must restate the rule. Either is fine; knowing which one you are on is not optional.
