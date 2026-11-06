const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/wytfd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(path.join(__dirname, 'papers', 'pbl-smartphone-gait-npjdm-2026', 'index.html')).href, { waitUntil: 'load' });
  const c = await page.evaluate(() => ({
    hs: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    s8tables: document.querySelectorAll('#s8 .table-scroll table').length,
    qn: (document.getElementById('s8').textContent.match(/Q\d/g) || []).length,
    title: document.title.slice(0, 30) }));
  console.log(JSON.stringify({ errors, ...c }));
  await browser.close();
})();
