---
id: SEC-M2-M3-001
type: security-audit
version: 1.0.0
author: SRE (senior-security)
status: PASS
dependencies: [PRD-RUBRIC-UPLIFT-001, ARCH-RUBRIC-UPLIFT-001, SEC-M1-STORAGE-001]
related_requirements: [FR-API-001..006, FR-SOC-001..005]
timestamp: 2026-08-12
---

# M2 + M3 Security & Reliability Audit — jQuery REST Layer and Social Plugins

**Review track:** Track 2 (implementation audit).

## Section 1 — Executive Summary

Both milestones pass. The consent gate established in M1 was verified empirically rather than by
inspection: with `refuture_consent=denied`, a live page load of `/about` produced **zero** script or
iframe nodes from `twitter.com`, `facebook.com`, or `twimg.com`, and the explanatory placeholder
rendered in their place. With consent granted, the same page fully hydrated the X timeline
(`widgets.js` → `timeline.js` → syndication iframe, with `dnt=true`). The control does what it
claims.

The network layer never sends credentials, validates every response before it reaches React state,
and treats a well-formed-but-wrong body as a failure — which matters because the World Bank reports
errors with HTTP 200. The blocking CSP item carried over from the M1 audit is closed.

Two findings were remediated during the audit: an over-permissive `allow` attribute on the Facebook
frame, and retry backoff without jitter. Neither is outstanding.

## Section 2 — Vulnerability Assessment

**[Severity: MEDIUM — REMEDIATED]**
**Title:** Facebook share frame granted clipboard-write
**Location:** `src/components/SocialShare/SocialShare.tsx`, the plugin `<iframe>`
**Description:** The vendor's documented embed snippet carries `allow="clipboard-write; web-share"`.
Copy-pasting it grants a third-party frame the ability to overwrite the user's system clipboard.
**Attack Scenario:** A compromise or malicious change at the plugin origin could silently replace
clipboard contents — the classic vector being a copied crypto address or a pasted command. The
capability is not needed: the button opens a share popup, and the page provides its own copy-link
control.
**Remediation:** Applied — the `allow` attribute is removed entirely, and
`referrerPolicy="strict-origin-when-cross-origin"` plus `loading="lazy"` added.
**References:** OWASP A05:2021, Permissions Policy spec

---

**[Severity: MEDIUM — CLOSED FROM M1]**
**Title:** No Content-Security-Policy backing the consent gate
**Location:** `vite.config.ts` — `contentSecurityPolicyPlugin()`
**Description:** Carried over as mandatory action 3 from SEC-M1-STORAGE-001. Now closed.
**Remediation:** Applied as a build-only `transformIndexHtml` plugin. Verified present in
`dist/index.html` after `vite build`. Build-only is deliberate and correct: the Vite dev server
serves an inline React Refresh preamble and uses eval for HMR, both forbidden by this policy, so a
dev-time meta tag would break local development while protecting nothing that ships. `script-src`
does **not** allow `'unsafe-inline'`; `style-src` must, because React writes inline `style`
attributes and there is no nonce mechanism for those.
**References:** OWASP A05:2021, CWE-1021

---

**[Severity: LOW — ACCEPTED]**
**Title:** No Subresource Integrity on vendor scripts
**Location:** `src/utils/loadExternalScript.ts`
**Description:** `widgets.js` is loaded without an `integrity` hash, so a compromise at
`platform.twitter.com` would execute unchallenged.
**Attack Scenario:** Supply-chain compromise of the vendor CDN. The CSP limits *which* origins may
execute, but cannot detect altered content from an allowed origin.
**Remediation:** Not applicable in practice — the vendor ships a rolling, unversioned bundle and
publishes no stable hash; pinning one would break the widget at their next deploy. Accepted risk,
mitigated by the consent gate (nothing loads without opt-in), `crossOrigin="anonymous"`, and the CSP
origin allowlist. Documented rather than silently ignored.
**References:** CWE-494

---

**Verified negative** — probed and clean:

| Probe | Result |
|---|---|
| Vendor DOM present when consent is `denied` | **None.** 0 nodes, verified live at `/about` |
| Vendor DOM present before any decision | **None.** Verified by unit test |
| Credentials sent to upstreams | **No.** `xhrFields.withCredentials: false`, asserted by test |
| Injection via share title / URL | **No.** `encodeURIComponent` on both, asserted by test |
| API response rendered as HTML | **No.** All values render as React text nodes; units are shape-validated as strings |
| World Bank 200-with-error-body accepted | **No.** `isWorldBankResponse` rejects it; asserted by test |
| Secrets or API keys in source | **None.** Both upstreams keyless by architectural decision |
| `NaN` reaching the DOM from upstream data | **No.** Numeric-series validation plus the `|| 1` divisor guard |

## Section 3 — Reliability Review

**[Severity: MEDIUM — REMEDIATED]**
**Title:** Retry backoff without jitter
**Location:** `src/api/http.ts` — `getJson` retry loop
**Description:** Fixed 500 ms / 1000 ms backoff means every client that hit the same outage retries
in lockstep.
**Failure Scenario:** An Open-Meteo blip during a lab session where thirty students load the
dashboard at once: all thirty retry at exactly +500 ms and +1000 ms, re-converging on a service
already under strain. This matches the thundering-herd pattern already recorded in the team
knowledge base for token-refresh endpoints.
**Remediation:** Applied — full jitter, `ceiling/2 + random(ceiling/2)`.
**References:** AWS Architecture Blog, "Exponential Backoff and Jitter"

---

**[Severity: LOW — ACCEPTED]**
**Title:** In-flight requests are not aborted on unmount
**Location:** `src/hooks/useLiveEnergyApi.ts`
**Description:** Navigating away mid-request leaves the `$.ajax` call running to completion. The
`isMounted` ref prevents the setState-after-unmount defect, but the socket is not released early.
**Failure Scenario:** Rapid navigation across the dashboard leaves up to a few requests in flight for
their remaining timeout window. Bounded by the 8 s ceiling and the in-flight guard; no leak
accumulates.
**Remediation:** Would require threading the `jqXHR` handle out of the promise wrapper in `http.ts`
to call `.abort()`. Judged not worth the added coupling for a static site with a hard timeout and a
single concurrent request. Accepted.

---

**[Severity: INFORMATIONAL]**
**Title:** Vendor script failures are logged at `console.info`
**Location:** `SocialShare.tsx`, `SocialEmbed.tsx`
**Description:** Blocked vendor scripts are the expected case, not an error, so they are logged
quietly and the fallback UI renders. Intentional — noting it so a future reader does not mistake the
silence for a missing error path.

## Section 4 — Production Readiness

| Dimension | Score (1–5) | Summary |
|---|---|---|
| Auth & Authorization | N/A | No authentication surface; both upstreams public and keyless |
| Data Protection | 5 | No PII anywhere; `dnt=true` on the embed; referrer policy restricted on all third-party loads |
| API Security | 4 | Timeout, capped retry with jitter, boundary validation, no credentials. Deduction only for the absent abort path |
| Secrets Management | 5 | No keys exist to leak — an architectural choice, not an omission |
| Dependency Health | 4 | jQuery 3.7.1 clean (30.3 KB gzipped, cap 90 KB). Pre-existing react-router advisory remains unreachable in this SPA |
| Error Handling & Fault Tolerance | 5 | Every failure path renders a complete UI; verified by test for API failure, script block, and consent refusal |
| Observability & Alerting | 4 | Structured console diagnostics at each boundary, severity-appropriate |
| Incident Readiness | 4 | Static artifact; degradation is designed rather than incidental |

**Verdict: Go.** No outstanding blocking items. Both findings raised during this audit were
remediated within it, and the M1 carry-over is closed.

**PASS/FAIL to COA: PASS** (M2 and M3, iteration 1).
