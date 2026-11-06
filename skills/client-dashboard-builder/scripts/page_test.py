"""Smoke-test a dashboard Index.html with a fake Apps Script server, and save screenshots.

The page's google.script.run calls are answered from a saved payload (the JSON the server function returns,
for example dumped with apps_script_harness.js). login('good') succeeds, anything else gets "Wrong password".

Usage:
  python page_test.py Index.html payload.json out_dir [--fn getEmailDashboard] [--sizes 1440x900,390x844]

Prints, per screen size: wrong-password message, whether the dashboard showed after login, page errors and
whether the page scrolls sideways (it should not). Screenshots: login, each tab, after log out.
Needs: pip install playwright && python -m playwright install chromium
"""
import argparse, json, pathlib
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('html'); ap.add_argument('payload'); ap.add_argument('out')
ap.add_argument('--fn', default='getEmailDashboard'); ap.add_argument('--sizes', default='1440x900,390x844')
a = ap.parse_args()
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
html = pathlib.Path(a.html).read_text(encoding='utf-8')
payload = pathlib.Path(a.payload).read_text(encoding='utf-8')
stub = '''<script>
const PAYLOAD=%s;
window.google={script:{run:(function mk(ok,fail){return new Proxy({},{get(_,k){
  if(k==='withSuccessHandler')return f=>mk(f,fail); if(k==='withFailureHandler')return f=>mk(ok,f);
  return (...x)=>setTimeout(()=>{ if(k==='login'){x[0]==='good'?ok('tok'):fail(new Error('Wrong password'));return}
    if(k==='%s'){ if(x[x.length-1]!=='tok'){fail(new Error('LOGIN_REQUIRED'));return} ok(PAYLOAD);return }
    ok(null) },300)}})})()}};
</script>''' % (payload, a.fn)
page_file = out / '_stub.html'
page_file.write_text(html.replace('<script>', stub + '<script>', 1), encoding='utf-8')

def fill_password(pg, value):
    # works with any of the logins: wait until a password box is visible (the tunnel shows it after ~3 s)
    box = pg.locator('input[type=password]:visible').first
    box.wait_for(timeout=8000); box.fill(value); box.press('Enter')

with sync_playwright() as s:
    b = s.chromium.launch()
    for size in a.sizes.split(','):
        w, h = map(int, size.split('x'))
        pg = b.new_page(viewport={'width': w, 'height': h}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(page_file.as_uri())
        envelope = pg.locator('#envl')
        if envelope.count(): envelope.click(force=True); pg.wait_for_timeout(2300)   # envelope login opens on tap
        pg.wait_for_timeout(600); pg.screenshot(path=str(out / f'login_{w}.png'))
        fill_password(pg, 'wrong'); pg.wait_for_timeout(900)
        wrong = pg.evaluate("[...document.querySelectorAll('[role=alert],.err,.login-error')].map(e=>e.textContent.trim()).filter(Boolean).join(' | ')")
        pg.locator('input[type=password]:visible').first.fill('good'); pg.keyboard.press('Enter'); pg.wait_for_timeout(4500)
        shown = pg.evaluate("(()=>{const l=document.getElementById('login');return !l||l.classList.contains('hide')})()")
        tabs = pg.evaluate("[...new Set([...document.querySelectorAll('[data-tab]')].map(b=>b.dataset.tab))]")
        for t in tabs:
            pg.locator(f'[data-tab="{t}"]:visible').first.click(); pg.wait_for_timeout(1500)
            pg.screenshot(path=str(out / f'tab_{t}_{w}.png'), full_page=True)
        if pg.locator('#logout:visible').count():
            pg.click('#logout'); pg.wait_for_timeout(3800); pg.screenshot(path=str(out / f'after_logout_{w}.png'))
        print(f'{w}px | wrong password says: {wrong or "(nothing)"} | dashboard shown after login: {shown} | tabs: {tabs} '
              f'| sideways scroll: {pg.evaluate("document.documentElement.scrollWidth")>w} | page errors: {errs or "none"}')
    b.close()
print('screenshots in', out)
