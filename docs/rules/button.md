---
component: Button
source: src/components/ui/button.tsx
import: "@/components/ui/button"
exports: [Button, IconButton, buttonVariants]
variants: [primary, secondary, ghost, danger]
sizes: [sm, md, lg]
defaults: {variant: secondary, size: md}
---

# Button

Starts an action on the current page: submits, saves, opens a dialog, runs something.

## Use it when

- The thing happens on this page: save, delete, open, apply, send.
- It submits a form (`type="submit"` inside a `Form`).

## Use something else when

- It goes to another page or view → a link (`<a href>`), styled with `text-fg-link`.
  A button that navigates breaks the back button, middle-click and "open in new tab".
- It's only an icon, in a toolbar or table row → [IconButton](icon-button.md).
- It turns a setting on or off right away → [Switch](switch.md).

## Import

```tsx
import { Button } from '@/components/ui/button'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| label (children) | yes | What happens when you press it, as a verb phrase |
| `iconStart` | no | What the action does: `<Plus />` for new, `<Trash2 />` for delete |
| `iconEnd` | no | Where it leads: `<ChevronDown />` for a menu, `<ArrowRight />` for next |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `primary`, `secondary`, `ghost`, `danger` | `secondary` | One primary per group |
| `size` | `sm` 32px, `md` 40px, `lg` 48px | `md` | Match other controls in the row |
| `loading` | boolean | `false` | Spinner, `aria-busy`, clicks blocked, stays focusable |
| `disabled` | boolean | `false` | Uses the disabled tokens, never opacity |
| `iconStart` / `iconEnd` | node | — | lucide-react icons; hidden from screen readers |

## Rules

1. **One primary per group.** Everything else is secondary or ghost.
   Why: the primary says what the main next step is; two primaries say nothing.
2. **The label says what happens:** "Save changes", "Delete project". Never "OK", "Yes", "Submit".
   Why: screen readers and dialogs often read the label with no surrounding text.
3. **Use `danger` for destructive actions, behind an `AlertDialog`.**
   Why: red alone is not a confirmation, and deletes are hard to undo.
4. **Controls in one row share a `size`.** Button, IconButton, Input and Select are all 32 / 40 / 48px.
   Why: a toolbar lines up with no custom heights.
5. **Use `loading` while the work runs,** and change the label ("Saving…").
   Why: the spinner is invisible to screen readers; the label change is what they hear.
6. **Prefer explaining over disabling.** If a button must be disabled, say why nearby.
   Why: a disabled button with no reason is a dead end.
7. **Never restyle colors with `className`.** Size, spacing and layout classes are fine.
   Why: the variants are contrast-checked in both modes and every brand; a custom color is not.
8. **Never put a Button inside a link or another button.**
   Why: nested controls are unreachable by keyboard and announced wrong.

## Accessibility

Already handled: focus ring (2px, 3:1), disabled colors, `aria-busy` while loading, icons hidden
from screen readers, 32px minimum height.

You must still: write a label that makes sense alone; keep one primary per group; put the
button in a real form if it submits.

## Examples

```tsx
// Good: one primary, last; destructive action separated; labels name the action
<div className="flex items-center gap-3">
  <Button variant="danger" iconStart={<Trash2 />} className="mr-auto">Delete project</Button>
  <Button variant="ghost">Cancel</Button>
  <Button variant="primary" type="submit">Save changes</Button>
</div>
```

```tsx
// Bad: two primaries, vague labels, a custom color, and a button that navigates
<Button variant="primary">OK</Button>
<Button variant="primary" className="bg-blue-600">Yes</Button>
<Button onClick={() => router.push('/projects')}>Projects</Button>
```

## Checked by

- `npm run check:ui` — height per size, focus ring, 24px target, axe, reflow at 320px.
- `npm run tokens:check` — the action tokens the variants use.
