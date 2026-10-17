"""Synthetic patient consultations; no cloud data, no medical diagnosis."""
from test_b1_bilingual_accessibility import browser_page

def _send(page,message,lang=None):
    if lang=="ar":page.locator("#langtoggle").click()
    page.evaluate("go('consult')")
    page.locator("#chatinput").fill(message)
    page.evaluate("sendChat()")

def test_multiple_symptoms_and_summary(browser_page):
    p=browser_page
    _send(p,"Headache fever and body pain for 3 days")
    state=p.evaluate("MediMindConsultation.getState()")
    assert state["duration"]=="3 days"
    assert "headache" in state["topics"]
    assert "fever" in state["topics"]
    assert state["severity"] is None
    assert "More information needed" in p.locator("#consult-progress").inner_text()
    with p.expect_download() as event:
        p.evaluate("downloadConsultationSummary()")
    assert event.value.suggested_filename=="medimind-patient-consultation-summary.txt"

def test_emergency_overrides_questions(browser_page):
    p=browser_page
    _send(p,"severe chest pain")
    assert "Emergency warning" in p.locator("#consult-progress").inner_text()
    assert "998" in p.locator("#consult-questions").inner_text()
    assert p.locator("#consult-questions li").count()==0

def test_arabic_emergency_and_direction(browser_page):
    p=browser_page
    _send(p,"ألم الصدر",lang="ar")
    assert p.locator("html").get_attribute("dir")=="rtl"
    assert "حالة طارئة" in p.locator("#consult-progress").inner_text()
    assert "998" in p.locator("#consult-questions").inner_text()

def test_reset_and_no_local_storage(browser_page):
    p=browser_page
    before=p.evaluate("Object.keys(localStorage)")
    _send(p,"cough for 2 days")
    assert p.evaluate("MediMindConsultation.getState().reported.length")==1
    p.evaluate("resetConsultation()")
    assert p.evaluate("MediMindConsultation.getState().reported.length")==0
    assert p.evaluate("Object.keys(localStorage)")==before

def test_reference_links_are_sourced(browser_page):
    p=browser_page
    _send(p,"headache")
    link=p.locator("#consult-references a").first
    assert link.get_attribute("href")=="https://medlineplus.gov/headache.html"
    assert link.get_attribute("rel")=="noopener noreferrer"
