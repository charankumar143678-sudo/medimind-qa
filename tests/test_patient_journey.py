"""Patient journey functionality: synthetic data only, no server records."""
from test_b1_bilingual_accessibility import browser_page

def test_guest_journey_and_existing_sections(browser_page):
    p=browser_page
    assert p.locator("section.page").count()==11
    assert p.locator("#patient-journey").is_visible()
    assert p.locator("#condition-directory").is_visible()
    assert p.locator("#appointment-prep").is_visible()
    assert p.locator("a[href='tel:998']").count()>=1

def test_topic_search_and_source_links(browser_page):
    p=browser_page
    p.locator("#condition-search").fill("asthma")
    assert p.locator("#condition-results article").count()==1
    link=p.locator("#condition-results a")
    assert link.get_attribute("href")=="https://medlineplus.gov/asthma.html"
    assert link.get_attribute("rel")=="noopener noreferrer"
    p.locator("#condition-search").fill("made up condition")
    assert "No match" in p.locator("#condition-results").inner_text()

def test_arabic_topic_search_and_direction(browser_page):
    p=browser_page
    p.locator("#langtoggle").click()
    assert p.locator("html").get_attribute("dir")=="rtl"
    p.locator("#condition-search").fill("الربو")
    assert p.locator("#condition-results article").count()==1
    assert "الربو" in p.locator("#condition-results").inner_text()

def test_appointment_notes_download_clear_and_no_storage(browser_page):
    p=browser_page
    p.locator("#prep-concern").fill("Synthetic headache")
    p.locator("#prep-duration").fill("Two days")
    p.locator("#prep-questions").fill("What should I ask?")
    before=p.evaluate("Object.keys(localStorage)")
    with p.expect_download() as event:
        p.get_by_text("Download my appointment notes",exact=False).first.click()
    assert event.value.suggested_filename=="medimind-appointment-notes.txt"
    assert p.evaluate("Object.keys(localStorage)")==before
    p.get_by_text("Clear these fields",exact=False).first.click()
    assert p.locator("#prep-concern").input_value()==""
    assert p.locator("#prep-duration").input_value()==""
    assert p.locator("#prep-questions").input_value()==""
