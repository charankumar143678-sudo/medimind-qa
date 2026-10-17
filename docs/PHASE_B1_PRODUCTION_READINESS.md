# MediMind Phase B1 — Production readiness and QA report

Date: 2026-10-17

## Source and changes

- Baseline `app/index.tsx`: exact unmodified Bun Function source captured from Railway deployed code.
- B1 candidate `app/index.b1.tsx`: exact complete 11-section app with added rolling-window selection (24h, 7d, 30d, 365d), descriptive measurement summaries, historical chart filtering, date-aware empty state and 30-day-old reading reminder.
- Pure calculations `preview/health-core.mjs`: injected evaluation clock; explicit fixed-duration rolling windows, numeric bounds, no generated observations.
- New tests `preview/health-core.test.mjs` and `tests/test_b1_dashboard.py`.
- Workflows `.github/workflows/phase-b1-preview.yml` and `.github/workflows/phase-b1-integration.yml`.
- Documentation `docs/PHASE_B1_DESIGN_AND_STAGING.md` describing UTC-based epoch windows and legacy localStorage schema.

## Actual test evidence

- Preview Node tests: **7 passed**, 0 failed, locally and in GitHub Actions (PR branch).
- GitHub Actions B1 CI run [39017664505](https://github.com/charankumar143678-sudo/medimind-qa/actions/runs/39017664505): **21 passed, 0 failed, 0 blocked, 0 unexecuted**, comprising **17 original unchanged scenarios** plus **4 new B1 browser scenarios**. Verified Chromium startup; tests ran on Bun preview at local loopback, not production.
- Tested: 11 sections, legacy storage compatibility, rolling filters and summaries, oversized/malformed/future/out-of-range data rejection, mobile RTL presentation, both original accessibility suites, and original full regression set.
- Artifact: [GitHub Actions QA artifacts](https://github.com/charankumar143678-sudo/medimind-qa/actions/runs/39017664505/artifacts/12095860306) includes HTML report, JUnit XML, classification JSON, screenshots `dashboard-b1-desktop.png`, `dashboard-b1-mobile-ar.png`, and test traces.
- Execution environment: GitHub Actions ephemeral runner, not a persistent public staging URL.

## Staging blocker and release gate

Attempting `create_project(name="MediMind Phase 2 B1 Staging",defaultEnvironmentName="staging")` in Railway failed with:

> Free plan resource provision limit exceeded. Please upgrade to provision more resources!

No Railway staging project, instance or public staging hostname was created. Production project was **not modified**. A release is not ready until:
1. An isolated Railway staging environment/service and domain can be provisioned with approved account capacity.
2. The exact `app/index.b1.tsx` is deployed to staging only.
3. Health checks, the same 17 original tests, 4 new B1 tests, and 7 unit tests are run against the public staging URL.
4. Screenshots, browser/console logs and bilingual accessibility are reviewed.
5. A reviewer authorizes production separately.

## Privacy, clinical and accessibility limitations

- All vitals persist only in the original browser key `medimind_vitals_local_v1`. No cloud storage, auth, AI models or patient identifiers are introduced.
- Dashboard readings, means and ranges are descriptive only; no diagnoses or personalized clinical targets.
- Six original vitals remain supported. Historical weight/BMI, separate record CRUD and goal tracking are deferred.
- Mobile English/Arabic RTL direction and existing axe tests pass, but **full translation coverage remains incomplete**; screenshot shows some English explanatory copy in Arabic mode.
- Staleness of a measurement does not imply a medical concern. No validation for medical decision-making has occurred.
- Browser-local data is not encrypted; do not enter real patient data in a shared or untrusted device.

## Rollback

- Production remains on successful Railway deployment `26f5a09b-b064-479a-b980-35afffbded45`, rollback eligible when verified, with service `514b0597-b990-4267-ae1c-89cb1c4a1392`.
- No production rollback is required because no production changes were performed.
- Roll back preview by using baseline `app/index.tsx` instead of `app/index.b1.tsx`, or by reverting B1 commits on the PR branch. Do not alter the production Function without explicit approval.

**Status: B1 candidate QA PASS on ephemeral CI, public Railway staging BLOCKED (workspace resource limit), production release NOT READY. PR remains DRAFT and UNMERGED.**
