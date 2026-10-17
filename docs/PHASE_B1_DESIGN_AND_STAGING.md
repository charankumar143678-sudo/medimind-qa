# Phase B1: Schema compatibility, time semantics, and staging gate

## Date filters

The B1 UI deliberately uses rolling windows:

- `day`: last 24 × 60 × 60 seconds, including both endpoints.
- `week`: last 7 × 24 hours.
- `month`: **last 30 days**, not a calendar month.
- `year`: **last 365 days**, not a calendar year.

Window boundaries are computed on UTC epoch milliseconds from `Date.now()`, so daylight-saving changes and local midnight do not shift the duration. Each date/time is *displayed* in the viewer's browser timezone through `Date#toLocaleString`; the user-facing labels are explicitly "Last 24 hours", "Last 7 days", "Last 30 days", and "Last 365 days". No guessed timezone is used. Future observations are never included in trend filters.

The pure module takes an injected `now` for deterministic tests and rejects future timestamps more than 60 seconds after the evaluation clock. The dashboard excludes *all* future timestamps from charts. An observation at the exactly selected rolling boundary is included.

## Existing measurements schema

The original browser storage key **remains unchanged**: `medimind_vitals_local_v1`.

Legacy format:
```json
[
  {
    "time": "2026-10-17T08:00:00.000Z",
    "values": {"sys": 120, "dia": 80, "pulse": 72}
  }
]
```

The dashboard reads `time` and the selected metric from `values` directly, so **there is no migration or rewrite**. The existing `saveVitalsHistory` and `clearVitalsHistory` functions keep writing/removing the same key, and the new renderer reads that key on every refresh. If a reading contains any subset of existing supported numeric metrics, a selected metric is eligible if it is finite and within the legacy numeric validation bound. Unselected invalid metrics are ignored by the chart (not silently corrected or persisted).

The new trend renderer rejects malformed JSON, non-arrays, invalid timestamps, unsupported metric values, readings in the future, and serialized payloads over 300,000 characters. It considers at most the latest 100 entries, consistent with the original save cap. A malformed or oversized payload produces an explanatory *empty display*, but is **not deleted or overwritten**. Existing user deletions remain effective. No new keys, accounts, cloud storage, or data transmission are introduced.

If localStorage is unavailable, the chart renders an empty state. It must not claim missing readings are medically normal or infer missing measurements.

## Staging separation and blocker

- GitHub source files: `app/index.tsx` is the **exact deployed Function source baseline** captured from Railway without applying any changes; `app/index.b1.tsx` is the independently reviewable Phase B1 candidate preserving 11 sections.
- Production project: `abbe7d0f-07aa-417f-adf8-b693fd7741d3`, service `514b0597-b990-4267-ae1c-89cb1c4a1392`.
- Verified initial active baseline: deployment `26f5a09b-b064-479a-b980-35afffbded45`. No production writes are performed by B1 changes.
- Attempted to create an isolated Railway project with its own environment named `staging`; Railway returned: **Free plan resource provision limit exceeded. Please upgrade to provision more resources!**
- **No public Railway staging URL can be truthfully supplied until Railway permits provisioning.** Do not use the production environment, shared hostname, volumes, patient data, or secrets for preview.
- Temporary safe validation: GitHub Actions launches `app/index.b1.tsx` in its own ephemeral Ubuntu runner at `http://127.0.0.1:3000`, verifies Chromium, runs all 17 original Playwright scenarios unchanged plus four synthetic B1 scenarios, and uploads HTML/JUnit, dashboard screenshots, and diagnostics. This runner is isolated and not a public staging URL.
- To satisfy the Railway staging deliverable, increase workspace resource allowance or free capacity *with explicit user approval*, then create an isolated project/environment, deploy only the B1 candidate and run the same suite against the generated staging domain.

## B1 scope limitations

- Existing six vitals and their legacy units only. Weight/BMI history, separate records, health goals and clinician-reviewed ranges belong to later increments.
- Trend statistics are descriptive aggregates of user-entered numbers; they are not diagnoses or recommendations.
- All data stays in browser-local storage unless a separately reviewed backend architecture is implemented.
- Preserve existing 17 tests; new tests must not change their assertions or bypass accessibility checks.
