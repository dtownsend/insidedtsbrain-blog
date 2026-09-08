import { test, expect } from '@playwright/test';

// The resume's work/education entries come from Contentful. CI has no
// Contentful credentials, so those entries (and the blog posts the project
// cards link to) are absent there. The Projects section itself is hardcoded
// and renders everywhere.
async function hasResumeContent(page: import('@playwright/test').Page) {
  await page.goto('/resume');
  return !(await page.getByText('Resume content coming soon.').isVisible());
}

test('resume page shows a Projects section with both projects', async ({ page }) => {
  await page.goto('/resume');

  await expect(page.getByRole('heading', { name: 'Projects', level: 2 })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Playwright E2E Test Suite', level: 3 })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Personal Portfolio Site & Blog', level: 3 })
  ).toBeVisible();
});

test('Projects sits between Professional and Educational Experience', async ({ page }) => {
  test.skip(!(await hasResumeContent(page)), 'needs Contentful resume entries');

  // The sidebar's "Skills" h2 comes first in the DOM, so check relative order.
  const order = await page.getByRole('heading', { level: 2 }).allTextContents();
  const at = (title: string) => order.indexOf(title);
  expect(at('Projects')).toBeGreaterThan(at('Professional Experience'));
  expect(at('Projects')).toBeLessThan(at('Educational Experience'));
});

test('project cards link to the GitHub repo and both blog write-ups', async ({ page }) => {
  await page.goto('/resume');

  await expect(
    page.getByRole('link', { name: 'github.com/dtownsend/insidedtsbrain-blog' })
  ).toHaveAttribute('href', 'https://github.com/dtownsend/insidedtsbrain-blog');
  await expect(
    page.getByRole('link', { name: /A Green Checkmark Isn't Proof of Anything/ })
  ).toHaveAttribute('href', '/blog/a_green_checkmark_isnt_proof_of_anything');
  await expect(
    page.getByRole('link', { name: /I Built an AI-Powered To-Do Widget/ })
  ).toHaveAttribute('href', '/blog/builtaiapp');
});

test('both project blog links resolve to their posts', async ({ page }) => {
  test.skip(!(await hasResumeContent(page)), 'needs Contentful blog posts');

  await page.getByRole('link', { name: /A Green Checkmark Isn't Proof of Anything/ }).click();
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(
    /A Green Checkmark Isn't Proof of Anything/
  );

  await page.goto('/resume');
  await page.getByRole('link', { name: /I Built an AI-Powered To-Do Widget/ }).click();
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(
    /I Built an AI-Powered To-Do Widget/
  );
});

test('resume bullets do not expose a bullet glyph to assistive tech', async ({ page }) => {
  test.skip(!(await hasResumeContent(page)), 'needs Contentful resume entries');

  // Chrome puts CSS ::before text into the accessibility tree, so a
  // before:content-['•'] bullet gets announced on top of the native list
  // semantics. Playwright's aria snapshot reflects that generated content.
  // The sidebar now holds skill lists too, so take the first list under
  // the Professional Experience heading.
  const firstList = page
    .locator('section', { has: page.getByRole('heading', { name: 'Professional Experience' }) })
    .getByRole('list')
    .first();
  await expect(firstList).toBeVisible();
  const snapshot = await firstList.ariaSnapshot();
  expect(snapshot).not.toContain('•');
});

test('sidebar links to the GitHub repo', async ({ page }) => {
  await page.goto('/resume');

  // The project card also links to the repo, so scope to the sidebar and
  // match the icon link's aria-label exactly.
  const sidebar = page.getByRole('complementary');
  await expect(sidebar.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/dtownsend/insidedtsbrain-blog'
  );
});
