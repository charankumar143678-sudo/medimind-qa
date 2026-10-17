# Phase 2 consultation — implementation and safety review (2026-10-17)

## Implemented in isolated development candidate
- Separate versioned `app/consultation-engine.js` deterministic consultation state/safety module; same module embedded in the single-file Bun Function candidate `app/index.b1.tsx`.
- Seven symptom families with English/Arabic synonyms: headache, fever, cough, abdominal pain, back pain, skin symptoms, fatigue. Multiple reported symptoms are retained.
- Duration and severity extracted only when supplied. No inferred patient measurements, diagnoses or clinician findings.
- Emergency-first keyword/phrase warning rules for stroke-like signs, severe chest pain, major breathing problems, serious allergic reactions, uncontrolled bleeding, loss of consciousness, head injury, immediate self-harm concerns and fever with neck stiffness/confusion. Rules are **not clinically validated** and can miss variants or context.
- When an emergency phrase is detected, no routine questions are shown; UAE ambulance 998 displayed with geographic limitation.
- In-memory patient session, contextual follow-up prompts, bilingual educational wording, local summary download and reset. No new cloud storage, patient database, credentials or API keys.
- Existing eleven app sections, prior localStorage formats and B1 dashboard remain intact.
- New unit tests `preview/consultation-engine.test.mjs` and Playwright `tests/test_consultation_patient.py`. Original tests are not weakened.

## Clinical risk register
1. **High:** phrase-based rules are not medically validated; negatives, slang, dialects, pediatric/pregnancy risk, symptom interactions, age, and uncertain descriptions can produce missed or spurious flags. Unknown cases explicitly remain unclassified, not safe.
2. **High:** no clinician-reviewed differential diagnosis or safe care-level algorithm; only generic caution and questions. No individualized medication or treatment guidance.
3. **High:** Arabic phrasing needs professional bilingual medical review, including regional dialects and emergency signs.
4. **Medium:** medical reference links are externally hosted; link availability, current page content, permitted reuse, and latest clinical review must be independently verified.
5. **Medium:** consultation is kept in page memory; browser refresh clears it. Downloaded text is unencrypted on the user's device and should not be treated as a hospital record.
6. **Medium:** accessibility requires manual keyboard, screen-reader, touch, reflow and Arabic RTL validation in addition to automated checks.
7. **Medium:** existing profile and vitals browser localStorage are unencrypted and unsuitable for sensitive patient data on shared devices.

## Medical source and licensing policy
- Outbound educational links point to MedlinePlus condition pages (U.S. National Library of Medicine). Only topic labels and links are locally stored; no wholesale copying of article content.
- A reference link is **not** a clinical endorsement or proof of freshness. No condition pages have been independently reviewed by qualified clinicians.
- Before importing WHO, NHS, CDC, ICD-11 or SNOMED CT datasets, validate terms of use, attribution, country-specific licensing, version dates, and intended application scope. Do not assert permission by default.
- The current five-topic directory is a starter catalog, not a scalable verified condition encyclopedia.

## Testing and release gates
- Node test command: `cd preview && npm test`.
- Isolated GitHub Actions workflow: `.github/workflows/phase-b1-integration.yml`; runs all `tests/` Playwright scenarios against an ephemeral preview.
- Only cite completed workflow runs matching the candidate SHA; do not claim a pass for pending/failed runs.
- Clinical professional review and Arabic medical-language review required before use as medically validated decision support.
- Public Railway staging remains unavailable under Free-plan capacity restrictions; no paid resources or production changes authorized.
- Do not merge PR #1 or deploy production without explicit user approval.

## Rollback
Revert the Phase 2 consultation candidate commits on the development branch, or use versioned baseline `app/index.tsx` for preview. Railway production deployment rollback reference remains `26f5a09b-b064-479a-b980-35afffbded45`, but no production rollback is needed because it was not changed.
