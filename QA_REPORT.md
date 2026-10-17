# MediMind QA baseline

This repository contains 17 synthetic-only Playwright regression scenarios (9 in `tests/test_medimind.py`, 8 in `tests/test_extended.py`).

## Prior local validation

- Python compilation: passed
- Pytest collection: 17 collected
- Local browser execution: 17 blocked by Chromium/runtime setup before application assertions
- GitHub Actions browser results: pending; inspect the Actions tab for current results
- Application assertions passed: none confirmed from the prior local attempt
- Confirmed application failures: none established

## Scope

The workflow targets https://medimind-web-production.up.railway.app and does not modify Railway. Accessibility audits require provisioned axe-core. This suite does not establish clinical safety or medical validity.

See GitHub Actions artifacts for fresh JUnit, HTML, screenshots, traces and classification reports.
