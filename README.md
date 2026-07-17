# RE:FUTURE — Renewable Energy Scroll-Animation Landing Page

RE:FUTURE is an immersive, performance-optimized, scroll-driven interactive landing page designed to compare traditional fossil fuels with clean, renewable energy.

---

## 🚀 Key Features

* **Scroll-Bound Timelines**: Connects page scroll progress directly to a custom **54s** virtual time animation using GSAP `ScrollTrigger` and `ScrollToPlugin`.
* **High-Performance Particle Canvas**: Simulates real-time smoke physics and wind drafts dynamically on an HTML5 Canvas to ensure high frame rates.
* **Component-Decoupled Architecture**: View structures (JSX), styles (CSS Modules), timeline animations, and particle renderers are completely isolated into independent layers.
* **Responsive Design**: Designed with fluid typography (`clamp` functions) and proportional layout scaling for mobile, tablet, and desktop screens.

---

## 🛠 Tech Stack

* **Core Framework**: React 18 (TypeScript)
* **Build Tool**: Vite 8
* **Animation Suite**: GSAP 3 (ScrollTrigger, ScrollToPlugin)
* **Styling**: Vanilla CSS Modules (no heavy UI frameworks)
* **Testing**: Vitest + React Testing Library + JSDOM

---

## 💻 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Install Dependencies

Clone the project, navigate to the folder, and run:
```bash
npm install
```

### 2. Run Development Server

To launch the project locally with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to the local address displayed in the terminal (typically `http://localhost:5173/`).

### 3. Build for Production

Compile the TypeScript assets and package the production bundle:
```bash
npm run build
```
The output files will be generated in the `/dist` directory.

### 4. Run Unit Tests

Execute the unit tests in headless mode:
```bash
npm run test
```
To run tests in watch mode (ideal during active development):
```bash
npm run test:watch
```

### 5. Format & Lint Code

Format all files using Prettier:
```bash
npm run format
```
Check code quality and enforce rules using ESLint:
```bash
npm run lint
```

---

## 📐 Project Architecture & Conventions

Before modifying any source code, please refer to [DISTRIBUTIONS.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/DISTRIBUTIONS.md) for strict guidelines on:
* Component directory layouts and naming conventions.
* How to write and register custom Custom Hooks for Canvas rendering or GSAP timelines.
* **CRITICAL CSS MODULE RULE**: Always wrap static IDs (e.g. `#intro-main-title`) in `:global(#id)` within CSS modules to prevent hash-mismatch bugs that break GSAP target selection.
* **Timeline Scale**: Ensure any modifications to timelines are proportional to the scaled `totalDuration = 54` seconds.

---

## 📄 License

This project is private and proprietary.
