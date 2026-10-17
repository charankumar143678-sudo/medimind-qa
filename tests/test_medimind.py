"""Synthetic-only browser regression suite for MediMind Railway deployment.
Run: MEDIMIND_URL=https://medimind-web-production.up.railway.app python -m unittest discover -s tests -v
"""
import os, unittest, json
from playwright.sync_api import sync_playwright

URL = os.environ.get('MEDIMIND_URL','https://medimind-web-production.up.railway.app')
SECTIONS = ['home','consult','reports','body','nutrition','fitness','library','vitals','uae','medsafe','profile']

class MediMindBrowser(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = None
        cls.browser = None
        try:
            cls.pw = sync_playwright().start()
            cls.browser = cls.pw.chromium.launch(headless=True)
        except Exception:
            if cls.pw is not None: cls.pw.stop()
            raise
    @classmethod
    def tearDownClass(cls):
        if cls.browser is not None: cls.browser.close()
        if cls.pw is not None: cls.pw.stop()
    def setUp(self):
        self.context = None
        self._trace_active = False
        self.context = self.browser.new_context(viewport={'width':1280,'height':800})
        self.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        self._trace_active = True
        self.page = self.context.new_page()
        self.page.goto(URL, wait_until='domcontentloaded', timeout=20000)

    def tearDown(self):
        if self.context is None:
            return
        try:
            if self._trace_active:
                os.makedirs('artifacts', exist_ok=True)
                self.context.tracing.stop(path=os.path.join('artifacts', self._testMethodName+'.zip'))
                self._trace_active = False
        finally:
            self.context.close()

    def open_page(self,section):
        self.page.locator(f'[data-page="{section}"]').first.click()
        self.assertIn('active',self.page.locator(f'section#{section}').get_attribute('class'))
    def test_all_11_sections(self):
        for section in SECTIONS:
            with self.subTest(section=section):
                self.assertEqual(self.page.locator('section#'+section).count(),1)
                self.open_page(section)
    def test_mobile_navigation(self):
        self.page.set_viewport_size({'width':390,'height':844})
        for section in ['home','consult','reports','nutrition','fitness']:
            mobile_link = self.page.locator(f'.mobilebar button[onclick="go(\\'{section}\\')"]')
            self.assertTrue(mobile_link.is_visible(), f'Mobile navigation missing: {section}')
            mobile_link.click()
            self.assertIn('active', self.page.locator(f'section#{section}').get_attribute('class'))
    def test_empty_state_and_corrupt_storage(self):
        self.page.evaluate("localStorage.removeItem('medimind_vitals_local_v1')")
        self.page.reload()
        self.assertIn('No saved readings',self.page.locator('#real_chart').inner_text())
        self.page.evaluate("localStorage.setItem('medimind_vitals_local_v1','{corrupted')")
        self.page.reload()
        self.assertIn('No saved readings',self.page.locator('#real_chart').inner_text())
    def test_save_selector_refresh_delete(self):
        self.open_page('vitals')
        self.page.locator('#v_sys').fill('121');self.page.locator('#v_dia').fill('81')
        self.page.get_by_text('Save readings on this device',exact=True).click()
        records=self.page.evaluate("JSON.parse(localStorage.getItem('medimind_vitals_local_v1'))")
        self.assertEqual(records[-1]['values']['sys'],121)
        self.assertRegex(records[-1]['time'],r'^\d{4}-')
        self.page.reload()
        self.page.locator('#chart_metric').select_option('dia')
        self.assertIn('81',self.page.locator('#real_chart').inner_text())
        self.page.once('dialog',lambda d:d.accept())
        self.page.get_by_text('Delete saved measurements',exact=True).click()
        self.assertIn('No saved readings',self.page.locator('#real_chart').inner_text())
    def test_invalid_bounds(self):
        self.open_page('vitals');self.page.locator('#v_sys').fill('999');self.page.locator('#v_dia').fill('81')
        self.page.get_by_text('Save readings on this device',exact=True).click()
        self.assertIn('between',self.page.locator('#v_save_status').inner_text())
        self.assertIsNone(self.page.evaluate("localStorage.getItem('medimind_vitals_local_v1')"))
    def test_language_rtl_and_ltr_numbers(self):
        self.page.locator('#langtoggle').click()
        self.assertEqual(self.page.locator('html').get_attribute('dir'),'rtl')
        self.assertEqual(self.page.locator('html').get_attribute('lang'),'ar')
        self.assertEqual(self.page.locator('#v_sys').evaluate('(e)=>getComputedStyle(e).direction'),'ltr')
        self.page.locator('#langtoggle').click()
        self.assertEqual(self.page.locator('html').get_attribute('dir'),'ltr')
        self.assertEqual(self.page.locator('html').get_attribute('lang'),'en')
    def test_uae_emergency_and_lab_presence(self):
        self.open_page('uae')
        body=self.page.locator('#uae').inner_text()
        self.assertIn('998',body);self.assertIn('999',body)
        self.open_page('reports')
        self.assertTrue(self.page.locator('#reports input, #reports textarea, #reports select').count()>0)
    def test_keyboard_access(self):
        self.page.keyboard.press('Tab')
        self.assertNotEqual(self.page.evaluate('document.activeElement.tagName'),'BODY')
    def test_axe_core(self):
        axe=os.environ.get('AXE_CORE_JS')
        if not axe or not os.path.isfile(axe): self.skipTest('axe-core bundle not provisioned; accessibility audit not run')
        for section, arabic in [('home', False), ('vitals', False), ('reports', False), ('home', True), ('vitals', True)]:
            if arabic and self.page.locator('html').get_attribute('lang') != 'ar':
                self.page.locator('#langtoggle').click()
            self.open_page(section)
            self.page.add_script_tag(path=axe)
            result=self.page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
            violations=[{'id': x['id'], 'impact': x.get('impact'), 'count': len(x['nodes']), 'targets': [n.get('target') for n in x['nodes'][:5]]} for x in result['violations']]
            if violations:
                os.makedirs('artifacts', exist_ok=True)
                label = 'ar' if arabic else 'en'
                with open(f'artifacts/axe_core_{section}_{label}.json', 'w', encoding='utf8') as f:
                    json.dump(violations, f, indent=2)
            self.assertEqual([], violations, f'Accessibility violations in {section}, Arabic={arabic}: {violations}')

if __name__=='__main__':unittest.main()
