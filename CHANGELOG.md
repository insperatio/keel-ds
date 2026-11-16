# Changelog

Keel follows [semantic versioning](https://semver.org): the version changes when the public
surface does — a component's props, a token name, or what the checks enforce.

## 1.0.0 — 2026-11-16

The first release. 14 components, 278 tokens, and a set of checks that fail the build when
something breaks the rules.

### What's in it

- **Tokens.** 118 primitives and 160 semantic roles, in light and dark, generated into CSS
  variables and Tailwind utilities. Tailwind's default palette is removed, so `bg-blue-600`
  doesn't quietly exist.
- **Components.** Button, Icon button, Input, Select, Checkbox, Switch, Badge, Tabs, Card,
  Table, Dialog, Toast, plus the App shell, Field and Form that pages are built from. Built on
  [Base UI](https://base-ui.com) with shadcn's install model.
- **Rules.** 36 project rules in `AGENTS.md`, each with its reason, and a rule file for every
  component saying when to use it, when not to, and what accessibility it already handles.
- **Checks.** `npm run check` runs the whole gate: the audit, the token and contrast checks,
  the documentation checks, the registry, a real browser over every page, and every Storybook
  story in both modes. The same set runs on every pull request.
- **Figma.** Every token is a Figma variable, every component has a frame, and
  `npm run figma:diff` reports drift between the two.
- **Published.** [Storybook](https://insperatio.github.io/keel-ds/) and a
  [shadcn registry](https://insperatio.github.io/keel-ds/r/), deployed by CI.

### What the checks caught while it was being built

Each of these shipped as a fix, and most came with a new check so it can't come back:

- A focus ring that Tailwind v4's `outline-none` was cancelling on every control.
- An error message that screen readers never announced, because the field only rendered it
  when the browser set it.
- Help text read twice, a tab count read as "Activity12", and a card footer that swallowed the
  card's own link.
- A 657px-wide page on a 375px phone, from a table that couldn't shrink.
- A Storybook control that crashed the published preview when you clicked it.
- Two documents that told you the checks covered something they didn't: a new page, and a
  dialog's accessibility.
- A secondary button at 2.93:1 on a status surface, because no check had ever measured a
  control against a tint.

### Known gaps

- Field, Form and App shell have no Figma frame of their own; they're wiring, and their visible
  parts are the components inside them.
- `check:ui` visits the demo pages, not every possible composition. The rules a machine can't
  judge are listed in `.claude/commands/audit.md` for a human or an AI to review.
