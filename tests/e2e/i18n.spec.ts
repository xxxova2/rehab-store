import { test, expect } from '@playwright/test';

test.describe('Rehab Store — i18n & locale switching', () => {
  test('root redirects to a locale-prefixed path', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(page.url()).toMatch(/\/(ar|en)\/?$/);
    const lang = await page.locator('html').getAttribute('lang');
    expect(['ar', 'en']).toContain(lang);
  });

  test('locale switcher flips ar ↔ en and updates html dir', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/ar', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId('locale-switcher').locator('[data-locale="en"]').click();
    await page.waitForURL(/\/en/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await page.getByTestId('locale-switcher').locator('[data-locale="ar"]').click();
    await page.waitForURL(/\/ar/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('currency switcher flips the active state to SAR', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/en', { waitUntil: 'networkidle' });
    const switcher = page.getByTestId('currency-switcher');
    await expect(switcher).toBeVisible();
    await switcher.locator('[data-currency="SAR"]').click();
    await expect(switcher.locator('[data-active="true"]')).toHaveText('SAR', { timeout: 10_000 });
  });

  test('prices reflect the REHAB_CURRENCY cookie (AED → SAR)', async ({ page, context }) => {
    await context.clearCookies();
    await context.addCookies([
      { name: 'REHAB_CURRENCY', value: 'AED', url: 'http://localhost:3000' },
    ]);
    await page.goto('/en/product/soft-tailoring-dress', { waitUntil: 'networkidle' });
    const priceLocator = page.locator('[class*="product_price"]').first();
    await expect(priceLocator).toBeVisible();
    await expect(priceLocator).toContainText('AED');
    // Now change the cookie to SAR and reload
    await context.clearCookies();
    await context.addCookies([
      { name: 'REHAB_CURRENCY', value: 'SAR', url: 'http://localhost:3000' },
    ]);
    await page.goto('/en/product/soft-tailoring-dress', { waitUntil: 'networkidle' });
    await expect(page.locator('[class*="product_price"]').first()).toContainText('SAR');
  });

  test('shop page renders all 8 product slugs (DOM count)', async ({ page }) => {
    await page.goto('/en/shop', { waitUntil: 'networkidle' });
    const slugs = [
      'soft-tailoring-dress',
      'rehab-crew-sweater',
      'bone-wide-leg-trouser',
      'rose-silk-blouse',
      'atelier-linen-shirt',
      'lookbook-bone-coat',
      'editorial-slip-dress',
      'foundation-tee-off-white',
    ];
    for (const slug of slugs) {
      const count = await page.getByTestId(`product-card-${slug}`).count();
      expect(count, `expected product-card-${slug} to be in DOM`).toBeGreaterThan(0);
    }
    // The total of unique product cards
    const total = await page.locator('[data-testid^="product-card-"]').count();
    expect(total, 'expected 8+ product cards').toBeGreaterThanOrEqual(8);
  });
});



