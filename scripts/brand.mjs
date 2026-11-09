#!/usr/bin/env node
// Turns a brand file into Keel's brand-dependent primitives.
//
//   npm run tokens:brand          write the generated files
//   npm run tokens:brand:check    fail if they are stale or a contrast rule breaks
//   BRAND=acme npm run tokens     build from src/tokens/brands/acme.brand.json
//
// Reads  src/tokens/brands/<BRAND>.brand.json   (default: keel)
// Writes src/tokens/primitives/color.tokens.json  every color ramp (accent, neutral, status)
//        src/tokens/primitives/brand.tokens.json  font.family.sans and the radius scale
//        src/brand.generated.ts                   name and logo for the app shell
//
// Ramps are built in OKLCH (perceptual lightness L, chroma C, hue h) and fitted to sRGB.
// If a brand's accent fails a contrast rule, its darker steps are lowered in lightness
// until it passes, so any brand color produces an accessible system.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BRAND = process.env.BRAND || 'keel'
const brand = JSON.parse(readFileSync(join(ROOT, `src/tokens/brands/${BRAND}.brand.json`), 'utf8'))
const OUT = {
  color: join(ROOT, 'src/tokens/primitives/color.tokens.json'),
  brand: join(ROOT, 'src/tokens/primitives/brand.tokens.json'),
  ts: join(ROOT, 'src/brand.generated.ts'),
}
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// ---- shared curves ----
// Accent and neutral curves are the same for every brand; only hue (and neutral tint) change.
const ACCENT_L = [0.97, 0.93, 0.87, 0.79, 0.69, 0.6, 0.52, 0.455, 0.39, 0.32, 0.25]
const ACCENT_C = [0.02, 0.045, 0.08, 0.12, 0.16, 0.19, 0.2, 0.18, 0.15, 0.115, 0.085]
const NEUTRAL_L = [0.985, 0.965, 0.925, 0.87, 0.65, 0.55, 0.45, 0.37, 0.28, 0.21, 0.15]
const NEUTRAL_C = [0.003, 0.006, 0.01, 0.015, 0.022, 0.025, 0.025, 0.025, 0.022, 0.02, 0.018]
const TINT = { none: 0, subtle: 1, strong: 1.8 }
// Status hues are fixed across brands so danger always looks like danger.
const STATUS_L = [0.975, 0.94, 0.885, 0.81, 0.72, 0.62, 0.53, 0.46, 0.39, 0.32, 0.25]
const STATUS = {
  green: { h: 150, C: [0.025, 0.05, 0.09, 0.13, 0.16, 0.155, 0.135, 0.115, 0.095, 0.075, 0.055], description: 'Success status. Shared by every brand.' },
  amber: { h: 75, C: [0.03, 0.06, 0.1, 0.14, 0.16, 0.155, 0.13, 0.11, 0.09, 0.07, 0.05], description: 'Warning status. Light steps take dark text, never white. Shared by every brand.' },
  red: { h: 25, C: [0.015, 0.035, 0.065, 0.11, 0.16, 0.2, 0.2, 0.17, 0.14, 0.11, 0.08], description: 'Danger and error only, never decorative. Shared by every brand.' },
}
const RADIUS_BASE = { none: 0, sm: 4, md: 6, lg: 8, xl: 12, '2xl': 16 }
const RADIUS_STYLE = { sharp: 0.5, default: 1, rounded: 1.5 }
const RADIUS_USE = { sm: 'Checkboxes, badges, tags', md: 'Small controls', lg: 'Buttons, inputs, selects', xl: 'Cards, popovers', '2xl': 'Dialogs, large panels' }

// Contrast rules every brand must meet (WCAG 2.2). `on` is a hex or another ramp step.
const WHITE = '#FFFFFF'
const RULES = [
  { ramp: 'neutral', step: 400, on: WHITE, min: 3, why: 'control borders on white (WCAG 1.4.11)' },
  { ramp: 'neutral', step: 400, on: 'neutral.50', min: 3, why: 'control borders on the subtle surface' },
  { ramp: 'neutral', step: 500, on: WHITE, min: 4.5, why: 'lightest gray allowed for text on white' },
  { ramp: 'neutral', step: 900, on: WHITE, min: 7, why: 'primary text on white' },
  { ramp: 'accent', step: 600, on: WHITE, min: 4.5, why: 'white label on the primary button; links on white' },
  { ramp: 'accent', step: 700, on: WHITE, min: 7, why: 'hover/pressed button and hovered links' },
  { ramp: 'accent', step: 500, on: WHITE, min: 3, why: 'focus ring on white (non-text)' },
  { ramp: 'accent', step: 400, on: 'accent.950', min: 4.5, why: 'dark label on the dark-mode primary button' },
  { ramp: 'green', step: 600, on: WHITE, min: 4.5, why: 'success text and fills' },
  { ramp: 'amber', step: 700, on: WHITE, min: 4.5, why: 'warning text on white' },
  { ramp: 'red', step: 600, on: WHITE, min: 4.5, why: 'danger text and destructive button' },
  { ramp: 'amber', step: 300, on: 'amber.950', min: 4.5, why: 'dark label on a warning fill' },
]

// ---- color math ----
function oklchToLinear(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}
function hexToHue(hex) {
  const lin = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = [lin(1), lin(3), lin(5)]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return Math.round(((Math.atan2(B, A) * 180) / Math.PI + 360) % 360)
}
const inGamut = (rgb) => rgb.every((c) => c >= -0.0005 && c <= 1.0005)
function fitChroma(L, C, h) {
  if (inGamut(oklchToLinear(L, C, h))) return C
  let lo = 0
  let hi = C
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToLinear(L, mid, h))) lo = mid
    else hi = mid
  }
  return lo
}
const enc = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const toHex = (rgb) => '#' + rgb.map((c) => Math.round(enc(Math.min(Math.max(c, 0), 1)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
function lum(hex) {
  const lin = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5)
}
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d

// ---- ramps ----
function buildRamp(h, L, C) {
  return STEPS.map((step, i) => {
    const c = fitChroma(L[i], C[i], h)
    return { step, L: L[i], C: c, h, hex: toHex(oklchToLinear(L[i], c, h)) }
  })
}
const check = (ramps) =>
  RULES.map((r) => {
    const hex = (key) => ramps[key.split('.')[0]].find((s) => s.step === Number(key.split('.')[1])).hex
    const ratio = contrast(hex(`${r.ramp}.${r.step}`), r.on.startsWith('#') ? r.on : hex(r.on))
    return { ...r, ratio, ok: ratio >= r.min }
  })

const accentHue = brand.accent.seed ? hexToHue(brand.accent.seed) : brand.accent.hue
const tint = TINT[brand.neutral.tint]
if (accentHue === undefined || tint === undefined || !RADIUS_STYLE[brand.radius.style]) {
  console.error(`${BRAND}.brand.json: needs accent.hue or accent.seed, neutral.tint (none|subtle|strong), radius.style (sharp|default|rounded)`)
  process.exit(1)
}
const ramps = {
  neutral: buildRamp(brand.neutral.hue, NEUTRAL_L, NEUTRAL_C.map((c) => c * tint)),
  accent: buildRamp(accentHue, ACCENT_L, ACCENT_C),
  ...Object.fromEntries(Object.entries(STATUS).map(([n, s]) => [n, buildRamp(s.h, STATUS_L, s.C)])),
}

// Accessible by construction: darken the accent's working steps until its rules pass.
let shift = 0
while (check(ramps).some((r) => !r.ok && r.ramp === 'accent') && shift < 0.2) {
  shift = round(shift + 0.005, 3)
  ramps.accent = buildRamp(accentHue, ACCENT_L.map((l, i) => (STEPS[i] >= 500 ? l - shift : l)), ACCENT_C)
}

const results = check(ramps)
for (const r of results) console.log(`${r.ok ? 'pass' : 'FAIL'}  ${r.ramp}.${r.step} on ${r.on}  ${r.ratio}:1 (needs ${r.min})  ${r.why}`)
if (shift) console.log(`\nAccent steps 500-950 darkened by ${shift} lightness so ${brand.name}'s accent passes.`)

// ---- outputs ----
const descriptions = {
  neutral: `${brand.name} neutral (hue ${brand.neutral.hue}, ${brand.neutral.tint} tint). Text, surfaces, borders.`,
  accent: `${brand.name} accent (hue ${accentHue}). Actions only: buttons, links, focus, selection.`,
  ...Object.fromEntries(Object.entries(STATUS).map(([n, s]) => [n, s.description])),
}
const color = {
  $description: `Primitive color ramps for ${brand.name}. GENERATED by scripts/brand.mjs from src/tokens/brands/${BRAND}.brand.json; do not edit by hand. Components use semantic tokens, never these.`,
  color: {
    base: { $type: 'color', $description: 'Pure white and black.', white: { $value: '#FFFFFF' }, black: { $value: '#000000' } },
    ...Object.fromEntries(
      Object.entries(ramps).map(([name, steps]) => [
        name,
        {
          $type: 'color',
          $description: descriptions[name],
          ...Object.fromEntries(
            steps.map((s) => [
              s.step,
              {
                $value: s.hex,
                $extensions: {
                  'com.keel.oklch': `oklch(${round(s.L, 3)} ${round(s.C, 3)} ${s.h})`,
                  'com.keel.contrast': { onWhite: contrast(s.hex, WHITE), onBlack: contrast(s.hex, '#000000') },
                },
              },
            ]),
          ),
        },
      ]),
    ),
  },
}
const k = RADIUS_STYLE[brand.radius.style]
const brandTokens = {
  $description: `Brand-dependent primitives for ${brand.name}. GENERATED by scripts/brand.mjs; do not edit by hand.`,
  font: {
    family: {
      $type: 'fontFamily',
      sans: { $value: [...brand.font.sans, 'ui-sans-serif', 'system-ui', 'sans-serif'], $description: `Interface and headings (${brand.font.package}).` },
    },
  },
  radius: {
    $type: 'dimension',
    $description: `Radius scale, ${brand.radius.style} style.`,
    ...Object.fromEntries(Object.entries(RADIUS_BASE).map(([n, v]) => [n, { $value: { value: Math.round(v * k), unit: 'px' }, ...(RADIUS_USE[n] && { $description: RADIUS_USE[n] }) }])),
    full: { $value: { value: 9999, unit: 'px' }, $description: 'Pills, avatars, switches' },
  },
}
const ts = `// GENERATED by scripts/brand.mjs from src/tokens/brands/${BRAND}.brand.json. Do not edit.
export const brand = ${JSON.stringify({ id: BRAND, name: brand.name, logo: { wordmark: brand.logo.wordmark, src: brand.logo.src, alt: brand.logo.alt } }, null, 2)} as const
`
const files = [
  [OUT.color, JSON.stringify(color, null, 2) + '\n'],
  [OUT.brand, JSON.stringify(brandTokens, null, 2) + '\n'],
  [OUT.ts, ts],
]

const failed = results.filter((r) => !r.ok)
if (process.argv.includes('--check')) {
  const stale = files.filter(([p, body]) => {
    try {
      return readFileSync(p, 'utf8') !== body
    } catch {
      return true
    }
  })
  if (failed.length || stale.length) {
    if (stale.length) console.error(`\nOut of date: ${stale.map(([p]) => p.replace(ROOT + '/', '')).join(', ')}. Run npm run tokens.`)
    if (failed.length) console.error(`\n${failed.length} contrast rule(s) failed for ${brand.name}.`)
    process.exit(1)
  }
  console.log(`\n${brand.name}: generated files are up to date and every contrast rule passes.`)
} else {
  if (failed.length) {
    console.error(`\n${failed.length} contrast rule(s) failed for ${brand.name}; nothing written.`)
    process.exit(1)
  }
  for (const [p, body] of files) {
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  console.log(`\nWrote ${files.map(([p]) => p.replace(ROOT + '/', '')).join(', ')}`)
}
