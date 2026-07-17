# Project Hand-off & AI Agent Execution Protocol

This document defines the strict workflow and operational protocol that any AI agent must read and adhere to before performing any task in this codebase.

---

## 🚀 Execution Order (Follow Sequentially)

### 1. Read Project Overview First
Before writing code or conducting research, you **MUST** read [project-overviews.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/docs/project-overviews.md). 
* **Goal**: Fully align on the narrative path (Past → Present → Future), structural components (1 to 8), and the cinematic/interactive design philosophy of the Green Tech Club website.

### 2. Read Architecture & Style Rules
You **MUST** read [DISTRIBUTIONS.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/DISTRIBUTIONS.md) before writing or modifying any source files.
* **Goal**: Understand directory structure layouts, styling modularity (Vanilla CSS modules), custom Canvas/GSAP hooks usage, and Git workflow branches conventions.

---

## 🚫 Critical Constraints & Guidelines

### ⚠️ Constraint 1: Do NOT Modify README.md
* **Rule**: You are **strictly prohibited** from modifying [README.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/README.md).
* **Rationale**: The `README.md` is reserved exclusively for high-level repository setup, prerequisites, and developer start guides. All project details are segmented into specific documents under `docs/` or `DISTRIBUTIONS.md`.

### ⚠️ Constraint 2: Update DISTRIBUTIONS.md on Changes
* **Rule**: If your code edits add new directory components, introduce new React hook categories, update CSS module behaviors, or change git integration rules, you **MUST** immediately update [DISTRIBUTIONS.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/DISTRIBUTIONS.md) to document these structural/architectural shifts.

---

## 📋 Agent Verification Checklist (Run Before Submitting a PR)

* [ ] I have read [project-overviews.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/docs/project-overviews.md) to verify context alignment.
* [ ] I have read [DISTRIBUTIONS.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/DISTRIBUTIONS.md) to enforce file placement conventions.
* [ ] I did **NOT** touch [README.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/README.md).
* [ ] I have updated [DISTRIBUTIONS.md](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/DISTRIBUTIONS.md) if new conventions, hooks, or directory structures were introduced.
