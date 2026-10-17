"""Phase 3 bilingual medical index tests with synthetic queries."""
from test_b1_bilingual_accessibility import browser_page

def test_condition_count_and_english_synonym(browser_page):
    p=browser_page
    p.locator("#condition-search").fill("anaemia")
    assert p.locator("#condition-results article").count()==1
    assert "Anemia" in p.locator("#condition-results").inner_text()

def test_arabic_and_specialty_filter(browser_page):
    p=browser_page
    p.locator("#langtoggle").click()
    p.locator("#condition-search").fill("الربو")
    assert p.locator("#condition-results article").count()==1
    assert "الربو" in p.locator("#condition-results").inner_text()
    p.locator("#condition-search").fill("")
    p.locator("#knowledge-specialty").select_option("Cardiology")
    assert p.locator("#condition-results article").count()==1

def test_condition_detail_source_and_safe_render(browser_page):
    p=browser_page
    p.locator("#condition-search").fill("asthma")
    p.locator("#condition-results button").first.click()
    assert p.locator("#condition-detail details").count()==7
    assert p.locator("#condition-detail a").get_attribute("href")=="https://medlineplus.gov/asthma.html"
    p.locator("#condition-search").fill("<img src=x onerror=alert(1)>")
    assert p.locator("#condition-results img").count()==0
    assert p.locator("#condition-results article").count()==0

def test_lab_test_type_filter(browser_page):
    p=browser_page
    p.locator("#knowledge-type").select_option("test")
    assert p.locator("#condition-results article").count()==3
    p.locator("#condition-search").fill("CBC")
    assert p.locator("#condition-results article").count()==1

def test_consultation_references_do_not_override_emergency(browser_page):
    p=browser_page
    p.evaluate("go('consult')")
    p.locator("#chatinput").fill("severe chest pain and headache")
    p.evaluate("sendChat()")
    assert "Emergency warning" in p.locator("#consult-progress").inner_text()
    assert p.locator("#consult-questions li").count()==0
    assert "998" in p.locator("#consult-questions").inner_text()
    assert p.locator("#consult-references a").count()>=1
