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
    │   ├── DebugConsole/       # Zero-intrusion developer control panel (activated by url query)
    │   ├── DevTimeDisplay/     # Time counter overlay for development/debugging
    │   ├── HudHeader/          # HUD top navigation bar
    │   ├── ProgressHud/        # Scroll position progress HUD
    │   ├── SceneIntro/         # Stage 1: Energy Crisis Intro scene
    │   ├── SceneTraditional/   # Stage 1.5: Fossil energy comparative scene
    │   ├── ScrollContainer/    # Main scroll container mapping scroll progressions
    │   └── ScrollHint/         # Downward scroll indicator hint
    ├── pages/                  # Page-level containers mapped to specific routes
    │   ├── LandingPage/        # Cinematic scroll-animation Landing Page view
    │   └── HomePage/           # Green Tech Club gateway / Home Page view
    ├── hooks/                  # Core React hooks for state, canvas drawings, and timeline physics
    │   ├── useParticleCanvas.ts # Particle engine rendering & lifecycle (smoke, etc.)
    │   └── useScrollTimeline.ts # Main GSAP ScrollTrigger timeline sequence definitions
    ├── utils/                  # Shared utilities and state bridges
    │   └── animState.ts        # Global animation variables (e.g. smoke intensity/spread)
    ├── test/                   # Unit test setup & configuration
    ├── App.tsx                 # App composition root & Router entry
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
| **Pages** | `src/pages/<PageName>/` | `PageName.tsx` | Page-level components bound to specific Router routes. |
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

### ⚠️ Rule 5: Route Isolation & Memory Cleanup
* **Context**: The `LandingPage` contains high-overhead animations (GSAP ScrollTriggers and Canvas render loops).
* **Practice**: Ensure all animation timelines and Canvas render loops created inside page/scene components are registered for clean-up on unmount (e.g., returning a clean-up function in `useEffect` or using `ScrollTrigger.revert()`). Never persist page-specific tickers or global events unless they are properly garbage-collected.

### ⚠️ Rule 6: Developer Debug Mode & Safety Boundaries
* **Context**: We use a floating `<DebugConsole />` component to test LocalStorage journey flags and skip to specific revisit Easter egg attempts during development.
* **Practice**: 
  * **How to Activate**: Access the application locally. The system defaults to enabling the console on localhost unless explicitly disabled. Alternatively, accessing it via `http://localhost:5173/?debug=true` will save a flag `debugModeActive = 'true'` in `localStorage` to keep the console visible across tab refreshes and browser restarts.
  * **Domain Constraint**: The debugging dashboard is **strictly prohibited** from rendering in production domain environments. Developers must never disable the `window.location.hostname === 'localhost' || '127.0.0.1'` guard inside `src/App.tsx`.
  * **Purge State**: Clicking the `Reset All (Fresh UI)` button inside the console will automatically clean LocalStorage states and set `debugModeActive = 'false'` in localStorage, followed by a hard `window.location.reload()` to completely refresh the viewport.

---

## 5. Git Workflow Rules

### 🚨 Core Rules

> [!IMPORTANT]
> **DO NOT:**
> * ❌ Directly push commits to `main` or `dev` branches.
> * ❌ Merge your own Pull Requests without peer review.
> * ❌ Commit broken, unformatted, or untested code.
> * ❌ Mix multiple unrelated features or bug fixes in a single PR.

> [!TIP]
> **DO:**
> * Always develop on dedicated feature branches.
> * Target your PRs to the `dev` branch.
> * Keep Pull Requests small, cohesive, and focused.
> * Rebase or resolve conflicts locally before requesting a review.
> * Pull the latest changes from `dev` before starting new work.

### 🌲 Branching Strategy

#### Main Branches
* **`main`**: Production-ready, stable, and fully functional. **Strictly read-only; direct commits are prohibited.**
* **`dev`**: Active integration branch for feature convergence.

#### Feature Branches
All feature branches must branch off from `dev` and follow this naming format:
`feature/<feature-name>`

**Examples:**
* `feature/task-assignment`
* `feature/aco-optimization`
* `feature/carbon-model`
* `feature/realtime-dispatch`
* `feature/frontend-map`

### 🛠 Feature Development Flow

All development must strictly adhere to the following workflow. **Direct pushes to `main` or `dev` are prohibited.**

#### Step 1: Sync with `dev`
Start with the latest upstream codebase:
```bash
git checkout dev
git pull origin dev
```

#### Step 2: Create a Feature Branch
Spawn a new local branch off `dev`:
```bash
git checkout -b feature/<feature-name>
```

#### Step 3: Develop & Commit
* Keep commits modular and logical.
* Write concise commit messages that conform to the conventional commits standard.
```bash
git add .
git commit -m "feat: short and clear description"
```

#### Step 4: Push the Feature Branch
Push your branch to the remote repository. **Never target main/dev directly with push.**
```bash
git push origin feature/<feature-name>
```

#### Step 5: Open a Pull Request (PR)
* Open a PR when your feature is **completely finished** and tested.
* Ensure your local branch is up-to-date with remote `dev` before submission:
  ```bash
  git fetch origin
  git status
  ```
* Set the target base branch to `dev`.
* Write a clear PR description outlining **what** was changed and **why**.

#### Step 6: Review & Address Feedback
Reviewers will evaluate the PR against:
* Logic correctness & test coverage
* Code readability & style compliance
* Architectural consistency
* Potential side-effects & performance red flags

#### Step 7: Merge & Clean Up
* Merging is allowed only after receiving required approvals.
* Prefer **Squash and Merge** to maintain a clean git history.
* Delete the feature branch from both local and remote repositories after merging.

### 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format:** `<type>: <short description>`

#### Commit Types
* `feat`: A new feature
* `fix`: A bug fix
* `refactor`: Code changes that neither fix a bug nor add a feature
* `docs`: Documentation updates only
* `test`: Adding missing tests or correcting existing tests
* `chore`: Changes to the build process, auxiliary tools, or libraries

#### Examples
* `feat: add Voronoi-based task assignment`
* `fix: correct carbon calculation for EV`
* `refactor: simplify ACO path construction`
* `docs: update PRD and diagrams`


## 6. Quiz & Challenge Module

The renewable-energy quiz is available at `/quiz-challenge` and is kept separate from the landing-page scene flow.

### Files

- `src/pages/QuizChallenge/QuizChallenge.tsx` — renders one question at a time, answer feedback, final score, and explanation review.
- `src/pages/QuizChallenge/QuizChallenge.module.css` — responsive, component-scoped quiz styles.
- `src/pages/QuizChallenge/QuizChallenge.test.tsx` — interaction coverage for correct and incorrect answers.
- `src/hooks/useQuizChallenge.ts` — owns question progress, responses, score, and restart state.
- `src/utils/quizQuestions.ts` — shared typed data for 10 Easy, Medium, and Hard renewable-energy questions.

Keep question content in `quizQuestions.ts`, state transitions in the hook, and presentation in the component. Every question must include an educational explanation.
