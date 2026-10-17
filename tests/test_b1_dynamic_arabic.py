"""Phase B1 dynamic Arabic output regression tests; synthetic inputs only."""
import pytest
from test_b1_bilingual_accessibility import browser_page

@pytest.mark.parametrize("text,expected",[
    ("صداع","موضوع التقييم"),
    ("حمى","موضوع التقييم"),
    ("ألم الصدر","حالة طارئة"),
])
def test_arabic_symptom_responses(browser_page,text,expected):
    p=browser_page
    p.locator("#langtoggle").click()
    p.locator("#chatinput").fill(text)
    p.evaluate("sendChat()")
    response=p.locator("#chat .bubble").last.inner_text()
    assert expected in response
    assert "Assessment topic" not in response
    assert p.locator("#chat .bubble").last.get_attribute("dir")=="rtl"

def test_arabic_lab_result_and_warning(browser_page):
    p=browser_page
    p.locator("#langtoggle").click()
    p.locator("#labtext").fill("Hemoglobin: 11.2 g/dL (12-16)")
    p.evaluate("analyzeLabs()")
    p.wait_for_function("document.querySelector('#labresults').textContent.includes('القياسات المعروفة')")
    out=p.locator("#labresults").inner_text()
    assert "أقل من النطاق المدخل" in out
    assert "لا تشكل تشخيصاً" in out
    assert "Measurements recognized" not in out

def test_arabic_nutrition_generated_text(browser_page):
    p=browser_page
    p.locator("#langtoggle").click()
    p.evaluate("makeDiet()")
    p.wait_for_function("document.querySelector('#dietout').textContent.includes('الفطور')")
    text=p.locator("#dietout").inner_text()
    assert "ملاحظات مخصصة" in text
    assert "الحصص" in text
    assert "Personalization notes" not in text

def test_arabic_body_validation_and_language_toggle(browser_page):
    p=browser_page
    p.locator("#langtoggle").click()
    p.evaluate("calculateBody()")
    p.wait_for_function("document.querySelector('#bodyout').textContent.includes('أدخل قياسات صحيحة')")
    assert "أدخل قياسات صحيحة" in p.locator("#bodyout").inner_text()
    p.locator("#langtoggle").click()
    assert p.locator("html").get_attribute("dir")=="ltr"
    p.evaluate("calculateBody()")
    assert "Please enter valid age" in p.locator("#bodyout").inner_text()

def test_arabic_fitness_day_and_caution(browser_page):
    p=browser_page
    p.locator("#langtoggle").click()
    p.evaluate("makeFitness()")
    p.wait_for_function("document.querySelector('#fitout').textContent.includes('اليوم')")
    assert "كيّف الجهد" in p.locator("#fitout").inner_text()
