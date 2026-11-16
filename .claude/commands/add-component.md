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
- every state the component actually has. For a control that is default, hover, focus, disabled,
  and loading or invalid where they apply; a component that is only ever displayed — a badge, an
  inline message — has none of those, and inventing them is worse than leaving them out,
- one realistic use, not just a row of swatches,
- an entry in the `sections` list at the top of `src/demo/ComponentsPage.tsx`: a `[id, label]`
  tuple inside the group it belongs to (Actions, Forms, Display, Overlays).

## 4. Write its story

`src/components/ui/<name>.stories.tsx`, one story per thing worth seeing. A story is a test, not
just a demo: `check:stories` renders every one in light and dark and fails on an axe violation or
a console error, and `check:docs` fails a component that has no story file at all.

Two things that are easy to get wrong and are checked:

- **Any prop typed `ReactNode` needs an `argTypes` entry**, or Storybook gives it an object editor
  and setting it crashes the preview. Use the helpers in `src/storybook/controls.tsx`:
  `iconControl` for an icon slot, `textControl` for text, `hiddenControl` for a prop the story
  supplies itself.
- **A story that uses a hook needs a named render function** — `render: function WithState() {…}`,
  not `render: () => {…}`. An anonymous function is not a component as far as the rules-of-hooks
  lint rule is concerned, and `npm run lint` prints that error among its warnings and still exits
  zero, so it is easy to miss.

## 5. Link it to its Figma frame

Add the component to the map in `src/storybook/figma.ts` with the node id from the Figma URL
(`?node-id=25-291` becomes `'25-291'`), then put `parameters: figma('<name>')` on the story's
meta. `check:docs` fails if a story has no frame, or if the map holds a frame nothing uses.

## 6. Write its rule file

Copy `docs/rules/_template.md` to `docs/rules/<name>.md` and fill it in:
when to use it, **when to use something else** (with links, and update those files to link back),
anatomy, the props that matter, numbered rules each with a one-line why, what accessibility is
already handled versus what the caller owns, a good and a bad example, and which checks cover it.

Add it to `llms.txt` with a line saying what it's for.

## 7. Check it

```bash
npm run check
```

One command, and the same set CI runs — lint, types, audit, tokens, docs, registry, the browser
checks and every story. The individual commands are in [AGENTS.md](../../AGENTS.md#commands) if
you want to run one on its own while fixing something.

`check:docs` compares the rule file with your code: exports, variants, sizes, defaults, every rule
having a reason, and every link and command it names. `check:ui` covers sizes, focus rings,
targets, axe and reflow, in light and dark.

**If your component puts a control on a surface nothing else uses** — a button inside a tinted
message, a link on a coloured row — add that pair to `PAIRS` in `scripts/check-tokens.mjs`, even
though you added no token. An unlisted pair is an unchecked pair: a secondary button on a status
tint sat at 2.93:1 for weeks because no component had put one there before.

## 8. Hand it back

Report what it's for, what it's built on, any token you added and why, the check results, and
anything you decided not to support, with the reason.
