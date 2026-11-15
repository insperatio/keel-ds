---
component: Card
source: src/components/ui/card.tsx
import: "@/components/ui/card"
exports: [Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, cardVariants]
variants: [outlined, elevated]
sizes: [sm, md]
defaults: {variant: outlined, size: md}
---

# Card

Groups everything about one thing on a raised surface: one project, one invoice, one setting.

## Use it when

- The content is about a single object and belongs together.
- A grid of them lets people compare the same few facts across many objects.

## Use something else when

- The rows are the same shape and people need to scan or sort them → [Table](table.md).
- It's one section of a page with nothing else beside it → a heading and the content, no box.
- You're nesting a card in a card → use spacing and a heading instead.

## Import

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `CardHeader` | usually | Holds the title, description and action |
| `CardTitle` | yes | Names the thing; `as` sets the heading level, `href` makes the card a link |
| `CardDescription` | no | One line under the title |
| `CardAction` | no | Top right: a Badge, or an IconButton menu |
| `CardContent` | no | The body |
| `CardFooter` | no | Actions or meta at the bottom; wraps on narrow screens |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `outlined`, `elevated` | `outlined` | Elevated swaps the border for a shadow |
| `size` | `sm` 16px, `md` 24px padding | `md` | `sm` for dense grids |
| `as` (on `CardTitle`) | `h2`, `h3`, `h4` | `h3` | Pick by the page outline, not by size |
| `href` (on `CardTitle`) | string | — | Makes the whole card clickable |

## Rules

1. **To make a card clickable, give `CardTitle` an `href`.** Never wrap the card in `<a>` or `<button>`.
   Why: the whole card as a link is read aloud as one enormous link name; this way the link is
   named by the title and the click area still covers the card.
2. **One link per card.** If a card needs two destinations, it needs two cards, or a list.
   Why: two overlapping click areas mean people hit the wrong one.
3. **Pick the heading level from the page outline** (`as="h2"` under an `h1`), not from how big it looks.
   Why: heading level is how screen reader users move around; size comes from the token.
4. **Buttons go in `CardFooter` or `CardAction`.** They keep working inside a clickable card.
   Why: anywhere else they're covered by the card's own click area.
5. **Don't nest cards.**
   Why: two borders and two paddings make the hierarchy unreadable; use spacing instead.
6. **Keep the same fields in the same order across a grid of cards.**
   Why: a grid is a comparison, and comparison needs alignment.
7. **Elevated is for cards over busy content,** not for importance.
   Why: a page of shadows has no depth left to signal anything.
8. **Give the grid item `min-w-0`** when a card holds a table or long unbroken text.
   Why: grid items don't shrink below their content, which pushes the page sideways on a phone.

## Accessibility

Already handled: the stretched click area with the focus ring around the whole card, buttons
staying clickable above it, a hover border on clickable cards, and `surface.raised` contrast
checked for text, links and the focus ring.

You must still: choose the heading level, keep to one link, and write a title that names the object.

## Examples

```tsx
// Good: one link named by the title, a badge in the action slot, buttons in the footer
<Card>
  <CardHeader>
    <CardTitle as="h2" href={`/projects/${p.id}`}>{p.name}</CardTitle>
    <CardDescription>{p.summary}</CardDescription>
    <CardAction><Badge tone="success">On track</Badge></CardAction>
  </CardHeader>
  <CardFooter><span className="text-body-sm text-fg-tertiary">{p.updated}</span></CardFooter>
</Card>
```

```tsx
// Bad: whole card wrapped in a link, a second link inside it, heading chosen by size
<a href={href}>
  <Card>
    <CardHeader><CardTitle as="h4">{p.name}</CardTitle></CardHeader>
    <CardFooter><a href={ownerHref}>{p.owner}</a></CardFooter>
  </Card>
</a>
```

## Checked by

- `npm run check:ui` — focus ring around the card, 24px targets, axe, reflow at 320px.
- `npm run tokens:check` — text, links and the focus ring on `surface.raised`.
