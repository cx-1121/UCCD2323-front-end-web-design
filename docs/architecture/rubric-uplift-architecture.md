---
id: ARCH-RUBRIC-UPLIFT-001
type: system-architecture
version: 1.0.0
author: COA (senior-architect)
status: APPROVED
dependencies: [PRD-RUBRIC-UPLIFT-001]
related_requirements: [FR-STO-001..006, FR-API-001..006, FR-SOC-001..005]
timestamp: 2026-08-12
---

# System Architecture — Rubric Uplift

## 1. Component Topology

```
src/
├─ utils/
│  ├─ storage.ts          [NEW] safeLocal / safeSession — the ONLY localStorage+sessionStorage access
│  ├─ cookies.ts          [NEW] getCookie / setCookie / removeCookie — the ONLY document.cookie access
│  └─ loadExternalScript.ts [NEW] idempotent, time-boxed vendor script loader
│
├─ context/
│  └─ ConsentContext.tsx  [NEW] consent state provider; single source of truth for the gate
│
├─ api/                   [NEW] the only layer permitted to perform network IO
│  ├─ http.ts             jQuery $.ajax wrapper: timeout, retry/backoff, ApiError normalization
│  ├─ types.ts            ApiError, LiveEnergySnapshot, RenewableSharePoint
│  ├─ energyApi.ts        Open-Meteo + World Bank clients, boundary validators, TTL cache
│  └─ cache.ts            sessionStorage-backed versioned TTL cache
│
├─ hooks/
│  ├─ useLiveEnergyApi.ts [NEW] React binding over api/energyApi — loading/data/error/degraded
│  └─ useQuizChallenge.ts [MOD] sessionStorage persistence + resume
│
├─ components/
│  ├─ CookieConsent/      [NEW] banner, writes refuture_consent cookie
│  ├─ SocialShare/        [NEW] FB share + X tweet + Web Share + copy-link
│  └─ SocialEmbed/        [NEW] consent-gated embedded feed panel
│
└─ pages/
   ├─ DashboardPage       [MOD] live panel + DEGRADED badge + Refresh
   ├─ ProjectsPage        [MOD] SocialShare in detail modal
   ├─ QuizChallenge       [MOD] SocialShare on result + resume prompt
   └─ AboutPage           [MOD] SocialEmbed panel
```

**System boundaries.** Three boundaries are enforced by review, not convention:

1. **Storage boundary** — no module outside `utils/storage.ts` and `utils/cookies.ts` touches a
   web storage API. Existing direct `localStorage` calls in `App.tsx`, `LandingPage.tsx` and
   `DebugConsole.tsx` are migrated onto the wrapper as part of M1.
2. **Network boundary** — no module outside `src/api/` performs IO. Hooks consume `api/`; components
   consume hooks. This is what makes the transport unit-testable without React
   (`architecture/standards`: IO separation).
3. **Third-party boundary** — no vendor script or iframe is injected except through
   `loadExternalScript.ts` / a consent-gated component, and never before consent is `granted`.

## 2. Data Flows

**Live data (read path):**
```
DashboardPage → useLiveEnergyApi → energyApi.getSnapshot()
                                     ├─ cache.read('energy:v1')  ── fresh? ──► return, 0 requests
                                     └─ stale/miss
                                          → http.request($.ajax, timeout 8s, retry×2)
                                          → validateShape()  ── fail ──► ApiError{shape}
                                          → cache.write()
                                          → LiveEnergySnapshot
                        ── any ApiError ──► { data: mockSnapshot, degraded: true }
```

**Consent (write path, and the gate it controls):**
```
CookieConsent → setCookie('refuture_consent', 'granted'|'denied', {days:365, sameSite:'Lax'})
             → ConsentContext state update
             → SocialShare / SocialEmbed re-render
                  granted → loadExternalScript(widgets.js) + FB iframe mount
                  denied  → fallback controls only, zero vendor DOM nodes
```

## 3. Tech Stack Decisions

| Decision | Chosen | Rejected | Rationale |
|---|---|---|---|
| HTTP transport | **jQuery 3.7 `$.ajax` / `$.getJSON`** | `fetch`, `axios`, TanStack Query | The rubric names jQuery explicitly. A `fetch` implementation risks scoring zero on a strict read. jQuery is the genuine transport, not a facade. |
| Upstream API #1 | **Open-Meteo Forecast** | OpenWeatherMap, Carbon Interface | Keyless, CORS `*`, and `shortwave_radiation` + `wind_speed_10m` map directly onto solar/wind generation potential — thematically honest for a renewable-energy site. Verified 2026-08-12. |
| Upstream API #2 | **World Bank `EG.FEC.RNEW.ZS`** | Our World in Data CSV | Keyless, CORS `*`, returns renewable share of final energy consumption — a real time series for the Dashboard trend. Verified 2026-08-12. |
| FB plugin mechanism | **`plugins/share_button.php` iframe** | `connect.facebook.net/sdk.js` | The SDK path needs an App ID and app review for full function; the iframe plugin is keyless and cannot be broken by a missing credential during grading. |
| X plugin mechanism | **`platform.twitter.com/widgets.js`** | Bare intent link | `widgets.js` is a genuine plugin (hydrates a real widget); a bare link is not, and the rubric says *plugin*. |
| Consent storage | **Cookie, not localStorage** | localStorage flag | A consent decision is exactly what cookies are for, and it gives the rubric a real `document.cookie` read/write on the critical path rather than a token demo. |
| API cache store | **sessionStorage** | localStorage, in-memory | Per-tab TTL cache is the textbook sessionStorage use case, and it makes sessionStorage load-bearing rather than ornamental. |
| Consent gating scripts | **Yes** | Load scripts unconditionally | Correct privacy engineering, and it welds features B and C into one demonstrable mechanism instead of two unrelated bolt-ons. |

**Accepted trade-off.** Adding jQuery to a React 18 app is not something this architecture would
choose absent the rubric. It is ~30 KB gzipped, it duplicates capability React already has, and it
is documented here as a requirement-driven decision so a future reader does not mistake it for an
accident. It is confined behind `src/api/http.ts`; ripping it out later means rewriting one file.

## 4. Development Roadmap

| Phase | Scope | Sequencing logic | Risk |
|---|---|---|---|
| **M1** | Feature C — storage wrappers, cookie utility, consent banner + context, quiz sessionStorage resume | Must be first: M2's cache and M3's gate both depend on it | **Low** |
| **M2** | Feature A — jQuery install, `http.ts`, `energyApi.ts`, `cache.ts`, `useLiveEnergyApi`, Dashboard integration | Depends on M1 (`safeSession` backs the TTL cache). Independent of M3 | **Medium** — external API shape, retry semantics |
| **M3** | Feature B — script loader, share surface, embed panel, page wiring | Depends on M1 (consent gate). Independent of M2 | **Medium** — vendor scripts are blockable; fallback is mandatory |
| **M4** | Cross-module audit, full build/lint/test gate, delivery report, git versioning | Requires M2 and M3 both cleared | **Low** |

M2 and M3 are dispatchable in parallel once M1 clears its loop.

## 5. Dependency Graph

```mermaid
graph TD
    M0["M0 · PRD + Architecture<br/>COA"]

    subgraph M1G["M1 — Storage Foundation (Feature C)"]
        S1["storage.ts / cookies.ts"]
        S2["ConsentContext + CookieConsent"]
        S3["quiz sessionStorage resume"]
    end

    subgraph M2G["M2 — jQuery REST (Feature A)"]
        A1["jquery dep + http.ts"]
        A2["energyApi.ts + cache.ts"]
        A3["useLiveEnergyApi + Dashboard"]
    end

    subgraph M3G["M3 — Social Plugins (Feature B)"]
        B1["loadExternalScript.ts"]
        B2["SocialShare"]
        B3["SocialEmbed"]
    end

    G1{{"SRE + CR gate M1"}}
    G2{{"SRE + CR gate M2"}}
    G3{{"SRE + CR gate M3"}}
    M4["M4 · Cross-module audit<br/>+ delivery report"]

    M0 -->|blocks| S1
    S1 -->|data| S2
    S1 -->|data| S3
    S2 --> G1
    S3 --> G1

    G1 -->|blocks| A1
    A1 -->|data| A2
    S1 -.->|"data: safeSession backs TTL cache"| A2
    A2 -->|data| A3
    A3 --> G2

    G1 -->|blocks| B1
    S2 -.->|"trigger: consent gates injection"| B2
    B1 -->|data| B2
    B1 -->|data| B3
    B2 --> G3
    B3 --> G3

    G2 -->|validates| M4
    G3 -->|validates| M4

    linkStyle 0 stroke:#ff0000,stroke-width:3px
    linkStyle 1 stroke:#ff0000,stroke-width:3px
    linkStyle 3 stroke:#ff0000,stroke-width:3px
    linkStyle 5 stroke:#ff0000,stroke-width:3px
    linkStyle 6 stroke:#ff0000,stroke-width:3px
    linkStyle 7 stroke:#ff0000,stroke-width:3px
    linkStyle 9 stroke:#ff0000,stroke-width:3px
    linkStyle 10 stroke:#ff0000,stroke-width:3px

    style M0 fill:#0f766e,color:#fff
    style M4 fill:#0f766e,color:#fff
    style G1 fill:#d97706,color:#fff
    style G2 fill:#d97706,color:#fff
    style G3 fill:#d97706,color:#fff
```

**Critical path** (red): `M0 → storage.ts → ConsentContext → SRE/CR gate → http.ts → energyApi →
Dashboard → M4`. M3 runs alongside M2 and is not on the critical path, but shares the M1 gate.

## 6. Frozen Contracts

These are frozen before any CDE dispatch. Changing one mid-milestone requires a COA amendment, not
an inline decision by the implementer.

**Cookie names**
| Name | Values | Expiry | Attributes |
|---|---|---|---|
| `refuture_consent` | `granted` \| `denied` | 365 days | `path=/; SameSite=Lax` (`Secure` when `location.protocol === 'https:'`) |

**Storage keys** — all namespaced, all versioned:
| Key | Store | Shape |
|---|---|---|
| `refuture:quiz:progress:v1` | session | `{ currentIndex, selectedAnswer, responses, savedAt }` |
| `refuture:cache:energy:v1` | session | `{ payload, savedAt }` |
| `hasChosenFuture`, `attemptsToReturnToPast`, `debugModeActive` | local | **Pre-existing — names must not change**, only their access path moves onto `safeLocal` |

**Error type** — one shape, produced only by `http.ts`:
```ts
type ApiErrorKind = 'timeout' | 'network' | 'server' | 'client' | 'shape' | 'abort';
interface ApiError { kind: ApiErrorKind; status: number; message: string; }
```

**Named constants** (no magic values — `fullstack/patterns` standard): `REQUEST_TIMEOUT_MS = 8000`,
`SCRIPT_TIMEOUT_MS = 6000`, `MAX_RETRIES = 2`, `RETRY_BASE_MS = 500`, `CACHE_TTL_MS = 600_000`,
`CONSENT_MAX_AGE_DAYS = 365`.

## 7. Traceability

Every module traces to an FR (`architecture/standards`: RTM — orphan code is prohibited).

| Module | FRs | Tests |
|---|---|---|
| `utils/storage.ts` | FR-STO-001 | `storage.test.ts` |
| `utils/cookies.ts` | FR-STO-002 | `cookies.test.ts` |
| `components/CookieConsent` | FR-STO-003, 004 | `CookieConsent.test.tsx` |
| `hooks/useQuizChallenge` | FR-STO-005, 006 | `useQuizChallenge.test.ts` |
| `api/http.ts` | FR-API-001, 002, 003 | `http.test.ts` |
| `api/cache.ts` | FR-API-004 | `cache.test.ts` |
| `api/energyApi.ts` | FR-API-005 | `energyApi.test.ts` |
| `pages/DashboardPage` | FR-API-006 | `DashboardPage.test.tsx` |
| `utils/loadExternalScript.ts` | FR-SOC-001 | `loadExternalScript.test.ts` |
| `components/SocialShare` | FR-SOC-002, 003, 004 | `SocialShare.test.tsx` |
| `components/SocialEmbed` | FR-SOC-005 | `SocialEmbed.test.tsx` |
