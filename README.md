# Keel

[![CI](https://github.com/insperatio/keel-ds/actions/workflows/ci.yml/badge.svg)](https://github.com/insperatio/keel-ds/actions/workflows/ci.yml)

A token-driven design system for React, built so that an AI coding tool can use it correctly
without being told twice.

Every color, size, radius, shadow and duration comes from token files. Those files are checked
for contrast, for staying on a 4px grid, and for matching between light and dark mode. The rules
for using them live in [AGENTS.md](AGENTS.md), one per line, each with the reason behind it, and
a set of checks fails the build when something breaks them. The result: a page built from Keel is
accessible and on-brand because of how it's built, not because someone remembered to check.

React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui on Base UI · MIT licensed.

## Quick start

```bash
npm install
npm run dev
```

The demo has three pages: every token with its value, every component with its states, and an
example settings page built only from Keel.

```bash
npm run storybook
```

Storybook runs each component on its own, with a light and dark switch in the toolbar that
toggles the same class the app does, so a story is rendered by exactly the CSS the product ships.
The accessibility panel runs axe against WCAG 2.2 A and AA on every story.

## What's in it

| | |
| --- | --- |
| **Tokens** | 117 primitives and 158 semantic roles, in light and dark |
| **Components** | Button, IconButton, Input, Select, Checkbox, Switch, Badge, Tabs, Card, Table, Dialog, Toast, plus Field, Form and an app shell |
| **Rules** | 33 project rules in [AGENTS.md](AGENTS.md) and a file per component in [docs/rules/](docs/rules/) |
| **Checks** | 150 contrast pairs, plus sizes, focus, target size, reflow and axe in a real browser |
| **Figma** | A plugin that pushes the repo's tokens into Figma, and a diff that reports drift |

## The checks

```bash
npm run audit          # source files against the rules a machine can judge
npm run tokens:check   # tokens: contrast, aliases, 4px grid, generated files up to date
npm run check:ui       # the built pages in a real browser, light and dark
npm run check:docs     # rule files still match the components they describe
npm run lint
```

**`npm run audit`** reads the source for the rules that don't need a browser: raw colors, Tailwind
palette classes that no longer exist, opacity used as a disabled state, off-scale sizes, inline
styles, and primitives used where a semantic role belongs. Two rules need the shape of the code
rather than a line of it, so those are parsed: more than one primary button in a group, and a
focus ring removed or rebuilt by hand. Each finding carries the rule number,
the reason behind it and the fix. The exemptions are written as code rather than left to
argument, because a check that cries wolf gets ignored and then protects nothing.

**`tokens:check`** reads every text, border and fill pair that can appear together and fails if
one drops below its minimum: 4.5:1 for text, 3:1 for borders, icons and fills. It also checks
that semantic tokens are aliases rather than raw values, that light and dark define the same
roles, and that the generated CSS matches its source.

**`check:ui`** builds the demo, then drives a real browser: it measures every control's height
against its size, tabs through every page and requires a visible focus ring at 3:1 on each stop,
checks that nothing clickable is under 24px in a crowd, runs axe for WCAG 2.2 A and AA, and
confirms the pages reflow at 320px with no sideways scrolling. Light and dark, every page.

**`check:docs`** compares every rule file with the component it describes: the exports it claims,
the variants, sizes and defaults it lists, that every rule has a reason, and that every link and
command it names is real.

All of it runs on every pull request ([ci.yml](.github/workflows/ci.yml)), cheapest check first,
so a typo fails in seconds rather than after a browser run.

These found real bugs during the build, not hypothetical ones: a focus ring that faded in from
black, a page 657px wide on a 375px phone, gray text at 4.44:1 on a selected row, a toast region
with no visible focus, and a checkbox border that would have been 2.93:1 against a hover color
that hadn't been written yet.

## Make it your brand

One file defines a brand: `src/tokens/brands/keel.brand.json` — name, logo, accent hue, neutral
tint, font and corner radius. Copy it, change the values, and run:

```bash
BRAND=yourbrand npm run tokens
```

Keel regenerates the color ramps in OKLCH, fits them into sRGB, and runs the contrast rules
against your colors, darkening steps until they pass or failing the build if they can't. See
[docs/brand.md](docs/brand.md).

## Figma

The repo is the source of truth. A development plugin (`figma/plugin/`) pushes every token into
Figma as variables and styles, and `npm run figma:diff` reports anything that drifted. See
[docs/figma.md](docs/figma.md).

## Docs

[llms.txt](llms.txt) indexes everything, for people and for AI tools.
[docs/QUICKSTART-AI.md](docs/QUICKSTART-AI.md) is the five-minute version.

Two jobs come with a written procedure, in [.claude/commands/](.claude/commands/): `/new-page`
builds a page from Keel and proves it passes the checks, and `/add-component` adds a component
with its demo, rule file and checks. Claude Code finds them as slash commands; any other tool can
be handed the file as a prompt.

## License

MIT © Insperatio Designs LLC. See [LICENSE](LICENSE).
