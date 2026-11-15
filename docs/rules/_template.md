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
