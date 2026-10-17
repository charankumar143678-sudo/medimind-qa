"""Phase 4 multi-step dialogue: synthetic information only."""
from test_b1_bilingual_accessibility import browser_page

def test_followup_cards_and_quick_answer(browser_page):
    p=browser_page
    p.evaluate("go('consult')")
    p.locator("#chatinput").fill("headache")
    p.evaluate("sendChat()")
    assert 1 <= p.locator("#consult-answer-controls .field").count() <= 2
    p.locator("#consult-answer-controls input").first.fill("yesterday")
    p.locator("#consult-answer-controls button").first.click()
    assert "Answers recorded" in p.locator("#consult-progress").inner_text()
    assert p.locator("#consult-correct-field option").count() >= 1

def test_answer_correction_and_summary_state(browser_page):
    p=browser_page
    p.evaluate("go('consult')")
    p.locator("#chatinput").fill("headache")
    p.evaluate("sendChat()")
    p.evaluate("MediMindDialogue.answer('severity','6')")
    p.evaluate("MediMindDialogue.correct('severity','4')")
    assert p.evaluate("MediMindDialogue.getState().answers.severity") == "4"

def test_emergency_interrupts_question_cards(browser_page):
    p=browser_page
    p.evaluate("go('consult')")
    p.locator("#chatinput").fill("severe chest pain")
    p.evaluate("sendChat()")
    assert p.locator("#consult-answer-controls button").count() == 0
    assert "998" in p.locator("#consult-questions").inner_text()
