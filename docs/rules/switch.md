---
component: Switch
source: src/components/ui/switch.tsx
import: "@/components/ui/switch"
exports: [Switch]
variants: []
sizes: []
defaults: {}
---

# Switch

Turns a setting on or off, and it takes effect right away.

## Use it when

- The change applies immediately: dark mode, notifications, a feature flag.
- It's in a settings list, where each row is one setting.

## Use something else when

- The change is saved with a form → [Checkbox](checkbox.md).
- It's one of several choices → radio buttons or [Select](select.md).
- It runs an action rather than holding a state → [Button](button.md).

## Import

```tsx
import { Switch } from '@/components/ui/switch'
```

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| children | node | — | The label. Without it you get the bare switch, so pass `aria-label` |
| `description` | node | — | What turning it on does, announced as the description |
| `checked` / `defaultChecked` | boolean | — | Controlled or uncontrolled |
| `disabled` | boolean | `false` | Say who can change it in the description |

## Rules

1. **Label it with the setting, not the action:** "Dark mode", not "Turn on dark mode".
   Why: the label has to make sense in both states; "Turn on dark mode" reads wrong when it's on.
2. **No Save button next to it.** If the change needs saving, it's a Checkbox.
   Why: a switch that doesn't take effect until you save breaks the one thing it promises.
3. **The state is the switch, not the label.** Never change the label text when it flips.
   Why: screen readers already announce on and off; a changing label is read as new content.
4. **Say what happens in the `description`,** not in a tooltip.
   Why: tooltips don't exist on touch and are easy to miss.
5. **If it can fail** (it saves to a server), show the result and put the switch back if it didn't work.
   Why: a switch that silently snaps back looks broken.
6. **Disabled needs a reason in the description:** "Your admin manages this setting".
   Why: otherwise people retry, then file a bug.
7. **Don't use one for anything destructive.** Deleting is a Button plus a confirmation.
   Why: a switch invites a flick; a destructive action deserves a deliberate press.

## Accessibility

Already handled: `role="switch"` with on/off state, the name comes from the label only, the thumb
moves and changes color so state isn't color alone, Space toggles, focus ring, reduced motion.

You must still: name it as a setting, describe what it does, and explain a disabled one.

## Examples

```tsx
// Good: setting as the label, effect in the description, reason when disabled
<Switch defaultChecked description="A dot on the app icon when something new arrives.">
  Notifications
</Switch>
<Switch disabled description="Your admin manages this setting.">Share usage data</Switch>
```

```tsx
// Bad: action as a label, label changes with state, needs a Save button
<Switch>{on ? 'Turn off dark mode' : 'Turn on dark mode'}</Switch>
<Button>Save settings</Button>
```

## Checked by

- `npm run check:ui` — focus ring, 24px target, axe, reflow at 320px.
- `npm run tokens:check` — the off track at 3:1 and the on track at 3:1 against the card behind it.
