---
component: Select
source: src/components/ui/select.tsx
import: "@/components/ui/select"
exports: [Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectSeparator]
variants: []
sizes: [sm, md, lg]
defaults: {size: md}
---

# Select

Pick one option from a known list.

## Use it when

- There are about 3 to 15 options and only one can be chosen.
- The options are short and don't need describing.

## Use something else when

- 2 to 4 options that all fit on screen → radio buttons, so people see every choice at once.
- More than ~15, or people know what they want → a searchable combobox.
- Several can be chosen → a [CheckboxGroup](checkbox.md).
- It's on or off → [Switch](switch.md) (applies at once) or [Checkbox](checkbox.md) (saved with the form).

## Import

```tsx
import { Select, SelectItem, SelectGroup, SelectSeparator } from '@/components/ui/select'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `Select` | yes | The trigger and the popup together |
| `SelectItem` | yes | One option; the chosen one gets a check mark |
| `SelectGroup` | no | A labelled set, e.g. "Americas" |
| `SelectSeparator` | no | A line between groups |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `items` | array or object | — | Values and labels, so the trigger can show the chosen label |
| `placeholder` | string | — | Shown when nothing is chosen |
| `defaultValue` / `value` | value | — | Uncontrolled or controlled |
| `size` | `sm` 32px, `md` 40px, `lg` 48px | `md` | Matches Input and Button |

## Rules

1. **Always inside a `Field` with a visible `FieldLabel`.**
   Why: the trigger's name comes from that label.
2. **Pass `items`.** Without it the trigger shows the raw value, not the label.
   Why: a select that reads "et" instead of "Eastern (ET)" is a bug people find late.
3. **Either a `placeholder` or a sensible `defaultValue`.** Never an empty trigger.
   Why: a blank control gives no idea what belongs there.
4. **The placeholder is an instruction** ("Choose a role"), not a fake option ("Select…").
   Why: it's not a value, and it never appears in the list.
5. **Order the options the way people think:** most common first, or alphabetical, or by time.
   Never by the database.
   Why: scanning a list is the whole cost of a select.
6. **Group only when groups mean something,** with a `SelectSeparator` between them.
   Why: groups add a line to read; they have to earn it.
7. **Disable an option only when choosing it is impossible,** and say why in the label
   ("Enterprise (contact sales)").
   Why: a dead option with no reason looks broken.
8. **Don't put a Select in a table row for inline editing** unless the change saves at once and
   is announced.
   Why: a silent change in a row is easy to miss, including for screen readers.

## Accessibility

Already handled: keyboard (arrows, Home/End, type-ahead), the chosen option gets a check mark so
selection isn't color alone, the popup is in a portal with focus returned to the trigger,
`aria-expanded` and `aria-activedescendant`.

You must still: label it, pass `items`, and write option labels that stand alone.

## Examples

```tsx
// Good: labelled, items passed, instruction as placeholder, meaningful order
<Field name="role">
  <FieldLabel>Role</FieldLabel>
  <Select items={ROLES} placeholder="Choose a role">
    {Object.entries(ROLES).map(([value, label]) => (
      <SelectItem key={value} value={value}>{label}</SelectItem>
    ))}
  </Select>
  <FieldDescription>Editors can change content; admins can also manage people.</FieldDescription>
</Field>
```

```tsx
// Bad: no label, no items (trigger shows "ed"), fake first option, 40 unsorted entries
<Select defaultValue="ed">
  <SelectItem value="">Select…</SelectItem>
  {rows.map((r) => <SelectItem key={r.id} value={r.id}>{r.id}</SelectItem>)}
</Select>
```

## Checked by

- `npm run check:ui` — trigger height per size, focus ring, axe with the popup open, reflow at 320px.
- `npm run tokens:check` — `surface.overlay` pairs for the popup, `selected.fg` for the chosen option.
