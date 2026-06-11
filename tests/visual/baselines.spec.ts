import { test, expect } from '@playwright/test';

test.describe('Rehab Store — visual baselines', () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });
  });

  test('home — AR dark @visual', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-ar-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('home — AR light @visual', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('theme-switcher').locator('[data-theme-value="light"]').click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('home-ar-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('home — EN dark @visual', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-en-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('home — EN light @visual', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('theme-switcher').locator('[data-theme-value="light"]').click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('home-en-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('product detail — EN dark @visual', async ({ page }) => {
    await page.goto('/en/product/soft-tailoring-dress');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('product-en-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
