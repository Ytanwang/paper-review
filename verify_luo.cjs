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
  const report = [];
  const targets = [
    ['luo-desktop', path.join(root, 'papers', 'mycn-ythdf1-rb-scls-2023', 'index.html'), 1440],
    ['luo-narrow', path.join(root, 'papers', 'mycn-ythdf1-rb-scls-2023', 'index.html'), 390],
    ['home-desktop', path.join(root, 'index.html'), 1440],
  ];
  for (const [name, file, w] of targets) {
    const errors = [];
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width: w, height: 1000 });
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    // 检查: 溢出/锚点跳转/卡片链接
    const checks = await page.evaluate(() => {
      const hasHScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
      const sN = ['s0','s1','s2','s3','s4','s5','s6','s7'].filter(id => document.getElementById(id));
      const tables = document.querySelectorAll('.table-scroll table').length;
      return { hasHScroll, sections: sN.length, tables, title: document.title.slice(0, 40) };
    });
    await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
    report.push({ name, errors, ...checks });
  }
  // 主页卡片链接可达性
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  const cardOk = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a.paper-card')].find(x => x.getAttribute('href').includes('mycn-rb-review'));
    if (!a) return 'CARD-NOT-FOUND';
    const r = a.getBoundingClientRect();
    return r.width > 200 && r.height > 60 ? 'CARD-OK' : 'CARD-LAYOUT-SUSPECT';
  });
  await browser.close();
  for (const r of report) console.log(JSON.stringify(r));
  console.log('home-card:', cardOk);
})();
