# Collapsible Skills Sidebar (Track C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-categorize the resume's Skills sidebar into the seven Track C categories, rendered as collapsible groups that start with the first two open on desktop and all collapsed on phones.

**Architecture:** `SkillsSection` stays a server component. Each category is a native `<details>`/`<summary>` (no client JS for toggling); the desktop default (`open` on the first two) is server-rendered, and a one-line inline script that runs while the HTML parses removes `open` on viewports under Tailwind's `md` breakpoint, so phones never flash the expanded lists. Categories present in Contentful but missing from the ordered list are appended after it, so a retag typo shows up unstyled instead of vanishing.

**Tech Stack:** Next.js 14 App Router (server components), Tailwind 3.4 (`group-open/<name>` variant), lucide-react `ChevronDown`, Playwright + axe for verification.

**Spec:** Design canvas https://claude.ai/code/artifact/fe391575-5467-4bc3-a158-4650d530ec18 (page "Chosen" + its build notes) and `docs/resume-update-2026-09-02.md` Track C for the category names and chip lists.

## Global Constraints

- Category names and order, verbatim: `Sensor & AR/VR Validation`, `Lab Environments`, `Automation & CI`, `QA Methodology`, `Creative Tools`, `Platforms & Code`, `Tools`.
- Desktop (`min-width: 768px`, Tailwind `md`): first **two** rendered categories open by default. Phones: **all** collapsed by default. Any header toggles.
- Do not add SQL. Do not touch education entries, dates, or any other resume content (see the DO NOT list in the resume-update doc).
- Chip styling stays exactly `px-2.5 py-1 text-xs font-medium rounded-full` + a per-category `bg-*-100 text-*-800` pair; unknown categories fall back to `bg-gray-100 text-gray-800`.
- Code deploys **before** the Contentful retag. Until the retag, the four legacy categories still render (appended, gray) so the sidebar never goes blank in production.
- Verification for every task: `npx tsc --noEmit`, `npm run lint`, and the Playwright specs named in the task. The existing axe scan of `/resume` in `e2e/accessibility.spec.ts` must stay green.
- Contentful-dependent tests skip (with a reason) when the Skills heading is absent, because CI has no Contentful credentials.

---

## File Structure

- Modify `tailwind.config.ts` — add `./src/lib/**` to `content` so classes named in `SKILL_COLORS` are generated (today's four pairs only work because the same class names appear in other scanned files; the three new hues would be dropped).
- Modify `src/lib/constants.ts:29-34` — `SKILL_COLORS` gets the seven category keys.
- Modify `src/lib/contentful.ts:98-104` — `SkillEntry.fields.category` union becomes the seven names.
- Modify `src/components/resume/SkillsSection.tsx` — ordered categories with unknown-append, `<details>` per category, chip count in the header, chevron, inline collapse-on-mobile script, chips as a `<ul>`.
- Modify `e2e/resume.spec.ts:62-72` — scope the bullet-glyph test to the Professional Experience section, since the sidebar now contains lists that would otherwise be `getByRole('list').first()`.
- Create `e2e/skills.spec.ts` — desktop defaults, header counts, toggling, phone defaults.

---

### Task 1: Failing tests for the collapsible sidebar

**Files:**
- Create: `e2e/skills.spec.ts`
- Modify: `e2e/resume.spec.ts:62-72`

**Interfaces:**
- Consumes: the resume page at `/resume`; the sidebar landmark (`<aside>`, role `complementary`).
- Produces: the DOM contract Task 2 must satisfy — a container `[data-skills]` holding one `<details>` per category, each with a `<summary>` whose text ends in `(<count>)`, and chips as `listitem`s inside the details.

- [ ] **Step 1: Write the failing spec**

```ts
// e2e/skills.spec.ts
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
```

- [ ] **Step 2: Scope the existing bullet-glyph test**

In `e2e/resume.spec.ts`, replace

```ts
  const firstList = page.getByRole('list').first();
```

with

```ts
  // The sidebar now holds skill lists too, so take the first list under
  // the Professional Experience heading.
  const firstList = page
    .locator('section', { has: page.getByRole('heading', { name: 'Professional Experience' }) })
    .getByRole('list')
    .first();
```

- [ ] **Step 3: Run the new spec and watch it fail**

Run: `npx playwright test e2e/skills.spec.ts --project=chromium --reporter=line`
Expected: all 4 tests FAIL. The desktop and phone tests fail on `count` (no `[data-skills] details` exists yet), not on the skip check.

Run: `npx playwright test e2e/resume.spec.ts --project=chromium --reporter=line`
Expected: 6 passed (the rescoped glyph test still passes against the current markup).

---

### Task 2: Make the tests pass

**Files:**
- Modify: `tailwind.config.ts:4-8`
- Modify: `src/lib/constants.ts:29-34`
- Modify: `src/lib/contentful.ts:98-104`
- Modify: `src/components/resume/SkillsSection.tsx` (whole file)

**Interfaces:**
- Consumes: `SkillEntry[]` from `getSkills()` (unchanged), `SKILL_COLORS: Record<string, string>`.
- Produces: the `[data-skills] details > summary` / `listitem` DOM contract from Task 1.

- [ ] **Step 1: Let Tailwind see `src/lib`**

In `tailwind.config.ts`, add one glob to `content`:

```ts
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
```

- [ ] **Step 2: Seven color pairs**

Replace `SKILL_COLORS` in `src/lib/constants.ts`:

```ts
export const SKILL_COLORS: Record<string, string> = {
  'Sensor & AR/VR Validation': 'bg-indigo-100 text-indigo-800',
  'Lab Environments': 'bg-teal-100 text-teal-800',
  'Automation & CI': 'bg-green-100 text-green-800',
  'QA Methodology': 'bg-blue-100 text-blue-800',
  'Creative Tools': 'bg-rose-100 text-rose-800',
  'Platforms & Code': 'bg-orange-100 text-orange-800',
  Tools: 'bg-purple-100 text-purple-800',
};
```

- [ ] **Step 3: Category type**

In `src/lib/contentful.ts`, replace the `SkillEntry.fields.category` union:

```ts
export interface SkillEntry {
  sys: { id: string };
  fields: {
    name: string;
    category:
      | 'Sensor & AR/VR Validation'
      | 'Lab Environments'
      | 'Automation & CI'
      | 'QA Methodology'
      | 'Creative Tools'
      | 'Platforms & Code'
      | 'Tools';
  };
}
```

- [ ] **Step 4: Rewrite `SkillsSection.tsx`**

```tsx
import { ChevronDown } from 'lucide-react';
import { SkillEntry } from '@/lib/contentful';
import { SKILL_COLORS } from '@/lib/constants';

interface SkillsSectionProps {
  skills: SkillEntry[];
}

// Render order. Categories that exist in Contentful but aren't listed here
// are appended after these, unstyled, so a retag typo shows up instead of
// disappearing silently.
const CATEGORY_ORDER: readonly string[] = [
  'Sensor & AR/VR Validation',
  'Lab Environments',
  'Automation & CI',
  'QA Methodology',
  'Creative Tools',
  'Platforms & Code',
  'Tools',
];

// How many categories start open on desktop. Phones start fully collapsed.
const OPEN_BY_DEFAULT = 2;

// Runs while the HTML is still parsing, before hydration, so phones never
// flash the expanded lists. 767px is just under Tailwind's md breakpoint.
const COLLAPSE_ON_MOBILE =
  "if(window.matchMedia('(max-width: 767px)').matches){document.querySelectorAll('[data-skills] details[open]').forEach(function(d){d.removeAttribute('open')})}";

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.fields.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill.fields.name);
    return acc;
  }, {} as Record<string, string[]>);

  const categories = [
    ...CATEGORY_ORDER.filter((c) => groupedSkills[c]),
    ...Object.keys(groupedSkills).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="space-y-3" data-skills>
      <h2 className="font-semibold text-gray-900">Skills</h2>
      {categories.map((category, index) => {
        const categorySkills = groupedSkills[category];

        return (
          <details
            key={category}
            open={index < OPEN_BY_DEFAULT}
            suppressHydrationWarning
            className={`group/skill ${index === 0 ? '' : 'border-t border-gray-100 pt-3'}`}
          >
            <summary className="flex items-center justify-between gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {category}{' '}
                <span className="normal-case tracking-normal text-gray-400">
                  ({categorySkills.length})
                </span>
              </span>
              <ChevronDown
                size={16}
                className="flex-shrink-0 text-gray-400 transition-transform group-open/skill:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ul className="flex flex-wrap gap-2 mt-2">
              {categorySkills.map((skill) => (
                <li
                  key={skill}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    SKILL_COLORS[category] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {skill}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      <script dangerouslySetInnerHTML={{ __html: COLLAPSE_ON_MOBILE }} />
    </div>
  );
}
```

Why each non-obvious line is there:
- `suppressHydrationWarning` — on phones the inline script removes `open` before React hydrates, so the DOM differs from the JSX. React 18 leaves attribute mismatches alone in production; this only silences the dev-mode warning.
- `list-none [&::-webkit-details-marker]:hidden` — hides the default disclosure triangle in Chrome/Firefox and Safari respectively (same pattern as `GraphTree.tsx`).
- `group/skill` + `group-open/skill:rotate-180` — named group per the repo's convention for `<details>`, so the chevron reacts to its own details only.
- `<ul>`/`<li>` — the chips are a list of skills; screen readers get "list, 8 items", and the tests can use `getByRole('listitem')`. Preflight already zeroes `ul` margin/padding and list-style.

- [ ] **Step 5: Run the specs and watch them pass**

Run: `npx playwright test e2e/skills.spec.ts e2e/resume.spec.ts e2e/accessibility.spec.ts --project=chromium --reporter=line`
Expected: 13 passed. The axe scan of `/resume` must still report zero violations.

Run: `npx playwright test e2e/skills.spec.ts --reporter=line`
Expected: 12 passed across chromium, firefox, webkit (the phone test relies on `matchMedia`, which every engine supports).

- [ ] **Step 6: Typecheck, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no type errors, no lint warnings, build exit 0. (Run the build only when no dev server is using `.next`.)

- [ ] **Step 7: Look at it**

Start the dev server (`blog-dev` in `.claude/launch.json`) and open `/resume` at desktop and at 375px. Desktop: Languages and Frameworks open, Tools and Software collapsed with counts, gray chips (legacy categories are unstyled until the retag). Phone: all four collapsed, no flash of open lists on reload.

- [ ] **Step 8: Commit**

```bash
git add tailwind.config.ts src/lib/constants.ts src/lib/contentful.ts src/components/resume/SkillsSection.tsx e2e/skills.spec.ts e2e/resume.spec.ts
git commit -m "Make resume skills collapsible with Track C categories"
```

---

### Task 3: Ship, then retag content

**Files:** none in the repo. Contentful only.

- [ ] **Step 1: Push and open the PR** against `main`; David squash-merges. Vercel deploys main.

- [ ] **Step 2: Retag in Contentful** (after the deploy is live). 19 existing `skill` entries move to new categories; one rename; 22 new entries. Chip labels are sentence-cased to match the existing chips.

| Category | Existing entries to retag | New entries to add |
|---|---|---|
| Sensor & AR/VR Validation | — | LIDAR, Optical tracking, Localization, Spatial mapping, Eye/hand tracking, Biosensors, Magic Leap Gen 1/2, Oculus |
| Lab Environments | — | Faraday cage EMI testing, Dark-room optical rigs, Hardware benches, Remote hardware labs |
| Automation & CI | — | Playwright, GitHub Actions CI, API contract testing, Accessibility scanning (axe) |
| QA Methodology | — | Test plan authoring, Regression testing, Root-cause analysis, Cross-platform matrix testing, GPU rendering validation, Bug triage |
| Creative Tools | Unity, Unreal Engine, Autodesk Maya, Photoshop, Premiere Pro, After Effects (from Tools) | — |
| Platforms & Code | HTML/CSS, JavaScript, Python (from Languages); React (from Frameworks); Windows, Linux (from Software); OSX (from Software) → rename to **macOS** | — |
| Tools | JIRA, TestRail, Bugzilla, Git, Bash, Claude Code (already Tools; category name unchanged) | — |

The `category` field in Contentful must accept the seven names exactly (check its validation list before retagging; the CDA content-type endpoint shows it).

- [ ] **Step 3: Verify on production** — `/resume` shows seven categories in the order above with 41 chips (8/4/4/6/6/7/6), Sensor & AR/VR Validation and Lab Environments open on desktop, everything collapsed on a phone. Re-run `npx playwright test e2e/skills.spec.ts e2e/accessibility.spec.ts` locally against the live content.
