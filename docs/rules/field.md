---
component: Field
source: src/components/ui/field.tsx
import: "@/components/ui/field"
exports: [Field, FieldLabel, FieldDescription, FieldError]
variants: []
sizes: []
defaults: {}
---

# Field

One control with its label, its help text and its error, wired together so a screen reader reads
them as one thing.

## Use it when

- Any [Input](input.md) or [Select](select.md) a person types into or chooses from.
- A [Checkbox](checkbox.md) or [Switch](switch.md) that needs help text or an error. (Their own
  label prop is enough when they don't.)

## Use something else when

- The control is a button. Buttons carry their own label.
- You want a heading over a group of controls. That's a `fieldset`/`legend` or a
  [Card](card.md) header, not a Field.

## Import

```tsx
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `Field` | yes | Holds the control and wires the ids. `name` keys the value in [`Form`](form.md) |
| `FieldLabel` | yes | The visible label. `optional` adds a quiet "(optional)" |
| The control | yes | An `Input` or `Select`, as a direct child |
| `FieldDescription` | no | Help text that is always true, not an error |
| `FieldError` | no | What went wrong and what to do about it |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `name` | string | — | Required inside a `Form`: it is the key in `onFormSubmit(values)` |
| `invalid` | boolean | `false` | Puts the control in its invalid state. Set it from your own validation |
| `optional` (on `FieldLabel`) | boolean | `false` | Mark the few optional fields, not the many required ones |
| `match` (on `FieldError`) | validity key | — | Show this error only for that failure, e.g. `match="valueMissing"` |

## Rules

Each rule is one line with a **why**, so a case this file doesn't name can still be judged.

1. **Every field has a visible `FieldLabel`.**
   Why: placeholder text disappears the moment someone types, leaving no way to check what the
   box was for — and it fails contrast far more often than a label does.
2. **A placeholder shows the expected format, never the label.**
   Why: "name@example.com" helps; "Email" pretending to be a label does not.
3. **Mark optional fields, not required ones.**
   Why: most fields in a short form are required, so marking those adds noise to every row;
   marking the exceptions says more with less.
4. **Error text says what to do.**
   Why: "Invalid" tells a person they failed; "Enter a work email address" tells them how to
   finish.
5. **Description is for what is always true; error is for what just went wrong.**
   Why: they have different jobs and different colours, and swapping them means the help text
   turns red at random.
6. **Never carry the error state in colour alone.**
   Why: the red border is support. The message under the field is what actually says what
   happened, and it is the part a screen reader reads.

## Accessibility

Already handled:

- The label, description and error are all tied to the control by id, so a screen reader announces
  them together when focus arrives.
- `invalid` sets `aria-invalid`, and the error is announced when it appears.
- Clicking the label focuses the control.

The caller still owns:

- Writing a label that names the field, and error text that says what to do.
- `type` and `autoComplete` on the input, so phones show the right keyboard and autofill works.

## Examples

```tsx
// Good: visible label, placeholder shows the format, error says what to do
<Field name="email" invalid={!!error}>
  <FieldLabel>Email address</FieldLabel>
  <Input type="email" autoComplete="email" placeholder="name@example.com" />
  <FieldDescription>We only use this to sign you in.</FieldDescription>
  <FieldError>{error}</FieldError>
</Field>
```

```tsx
// Bad: the placeholder is the only label, so the field is nameless once typing starts
<Field name="email">
  <Input type="email" placeholder="Email address" />
</Field>
```

## Checked by

- `npm run check:ui` — axe fails a control with no accessible name.
- `npm run check:docs` — this file against the component's exports.
