"""Phase B1 dashboard regression with synthetic measurements only."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.getenv("MEDIMIND_URL","http://127.0.0.1:3000")
ARTIFACTS=Path("artifacts")
STORAGE="medimind_vitals_local_v1"
def setup_page():
    pw=sync_playwright().start()
    browser=pw.chromium.launch(headless=True)
    context=browser.new_context(viewport={"width":1440,"height":900})
    page=context.new_page()
    page.set_default_timeout(7000)
    page.goto(URL,wait_until="domcontentloaded",timeout=15000)
    return pw,browser,context,page

def close(pw,browser,context):
    try:context.close()
    finally:
        try:browser.close()
        finally:pw.stop()

def test_b1_preserves_all_sections_and_empty_state():
    pw,browser,context,page=setup_page()
    try:
        assert page.locator("section.page").count()==11
        assert page.locator("#trend_window option").count()==4
        assert "No saved readings" in page.locator("#real_chart").inner_text()
        assert page.locator("#trend_summary .metric-tile").count()==0
    finally:close(pw,browser,context)

def test_b1_legacy_storage_trend_filters_and_summaries():
    pw,browser,context,page=setup_page()
    try:
        page.evaluate("""({key}) => {
          const now=Date.now();
          localStorage.setItem(key,JSON.stringify([
            {time:new Date(now-4*86400000).toISOString(),values:{pulse:80,sys:120,dia:80}},
            {time:new Date(now-60000).toISOString(),values:{pulse:70}},
            {time:new Date(now-370*86400000).toISOString(),values:{pulse:65}}
          ]));
        }""",{"key":STORAGE})
        page.reload()
        page.locator("#chart_metric").select_option("pulse")
        page.locator("#trend_window").select_option("day")
        assert "1 of 1 recorded readings" in page.locator("#real_chart").inner_text()
        assert "70" in page.locator("#trend_summary").inner_text()
        page.locator("#trend_window").select_option("week")
        assert "2 of 2 recorded readings" in page.locator("#real_chart").inner_text()
        assert "75" in page.locator("#trend_summary").inner_text()
        page.locator("#chart_metric").select_option("sys")
        assert "120" in page.locator("#trend_summary").inner_text()
        assert len(page.evaluate("JSON.parse(localStorage.getItem('"+STORAGE+"'))"))==3
        ARTIFACTS.mkdir(exist_ok=True)
        page.screenshot(path=str(ARTIFACTS/"dashboard-b1-desktop.png"),full_page=True)
    finally:close(pw,browser,context)

def test_b1_rejects_malformed_oversize_future_or_out_of_range():
    pw,browser,context,page=setup_page()
    try:
        for raw in ("{invalid","x"*300001, '[{"time":"2999-01-01T00:00:00.000Z","values":{"pulse":72}}]', '[{"time":"2026-01-01T00:00:00.000Z","values":{"pulse":999}}]'):
            page.evaluate("([key,val])=>localStorage.setItem(key,val)",[STORAGE,raw])
            page.locator("#chart_metric").select_option("pulse")
            page.locator("#trend_window").select_option("year")
            page.evaluate("renderVitalsChart()")
            assert "No saved readings" in page.locator("#real_chart").inner_text()
    finally:close(pw,browser,context)

def test_b1_mobile_layout_and_rtl_preserve_synthetic_data():
    pw,browser,context,page=setup_page()
    try:
        page.set_viewport_size({"width":390,"height":844})
        page.evaluate("key => localStorage.setItem(key,JSON.stringify([{time:new Date().toISOString(),values:{pulse:72}}]))",STORAGE)
        page.locator("#chart_metric").select_option("pulse")
        page.locator("#trend_window").select_option("day")
        page.evaluate("renderVitalsChart()")
        assert page.locator("#trend_summary .metric-tile").count()==5
        page.locator("#langtoggle").click()
        assert page.locator("html").get_attribute("dir")=="rtl"
        assert "72" in page.locator("#trend_summary").inner_text()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2")
        ARTIFACTS.mkdir(exist_ok=True)
        page.screenshot(path=str(ARTIFACTS/"dashboard-b1-mobile-ar.png"),full_page=True)
    finally:close(pw,browser,context)
