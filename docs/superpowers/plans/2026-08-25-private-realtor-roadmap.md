# Private Realtor Roadmap Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one unlisted, mobile-first, static page at `/p/ajvt6e5hnk` that walks a Bay Area realtor through domain → email → platform → examples → build → SEO → compliance → her turn to reply.

**Architecture:** A route under the existing `(standalone)` group (no Header/Footer, same mechanism as `/cv`). Two files: `page.tsx` holds metadata and all nine sections as JSX; `_components.tsx` holds four presentational components plus the sticky anchor nav. Only the four example sites are data (a typed array). No client components, no state, no persistence, no Contentful.

**Tech Stack:** Next.js 14.2.35 App Router, React 18, Tailwind 3.4, `next/image`, Playwright + `@axe-core/playwright`.

**Spec:** [docs/superpowers/specs/2026-08-25-private-realtor-roadmap-design.md](../specs/2026-08-25-private-realtor-roadmap-design.md)

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Route:** `src/app/(standalone)/p/ajvt6e5hnk/` — exactly this slug, no other.
- **Exactly one client component**, `_AnswersForm.tsx` in §9. Sections 1–8 ship no JavaScript of their own; the sticky nav stays pure CSS + native `#anchor` links.
- **§9 persists answers** to one Contentful entry via an API route (Tasks 7–9). Everything outside §9 is static.
- **Copy is hardcoded JSX.** Contentful stores only the reader's answers, never page content.
- **`CONTENTFUL_MANAGEMENT_TOKEN` is server-side only.** Never `NEXT_PUBLIC_`, never imported into a client component. `src/lib/roadmapAnswers.ts` is server-only; the form talks to it through `/api/roadmap-answers`.
- **No collapsibles.** Every section renders expanded.
- **English only.**
- **No site chrome.** Do not add to `NAV_ITEMS` in `src/lib/constants.ts`. Do not link this page from anywhere.
- **Metadata must set** `robots: { index: false, follow: false, nocache: true }`.
- **Mobile-first, designed at 390 px.** Container `max-w-xl mx-auto px-5` (536 px of content at max width, ~72 characters per line). Not `max-w-2xl` — see Deviation 13.
- **Minimum 44 px tap target on every standalone link** (nav pills, site cards, buttons). Use `min-h-[44px]` (arbitrary value — do not rely on `min-h-11`). Inline links inside a sentence are exempt: at 17px/1.625 a line box is 27.6 px, and forcing 44 px would wreck the paragraph. WCAG 2.2's 2.5.8 target-size criterion exempts inline links for exactly this reason.
- **Every external link:** `target="_blank" rel="noopener noreferrer"`.
- **Colour tokens (see Deviation 1):** inline accent and link `text-green-700`; soft chip `bg-green-100 text-green-800 border-green-200`; card fill `bg-gray-100`, no border; callouts keep a border (`amber-300` / `green-200`) so emphasis outranks a plain card.
- **axe must report zero violations** at every task boundary, not just at the end.
- **Screenshots** are already committed at `public/roadmap/{ruthkrishnan,kinoko,svandbeyond,pacificedge}.webp`, all `1170x1560`.

---

## Deviations From the Spec (read before starting)

These are deliberate, and each resolves a conflict inside the spec itself or a stale statement in it. Do not silently revert them.

1. **`green-600` → `green-700`.** The spec asks to reuse the blog's `green-600`, but **David has since confirmed this page does not need to match the blog** — it is a one-off, and layout and readability outrank site consistency. So this is simply the readable choice, not a workaround: `green-600` (`#16a34a`) on white is **3.30:1**, under the 4.5:1 WCAG AA threshold; `green-700` (`#15803d`) is **5.02:1**. Anywhere else on this page where blog consistency and readability disagree, readability wins.
   *Out of scope, flag only:* the existing `LinkButton` in [RichTextRenderer.tsx:94](../../../src/components/shared/RichTextRenderer.tsx:94) has the same latent contrast failure and ships on every blog post. Do not fix it in this branch; mention it to David.
2. **`SiteCard` gains a `platform` prop.** The spec's contract table lists `name, href, note, image`, but §5's prose requires each card to name "the platform it is actually built on". Prose wins.
3. **A fifth component, `SectionNav`,** plus an exported `SECTIONS` array, both in `_components.tsx`. The spec names four components but also specifies a nine-pill sticky nav; inlining that in `page.tsx` is worse than one more presentational export.
4. **`public/` already exists.** The spec's Risks section says the repo gains it for the first time — that already happened in commit `eca48a2`/`8e2d084`. All four WebPs are tracked. No capture work remains.
5. **`scroll-mt-20` on every `Section`.** `src/app/globals.css` already sets `html { scroll-behavior: smooth }` globally, so smooth scrolling is free — but with a sticky bar the anchor target lands *under* it. Every `Section` needs the scroll margin or the nav is broken on arrival.
6. **§8's license-bar detail reuses `svandbeyond.webp`,** cropped to its top band with `aspect-[1170/380] object-cover object-top`. The DRE# bar is already in the top ~24% of the captured hero. No new asset, no re-capture.
7. **OpenGraph tags are inherited from the root layout,** so a link preview will read "Inside DTs Brain – Thoughts, Stories, and Art". The spec's privacy model explicitly accepts that messaging platforms will fetch the page for a preview, so this is left alone rather than overridden. Flag it to David; it is a two-line change if he wants a neutral preview.

8. **Sections are separated by space alone — no rule.** 56 px (`mt-14`) plus the numbered badge already marks a section start; a `border-t` on top of that is a third signal doing the same job. Dropped after the layout review.
9. **Section 5's screenshots are cropped to 3:2**, not shown at their native 0.75 aspect. Four full heroes ran ~1870 px of image in a ~12,000 px page; the band runs ~930 px and keeps the four sites comparable. They are reference thumbnails — the reader taps through to the live site.
10. **Press and hover states are specified, and hover is gated.** `active:scale-[0.97]` on pills, `active:scale-[0.985]` on site cards. Hover sits behind `[@media(hover:hover)]:` because Tailwind 3.4's bare `hover:` is a plain `:hover`, which on a phone sticks after a tap. Do not switch this on globally via `future.hoverOnlyWhenSupported` — that changes every page on the site.
11. **The sticky bar is solid white, not `bg-white/95 backdrop-blur`.** Over white content the blur is invisible and costs a compositing layer on every scroll frame.
12. **No fade mask on the pill row.** Nine pills run ~1000 px against a 390 px viewport, so the fourth is always cut — that clipped pill *is* the scroll affordance. A right-edge gradient was tried and removed: it blurred the very cue it was meant to add.

13. **`max-w-xl`, not the spec's `max-w-2xl`.** At 632 px of content, 17 px prose runs ~85 characters per line — well past the readable band. 536 px puts it near 72. Mobile is unaffected (both maxima exceed a 390 px viewport), and the section-5 screenshots are still 536 px wide, which is plenty for a thumbnail.
14. **Cards are fill-only; callouts keep their border.** Fifteen bordered gray boxes on one page is a lot of line noise, and it flattened the hierarchy — a card and a callout looked equally important. Cards now use `bg-gray-100` with no border; the amber and green callouts keep theirs, so emphasis reads as emphasis. The section-8 figure and the section-5 site cards keep borders too: both are distinct objects containing an image, not prose blocks.
15. **Sub-headings are `text-lg` (18 px), not body-sized.** At 17 px a card heading had weight but no scale, so it did not register as a level.
16. **Paragraph rhythm is `space-y-5` (20 px), not `space-y-4`.** Against a 27.6 px line box, 16 px was too tight to separate paragraphs cleanly.
17. **Smooth scrolling is switched off for this page.** `globals.css` sets `scroll-behavior: smooth` on `html` site-wide. This page is ~12,000 px, so a section-1-to-9 jump animates for the better part of a second and cannot be interrupted by tapping another pill — you watch a blur instead of arriving. A three-line `<style>` in `page.tsx` scopes it back to instant here without touching any other page. This also makes the missing site-wide `prefers-reduced-motion` override moot *for this page* — that gap still exists elsewhere and stays flagged.

18. **Section 4's two represented platforms are wrapped in a `CardGroup`.** The section's own intro says two of the four example sites are WordPress and two are Luxury Presence, and that none is Squarespace/Wix or a custom build — the spec asks for that signal to be stated "plainly rather than presenting four options as equally represented in the wild." Four sibling cards contradicted that in layout while the prose asserted it. WordPress and the realtor platforms now sit inside one container, with the subscription-cost callout moved inside it directly beneath the card it warns about. Squarespace/Wix and the custom build stay as plain cards; giving them a matching group would cancel the emphasis.

    **Revised twice on 2026-08-25.** First, David deleted the container's text label ("These two are what the four sites in section 5 actually use") in the canvas and tinted it `#f8fffc` instead, so the grouping reads by colour rather than a heading — `CardGroup` therefore takes no `title`, and the point the label made now lives in §5 as a closing line under the site cards. Then, at his request, the mint was replaced with the cards' own `bg-gray-100`: `#f8fffc` on white was too faint to show an edge at all, which is why the 16 px rounding wasn't reading. The cards inside the group flip to white (`onGroup`) so they don't merge into the group's fill, and the stray `margin-top` left behind by the deleted label is gone, so the group's padding is a symmetric 16 px.
19. **Section 5's copy is David's** (canvas edits, 2026-08-25), copy-edited at his request: the "captured on a phone / tap to open / notes are my read" opening and the "not market research" line are replaced with one sentence on where the four sites came from, plus a closing line under the cards on what they are built on. The closing line sits inside the section's flex stack at the normal 20 px rhythm, not in the fixed 339×84 px box the canvas gave it.
20. **Section 4's custom-build card is David's too**: tightened opening, its closing caveat emphasised, and its "None of the four examples…" note deleted.
21. **Three follow-ups applied on David's instruction (2026-08-25).** (a) §5's closing chip gained vertical padding — `px-2 py-1` rather than `px-1` with none — because as a block `<p>` it spans the column, and with no `py` the fill sat tight against the ascenders. Kept as a full-width bar rather than converted to an inline chip: at 390 px the sentence wraps and fills the width, so an inline chip would read as highlighter pen across two ragged lines. (b) The custom-build card's emphasised sentence uses **weight and a darker gray** instead of an underline — underline is the web's link affordance and §4 carries green underlined links a few lines above, so an underlined black sentence read as a broken link. (c) The Squarespace/Wix card's "None of the four examples…" note is deleted, matching the custom-build card. The point survives twice without them: §4's intro paragraph states it outright, and §5's chip says what all four *are* built on.

22. **The section nav is a 3-column grid, not a sticky scroller.** The spec called for "a sticky top bar [with] horizontally-scrolling anchor pills"; David asked for all nine visible at once instead. Nine pills in a grid stand ~175 px tall, so keeping it sticky would surrender a fifth of a 390×844 phone permanently — worse than the scroller it replaced. It is therefore a contents block under the `<h1>`, and the component is `SectionNav`, not `StickyNav`.

    **What this costs, stated so it is a decision:** on a ~12,000 px page you can no longer jump between sections from wherever you are — you scroll back to the top first. The spec called the sticky bar "the only concession to a long scroll, and… the one that matters on a phone." If that turns out to bite, the fix is a sticky bar *and* the grid, not one or the other.

    Two knock-ons: pills are `rounded-xl` (12 px) rather than fully round, because a lozenge whose label wraps to two lines collides with its own curve; and `Section`'s `scroll-mt` drops from `20` to `8`, since there is no longer a sticky bar to clear.

    **David then made it a card** (canvas, 2026-08-25): `bg-gray-100` and a 12 px radius, matching `Card`. Two things had to follow. The `border-y` hairlines inherited from the sticky bar are gone — straight rules meeting a rounded corner read as a rendering bug. And it is no longer full-bleed (`-mx-5` dropped), because a full-bleed box puts its own rounded corners past the edge of the screen where nobody sees them. The result is a contents card inset in the column like every other block on the page.

23. **The old section 6, "Building the site", is now section 8, "What happens next".** David's call, and the reasoning is right: it asked the reader to settle page structure and lead capture *before* she had chosen a platform, when she has no basis to answer. Reframed as the step after the conversation, it answers "so what happens if I reply?" instead. Getting found moves to 6, Compliance to 7, and **Your thoughts stays last** so the form remains the final thing on the page — a section below a form gets scrolled past, and her last action should be the save button.

    Its **bilingual card is deleted**, not moved: that question already exists in §9's form (`bilingual` is in `ANSWER_FIELDS`), which is where she answers it. The "(Section 6.)" pointer on that question goes too, and the IDX question's "(Section 8.)" becomes "(Section 7.)".

24. **Sections 1 and 2 are David's copy** (canvas, 2026-08-26). §1 is rewritten end to end: it now says plainly what the page is, that the link is the only protection, that nothing personal or NSFW belongs in it, and that something more secure can be built if she proceeds. That last point matters — it is the page telling the reader the truth the "Privacy model" section of the spec commits to. §2's intro paragraph is deleted; the section opens straight on the Cloudflare card.

    In production §1 renders as five separate `<p>` elements rather than the canvas's `<br>` breaks — identical rhythm under `space-y-5`, but semantically correct, and consistent (the canvas mixes `<br>&nbsp;<br>` and `<br><br>` for what is meant to be the same gap).

25. **No legal disclaimer, and the data warning lives in §1.** Both removed by David on 2026-08-26, and both spec requirements amended to match rather than left contradicting the build. The reasoning on the first: this is an informal document to a friend who knows he is not a lawyer and is not buying a professional service, so a disclaimer is ceremony. §7 now opens "From what I understand, these are things strongly recommended to have on your website"; individual items still say "ask your broker" where that is the real next step. On the second: §1 already tells her the page is unlisted but "not secure" and that nothing personal belongs in it, so §9's callout is now just "whatever you type here is saved so you can close the page and come back to it." The residual risk, recorded rather than argued: a reader who taps straight to §9 from the contents grid never passes §1.

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/app/(standalone)/p/ajvt6e5hnk/page.tsx` | `metadata`, page shell, the `SITES` data array, all nine sections as JSX |
| `src/app/(standalone)/p/ajvt6e5hnk/_components.tsx` | `SECTIONS`, `SectionNav`, `Section`, `Card`, `Callout`, `SiteCard`, `SHOT_W`/`SHOT_H` |
| `e2e/private-roadmap.spec.ts` | 200 + `noindex` + axe |

`_components.tsx` is colocated under the route rather than placed in `src/components/`. Nothing here is reusable. The `_` prefix is Next.js's private-folder/file convention and guarantees it is never routed.

**Commands (there is no `npm test` script in this repo):**

```bash
npx tsc --noEmit && npm run lint && npx playwright test e2e/private-roadmap.spec.ts --project=chromium
```

Playwright's `webServer` starts `npm run dev` on port **3100** automatically; `baseURL` is `http://localhost:3100`. The config runs three browser projects — pass `--project=chromium` during development to keep the loop fast, and drop it for the final run.

---

### Task 1: Route, metadata, and the failing e2e suite

**Files:**
- Create: `e2e/private-roadmap.spec.ts`
- Create: `src/app/(standalone)/p/ajvt6e5hnk/page.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: the route `/p/ajvt6e5hnk`, rendering an `<h1>` inside a `<main>`. Later tasks fill the shell.

- [ ] **Step 1: Write the failing test**

Create `e2e/private-roadmap.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx playwright test e2e/private-roadmap.spec.ts --project=chromium
```

Expected: all three FAIL. The 200 test fails with a received status of `404`; the `noindex` test fails because no `meta[name="robots"]` matches.

- [ ] **Step 3: Write the minimal page**

Create `src/app/(standalone)/p/ajvt6e5hnk/page.tsx`:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'A roadmap for your real estate website',
  description: 'A private working document. Not published, not listed.',
  robots: { index: false, follow: false, nocache: true },
};

export default function PrivateRoadmapPage() {
  return (
    <main className="mx-auto max-w-xl px-5 pb-24">
      <h1 className="pt-10 text-2xl font-semibold tracking-tight text-gray-900">
        A roadmap for your real estate website
      </h1>
    </main>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx playwright test e2e/private-roadmap.spec.ts --project=chromium
```

Expected: 3 passed.

- [ ] **Step 5: Typecheck and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 6: Commit**

```bash
git add "e2e/private-roadmap.spec.ts" "src/app/(standalone)/p/ajvt6e5hnk/page.tsx"
git commit -m "Add unlisted private roadmap route with noindex and axe coverage"
```

---

### Task 2: Presentational components and sticky nav

**Files:**
- Create: `src/app/(standalone)/p/ajvt6e5hnk/_components.tsx`
- Modify: `src/app/(standalone)/p/ajvt6e5hnk/page.tsx` (render the nav and nine empty sections)

**Interfaces:**
- Consumes: the route from Task 1.
- Produces, all exported from `_components.tsx` — later tasks import exactly these names:
  - `SECTIONS: readonly { id: string; label: string }[]` — nine entries, in page order.
  - `SectionNav(): JSX.Element` — no props. A grid, not a sticky bar; see Deviation 22.
  - `Section({ id, number, title, children }: { id: string; number: number; title: string; children: React.ReactNode })`
  - `Card({ title, children, onGroup }: { title: string; children: React.ReactNode; onGroup?: boolean })` — `onGroup` renders white instead of the default gray, for cards nested inside a `CardGroup`
  - `CardGroup({ children }: { children: React.ReactNode })` — no title; see Deviation 18
  - `Callout({ tone, children }: { tone?: 'note' | 'warning'; children: React.ReactNode })` — `tone` defaults to `'note'`.
  - `SiteCard({ name, href, platform, note, image }: { name: string; href: string; platform: string; note: string; image: string })`
  - `SHOT_W = 1170`, `SHOT_H = 1560`

- [ ] **Step 1: Write the components file**

Create `src/app/(standalone)/p/ajvt6e5hnk/_components.tsx`:

```tsx
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export const SECTIONS = [
  { id: 'start', label: 'Start here' },
  { id: 'domain', label: 'Domain' },
  { id: 'email', label: 'Email' },
  { id: 'platform', label: 'Platform' },
  { id: 'examples', label: 'Examples' },
  { id: 'found', label: 'Getting found' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'next', label: 'To think about' },
  { id: 'thoughts', label: 'Your thoughts' },
] as const;

// Screenshots are all captured at the same size; see the spec's capture method.
export const SHOT_W = 1170;
export const SHOT_H = 1560;

const SHOT_SIZES = '(max-width: 576px) 100vw, 536px';

export function SectionNav() {
  return (
    // A 3-column grid so all nine are visible at once. Deliberately NOT sticky:
    // nine pills stand ~175px tall, and giving up a fifth of a 390x844 phone
    // permanently is worse than the horizontal scroller this replaced.
    // Gray-100 card, matching Card, rather than a full-bleed band with rules:
    // straight hairlines across a rounded corner read as broken, and a
    // full-bleed radius puts its own corners off the edge of the screen.
    <nav
      aria-label="Sections"
      className="mt-8 grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-3"
    >
      {SECTIONS.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="flex min-h-[44px] items-center justify-center rounded-xl border border-green-200 bg-green-100 px-2 py-1.5 text-center text-[13px] font-medium leading-tight text-green-800 transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)]:hover:bg-green-200"
        >
          {/* Non-breaking space keeps the number with the first word when a
              long label wraps to two lines. */}
          <span>
            <span className="font-semibold">{index + 1}</span>
            {'\u00A0'}
            {section.label}
          </span>
        </a>
      ))}
    </nav>
  );
}

export function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      // Space alone separates sections: 56px plus the numbered badge already
      // marks the start, so a border-t would be a third signal doing the same
      // job. scroll-mt is now just breathing room on arrival — there is no
      // sticky bar left to clear.
      className="mt-14 scroll-mt-8 first-of-type:mt-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">
          {number}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

export function Card({
  title,
  children,
  onGroup = false,
}: {
  title: string;
  children: React.ReactNode;
  onGroup?: boolean;
}) {
  return (
    // Fill only, no border: fifteen bordered boxes on one page flattened the
    // hierarchy against the callouts, which do keep a border. Inside a
    // CardGroup the group carries the gray, so the card flips to white.
    <div
      className={`rounded-xl px-4 pb-[18px] pt-4 ${onGroup ? 'bg-white' : 'bg-gray-100'}`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-2 space-y-3 text-gray-700">{children}</div>
    </div>
  );
}

// Wraps the two platforms the section-5 examples actually use. No text label —
// the grouping is carried by fill and border alone (Deviation 18). The group
// takes the card gray and the cards inside it flip to white, so the nesting
// reads; a 16px radius against the cards' 12px keeps it a level above a plain
// Card without competing with a Callout.
export function CardGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-green-200 bg-gray-100 p-4">
      {children}
    </div>
  );
}

const CALLOUT_TONE = {
  note: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
} as const;

export function Callout({
  tone = 'note',
  children,
}: {
  tone?: keyof typeof CALLOUT_TONE;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 leading-relaxed ${CALLOUT_TONE[tone]}`}>
      {children}
    </div>
  );
}

export function SiteCard({
  name,
  href,
  platform,
  note,
  image,
}: {
  name: string;
  href: string;
  platform: string;
  note: string;
  image: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl border border-gray-200 bg-white transition-[transform,border-color] duration-150 ease-out active:scale-[0.985] [@media(hover:hover)]:hover:border-gray-300"
    >
      {/* Cropped to 3:2 rather than the native 0.75: four full heroes ran
          ~1870px of image in a ~12,000px page. These are thumbnails. */}
      <Image
        src={image}
        alt={`The ${name} home page as it looks on a phone`}
        width={SHOT_W}
        height={SHOT_H}
        sizes={SHOT_SIZES}
        className="aspect-[3/2] w-full border-b border-gray-200 object-cover object-top"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 text-sm text-gray-600">Built on {platform}</p>
        <p className="mt-2 text-gray-700">{note}</p>
        {/* No min-h-[44px] here — the whole card is the tap target, so a 44px
            floor on this line is just dead space inside it. */}
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green-700">
          Open in a new tab
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </p>
      </div>
    </a>
  );
}
```

Note: `SiteCard`'s "Open …" line is a `<p>`, not an `<a>` — the whole card is already the link, and a nested anchor would be invalid HTML and an axe violation.

- [ ] **Step 2: Render the nav and nine empty sections**

Replace the body of `src/app/(standalone)/p/ajvt6e5hnk/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { Section, SECTIONS, SectionNav } from './_components';

export const metadata: Metadata = {
  title: 'A roadmap for your real estate website',
  description: 'A private working document. Not published, not listed.',
  robots: { index: false, follow: false, nocache: true },
};

export default function PrivateRoadmapPage() {
  return (
    <main
      id="roadmap-page"
      className="mx-auto max-w-xl px-5 pb-24 text-[17px] leading-relaxed text-gray-700"
    >
      {/* globals.css sets scroll-behavior: smooth on html site-wide. This page
          is ~12,000px, so a section-1-to-9 jump animates for most of a second
          and can't be interrupted by tapping another pill. Scoped back to
          instant here without affecting any other page. */}
      <style>{`html:has(#roadmap-page){scroll-behavior:auto}`}</style>
      <h1 className="pt-10 text-2xl font-semibold tracking-tight text-gray-900">
        A roadmap for your real estate website
      </h1>
      <SectionNav />
      {SECTIONS.map((section, index) => (
        <Section
          key={section.id}
          id={section.id}
          number={index + 1}
          title={section.label}
        >
          <p>Placeholder — filled in by a later task.</p>
        </Section>
      ))}
    </main>
  );
}
```

The `<h1>` sits above `SectionNav`, so the page reads title → contents → section 1.

- [ ] **Step 3: Run the tests**

```bash
npx playwright test e2e/private-roadmap.spec.ts --project=chromium
```

Expected: 3 passed. If `color-contrast` fires, a `green-600` token slipped in — see Deviation 1.

- [ ] **Step 4: Typecheck and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(standalone)/p/ajvt6e5hnk/"
git commit -m "Add roadmap page components and sticky section nav"
```

---

### Task 3: Sections 1–3 — Start here, Domain, Email

**Files:**
- Modify: `src/app/(standalone)/p/ajvt6e5hnk/page.tsx`

**Interfaces:**
- Consumes: `Section`, `Card`, `SectionNav`, `SECTIONS` from `./_components`.
- Produces: sections 1–3 written out longhand. From here on `page.tsx` no longer maps over `SECTIONS` for its body — the nav still does. Replace the `SECTIONS.map(...)` block with explicit `<Section>` elements, and keep placeholder sections 4–9 in place so the nav's anchors all still resolve.

- [ ] **Step 1: Replace the mapped placeholder block**

In `page.tsx`, change the import to `import { Card, Section, SECTIONS, SectionNav } from './_components';` and replace the `{SECTIONS.map(...)}` block with the following, followed by the remaining placeholders:

```tsx
<Section id="start" number={1} title="Start here">
  {/* David's copy, finalised in the canvas 2026-08-26. Rendered as separate
      paragraphs rather than the canvas's <br> breaks: same visual rhythm at
      space-y-5, but semantically correct and consistent (the canvas mixes
      <br>&nbsp;<br> and <br><br> for the same gap). */}
  <p>
    This is a visual representation of the things needed to create a realtor
    website
  </p>
  <p>
    This page is on a non-searchable section of my blog; only people with this
    link will see it. Still, don&apos;t put anything personal or NSFW here; it
    is not secure.
  </p>
  <p>
    I can make something more secure if you decide you want to proceed with
    making a website
  </p>
  <p>I know how much you love organization 🤪</p>
  <p>
    Go through the sections and answer the questions in section 9. They will
    stay on the page even if you close the page
  </p>
</Section>

<Section id="domain" number={2} title="Domain name">
  <Card title="Create a Cloudflare account">
    <p>
      Cloudflare sells domains at cost — no markup on the wholesale price, and
      no cheap first year that quadruples on renewal. You also get DNS, the
      switchboard that points your domain at whatever site you end up building,
      in the same account.
    </p>
    <p>
      Signing up is free; you pay only for the domain itself.{' '}
      <a
        href="https://dash.cloudflare.com/sign-up"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-green-700 underline"
      >
        Create an account
      </a>
      .
    </p>
  </Card>

  <Card title="Choose and register the domain">
    <p>
      Your own name is the safest choice — <span className="whitespace-nowrap">yourname.com</span>, or
      yournamerealestate.com / yournamehomes.com if the plain one is taken. It
      survives a change of brokerage, a change of specialty and a change of
      city.
    </p>
    <p>What to avoid:</p>
    <ul className="list-disc space-y-1 pl-5">
      <li>
        Hyphens and creative spellings — you will spell it out loud every time.
      </li>
      <li>
        Your brokerage&apos;s name. You don&apos;t own it, and it leaves with
        you.
      </li>
      <li>A neighborhood you might not be farming in three years.</li>
      <li>
        <code className="rounded bg-black/5 px-1 py-0.5 text-sm">.net</code>,{' '}
        <code className="rounded bg-black/5 px-1 py-0.5 text-sm">.biz</code>,{' '}
        <code className="rounded bg-black/5 px-1 py-0.5 text-sm">.info</code> —
        get the <code className="rounded bg-black/5 px-1 py-0.5 text-sm">.com</code>{' '}
        or pick a different name.
      </li>
    </ul>
    <p className="font-semibold text-gray-900">Budget roughly $10–15 a year.</p>
  </Card>
</Section>

<Section id="email" number={3} title="Professional email">
  <p>
    Would strongly recommend having a professional email using whatever domain
    name you choose.
  </p>

  <Card title="Google Workspace on your domain">
    <p>
      It&apos;s the same Gmail, Calendar and Drive you already use, running on
      your domain. Sign up for{' '}
      <a
        href="https://workspace.google.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-green-700 underline"
      >
        Google Workspace
      </a>
      .
    </p>
    <p>
      I recommend starting with the Starter plan to see if you like it. The
      first two weeks are free, after which it&apos;s roughly $8 a month.
    </p>
    {/* Bold closing cost line — the same pattern §2 uses. In the canvas these
        are <br>-separated inside one <p>; separate paragraphs here, matching
        Deviation 24's reasoning. */}
    <p className="font-semibold text-gray-900">
      Budget roughly $8 a month for 1 user.
    </p>
  </Card>
</Section>
```

- [ ] **Step 2: Keep the remaining placeholders**

Immediately after the section above, keep the remaining six sections as placeholders so every nav anchor resolves:

```tsx
{SECTIONS.slice(3).map((section, index) => (
  <Section
    key={section.id}
    id={section.id}
    number={index + 4}
    title={section.label}
  >
    <p>Placeholder — filled in by a later task.</p>
  </Section>
))}
```

- [ ] **Step 3: Run the tests**

```bash
npx playwright test e2e/private-roadmap.spec.ts --project=chromium
```

Expected: 3 passed.

- [ ] **Step 4: Typecheck and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: clean. ESLint's `react/no-unescaped-entities` is why the copy uses `&apos;`, `&ldquo;` and `&rdquo;` — keep doing that.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(standalone)/p/ajvt6e5hnk/page.tsx"
git commit -m "Write roadmap sections 1-3: intro, domain, professional email"
```

---

### Task 4: Sections 4–5 — Platform options and Bay Area examples

**Files:**
- Modify: `src/app/(standalone)/p/ajvt6e5hnk/page.tsx`

**Interfaces:**
- Consumes: `Card`, `Callout`, `Section`, `SiteCard`, `SectionNav`, `SECTIONS`.
- Produces: a module-level `SITES` array in `page.tsx`, typed by inference, each entry matching `SiteCard`'s props exactly: `{ name, href, platform, note, image }`.

Import line becomes:

```tsx
import { Callout, Card, CardGroup, Section, SECTIONS, SiteCard, SectionNav } from './_components';
```

- [ ] **Step 1: Add the SITES data array**

Above the component in `page.tsx`:

```tsx
const SITES = [
  {
    name: 'ruthkrishnan.com',
    href: 'https://ruthkrishnan.com',
    platform: 'WordPress (nginx, PHP, Plesk)',
    note: 'The site describes them as the #1 ranked San Francisco agents by MLS volume — their claim, not my verification of it. It opens on an 88-second background video, which is by far the heaviest thing on the page.',
    image: '/roadmap/ruthkrishnan.webp',
  },
  {
    name: 'kinokorealestate.com',
    href: 'https://kinokorealestate.com',
    platform: 'Luxury Presence',
    note: 'Polished and firmly seller-focused, with big display type doing most of the work. Worth looking at for how little it puts on the first screen.',
    image: '/roadmap/kinoko.webp',
  },
  {
    name: 'siliconvalleyandbeyond.com',
    href: 'https://siliconvalleyandbeyond.com',
    platform: 'WordPress (with Site Kit by Google)',
    note: 'The Silicon Valley benchmark. Brokerage-affiliated and leaning into it — the Engel & Völkers mark sits beside her own.',
    image: '/roadmap/svandbeyond.webp',
  },
  {
    name: 'pacificedgesf.com',
    href: 'https://pacificedgesf.com',
    platform: 'Luxury Presence',
    note: 'Built around the agents themselves rather than the inventory, and it leads with awards. The closest of the four to a personal brand.',
    image: '/roadmap/pacificedge.webp',
  },
];
```

- [ ] **Step 2: Write sections 4 and 5**

Replace the placeholders for `platform` and `examples`:

```tsx
<Section id="platform" number={4} title="Website platform options">
  <Card title="Squarespace or Wix">
    <p>
      The easiest path. Genuinely good templates, drag-and-drop editing,
      nothing to maintain, roughly $16–25 a month.
    </p>
    <p>
      The cost is control: the real-estate-specific pieces — MLS listing feeds,
      IDX search, lead routing — are either bolted on through third-party
      add-ons or not available at all.
    </p>
  </Card>

  <CardGroup>
    <Card title="WordPress with a real estate theme" onGroup>
      <p>
        The most flexible option and the most common one in this industry. Themes
        and plugins exist for everything, and you can host it anywhere.
      </p>
      <p>
        The maintenance is yours. One of the sites in section 5,
        ruthkrishnan.com, is currently served by PHP 7.4 — which stopped
        receiving security fixes in November 2022. That isn&apos;t a swipe at
        them. It is what happens when keeping the site current is nobody&apos;s
        actual job.
      </p>
      <p className="text-sm text-gray-600">
        Two of the four examples:{' '}
        <a href="#examples" className="font-medium text-green-700 underline">
          ruthkrishnan.com and siliconvalleyandbeyond.com
        </a>
        .
      </p>
    </Card>

    <Card title="Realtor-specific platforms" onGroup>
      <p>
        Built for this industry, so IDX search, listing pages, lead capture and
        a CRM come as standard rather than as add-ons. The three worth looking
        at:{' '}
        <a
          href="https://placester.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-green-700 underline"
        >
          Placester
        </a>
        ,{' '}
        <a
          href="https://luxurypresence.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-green-700 underline"
        >
          Luxury Presence
        </a>{' '}
        and{' '}
        <a
          href="https://sierrainteractive.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-green-700 underline"
        >
          Sierra Interactive
        </a>
        .
      </p>
      <p className="text-sm text-gray-600">
        Two of the four examples:{' '}
        <a href="#examples" className="font-medium text-green-700 underline">
          kinokorealestate.com and pacificedgesf.com
        </a>
        .
      </p>
    </Card>

    {/* Inside the group, directly under the card it warns about. */}
    <Callout tone="warning">
      <p className="font-semibold">These are ongoing subscriptions.</p>
      <p className="mt-2">
        Typically several hundred dollars a month, often with a setup fee on top
        and an annual contract underneath. Over three years that is the largest
        number on this page by a wide margin. Get a written quote before you
        fall in love with a demo.
      </p>
    </Callout>
  </CardGroup>

  <Card title="A custom build">
    <p>
      Someone builds a custom site. Highest upfront cost, lowest running cost,
      and no template to fight.
    </p>
    {/* Weight rather than underline: underline is the web's link affordance
        and this section has green underlined links a few lines above. */}
    <p className="font-semibold text-gray-900">
      It only works if there is someone to maintain it afterwards. That ongoing
      relationship is the real commitment, not the build.
    </p>
  </Card>
</Section>

<Section id="examples" number={5} title="Bay Area examples">
  <p>
    These were pulled from a quick search of the most popular realtors in the
    Bay Area. It was not scientific.
  </p>
  <div className="space-y-6">
    {SITES.map((site) => (
      <SiteCard key={site.name} {...site} />
    ))}
  </div>
  {/* Gray-100 to match the cards, so the tie back to section 4 introduces no
      new colour. Full-width bar rather than an inline chip: at 390px the
      sentence wraps and fills the column anyway. */}
  <p className="rounded-md bg-gray-100 px-2 py-1">
    All four websites were built on either WordPress or a realtor-specific
    platform.
  </p>
</Section>
```

- [ ] **Step 3: Update the trailing placeholder block**

The mapped placeholder now covers only sections 6–9:

```tsx
{SECTIONS.slice(5).map((section, index) => (
  <Section
    key={section.id}
    id={section.id}
    number={index + 6}
    title={section.label}
  >
    <p>Placeholder — filled in by a later task.</p>
  </Section>
))}
```

- [ ] **Step 4: Run the tests**

```bash
npx playwright test e2e/private-roadmap.spec.ts --project=chromium
```

Expected: 3 passed. The four screenshots now render through `next/image`; they are local files under `public/`, so no `next.config.mjs` change is needed.

- [ ] **Step 5: Typecheck and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(standalone)/p/ajvt6e5hnk/page.tsx"
git commit -m "Write roadmap sections 4-5: platform options and Bay Area examples"
```

---

### Task 5: Section 6 — Getting found

**Files:**
- Modify: `src/app/(standalone)/p/ajvt6e5hnk/page.tsx`

**Interfaces:**
- Consumes: `Card`, `Section` (no new imports).
- Produces: sections 6 and 7 written out; the mapped placeholder shrinks to sections 8–9.

- [ ] **Step 1: Write section 6**

Replace the `found` placeholder:

```tsx
<Section id="found" number={6} title="Getting found">
  <Card title="Search">
    <p>
      Title pages after what people actually search for: &ldquo;Homes for sale
      in Noe Valley&rdquo; beats &ldquo;Listings&rdquo;. One page per
      neighborhood you genuinely work, each with something on it only a local
      would know to write.
    </p>
    <p>
      Register the site with{' '}
      <a
        href="https://search.google.com/search-console"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-green-700 underline"
      >
        Google Search Console
      </a>
      . It is free, and it is how you find out you are invisible before six
      months have gone by.
    </p>
  </Card>

  <Card title="Everything pointing back">
    <p>
      Your brokerage profile, Zillow, Realtor.com, LinkedIn, Instagram — every
      one of them has a website field. Put your domain in all of them.
    </p>
  </Card>
</Section>
```

- [ ] **Step 2: Update the trailing placeholder block**

```tsx
{SECTIONS.slice(6).map((section, index) => (
  <Section
    key={section.id}
    id={section.id}
    number={index + 7}
    title={section.label}
  >
    <p>Placeholder — filled in by a later task.</p>
  </Section>
))}
```

- [ ] **Step 3: Run the tests**

```bash
npx playwright test e2e/private-roadmap.spec.ts --project=chromium
```

Expected: 3 passed.

- [ ] **Step 4: Typecheck and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(standalone)/p/ajvt6e5hnk/page.tsx"
git commit -m "Write roadmap section 6: getting found"
```

---

### Task 6: Sections 7–9 — Compliance, What happens next, Your thoughts (prompts only)

**Files:**
- Modify: `src/app/(standalone)/p/ajvt6e5hnk/page.tsx`

**Interfaces:**
- Consumes: `Callout`, `Card`, `Section`, plus `Image` from `next/image` (new import in `page.tsx`) and `SHOT_W`/`SHOT_H` are **not** needed here — the license-bar figure uses `fill`.
- Produces: the final page. After this task `SECTIONS` is used only by `SectionNav`, so remove the now-empty `SECTIONS.slice(...)` map and drop `SECTIONS` from `page.tsx`'s import (it stays exported from `_components.tsx` for `SectionNav`'s own use).

Import lines become:

```tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import { Callout, Card, Section, SiteCard, SectionNav } from './_components';
```

- [ ] **Step 1: Write section 7**

Replace the `compliance` placeholder:

```tsx
<Section id="compliance" number={7} title="Compliance">
  <Callout tone="note">
    From what I understand, these are things strongly recommended to have on
    your website.
  </Callout>

  <Card title="IDX and MLS listings">
    <p>
      Live MLS listings on your own site means an IDX feed, and IDX comes with
      rules: your MLS has to approve it, your brokerage has to permit it, and
      there is usually a monthly fee plus a display agreement.
    </p>
    <p>
      Ask your broker before you choose a platform. That one question rules some
      options out on its own.
    </p>
  </Card>

  <Card title="Fair Housing">
    <p>
      The Equal Housing Opportunity logo belongs in your footer. So does the
      Realtor® mark if you are a NAR member, and NAR has rules about exactly
      how that mark is written.
    </p>
    <p>
      Fair Housing law also constrains the words on the site. Describing who a
      neighborhood suits, rather than what a property is, is where agents get
      into trouble.
    </p>
  </Card>

  <Card title="License and brokerage identification">
    <p>
      California requires your license number and your brokerage&apos;s
      identification on your marketing. A sitewide footer is the minimum.
    </p>
    <figure className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative aspect-[1170/380]">
        <Image
          src="/roadmap/svandbeyond.webp"
          alt="The top of siliconvalleyandbeyond.com: a bar reading DAWN THOMAS, DRE number 01460529, sitting above a header with the Engel and Völkers logo next to the Dawn Thomas Team logo"
          fill
          sizes="(max-width: 576px) 100vw, 536px"
          className="object-cover object-top"
        />
      </div>
      <figcaption className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
        siliconvalleyandbeyond.com puts the license number in a bar above the
        header, with the brokerage mark sized equal to her own.
      </figcaption>
    </figure>
    <p>
      Confirm the exact wording with your broker — brokerages usually have a
      required format.
    </p>
  </Card>

  <Card title="Accessibility (WCAG 2.1 AA)">
    <p>
      Real estate sites are a frequent target for ADA website claims. Building
      the site accessibly from the start costs very little. Retrofitting one
      costs a lot.
    </p>
    <p>
      Two of the four example sites run a third-party accessibility overlay.
      These are widely criticized by accessibility practitioners and by disabled
      users, they do not by themselves make a site conformant, and they have not
      reliably prevented claims. Do not treat one as the solution.
    </p>
  </Card>
</Section>
```

- [ ] **Step 2: Write section 9 and delete the placeholder map**

Write §9 as a plain question list for now. Task 9 replaces the `<ol>` with the wired form; the surrounding copy stays. Ship it this way so the page is complete and reviewable before any storage exists.

Replace the `thoughts` placeholder and remove the `SECTIONS.slice(...)` block entirely:

```tsx
<Section id="next" number={8} title="Things to start to think about">
  <Card title="What pages the site actually needs">
    <p>
      Home. About. Listings, active and sold. Buyers. Sellers. The
      neighborhoods you work. Testimonials. Contact. That is the whole list,
      and the first version can ship with six of them.
    </p>
    <p>
      The commonest mistake is planning fifteen pages and publishing three.
      Every page you add is a page you have to keep true.
    </p>
  </Card>

  <Card title="Lead capture, and where the leads go">
    <p>
      A form, and a decision about where what it collects ends up — your inbox,
      a spreadsheet, or a CRM. Pick one before the site is live, not after the
      first lead is lost.
    </p>
    <p>
      Both Luxury Presence sites in section 5 do the simplest version of this
      well: a call button and an email button floating above the page, staying
      put as you scroll. On a phone that is close to the whole lead-capture
      strategy, and it works.
    </p>
    <p>
      The moment you collect a name and an email you need a privacy policy —
      see{' '}
      <a href="#compliance" className="font-medium text-green-700 underline">
        section 7
      </a>
      .
    </p>
  </Card>
</Section>

<Section id="thoughts" number={9} title="Your thoughts">
  <p>
    Nothing on this page records anything — there is no form here and no data
    is collected. Just text me or email me with whatever you have.
  </p>
  <Card title="Questions, roughly in order of usefulness">
    <ol className="list-decimal space-y-3 pl-5">
      <li>
        Which of the four sites in section 5 did you like, and what
        specifically — the layout, the photography, the tone?
      </li>
      <li>Which one did you dislike? That is usually the more useful answer.</li>
      <li>
        What are you comfortable spending, upfront and per month? A range is
        fine.
      </li>
      <li>
        How much do you want to run yourself? &ldquo;I&apos;ll update my own
        listings&rdquo; and &ldquo;I never want to log in&rdquo; are both good
        answers, and they point at different platforms.
      </li>
      <li>Bilingual — yes or no, and which language?</li>
      <li>Have you asked your broker about IDX yet? (Section 7.)</li>
      <li>
        Is there a site — realtor or not — whose feel you just like? Send it
        over.
      </li>
    </ol>
  </Card>
  <p>
    Once I have those, the platform choice in section 4 mostly makes itself.
  </p>
</Section>
```

- [ ] **Step 3: Run the full test suite across all browsers**

```bash
npx playwright test e2e/private-roadmap.spec.ts
```

Expected: 9 passed (3 tests × chromium, firefox, webkit).

- [ ] **Step 4: Typecheck, lint, and production build**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Expected: all clean. Confirm `/p/ajvt6e5hnk` appears in the build output route list as a static (`○`) route.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(standalone)/p/ajvt6e5hnk/page.tsx"
git commit -m "Write roadmap sections 7-9: compliance, next steps, your thoughts"
```

---

### Task 7: Contentful content type and the answers module

**Files:**
- Create: `scripts/create-roadmap-content-type.mjs`
- Create: `src/lib/roadmapAnswers.ts`

**Prerequisite — David must do this first, it cannot be automated:** `.env.local`
currently holds a placeholder for `CONTENTFUL_MANAGEMENT_TOKEN` (21 chars,
starting `your_m`). In Contentful, go to **Settings → API keys → Content
management tokens → Generate personal token**, then set the real value
(`CFPAT-…`) in `.env.local` and in the Vercel project. Nothing in Tasks 7–9 works
until this exists.

**Scoping that token — settled 2026-08-26, after getting it wrong twice.** The
CMA tokens screen states it outright: *"Personal access tokens are always bound
to your account, with same permissions across your spaces and organizations."*
There is **no** space, environment or content-type scoping. The CMA reference's
two scopes (`content_management_read` / `content_management_manage`) are the
whole story, this route needs `manage`, and `manage` means everything the
account can reach.

An intermediate version of this plan claimed the opposite — that the token could
be restricted to selected spaces — inferred from a token that authenticated
correctly but reached zero spaces. That inference was wrong; the zero-spaces
symptom had another cause. Do not re-derive it.

What can actually be narrowed:

| Lever | Effect | Cost |
|-------|--------|------|
| **Set an expiry** | A leaked token goes inert after the window. The only real lever, and worth setting generously enough that it does not lapse mid-conversation | None. Do it |
| **Revoke when the page retires** | The page is temporary by design; the token should not outlive it. This belongs with deleting the entry and the API route | None, but it depends on remembering — see the closing notes |
| **App Identity / app access token** | Genuinely scoped to one space *and* one environment, short-lived by construction. The only way to actually bound the credential | An app definition, a keypair, a signed JWT and a token exchange. Disproportionate for a temporary page, but the answer if this outlives its purpose |

A PAT cannot be re-scoped or edited after creation — revoke and make a new one.

**Interfaces:**
- Consumes: `CONTENTFUL_SPACE_ID` and `CONTENTFUL_MANAGEMENT_TOKEN` from the environment.
- Produces, from `src/lib/roadmapAnswers.ts`:
  - `ANSWER_FIELDS: readonly ['liked','disliked','budget','maintenance','bilingual','idx','otherSite']`
  - `type AnswerField`, `type Answers = Record<AnswerField, string>`
  - `EMPTY_ANSWERS: Answers`, `MAX_FIELD_LENGTH = 2000`
  - `CONTENT_TYPE_ID = 'roadmapAnswers'`, `ENTRY_ID = 'roadmapAnswersSingleton'`
  - `readAnswers(): Promise<{ answers: Answers; updatedAt: string | null }>`
  - `writeAnswers(answers: Answers): Promise<void>`

- [ ] **Step 1: Write the content-type script**

Create `scripts/create-roadmap-content-type.mjs`. Long-text (`Text`) fields, not
`Symbol` — `Symbol` caps at 256 characters and the field cap is 2000.

```js
// One-off. Run once with a real CONTENTFUL_MANAGEMENT_TOKEN in the environment:
//   node --env-file=.env.local scripts/create-roadmap-content-type.mjs
const SPACE = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ID = 'roadmapAnswers';
const URL_BASE = `https://api.contentful.com/spaces/${SPACE}/environments/master/content_types/${ID}`;

const answerFields = [
  'liked', 'disliked', 'budget', 'maintenance', 'bilingual', 'idx', 'otherSite',
].map((id) => ({ id, name: id, type: 'Text', required: false }));

const body = {
  name: 'Roadmap Answers',
  description: 'Answers to section 9 of the private realtor roadmap page.',
  displayField: 'title',
  fields: [{ id: 'title', name: 'Title', type: 'Symbol', required: true }, ...answerFields],
};

const existing = await fetch(URL_BASE, { headers: { Authorization: `Bearer ${TOKEN}` } });
const version = existing.ok ? (await existing.json()).sys.version : null;

const res = await fetch(URL_BASE, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/vnd.contentful.management.v1+json',
    ...(version === null ? {} : { 'X-Contentful-Version': String(version) }),
  },
  body: JSON.stringify(body),
});
if (!res.ok) throw new Error(`create failed: ${res.status} ${await res.text()}`);

const created = await res.json();
const pub = await fetch(`${URL_BASE}/published`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'X-Contentful-Version': String(created.sys.version),
  },
});
if (!pub.ok) throw new Error(`publish failed: ${pub.status} ${await pub.text()}`);
console.log('roadmapAnswers content type ready');
```

The *content type* is published (entries of an unpublished type cannot be
created); the *entry* holding the answers never is.

- [ ] **Step 2: Run it and verify against the API**

```bash
node --env-file=.env.local scripts/create-roadmap-content-type.mjs
```

Expected: `roadmapAnswers content type ready`. Verify independently rather than
trusting the exit code:

```bash
curl -sS -H "Authorization: Bearer $CONTENTFUL_MANAGEMENT_TOKEN" \
  "https://api.contentful.com/spaces/$CONTENTFUL_SPACE_ID/environments/master/content_types/roadmapAnswers" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print([f['id'] for f in d['fields']])"
```

Expected: `['title', 'liked', 'disliked', 'budget', 'maintenance', 'bilingual', 'idx', 'otherSite']`

- [ ] **Step 3: Write the answers module**

Create `src/lib/roadmapAnswers.ts`:

```ts
// Server-only. CONTENTFUL_MANAGEMENT_TOKEN must never reach the client, so this
// module is imported by the API route and nothing else.
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const LOCALE = 'en-US';

export const CONTENT_TYPE_ID = 'roadmapAnswers';
export const ENTRY_ID = 'roadmapAnswersSingleton';
export const MAX_FIELD_LENGTH = 2000;

export const ANSWER_FIELDS = [
  'liked', 'disliked', 'budget', 'maintenance', 'bilingual', 'idx', 'otherSite',
] as const;

export type AnswerField = (typeof ANSWER_FIELDS)[number];
export type Answers = Record<AnswerField, string>;

export const EMPTY_ANSWERS: Answers = {
  liked: '', disliked: '', budget: '', maintenance: '',
  bilingual: '', idx: '', otherSite: '',
};

const entryUrl = () =>
  `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/entries/${ENTRY_ID}`;

const authHeaders = () => ({ Authorization: `Bearer ${MANAGEMENT_TOKEN}` });

export async function readAnswers(): Promise<{
  answers: Answers;
  updatedAt: string | null;
}> {
  const res = await fetch(entryUrl(), { headers: authHeaders(), cache: 'no-store' });
  if (res.status === 404) return { answers: EMPTY_ANSWERS, updatedAt: null };
  if (!res.ok) throw new Error(`Contentful read failed: ${res.status}`);

  const entry = await res.json();
  const answers: Answers = { ...EMPTY_ANSWERS };
  for (const field of ANSWER_FIELDS) {
    const value = entry.fields?.[field]?.[LOCALE];
    if (typeof value === 'string') answers[field] = value;
  }
  return { answers, updatedAt: entry.sys?.updatedAt ?? null };
}

export async function writeAnswers(answers: Answers): Promise<void> {
  // Read the current version first: a create needs X-Contentful-Content-Type,
  // an update needs X-Contentful-Version. Same PUT either way.
  const existing = await fetch(entryUrl(), { headers: authHeaders(), cache: 'no-store' });
  const version: number | null = existing.ok ? (await existing.json()).sys.version : null;

  const fields: Record<string, Record<string, string>> = {
    title: { [LOCALE]: 'Roadmap answers' },
  };
  for (const field of ANSWER_FIELDS) {
    fields[field] = { [LOCALE]: answers[field] };
  }

  const res = await fetch(entryUrl(), {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      ...(version === null
        ? { 'X-Contentful-Content-Type': CONTENT_TYPE_ID }
        : { 'X-Contentful-Version': String(version) }),
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Contentful write failed: ${res.status}`);

  // Deliberately never published: the answers stay out of the Delivery API, so
  // they cannot surface in a blog query, and a draft read is never CDN-stale.
}
```

- [ ] **Step 4: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
```

```bash
git add scripts/create-roadmap-content-type.mjs src/lib/roadmapAnswers.ts
git commit -m "Add roadmapAnswers content type and Contentful answers module"
```

---

### Task 8: The answers API route

**Files:**
- Create: `src/app/api/roadmap-answers/route.ts`
- Test: `e2e/roadmap-answers.spec.ts`

**Interfaces:**
- Consumes: `readAnswers`, `writeAnswers`, `ANSWER_FIELDS`, `EMPTY_ANSWERS`, `MAX_FIELD_LENGTH`, `Answers` from `@/lib/roadmapAnswers`.
- Produces: `GET /api/roadmap-answers` → `{ answers: Answers, updatedAt: string | null }`; `POST` accepting a partial `Answers` JSON body → `{ ok: true }`.

- [ ] **Step 1: Write the failing test**

Create `e2e/roadmap-answers.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const ROUTE = '/api/roadmap-answers';

test('rejects a field that is not a string', async ({ request }) => {
  const res = await request.post(ROUTE, { data: { budget: 12345 } });
  expect(res.status()).toBe(400);
});

test('rejects a field over the length cap', async ({ request }) => {
  const res = await request.post(ROUTE, { data: { budget: 'x'.repeat(2001) } });
  expect(res.status()).toBe(400);
});

test('ignores fields that are not on the allowlist', async ({ request }) => {
  const res = await request.post(ROUTE, {
    data: { budget: 'about $2k', sys: { id: 'evil' }, fields: 'nope' },
  });
  expect(res.ok()).toBeTruthy();

  const read = await request.get(ROUTE);
  const body = await read.json();
  expect(body.answers.budget).toBe('about $2k');
  expect(body.answers).not.toHaveProperty('sys');
  expect(body.answers).not.toHaveProperty('fields');
});

test('round-trips an answer', async ({ request }) => {
  const value = `liked the second one ${Date.now()}`;
  const write = await request.post(ROUTE, { data: { liked: value } });
  expect(write.ok()).toBeTruthy();

  const read = await request.get(ROUTE);
  expect((await read.json()).answers.liked).toBe(value);
});
```

These tests write to the real Contentful entry. That is deliberate — a mocked
CMA would prove nothing about the header dance in `writeAnswers`. The entry is a
scratch record for one reader; the round-trip test overwrites it and that is
fine before the URL is shared.

- [ ] **Step 2: Run it to verify it fails**

```bash
npx playwright test e2e/roadmap-answers.spec.ts --project=chromium
```

Expected: all four FAIL with 404 — the route does not exist.

- [ ] **Step 3: Write the route**

Create `src/app/api/roadmap-answers/route.ts`:

```ts
import { NextResponse } from 'next/server';
import {
  ANSWER_FIELDS,
  EMPTY_ANSWERS,
  MAX_FIELD_LENGTH,
  readAnswers,
  writeAnswers,
  type Answers,
} from '@/lib/roadmapAnswers';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 20_000;

export async function GET() {
  try {
    return NextResponse.json(await readAnswers());
  } catch {
    return NextResponse.json({ error: 'Could not load answers' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Body too large' }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // Allowlist. Anything not in ANSWER_FIELDS is dropped here and never reaches
  // Contentful — this endpoint is public, so the body is untrusted input.
  const body = parsed as Record<string, unknown>;
  const answers: Answers = { ...EMPTY_ANSWERS };
  for (const field of ANSWER_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== 'string') {
      return NextResponse.json({ error: `${field} must be text` }, { status: 400 });
    }
    if (value.length > MAX_FIELD_LENGTH) {
      return NextResponse.json({ error: `${field} is too long` }, { status: 400 });
    }
    answers[field] = value;
  }

  try {
    await writeAnswers(answers);
  } catch {
    return NextResponse.json({ error: 'Could not save answers' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Run the tests**

```bash
npx playwright test e2e/roadmap-answers.spec.ts --project=chromium
```

Expected: 4 passed. Playwright's `webServer` runs `npm run dev`, which loads
`.env.local`, so the real token is in scope.

- [ ] **Step 5: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
```

```bash
git add src/app/api/roadmap-answers/route.ts e2e/roadmap-answers.spec.ts
git commit -m "Add roadmap answers API route with allowlist and length caps"
```

---

### Task 9: Wire section 9 to the store

**Files:**
- Create: `src/app/(standalone)/p/ajvt6e5hnk/_AnswersForm.tsx`
- Modify: `src/app/(standalone)/p/ajvt6e5hnk/page.tsx` (§9 only)
- Modify: `e2e/private-roadmap.spec.ts`

**Interfaces:**
- Consumes: `ANSWER_FIELDS`, `EMPTY_ANSWERS`, `MAX_FIELD_LENGTH`, `Answers` (types and constants only — no server functions) from `@/lib/roadmapAnswers`; `GET`/`POST /api/roadmap-answers`.
- Produces: default-exported `AnswersForm` (no props).

- [ ] **Step 1: Write the form**

Create `_AnswersForm.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import {
  EMPTY_ANSWERS,
  MAX_FIELD_LENGTH,
  type AnswerField,
  type Answers,
} from '@/lib/roadmapAnswers';

const QUESTIONS: { field: AnswerField; label: string }[] = [
  { field: 'liked', label: 'Which of the four sites in section 5 did you like, and what specifically — the layout, the photography, the tone?' },
  { field: 'disliked', label: 'Which one did you dislike? That is usually the more useful answer.' },
  { field: 'budget', label: 'What are you comfortable spending, upfront and per month? A range is fine.' },
  { field: 'maintenance', label: 'How much do you want to run yourself?' },
  { field: 'bilingual', label: 'Bilingual — yes or no, and which language?' },
  { field: 'idx', label: 'Have you asked your broker about IDX yet?' },
  { field: 'otherSite', label: 'Is there a site — realtor or not — whose feel you just like?' },
];

type Status = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

const STATUS_TEXT: Record<Status, string> = {
  loading: 'Loading your answers…',
  ready: '',
  saving: 'Saving…',
  saved: 'Saved. You can close this and come back to it later.',
  error: 'Something went wrong. Your answers are still in the boxes — try again.',
};

export default function AnswersForm() {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/roadmap-answers')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (cancelled) return;
        setAnswers(data.answers);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/roadmap-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {QUESTIONS.map(({ field, label }, index) => (
        <div key={field}>
          <label
            htmlFor={field}
            className="block text-[15px] font-medium leading-snug text-gray-900"
          >
            <span className="text-green-700">{index + 1}.</span> {label}
          </label>
          <textarea
            id={field}
            name={field}
            rows={3}
            maxLength={MAX_FIELD_LENGTH}
            value={answers[field]}
            disabled={status === 'loading'}
            onChange={(event) =>
              setAnswers((current) => ({ ...current, [field]: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-[17px] leading-relaxed text-gray-900 disabled:bg-gray-100"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={status === 'loading' || status === 'saving'}
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-green-700 px-5 font-medium text-white transition-[transform,background-color] duration-150 ease-out active:scale-[0.98] disabled:bg-gray-400 [@media(hover:hover)]:hover:bg-green-800"
      >
        {status === 'saving' ? 'Saving…' : 'Save my answers'}
      </button>

      {/* aria-live so the outcome reaches a screen reader, not just the eye. */}
      <p aria-live="polite" className="min-h-[24px] text-sm text-gray-600">
        {STATUS_TEXT[status]}
      </p>
    </form>
  );
}
```

`maxLength` on the textarea mirrors the server cap — it is a courtesy, not the
guard. The guard is in the route (Task 8), because a client cap is trivially
bypassed.

- [ ] **Step 2: Swap the question list for the form**

In `page.tsx`, add `import AnswersForm from './_AnswersForm';`, then replace §9's
`<Card>` containing the `<ol>` with:

```tsx
<Callout tone="note">
  <p>
    Whatever you type here is saved so you can close the page and come back to
    it.
  </p>
</Callout>

<AnswersForm />
```

Replace §9's opening paragraph — which said nothing is recorded — with:

```tsx
<p>
  Answer whatever you feel like answering and skip the rest. Half-answers are
  genuinely useful; a blank box tells me something too.
</p>
```

- [ ] **Step 3: Extend the page test**

Append to `e2e/private-roadmap.spec.ts`:

```ts
test('section 9 saves an answer and shows it again on reload', async ({ page }) => {
  const value = `the second one ${Date.now()}`;

  await page.goto(ROUTE);
  const field = page.locator('#liked');
  await expect(field).toBeEnabled();
  await field.fill(value);
  await page.getByRole('button', { name: 'Save my answers' }).click();
  await expect(page.getByText('Saved.')).toBeVisible();

  await page.reload();
  await expect(page.locator('#liked')).toHaveValue(value);
});
```

That last assertion is the requirement in David's own words: she closes the page,
comes back, and her answers are still there.

- [ ] **Step 4: Run everything**

```bash
npx playwright test e2e/private-roadmap.spec.ts e2e/roadmap-answers.spec.ts --project=chromium
```

Expected: 8 passed. The axe test now covers the form — every textarea has a
`<label htmlFor>`, so `label` and `form-field-multiple-labels` should stay clean.
If axe reports `color-contrast` on the disabled button, `bg-gray-400` with white
text is 2.8:1; use `bg-gray-500` (4.6:1).

- [ ] **Step 5: Typecheck, lint, build, commit**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

```bash
git add "src/app/(standalone)/p/ajvt6e5hnk/" e2e/private-roadmap.spec.ts
git commit -m "Wire section 9 answers form to the roadmap answers API"
```

---

### Task 10: Final verification

**Files:** none created or modified unless a check fails.

**Interfaces:**
- Consumes: the complete page from Task 6.
- Produces: nothing. This is the gate before handing the URL over.

The design pass already ran (`design`, `emil-design-eng`, `better-layout`) and its
outcomes are baked into Deviations 8–12 and the component code in Task 2. Do not
re-open those decisions here — verify them.

- [ ] **Step 1: Run the whole suite**

```bash
npx tsc --noEmit && npm run lint && npm run build && npx playwright test
```

Expected: clean typecheck, clean lint, a successful build, and the whole suite
green. In the build output `/p/ajvt6e5hnk` should still be static (`○`) — §9's
form is a client component, which does not opt the page into dynamic rendering —
while `/api/roadmap-answers` is dynamic (`ƒ`). If the page turned dynamic, a
server-only import leaked into the client tree; check `_AnswersForm.tsx` imports
only types and constants from `@/lib/roadmapAnswers`, never `readAnswers` or
`writeAnswers`.

- [ ] **Step 2: Confirm the arbitrary variants actually compiled**

`[@media(hover:hover)]:hover:bg-green-200` and `active:scale-[0.97]` are easy to
typo into silence — Tailwind emits nothing for a malformed variant and no tool
warns. Grep the built CSS:

```bash
grep -c "hover:hover" .next/static/css/*.css
```

Expected: at least 1. Zero means the variant did not compile — check the class
string against Deviation 10 before going further.

- [ ] **Step 3: Manual check at 390 x 844**

```bash
npm run dev
```

Open `http://localhost:3000/p/ajvt6e5hnk` at 390×844 and confirm:

- The fourth nav pill is visibly clipped by the right edge — that is the scroll
  affordance, and if all nine somehow fit, the row needs re-checking.
- Every pill scrolls its section to just below the sticky bar, with the numbered
  badge and heading fully visible and roughly 19 px of clearance.
- Pressing a pill visibly scales it; after releasing, it does **not** stay
  highlighted (that would mean the hover gate is not working).
- All four screenshots load, are sharp at the 3:2 crop, and each crop still shows
  the site's headline rather than cutting it mid-word.
- The license-bar crop in section 8 shows the DRE line and the Engel & Völkers
  header and nothing below it.
- No horizontal scroll anywhere on the page body.
- Section 9's boxes are tall enough to type into on a phone and the Save button
  is reachable without zooming. Type something, save, force-reload, and confirm
  it comes back — that is the whole point of the storage.

- [ ] **Step 4: Check 672 px and up**

Resize to 900 px wide. The column should centre at 536 px of content with the
sticky bar spanning the column, not the viewport. Nothing should stretch. Count
characters on a full prose line — it should land near 72, not 85.

Also confirm smooth scrolling is off: tap a pill and the page should jump, not
animate. If it animates, the `html:has(#roadmap-page)` rule did not apply.

- [ ] **Step 5: Screenshot and hand over**

Send David the 390 px screenshot and the four flagged items in
"Post-implementation notes" before he shares the URL.
## Post-implementation notes for David

Raise these when the branch is ready; none of them are in scope here.

- **`LinkButton` has the same contrast failure** this page worked around. `bg-green-600` with white text is 3.30:1, below WCAG AA. It ships on every blog post with a link-as-button paragraph. Worth a separate change.
- **Link previews will say "Inside DTs Brain".** OpenGraph tags are inherited from the root layout (Deviation 7). Two lines in this page's `metadata` would change that if he'd rather the preview be neutral.
- **`public/.DS_Store` is present but untracked** (`.DS_Store` is in `.gitignore`). Harmless, mentioned only so it isn't a surprise.
- **The management token reaches the whole Contentful account and cannot be narrowed.** Confirmed against the live UI (see Task 7): personal access tokens carry the same permissions across every space and organization the account can reach. The *endpoint* is bounded — one fixed entry, allowlisted fields, no entry creation — but the *credential* is not. Expiry is the only control; the current token expires 2027-08-26.
- **Revoke the token when the page is retired.** The closing sequence is three steps, not two: delete the `roadmapAnswersSingleton` entry, delete `src/app/api/roadmap-answers/`, and revoke the CMA token. Leaving an account-wide write token alive for a page that no longer exists is the avoidable part.
- **Deleting this later is two steps**, and worth doing when the conversation is over: delete the `roadmapAnswersSingleton` entry in Contentful, and delete `src/app/api/roadmap-answers/`. The spec's privacy model treats the page as temporary.
- **Screenshot staleness** is the accepted residual risk from the spec. The capture recipe lives in the spec's "Capture method" section if a site redesigns.
- **The focus ring stays blue.** `globals.css` sets `:focus-visible` to `2px solid #2563eb`, which clashes with the green pills. Left alone on purpose: blue on green is high contrast, and high contrast is what a focus ring is for. Recolouring it would trade an accessibility property for a cosmetic one.
- **The site-wide `prefers-reduced-motion` gap is still open.** `globals.css` has no `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }`. This page no longer smooth-scrolls at all (Deviation 17), so it is unaffected, but every other page is. Three lines, worth doing separately.
