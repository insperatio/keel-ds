---
component: Dialog
source: src/components/ui/dialog.tsx
import: "@/components/ui/dialog"
defaultsFrom: DialogContent
exports: [Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, AlertDialog, AlertDialogTrigger, AlertDialogClose, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel]
variants: []
sizes: [sm, md, lg]
defaults: {size: md}
---

# Dialog

A focused task or decision on top of the page, which has to be finished or dismissed.

## Use it when

- A short task interrupts on purpose: edit one thing, pick one thing, confirm one thing.
- Losing the page behind would be worse than covering it.

## Use something else when

- It's a destructive confirmation → `AlertDialog`, in this same file: clicking outside
  doesn't dismiss it, and focus starts on Cancel.
- It's a notification with nothing to decide → [Toast](toast.md).
- The content is long, or people will want to link to it → a page.
- It's a menu, a date picker or a tooltip → the popup components, not a dialog.

## Import

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from '@/components/ui/dialog'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `DialogTrigger` | usually | The button that opens it; focus comes back here |
| `DialogContent` | yes | The panel, backdrop and focus trap |
| `DialogTitle` | yes | Names the dialog for screen readers |
| `DialogDescription` | no | One line of context, announced with the title |
| `DialogBody` | yes | The content; scrolls when the dialog is taller than the screen |
| `DialogFooter` | usually | Actions, primary last; stacks on narrow screens |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `size` | `sm` 384, `md` 512, `lg` 672px | `md` | `AlertDialogContent` defaults to `sm` |
| `showClose` | boolean | `true` | Keep it unless the footer already has Cancel |
| `open` / `onOpenChange` | boolean | — | Control it when something else closes it |

## Rules

1. **Every dialog has a `DialogTitle`,** even a tiny one.
   Why: it's the dialog's name; without it screen readers announce an unnamed dialog.
2. **The title names the task** ("Invite a teammate"), and the primary button repeats the verb
   ("Send invite"). Never "Are you sure?" with "OK".
   Why: people read the button, not the paragraph.
3. **Destructive confirmations use `AlertDialog`.**
   Why: it can't be dismissed by a stray click outside, and focus starts on Cancel, so Enter
   can't delete anything.
4. **Give people a way out that isn't the action:** Cancel, the close button, or Escape.
   Why: a dialog with only one button is a trap.
5. **One dialog at a time.** Never open a dialog from a dialog.
   Why: focus and Escape become ambiguous, and the backdrop stacks into mud.
6. **Long content goes in `DialogBody`,** so the title and footer stay put while it scrolls.
   Why: the actions have to stay reachable without scrolling to the end.
7. **Don't put a whole workflow in a dialog.** More than one screenful, or more than a few
   fields, belongs on a page.
   Why: no deep link, no back button, no room on a phone.
8. **Keep forms inside `Form`,** so validation shows in the dialog instead of closing it.
   Why: a dialog that closes on an invalid submit loses what people typed.

## Accessibility

Already handled: focus moves in and is trapped, returns to the trigger on close; Escape and the
backdrop dismiss (except `AlertDialog`); the page behind is hidden from screen readers and doesn't
scroll; the title and description are wired to the dialog; the footer stacks with the primary
action on top at phone width.

You must still: write the title, keep an escape route, and name the action in the button.

## Examples

```tsx
// Good: named task, validation inside the dialog, clear way out
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger render={<Button />}>Invite</DialogTrigger>
  <DialogContent size="sm">
    <Form className="contents" onFormSubmit={invite}>
      <DialogHeader>
        <DialogTitle>Invite a teammate</DialogTitle>
        <DialogDescription>They'll get an email with a link to join.</DialogDescription>
      </DialogHeader>
      <DialogBody>…fields…</DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        <Button type="submit" variant="primary">Send invite</Button>
      </DialogFooter>
    </Form>
  </DialogContent>
</Dialog>
```

```tsx
// Bad: no title, vague buttons, destructive action in a plain Dialog
<DialogContent>
  <p>Are you sure?</p>
  <Button variant="danger" onClick={destroy}>OK</Button>
</DialogContent>
```

## Checked by

- `npm run check:ui` — focus ring, 24px targets, axe with a dialog open, reflow at 320px.
- `npm run tokens:check` — controls and the focus ring on `surface.overlay`.
