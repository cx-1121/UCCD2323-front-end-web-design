# Handoff — interior redesign (RE:FUTURE / Green Tech Club)

Written at the end of a long session, for whoever picks this up next. Nothing
here is committed: HEAD is still `17666c2` and all 35 changed paths are
working-tree only. **Do not `git checkout .` or `git stash` without asking.**

---

## 1. What the user asked for

Redesign every page **except the landing cinematic** so the whole site shares
the design language of the revisit surface (`/?replay=true`), tied to one
narrative: fossil-fuel prosperity → energy crisis → green energy. Colour must
evolve gradually dark → light rather than flipping theme at a route boundary.
Desktop and mobile must be **composed separately**, not scaled.

Four decisions the user made explicitly (answered via structured questions):

1. **Home carries the arc**; `/dashboard` stays its own route as the data chapter.
2. **Grammar everywhere, artifact objects at chapter turns** — not full herbarium
   costume on every page, not grammar-only either.
3. **Foundation + Home first**, then check in, then the rest.
4. They offered reference images (scrollytelling sites they want matched, plus
   their current landing/home screens). **These never arrived.** Worth asking
   again — they would change composition on the remaining pages.

Later instructions, in order: audit and remove excessive cards (global objects
only); flatten nested buttons; flatten them on landing/revisit too; revert Home
to the shared nav; centre the nav, drop the logo, `RE:FUTURE` on the left;
remove the dead code that left behind.

---

## 2. The design system (read these first)

Three files carry everything. Read them before touching any page.

- **`src/styles/chapters.css`** — the ladder. Eight stops
  (`stacks · soot · haze · thaw · firstlight · daylight · sky · living`), each a
  complete set of the same semantic tokens. A section declares
  `data-chapter="soot"` and everything inside re-inks. Crossings happen on
  **both** sides of a boundary meeting at a shared middle colour, via
  `data-from` / `data-to` — half the travel above the seam, half below. The last
  stop is deliberately the project's original paper tokens: the arc *arrives at*
  the old system rather than discarding it.
- **`src/components/accession/Accession.tsx` + `.module.css`** — the grammar.
  `Chapter, Column, Bench, Settle, Stamped, Typed, Prose, Instrument, Sheet,
  SheetHead, Stamp, Slips/Slip, Drawers/Drawer, Figures/Figure, Action`.
- **`index.html`** — the direction contract, as an HTML comment above `#root`.
  THESIS / OWN-WORLD / STORY / FIRST VIEWPORT / FORM / FINISH.

Supporting: `useSettle`, `SourceScenes.tsx` (five mechanism drawings),
`WorldScene.tsx` (the quiz's growing world), and hooks `useInView`,
`useSheetLift`, `useCarbonFigures`, `useCurrentChapter`.

### Rules that are not obvious from the code

- **`thaw` carries no small text.** It is the mid-tone the ground passes
  *through*; nothing on it may be below display scale or off an object.
- **One colour, two inks.** Every accent is declared twice — `--accent` (lit,
  on the ground) and `--accent-ink` (as ink on paper). Contrast ratios are in
  the comments, measured against the ground each value actually lands on.
- **`--living` is not on the ladder.** It is reserved for what is actually
  alive and spent roughly once per surface.
- **Type roles:** `--typed` (Courier Prime) is the narrative/instrument voice,
  `--stamped` (Archivo Narrow caps) is headings and controls — short strings
  only, it stops reading past ~6 words — `--set` (Outfit) is the only face
  allowed to run prose.
- **`Instrument` is not an eyebrow.** Never a label above a heading. It is a
  unit, an accession number, a column head, a source credit.

---

## 3. Page status

| Route | State |
|---|---|
| `/` landing | **Out of scope** by instruction. Only the SceneDawn button was flattened. |
| `/?replay=true` revisit | Reference surface. Only its button was flattened. |
| `/home` | **Done.** Six chapters, full arc, live World Bank figures. |
| `/explore` | **Done.** Five plates, authored mechanism drawings, ruled ledger. |
| `/quiz-challenge` | **Done.** Score drives the ladder; the world greens as you answer. |
| `/projects` | **Done.** Alternating editorial plates, no grid. |
| `/dashboard` | **Done.** Recomposed as verdict → evidence; every flip card removed. |
| `/about` | **Done.** Five chapters, the roster as a register, references now actually linked. |
| `/contact` | **Done.** The form is the page's one paper object; channels and support routes are ruled runs of links. |

Both /about and /contact now climb `firstlight → daylight → sky → living`, the
same four stops /explore and /projects walk, so moving between any of them is
one continuous room rather than four themes.

---

## 4. Site-wide changes already made

- **`global.css`** — the concentric `shell`/`core` system that *mandated*
  nested cards is retired. `--card` / `--r-card` are the single container;
  `--shell` is now transparent, `--inner-lip` is `none`, and `--r-shell` /
  `--r-core` both alias `--r-card`, so any surface still on the old names
  collapses to one container without edits.
- **`HudHeader`** — the unused `interactive` variant (triangle logo, GSAP
  unlock timeline) is deleted. Now: `RE:FUTURE` left, nav centred via a
  `1fr auto 1fr` grid, hides on scroll-down. Used by all seven interior routes.
  Its link list omits Quiz and Contact — the user has not asked to change that.
- **Every control is one element.** `Action`, SceneDawn's answer, and the
  revisit button were each three nested rounded containers (tray → core → icon
  disc). All flattened.
- **Shared components** — `CookieConsent`, `EnergySection`, `SocialEmbed` no
  longer draw a frame around a card.
- **Grammar additions** (all three exist because a page needed them, not
  speculatively): `Chapter` takes `aria-labelledby`, so a chapter with a
  visible heading is named by it rather than by a second string only a screen
  reader hears; `Action` takes `submit`, so a form's own control is the site's
  control; and `Action` no longer forces `target="_blank"` on every `href` —
  only an `http` destination gets the target and the rel, because a `#anchor`
  and a `mailto:` were each leaving an empty tab behind.
- **Prose that contradicted the chart beside it.** The Dashboard's six flip
  backs carried hardcoded figures: a budget note citing "36.8 Gt/year … ~6.8
  years" beside a ring drawing neither, a "Brazil (71% Clean Power)" tag beside
  a live mix, a "Dominant: Energy Sector (73.2%)" tag beside a live donut, and
  a footer crediting the IEA and the Global Carbon Project — two bodies the
  page never queries. Every note is now computed from the same value its chart
  renders, the footer credits World Bank and Open-Meteo, and the years-left
  figure is divided out of the live annual total rather than read from
  `carbonBudget.yearsLeft`, a bundled constant derived against a rate the page
  no longer reports. `useCarbonLiveData` had already been fixed for exactly
  this class of bug once; the flip backs reintroduced it.
- **Rows that promised a destination and had none.** `/about`'s references and
  `/contact`'s channels both rendered as inert `div`s with an external-link
  arrow beside them, while carrying a real URL in `ClubInfo.ts` the whole time.
  Both are links now. `supportRoutes` had the same defect in a worse form —
  every `href` was `#contact`, an anchor to the page the reader was already on
  — and they now open a pre-addressed mail with the subject filled in.

---

## 5. What to do next

**Every route is done. What is left is DESIGN.md — see §8.**

The Dashboard was the last one, and the answers it landed on are worth keeping
because they are the ones a future edit is most likely to undo:

- **It is an Operate surface and it stays restrained.** The ground is pinned to
  `sky` rather than travelling the ladder: a chart that reads differently at
  two scroll positions is a chart that cannot be trusted. The first screen
  carries no `data-reveal` at all, so the number the reader came for is on
  screen at first paint.
- **The primary reading is the 1.5°C budget**, chosen by the user over the
  trend and over the live counter. Everything below it is evidence for it, and
  the sections are named as such — what is spending it, who is spending it,
  what they run on, what replaces it. The ticking projection is demoted to sit
  under the allowance it draws down, which is the only place it has ever meant
  anything: it is an extrapolation, and it had been leading a page of reported
  statistics.
- **A linear budget, not a ring.** The quantity is one-dimensional; a ring made
  the reader decode an arc to recover it and had no natural "you are here".
- **No flip cards.** Six surfaces were click-to-flip 3D cards hiding a "Data
  Interpretation" back face. The interpretation is now set under each plot.
- **Every figure in prose is derived from the value its chart renders.** See
  §4. If you add a note to a panel, derive it or leave the number out.

---

## 6. Traps this session already fell into

Each of these cost a fix round. They will recur.

- **The reveal observer's band stops short of the fold.** Anything low in the
  first viewport never intersects and stays at `opacity: 0`. This hid Home's
  primary CTA on load. Use `<Settle onMount>` for first-viewport content.
- **Fixed headers collide with content.** Hit three times (Home, Explore,
  Projects). HudHeader now hides on scroll, and Explore's sticky index needs
  `top` clearance below it.
- **A chapter's `.lift` layer overpaints its own crossings** if unmasked — its
  shadow radial uses an opaque `--ground-deep` and it is a *child*, so it
  paints over the section's background. It is masked clear of both edges;
  keep it that way.
- **SVG scenes need `overflow: hidden`.** Wind's clouds travel past the viewBox
  by design and escaped into the text column.
- **The ladder has no negative colour, and its top half is green.** On every
  light stop `--accent-ink` resolves to a green, and so does `--living-ink` —
  the whole arc lands on green because that is the story. An error or a
  destructive state reaching for `--accent-ink` therefore renders in the exact
  colour the rest of the site means "alive" by. Contact's form error hit this.
  Any such state must declare its own ink, measured against the ground it
  actually lands on; `#a8321a` is the red the interior already uses (soot's
  accent-ink, Explore's geothermal override), 6.4:1 on `--object`.
- **`p + p` rules do not reach across `Settle` wrappers.** Paragraphs in
  separate entrance elements are not siblings. Use a grid `gap` on the stack.
- **Modals need body scroll lock and Escape.** Projects' dialog had neither.
- **Backdrops at 0.55 are too weak** to make a fixed header recede; 0.78 works.
- **SVG text scales with the viewBox.** The Dashboard's 600-unit trend chart
  fitted into a 305px phone panel rendered its 9px axis labels at about 4.6
  real pixels. The plot now holds a 34rem minimum and scrolls inside its own
  `overflow-x` container. Check any chart at 375px by measuring
  `renderedWidth / viewBoxWidth`, not by looking at it on a desktop.
- **The interior's focus ring is scoped to `[data-chapter]`.** Any surface that
  pins the ladder tokens directly instead of declaring a stop — the Dashboard
  does — gets the browser default unless it restates the rule.
- **`transform: scaleX(var(--x))` does not interpolate** unless the custom
  property is registered with `@property`. A transition declared on it is a
  declaration that can never fire.
- **A bare `[data-reveal]` selector in a CSS Module is global.** Class names are
  scoped; attribute selectors are emitted as written. The Dashboard's reveal
  rules were applying `opacity: 0` to every `[data-reveal]` element on every
  other route in the app.

---

## 7. Verification

Dev server: `preview_start` with `{name: "refuture-dev"}` (port 5173,
`.claude/launch.json`). The Browser pane **must be open on the user's screen**
or screenshots time out. The pane's width caps the usable viewport — setting a
larger one letterboxes the capture into unreadability, so ask the user to widen
the pane rather than trusting a scaled screenshot.

`window.scrollTo` frequently reports `0` on the first call and works on the
second; call it twice.

Gates: `npx tsc -b`, `npx eslint <paths>`, `npx vitest run`. **All 151 tests in
20 files pass.** Two lint errors are pre-existing and not from this work:
`useParticleCanvas.ts` (`prefer-const`) and `DevTimeDisplay.tsx`
(`set-state-in-effect`). `SceneDawn.test.tsx` is timing-flaky under full-suite
load — it failed once, then passed in isolation and on every re-run.

Test constraints to preserve when editing: Quiz asserts `Question 1 of 10`,
`Correct.` / `Not quite.`, a `Next question` button, and the correct option
appearing twice after a wrong answer. Projects asserts `Engineering Tangible`
and `Climate Solutions` as separate text nodes, `role="tab"` categories, the
exact search placeholder, and that clicking a project **heading** opens the
dialog. Dashboard's assertions are text/role based.

---

## 8. Three open honesty flags

- **`ClubInfo.ts` is half placeholder, and /about now presents it as a record.**
  The file's own header says so: the committee names, the advisor, the email
  address, the social handles and the room number are invented stand-ins; only
  the references are real. That was survivable when they sat in a card; the
  redesign sets them as a numbered register with an accession number and puts
  the advisor on a signed sheet, which is a much stronger claim to being the
  authoritative list. Nothing was changed or added — but these must be replaced
  with real values before the page is public, and the invented advisor is the
  most exposed of them.
- **Projects impact metrics.** `14.2%`, `38 kW`, `450+` etc. come from
  `projectsData.ts` and are now set at figure scale — the most prominent thing
  on each plate — and labelled "Verified Impact Metrics". Preserved verbatim,
  but if any are estimates rather than measurements, that prominence overstates
  them. PRODUCT.md is strict about fabricated impact figures.
- **DESIGN.md has been rewritten from the built result** (`/impeccable
  document`, scan mode), along with the `.impeccable/design.json` sidecar. North
  star: **"The Warming Vault"**. It documents the eight-stop ladder, the three
  type roles, the square-paper/round-control split, the physical shadow
  vocabulary, and nine components with self-contained snippets. The user kept
  the **three-world** structure (cinematic / paper interior / vault) rather than
  merging the last two, so the ladder is documented as the one sanctioned
  passage between the vault and the paper world, not as proof they are one.
- **The shared components are converted and the dead fonts are gone.** Six were
  moved onto `--stamped` / `--typed` / `--set` and the square panel;
  `EnergySection` was imported by nothing and was deleted instead (467 lines).
  `index.html` now requests three families in one call rather than five in two.
  The `--shell` / `--core` / `--inner-lip` / `--r-shell` / `--r-core`
  compatibility layer is deleted with them, plus `--shadow-soft`,
  `--signal-teal`, `--signal-lime`, the three `--font-*` tokens and the unused
  `MenuGlyph` — every one measured at zero uses first.

- **⚠️ `src/hooks/useCountUp.ts` was deleted outside a session while still
  imported, and it broke the whole interior.** `Accession.tsx:4` imports it and
  `:454` calls it, so the unresolved import killed that module — and every
  route that composes from the accession grammar with it. It has been restored
  from `7fef64a`. Two things hid the breakage and are worth knowing about:
  **`tsc -b` is incremental** and reported clean from a stale `.tsbuildinfo`,
  and **a long-running dev server holds its transformed module graph in
  memory**, so the browser kept rendering a file that no longer existed on
  disk. Use `npx tsc -b --force` and `npx vite build` before believing a green
  gate after any file deletion. `useBootSequence.ts` is also deleted and that
  one is correct — it is imported by nothing.
