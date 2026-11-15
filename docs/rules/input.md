---
component: Input
source: src/components/ui/input.tsx
import: "@/components/ui/input"
exports: [Input]
variants: []
sizes: [sm, md, lg]
defaults: {size: md}
---

# Input

One line of text the person types: a name, an email, a search box, a number.

## Use it when

- The answer is short and free-form, and you can't list the options.
- It's a search box (`type="search"`).

## Use something else when

- There are 3 to 15 known options → [Select](select.md).
- It's a yes/no in a form → [Checkbox](checkbox.md); a setting that applies at once → [Switch](switch.md).
- The answer is a paragraph → a `textarea` styled with the same `controlVariants`.

## Import

```tsx
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `Field` | yes | Wraps one control and wires its label, help and error |
| `FieldLabel` | yes | The visible label |
| `Input` | yes | The control |
| `FieldDescription` | no | Help that applies before typing |
| `FieldError` | no | What to do when it's wrong |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `size` | `sm` 32px, `md` 40px, `lg` 48px | `md` | `md`/`lg` use 16px text so iOS doesn't zoom |
| `type` | `text`, `email`, `password`, `search`, `tel`, `url`, `number` | `text` | Picks the phone keyboard and the browser's own check |
| `required` | boolean | `false` | `Form` then shows the `FieldError` |
| `autoComplete` | string | — | `name`, `email`, `organization-title`, … |

## Rules

1. **Always inside a `Field` with a visible `FieldLabel`.**
   Why: the label, help text and error are wired to the control for screen readers.
2. **The placeholder is a format hint, never the label:** `placeholder="name@example.com"`.
   Why: it disappears as soon as someone types, and it's low contrast by design.
3. **Mark the few optional fields** with `<FieldLabel optional>`, not the many required ones.
   Why: less noise, and "required" stops meaning anything when it's on everything.
4. **Set `type` and `autoComplete`.**
   Why: the right keyboard on phones, the browser's own validity check, and autofill.
5. **Errors say what to do:** "Enter an email like name@example.com", not "Invalid email".
   Why: the person already knows it's wrong; they need the fix.
6. **Validate on submit, not on every keystroke.** `Form` handles this, then re-checks as they fix it.
   Why: an error that appears while typing the third character is noise.
7. **Never disable a field with no explanation.** Say who can change it, or why it's locked.
   Why: a gray box with no reason is a dead end.
8. **Controls in one row share a `size`** with the Button beside them.
   Why: the row lines up with no custom heights.

## Accessibility

Already handled: label, description and error are linked to the control; the invalid border is
3:1 and never the only cue (there's always error text with an icon); focus ring; disabled colors.

You must still: write a real label, a helpful error, and set `type`/`autoComplete`.

## Examples

```tsx
// Good: visible label, format hint, error that says what to do
<Field name="email">
  <FieldLabel>Work email</FieldLabel>
  <Input type="email" required placeholder="name@example.com" autoComplete="email" />
  <FieldError match="valueMissing">Enter your work email.</FieldError>
  <FieldError match="typeMismatch">Enter an email like name@example.com.</FieldError>
</Field>
```

```tsx
// Bad: placeholder as the label, no Field, vague error, wrong keyboard
<Input placeholder="Email *" />
<span className="text-fg-danger">Invalid</span>
```

## Checked by

- `npm run check:ui` — height per size, focus ring, axe (every field has a label), reflow at 320px.
- `npm run tokens:check` — `border.control` 3:1, `border.danger` 3:1, placeholder contrast.
