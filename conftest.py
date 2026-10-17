"""Per-test pytest classification; never log health data or browser storage."""
import json
from pathlib import Path
import pytest

ARTIFACTS = Path('artifacts')

def pytest_sessionstart(session):
    ARTIFACTS.mkdir(exist_ok=True)
    session.config._medimind_reports = {}

def _classify(report):
    if report.skipped:
        return 'skipped'
    if report.passed:
        return 'passed'
    details = str(report.longrepr)
    if 'Executable doesn\'t exist' in details or 'playwright install' in details or 'Sync API inside the asyncio loop' in details:
        return 'blocked_browser_runtime'
    if 'ERR_BLOCKED_BY_ADMINISTRATOR' in details:
        return 'blocked_administrator'
    if any(s in details for s in ('ERR_NAME_NOT_RESOLVED','ERR_DNS_', 'getaddrinfo failed','Name or service not known')):
        return 'blocked_dns'
    if any(s in details for s in ('Page.goto:', 'net::ERR_', 'TimeoutError:')):
        return 'blocked_navigation'
    return 'failed'

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    item.config._medimind_reports.setdefault(item.nodeid, {})[report.when] = report
    if report.when == 'call' and report.failed and _classify(report) == 'failed':
        instance = getattr(item, 'instance', None)
        page = getattr(instance, 'page', None)
        if page is not None:
            try:
                page.screenshot(path=str(ARTIFACTS / (item.name+'.png')), full_page=True, timeout=5000)
            except Exception:
                pass

def pytest_sessionfinish(session, exitstatus):
    counts = {key: 0 for key in ('passed','failed','blocked_dns','blocked_administrator','blocked_navigation','blocked_browser_runtime','skipped')}
    for phases in session.config._medimind_reports.values():
        primary = next((phases[p] for p in ('setup','call') if p in phases and phases[p].failed), None)
        if primary is None:
            primary = next((phases[p] for p in ('teardown',) if p in phases and phases[p].failed), None)
        if primary is None:
            primary = next((phases[p] for p in ('setup','call') if p in phases and phases[p].skipped), None)
        if primary is None:
            primary = phases.get('call') or phases.get('setup')
        if primary is not None:
            counts[_classify(primary)] += 1
    (ARTIFACTS / 'classification.json').write_text(json.dumps(counts,indent=2))
    print('\nMediMind per-test QA classification:', counts)
