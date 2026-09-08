import { test, expect, type Page } from '@playwright/test';

// Skills come from Contentful. CI has no credentials, so the sidebar is
// empty there and these tests skip with a reason.
async function gotoResumeWithSkills(page: Page) {
  await page.goto('/resume');
  const heading = page.getByRole('heading', { name: 'Skills', level: 2 });
  test.skip(!(await heading.isVisible()), 'needs Contentful skill entries');
}

const categories = (page: Page) =>
  page.getByRole('complementary').locator('[data-skills] details');

test.describe('skills sidebar on desktop', () => {
  test('opens the first two categories and collapses the rest', async ({ page }) => {
    await gotoResumeWithSkills(page);
    const all = categories(page);
    const count = await all.count();
    expect(count).toBeGreaterThan(2);
    for (let i = 0; i < count; i++) {
      if (i < 2) {
        await expect(all.nth(i)).toHaveAttribute('open');
      } else {
        await expect(all.nth(i)).not.toHaveAttribute('open');
      }
    }
  });

  test('each category header shows its chip count', async ({ page }) => {
    await gotoResumeWithSkills(page);
    const first = categories(page).first();
    const chips = await first.getByRole('listitem').count();
    expect(chips).toBeGreaterThan(0);
    await expect(first.locator('summary')).toContainText(`(${chips})`);
  });

  test('clicking a collapsed header opens it', async ({ page }) => {
    await gotoResumeWithSkills(page);
    const third = categories(page).nth(2);
    await expect(third).not.toHaveAttribute('open');
    await third.locator('summary').click();
    await expect(third).toHaveAttribute('open');
    await expect(third.getByRole('listitem').first()).toBeVisible();
  });
});

test.describe('skills sidebar on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('starts with every category collapsed', async ({ page }) => {
    await gotoResumeWithSkills(page);
    const all = categories(page);
    expect(await all.count()).toBeGreaterThan(0);
    for (const details of await all.all()) {
      await expect(details).not.toHaveAttribute('open');
    }
  });
});
