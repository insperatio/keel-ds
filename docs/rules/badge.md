---
component: Badge
source: src/components/ui/badge.tsx
import: "@/components/ui/badge"
exports: [Badge, badgeVariants]
tones: [neutral, success, warning, danger]
variants: [subtle, solid]
sizes: [sm, md]
defaults: {tone: neutral, variant: subtle, size: sm}
---

# Badge

A short label for status or a count. It can't be clicked.

## Use it when

- Showing the state of a row or an object: Active, Invited, Failed, Draft.
- Showing a small count next to a label: 12 open.

## Use something else when

- It can be clicked, removed or filtered by → [Button](button.md), or a chip component.
  A badge with an `onClick` has no keyboard, no focus ring and no role.
- It's a whole message with a title and a next step → a status banner built from
  `status.*` tokens, not a badge.
- It's a count inside a tab → [Tabs](tabs.md) has `count` built in.

## Import

```tsx
import { Badge } from '@/components/ui/badge'
```

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `tone` | `neutral`, `success`, `warning`, `danger` | `neutral` | Meaning, not decoration |
| `variant` | `subtle`, `solid` | `subtle` | Solid for the one thing that must stand out |
| `size` | `sm` 20px, `md` 24px | `sm` | `sm` in tables and dense lists |
| `icon` | node | — | Decorative; the text carries the meaning |

## Rules

1. **The text carries the meaning:** "Failed", not a red dot or a bare icon.
   Why: color and icons alone aren't read by screen readers or seen by everyone.
2. **Tone means what it says:** success is done, warning needs attention, danger is broken,
   neutral is waiting or unknown. Pick by meaning, never because red looks good here.
   Why: once tone is decoration, no one can trust it anywhere.
3. **Use the same tone for the same state everywhere.**
   Why: people learn the mapping once; two meanings for one color unlearns it.
4. **There is no accent tone, on purpose.** Don't fake one with `className`.
   Why: accent means "you can act on this", and a badge can't be acted on.
5. **Solid is rare:** at most one per view, for the thing that must be seen first.
   Why: everything loud means nothing is.
6. **Never attach a click handler.** If it's actionable, it's a Button.
   Why: a `<span>` with `onClick` can't be reached or operated by keyboard.
7. **Keep it to one or two words,** or a count. Long text belongs in the row.
   Why: it's a pill; wrapped text in a pill is unreadable.
8. **If the status changes while the page is open,** announce it in a live region or a toast.
   Why: a badge that silently flips from Pending to Failed is missed.

## Accessibility

Already handled: every tone and variant is contrast-checked in both modes (4.5:1+ for text);
the icon is decorative; nothing about it suggests it can be clicked.

You must still: write words that stand on their own, and announce changes that matter.

## Examples

```tsx
// Good: words carry the state, tone matches meaning, sm in a dense list
<Badge tone="success" icon={<CheckCircle2 />}>Active</Badge>
<Badge tone="danger">Failed</Badge>
<Badge>Invited</Badge>
```

```tsx
// Bad: color as the only cue, a clickable badge, decorative tone
<Badge tone="danger" aria-label="error" />
<Badge onClick={filter}>Draft</Badge>
<Badge tone="success">12</Badge>
```

## Checked by

- `npm run check:ui` — axe, reflow at 320px.
- `npm run tokens:check` — all eight tone and variant pairs at 4.5:1 in both modes.
