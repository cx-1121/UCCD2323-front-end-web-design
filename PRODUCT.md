# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students, educators, visitors and prospective members of a university Green
Technology Club. The primary user is an undergraduate on a laptop or phone,
arriving with no prior commitment to the subject and no obligation to stay.

One audience matters separately because the product has a surface built only for
them: the **returning visitor** — someone who has already completed the landing
journey once, and has deliberately come back to the entry point to see what else
the site does. They are not lost and not new. They are curious, and the site
already knows they made a choice.

## Product Purpose

A story-driven website for the club that presents sustainability as a journey
rather than as a set of pages: from the environmental cost of fossil fuels,
through renewable energy and green technology, to the club's own projects and an
invitation to join.

The narrative spine is fixed: **Past → Present → Future**, or equivalently
**Problem → Innovation → Action**.

Success is twofold and both halves are real: the work is assessed as university
coursework, and it is also deployed as the club's actual site. It therefore has
to satisfy a marker looking for ambition and craft *and* survive real visitors
who will judge it in seconds and leave if it does not hold them.

## Positioning

Most club sites are a navigation menu with pages behind it. This one is a single
authored descent and climb that the visitor scrolls through, and it **remembers
that they came out the other side**. Returning to the entry point does not replay
the introduction — it opens a progressively escalating hidden sequence keyed to
how many times they have come back. The site treats a returning visitor as a
character in the story rather than as a cache-miss.

## Operating Context

- Single-page React app. Routes: `/` (landing cinematic, behind a returning-user
  guard), `/home`, `/explore`, `/projects`, `/quiz-challenge`, `/about`,
  `/contact`, `/dashboard`.
- Journey state lives in `localStorage`: `hasChosenFuture` records that the
  landing sequence was completed; `attemptsToReturnToPast` counts deliberate
  replays. Both are legacy key names and must not be renamed — renaming strands
  the journey state of anyone who has already visited.
- `/` redirects to `/home` for a returning visitor unless they arrive with
  `?replay=true`, which is what opens the revisit sequence.
- A cookie-consent decision gates third-party embeds.

## Capabilities and Constraints

- React 18 + TypeScript, Vite, GSAP (ScrollTrigger / ScrollToPlugin), vanilla CSS
  Modules, Vitest + React Testing Library.
- The landing cinematic is one scroll-scrubbed master timeline; the dawn that
  closes it hands over to `/home` through a cross-dissolve.
- **The revisit sequence has exactly three escalating levels**, keyed to
  `attemptsToReturnToPast`, each going further than the last, with level 3
  revealing navigation to the rest of the site. This escalation is a fixed
  product constraint and survives any visual redesign.
- The live dashboard reads World Bank carbon data with a TTL cache and a
  fallback path.
- Undecided: nothing about the revisit levels' visual treatment is settled. The
  prior written spec in `docs/landing-page-design.md` has been explicitly
  superseded by the user and is history, not authority.

## Brand Commitments

- Name: **RE:FUTURE**, for the **Green Tech Club**.
- The Past → Present → Future narrative spine.
- No palette, typeface or visual-world commitment has been made binding. The
  green currently in the interior routes is an incumbent choice, not a
  constraint.

## Evidence on Hand

Real assets in the repository, usable as design material:

- `src/components/SceneIntro/IndustrialSilhouette.tsx` — a hand-drawn industrial
  cityscape as inline SVG, roughly 800 shapes, with a separate shadow layer and
  an object layer. The single most distinctive asset the project owns.
- `public/assets/forest-hero.jpeg` — the photograph the home page opens on.
- `public/assets/pump-anim.gif` — pumpjack animation.
- Live World Bank carbon-emissions data on `/dashboard`.
- Authored educational content for the five renewable sources, club projects and
  the quiz.

Absent, and never to be fabricated: member counts, real testimonials, partner
or sponsor names, award claims, and any measured impact figure for the club's
projects.

## Product Principles

1. **The journey is the product.** Structure and sequence carry the argument;
   pages are what the journey passes through, not the point of it.
2. **Coming back is part of the story.** Returning-visitor state is narrative
   material, not a technical detail to hide.
3. **Show the mechanism, don't assert the benefit.** The site earns belief by
   demonstrating how energy works, not by claiming that green is good.
4. **It has to survive a real visitor.** Ambition never costs legibility,
   keyboard access, or a usable path to the rest of the site.
5. **Only the club's own material.** Real assets and real data; no invented
   proof.

## Accessibility & Inclusion

- `prefers-reduced-motion` is honoured across the cinematic, the revisit levels
  and the interior routes: motion-heavy sequences resolve to their end state
  rather than being withheld.
- Text meets WCAG AA against its actual composited background, including over
  the animated, colour-shifting backdrops of the landing sequence.
- Every route must be reachable without completing the cinematic.
