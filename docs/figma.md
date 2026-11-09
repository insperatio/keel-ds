# Figma sync

The repo is the source of truth for every token. Figma gets its variables and styles from
the repo through the **Keel tokens** plugin, and any change made directly in Figma is
detected and reported, never silently kept.

```
src/tokens/*.json ──npm run tokens──▶ figma/plugin/code.js ──"Update Figma from repo"──▶ Figma
        ▲                                                                                   │
        └──────── npm run figma:diff ◀── figma-export.json ◀──"Export Figma variables"──────┘
```

## Why a plugin

Figma's Variables REST API can only write on Enterprise plans. A development plugin works
on every plan, needs no token or network access, and runs the same code every time.

## Install (once)

1. Open the Keel Figma file in the **Figma desktop app**.
2. Menu → Plugins → Development → **Import plugin from manifest…**
3. Choose `figma/plugin/manifest.json` from your clone of this repo.

The plugin now appears under Plugins → Development → **Keel tokens**.

## Repo → Figma

1. Change tokens in `src/tokens/` (or the brand file), then run `npm run tokens`.
   That regenerates the CSS **and** `figma/plugin/code.js`, then runs every check.
2. In Figma, run **Keel tokens → Update Figma from repo**.

The update is safe to repeat. It finds variables and styles by name and updates them in
place, so everything already bound to them in your designs keeps working. It creates
anything missing and never deletes.

What it writes:

| Figma | From | Notes |
| --- | --- | --- |
| `Primitives` collection | `color.tokens.json` | Hidden from pickers (no scopes). Use semantic colors. |
| `Scale` collection | spacing, radius | Scoped to gap/size and corner radius |
| `Type` collection | font family, weight, size, line height | Mono uses Roboto Mono as a Figma stand-in |
| `Color` collection, Light and Dark modes | `semantic/*.tokens.json` | Aliases to Primitives, with `var(--keel-*)` code syntax and the Tailwind class in the description |
| Text styles | `text-style.*` | Size, line height and family bound to `Type` variables |
| Effect styles `Shadow/*` | `shadow.*` | |

## Figma → repo (drift check)

1. Run **Keel tokens → Export Figma variables**, then **Download figma-export.json**.
2. Run `npm run figma:diff -- path/to/figma-export.json`.

It lists every difference and exits with code 1 if there is any:

```
Figma drift (3):
  changed            variables Primitives/color/accent/600 modes: repo {"Value":"#105FD9"}, Figma {"Value":"#1A66E0"}
  only in Figma      variables Color/brand/hero
  missing in Figma   effectStyles Shadow/xl
```

Then decide, for each line:

- **Figma was right** (a designer found a better value): make the change in `src/tokens/`,
  run `npm run tokens` so the contrast and grid checks approve it, then Update Figma from repo.
- **Figma was wrong**: run Update Figma from repo to put the repo value back.
  Variables that exist only in Figma are not removed; delete them by hand if unwanted.

Changes always go through the token files because that is where the checks live. A color
edited in Figma has never been contrast-checked.

## Files

| File | Role |
| --- | --- |
| `figma/plugin/manifest.json` | Plugin manifest. No network access. |
| `figma/plugin/runtime.js` | Plugin logic (push and export). Edit this one. |
| `figma/plugin/code.js` | **Generated**: token data + runtime. Never edit. |
| `figma/plugin/ui.html` | Plugin window |
| `scripts/figma-plugin.mjs` | Builds `code.js`; `--check` fails if it is stale |
| `scripts/figma-diff.mjs` | Compares an export with the repo |

`npm run tokens:check` fails if `code.js` is out of date, so the plugin can never ship
older tokens than the CSS.
