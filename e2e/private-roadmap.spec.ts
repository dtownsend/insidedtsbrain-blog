import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTE = '/p/ajvt6e5hnk';

test('private roadmap page returns 200', async ({ page }) => {
  const response = await page.goto(ROUTE);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('private roadmap page is noindex', async ({ page }) => {
  await page.goto(ROUTE);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  );
});

test('private roadmap page has no accessibility violations', async ({ page }) => {
  await page.goto(ROUTE);
  const results = await new AxeBuilder({ page }).analyze();

  const readable = results.violations
    .map((v) => `- ${v.id} (${v.impact}): ${v.help}`)
    .join('\n');

  // The 2nd arg to expect() is a message shown ON FAILURE.
  expect(results.violations, `Accessibility violations:\n${readable}`).toEqual([]);
});
