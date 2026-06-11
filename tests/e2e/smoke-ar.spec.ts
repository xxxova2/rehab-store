import { test, expect } from '@playwright/test';

test.describe('Rehab Store — smoke (AR)', () => {
  test('home page renders in Arabic with RTL direction', async ({ page }) => {
    await page.goto('/ar', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('top-bar')).toBeVisible();
    await expect(page.getByTestId('hero')).toBeVisible();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ar');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/الموضة/i);
  });

  test('shop page renders 8 products in Arabic', async ({ page }) => {
    await page.goto('/ar/shop', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('shop-page')).toBeVisible();
    const cards = page.locator('[data-testid^="product-card-"]');
    await expect(cards).toHaveCount(8);
  });

  test('product detail page in Arabic', async ({ page }) => {
    await page.goto('/ar/product/soft-tailoring-dress', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('product-page')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/فستان|التفصيل/i);
    const addBtn = page.getByRole('button').filter({ hasText: /السلة|سلة/ });
    await expect(addBtn).toBeVisible();
  });
});
