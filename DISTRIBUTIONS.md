# RE:FUTURE Project Architecture & File Distribution Guidelines (DISTRIBUTIONS)

This document describes the architectural design of the **RE:FUTURE (Renewable Energy)** interactive scroll-animation landing page and provides team members with clear directory layouts and file placement rules to ensure modularity, high cohesion, and loose coupling.

---

## 1. Project Overview

**RE:FUTURE** is an immersive, responsive scroll-animation landing page comparing traditional fossil energy and renewable clean energy.
* **Core Tech Stack**: Vite + React 18 + TypeScript + GSAP (ScrollTrigger & ScrollToPlugin) + HTML5 Canvas.
* **Animation Mechanism**: Main scroll progression is bound to a virtual timeline of **54s** using GSAP `ScrollTrigger`. As the user scrolls, animations such as smoke dispersion, rotating gears, and title crossfades transition smoothly.
* **Performance Control**: High-performance smoke and interactive particle physics are rendered on an HTML5 Canvas to prevent excessive DOM reflows and repaints.

---

## 2. Directory Tree Structure

Source code is located under the `/src` folder. The structure is laid out as follows:

```text
frontend_react/
├── public/                     # Static assets served directly from Web root
└── src/
    ├── components/             # UI view components divided by features
    │   ├── DevTimeDisplay/     # Time counter overlay for development/debugging
    │   ├── HudHeader/          # HUD top navigation bar
    │   ├── ProgressHud/        # Scroll position progress HUD
    │   ├── SceneIntro/         # Stage 1: Energy Crisis Intro scene
    │   ├── SceneTraditional/   # Stage 1.5: Fossil energy comparative scene
    │   ├── ScrollContainer/    # Main scroll container mapping scroll progressions
    │   └── ScrollHint/         # Downward scroll indicator hint
    ├── hooks/                  # Core React hooks for state, canvas drawings, and timeline physics
    │   ├── useParticleCanvas.ts # Particle engine rendering & lifecycle (smoke, etc.)
    │   └── useScrollTimeline.ts # Main GSAP ScrollTrigger timeline sequence definitions
    ├── utils/                  # Shared utilities and state bridges
    │   └── animState.ts        # Global animation variables (e.g. smoke intensity/spread)
    ├── test/                   # Unit test setup & configuration
    ├── App.tsx                 # App composition root
    ├── App.module.css          # Main layout local styles
    ├── global.css              # Global tokens (colors, fonts, resets, core tag styles)
    ├── main.tsx                # Application mounting entry point (ReactDOM)
    └── vite-env.d.ts           # Vite TypeScript environment declarations
```

---

## 3. File Placement Rules

To maintain directory cleanliness and avoid clutter, team members must strictly follow these file placement rules:

| File Type | Target Directory | Naming Pattern | Description & Constraints |
| :--- | :--- | :--- | :--- |
| **UI Components** | `src/components/<ComponentName>/` | `ComponentName.tsx` | Must be a standalone directory. PascalCase naming. |
| **Component Styles** | `src/components/<ComponentName>/` | `ComponentName.module.css` | Use Vanilla CSS Modules. Do not mix global/local rules. |
| **Canvas Particle Physics** | `src/hooks/` | `use[Feature]Canvas.ts` | Complex Canvas drawing, animations, and render loops go here. |
| **Timeline Transitions** | `src/hooks/` | `use[Feature]Timeline.ts` | Main scroll triggers, duration timelines must be isolated from UI. |
| **Global/Shared States** | `src/utils/` | `[stateName].ts` | Lightweight bridge states passed between multiple hooks. |
| **Global Theme Styles** | `src/global.css` | `global.css` | CSS resets, CSS custom properties (variables), baseline HTML elements. |
| **Unit & Integration Tests**| Next to the target file | `*.test.tsx` or `*.test.ts` | Test files must live in the same directory as the target component or hook. |

---

## 4. Team Collaboration & Coding Standards

### ⚠️ Rule 1: No Heavy Logic/Animations in UI Components
* **Principle**: React components should strictly manage **DOM structures, prop forwarding, and class bindings**.
* **Practice**: Never write `requestAnimationFrame` calculations or verbose GSAP `gsap.to` chains inside raw UI component files. Extract all animation logic into custom hooks under `src/hooks/` and call the hook from your component.

### ⚠️ Rule 2: ID Selector Hashing Workaround in CSS Modules
* **Context**: GSAP animations and static DOM elements target unchanging, static IDs (e.g., `#intro-main-title`).
* **Practice**: When styling static IDs inside a CSS Module file (`*.module.css`), wrap the selector with `:global(#id)` to prevent the compiler from suffixing it with hashes (e.g., `_id_g0bz8`):
  ```css
  /* Correct Practice */
  :global(#intro-text-container) h1 {
    font-size: clamp(2rem, 8vw, 4rem);
  }
  ```

### ⚠️ Rule 3: Scroll Timeline Progression Consistency
* **Context**: The virtual scroll timeline length is set to **`54s`** (scaled by 20% and rounded up from the original 45s).
* **Practice**: When editing `useScrollTimeline.ts`, all position coordinates and segment durations must be proportional to `totalDuration = 54` and clearly documented in comments.

### ⚠️ Rule 4: CSS Framework Constraint
* **Style System**: Rely strictly on **Vanilla CSS (CSS Modules)**. Do not introduce CSS-in-JS libraries, tailwind wrappers, or external UI frameworks without explicit team consensus.
