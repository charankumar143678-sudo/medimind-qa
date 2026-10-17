"""Automated assistive-technology proxies; not a substitute for manual AT testing."""
import pytest
from test_b1_bilingual_accessibility import browser_page

@pytest.mark.parametrize("locale",["en","ar"])
def test_keyboard_reflow_and_language_metadata(browser_page,locale):
    p=browser_page
    if locale=="ar":p.locator("#langtoggle").click()
    assert p.locator("html").get_attribute("lang")==locale
    assert p.locator("html").get_attribute("dir")==("rtl" if locale=="ar" else "ltr")
    p.set_viewport_size({"width":320,"height":800})
    assert p.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 4")
    p.keyboard.press("Tab")
    assert p.evaluate("document.activeElement !== document.body")
    assert p.evaluate("getComputedStyle(document.activeElement).outlineStyle !== 'none'")

def test_chart_has_textual_summary(browser_page):
    p=browser_page
    p.evaluate("renderVitalsChart()")
    assert p.locator("#real_chart").get_attribute("role")=="status"
    assert p.locator("#real_chart").inner_text().strip()
