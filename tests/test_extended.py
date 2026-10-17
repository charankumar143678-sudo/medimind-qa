"""Independent synthetic-only regression checks. Never submit real patient data."""
import os,unittest,json
from playwright.sync_api import sync_playwright
URL=os.environ.get('MEDIMIND_URL','https://medimind-web-production.up.railway.app')
SECTIONS=['home','consult','reports','body','nutrition','fitness','library','vitals','uae','medsafe','profile']
class ExtendedQA(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=None;cls.browser=None
  try:
   cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
  except Exception:
   if cls.pw is not None:cls.pw.stop()
   raise
 @classmethod
 def tearDownClass(cls):
  if cls.browser is not None:cls.browser.close()
  if cls.pw is not None:cls.pw.stop()
 def setUp(self):
  self.ctx=None
  self._trace_active=False
  self.ctx=self.browser.new_context()
  self.ctx.tracing.start(screenshots=True,snapshots=True,sources=True)
  self._trace_active=True
  self.page=self.ctx.new_page()
  self.page.goto(URL,wait_until='domcontentloaded',timeout=20000)
 def tearDown(self):
  if self.ctx is None:return
  try:
   if self._trace_active:
    os.makedirs('artifacts',exist_ok=True)
    self.ctx.tracing.stop(path=os.path.join('artifacts',self._testMethodName+'.zip'))
    self._trace_active=False
  finally:self.ctx.close()
 def test_each_section_independently(self):
  for name in SECTIONS:
   with self.subTest(name=name):
    self.assertEqual(self.page.locator('section#'+name).count(),1)
 def test_mobile_overflow(self):
  self.page.set_viewport_size({'width':390,'height':844})
  self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),self.page.evaluate('window.innerWidth')+2)
 def test_corrupt_shape_history(self):
  self.page.evaluate("localStorage.setItem('medimind_vitals_local_v1',JSON.stringify([{time:'nonsense',values:{sys:999}},{time:'2026-01-01T00:00:00.000Z',values:{sys:'123'}}]))")
  self.page.reload();self.assertIn('No saved readings',self.page.locator('#real_chart').inner_text())
 def test_language_keeps_saved_data(self):
  self.page.evaluate("localStorage.setItem('medimind_vitals_local_v1',JSON.stringify([{time:'2026-01-01T00:00:00.000Z',values:{pulse:72}}]))")
  before=self.page.evaluate("localStorage.getItem('medimind_vitals_local_v1')")
  self.page.locator('#langtoggle').click()
  self.assertEqual(self.page.locator('html').get_attribute('dir'),'rtl')
  self.assertEqual(before,self.page.evaluate("localStorage.getItem('medimind_vitals_local_v1')"))
 def test_lab_synthetic_fixture(self):
  self.page.locator('[data-page="reports"]').first.click()
  self.page.locator('#labtext').fill('Hemoglobin: 11.2 g/dL (12-16)\nTSH: 3.2 mIU/L (0.4-4.0)')
  self.page.get_by_text('Analyze entered values',exact=False).first.click()
  self.assertIn('Hemoglobin',self.page.locator('#labresults').inner_text())
 def test_emergency_synthetic_guidance(self):
  self.page.locator('[data-page="uae"]').first.click()
  self.assertIn('998',self.page.locator('#uae').inner_text())
  self.assertIn('999',self.page.locator('#uae').inner_text())
 def test_keyboard_navigation(self):
  self.page.keyboard.press('Tab')
  self.assertNotEqual(self.page.evaluate('document.activeElement.tagName'),'BODY')
 def test_axe_wcag(self):
  path=os.getenv('AXE_CORE_JS')
  if not path or not os.path.isfile(path):self.skipTest('axe-core bundle unavailable')
  for section in ['home','consult','reports','vitals']:
   self.page.locator(f'[data-page="{section}"]').first.click()
   self.page.add_script_tag(path=path)
   result=self.page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
   violations=[{'id':v['id'],'impact':v.get('impact'),'count':len(v['nodes']),'targets':[n.get('target') for n in v['nodes'][:5]]} for v in result['violations']]
   if violations:
    os.makedirs('artifacts',exist_ok=True)
    with open(f'artifacts/axe_wcag_{section}_en.json','w') as f:json.dump(violations,f,indent=2)
   self.assertFalse(violations,f'{section}: {violations}')
  self.page.locator('#langtoggle').click()
  self.page.add_script_tag(path=path)
  result=self.page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
  violations=[{'id':v['id'],'impact':v.get('impact'),'count':len(v['nodes']),'targets':[n.get('target') for n in v['nodes'][:5]]} for v in result['violations']]
  if violations:
   os.makedirs('artifacts',exist_ok=True)
   with open('artifacts/axe_wcag_ar.json','w') as f:json.dump(violations,f,indent=2)
  self.assertFalse(violations,f'Arabic: {violations}')
if __name__=='__main__':unittest.main()
