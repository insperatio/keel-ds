#!/usr/bin/env node
// Builds src/styles/keel.css from the token files.
//   npm run tokens:build         write the CSS
//   npm run tokens:build:check   fail if the CSS is out of date
//
// Output, in order:
//   :root       light-mode semantic colors + every scale (type, radius, shadow, motion) as --keel-* variables
//   .dark       dark-mode semantic colors (same names)
//   @theme      Tailwind utilities that point at those variables
//
// Naming (one rule, so people and AI can predict any class):
//   token path            CSS variable                   Tailwind class
//   color.text.secondary  --keel-text-secondary          text-fg-secondary
//   color.surface.subtle  --keel-surface-subtle          bg-surface-subtle
//   color.border.control  --keel-border-control          border-line-control
//   color.action.primary  --keel-action-primary-bg       bg-action-primary-bg
//   text-style.body-md    --keel-type-body-md-*          text-body-md
// "text" becomes "fg" and "border" becomes "line" in class names, so you
// write text-fg-secondary, not text-text-secondary.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const OUT = join(ROOT, 'src/styles/keel.css')

const primitives = Object.assign(
  {},
  ...['color', 'brand', 'typography', 'layout', 'effects'].map((f) => flatten(read(`src/tokens/primitives/${f}.tokens.json`))),
)
const light = flatten(read('src/tokens/semantic/light.tokens.json'))
const dark = flatten(read('src/tokens/semantic/dark.tokens.json'))

function flatten(node, path = [], type, out = {}) {
  const t = node.$type ?? type
  if ('$value' in node) {
    out[path.join('.')] = { type: t, value: node.$value }
    return out
  }
  for (const [k, v] of Object.entries(node)) if (!k.startsWith('$') && v && typeof v === 'object') flatten(v, [...path, k], t, out)
  return out
}
const alias = (v) => {
  const m = typeof v === 'string' && v.match(/^\{([^{}]+)\}$/)
  if (!m) return v
  if (!primitives[m[1]]) throw new Error(`Unresolved alias {${m[1]}}`)
  return primitives[m[1]].value
}
const dim = (v) => `${v.value}${v.unit}`
const css = (v, type) => {
  v = alias(v)
  if (type === 'dimension' || type === 'duration') return dim(v)
  if (type === 'fontFamily') return v.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ')
  if (type === 'cubicBezier') return `cubic-bezier(${v.join(', ')})`
  if (type === 'shadow') return v.map((s) => `${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${s.color}`).join(', ')
  return String(v)
}

const kebab = (path) => path.replace(/\./g, '-')
const colorVar = (path) => `--keel-${kebab(path.replace(/^color\./, ''))}`
const twColor = (path) => `--color-${kebab(path.replace(/^color\./, '').replace(/^text\./, 'fg.').replace(/^border\./, 'line.'))}`

// ---- :root and .dark: semantic colors ----
const colorPaths = Object.keys(light).filter((p) => light[p].type === 'color')
const rootColors = colorPaths.map((p) => `  ${colorVar(p)}: ${css(light[p].value, 'color')};`)
const darkColors = colorPaths.map((p) => `  ${colorVar(p)}: ${css(dark[p].value, 'color')};`)

// ---- :root: scales ----
const scale = (prefix, varPrefix) =>
  Object.keys(primitives)
    .filter((p) => p.startsWith(prefix + '.'))
    .map((p) => [p.slice(prefix.length + 1), `--keel-${varPrefix}-${kebab(p.slice(prefix.length + 1))}`, css(primitives[p].value, primitives[p].type)])

const families = scale('font.family', 'font')
const sizes = scale('font.size', 'font-size')
const leadings = scale('font.line-height', 'line-height')
const radii = scale('radius', 'radius')
const shadows = scale('shadow', 'shadow')
const durations = scale('duration', 'duration')
const easings = scale('easing', 'ease')

const styles = Object.keys(light)
  .filter((p) => light[p].type === 'typography')
  .map((p) => {
    const name = p.replace(/^text-style\./, '')
    const v = light[p].value
    return {
      name,
      vars: [
        [`--keel-type-${name}-family`, css(v.fontFamily, 'fontFamily')],
        [`--keel-type-${name}-size`, css(v.fontSize, 'dimension')],
        [`--keel-type-${name}-line-height`, css(v.lineHeight, 'dimension')],
        [`--keel-type-${name}-weight`, css(v.fontWeight, 'fontWeight')],
        [`--keel-type-${name}-tracking`, css(v.letterSpacing, 'dimension')],
      ],
    }
  })

const decl = (rows) => rows.map(([, n, v]) => `  ${n}: ${v};`)
const root = [
  '  /* Semantic colors (light) */',
  ...rootColors,
  '',
  '  /* Type */',
  ...decl(families),
  ...decl(sizes),
  ...decl(leadings),
  ...styles.flatMap((s) => s.vars.map(([n, v]) => `  ${n}: ${v};`)),
  '',
  '  /* Radius, shadow, motion */',
  ...decl(radii),
  ...decl(shadows),
  ...decl(durations),
  ...decl(easings),
]

// ---- @theme: Tailwind utilities ----
const sizeName = (k) => (k === 'md' ? 'base' : k) // Tailwind calls 16px "base"
const theme = [
  '  /* Only Keel colors exist. Tailwind\'s palette (bg-red-500, text-gray-400...) is removed on purpose. */',
  '  --color-*: initial;',
  '  --color-white: #FFFFFF;',
  '  --color-black: #000000;',
  ...colorPaths.map((p) => `  ${twColor(p)}: var(${colorVar(p)});`),
  '',
  '  /* Fonts */',
  ...families.map(([k, n]) => `  --font-${k}: var(${n});`),
  '',
  '  /* Font sizes: only Keel\'s scale. text-sm, text-base, text-lg... keep working with Keel line-heights. */',
  '  --text-*: initial;',
  ...sizes.flatMap(([k, n]) => [`  --text-${sizeName(k)}: var(${n});`, `  --text-${sizeName(k)}--line-height: var(--keel-line-height-${k});`]),
  '',
  '  /* Text styles: one class sets size, line-height, weight and tracking (text-body-md, text-heading-lg) */',
  ...styles.flatMap((s) => [
    `  --text-${s.name}: var(--keel-type-${s.name}-size);`,
    `  --text-${s.name}--line-height: var(--keel-type-${s.name}-line-height);`,
    `  --text-${s.name}--font-weight: var(--keel-type-${s.name}-weight);`,
    `  --text-${s.name}--letter-spacing: var(--keel-type-${s.name}-tracking);`,
  ]),
  '',
  '  /* Radius, shadow, easing */',
  ...radii.map(([k, n]) => `  --radius-${k}: var(${n});`),
  ...shadows.map(([k, n]) => `  --shadow-${k}: var(${n});`),
  ...easings.map(([k, n]) => `  --ease-${k}: var(${n});`),
]

const out = [
  '/* GENERATED by scripts/build-tokens.mjs from src/tokens. Do not edit; run npm run tokens:build. */',
  '',
  ':root {',
  ...root,
  '}',
  '',
  '.dark {',
  '  /* Semantic colors (dark). Same names as :root. */',
  ...darkColors,
  '}',
  '',
  '@theme inline {',
  ...theme,
  '}',
  '',
].join('\n')

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(OUT, 'utf8')
  } catch {}
  if (current !== out) {
    console.error('src/styles/keel.css is out of date; run npm run tokens:build')
    process.exit(1)
  }
  console.log('src/styles/keel.css is up to date.')
} else {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, out)
  console.log(`Wrote src/styles/keel.css: ${colorPaths.length} colors x 2 modes, ${sizes.length} sizes, ${styles.length} text styles, ${radii.length} radii, ${shadows.length} shadows.`)
}
