const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'C:/Users/kalde/Downloads/Rehab store/screenshot-spline.png', fullPage: false });
  const canvas = await page.$$('canvas');
  console.log('Canvas elements found: ' + canvas.length);
  const bg = await page.evaluate(() => {
    const body = document.body;
    return window.getComputedStyle(body).backgroundColor;
  });
  console.log('Body background: ' + bg);
  await browser.close();
})();
