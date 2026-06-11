import { test, expect } from '@playwright/test';

test.describe('Rehab Store — smoke (EN)', () => {
  test('home page renders with brand and primary nav', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' });

    await expect(page.getByTestId('top-bar')).toBeVisible();
    await expect(page.getByRole('link', { name: /rehab store home/i })).toBeVisible();
    await expect(page.getByTestId('hero')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/fashion is the/i);
    await expect(page.getByRole('navigation', { name: /primary/i })).toBeVisible();
    await expect(page.getByTestId('theme-switcher')).toBeVisible();
    await expect(page.getByTestId('locale-switcher')).toBeVisible();
    await expect(page.getByTestId('currency-switcher')).toBeVisible();
  });

  test('theme switcher cycles dark → light → system', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' });
    const switcher = page.getByTestId('theme-switcher');
    await expect(switcher).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await switcher.locator('[data-theme-value="light"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await switcher.locator('[data-theme-value="system"]').click();
    const resolved = await page.locator('html').getAttribute('data-theme');
    expect(['light', 'dark']).toContain(resolved);
    await switcher.locator('[data-theme-value="dark"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('M3 color tokens are loaded on the page', async ({ page }) => {
    await page.goto('/en');
    // Wait for at least one stylesheet to finish loading
    await page.waitForFunction(
      () => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        return links.length > 0 && links.every((l) => (l as HTMLLinkElement).sheet !== null);
      },
      { timeout: 10_000 }
    );
    // Verify the M3 tokens stylesheet contains the primary token definition
    const hasToken = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      for (const link of links) {
        const sheet = (link as HTMLLinkElement).sheet;
        if (!sheet) continue;
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule.cssText.includes('--md-sys-color-primary')) return true;
        }
      }
      return false;
    });
    expect(hasToken, 'expected a CSS rule defining --md-sys-color-primary').toBe(true);
  });

  test('shop page shows products in a grid', async ({ page }) => {
    await page.goto('/en/shop', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('shop-page')).toBeVisible();
    await expect(page.getByTestId('product-grid')).toBeVisible();
    const cards = page.locator('[data-testid^="product-card-"]');
    await expect(cards).toHaveCount(8);
  });

  test('product detail page renders', async ({ page }) => {
    await page.goto('/en/product/soft-tailoring-dress', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /soft tailoring dress/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('cart, lookbook, about placeholders exist', async ({ page }) => {
    await page.goto('/en/cart', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('cart-page')).toBeVisible();
    await page.goto('/en/lookbook', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('lookbook-page')).toBeVisible();
    await page.goto('/en/about', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('about-page')).toBeVisible();
  });
});
