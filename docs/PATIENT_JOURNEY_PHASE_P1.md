# Patient-facing experience — Phase P1 implementation status

Date: 2026-10-17

## Scope implemented (development branch only)
- Preserved the original eleven MediMind navigation sections and Bun Function architecture.
- Added a guest-accessible patient journey panel on Home with shortcuts to existing consultation, lab reports, vitals, profile, and medical education.
- Added UAE ambulance shortcut (998) with a clear geographic limitation.
- Added a small bilingual searchable educational topic index (headache, fever, asthma, diabetes, high blood pressure) with outbound MedlinePlus URLs. **These are links to external patient-information pages, not a locally reviewed clinical knowledge base or a broad catalog.** No diagnosis or clinical inference.
- Added optional, in-memory appointment-preparation fields and locally downloadable plain-text summary, plus clear control. No account, patient upload, AI API, or new browser persistence.
- Added four synthetic browser tests in `tests/test_patient_journey.py`.
- Fixed two confirmed Arabic defects from earlier 39-scenario CI: lab low-range terminology and body-input validation localization, preserving original assertions.

## Files changed
- `app/index.b1.tsx` (review-only candidate; production baseline `app/index.tsx` unchanged)
- `tests/test_patient_journey.py`
- `docs/PATIENT_JOURNEY_PHASE_P1.md`

## Security and clinical limitations
- Existing symptom assistant remains a **keyword/rule-based educational demo**, not a validated triage device, autonomous clinician, or generative medical AI.
- Five external links are a narrow starter index; pages, licensing, review dates, and content provenance need verification before claiming curated clinical coverage.
- Appointment notes are retained only in DOM memory until refresh/clear; download writes a plaintext file on the user's device. Avoid real identifying or sensitive information in this prototype.
- Existing localStorage vitals/profile remain browser-local and unencrypted; this phase adds no cloud storage or new secrets.
- Bilingual static UI and dynamic Arabic coverage are still incomplete; clinical and language reviewers must approve before any patient-facing clinical claims.
- No professional medical review or WCAG 2.2 AA conformance assessment is complete.

## Release gates
- Full existing and added Playwright suites, preview calculation tests, accessibility tests and artifacts must pass in GitHub Actions on the exact latest commit.
- Independently validate external source links and accuracy; conduct clinical safety review and Arabic linguistic review.
- Manual keyboard/screen-reader/RTL/reflow/touch-target audit and privacy assessment.
- Public isolated Railway staging remains blocked by Free-plan resource provision limit; no production deploy or paid provisioning authorized.
- PR #1 is unmerged. Production must not be modified without explicit approval.

## Rollback
Revert patient-facing candidate commits on development branch or use versioned `app/index.tsx` original Function baseline for preview. Production rollback reference: `26f5a09b-b064-479a-b980-35afffbded45`. Production was not changed.
