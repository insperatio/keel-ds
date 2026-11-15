---
description: Review code against Keel's rules and report what breaks them, with the fix
argument-hint: what to audit, e.g. "src/features/billing" or "the files changed in this branch"
---

# /audit

Audit against Keel's rules: $ARGUMENTS

If no scope is given, audit the files changed against `main`. **Report; don't fix**, unless the
person asks. A fix they didn't ask for hides the finding.

## 1. Read the rules you're auditing against

`AGENTS.md` holds the 33 rules, each with its reason. `docs/rules/<component>.md` holds the
per-component rules. Quote the rule and its why in each finding, so the author learns the system
rather than just this fix.

## 2. Run the machine checks first

```bash
npm run lint && npx tsc -b
npm run tokens:check
npm run check:ui
npm run check:docs
```

Report every failure verbatim, with the file and line. These are facts; everything below is
judgment.

## 3. Grep for the rules a machine can catch

Run these over the scope. Each maps to a rule in AGENTS.md.

| Look for | Pattern | Rule |
| --- | --- | --- |
| Raw colors | `#[0-9a-fA-F]{3,8}\b`, `rgb\(`, `oklch\(` in `.tsx` | 2 |
| Tailwind palette | `(bg\|text\|border)-(red\|blue\|green\|gray\|slate\|zinc\|neutral\|amber\|indigo)-[0-9]` | 2 |
| Opacity fades | `opacity-[0-9]`, `(bg\|text\|border)-[a-z-]+/[0-9]` | 3 |
| Off-scale type or space | `(text\|p\|px\|py\|m\|mt\|gap\|w\|h)-\[[^\]]+\]` | 7, 9 |
| Removed focus | `outline-none` | 25 |
| Fake controls | `<div[^>]*onClick`, `<span[^>]*onClick` | 27 |
| Inline styles | `style=\{\{` | 2, 9 |
| Primitives in UI | `color\.(neutral\|accent)\.[0-9]` | 4 |

Allowed, so don't report them:

- opacity on enter and exit animations (`data-starting-style:opacity-0`) and the dialog backdrop;
- arbitrary syntax for structure rather than design values: state selectors
  (`aria-[current=page]:`), grid templates (`grid-cols-[1fr_auto]`), transition property lists,
  viewport limits (`max-w-[85vw]`), and `calc()` built from `--spacing()`;
- `outline-none` where a visible ring is put back somewhere else, for example on a wrapper or a
  `::after` layer;
- `style={{ ... }}` whose values are `var(--keel-*)` in a page that renders tokens dynamically,
  like the tokens page: one class per token can't exist, so the variable is the honest way.

A finding you can't justify in one line isn't a finding. Say what rule it breaks, or drop it.

## 4. Judge what no script can

Read the code and answer these. Each is a real finding when the answer is wrong.

- **One primary per group?** Count `variant="primary"` buttons per toolbar, footer and form.
- **Do labels say what happens?** "Save changes", not "OK", "Submit", "Yes".
- **Is every `IconButton` label unique and action-shaped** in lists and table rows?
- **Right component for the job?** A Switch that needs a Save button; a Select with two options;
  Tabs used for steps; a Badge with an `onClick`; a Table used for layout. Check the rule file.
- **Every control labelled?** A `Field` with a visible `FieldLabel`, not a placeholder standing in.
- **Do errors say what to do?** "Enter an email like name@example.com", not "Invalid".
- **Headings in order,** one `h1` per page, level chosen by structure rather than size?
- **State shown by more than color?** A tint, a dot or a red border with no text or icon is a finding.
- **Destructive actions confirmed** with `AlertDialog`, and the button named for what it does?
- **Is a toast carrying information or an action that exists nowhere else?**
- **Disabled things explained** nearby?
- **Does the layout survive 320px?** Look for a Table or Tabs in a flex or grid child with no
  `min-w-0`.

## 5. Report

Group findings by what they cost, most serious first:

1. **Breaks for someone** — unreachable by keyboard, invisible focus, unlabelled control,
   color as the only cue, contrast below the minimum.
2. **Breaks the system** — raw colors, off-scale sizes, a component rebuilt by hand, a generated
   file edited.
3. **Inconsistent** — two primaries, vague labels, the wrong component for the job.

For each: `file:line`, one line on what's there, the rule number and its why, and the fix as a
line of code where it's short. End with what passed, in one or two lines, and the check numbers.

If something looks wrong and no rule covers it, say so plainly and propose the rule, in the shape
the others use: one line, plus a why. A rule that comes out of a real finding is worth more than
one someone imagined.
