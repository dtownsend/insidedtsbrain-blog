# Private Realtor Roadmap Page — Design Spec

**Date:** 2026-08-25
**Status:** Approved for planning
**Author:** David Townsend (with Claude)

## Summary

A single, unlisted, mobile-first page on `insidedtsbrain.com` that lays out the
steps for a Bay Area realtor to establish a professional web presence: domain,
email, website platform, examples to react to, and the compliance obligations
that come with a real estate site.

The page exists to have a conversation. David shares the URL directly with one
reader (referred to below as "the reader"); nobody else is meant to find it. It
is a static document — no accounts, no forms, no data collected, no personal
information exchanged.

## Goals

- One URL David can text to one person, readable on a phone in one sitting.
- Present the platform decision fairly enough that the reader can actually
  choose, rather than being steered.
- Show four real Bay Area realtor sites as concrete reference points.
- Surface the compliance obligations early, while the platform is still an open
  question — they constrain the choice.
- End with a clear prompt for the reader's own thoughts, answered off-page.

## Non-goals

- **No authentication.** Privacy is an unguessable URL plus `noindex`. See
  "Privacy model" for what that does and does not buy.
- **No persistence.** No checkboxes, no saved notes, no localStorage, no API
  route, no database. The reader replies to David directly.
- **No Contentful.** The content is hardcoded in the repo. This is one page for
  one reader; a new content type is not worth the ceremony.
- **No interaction.** Every section renders expanded. No collapsibles, no JS
  beyond what Next ships by default.
- **English only.** (The page *asks* whether her future site should be
  bilingual; the page itself is not.)
- **No site chrome.** No header, no footer, not in `NAV_ITEMS`.

## Privacy model

The route lives at `/p/ajvt6e5hnk` — ten characters from a 31-symbol alphabet
(lowercase alphanumerics with `0/o/1/l/i` removed), roughly 48 bits of entropy.
Not enumerable.

Four things keep it unlisted, verified against the current repo:

1. Page-level `metadata.robots` sets `index: false, follow: false, nocache: true`,
   overriding the `index: true` in `src/app/layout.tsx`.
2. There is no `sitemap.xml` and no `robots.txt` in the repo, and no `public/`
   directory at all — nothing enumerates routes.
3. `src/app/feed.xml/route.ts` emits only Contentful posts under `/blog/`. A
   hardcoded page cannot appear in it.
4. It is not added to `NAV_ITEMS` in `src/lib/constants.ts` and is not linked
   from any page.

**Accepted exposure, stated so it is a decision and not a surprise:** the URL
appears in Vercel build output and in the reader's browser history, and any
messaging platform she pastes it into (iMessage, Slack, WhatsApp) will fetch it
to build a link preview. This is acceptable because the page holds no personal
or sensitive information. If that ever changes, the privacy model must change
with it — this is the trigger to revisit.

## Route and files

The `(standalone)` route group has no `layout.tsx` of its own, so it inherits
`src/app/layout.tsx` directly and renders without Header or Footer. This is the
same mechanism `/cv` already uses.

| Path | Purpose |
|------|---------|
| `src/app/(standalone)/p/ajvt6e5hnk/page.tsx` | Metadata, page shell, sticky nav, all nine sections as JSX |
| `src/app/(standalone)/p/ajvt6e5hnk/_components.tsx` | `Section`, `Card`, `Callout`, `SiteCard` |
| `public/roadmap/*.webp` | Four site screenshots, already captured (creates `public/`) |
| `e2e/private-roadmap.spec.ts` | `noindex` assertion + axe scan |

**Deliberate convention break:** components are colocated under the route rather
than placed in `src/components/`, which is where blog components live. Nothing
here is reusable, and a one-off should not enter the shared tree. The `_` prefix
is Next.js's private-folder convention and guarantees the file is never routed.

Only the four example sites are modelled as data (a typed array — uniform
shape, four instances). Every other section is written as JSX. Forcing sections
with genuinely different shapes through a single content schema would cost more
than it saves.

## Page structure

A sticky top bar holds horizontally-scrolling anchor pills, one per section.
Pure CSS (`position: sticky`, `overflow-x: auto`, `scroll-behavior: smooth`)
and native `#anchor` links — no `'use client'`, no event handlers, no custom
JavaScript. This is the only concession to a long scroll, and it is the one that
matters on a phone.

Sections render in this order, each with an `id` for the anchor:

### 1. Intro
What this document is, that it is private, and that the last section is hers.
Sets the expectation that decisions 2–4 unlock everything after them.

### 2. Domain name
- Create a Cloudflare account — why Cloudflare (registrar-at-cost, DNS in the
  same place, no upsell funnel).
- Choose and register the domain — what makes a good realtor domain, what to
  avoid, why to grab it before committing to a platform.

### 3. Professional email
Google Workspace on the new domain: cost, the setup path, and why a
`@gmail.com` address undercuts a listing presentation.

### 4. Website platform options
Four cards, each with what it's good at and what it costs in time or money:
- **Squarespace / Wix** — easiest path, real templates, least control.
- **WordPress + a real estate theme** — most flexible, most maintenance,
  security and update burden is hers.
- **Realtor-specific platforms** — Placester, Luxury Presence, Sierra
  Interactive, each linked. Carries a **callout** that these are ongoing monthly
  subscriptions and meaningfully more expensive than the alternatives.
- **Custom build** — most control, higher upfront cost, lower long-run cost,
  needs someone to maintain it.

Each card names which of the §5 examples is built that way, and links to it.
The section is written against the evidence in "Field findings" below — in
particular, that none of the four sites she admires uses Squarespace/Wix, and
none is a custom build. That is a real signal and the page should say so plainly
rather than presenting four options as equally represented in the wild.

### 5. Bay Area examples
Four `SiteCard`s, each a mobile hero screenshot, the site name, one line on why
it's here, **the platform it is actually built on**, and a full-width tap target
to open it. Naming the stack is what ties this section back to §4 — it turns an
abstract list of tradeoffs into four worked examples.

The "why it's here" lines are David's own read, not verified market data, and are
phrased as opinion. Where a site makes a claim about itself, the page attributes
it to the site rather than repeating it as fact.

| Site | Built on | Why it's here |
|------|----------|---------------|
| `ruthkrishnan.com` | WordPress (nginx / PHP / Plesk) | The site claims "#1 ranked San Francisco real estate agents (per MLS)" — attributed as their claim |
| `kinokorealestate.com` | Luxury Presence | Polished and seller-focused; heavy display type |
| `siliconvalleyandbeyond.com` | WordPress (Site Kit by Google) | The Silicon Valley benchmark; brokerage-affiliated |
| `pacificedgesf.com` | Luxury Presence | Built around the agents' personality; leads with awards |

### 6. Building the site
- Layout and what pages the site actually needs.
- **Bilingual decision** — whether to run a second language and which; this
  affects platform choice, so it belongs before she commits.
- Lead capture and where captured leads go. Both Luxury Presence sites use
  persistent floating call/email buttons; that pattern is worth showing as the
  concrete default rather than describing abstractly.

### 7. Getting found
SEO fundamentals, social profiles, and brokerage / professional network
listings pointing back at the domain.

### 8. Compliance
Promoted out of "next steps" into its own section: these are the highest-stakes
items on the page, several constrain the platform choice, and one carries real
legal exposure.
- **IDX / MLS** — whether her brokerage permits displaying listings, and what
  the platform must support if so.
- **Fair Housing** and **Equal Housing Opportunity** logos; the Realtor® mark
  if she is a NAR member.
- License number and brokerage info in the sitewide footer.
  `siliconvalleyandbeyond.com` puts "DAWN THOMAS | DRE# 01460529" in a bar above
  the header, with Engel & Völkers branding co-equal to her own mark. Show this
  screenshot detail — it answers "what does this actually look like" in one image.
- Privacy policy, terms of use, cookie/consent banner.
- **Accessibility (WCAG 2.1 AA)** — real estate sites are a frequent ADA
  litigation target. Two of the four example sites ship a third-party
  accessibility *overlay widget*. The page should note that these overlays are
  widely criticised, do not by themselves make a site conformant, and have not
  reliably prevented claims — they are not a substitute for building the site
  accessibly. Framed as "worth asking a professional about", not as legal advice.

### 9. Your thoughts
A clearly marked section with prompting questions — which examples she liked
and why, budget comfort, how much she wants to maintain herself, the bilingual
question — and an explicit instruction to reply to David directly. Nothing on
this page records an answer.

## Component contracts

| Component | Props | Responsibility |
|-----------|-------|----------------|
| `Section` | `id`, `number`, `title`, `children` | Anchor target, numbered badge, heading, consistent vertical rhythm |
| `Card` | `title`, `children` | Bordered sub-step block inside a section |
| `Callout` | `tone`, `children` | Set-apart note; used for the subscription-cost warning and compliance emphasis |
| `SiteCard` | `name`, `href`, `note`, `image` | Screenshot, name, one-line note, whole-card link |

Each is presentational, takes no state, and can be read in isolation.

## Styling

Mobile-first, designed at 390 px, `max-w-2xl` centered so desktop is not broken.
Roughly 17 px body text with generous line height, numbered step badges, and a
minimum 44 px tap target on every link.

Reuses the blog's existing green accent so the page reads as coming from David.
The tokens already in the repo, to be used as-is:

| Use | Classes |
|-----|---------|
| Primary action / link button | `bg-green-600 text-white hover:bg-green-700` (matches `LinkButton` in `RichTextRenderer.tsx`) |
| Inline accent text | `text-green-600` |
| Soft chip / badge | `bg-green-100 text-green-800 border-green-200` |

Screenshots render through `next/image` with explicit `width`/`height`, a
`sizes` value tuned for mobile, and lazy loading below the fold.

## Verification

- `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean.
- New `e2e/private-roadmap.spec.ts`:
  - the route returns 200;
  - its robots meta contains `noindex`;
  - axe reports zero violations. The page recommends WCAG 2.1 AA in §8 and
    should meet it.
- Manual: Chrome at 390x844, screenshot to David before commit.

## Field findings (captured 2026-08-25)

All four sites were loaded and captured before this spec was finalised, so §4,
§5, §6 and §8 are written against evidence rather than assumption.

- **All four reachable, none bot-blocked.** The `__cf_bm` cookies on the two
  Cloudflare sites are standard bot-management cookies set on every request, not
  a challenge.
- **Stacks:** two WordPress (`ruthkrishnan.com` — nginx/PHP/Plesk;
  `siliconvalleyandbeyond.com` — Site Kit by Google plugin) and two Luxury
  Presence (`kinokorealestate.com`, `pacificedgesf.com`). **No Squarespace/Wix
  and no custom builds among the four.**
- `ruthkrishnan.com` serves `x-powered-by: PHP/7.4`, which reached end-of-life in
  November 2022. Used in §4 to make the WordPress maintenance burden concrete
  rather than theoretical.
- **Consent banners** on `kinokorealestate.com` and `pacificedgesf.com`. For
  capture these were hidden via CSS, *not* dismissed by clicking "Accept" — no
  consent was given on anyone's behalf.
- Both Luxury Presence sites carry third-party accessibility overlay widgets and
  floating call/email buttons.

### Capture method

Local Playwright (already a devDependency), Chromium, viewport 390x844 at
`deviceScaleFactor: 3`, mobile UA. Wait for `document.fonts.ready` plus a settle
delay, hide consent banners by CSS, screenshot, crop to the top 520 CSS px hero
band, encode WebP q82. Result: 1170x1560 each, 315 KB for all four. The capture
script was throwaway and is not committed; this paragraph is the reproduction
recipe if a site redesigns.

## Risks

**Screenshot capture is resolved** — 4/4 succeeded, no link-only fallbacks
needed. The residual risk is staleness: these sites will redesign, and the
screenshots will silently drift out of date. Acceptable for a document with one
reader and a short useful life.

**Screenshots are 1170 px wide**, which is roughly 1.85x at the page's 632 px
maximum content width — slightly under true 2x. Not worth re-capturing; the
images are reference thumbnails and the reader taps through to the live site.

**Repo gains a `public/` directory** for the first time. Four WebP files totalling
315 KB; no build configuration change required.

## Open questions

None blocking. Copy is written at implementation time against the section
outline above.
