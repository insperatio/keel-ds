---
component: Tabs
source: src/components/ui/tabs.tsx
import: "@/components/ui/tabs"
exports: [Tabs, TabsList, Tab, TabsPanel]
variants: []
sizes: []
defaults: {}
---

# Tabs

Switch between a few views of the same thing without leaving the page.

## Use it when

- There are 2 to 7 views of one object: Overview, Activity, Members, Settings.
- The views are peers: no order, and none depends on finishing another.

## Use something else when

- They're steps in order → a stepper, or separate pages with Next and Back.
- Each one is really its own page people link to or bookmark → links and routes.
  If you do want links in tabs, keep them real `<a href>` so they can be opened in a new tab.
- There are more than about 7 → a sidebar or a [Select](select.md).
- You're hiding content people need to compare → show it all.

## Import

```tsx
import { Tabs, TabsList, Tab, TabsPanel } from '@/components/ui/tabs'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `Tabs` | yes | Holds the state; takes `defaultValue` or `value` |
| `TabsList` | yes | The row; needs a `label` |
| `Tab` | yes | One tab; `value` ties it to its panel |
| `TabsPanel` | yes | The content for one `value` |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `label` (on `TabsList`) | string | — | **Required.** What the tabs switch between |
| `value` (on `Tab`/`TabsPanel`) | string | — | Must match between the two |
| `count` (on `Tab`) | number | — | Announced as "Activity (12)" |
| `disabled` (on `Tab`) | boolean | `false` | Reachable by arrows, can't be opened |

## Rules

1. **`TabsList` gets a `label`** that names the set: "Project sections", not "Tabs".
   Why: it's how a screen reader says what this row of tabs is for.
2. **Every `Tab` has a `TabsPanel` with the same `value`,** including disabled ones.
   Why: a tab pointing at a panel that isn't there is a broken reference.
3. **Labels are nouns, one or two words:** Overview, Activity, Members.
   Why: the row is scanned sideways; long labels force scrolling.
4. **Keep the panel's content the same kind of thing** across tabs.
   Why: tabs promise different views of one object; different objects need navigation.
5. **Don't nest tabs inside tabs.**
   Why: two tab rows on one page can't be told apart by keyboard or by eye.
6. **Don't put a form that spans tabs behind one Save button** without showing what's unsaved
   in the other tabs.
   Why: errors hidden on another tab are the classic unfixable form.
7. **More than about 7 tabs means the wrong pattern,** even though the row scrolls.
   Why: scrolling hides tabs, and hidden navigation doesn't get used.

## Accessibility

Already handled: arrow keys, Home and End move between tabs, Tab moves into the panel; the
active tab has a colored label and a 2px underline, so it isn't color alone; panels stay in the
page so every `aria-controls` resolves; counts read as "Activity (12)"; the focus ring is inset
so a scrolling row can't clip it.

You must still: label the list, keep labels short, and match every tab to a panel.

## Examples

```tsx
// Good: labelled list, short nouns, a panel per tab including the disabled one
<Tabs defaultValue="overview">
  <TabsList label="Project sections">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity" count={12}>Activity</Tab>
    <Tab value="billing" disabled>Billing</Tab>
  </TabsList>
  <TabsPanel value="overview">…</TabsPanel>
  <TabsPanel value="activity">…</TabsPanel>
  <TabsPanel value="billing">Billing is managed by your organization.</TabsPanel>
</Tabs>
```

```tsx
// Bad: no label, sentence labels, a tab with no panel, steps as tabs
<TabsList>
  <Tab value="1">Step 1: enter your details</Tab>
  <Tab value="2">Step 2: pay</Tab>
</TabsList>
<TabsPanel value="1">…</TabsPanel>
```

## Checked by

- `npm run check:ui` — focus ring (inset), 24px target, axe, reflow at 320px.
- `npm run tokens:check` — the active label at 4.5:1 and the underline at 3:1.
