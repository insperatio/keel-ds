---
component: AppShell
source: src/components/ui/app-shell.tsx
import: "@/components/ui/app-shell"
exports: [AppShell, PageHeader, SidebarNav, BrandLogo]
variants: []
sizes: []
defaults: {}
---

# App shell

The frame every page sits in: a header with the brand and top navigation, an optional sidebar,
and the page's own `h1` underneath.

## Use it when

- Any page of a signed-in product. One `AppShell` wraps the whole app; one `PageHeader` opens
  each page inside it.

## Use something else when

- The page is a marketing page or a sign-in screen with no navigation. Use a plain layout.
- You need a second heading inside the page. That's a [Card](card.md) title or a section
  heading, not another `PageHeader`.

## Import

```tsx
import { AppShell, PageHeader, SidebarNav } from '@/components/ui/app-shell'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `AppShell` | yes | The frame. Renders the skip link, header, drawer and main region |
| `PageHeader` | yes | The page's one `h1`, with optional description and actions |
| `SidebarNav` | no | Section navigation within the page, passed as `sidebar` |
| `BrandLogo` | no | The default mark; pass `logo` to replace it |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `topNav` | `NavLink[]` | `[]` | Two to five top-level destinations. Collapses into the drawer on small screens |
| `topNavLabel` | string | `'Main'` | Names the navigation for screen readers; say what it navigates |
| `actions` (AppShell) | ReactNode | — | Header controls: search, account, mode switch |
| `sidebar` | ReactNode | — | Usually a `SidebarNav`. Omit for pages that don't need one |
| `title` (PageHeader) | string | — | Becomes the page's `h1` |
| `overline` | string | — | Small label above the title, e.g. the section the page belongs to |
| `actions` (PageHeader) | ReactNode | — | Page-level actions; the primary one goes last |

## Rules

Each rule is one line with a **why**, so a case this file doesn't name can still be judged.

1. **One `PageHeader` per page, and it holds the only `h1`.**
   Why: the `h1` is how a screen reader user knows which page they landed on; two of them, or
   none, makes that unanswerable.
2. **`PageHeader` comes first inside the shell's content.**
   Why: a heading that arrives after the content it names reads as a caption for the wrong thing.
3. **Top navigation is for destinations, not actions.**
   Why: a link goes somewhere and can be opened in a new tab; an action changes something. Put
   actions in `actions`.
4. **Keep `topNav` to two to five items.**
   Why: more than five stops being navigation and starts being a menu, and the row runs out of
   width before it runs out of items.
5. **The primary action goes last in `actions`.**
   Why: it is the end of the reading order and the nearest to the thumb — and it matches where
   a dialog puts its confirm.
6. **Don't nest an `AppShell` inside another.**
   Why: two headers means two skip links and two mains, and the skip link stops being able to
   promise where it goes.

## Accessibility

Already handled:

- A skip link to the main region, visible on focus with a focus ring that meets 3:1.
- The header navigation is a labelled `nav`; the drawer traps focus while open and returns it
  to the button that opened it.
- `main` is a landmark, so "skip to content" and landmark navigation both work.

The caller still owns:

- A `title` that names the page, not the product.
- A `topNavLabel` that says what the navigation is for when a page has more than one nav.

## Examples

```tsx
// Good: one shell, one h1, destinations in the nav and actions in actions
<AppShell topNav={pages} topNavLabel="Pages" actions={<ModeToggle />} sidebar={<SidebarNav … />}>
  <PageHeader
    overline="Workspace"
    title="Team settings"
    description="Manage who can access this workspace."
    actions={<Button variant="primary">Invite</Button>}
  />
  {/* page content */}
</AppShell>
```

```tsx
// Bad: a second h1 inside the page, and a button living in the navigation
<AppShell topNav={[{ label: 'Invite', href: '#', onClick: invite }]}>
  <PageHeader title="Team settings" />
  <h1>Members</h1>
</AppShell>
```

## Checked by

- `npm run check:ui` — axe fails a page with more than one `h1` or an unlabelled landmark, and
  the focus walk fails a skip link with no visible ring.
- `npm run check:docs` — this file against the component's exports.
