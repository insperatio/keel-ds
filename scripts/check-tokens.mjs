#!/usr/bin/env node
// Checks every token file against Keel's rules.
//   npm run tokens:check
// Fails (exit 1) and lists each broken rule.
//
// Primitives (src/tokens/primitives) hold raw values.
// Semantic tokens (src/tokens/semantic) may ONLY alias primitives, and the
// colors they pair must meet WCAG contrast. Color ramps are generated and checked by
// scripts/brand.mjs, which this script also runs.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PRIMITIVES = join(ROOT, 'src/tokens/primitives')
const SEMANTIC = join(ROOT, 'src/tokens/semantic')
const TYPES = new Set(['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'shadow', 'number', 'typography'])
const errors = []
const fail = (path, msg) => errors.push(`${path}: ${msg}`)

// ---- loading ----
function* walk(node, path = [], type) {
  const t = node.$type ?? type
  if ('$value' in node) {
    yield { path: path.join('.'), type: t, value: node.$value }
    return
  }
  for (const [k, v] of Object.entries(node)) {
    if (!k.startsWith('$') && v && typeof v === 'object') yield* walk(v, [...path, k], t)
  }
}
function load(dir) {
  const out = {}
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.tokens.json'))) {
    let json
    try {
      json = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    } catch (e) {
      fail(file, `not valid JSON (${e.message})`)
      continue
    }
    out[file] = {}
    for (const tok of walk(json)) {
      out[file][tok.path] = tok
      if (!TYPES.has(tok.type)) fail(`${file} ${tok.path}`, `missing or unknown $type "${tok.type}"`)
    }
  }
  return out
}

const primitiveFiles = load(PRIMITIVES)
const primitives = Object.assign({}, ...Object.values(primitiveFiles))
const semanticFiles = load(SEMANTIC)

// ---- primitive rules ----
const isDim = (v) => v && typeof v.value === 'number' && ['px', 'rem', 'em'].includes(v.unit)
for (const tok of Object.values(primitives)) {
  if (tok.type === 'dimension' && !isDim(tok.value)) fail(tok.path, 'dimension must be {"value": number, "unit": "px"|"rem"|"em"}')
  if (tok.type === 'duration' && !(tok.value && typeof tok.value.value === 'number' && tok.value.unit === 'ms')) fail(tok.path, 'duration must be {"value": number, "unit": "ms"}')
  if (tok.type === 'cubicBezier' && !(Array.isArray(tok.value) && tok.value.length === 4)) fail(tok.path, 'cubicBezier needs 4 numbers')
  if (typeof tok.value === 'string' && tok.value.startsWith('{')) fail(tok.path, 'primitives hold raw values, not aliases')
}
const px = (p) => primitives[p]?.value?.value
const under = (prefix) => Object.keys(primitives).filter((p) => p.startsWith(prefix + '.'))

for (const p of under('space')) {
  if (p === 'space.0-5') continue
  if (px(p) % 4 !== 0) fail(p, `${px(p)}px is off the 4px grid`)
  const n = Number(p.split('.')[1])
  if (!Number.isNaN(n) && px(p) !== n * 4) fail(p, `name says ${n * 4}px but value is ${px(p)}px`)
}
for (const p of under('font.size')) {
  const key = p.split('.').pop()
  const lh = px(`font.line-height.${key}`)
  if (!Number.isInteger(px(p))) fail(p, 'font sizes must be whole pixels')
  if (lh === undefined) fail(p, `no font.line-height.${key} to pair with`)
  else {
    if (lh % 4 !== 0) fail(`font.line-height.${key}`, `${lh}px is off the 4px grid`)
    if (lh < px(p) * 1.15) fail(`font.line-height.${key}`, `${lh}px is too tight for ${px(p)}px text`)
  }
}
for (const p of under('duration')) if (px(p) > 400) fail(p, `${px(p)}ms is longer than the 400ms limit`)

// ---- semantic rules ----
const ALIAS = /^\{([^{}]+)\}$/
function resolveAlias(where, ref, expectedType) {
  const m = typeof ref === 'string' && ref.match(ALIAS)
  if (!m) {
    fail(where, `raw value ${JSON.stringify(ref)}; semantic tokens must alias a primitive like "{color.neutral.900}"`)
    return undefined
  }
  const target = primitives[m[1]]
  if (!target) {
    fail(where, `alias {${m[1]}} does not exist in the primitives`)
    return undefined
  }
  if (expectedType && target.type !== expectedType) fail(where, `{${m[1]}} is a ${target.type}, expected ${expectedType}`)
  return target.value
}
const TYPO_FIELDS = { fontFamily: 'fontFamily', fontSize: 'dimension', lineHeight: 'dimension', fontWeight: 'fontWeight', letterSpacing: 'dimension' }

// Contrast pairs every mode must meet: [foreground, background, minimum, why]
const PAIRS = [
  ['text.primary', 'surface.page', 4.5, 'body text'],
  ['text.primary', 'surface.subtle', 4.5, 'body text on subtle sections'],
  ['text.primary', 'surface.sunken', 4.5, 'body text in wells'],
  ['text.secondary', 'surface.page', 4.5, 'supporting text'],
  ['text.secondary', 'surface.subtle', 4.5, 'supporting text on subtle sections'],
  ['text.tertiary', 'surface.page', 4.5, 'captions and placeholders'],
  ['text.tertiary', 'surface.subtle', 4.5, 'captions on subtle sections'],
  ['text.primary', 'surface.raised', 4.5, 'text on cards'],
  ['text.secondary', 'surface.raised', 4.5, 'supporting text on cards'],
  ['text.primary', 'surface.overlay', 4.5, 'text in popovers and dialogs'],
  ['text.secondary', 'surface.overlay', 4.5, 'supporting text in popovers and dialogs'],
  ['text.tertiary', 'surface.overlay', 4.5, 'captions in popovers and dialogs'],
  ['text.link', 'surface.page', 4.5, 'links'],
  ['text.link-hover', 'surface.page', 4.5, 'hovered links'],
  ['text.link', 'surface.subtle', 4.5, 'links on subtle sections'],
  ['text.danger', 'surface.page', 4.5, 'error messages'],
  ['text.success', 'surface.page', 4.5, 'success messages'],
  ['text.warning', 'surface.page', 4.5, 'warning messages'],
  ['text.inverse', 'surface.inverse', 4.5, 'tooltips and toasts'],
  ['action.primary.fg', 'action.primary.bg', 4.5, 'primary button'],
  ['action.primary.fg', 'action.primary.bg-hover', 4.5, 'primary button, hover'],
  ['action.primary.fg', 'action.primary.bg-active', 4.5, 'primary button, pressed'],
  ['action.secondary.fg', 'action.secondary.bg', 4.5, 'secondary button'],
  ['action.secondary.fg', 'action.secondary.bg-hover', 4.5, 'secondary button, hover'],
  ['action.ghost.fg', 'action.ghost.bg-hover', 4.5, 'ghost button, hover'],
  ['action.danger.fg', 'action.danger.bg', 4.5, 'destructive button'],
  ['action.danger.fg', 'action.danger.bg-hover', 4.5, 'destructive button, hover'],
  ['selected.fg', 'selected.bg', 4.5, 'selected row or nav item'],
  ['selected.indicator', 'selected.bg', 3, 'selection marker inside the selected row (WCAG 1.4.1, 1.4.11)'],
  ['selected.indicator', 'surface.page', 3, 'selection marker against the page'],
  ['action.secondary.border', 'surface.page', 3, 'secondary button outline, its only edge (WCAG 1.4.11)'],
  ['action.secondary.border', 'surface.subtle', 3, 'secondary button outline on subtle sections'],
  ['status.success.fg', 'status.success.bg', 4.5, 'success banner'],
  ['status.warning.fg', 'status.warning.bg', 4.5, 'warning banner'],
  ['status.danger.fg', 'status.danger.bg', 4.5, 'error banner'],
  ['status.info.fg', 'status.info.bg', 4.5, 'info banner'],
  ['status.success.on-solid', 'status.success.solid', 4.5, 'solid success badge'],
  ['status.warning.on-solid', 'status.warning.solid', 4.5, 'solid warning badge'],
  ['status.danger.on-solid', 'status.danger.solid', 4.5, 'solid danger badge'],
  ['status.info.on-solid', 'status.info.solid', 4.5, 'solid info badge'],
  ['border.control', 'surface.page', 3, 'input borders (WCAG 1.4.11)'],
  ['border.control', 'surface.subtle', 3, 'input borders on subtle sections'],
  ['focus.ring', 'surface.page', 3, 'focus ring (WCAG 2.4.11)'],
  ['focus.ring', 'surface.subtle', 3, 'focus ring on subtle sections'],
]

function luminance(hex) {
  const lin = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}

let semanticCount = 0
const report = []
for (const [file, toks] of Object.entries(semanticFiles)) {
  const colors = {}
  for (const tok of Object.values(toks)) {
    semanticCount++
    const where = `${file} ${tok.path}`
    if (tok.type === 'typography') {
      for (const [field, type] of Object.entries(TYPO_FIELDS)) {
        if (!(field in (tok.value || {}))) fail(where, `typography is missing ${field}`)
        else resolveAlias(`${where}.${field}`, tok.value[field], type)
      }
    } else {
      const v = resolveAlias(where, tok.value, tok.type)
      if (tok.type === 'color' && v) colors[tok.path.replace(/^color\./, '')] = v
    }
  }
  for (const [fg, bg, min, why] of PAIRS) {
    if (!colors[fg] || !colors[bg]) {
      fail(file, `contrast pair ${fg} on ${bg} is missing a token`)
      continue
    }
    const ratio = contrast(colors[fg], colors[bg])
    const ok = ratio >= min
    if (!ok) fail(`${file} ${fg} on ${bg}`, `${ratio}:1, needs ${min}:1 (${why})`)
    report.push(`${ok ? 'pass' : 'FAIL'}  ${file}  ${fg} on ${bg}  ${ratio}:1`)
  }
}

// Every mode must define exactly the same names, so components never hit a missing token.
const names = Object.entries(semanticFiles).map(([file, toks]) => [file, new Set(Object.keys(toks))])
for (const [fileA, a] of names) {
  for (const [fileB, b] of names) {
    if (fileA >= fileB) continue
    for (const n of a) if (!b.has(n)) fail(fileB, `missing ${n} (defined in ${fileA})`)
    for (const n of b) if (!a.has(n)) fail(fileA, `missing ${n} (defined in ${fileB})`)
  }
}

// ---- colors: ramp contrast rules and generated-file freshness ----
try {
  execFileSync(process.execPath, [join(ROOT, 'scripts/brand.mjs'), '--check'], { stdio: 'pipe' })
} catch (e) {
  fail('color ramps', (e.stderr?.toString() || 'color check failed').trim())
}

// ---- generated CSS must match the tokens ----
try {
  execFileSync(process.execPath, [join(ROOT, 'scripts/build-tokens.mjs'), '--check'], { stdio: 'pipe' })
} catch (e) {
  fail('src/styles/keel.css', (e.stderr?.toString() || 'CSS check failed').trim())
}

if (process.argv.includes('--verbose')) console.log(report.join('\n') + '\n')
if (errors.length) {
  console.error(`Token check failed (${errors.length}):\n- ` + errors.join('\n- '))
  process.exit(1)
}
console.log(`All ${Object.keys(primitives).length} primitive and ${semanticCount} semantic tokens pass. ${report.length} contrast pairs checked.`)
