---
id: SEC-M4-CARBON-001
type: security-audit
version: 1.0.0
author: SRE (senior-security) + CR (code-reviewer)
status: PASS
dependencies: [PRD-RUBRIC-UPLIFT-001, ARCH-RUBRIC-UPLIFT-001, SEC-M2-M3-001]
related_requirements: [FR-API-001..006]
timestamp: 2026-08-12
---

# M4 Audit — Live World Bank Carbon Data

**Review track:** Track 2 (implementation audit).

## Section 1 — Executive Summary

M4 passes. The three mock-backed dashboard sections now render live World Bank data, verified
end-to-end in a browser: 13 requests, all on the CORS-enabled per-indicator route, producing 10
years of sector data whose 2024 sum (39.63 Gt) matches the World Bank's own world total exactly.

One design assumption failed in verification and was corrected before merge. The single-request
batch endpoint (`/v2/sources/2/…/series/…`) was validated with curl and passed — 200, correct JSON,
all 80 cells. It carries **no `Access-Control-Allow-Origin` header**, so every browser blocked it.
curl does not enforce CORS, so a curl-only check cannot establish that a browser-facing endpoint is
usable. The transport was rewritten onto the classic route behind an unchanged public signature.

The degraded path was exercised for real during that failure: the page rendered complete bundled
figures with a `· bundled` provenance flag and no layout collapse. That is the fallback working as
designed rather than as theory.

## Section 2 — Vulnerability Assessment

**[Severity: MEDIUM — REMEDIATED]**
**Title:** Browser-facing endpoint validated without CORS enforcement
**Location:** `src/api/worldBank.ts` (original batch implementation)
**Description:** The endpoint was selected on the strength of a curl probe. curl issues no `Origin`
header and ignores response CORS headers, so it cannot distinguish an endpoint a browser may read
from one it may not. The result was a data layer that passed every unit test and every command-line
check while being completely non-functional in the product.
**Attack Scenario:** Not attacker-driven — an availability failure. Worth recording because the
failure mode is silent under exactly the verification most likely to be performed.
**Remediation:** Applied. Transport moved to `/v2/country/{c}/indicator/{i}`, confirmed to return
`Access-Control-Allow-Origin: *` including for semicolon-joined country lists, then confirmed again
in-browser (13/13 requests on the classic route, 0 on the batch route). The rationale is documented
at the top of `worldBank.ts` so the batch endpoint is not "rediscovered" later.
**References:** CWE-1059; Fetch Standard §CORS protocol

---

**Verified negative** — probed and clean:

| Probe | Result |
|---|---|
| Upstream strings rendered into the DOM | **None.** Sector labels and colours come from the local `SECTOR_GROUPS` constant; only numbers cross the boundary |
| Credentials sent to the World Bank | **No.** Inherited from `http.ts` (`withCredentials: false`) |
| Secrets or keys required | **None.** Both routes are public and keyless |
| Silent truncation via pagination | **Guarded.** `per_page` sized to the request plus headroom, and `pages > 1` is a hard shape error |
| HTTP 200 error bodies accepted | **No.** The World Bank serves XML errors and `[{message:[…]}]` with status 200; both fail `isIndicatorResponse` |
| Stale mock data reachable by accident | **Removed.** Dead exports deleted from `carbonMockData.ts` (see CR finding 1) |

## Section 3 — Reliability Review

**[Severity: MEDIUM — ACCEPTED, documented]**
**Title:** Cold-cache load fans out to 13 requests, each retrying up to 3 times
**Location:** `src/api/carbonApi.ts` — three `Promise.all` groups over `fetchWorldBankSeries`
**Description:** A first visit issues 13 concurrent requests to one host. Against a failing upstream
each retries twice, so the worst case is 39 requests over roughly 25 s before the group rejects.
**Failure Scenario:** A lab session where thirty students open the dashboard simultaneously against a
degraded World Bank endpoint. Mitigating factors are real and layered: the browser caps concurrency
per host at ~6; backoff carries full jitter (added in M2); the 24-hour cache means each visitor pays
this at most once a day; and the page renders complete fallback figures on the first frame, so no
user is ever blocked waiting for it.
**Remediation:** Accepted rather than fixed. Reducing the count would mean either the CORS-blocked
batch endpoint or dropping sectors from the chart. Documented so the trade-off is visible.

---

**[Severity: LOW — REMEDIATED]**
**Title:** Zero-total sector series would blank the donut with NaN arcs
**Location:** `src/hooks/useCarbonLiveData.ts` — `sectorBreakdown`
**Description:** Shares are `sector.value / totalMt`. An all-zero or empty series makes that `0 / 0`,
producing `NaN` shares and `stroke-dasharray: NaN`, which silently renders no arcs at all.
**Failure Scenario:** Upstream publishes a year of zeroes, or a filter reduces the set to nothing.
**Remediation:** Applied — guarded with `totalMt > 0`, and locked with a regression test asserting
every share is finite and zero rather than NaN.

## Section 4 — Code Review

**Verdict: APPROVED** (2 findings, both fixed during the review)

**1. [FIXED] Dead mock exports duplicating live data** — `src/data/carbonMockData.ts`
`historicalTrend`, `topEmitters`, `energyMix`, `sectorBreakdown`, `ANNUAL_EMISSIONS_GT`,
`TONNES_PER_SECOND` and four types became unreferenced when the live client landed. Leaving them is
worse than untidy: `import { topEmitters } from '../data/carbonMockData'` would compile, run, and
render 2023 mock figures beneath a "World Bank" label. Deleted; `tsc -b` passing afterwards confirms
nothing depended on them. Only `carbonBudget` and `kpiData` remain, and the file now documents why.

**2. [FIXED] Headline tile contradicted the donut below it** — `DashboardPage.tsx`
The annual-total KPI still read the bundled 36.8 Gt while the donut, on the same screen, read 39.6
Gt from the fetched data. Now sourced from `annualTotalGt`, with a test asserting the two agree.

**Would the tests catch a regression?** Assessed by deleting the code each test covers, not by
counting lines:

- Point the transport back at the batch route → the "uses the CORS-enabled classic route" test fails
  on both the URL assertion and the request count. **Catches it.**
- Remove the `pages > 1` guard → the truncation test fails. **Catches it.**
- Take each mix series' own latest year instead of the common one → `latestCommonYear` returns 2023
  and two tests fail. **Catches it.**
- Drop the `Math.max(0, …)` clamp on the remainder → the over-100 rounding test fails. **Catches it.**
- Remove the `totalMt > 0` guard → the NaN-share test fails. **Catches it.**
- Un-merge the sector groups → the industry/other merge assertions fail. **Catches it.**
- Revert the KPI tile to the mock constant → the tile/donut agreement test fails. **Catches it.**

The one gap worth naming: no test asserts the *live* endpoint is CORS-readable, because that cannot
be expressed in jsdom. It was verified in a real browser instead, and the reasoning is recorded in
`worldBank.ts` so a future edit does not silently undo it.

## Section 5 — Production Readiness

| Dimension | Score (1–5) | Summary |
|---|---|---|
| Data Protection | 5 | No PII; public keyless data only |
| API Security | 4 | Timeout, capped jittered retry, boundary validation, no credentials. Deduction for the 13-request fan-out |
| Secrets Management | 5 | None to manage |
| Dependency Health | 5 | No new dependencies |
| Error Handling & Fault Tolerance | 5 | Fallback verified under a real (CORS) outage, not simulated |
| Observability | 4 | Shape failures log the offending series; degraded state surfaces in the UI as `· bundled` |
| Data Integrity | 5 | Sector sum reconciles to the published world total; each block carries its own reference year |

**Verdict: Go.** No outstanding blocking items.

**PASS/FAIL to COA: PASS** (M4, iteration 1 — with one in-flight transport correction).
