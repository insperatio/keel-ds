---
component: ComponentName
source: src/components/ui/component.tsx
import: "@/components/ui/component"
exports: [ComponentName]
variants: []
sizes: []
defaults: {}
---

# ComponentName

One sentence: what it is and what it's for.

<!--
The frontmatter is checked against the source by `npm run check:docs`, so every value has to be
true. These are all the keys it understands — there are no others, and an axis you invent is
ignored rather than checked:

  component     the exported name this file is about
  source        path to the component file
  import        the import specifier, in quotes
  exports       every name the file exports. Checked against the source's export statement
  variants      the values of a `variant` prop
  sizes         the values of a `size` prop
  tones         the values of a `tone` prop. Status tones are always: info, success, warning, danger
  densities     the values of a `density` prop
  types         the values of a `type` prop
  defaults      a map of prop to default, e.g. {variant: secondary, size: md}. A default in the
                component's signature wins over one in cva's defaultVariants
  defaultsFrom  name another component whose defaults this one inherits, instead of listing them

Every value listed must appear literally in the source — the check reads the cva block, a
`const <key>s = {...}` map, and TypeScript unions. Omit a key rather than leaving it empty if the
component has no such axis.

Required sections, also checked: Use it when · Use something else when · Rules · Accessibility ·
Examples · Checked by. The others below are conventional and worth keeping, but not enforced.
Delete this comment when you fill the template in.
-->

## Use it when

- A case where this is the right component.

## Use something else when

- A case, and what to use instead, with a link to that rule file.

## Import

```tsx
import { ComponentName } from '@/components/ui/component'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `ComponentName` | yes | |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |

## Rules

Each rule is one line with a **why**, so a case this file doesn't name can still be judged.

1. **Rule.**
   Why: reason.

## Accessibility

- What the component already handles, so nobody adds it again.
- What the caller must still get right.

## Examples

```tsx
// Good: why this is right
```

```tsx
// Bad: what breaks
```

## Checked by

- `npm run ...` — what it would catch.
