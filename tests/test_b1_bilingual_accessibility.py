"""Synthetic-only Phase B1 bilingual, accessibility and local-data tests."""
import os
from pathlib import Path
import pytest
from playwright.sync_api import sync_playwright

URL=os.environ.get("MEDIMIND_URL","http://127.0.0.1:3000")
STORAGE="medimind_vitals_local_v1"
ARTIFACTS=Path("artifacts")

@pytest.fixture()
def browser_page():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={"width":1280,"height":850})
        page=context.new_page()
        page.goto(URL,wait_until="domcontentloaded",timeout=20000)
        yield page
        context.close()
        browser.close()

@pytest.mark.parametrize("viewport",[(1280,850),(390,844)])
def test_all_sections_have_rtl_and_accessible_direction(browser_page,viewport):
    p=browser_page
    p.set_viewport_size({"width":viewport[0],"height":viewport[1]})
    assert p.locator("section.page").count()==11
    p.locator("#langtoggle").click()
    assert p.locator("html").get_attribute("lang")=="ar"
    assert p.locator("html").get_attribute("dir")=="rtl"
    assert p.locator("#trend_window option").nth(0).inner_text()=="آخر ٢٤ ساعة"
    for sect in ["home","consult","reports","body","nutrition","fitness","library","vitals","uae","medsafe","profile"]:
        assert p.locator("#"+sect).count()==1
    assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+2")
    p.locator("#langtoggle").click()
    assert p.locator("html").get_attribute("dir")=="ltr"
    assert p.locator("#trend_window option").nth(0).inner_text()=="Last 24 hours"

@pytest.mark.parametrize("width,height",[(1280,850),(390,844)])
def test_bilingual_axe_and_dashboard_semantics(browser_page,width,height):
    p=browser_page
    p.set_viewport_size({"width":width,"height":height})
    bundle=os.environ.get("AXE_CORE_JS")
    assert bundle and Path(bundle).is_file(),"axe-core must be provisioned, never skipped"
    p.add_script_tag(path=bundle)
    for lang in ["en","ar"]:
        if lang=="ar":p.locator("#langtoggle").click()
        p.evaluate("renderVitalsChart()")
        result=p.evaluate("""async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})""")
        ids=[x["id"] for x in result["violations"]]
        assert not ids,f"{width}x{height} {lang}: {ids}"
        assert p.locator("#real_chart").get_attribute("role")=="status"

def test_language_preserves_legacy_readings_and_input_fields(browser_page):
    p=browser_page
    p.evaluate("""key => localStorage.setItem(key,JSON.stringify([{time:new Date().toISOString(),values:{pulse:72,sys:120,dia:80}}]))""",STORAGE)
    p.locator("#chart_metric").select_option("pulse")
    p.locator("#trend_window").select_option("day")
    p.locator("#v_pulse").fill("74")
    original=p.evaluate("localStorage.getItem('"+STORAGE+"')")
    p.locator("#langtoggle").click()
    assert "المتوسط" in p.locator("#trend_summary").inner_text()
    assert p.locator("#v_pulse").input_value()=="74"
    assert p.evaluate("localStorage.getItem('"+STORAGE+"')")==original
    p.locator("#langtoggle").click()
    assert "Average" in p.locator("#trend_summary").inner_text()

def test_multiple_malformed_storage_ignored_without_deletion(browser_page):
    p=browser_page
    for raw in ("not-json", "x"*300001, '{"not":"an array"}'):
        p.evaluate("([key,value])=>localStorage.setItem(key,value)",[STORAGE,raw])
        p.evaluate("renderVitalsChart()")
        assert "No saved readings" in p.locator("#real_chart").inner_text()
        assert p.evaluate("localStorage.getItem('"+STORAGE+"')")==raw

def test_refresh_and_zero_record_deletion(browser_page):
    p=browser_page
    p.evaluate("""key=>localStorage.setItem(key,JSON.stringify([{time:new Date().toISOString(),values:{pulse:72}}]))""",STORAGE)
    p.reload(wait_until="domcontentloaded")
    p.locator("#chart_metric").select_option("pulse")
    p.locator("#trend_window").select_option("day")
    assert "72" in p.locator("#trend_summary").inner_text()
    p.once("dialog",lambda d:d.accept())
    p.get_by_text("Delete saved measurements",exact=True).click()
    assert p.evaluate("localStorage.getItem('"+STORAGE+"')") is None
    assert "No saved readings" in p.locator("#real_chart").inner_text()

def test_keyboard_focus_visible_and_reduced_motion(browser_page):
    p=browser_page
    p.keyboard.press("Tab")
    assert p.evaluate("document.activeElement.tagName")!="BODY"
    outline=p.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    assert outline!="none"
    p.emulate_media(reduced_motion="reduce")
    assert p.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
