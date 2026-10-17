# Phase 4 — Zero-API-cost adaptive consultation candidate

## Scope
- Versioned `MediMindAdaptive` interface, `medimind-consultation-v1`, in `app/adaptive-consultation.js`.
- Uses existing Phase 2 deterministic emergency flagging first; no LLM calls, API keys, subscriptions, or network transfers of consultation data.
- Optional **explicit per-consultation opt-in** to read existing `medimind_profile_v1` from browser localStorage. Default off. Age, medication, allergy and condition context influence follow-up questions and generic educational cautions, not diagnoses.
- Patient-entered duration and severity are passed into the adaptive context. No unsupported clinical probabilities, medication dosage, treatment prescriptions or clinical clearance.
- In-memory session, reset and existing local text summary retained. Summary intentionally excludes saved profile values; patient-entered duration and severity may be included.
- Existing 11 app sections, Phase 1, Phase 2 and Phase 3 preserved.

## Future model-provider boundary
`MediMindAdaptive.assess({message,context,engine,turn})` returns:
`{schemaVersion,urgency,flags,questions,guidance,sources,state,lines,context,provider}`.
A future LLM adapter can propose additional questions or educational text, but MUST:
1. Run the independent deterministic safety engine before using any model output.
2. Preserve emergency flags and emergency-first UI; never downgrade or suppress emergency advice.
3. Validate the model response schema, output length, URLs, provenance and language; sanitize DOM rendering.
4. Obtain explicit informed consent and complete privacy/security review before sending any profile or symptom text to a third-party model.
5. Include provider failure fallback to the local deterministic engine and preserve the zero-cost offline path.

## Safety and privacy limitations
- This is a keyword-based educational consultation, **not clinically validated triage**. Emergency phrases and risk questions are incomplete and may miss symptoms, negations, dialects, pediatric and pregnancy-specific contexts.
- Personalized guidance is generic; a recorded condition or medication is never treated as a confirmed diagnosis or prescribed treatment.
- Browser localStorage is unencrypted and unsuitable for sensitive records on shared devices. Profile reading is optional and limited to existing stored data; no new persistent consultation keys.
- Arabic phrasing and individualized risk-context questions require qualified bilingual clinical review.
- For emergencies in the UAE, ambulance number 998; elsewhere use local emergency services.

## Verification
- Unit: `cd preview && npm test` (includes `adaptive-consultation.test.mjs`).
- Browser: `tests/test_adaptive_consultation.py` in existing isolated Playwright GitHub Actions workflow.
- Review latest exact commit and completed GitHub Actions runs before asserting pass.
- No automatic production deployment in this phase. Production was previously explicitly authorized for Phase 3, not this new Phase 4 candidate.

## Phase 4B stateful dialogue extension
- `app/consultation-dialogue.js` stores session answers in memory, asks at most two unanswered follow-ups per step, accepts corrections, tracks progress, and interrupts on deterministic emergency signals.
- The dialogue tracks symptom onset, severity, onset style, location, associated symptoms, daily-life impact and symptom trend. It does not infer unknown information; ambiguous free text is not force-mapped to a specific answer.
- The summary exports patient-entered follow-up answers; the reset action clears dialogue memory.
- Added `preview/consultation-dialogue.test.mjs` and `tests/test_consultation_dialogue.py`.
- **Known limitation:** This is a bounded rule-based questionnaire, not clinical differential diagnosis, complete medication identification, or a validated emergency triage tool. Arabic and clinical question sequencing still require qualified review. Profile export and richer medication reference workflows are not yet implemented.
