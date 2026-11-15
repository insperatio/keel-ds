---
description: Add a component to Keel, with its demo, rule file and checks
argument-hint: the component, e.g. "Tooltip" or "Breadcrumbs"
---

# /add-component

Add a new component to Keel: $ARGUMENTS

A component isn't done when it renders. It's done when it has a rule file, appears in the demo,
and passes every check in both modes.

## 1. Before you build

- Read `AGENTS.md`, and two existing components close to what you're adding
  (`src/components/ui/`). The comment at the top of each is its usage guide.
- Check whether Base UI has it: `node_modules/@base-ui/react/<name>`. If it does, build on it
  rather than hand-rolling keyboard behavior, focus and ARIA.
- Decide whether Keel needs this at all. Can it be made from existing components? If yes, say so
  and stop. A system is kept honest by what it refuses.

## 2. Build it

In `src/components/ui/<name>.tsx`:

- Style only with token classes. New states get their color from existing semantic roles.
- Variants and sizes with `cva`, heights matching the scale (32 / 40 / 48) if it sits in a row
  with Button, Input or Select.
- `data-slot="<name>"` on the root, and `data-size` if it has sizes. The checks use them.
- Focus: leave the default ring, or restyle it. Never remove it.
- Disabled uses the disabled tokens, never opacity. States never rely on color alone.
- Motion uses `duration-(--keel-duration-*)` and `ease-*`, with `motion-reduce:transition-none`.
- A comment at the top: what it's for, when not to use it, a short example.

**If you need a color that doesn't exist**, add a semantic role to both
`src/tokens/semantic/light.tokens.json` and `dark.tokens.json` as an alias, add every pair it
creates to `PAIRS` in `scripts/check-tokens.mjs`, and run `npm run tokens`. If a pair fails,
pick a different primitive. Never lower a minimum. Then push it to Figma with the Keel tokens
plugin and confirm with `npm run figma:diff`.

## 3. Show it

Add a section to `src/demo/ComponentsPage.tsx` with:

- every variant and size,
- every state: default, hover, focus, disabled, loading, invalid, empty,
- one realistic use, not just a row of swatches,
- the section id in the sidebar list in `src/demo/ComponentsPage.tsx`.

## 4. Write its rule file

Copy `docs/rules/_template.md` to `docs/rules/<name>.md` and fill it in:
when to use it, **when to use something else** (with links, and update those files to link back),
anatomy, the props that matter, numbered rules each with a one-line why, what accessibility is
already handled versus what the caller owns, a good and a bad example, and which checks cover it.

Add it to `llms.txt` with a line saying what it's for.

## 5. Check it

```bash
npm run lint && npx tsc -b
npm run tokens:check
npm run check:ui
npm run check:docs
```

`check:docs` compares the rule file with your code: exports, variants, sizes, defaults, every
rule having a reason, and every link and command it names. `check:ui` covers sizes, focus rings,
targets, axe and reflow, in light and dark.

## 6. Hand it back

Report what it's for, what it's built on, any token you added and why, the check results, and
anything you decided not to support, with the reason.
