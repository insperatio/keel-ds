---
component: IconButton
source: src/components/ui/button.tsx
import: "@/components/ui/button"
exports: [IconButton]
variants: [primary, secondary, ghost, danger]
sizes: [sm, md, lg]
defaults: {variant: ghost, size: md}
---

# IconButton

A square button with an icon and no visible text, for toolbars, table rows and dialog corners.

## Use it when

- Space is tight and the icon is well known: close (×), more (…), edit (pencil), delete (trash).
- The same action repeats in every row of a table or list, where a text label would be noise.

## Use something else when

- The action is the main one on the page → [Button](button.md) with a visible label.
- The icon isn't obvious on its own → a Button with a label. If you need a tooltip to explain it,
  the label should have been visible.

## Import

```tsx
import { IconButton } from '@/components/ui/button'
```

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `label` | string | — | **Required.** The accessible name |
| `icon` | node | — | A lucide-react icon, hidden from screen readers |
| `variant` | `primary`, `secondary`, `ghost`, `danger` | `ghost` | Ghost suits toolbars |
| `size` | `sm` 32px, `md` 40px, `lg` 48px | `md` | Square: 32×32, 40×40, 48×48 |
| `loading` | boolean | `false` | Spinner, `aria-busy`, stays focusable |

## Rules

1. **`label` names the action, not the picture:** "Delete row", not "Trash"; "More actions for Ada",
   not "Dots".
   Why: it is the only name a screen reader gets.
2. **Make repeated labels unique:** "More actions for Ada Lovelace" in each row.
   Why: a list of twelve buttons all called "More actions" is unusable by voice or by list.
3. **Only for icons people already know.** Anything else gets a visible label.
   Why: an unknown icon is a guess, and a tooltip doesn't help on touch.
4. **Don't put a visible text label on it.** That's a Button with `iconStart`.
   Why: this component is sized as a square; text would break the shape and the row rhythm.
5. **Keep 24px of clear space around small ones** in dense rows, or use `md`.
   Why: WCAG 2.5.8; crowded 32px targets still cause mis-taps.

## Accessibility

Already handled: the accessible name comes from `label` and the types require it; the icon is
`aria-hidden`; focus ring; square 32px minimum.

You must still: make the label unique in lists, and describe the action, not the glyph.

## Examples

```tsx
// Good: unique, action-shaped names
<IconButton size="sm" label={`More actions for ${member.name}`} icon={<MoreHorizontal />} />
<IconButton label="Close dialog" icon={<X />} />
```

```tsx
// Bad: names the picture, repeats in every row, and hand-rolls the button
<IconButton label="Trash" icon={<Trash2 />} />
<div onClick={remove} className="h-6 w-6"><Trash2 /></div>
```

## Checked by

- `npm run check:ui` — square size per `size`, focus ring, 24px target, axe (every control has a name).
