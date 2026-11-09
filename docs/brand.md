# Brands

Keel is white-label. Everything that differs between brands lives in one file, `src/tokens/brands/<brand>.brand.json`. Components, semantic tokens and rules are shared.

## What a brand controls

| Field | Values | What it changes |
| --- | --- | --- |
| `name` | text | Brand name in generated code |
| `logo.wordmark`, `logo.src`, `logo.alt` | text, path under `public/` or `null` | App shell logo (wordmark until an image is set) |
| `accent.hue` or `accent.seed` | 0–360, or a hex like `"#105FD9"` | Buttons, links, focus ring, selection |
| `neutral.hue` | 0–360 (255 cool, 70 warm) | Direction of the gray tint |
| `neutral.tint` | `none`, `subtle`, `strong` | How tinted the grays are |
| `font.sans`, `font.package` | font family names, npm package | Interface typeface |
| `radius.style` | `sharp`, `default`, `rounded` | Corner radius (0.5×, 1×, 1.5×) |

What a brand does **not** control, on purpose: status colors (green, amber, red always mean success, warning, danger), the type scale, spacing, motion, and every contrast rule.

## Make a new brand

1. Copy `src/tokens/brands/keel.brand.json` to `src/tokens/brands/acme.brand.json` and change the values.
2. If the font changes, install it (`npm i @fontsource-variable/inter`) and replace the font import at the top of `src/index.css`.
3. Run `BRAND=acme npm run tokens`.

That regenerates the color ramps, font and radius tokens, `src/brand.generated.ts`, and `src/styles/keel.css`, then runs every check.

## Accessible by construction

Any accent color works. The generator builds the ramp on Keel's shared lightness curve, so the button and link steps are dark enough for white text, and it darkens them further if a rule still fails. A bright yellow seed becomes a deep mustard button (`#786900`, 5.5:1 with white) while its light steps stay bright for tints and dark mode.

If a brand can't pass, nothing is written and the build names the rule that failed.

## How it fits together

```text
brands/keel.brand.json ─► scripts/brand.mjs ─► primitives/color.tokens.json  (accent, neutral, status ramps)
                                              primitives/brand.tokens.json  (font, radius)
                                              src/brand.generated.ts        (name, logo)
semantic/light|dark.tokens.json  (point at accent.* and neutral.*, never a brand hue)
                     └──────────► scripts/build-tokens.mjs ─► src/styles/keel.css ─► Tailwind + shadcn
```
