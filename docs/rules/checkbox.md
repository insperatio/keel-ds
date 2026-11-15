---
component: Checkbox
source: src/components/ui/checkbox.tsx
import: "@/components/ui/checkbox"
exports: [Checkbox, CheckboxGroup]
variants: []
sizes: []
defaults: {}
---

# Checkbox

Turns one option on or off as part of a form that saves when it's submitted.

## Use it when

- The choice is saved with a Save button, not the moment it changes.
- Several options can be on at once (use a `CheckboxGroup`).
- It's a single agreement: "I agree to the terms".

## Use something else when

- The setting applies the moment it changes → [Switch](switch.md).
- Exactly one of several options → radio buttons, or [Select](select.md) for 3 to 15.
- It's a filter that re-runs a search as you click → a Checkbox is fine, but announce the
  new result count in a live region, or people won't know anything happened.

## Import

```tsx
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| label (children) | yes | What being on means |
| `description` | no | Help under the label, announced with the box |
| `CheckboxGroup` | for sets | Adds a legend naming the group |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| children | node | — | The label. Without it you get the bare box, so pass `aria-label` |
| `description` | node | — | Announced as the description, not part of the name |
| `indeterminate` | boolean | `false` | The dash: some of a set are checked |
| `parent` | boolean | `false` | Inside a `CheckboxGroup` with `allValues`, makes "select all" |
| `disabled` | boolean | `false` | Disabled colors, never opacity |
| `required` | boolean | `false` | With `Field` + `Form`, shows a `FieldError` |

## Rules

1. **Give it a label, or an `aria-label` if the box stands alone** (in a table row: "Select Ada Lovelace").
   Why: a bare box is announced as "checkbox" with no idea what it does.
2. **Label what being on means,** in the positive: "Email me about replies", never "Don't email me".
   Why: a negative label makes a checked box mean "no", which people misread.
3. **The whole label is the target.** Don't put the box and the text in separate elements.
   Why: a 20px box alone is a hard target; the component makes the label clickable for you.
4. **A set of related boxes goes in a `CheckboxGroup` with a `legend`.**
   Why: the legend is the only thing that says what the set is about.
5. **For "select all", use `parent` with `allValues`,** and let it show the dash when some are checked.
   Why: a plain checked/unchecked "all" lies when only three of six are on.
6. **Never make a checkbox apply at once.** If it must, it isn't a checkbox.
   Why: people expect to be able to change their mind before saving.
7. **A required checkbox gets a `FieldError` that says what to do:** "Agree to the terms to continue".
   Why: a red box with no words doesn't say what's missing.

## Accessibility

Already handled: the name comes from the label only (the description is read separately, not twice),
checked and mixed states show a check or a dash so state isn't color alone, Space toggles,
focus ring, disabled colors.

You must still: name it, keep the label positive, and give a set its legend.

## Examples

```tsx
// Good: positive label, help text as a description, grouped with a legend
<CheckboxGroup legend="Email me about" value={value} onValueChange={setValue} allValues={ALL}>
  <Checkbox parent>All activity</Checkbox>
  <Checkbox value="mentions" description="When someone @mentions you.">Mentions</Checkbox>
</CheckboxGroup>
```

```tsx
// Bad: negative label, no group legend, state saved instantly, bare box with no name
<Checkbox onCheckedChange={save}>Don't send me email</Checkbox>
<Checkbox />
```

## Checked by

- `npm run check:ui` — focus ring, 24px target, axe (every control has a name), reflow at 320px.
- `npm run tokens:check` — the box border at 3:1 and the checked fill at 3:1 on every surface.
