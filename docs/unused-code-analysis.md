# Unused & Dead Code Analysis Documentation

This document records all unused / unreferenced custom hooks, functions, and CSS module rules identified across the project codebase.

---

## 1. Unused Custom Hooks

### 1.1 `useBootSequence`
- **File**: [src/hooks/useBootSequence.ts](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/hooks/useBootSequence.ts)
- **Description**: Simulates a multi-step console boot sequence timer for HUD/terminal displays.
- **Status**: Unused. Not imported or called by any component in the project.

### 1.2 `useCountUp`
- **File**: [src/hooks/useCountUp.ts](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/hooks/useCountUp.ts)
- **Description**: Renders a requestAnimationFrame-driven smooth number count-up animation.
- **Status**: Unused. Originally used for the 4 metric summary cards on ProjectsPage, which have been removed.

---

## 2. Unused CSS Module Rules

### 2.1 `ProjectsPage.module.css`
- **File**: [src/pages/ProjectsPage/ProjectsPage.module.css](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/pages/ProjectsPage/ProjectsPage.module.css#L166-L224)
- **Unused Selector Rules**:
  - `.impactGrid`
  - `.metricShell`
  - `.metricCore`
  - `.metricValue`
  - `.metricNumerals`
  - `.metricUnit`
  - `.metricLabel`
- **Status**: Leftover styles from the removed 4 metric cards (`Completed Initiatives`, `CO2 Emission Offset`, `Student Engineers`, `National Awards`).

### 2.2 `ExplorePage.module.css`
- **File**: [src/pages/ExplorePage/ExplorePage.module.css](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/pages/ExplorePage/ExplorePage.module.css#L194-L225)
- **Unused Selector Rules**:
  - `.heroStats`
  - `.stat`
- **Status**: Leftover styles from the removed `Breakdown` and `Reading` hero cards.

### 2.3 `QuizChallenge.module.css`
- **File**: [src/pages/QuizChallenge/QuizChallenge.module.css](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/pages/QuizChallenge/QuizChallenge.module.css#L95-L132)
- **Unused Selector Rules**:
  - `.intro`
  - `.eyebrowTag`
  - `.title`
  - `.titleHighlight`
  - `.subtitle`
- **Status**: Leftover styles from the removed quiz hero intro header ("How Green is Your Knowledge?").

---

## 3. Maintenance Recommendation

These unused files and CSS rules are documented for reference and can be safely deleted or refactored during cleanup without affecting application functionality or unit tests.
