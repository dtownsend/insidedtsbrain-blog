# Private Realtor Roadmap Page — Design Spec

**Date:** 2026-08-25
**Status:** Approved for planning; **amended 2026-08-25** — §9 now collects answers (see "Privacy model")
**Author:** David Townsend (with Claude)

## Summary

A single, unlisted, mobile-first page on `insidedtsbrain.com` that lays out the
steps for a Bay Area realtor to establish a professional web presence: domain,
email, website platform, examples to react to, and the compliance obligations
that come with a real estate site.

The page exists to have a conversation. David shares the URL directly with one
reader (referred to below as "the reader"); nobody else is meant to find it.

**Amended:** §9 now collects the reader's answers through a form and stores them,
so both parties can read them back on the page. The page is no longer a static
document and no longer free of personal information. See "Privacy model".

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
- ~~**No persistence.**~~ **Superseded 2026-08-25.** §9 collects answers via a
  form, POSTs them to an API route, and stores them so both parties can read
  them back. Everything outside §9 remains static and stateless.
- **No Contentful.** The content is hardcoded in the repo. This is one page for
  one reader; a new content type is not worth the ceremony.
- **No collapsibles.** Every section renders expanded.
- **Minimal JS.** §9 is the only client component on the page. Sections 1–8 ship
  no JavaScript of their own.
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
to build a link preview.

**That trigger has now fired**, and David revisited it on 2026-08-25. His framing,
recorded because it is what the decision rests on: this is a temporary
illustration page for two people, showing what a proper realtor site needs. It
is not a data collection, and is not expected to carry personal information.

The revised model, with the tradeoff stated:

- **Answers are readable and writable by anyone holding the URL.** No passcode,
  no login. A shared-passcode option and an owner-only-read option were both
  offered and declined in favour of simplicity. Deliberate, not an oversight.
- **Blast radius is bounded at the endpoint.** The API route writes to one fixed
  entry ID, accepts only an allowlisted set of fields with per-field length caps,
  and can never create entries or reach any other content. The worst case is that
  the one record gets overwritten.
- **Answers stay out of the published space.** The entry is never published;
  both read and write go through the Management API. They therefore cannot
  surface in any Delivery API query the blog makes.
- **§1 says so in plain words.** The reader is told, in the first thing she
  reads, that the page is unlisted but "not secure" and that nothing personal
  should go in it, plus an offer to build something properly secured if she
  proceeds. §9 repeats that her answers are saved and will still be there when
  she comes back.

  An earlier version of this spec required the "anyone with the link can read
  this" warning to sit in §9, at the point of entry, on the grounds that a
  warning 12,000 px earlier is a warning she will not look at. **Amended
  2026-08-26:** it lives in §1 instead. The substance is unchanged and it is the
  first thing on the page rather than the last, which for a document read once,
  top to bottom, is a defensible place for it. The residual risk is a reader who
  jumps straight to §9 from the contents grid and never sees §1.
- **The trigger is reset, not removed.** §9 asks about budget, so the page will
  hold something once she answers. If it ever collects a phone number, an email
  address, a document, or anything a stranger could act on, this decision gets
  revisited rather than inherited. The page being temporary, the natural end
  state is deleting the entry and the route when the conversation is done.

## Storage

One Contentful entry, read and written through the Management API.

| Decision | Choice | Why |
|----------|--------|-----|
| Store | Contentful, space already in use | No new vendor, and David can read and edit the answers in the Contentful web app he already knows |
| Shape | One fixed entry, `roadmapAnswersSingleton`, of a new `roadmapAnswers` content type | A singleton cannot grow unbounded; a public endpoint that can only overwrite one record has a bounded blast radius |
| Published? | **No.** Draft only | Read and write both go through the CMA, so the answers never enter the Delivery API and cannot leak into blog queries. It also sidesteps CDN caching — a draft read is always fresh, which is what "she comes back and sees her answers" needs |
| Credential | `CONTENTFUL_MANAGEMENT_TOKEN`, server-side only | Never `NEXT_PUBLIC_`. Currently a placeholder in `.env.local`; must be created before this works |
| Fields | 7 long-text fields, allowlisted, 2000 chars each | Matches the seven questions in §9 |

Persistence is server-side rather than `localStorage` because the requirement is
that she can close the page, come back — including on another device — and still
see what she wrote. `localStorage` cannot do that.

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

### 6. Getting found
SEO fundamentals, social profiles, and brokerage / professional network
listings pointing back at the domain.

### 7. Compliance
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
  accessibly. Worth asking a professional about before launch.

**Amended 2026-08-26 — no legal disclaimer.** An earlier version of this spec
required the section to be framed explicitly as "not legal advice", and the page
carried a line saying so. David removed it: this is an informal document written
to a friend who knows he is not a lawyer and is not selling her a professional
service. A disclaimer between two people in that relationship is ceremony, not
protection. The section now opens "From what I understand, these are things
strongly recommended to have on your website" — which hedges the confidence
without pretending to a formality the document does not have. Individual items
still say "ask your broker" where that is the actual next step.

### 8. What happens next
**Amended 2026-08-25.** This was §6, "Building the site", sitting between the
platform options and Getting found. It asked the reader to settle page structure
and lead capture before she had chosen a platform — a decision she has no basis
to make at that point in the document. Moved here and reframed as the step after
the conversation, so it answers "what happens if I reply?" rather than demanding
an answer.

- Layout and what pages the site actually needs.
- Lead capture and where captured leads go. Both Luxury Presence sites use
  persistent floating call/email buttons; that pattern is worth showing as the
  concrete default rather than describing abstractly.

The **bilingual decision** that lived here is deleted rather than moved: it is
already a question in §9, which is where the reader answers things. It stays a
§9 question even though it constrains the platform choice, because she cannot
answer it usefully until she has seen §4 and §5 anyway.

§9 stays last so the answers form is the final thing on the page.

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
- **`ruthkrishnan.com` opens on an 88-second background video**, not a static
  hero, with an oversized "OVER A BILLION DOLLARS IN SALES" overlay that the
  site itself clips at both edges. Naive capture catches the overlay mid-clip and
  reads as a broken screenshot. Its hero section is also only 279 CSS px tall, so
  the 520 px crop legitimately includes the section beneath it — that is what the
  page looks like on a phone and is kept.

### Capture method

Local Playwright (already a devDependency), Chromium, viewport 390x844 at
`deviceScaleFactor: 3`, mobile UA. Wait for `document.fonts.ready` plus a settle
delay, hide consent banners by CSS, screenshot, crop to the top 520 CSS px hero
band, encode WebP q82. Result: 1170x1560 each, ~384 KB for all four. The capture
script was throwaway and is not committed; this paragraph is the reproduction
recipe if a site redesigns.

Two things that cost time and are worth not rediscovering:

- **Do not pause a background video to get a deterministic frame.** Pausing makes
  Chromium render native video controls over the hero, which is worse than the
  problem being solved. Let it play and capture several candidate frames instead.
- **Only consent banners get hidden, never site content.** Hiding a cookie banner
  removes a browser-level interruption; hiding a site's own headline would
  misrepresent their design. `ruthkrishnan.com` was solved by frame selection,
  not by hiding its overlay.

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
