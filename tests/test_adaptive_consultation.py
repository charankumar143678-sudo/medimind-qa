"""Phase 4 zero-API-cost adaptive consultation tests; synthetic-only profiles."""
from test_b1_bilingual_accessibility import browser_page

def test_opt_in_profile_context_and_questions(browser_page):
    p=browser_page
    p.evaluate("""localStorage.setItem('medimind_profile_v1', JSON.stringify({age:'34',allergies:'pollen',conditions:'asthma',meds:'example medicine'}))""")
    p.evaluate("go('consult')")
    p.locator("#consult-use-profile").check()
    p.locator("#chatinput").fill("headache")
    p.evaluate("sendChat()")
    assert "Profile context enabled" in p.locator("#consult-context-status").inner_text()
    assert "current medicines" in p.locator("#chat").inner_text()
    assert p.evaluate("MediMindConsultation.getState().reported.length")==1

def test_profile_default_off_and_no_new_storage(browser_page):
    p=browser_page
    p.evaluate("go('consult')")
    assert not p.locator("#consult-use-profile").is_checked()
    before=p.evaluate("Object.keys(localStorage).sort()")
    p.locator("#chatinput").fill("headache")
    p.evaluate("sendChat()")
    assert "Profile not used" in p.locator("#consult-context-status").inner_text()
    assert p.evaluate("Object.keys(localStorage).sort()")==before

def test_emergency_overrides_personalized_followup(browser_page):
    p=browser_page
    p.evaluate("go('consult')")
    p.locator("#consult-severity").select_option("severe")
    p.locator("#chatinput").fill("severe chest pain")
    p.evaluate("sendChat()")
    assert "Emergency warning" in p.locator("#consult-progress").inner_text()
    assert p.locator("#consult-questions li").count()==0
    assert "998" in p.locator("#consult-questions").inner_text()

def test_arabic_adaptive_and_reset(browser_page):
    p=browser_page
    p.locator("#langtoggle").click()
    p.evaluate("go('consult')")
    p.locator("#chatinput").fill("صداع")
    p.evaluate("sendChat()")
    assert "المحرك المحلي" in p.locator("#consult-context-status").inner_text()
    p.evaluate("resetConsultation()")
    assert p.evaluate("MediMindConsultation.getState().reported.length")==0
