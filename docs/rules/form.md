---
component: Form
source: src/components/ui/form.tsx
import: "@/components/ui/form"
exports: [Form]
variants: []
sizes: []
defaults: {}
---

# Form

The wrapper around a set of fields that submits them together, with each field showing its own
error instead of a browser popup.

## Use it when

- Two or more related controls are saved by one action: an invite form, a settings panel, a sign-in.
- A single control needs validation before it is accepted.

## Use something else when

- The control saves the moment it changes — a mode toggle, a filter. Use a [Switch](switch.md) or
  a [Select](select.md) on its own; a form with no submit button is a form nobody can submit.
- You only need layout. A `<div className="flex flex-col gap-4">` is not a form, and shouldn't
  pretend to be one.

## Import

```tsx
import { Form } from '@/components/ui/form'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `Form` | yes | The `<form>`. Turns off browser validation popups and collects values by field name |
| [`Field`](field.md) | yes | One per control, carrying its label, description and error |
| Submit `Button` | yes | `type="submit"`, the one primary action in the form |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `onFormSubmit` | `(values) => void` | — | Runs only when every field is valid. `values` is keyed by each `Field`'s `name` |
| `errors` | `Record<string, string>` | — | Server-side errors, keyed by field name; each one lands in that field's `FieldError` |
| `className` | string | — | Layout only. The default is a 16px vertical stack |

## Rules

Each rule is one line with a **why**, so a case this file doesn't name can still be judged.

1. **Every control in a form sits in a `Field` with a `name`.**
   Why: `onFormSubmit` keys the values by that name, and the `Field` is what ties the label, the
   description and the error to the control for a screen reader.
2. **The submit button is `type="submit"`, not an `onClick` handler.**
   Why: a submit button is what makes Enter work from inside a text field, which is how most
   people finish a short form.
3. **One primary button per form, and it is the submit.**
   Why: two primaries in the same group leave no answer to "what does Enter do?" — the audit
   fails this as rule 15.
4. **Server errors come back through `errors`, keyed by field name.**
   Why: the message belongs beside the field that caused it, not in a toast the person has to
   remember while they fix the form.
5. **Never report the result of a submit only in a toast.**
   Why: a toast disappears. Whatever changed should be visible on the page afterwards — see
   [Toast](toast.md) rule 1.
6. **Don't disable the submit button to express "not valid yet".**
   Why: a disabled button gives no reason and can't be focused to ask for one. Let it submit and
   show the errors, which is what `Form` is built to do.

## Accessibility

Already handled:

- Browser validation popups are off, so errors are announced by the field rather than by a bubble
  that vanishes on blur.
- Each field is checked on submit, then live as the person fixes it — so the error clears when it
  is actually fixed, not on the next submit.
- `onFormSubmit` fires only when valid, so an invalid form never silently posts.

The caller still owns:

- A visible `FieldLabel` on every control.
- Error text that says what to do ("Enter a work email", not "Invalid").
- Moving focus to the first invalid field if the form is long enough to scroll.

## Examples

```tsx
// Good: values come back by field name, errors land on the field that caused them
<Form onFormSubmit={(values) => invite(values.email)} errors={serverErrors}>
  <Field name="email">
    <FieldLabel>Email address</FieldLabel>
    <Input type="email" autoComplete="email" />
    <FieldError />
  </Field>
  <Button type="submit" variant="primary">Send invite</Button>
</Form>
```

```tsx
// Bad: no Field, so nothing links the label to the input or holds the error;
// the button submits through onClick, so Enter does nothing
<form>
  <label>Email address</label>
  <Input type="email" />
  <Button variant="primary" onClick={save}>Send invite</Button>
</form>
```

## Checked by

- `npm run check:ui` — axe finds a control with no label, and the focus ring on every stop.
- `npm run audit` — rule 15, more than one primary button in a group.
- `npm run check:docs` — this file against the component's exports.
