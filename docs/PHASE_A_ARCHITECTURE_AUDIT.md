# MediMind Phase 2 — Phase A architecture audit (2026-10-17)

## Inspected baseline

- Production Railway project: `abbe7d0f-07aa-417f-adf8-b693fd7741d3`
- Service: `514b0597-b990-4267-ae1c-89cb1c4a1392`; environment: `production`
- **Current successful deployment:** `26f5a09b-b064-479a-b980-35afffbded45` (rollback eligible). The previous `34526bbd-15c8-466a-ae23-558dde53af07` and `93c5cc5d-1270-46d7-948e-7b01e2228ef8` releases are historical/removed, not the current release.
- Source: one Bun Railway Function, `index.tsx`, containing one approximately 72 KB HTML/CSS/JS string. `Bun.serve` returns the HTML for `/` and `/index.html` and `ok` for `/health`.
- No configured Railway environment variables, app API calls, database, uploads endpoint or authentication in the inspected function. Browser storage is **not encrypted or access-controlled cloud storage**.
- 17/17 original synthetic Playwright tests passed in GitHub Actions run [39016088282](https://github.com/charankumar143678-sudo/medimind-qa/actions/runs/39016088282). That is a regression baseline, not clinical validation.

## Section-by-section review

| Section | Present, demonstrably implemented | Phase 2 gap |
| --- | --- | --- |
| Home | 11-section navigation, educational content, user-entered vitals bar chart | Time filters, goal progress, freshness guidance, independently verified trend calculations |
| Consult | Rule-based symptom chat and emergency guidance | Explicit AI scope/bilingual evaluation; any generative model requires secure backend and review |
| Reports | Paste/upload UI and rules-based analyte comparisons | Audited PDF/image processing, structured units, contextual interpretation and PDF export |
| Body | BMI and waist-to-height educational calculations | Formula edge cases, units, history and calculation-focused unit tests |
| Nutrition | Educational meal generator | Logged meals, authoritative food data source, configurable goals and historical totals |
| Fitness | Basic training outline | User-entered activity history, scheduling, summary and goals |
| Library | Educational information display | Source provenance, freshness and bilingual coverage |
| Vitals | Local save, ranges, selector, deletion, timestamped historical chart | CRUD by individual record, six-metric trends, date filters, data export and validation hardening |
| UAE | UAE emergency numbers and visit preparation | Verify external links and wording regularly; no availability integration |
| Medsafe | Pharmacist question checklist | Opt-in medication organizer with schedules/statuses and privacy controls |
| Profile | Browser-local age/allergies/conditions/medications and deletion | Preferences, consent, portable exports, individual field/record deletion |

## Security and functional findings

1. **Data lifecycle:** profile key `medimind_profile_v1` and vitals key `medimind_vitals_local_v1` use localStorage. No cloud synchronization or user accounts. Browser localStorage is accessible to scripts on the same origin, persists in browser profiles, and is not suitable for claiming secure patient record hosting.
2. **Document handling:** the presence of an upload control does not establish a secure document repository, validated PDF/image parsing, OCR, or medical interpretation. Do not persist unencrypted sensitive document contents to localStorage.
3. **Educational assistant:** there is no network API call to a clinical or general LLM in the current source; described outputs are local rules and templates.
4. **Bilingual:** `lang`/RTL changes and dictionary replacement work, but dynamic strings, context-dependent medical explanations and keyboard/screen reader workflows require dedicated language and accessibility QA.
5. **Charts:** current bars represent recent saved observations without selectable date windows; it is not a full medical trend analysis.
6. **Records/privacy:** no authenticated backend, retention policy or server deletion workflow exists; new local record features must be transparently labeled local-only and must be privacy-reviewed before including real documents.
7. **Release management:** Railway Function source is not currently stored as a deployable repository; treat the QA repository as tests/audit, not as an approved production source-of-truth. Introduce version-controlled app source and preview isolation before adding sensitive features.

## Prioritized implementation

| Priority | Phase | Smallest independently testable increment | Safety gate |
| --- | --- | --- | --- |
| P0 | A | Capture source/deployment baseline, architectural inventory, nonproduction preview and data-model contract | Preserve 11 sections, source parity, 17 tests |
| P1 | B | Local-only vitals: day/week/month/year selectors; explicit empty states, timezone-aware filtering, sanitized export | Source-derived readings only, no diagnoses, test valid/invalid/stale dates |
| P1 | E | Consent copy, privacy/data/export/delete controls, English/Arabic validation and accessibility | No transmission of health data |
| P2 | B | Structured manually entered records with metadata, edit/delete, safe non-cloud storage | Data limits, explicit consent; never imply encryption |
| P2 | C | Structured analytes with strict supported-unit rules and user-provided reference range; plain-language explanations | No diagnosis, contextual ranges, clinical content review |
| P2 | D | Local nutrition/activity/medication logs, goals and status | Synthetic fixtures; no automated prescription, dose or severe diet advice |
| P3 | B | PDF/image ingest, categorization, OCR, searchable documents, generated PDF output | Threat modeling, storage/data retention, consent and browser capacity |
| P3 | C | Real AI assistant and multilingual citation-backed knowledge | Authenticated backend, server-side secrets, content review, abuse and emergency escalation testing |
| P3 | E | Accounts, multi-device sync and cloud records | Secure architecture review: OAuth/OIDC, RBAC, encrypted storage, auditing, deletion and incident response |

## Proposed staging and acceptance

- **No production writes.** Start with an isolated Git branch and locally testable code/fixture, then use a separate preview deployment only after it is demonstrably isolated from the production function, environment variables, hostname and storage.
- Keep the original 17 tests immutable. Add independent regression tests for each new feature. Use synthetic data only.
- Before any production release: reviewer-approved diff, staging smoke test, 17 original tests plus new tests, bilingual axe-core checks, rollback rehearsal/documentation and explicit authorization.
- Rollback baseline: Railway deployment `26f5a09b-b064-479a-b980-35afffbded45`. Preserve exact deploy snapshot and existing production service. A staging rollback reverts the staging branch/preview; never roll production back without authorization.

## Phase A deliverable status

- Features implemented: no application-facing changes; audit and branch isolation.
- Files changed: this audit document in QA repository branch only.
- New dependencies: none.
- Test status: 17 historical baseline tests passed; **new phase changes have not been run**.
- Known limitations: no independent staging Railway environment available in the inspected project (only `production`); no clinical safety approval, no cloud backend, no end-to-end documents audit.
- Readiness: **audit ready for review; production deployment NOT approved**.
