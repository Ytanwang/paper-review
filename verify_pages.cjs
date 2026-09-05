const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/wytfd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const root = __dirname;
  const out = path.join(root, 'qa_screenshots');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const targets = [
    ['home', path.join(root, 'index.html')],
    ['liao', path.join(root, 'papers', 'liao-2025-fslaser-impressionistic-ir', 'index.html')],
    ['liu', path.join(root, 'papers', 'liu-2025-fslaser-subadd-encryption', 'index.html')],
  ];
  const report = [];
  for (const [name, file] of targets) {
    const errors = [];
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.on('console', m => {
      if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
    });
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    const desktop = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector('h1')?.innerText,
      sections: [...document.querySelectorAll('section')].map(x => x.id),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      missingImages: [...document.images].filter(x => !x.complete || x.naturalWidth === 0).map(x => x.src),
    }));
    await page.screenshot({ path: path.join(out, `${name}-desktop.png`), fullPage: name === 'home' });
    report.push({ name, viewport: 'desktop', ...desktop, errors });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'load' });
    const mobile = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      tableCount: document.querySelectorAll('table').length,
      missingImages: [...document.images].filter(x => !x.complete || x.naturalWidth === 0).map(x => x.src),
    }));
    await page.screenshot({ path: path.join(out, `${name}-mobile.png`), fullPage: false });
    report.push({ name, viewport: 'mobile', ...mobile });
  }
  await browser.close();
  process.stdout.write(JSON.stringify(report, null, 2));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
