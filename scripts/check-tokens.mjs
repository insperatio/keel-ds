#!/usr/bin/env node
// Checks every primitive token file against Keel's rules.
//   npm run tokens:check
// Fails (exit 1) and lists each broken rule. Runs the color contrast check too.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'src/tokens/primitives')
const TYPES = new Set(['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'shadow', 'number'])
const errors = []
const fail = (path, msg) => errors.push(`${path}: ${msg}`)

// Walk a DTCG tree, yielding every token with its inherited $type.
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

const isDim = (v) => v && typeof v.value === 'number' && ['px', 'rem', 'em'].includes(v.unit)
const tokens = {}

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.tokens.json'))) {
  let json
  try {
    json = JSON.parse(readFileSync(join(DIR, file), 'utf8'))
  } catch (e) {
    fail(file, `not valid JSON (${e.message})`)
    continue
  }
  for (const tok of walk(json)) {
    tokens[tok.path] = tok
    if (!TYPES.has(tok.type)) fail(tok.path, `missing or unknown $type "${tok.type}"`)
    if (tok.type === 'dimension' && !isDim(tok.value)) fail(tok.path, 'dimension must be {"value": number, "unit": "px"|"rem"|"em"}')
    if (tok.type === 'duration' && !(tok.value && typeof tok.value.value === 'number' && tok.value.unit === 'ms')) fail(tok.path, 'duration must be {"value": number, "unit": "ms"}')
    if (tok.type === 'cubicBezier' && !(Array.isArray(tok.value) && tok.value.length === 4)) fail(tok.path, 'cubicBezier needs 4 numbers')
  }
}

const px = (p) => tokens[p]?.value?.value
const under = (prefix) => Object.keys(tokens).filter((p) => p.startsWith(prefix + '.'))

// Spacing sits on the 4px grid (the 2px hairline is the one named exception).
for (const p of under('space')) {
  if (p === 'space.0-5') continue
  if (px(p) % 4 !== 0) fail(p, `${px(p)}px is off the 4px grid`)
  const n = Number(p.split('.')[1])
  if (!Number.isNaN(n) && px(p) !== n * 4) fail(p, `name says ${n * 4}px but value is ${px(p)}px`)
}

// Every font size has a matching line-height on the 4px grid, at least 1.15x the size.
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

// Motion stays quick; nothing in the interface animates longer than 400ms.
for (const p of under('duration')) if (px(p) > 400) fail(p, `${px(p)}ms is longer than the 400ms limit`)

// Colors: contrast rules and generated-file freshness live in color-ramps.mjs.
try {
  execFileSync(process.execPath, [join(ROOT, 'scripts/color-ramps.mjs'), '--check'], { stdio: 'pipe' })
} catch (e) {
  fail('color', (e.stderr?.toString() || 'color check failed').trim())
}

const count = Object.keys(tokens).length
if (errors.length) {
  console.error(`Token check failed (${errors.length}):\n- ` + errors.join('\n- '))
  process.exit(1)
}
console.log(`All ${count} primitive tokens pass Keel's rules.`)
