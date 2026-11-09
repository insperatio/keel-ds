#!/usr/bin/env node
// Generates Keel's primitive color ramps and checks their contrast.
//
//   npm run tokens:colors        write src/tokens/primitives/color.tokens.json
//   npm run tokens:colors:check  fail if the file is stale or a contrast rule breaks
//
// Each ramp is defined in OKLCH (perceptual lightness L, chroma C, hue h).
// Chroma is reduced automatically where a color would fall outside sRGB.
// Edit the RAMPS table below, never the generated JSON.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/tokens/primitives/color.tokens.json')
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// One shared lightness curve for the chromatic hues keeps steps comparable across ramps.
const L_CHROMATIC = [0.975, 0.94, 0.885, 0.81, 0.72, 0.62, 0.53, 0.46, 0.39, 0.32, 0.25]

const RAMPS = {
  slate: {
    description: 'Cool neutral. Text, surfaces, borders.',
    h: 255,
    L: [0.985, 0.965, 0.925, 0.87, 0.65, 0.55, 0.45, 0.37, 0.28, 0.21, 0.15],
    C: [0.003, 0.006, 0.01, 0.015, 0.022, 0.025, 0.025, 0.025, 0.022, 0.02, 0.018],
  },
  blue: {
    description: 'Accent. Actions only: buttons, links, focus, selection.',
    h: 260,
    L: [0.97, 0.93, 0.87, 0.79, 0.69, 0.6, 0.52, 0.455, 0.39, 0.32, 0.25],
    C: [0.02, 0.045, 0.08, 0.12, 0.16, 0.19, 0.2, 0.18, 0.15, 0.115, 0.085],
  },
  indigo: {
    description: 'Alternate accent, kept for theming (Day 10). Not used by the default theme.',
    h: 277,
    L: [0.97, 0.93, 0.87, 0.78, 0.67, 0.57, 0.49, 0.43, 0.37, 0.31, 0.24],
    C: [0.02, 0.04, 0.07, 0.11, 0.16, 0.19, 0.2, 0.18, 0.15, 0.12, 0.09],
  },
  green: {
    description: 'Success status.',
    h: 150,
    L: L_CHROMATIC,
    C: [0.025, 0.05, 0.09, 0.13, 0.16, 0.155, 0.135, 0.115, 0.095, 0.075, 0.055],
  },
  amber: {
    description: 'Warning status. Light steps take dark text, never white.',
    h: 75,
    L: L_CHROMATIC,
    C: [0.03, 0.06, 0.1, 0.14, 0.16, 0.155, 0.13, 0.11, 0.09, 0.07, 0.05],
  },
  red: {
    description: 'Danger and error status only. Never decorative.',
    h: 25,
    L: L_CHROMATIC,
    C: [0.015, 0.035, 0.065, 0.11, 0.16, 0.2, 0.2, 0.17, 0.14, 0.11, 0.08],
  },
}

// Contrast rules the ramps must meet (WCAG 2.2). `on` is the color the step is paired with.
const WHITE = '#FFFFFF'
const RULES = [
  { ramp: 'slate', step: 400, on: WHITE, min: 3, why: 'control borders (inputs, checkboxes) on white, WCAG 1.4.11' },
  { ramp: 'slate', step: 400, on: 'slate.50', min: 3, why: 'control borders on the subtle surface' },
  { ramp: 'slate', step: 500, on: WHITE, min: 4.5, why: 'lightest gray allowed for secondary text on white' },
  { ramp: 'slate', step: 900, on: WHITE, min: 7, why: 'primary text on white' },
  { ramp: 'blue', step: 600, on: WHITE, min: 4.5, why: 'white label on the primary button; links on white' },
  { ramp: 'blue', step: 700, on: WHITE, min: 7, why: 'hover/pressed button and hovered links' },
  { ramp: 'blue', step: 500, on: WHITE, min: 3, why: 'focus ring against a white surface (non-text)' },
  { ramp: 'blue', step: 400, on: 'blue.950', min: 4.5, why: 'dark label on the dark-mode primary button' },
  { ramp: 'indigo', step: 600, on: WHITE, min: 4.5, why: 'white label if a theme uses indigo as its accent' },
  { ramp: 'green', step: 600, on: WHITE, min: 4.5, why: 'success text and solid success fills' },
  { ramp: 'amber', step: 700, on: WHITE, min: 4.5, why: 'warning text on white' },
  { ramp: 'red', step: 600, on: WHITE, min: 4.5, why: 'danger text and destructive button fill' },
  { ramp: 'amber', step: 300, on: 'amber.950', min: 4.5, why: 'dark label on a warning fill' },
]

// ---- color math (OKLCH -> sRGB) ----
function oklchToLinearSrgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}
const inGamut = (rgb) => rgb.every((c) => c >= -0.0005 && c <= 1.0005)
function fitChroma(L, C, h) {
  if (inGamut(oklchToLinearSrgb(L, C, h))) return C
  let lo = 0
  let hi = C
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToLinearSrgb(L, mid, h))) lo = mid
    else hi = mid
  }
  return lo
}
const clamp = (c) => Math.min(Math.max(c, 0), 1)
const encode = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const toHex = (rgb) => '#' + rgb.map((c) => Math.round(encode(clamp(c)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
function luminanceOfHex(hex) {
  const lin = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminanceOfHex(a), luminanceOfHex(b)].sort((x, y) => y - x)
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d

// ---- build ----
const hexes = {}
const tokens = {
  $description: 'Keel primitive color ramps. GENERATED by scripts/color-ramps.mjs; do not edit by hand. Components never use these directly; they use semantic tokens.',
  color: {
    base: {
      $type: 'color',
      $description: 'Pure white and black, for text on solid fills and for contrast math.',
      white: { $value: '#FFFFFF' },
      black: { $value: '#000000' },
    },
  },
}
for (const [name, ramp] of Object.entries(RAMPS)) {
  tokens.color[name] = { $type: 'color', $description: ramp.description }
  STEPS.forEach((step, i) => {
    const C = fitChroma(ramp.L[i], ramp.C[i], ramp.h)
    const hex = toHex(oklchToLinearSrgb(ramp.L[i], C, ramp.h))
    hexes[`${name}.${step}`] = hex
    tokens.color[name][step] = {
      $value: hex,
      $extensions: {
        'com.keel.oklch': `oklch(${round(ramp.L[i], 3)} ${round(C, 3)} ${ramp.h})`,
        'com.keel.contrast': { onWhite: contrast(hex, WHITE), onBlack: contrast(hex, '#000000') },
      },
    }
  })
}

const failures = []
for (const r of RULES) {
  const fg = hexes[`${r.ramp}.${r.step}`]
  const bg = r.on.startsWith('#') ? r.on : hexes[r.on]
  const ratio = contrast(fg, bg)
  const ok = ratio >= r.min
  if (!ok) failures.push(r)
  console.log(`${ok ? 'pass' : 'FAIL'}  ${r.ramp}.${r.step} on ${r.on}  ${ratio}:1 (needs ${r.min})  ${r.why}`)
}

const json = JSON.stringify(tokens, null, 2) + '\n'
if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(OUT, 'utf8')
  } catch {}
  if (current !== json) failures.push({ stale: true })
  if (failures.length) {
    console.error(failures.some((f) => f.stale) ? '\ncolor.tokens.json is out of date; run npm run tokens:colors' : '\nContrast rules failed.')
    process.exit(1)
  }
  console.log('\ncolor.tokens.json is up to date and every contrast rule passes.')
} else {
  if (failures.length) {
    console.error('\nContrast rules failed; nothing written.')
    process.exit(1)
  }
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, json)
  console.log(`\nWrote ${OUT}`)
}
