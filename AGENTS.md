# AGENTS.md: rules for building with Keel

Read this first. It applies to every AI tool and every person writing code in this repo.
Each rule has a one-line **why**. When a case isn't covered, follow the why.

Keel is a token-driven design system: React 19, TypeScript, Tailwind CSS v4, and
shadcn/ui on Base UI. Every color, size and duration comes from token files that are
checked for accessibility, so if you use the tokens and the components as described
here, the result is on-brand and accessible by default.

## Read next

| When you are | Read |
| --- | --- |
| Building UI | The component's source in `src/components/ui/`. The comment at the top is its usage guide. |
| Making or changing a brand | `docs/brand.md` |
| Syncing with Figma | `docs/figma.md` |
| Looking for a working page to copy | `src/demo/SettingsPage.tsx`, built only from Keel |

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Demo site: tokens, components, and an example settings page |
| `npm run tokens` | Rebuild everything from the token files, then run all token checks |
| `npm run tokens:check` | Check tokens: contrast pairs, aliases, grid, generated files up to date |
| `npm run check:ui` | Build, then test the demo pages in a real browser (light and dark) |
| `npm run lint` | Lint |

**Done means** `npm run tokens:check`, `npm run check:ui` and `npm run lint` all pass.
Don't call work finished until they do.

## Rules

### Color

1. **Use semantic color classes only:** `text-fg-*`, `bg-surface-*`, `border-line-*`,
   `bg-action-*`, `*-status-*`, `*-selected-*`, `outline-focus-ring`.
   Why: semantic names switch for dark mode and for every brand; raw values don't.
2. **Never write a raw color:** no hex, `rgb()`, `oklch()` or Tailwind palette classes
   like `bg-blue-600`. The default palette is removed, so those classes don't exist.
   Why: a raw color was never contrast-checked and breaks the moment the brand changes.
3. **Never fade a color with opacity.** No `bg-x/50`, and no `opacity-50` for a disabled state.
   Opacity is only for enter and exit animations (`data-starting-style:opacity-0`) and the
   dialog backdrop (`bg-surface-scrim opacity-60`).
   Why: transparency changes contrast depending on what's behind it, so it can't be checked.
4. **Don't use primitives** (`color.neutral.500`) in UI code. If no semantic role fits,
   add one (see "Adding a token").
   Why: primitives don't change in dark mode or between brands.
5. **Accent means actionable.** Use it for buttons, links, focus, selection and nothing else.
   Badges and status never use accent.
   Why: people learn that the accent color can be clicked; decorative accent breaks that.
6. **Prefer Keel names over the shadcn aliases** (`bg-surface-page`, not `bg-background`).
   Why: the aliases exist so shadcn code keeps working; Keel names say what the color is for.

### Type

7. **Use text styles only:** `text-display`, `text-heading-xl|lg|md|sm`, `text-body-lg|md|sm`,
   `text-label-md|sm`, `text-caption`, `text-overline`, `text-code`. Never `text-[13px]`.
   Why: each style pairs size, line height, weight and spacing on a 4px grid.
8. **One `h1` per page,** in `PageHeader`. Headings go in order, and you choose the level
   by structure, not size (`CardTitle as="h2"`).
   Why: screen reader users navigate by headings.

### Space and layout

9. **Use the spacing scale** (`p-4`, `gap-3`, `mt-6`). No arbitrary design values: no
   `p-[13px]`, `w-[317px]` or `text-[13px]`. Arbitrary syntax is fine for structure that has
   no token, such as state selectors (`aria-[current=page]:`), grid templates
   (`grid-cols-[1fr_auto]`), transition property lists, and `calc()` built from `--spacing()`.
   Why: everything sits on a 4px grid, so layouts line up without measuring.
10. **Give flex and grid children `min-w-0`** when they contain a Table, Tabs or long text.
    Why: flex and grid items won't shrink below their content, and one wide table pushed
    a page to 657px on a 375px phone.
11. **Make scroll containers `relative`.**
    Why: absolutely positioned children (like screen-reader-only text) otherwise escape the
    scroll area and widen the page.
12. **Every page reflows at 320px** with no sideways scrolling (WCAG 1.4.10).
    Why: phones and 400% zoom both land here; `check:ui` tests it.
13. **Radius and shadow come from the scale:** `rounded-sm|md|lg|xl|2xl|full`, `shadow-sm|md|lg|xl`.
    Why: the brand file can make every corner sharper or rounder at once.

### Components

14. **Use a Keel component before writing your own markup.** Import it from
    `@/components/ui/*`. Don't override its colors with `className`.
    Why: each one already handles states, focus, keyboard and screen readers.
15. **One primary Button per group.** Secondary is the default. Use danger for destructive
    actions, behind an `AlertDialog`.
    Why: one primary tells people what the main next step is.
16. **Button labels say what happens** ("Save changes", "Delete project"), never "OK" or "Yes".
    Why: the label is often read on its own, out of context.
17. **Every `IconButton` gets a `label`** that names the action ("Delete row", not "Trash").
    It's required by the types.
    Why: it is the only name screen readers get.
18. **Controls in one row share a `size`.** Button, IconButton, Input and Select are
    32 / 40 / 48px for sm / md / lg.
    Why: a row lines up without custom heights.
19. **Every Input and Select goes in a `Field` with a `FieldLabel`.** The placeholder is a
    format hint, never the label. A `FieldError` says what to do: "Enter an email like
    name@example.com", not "Invalid".
    Why: the label, help and error are wired to the control for screen readers.
20. **Use Checkbox for choices that are saved with a form and Switch for settings that apply
    immediately.** Use Select for 3 to 15 options, Tabs for 2 to 7 views of the same thing
    (not steps or page links), and Badge for status the person can't click.
    Why: each control promises a behavior; using the wrong one breaks that promise.
21. **Tables need a `caption`.** Use `numeric` for numbers. Never use a table for layout.
    Why: the caption names the table; screen readers rely on the table structure.
22. **To make a card clickable, give `CardTitle` an `href`.** Never wrap a card in `<a>` or
    `<button>`.
    Why: one link named by the title instead of the whole card read aloud as a link.
23. **Every Dialog has a `DialogTitle`.** Confirm destructive actions with `AlertDialog`,
    where focus starts on Cancel.
    Why: the title names the dialog, and a stray Enter must not delete anything.
24. **A toast is never the only place for important information or an action.** Choose the
    type by meaning: `toast.error`, not "red".
    Why: toasts can be missed; errors and warnings already stay until dismissed.

### Accessibility

25. **Never remove the focus ring.** No `outline-none` without a visible replacement (a ring on
    another element, or a highlight for menu options). Every focusable element gets Keel's 2px
    ring by default, including regions that receive focus from a shortcut, like F6 for toasts.
    Why: keyboard users can't see where they are without it.
26. **Never show state with color alone.** Pair color with text, an icon, a check mark,
    an underline or a bar.
    Why: about 1 in 12 men has a color vision deficiency.
27. **Use real elements:** `<button>` for actions and `<a href>` for navigation. Never put
    `onClick` on a `<div>`.
    Why: real elements come with keyboard support and roles for free.
28. **Targets are at least 24 × 24px,** or have that much space around them (WCAG 2.5.8).
    Why: small, crowded targets cause mis-taps.
29. **Use motion tokens and respect reduced motion:** `duration-(--keel-duration-*)`,
    `ease-standard|enter|exit`, `motion-reduce:transition-none`. Nothing longer than 400ms.
    Why: motion should help people follow a change, not slow them down or make them sick.

### Tokens and files

30. **Never edit generated files:** `src/styles/keel.css`,
    `src/tokens/primitives/color.tokens.json`, `src/tokens/primitives/brand.tokens.json`,
    `src/brand.generated.ts`, `figma/plugin/code.js`. Edit the source, then run `npm run tokens`.
    Why: `tokens:check` fails when a generated file doesn't match its source.
31. **The repo is the source of truth.** If something changed in Figma, run `npm run figma:diff`
    and move the change into the token files.
    Why: the contrast checks live in the repo; a color edited in Figma was never checked.
32. **Add every new `.md` file to `llms.txt`.**
    Why: AI tools find the docs through that index.

## Adding a token

1. Add the role to `src/tokens/semantic/light.tokens.json` **and** `dark.tokens.json`, as
   an alias (`{color.neutral.50}`), never a raw value. Give it a `$description` that says
   where it's used.
2. Add every new text/background or border/background pair to `PAIRS` in
   `scripts/check-tokens.mjs`, with its minimum: 4.5 for text, 3 for borders, icons and fills.
3. Run `npm run tokens`. If a pair fails, pick a different primitive. Don't lower the minimum.
4. Update Figma with the Keel tokens plugin ("Update Figma from repo"), then use
   `npm run figma:diff` to confirm.

## Adding a component

1. Build it on Base UI if Base UI has it. Style it only with token classes.
2. Put a usage comment at the top: when to use it, when not to, and a short example.
3. Add `data-slot`, plus `data-size` if it has sizes.
4. Show it on the components page (`src/demo/ComponentsPage.tsx`), with its states.
5. Run `npm run check:ui` in light and dark, at 320px.

## Anti-patterns

| Don't | Do | Why |
| --- | --- | --- |
| `text-[#1a73e8]`, `bg-blue-600` | `text-fg-link`, `bg-action-primary-bg` | Raw colors aren't checked or themed |
| `opacity-50` on a disabled button | `disabled` (uses disabled tokens) | Opacity fails contrast unpredictably |
| `text-[13px] leading-[18px]` | `text-body-sm` | Off-scale sizes break rhythm |
| `p-[13px]`, `mt-[7px]` | `p-3`, `mt-2` | Off-grid spacing doesn't line up |
| `outline-none` on a custom control | Keep the default ring | Keyboard users get lost |
| `<div onClick>` | `<Button>` or `<a href>` | No keyboard, no role |
| Placeholder as the label | `FieldLabel` + optional placeholder hint | The placeholder vanishes when typing |
| Two primary buttons side by side | One primary, one secondary or ghost | Two primaries means no primary |
| A red dot as the only error sign | Error text + icon + `border-line-danger` | Color alone isn't seen by everyone |
| `<a>` around a whole Card | `CardTitle href` | One clear link name |
| A toast for a required decision | `Dialog` or inline message | Toasts can be missed |
| Accent color on a badge | `Badge tone="neutral"` | Accent means "clickable" |
| Editing `keel.css` | Edit tokens, run `npm run tokens` | Generated files get overwritten |

## Where things live

```
src/tokens/brands/keel.brand.json   the brand: name, logo, accent hue, neutrals, font, radius
src/tokens/primitives/              raw scales (color and brand files are generated)
src/tokens/semantic/                light and dark roles, aliases only
src/styles/keel.css                 generated CSS variables and Tailwind theme
src/components/ui/                  the components; each file's top comment is its guide
src/demo/                           demo site: tokens, components, example settings page
scripts/                            token build, checks, UI check, Figma plugin and diff
figma/plugin/                       Keel tokens Figma plugin
docs/                               guides: brand.md, figma.md
```
