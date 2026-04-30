# Blog Custom Components Design

**Date:** 2026-04-30
**Status:** Approved (pending user review of this document)

## Background

The blog (`/blog/tag/projects` and individual post pages) renders Contentful Rich Text via `src/components/shared/RichTextRenderer.tsx`. The renderer currently handles standard blocks and embedded *assets* but has no handler for embedded *entries* (custom content components).

This spec covers three new components that can be embedded in any blog post body, motivated by an upcoming long-form project writeup but designed for reuse across all posts:

1. **Table of Contents** — collapsible inline TOC at the top of opted-in posts
2. **Graph Tree** — collapsible nested step-by-step component (initially used for prompt iteration workflows, but reusable for any sequential graph)
3. **Image Grid** — multi-image side-by-side block with per-image captions

## Goals

- Provide reusable, authorable components that can appear in any post body via Contentful embedded entries
- Maintain visual consistency with the existing blog (light theme, prose styling, the existing `▶ ▼` collapsible pattern)
- Work responsively across desktop, tablet, and mobile without separate component variants
- Add no test suite (project has none today); rely on type-checking, lint, and manual verification

## Non-Goals

- Refactoring `RichTextRenderer` beyond what these features require
- Adding a sidebar TOC variant (inline-only, by user choice)
- Supporting nested Graph Trees (single-level wrapper only — A1 from brainstorming)
- Rich-text content inside Graph Tree step bodies (plain monospace text only — 3b from brainstorming)
- Test infrastructure setup
- Changes to the `/blog/tag/projects` page itself (these components live in the post body, not the tag listing)

## Architecture Overview

```
Contentful post body (Rich Text)
        │
        ├─► extractHeadings(body)  ─► <TableOfContents headings={...} />
        │
        └─► <RichTextRenderer content={body}>
                ├─ headings get id attrs (so anchors work)
                └─ embedded entries dispatch:
                     graphTree → <GraphTree ... />
                     imageGrid → <ImageGrid ... />
```

Five layers, each with one clear job:

1. **Contentful content models** (data) — 1 added field + 4 new models
2. **Heading extraction helper** (`src/lib/extract-headings.ts`) — pure function over the Rich Text document
3. **Rendering layer** (`RichTextRenderer.tsx`) — adds heading ids; routes embedded entries by `contentTypeId`
4. **Components** (`src/components/blog/*`) — `TableOfContents`, `GraphTree` (+`GraphTreeStep`), `ImageGrid`
5. **Post page** (`src/app/(main)/blog/[slug]/page.tsx`) — invokes extraction; conditionally renders TOC

## Contentful Content Models

### Modified — `blogPost`

Add one field:

| Field ID | Type | Required | Default | Notes |
|---|---|---|---|---|
| `showTableOfContents` | Boolean | No | `false` | Enables the inline TOC at the top of the post |

### New — `graphTree`

Outer collapsible wrapper.

| Field ID | Type | Required | Notes |
|---|---|---|---|
| `title` | Short text | No | Defaults to `"Graph Tree"` if blank |
| `steps` | References (many) → `graphTreeStep` | Yes | Order in Contentful = render order |

### New — `graphTreeStep`

A single step. Unified type per the B2 decision: a body makes the step expandable; no body makes it a label-only row.

| Field ID | Type | Required | Notes |
|---|---|---|---|
| `label` | Short text | Yes | Step name shown in the row |
| `body` | Long text (plain) | No | If present → expandable, monospace block. If empty → label-only row, no ▶, no click affordance |

### New — `imageGrid`

Multi-image side-by-side block.

| Field ID | Type | Required | Notes |
|---|---|---|---|
| `columns` | Integer | Yes | Allowed: `2`, `3`, or `4` (Contentful field validation). Treated as a *cap* — see effective-column logic below |
| `items` | References (many) → `imageGridItem` | Yes | Ordered |

### New — `imageGridItem`

| Field ID | Type | Required | Notes |
|---|---|---|---|
| `image` | Media (single image asset) | Yes | The image |
| `caption` | Short text | No | Small grey text below image. Omitted from output if empty |
| `alt` | Short text | No | Accessibility alt. Fallback chain: `alt` → `caption` → `image.fields.title` → `''` |

## Component Specifications

### TableOfContents

**File:** `src/components/blog/TableOfContents.tsx` (`'use client'`)

**Props:**
```ts
type HeadingNode = {
  id: string;        // slugified, matches the id rendered on the heading
  text: string;
  level: 2 | 3 | 4;
};

interface TableOfContentsProps {
  headings: HeadingNode[];
}
```

**Behavior:**
- Returns `null` if `headings.length === 0`
- Outer `<details>` element (collapsed initially) → ▶ when closed, ▼ when open. Native `<details>`/`<summary>` provides toggle + keyboard accessibility for free.
- Inner content: nested `<ul>` tree built from the flat array (helper `buildHeadingTree`). H2 = top level; H3 nests one deeper; H4 nests another deeper.
- Each item is `<a href="#${id}">` — uses native anchor jumps. CSS `scroll-behavior: smooth` (already standard browser behavior, applied at html level if needed) handles smoothness without JS.

**Placement:** In `src/app/(main)/blog/[slug]/page.tsx`, between `<header>` and `<div className="prose">`, conditional on `showTableOfContents === true && headings.length > 0`.

**Responsive:**
- Width follows the article column at all breakpoints
- Mobile: indent reduced (`pl-6` → `pl-4` on `<sm`) to save horizontal space
- Long heading text wraps; no horizontal page scroll

### GraphTree + GraphTreeStep

**Files:**
- `src/components/blog/GraphTree.tsx` (`'use client'`)
- `src/components/blog/GraphTreeStep.tsx` (`'use client'`)

**Props:**
```ts
interface GraphTreeProps {
  title?: string;          // defaults to "Graph Tree"
  steps: GraphTreeStepEntry[];
}

interface GraphTreeStepProps {
  label: string;
  body?: string;
  isLast: boolean;         // suppresses trailing arrow
}
```

**Visual structure:**

```
Collapsed:
┌──────────────────────────────────┐
│ ▶ Graph Tree                     │
└──────────────────────────────────┘

Expanded with one step expanded:
┌──────────────────────────────────┐
│ ▼ Graph Tree                     │
│   ┌──────────────────────────┐   │
│   │ ▼ user prompt            │   │
│   │   <pre>prompt body…</pre>│   │  monospace, preserved whitespace
│   │              [Copy]      │   │
│   └──────────────────────────┘   │
│              ↓                   │  arrow connector (suppressed after last)
│   ┌──────────────────────────┐   │
│   │   created PRD            │   │  label-only step (no ▶)
│   └──────────────────────────┘   │
│              ↓                   │
│   ...                            │
└──────────────────────────────────┘
```

**Implementation notes:**
- Wrapper and expandable steps use native `<details>`/`<summary>` — no `useState`
- Label-only steps use a `<div>` so there's no clickable affordance
- Arrows are sibling elements between step rows; the `isLast` prop on the final step suppresses its trailing arrow
- Body block: `<pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 ... overflow-x-auto">` — wraps soft line breaks but allows horizontal scroll for unbreakable long lines
- Copy button uses `navigator.clipboard.writeText(body)`. Shows a transient "Copied!" state on success.

**Responsive:**
- Desktop (≥1024px): Full article-column width. Copy button floats top-right of body block.
- Tablet (640–1023px): Same layout, slightly reduced padding (`p-4` → `p-3`).
- Mobile (<640px): Long prompt content wraps; ASCII-art-style content scrolls horizontally inside the body box (not the page). Copy button moves below the prompt as a full-width row to avoid overlapping the text. Arrow connectors shrink (`text-lg` → `text-base`) and connector vertical spacing tightens.

### ImageGrid

**File:** `src/components/blog/ImageGrid.tsx` (server component)

**Props:**
```ts
interface ImageGridProps {
  columns: 2 | 3 | 4;
  items: ImageGridItemEntry[];
}
```

**Effective column logic:**
- `effective = min(columns, items.length)` — `columns` is a cap, not a fixed value
- Single image (`items.length === 1`): bypass the grid; render as a centered `<figure>` with `max-w-2xl mx-auto` so it doesn't stretch awkwardly

**Implementation:**
- CSS Grid via Tailwind: `grid gap-4 md:gap-6`
- Tailwind dynamic-class problem solved with a static map (so JIT detects the classes literally):
  ```tsx
  const columnClass = {
    2: 'sm:grid-cols-2 md:grid-cols-2',
    3: 'sm:grid-cols-2 md:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[effectiveColumns];
  ```
- Each item: `<figure>` with `<Image>` + optional `<figcaption className="text-sm text-gray-500 text-center mt-2">`
- `<Image>` `width`/`height` from `image.fields.file.details.image` (matches existing `EMBEDDED_ASSET` pattern)
- `sizes` attribute scales with effective column count: `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${100 / effectiveColumns}vw`

**Responsive (per C2 from brainstorming, with cap applied):**
- Mobile (<640px): 1 column always
- Tablet (640–1023px): `min(2, items.length)` across
- Desktop (≥1024px): `min(columns, items.length)` across

## RichTextRenderer Changes

Two surgical additions to `src/components/shared/RichTextRenderer.tsx`:

### 1. Heading id attributes

Every `H2`/`H3`/`H4` rendered through the renderer gets `id={slugify(getPlainText(node))}` so TOC anchors land. `H1`/`H5`/`H6` skipped (not surfaced in TOC).

```tsx
[BLOCKS.HEADING_2]: (node, children) => (
  <h2 id={slugify(getPlainText(node))} className="...">{children}</h2>
),
```

Helpers:
- `slugify(text)` — lowercase, replace non-alphanumerics with `-`, collapse repeats, trim. Lives in `src/lib/utils.ts`.
- `getPlainText(node)` — walks the node's children and concatenates text content. Co-located in `src/lib/extract-headings.ts` (used by both the renderer and the extractor for consistent slugs).

### 2. Embedded entry dispatch

```tsx
[BLOCKS.EMBEDDED_ENTRY]: (node) => {
  const entry = node.data.target;
  const contentTypeId = entry.sys.contentType.sys.id;

  switch (contentTypeId) {
    case 'graphTree':
      return <GraphTree title={entry.fields.title} steps={entry.fields.steps} />;
    case 'imageGrid':
      return <ImageGrid columns={entry.fields.columns} items={entry.fields.items} />;
    default:
      return null;
  }
},
```

Unknown entry types render `null` (defensive — avoids crashes on partial Contentful states or content models that haven't been wired into the renderer yet).

## Heading Extraction Helper

**File:** `src/lib/extract-headings.ts`

**Public API:**
```ts
export function extractHeadings(document: Document): HeadingNode[];
export function buildHeadingTree(headings: HeadingNode[]): HeadingTreeNode[];
```

**Algorithm:**
- Walk the document's top-level `content[]` array
- For nodes with type `heading-2` / `heading-3` / `heading-4`: extract plain text, slugify, push to result with the corresponding `level`
- **Slug deduplication:** maintain a `Set<string>` of seen slugs. On collision, append `-2`, `-3`, etc. The renderer uses the same slugify function on the same text, so collision handling must be deterministic — for v1, the renderer doesn't dedupe, meaning duplicate headings would have duplicate ids. This is acceptable for the project post (no duplicate headings) but flagged as a known v1 limitation; if it bites, the renderer would need to thread a counter or the extraction-side dedupe would need to drive the rendered ids.

**Note on the dedupe limitation:** If two H2s have the same text in a post, both render with the same id (browser jumps to the first). For v1 we accept this. A future enhancement would either (a) move slug generation server-side and pass a `slug→nodeId` map into the renderer, or (b) rename one of the duplicate headings.

## File Layout

**New files:**
```
src/
├── components/blog/
│   ├── TableOfContents.tsx       (client)
│   ├── GraphTree.tsx             (client)
│   ├── GraphTreeStep.tsx         (client)
│   └── ImageGrid.tsx             (server)
└── lib/
    └── extract-headings.ts       (extractHeadings + buildHeadingTree + getPlainText)
```

**Modified files:**
```
src/
├── components/shared/
│   └── RichTextRenderer.tsx      (heading ids + EMBEDDED_ENTRY dispatch)
├── lib/
│   ├── contentful.ts             (raise include depth on getPostBySlug)
│   ├── types.ts                  (new entry types)
│   └── utils.ts                  (slugify helper)
└── app/(main)/blog/[slug]/page.tsx (extract headings, conditionally render TOC)
```

**Contentful include depth:** `getPostBySlug` needs `include: 3` minimum to resolve `graphTree → steps → graphTreeStep` and `imageGrid → items → imageGridItem → image (asset)`.

**Type additions in `src/lib/types.ts`:**
```ts
export type GraphTreeStepEntry = Entry<{ label: string; body?: string }>;
export type GraphTreeEntry = Entry<{ title?: string; steps: GraphTreeStepEntry[] }>;
export type ImageGridItemEntry = Entry<{
  image: ContentfulAsset;
  caption?: string;
  alt?: string;
}>;
export type ImageGridEntry = Entry<{
  columns: 2 | 3 | 4;
  items: ImageGridItemEntry[];
}>;
```

## Verification Plan

No automated tests are added — the project has no existing test suite (`package.json` scripts: `dev`, `build`, `start`, `lint`). Verification is manual + type/lint checks.

### Per-component manual checklist

**TableOfContents:**
- [ ] Post with `showTableOfContents = true` → TOC renders above body
- [ ] Flag false/unset → no TOC
- [ ] Starts collapsed; ▶ → ▼ on click
- [ ] H2/H3/H4 indent correctly
- [ ] Each link scrolls to the right section (heading id matches anchor)
- [ ] Empty headings (flag on, no headings in post) → renders nothing
- [ ] Mobile: long heading text wraps without horizontal page scroll

**GraphTree:**
- [ ] Outer wrapper collapsed by default; ▶ → ▼ toggles
- [ ] Step with body → expandable, ▶ visible, monospace prompt block on expand
- [ ] Step without body → label only, no ▶, no click affordance
- [ ] Arrows render between steps, suppressed after final step
- [ ] Copy button copies prompt body to clipboard; transient "Copied!" feedback
- [ ] Mobile: long prompts wrap; very long unbreakable lines scroll horizontally inside the body box only
- [ ] Mobile: copy button below prompt instead of overlapping

**ImageGrid:**
- [ ] 1 image → centered, constrained `max-w-2xl`
- [ ] 2 images, columns=3 → 2 across (cap behavior)
- [ ] 3 images, columns=3 → 3 across desktop, 2 across tablet, 1 mobile
- [ ] 4 images, columns=4 → 4 across desktop (`lg`), 2 across tablet, 1 mobile
- [ ] Captions render below images when present, omitted when absent
- [ ] Alt fallback chain works: `alt` → `caption` → `image.fields.title` → `''`

### Cross-component verification

- [ ] Author the project post in Contentful using all three components
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (catches type errors and Tailwind class issues)
- [ ] Manual browser check at desktop / tablet (~768px) / mobile (~375px)

### Risks

- **Tailwind dynamic classes** — `grid-cols-2/3/4` etc. must appear literally in the static map so JIT detects them. Build will catch missing classes.
- **Contentful include depth** — too shallow → unresolved references (entries appear as `{ sys: { id }}` stubs). Will raise `include` to 3 in `getPostBySlug`.
- **Heading id collisions** — two headings with identical text produce identical slugs. v1 limitation; documented above.

## Open Questions / Future Enhancements

- Slug deduplication across server extraction and renderer (see Heading Extraction Helper note)
- Optional sticky-sidebar TOC variant for desktop (deferred; current inline pattern works at all breakpoints)
- Optional rich-text bodies inside Graph Tree steps (deferred; current plain-text/monospace approach matches the prompt-iteration use case)
