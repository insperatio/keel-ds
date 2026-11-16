---
component: Toast
source: src/components/ui/toast.tsx
import: "@/components/ui/toast"
defaultsFrom: ToastProvider
exports: [ToastProvider, useToast]
variants: []
sizes: []
types: [success, info, warning, danger]
defaults: {limit: 3}
---

# Toast

A short message about something that just happened, at the corner of the screen.

## Use it when

- An action finished and the page doesn't already show it: "Changes saved", "Invite sent".
- Something failed and the person can try again: "Couldn't save. Check your connection."
- An action can be undone for a few seconds: "Project archived" with Undo.

## Use something else when

- The person has to decide something → [Dialog](dialog.md).
- The problem belongs to a field → `FieldError` under that field.
- It's the state of a thing on the page → [Badge](badge.md), or update the page itself.
- It's a long message, a link people need, or anything they'll want to read twice → the page.

## Import

```tsx
import { ToastProvider, useToast } from '@/components/ui/toast'
```

Wrap the app once in `<ToastProvider>`, then call `useToast()` anywhere.

## Props that matter

| Call | What it does |
| --- | --- |
| `toast.success(title, options)` | Closes after 5 seconds, 10 with an action |
| `toast.info(title, options)` | Same timing as success |
| `toast.warning(title, options)` | Stays until dismissed |
| `toast.danger(title, options)` | Stays until dismissed, interrupts screen readers |
| `toast.promise(p, { loading, success, danger })` | One toast that becomes the result |
| `options.description` | A second line, for what to do next |
| `options.action` | One action, like Undo or Retry |
| `limit` (on `ToastProvider`) | How many show at once; `3` |

## Rules

1. **Never the only place for important information or an action.**
   Why: toasts disappear, and people miss them. The page has to hold the truth.
2. **Pick the type by meaning,** not by the color you want: `toast.danger` for a failure.
   Why: the type sets the timing and whether screen readers interrupt.
3. **The title says what happened, in a few words:** "Changes saved", "Couldn't save changes".
   The description says what to do next.
   Why: the title is what people read in the second it's on screen.
4. **Don't toast what the page already shows.** A row that appears doesn't need
   "Row added" as well.
   Why: a toast per keystroke trains people to ignore them.
5. **At most one action,** and make it a verb: Undo, Retry, View.
   Why: a toast isn't a dialog, and a second action has nowhere to go.
6. **Don't set a timeout on a danger or a warning.**
   Why: they already stay until dismissed; a timeout takes away the fix.
7. **Use `toast.promise` for work that takes a moment,** instead of a toast before and after.
   Why: one toast that becomes the result reads as one event, not two.
8. **Never put a form, a long explanation or a link people must follow in a toast.**
   Why: it can close while they're reading it, and on touch there's nothing to hover.

## Accessibility

Already handled: errors interrupt (`role="alert"`) and the rest are announced politely; success
and info pause on hover, focus or when the window loses focus; warning and error stay until
dismissed (WCAG 2.2.1); F6 moves focus to the toasts and the region itself shows a focus ring;
each toast has a close button; titles are plain text, so they don't appear in the page outline;
at most three at once.

You must still: choose the right type, keep the words short, and leave the real information on the page.

## Examples

```tsx
// Good: meaningful type, next step in the description, one undo action
const toast = useToast()
toast.success('Changes saved')
toast.danger('Couldn’t save changes', { description: 'Check your connection and try again.' })
toast.info('Project archived', { action: { label: 'Undo', onClick: restore } })
toast.promise(publish(), { loading: 'Publishing…', success: 'Published', error: 'Couldn’t publish' })
```

```tsx
// Bad: an error that disappears, a decision in a toast, the only copy of a link
toast.danger('Payment failed', { timeout: 3000 })
toast.info('Delete this project?', { action: { label: 'Delete', onClick: destroy } })
toast.success('Report ready', { description: 'https://example.com/report/8d2f' })
```

## Checked by

- `npm run check:ui` — focus rings including the F6 region, 24px targets, axe with toasts open.
- `npm run tokens:check` — status icons and text on `surface.overlay`.
