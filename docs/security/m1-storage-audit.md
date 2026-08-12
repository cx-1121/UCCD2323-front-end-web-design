---
id: SEC-M1-STORAGE-001
type: security-audit
version: 1.0.0
author: SRE (senior-security)
status: FAIL
dependencies: [PRD-RUBRIC-UPLIFT-001, ARCH-RUBRIC-UPLIFT-001]
related_requirements: [FR-STO-001..006]
timestamp: 2026-08-12
---

# M1 Security & Reliability Audit — Storage Foundation

**Review track:** Track 2 (implementation audit, post-submission).

## Section 1 — Executive Summary

The consent gate — the control that M3's entire third-party script boundary rests on — is
sound. `canLoadThirdParty` can only read `true` when the `refuture_consent` cookie holds exactly
`granted`; every other value, including a tampered or truncated one, degrades to `'unset'` and
re-prompts. The storage boundary is genuinely enforced: a repo-wide grep finds zero raw
`localStorage`/`sessionStorage`/`document.cookie` access outside the two boundary modules. There
are no XSS sinks in the new code — no `dangerouslySetInnerHTML`, no `innerHTML`, no `eval` — and
the deliberate choice to persist answer *indices* rather than question objects removes the only
path by which attacker-controlled `sessionStorage` content could reach the DOM.

One blocking defect was found and reproduced: **`discardSavedProgress()` leaves a one-shot
suppression flag armed, so the first answer submitted after a visitor chooses "Start over" is
silently not persisted** — a direct violation of FR-STO-005. This is exactly the coupling CDE
flagged for review, and it is not covered by the existing test suite.

**Verdict: FAIL.** One mandatory fix, all other findings non-blocking.

## Section 2 — Vulnerability Assessment

---

**[Severity: LOW]**
**Title:** Consent state is read once and never re-synchronised across tabs
**Location:** `src/context/ConsentProvider.tsx` — `useState<ConsentStatus>(readPersistedConsent)`
**Description:** The cookie is read a single time at provider mount. If the visitor declines in one
tab while another tab is open with `granted`, the second tab keeps its in-memory `granted` and will
continue to permit third-party script injection for the life of that page. The cookie is correct on
disk; only the React mirror is stale.
**Attack Scenario:** Not attacker-driven — the realistic path is a privacy-conscious user who opens
the site in two tabs, withdraws consent in tab B via the banner (or clears the cookie in devtools),
and reasonably believes Facebook and X scripts are no longer running. In tab A they still are, and
in M3 those scripts will keep loading and beaconing. The gap is a consent-integrity failure, not a
code-execution one.
**Remediation:** Subscribe to cross-tab changes and re-read on focus:
```ts
useEffect(() => {
  const resync = () => setStatus(readPersistedConsent());
  window.addEventListener('focus', resync);
  return () => window.removeEventListener('focus', resync);
}, []);
```
**References:** CWE-613 (Insufficient Session Expiration), GDPR Art. 7(3) (withdrawal as easy as
giving consent)

---

**[Severity: LOW]**
**Title:** Asymmetric autofocus biases the consent decision toward Accept
**Location:** `src/components/CookieConsent/CookieConsent.tsx` — `autoFocus` on the Accept button
**Description:** Both controls are equal in size, contrast and tab order, which is correct. But
`autoFocus` lands on Accept alone, so a keyboard user pressing Space or Enter on arrival consents
without an explicit choice. Regulators treat pre-selected or nudged consent as not freely given.
**Attack Scenario:** No external attacker. The risk is regulatory and reputational: a consent record
of `granted` that the user did not deliberately produce is not a defensible record.
**Remediation:** Move focus to the dialog container rather than either button —
`<div role="dialog" tabIndex={-1} ref={focusOnMount}>` — so the banner is announced and reachable
without pre-selecting an answer.
**References:** OWASP ASVS 3.7, EDPB Guidelines 05/2020 on consent

---

**[Severity: MEDIUM — deferred to M3, not blocking for M1]**
**Title:** No Content-Security-Policy backing the consent gate
**Location:** `index.html` — no `http-equiv="Content-Security-Policy"` meta; no server headers
configured
**Description:** M1's consent flag is currently the *only* thing standing between the page and
third-party script execution once M3 lands. It is a JavaScript-level control: anything that runs
before or around it — an injected script, a compromised dependency, a browser extension — bypasses
it entirely. A CSP is the independent, browser-enforced second layer.
**Attack Scenario:** A supply-chain compromise of any bundled dependency (the app ships 5 runtime
packages) injects a script tag pointing at attacker infrastructure. The consent gate never sees it,
because the gate only governs code paths *we* wrote. With no CSP, the browser executes it and it can
exfiltrate anything in `localStorage`, including the journey state. With a CSP restricting
`script-src` to `self` plus the two vendor origins, the injected origin is blocked outright.
**Remediation:** Add to `index.html` before M3 ships, allowing exactly the vendors the architecture
names and nothing else:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://platform.twitter.com;
               frame-src https://www.facebook.com https://platform.twitter.com;
               connect-src 'self' https://api.open-meteo.com https://api.worldbank.org;
               img-src 'self' data: https:;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src https://fonts.gstatic.com;
               object-src 'none'; base-uri 'self'">
```
**References:** OWASP A05:2021 Security Misconfiguration, CWE-1021

---

**[Severity: INFORMATIONAL — HIGH by CVSS, not exploitable in this application]**
**Title:** react-router-dom 7.18.1 carries a high-severity RSC-mode CSRF advisory
**Location:** `package.json` → `react-router-dom@^7.18.1` (GHSA-qwww-vcr4-c8h2)
**Description:** `npm audit` reports two high-severity findings against react-router. The advisory
concerns **RSC mode**, where actions may execute before a 400 response is returned. This application
is a purely client-side SPA: it uses `BrowserRouter`, has no React Server Components, no server
actions, no loaders, and no backend of its own. The vulnerable code path is not reachable here.
Reported for completeness and because the CVSS score will surface in any automated scan of the repo.
**Attack Scenario:** Not reachable in this deployment. It becomes live only if the project later
adopts RSC or framework mode.
**Remediation:** `npm audit fix` when convenient. Do **not** run it as part of this milestone — a
router upgrade mid-pipeline risks the routing behavior the 15% UI/UX criterion depends on, for no
reduction in real risk. Pre-existing; not introduced by M1.
**References:** GHSA-qwww-vcr4-c8h2, CWE-352

---

**No finding — verified negative.** The following were specifically probed and are clean:

| Probe | Result |
|---|---|
| `canLoadThirdParty` reachable as `true` without a `granted` cookie | **No.** Strict equality against two literals; all other values → `'unset'` |
| Prototype pollution via `JSON.parse` of a crafted snapshot | **No.** `JSON.parse` does not invoke the `__proto__` setter; only three scalar fields are read |
| Attacker-controlled `sessionStorage` reaching the DOM | **No.** Only answer *indices* are persisted; all rendered question text comes from the bundled module |
| Out-of-bounds index into `quizQuestions` from a crafted snapshot | **No.** `isValidProgress` bounds `currentIndex` and ties `answers.length` to it |
| Raw storage access bypassing the boundary | **No.** Repo-wide grep returns zero hits outside the two boundary modules |
| XSS sinks in new code | **No.** No `dangerouslySetInnerHTML`, `innerHTML`, or `eval` |
| Secrets in source | **No.** M1 introduces no credentials; both M2 endpoints are keyless by design |

## Section 3 — Reliability Review

---

**[Severity: HIGH — BLOCKING]**
**Title:** Armed suppression flag silently drops the first answer after "Start over"
**Location:** `src/hooks/useQuizChallenge.ts` — `discardSavedProgress()` sets
`skipNextPersist.current = true`; the persistence `useEffect` depends on
`[currentIndex, selectedAnswer, responses, isComplete]`
**Description:** `discardSavedProgress()` arms the one-shot flag and then changes only
`savedProgress`, which is **not** in the effect's dependency array. The effect therefore never runs
to consume the flag, and it stays armed. The next genuine state change — the visitor answering a
question — triggers the effect, which sees the stale flag, clears it, and returns *without
persisting*. FR-STO-005 requires a write on every answer submission.
**Failure Scenario:** Reproduced, not hypothetical. A visitor answers question 1 and closes the tab.
They return, are offered "Unfinished attempt found", and choose **Start over**. They answer question
1 again. They refresh. Their answer is gone and no resume is offered, because nothing was written.
The same latent path exists in `restartQuiz()` when it is called on an already-pristine quiz.
Confirmed by direct probe:
```
× persists the first answer given after the visitor chooses Start over
  AssertionError: expected null not to be null
```
**Remediation:** Delete the ref and the guard entirely — it is solving a problem the code no longer
has. Both handlers already remove the key from storage *and* reset state to pristine, and the
effect's own `isPristine` guard suppresses the redundant write. Drop `skipNextPersist` from
`discardSavedProgress`, `restartQuiz`, and the effect body. Add the probe above to
`useQuizChallenge.test.ts` as a permanent regression test.
**References:** CWE-372 (Incomplete Internal State Distinction)

---

**[Severity: INFORMATIONAL]**
**Title:** `warnOnce` permanently suppresses later, unrelated storage failures
**Location:** `src/utils/storage.ts` — `hasWarned` latch inside `createSafeStore`
**Description:** The latch is per-store and never resets, so a `QuotaExceededError` at minute one
silences the diagnostic for a `SecurityError` at minute forty. Intentional noise control, but it
means the console is not a reliable signal of the *current* storage failure mode.
**Failure Scenario:** During grading or debugging, an early transient failure hides a later
persistent one, and the storage layer appears healthy when it is not.
**Remediation:** Latch per operation rather than per store — `Set<string>` keyed on the operation
name. Accept as-is if console noise is the greater concern; this is a diagnostic-quality issue, not
a correctness one.
**References:** OWASP A09:2021 Security Logging and Monitoring Failures

## Section 4 — Production Readiness

| Dimension | Score (1–5) | Summary |
|---|---|---|
| Auth & Authorization | N/A | No authentication surface exists; no credentials, sessions, or roles in scope |
| Data Protection | 4 | No PII stored anywhere. Consent cookie correctly scoped `SameSite=Lax`, `Secure` auto-enabled on HTTPS. Cross-tab withdrawal gap is the only deduction |
| API Security | N/A | Deferred to M2 — no network surface in this milestone |
| Secrets Management | 5 | No secrets introduced; both planned upstreams are keyless by architectural decision |
| Dependency Health | 3 | M1 adds zero dependencies. Pre-existing react-router advisory is unreachable in this SPA but will surface in scans |
| Error Handling & Fault Tolerance | 2 | Storage wrappers are genuinely fault-tolerant and well-tested, but the blocking persistence defect drops user data on a reachable path |
| Observability & Alerting | 3 | Structured `console.warn` at every failure boundary, which is proportionate for a static SPA. The `warnOnce` latch reduces fidelity |
| Incident Readiness | 4 | No deploy surface to roll back; malformed persisted state is self-healing (validated and evicted on read) |

**Verdict: No-Go** — one blocking defect. Downgrades to **Go** once the item below is closed;
nothing else in this report blocks M1.

### Mandatory actions

1. **"Armed suppression flag silently drops the first answer after Start over"** — remove the
   `skipNextPersist` ref and its guard from `discardSavedProgress()`, `restartQuiz()`, and the
   persistence effect in `src/hooks/useQuizChallenge.ts`; the existing `isPristine` guard already
   covers the case it was written for. Owner: **CDE**.
2. **"Armed suppression flag..."** — add the reproduced probe to `src/hooks/useQuizChallenge.test.ts`
   as a permanent regression test, asserting a write occurs on the first answer after
   `discardSavedProgress()`. Owner: **CDE**.
3. **"No Content-Security-Policy backing the consent gate"** — not blocking for M1, but must be
   closed before M3 ships third-party scripts. Owner: **COA** to schedule into M3's contract.

**PASS/FAIL to COA: FAIL** (iteration 1 of 3).
