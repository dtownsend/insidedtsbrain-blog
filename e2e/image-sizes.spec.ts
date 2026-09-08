import { test, expect, type Page } from '@playwright/test';

// next/image warns in dev when a `fill` image has no `sizes`, which makes the
// browser download a viewport-sized file for a 64px logo. The Playwright
// server runs `next dev`, so the warning shows up in the page console.
async function imageSizingWarnings(page: Page, path: string) {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning' && msg.text().includes('missing "sizes"')) warnings.push(msg.text());
  });
  await page.goto(path, { waitUntil: 'networkidle' });
  return warnings;
}

for (const path of ['/resume', '/about']) {
  test(`${path} logs no image sizing warnings`, async ({ page }) => {
    expect(await imageSizingWarnings(page, path)).toEqual([]);
  });
}
