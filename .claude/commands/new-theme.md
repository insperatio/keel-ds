---
description: Make a new brand from Keel's one brand file, and prove it passes
argument-hint: the brand, e.g. "Acme, teal, warm grays, rounded, Inter"
---

# /new-theme

Make a new brand: $ARGUMENTS

Everything that differs between brands lives in one file. Components, semantic tokens, rules and
checks are shared. Read `docs/brand.md` first.

## 1. Decide the five things a brand controls

- **Accent** — buttons, links, focus and selection. Give `accent.hue` (0–360, OKLCH) or
  `accent.seed` as a hex. Don't hand-pick the light and dark steps: the generator builds the ramp
  and darkens the working steps until white text on the button passes AA.
- **Neutrals** — `neutral.hue` (255 cool, 70 warm) and `neutral.tint` (`none`, `subtle`, `strong`).
  Tint them toward the accent for a quiet relationship, or leave them neutral.
- **Font** — `font.sans` and `font.package`.
- **Radius** — `sharp` (0.5×), `default`, or `rounded` (1.5×).
- **Logo** — `logo.wordmark` now, `logo.src` when there's an image in `public/`.

What a brand can't change, on purpose: status colors (green, amber and red always mean success,
warning and danger), the type scale, spacing, motion, and every contrast rule. Say so if the
request asks for one of them.

## 2. Write the brand file

```bash
cp src/tokens/brands/keel.brand.json src/tokens/brands/acme.brand.json
```

Edit the values. Keep the `$description` lines; they're the guide for whoever opens it next.
If the font changed, install it and replace the font import at the top of `src/index.css`:

```bash
npm i @fontsource-variable/inter
```

## 3. Build it

```bash
BRAND=acme npm run tokens
```

This regenerates the ramps, the font and radius tokens, `src/brand.generated.ts` and
`src/styles/keel.css`, then runs every token check.

If a contrast rule fails, **nothing is written** and the build names the rule. That's the brand
being refused, not a bug. Fix it by moving the hue, lowering the chroma, or accepting the darker
accent the generator produces. Never lower a minimum in `scripts/check-tokens.mjs`.

## 4. Look at it, in both modes

```bash
npm run dev
```

Check the tokens page for the ramps and the roles, the components page for buttons, focus rings,
selection and status, and the example settings page for a real layout. Then:

```bash
npm run check:ui
```

Read the output: every control height, focus ring at 3:1, 24px targets, axe and reflow at 320px,
in light and dark. A brand that passes `tokens` can still surprise you here.

## 5. Figma

The Figma plugin is generated from whatever brand was last built, so build the brand first, then
run **Keel tokens → Update Figma from repo** in that brand's own Figma file, and confirm with:

```bash
npm run figma:diff
```

Don't push a second brand into the first brand's file: one file, one brand.

## 6. Hand it back

Report the five choices and why, whether the generator had to darken the accent (the build says
so), the check results, and anything the request asked for that a brand can't control, with what
you did instead.
