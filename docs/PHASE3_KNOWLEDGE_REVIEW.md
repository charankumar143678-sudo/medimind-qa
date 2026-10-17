# Phase 3 Medical Knowledge — provenance, review register and release gates

**Date:** 2026-10-17. **Branch:** `phase2/phase-a-audit-and-local-core`. **Production:** unchanged.

## Catalog inventory and scope
- **6 locally authored, source-linked educational condition summaries**: asthma, diabetes, hypertension, urinary tract infection, anemia, migraine.
- **3 medical test topics**: complete blood count, hemoglobin A1c, urinalysis.
- **0 professionally clinically reviewed or medically certified local records.** The word *verified* here means only that MedlinePlus destination URLs were checked during development; it does not mean the locally authored summaries have received clinical sign-off.
- Source provider: MedlinePlus, U.S. National Library of Medicine; `source.verifiedOn` 2026-10-17 records link check, while `clinicalReviewDate` is null.
- No copyrighted article content imported; source text remains on external linked websites. Local descriptions are short original summaries, **not an endorsed clinical reproduction**.
- Full condition-page fields without reviewed material explicitly show a limitation and direct users to source. No fabricated dates or laboratory ranges.

## Implementation
- `app/medical-knowledge.js`: typed record classification (`condition` vs `test`), stable IDs, bilingual labels/synonyms, specialty, validation, duplicate rejection, normalized search, bounded result count.
- `app/index.b1.tsx`: searchable accessible cards, type and specialty filters, bilingual summaries, safe `textContent` detail accordions, references and dates, consultation-to-education links.
- Consultation's emergency-first rule remains independent of catalog matches; matching a topic does not imply a diagnosis.
- Existing 11 sections, Phase 1 journey, Phase 2 consultation, and legacy browser storage retained.

## Provenance and licensing
- Condition sources:
  - https://medlineplus.gov/asthma.html
  - https://medlineplus.gov/diabetes.html
  - https://medlineplus.gov/highbloodpressure.html
  - https://medlineplus.gov/urinarytractinfections.html
  - https://medlineplus.gov/anemia.html
  - https://medlineplus.gov/migraine.html
- Lab topic sources:
  - https://medlineplus.gov/lab-tests/complete-blood-count-cbc/
  - https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/
  - https://medlineplus.gov/urinalysis.html
- External linking only, no bulk content import. License review for redistribution, translated clinical text, API ingestion, and future ICD/SNOMED terminology imports is **not complete**.
- Dates refer to link checking, not source publication or clinical review dates. External pages may change after checking.

## Outstanding clinical/content gaps
1. Qualified clinical review for all 6 local summaries and 3 test explanations.
2. Qualified Arabic medical-language review for labels and content. Arabic titles and controls are provided; explanatory copy is partly English with explicit unreviewed-content warning.
3. Expand structured content only after verifying sources; risk factors, complications, prevention, and uncommon symptoms currently show limitations rather than invented statements.
4. Review source licensing, link health, content freshness and clinical evidence update cadence.
5. Manual WCAG 2.2 AA accessibility, RTL, screen-reader, mobile reflow, and keyboard testing beyond automation.
6. Public isolated Railway staging blocked by account Free-plan capacity. No production changes or paid resources authorized.

## QA and release
- Unit: `cd preview && npm test`, including `medical-knowledge.test.mjs`.
- Browser: GitHub Actions `phase-b1-integration.yml` executes all existing and new Playwright scenarios.
- Check completed run results against the exact candidate SHA before release.
- Production rollback reference: `26f5a09b-b064-479a-b980-35afffbded45`; not invoked because production is unchanged.
- PR #1 remains draft and unmerged. **Production recommendation: HOLD**, pending clinical review, language review, isolated staging and explicit user approval.
