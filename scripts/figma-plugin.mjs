// Builds the Keel tokens Figma plugin from the repo's token files.
//   npm run figma:plugin          write figma/plugin/code.js
//   node scripts/figma-plugin.mjs --check   fail if code.js is stale (run by tokens:check)
//
// The repo is the source of truth. The plugin pushes tokens into Figma and exports
// what Figma has, so `npm run figma:diff` can report drift. See docs/figma.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGIN = join(ROOT, 'figma/plugin')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const keys = (o) => Object.keys(o).filter((k) => !k.startsWith('$'))
const last = (alias) => alias.replace(/[{}]/g, '').split('.').pop()

// Figma has no system font stack, so mono uses a stand-in that ships with Figma.
const FIGMA_MONO = 'Roboto Mono'
const WEIGHT_STYLE = { regular: 'Regular', medium: 'Medium', semibold: 'SemiBold', bold: 'Bold' }

export function buildData() {
  const color = read('src/tokens/primitives/color.tokens.json').color
  const brand = read('src/tokens/primitives/brand.tokens.json')
  const font = read('src/tokens/primitives/typography.tokens.json').font
  const layout = read('src/tokens/primitives/layout.tokens.json')
  const effects = read('src/tokens/primitives/effects.tokens.json')
  const light = read('src/tokens/semantic/light.tokens.json')
  const dark = read('src/tokens/semantic/dark.tokens.json')

  // Primitives: raw colors, hidden from pickers so designers reach for semantic roles
  const primitives = []
  for (const ramp of keys(color))
    for (const step of keys(color[ramp]))
      primitives.push({ name: `color/${ramp}/${step}`, type: 'COLOR', value: color[ramp][step].$value.toUpperCase(), scopes: [], description: `color.${ramp}.${step}` })

  const scale = []
  for (const k of keys(layout.space))
    scale.push({ name: `space/${k}`, type: 'FLOAT', value: layout.space[k].$value.value, scopes: ['GAP', 'WIDTH_HEIGHT'], web: `calc(var(--spacing) * ${k.replace('-', '.')})`, description: layout.space[k].$description || `space.${k}` })
  for (const k of keys(brand.radius))
    scale.push({ name: `radius/${k}`, type: 'FLOAT', value: brand.radius[k].$value.value, scopes: ['CORNER_RADIUS'], web: `var(--keel-radius-${k})`, description: brand.radius[k].$description || `radius.${k}` })

  const sans = brand.font.family.sans.$value
  const type = [
    { name: 'font/family/sans', type: 'STRING', value: sans[1] || sans[0], scopes: ['FONT_FAMILY'], web: 'var(--keel-font-sans)', description: 'Interface and headings' },
    { name: 'font/family/mono', type: 'STRING', value: FIGMA_MONO, scopes: ['FONT_FAMILY'], web: 'var(--keel-font-mono)', description: 'Figma stand-in for the code system mono stack' },
  ]
  for (const k of keys(font.weight))
    type.push({ name: `font/weight/${k}`, type: 'FLOAT', value: font.weight[k].$value, scopes: ['FONT_WEIGHT'], web: `${font.weight[k].$value}`, description: font.weight[k].$description || '' })
  for (const k of keys(font.size))
    type.push({ name: `font/size/${k}`, type: 'FLOAT', value: font.size[k].$value.value, scopes: ['FONT_SIZE'], web: `var(--keel-font-size-${k})`, description: font.size[k].$description || `font.size.${k}` })
  for (const k of keys(font['line-height']))
    type.push({ name: `font/line-height/${k}`, type: 'FLOAT', value: font['line-height'][k].$value.value, scopes: ['LINE_HEIGHT'], web: `var(--keel-line-height-${k})`, description: `Pairs with font/size/${k}` })

  // Semantic colors: Light and Dark modes, each an alias to a primitive
  const flat = (n, path = [], o = {}) => {
    if ('$value' in n) return ((o[path.join('.')] = n), o)
    for (const [k, v] of Object.entries(n)) if (!k.startsWith('$') && v && typeof v === 'object') flat(v, [...path, k], o)
    return o
  }
  const L = flat(light.color), D = flat(dark.color)
  const prim = (a) => 'color/' + a.replace(/[{}]/g, '').replace(/^color\./, '').replace(/\./g, '/')
  const semantic = Object.keys(L).map((p) => ({
    name: p.replace(/\./g, '/'),
    values: { Light: prim(L[p].$value), Dark: prim(D[p].$value) },
    scopes: colorScopes(p),
    description: [L[p].$description, `Tailwind: ${twClass(p)}`].filter(Boolean).join(' · '),
    web: `var(--keel-${p.replace(/\./g, '-')})`,
  }))

  const pct = (em) => Math.round(parseFloat(em) * 1000) / 10 // 0.04em -> 4 (%)
  const sizeOf = (k) => font.size[k].$value.value
  const lhOf = (k) => font['line-height'][k].$value.value
  const ts = light['text-style']
  const textStyles = keys(ts).map((k) => {
    const v = ts[k].$value
    const mono = v.fontFamily.includes('mono')
    const size = last(v.fontSize), lh = last(v.lineHeight)
    const ls = font['letter-spacing'][last(v.letterSpacing)].$value
    return {
      name: styleName(k),
      family: mono ? FIGMA_MONO : sans[1] || sans[0],
      style: WEIGHT_STYLE[last(v.fontWeight)],
      size: sizeOf(size),
      lineHeight: lhOf(lh),
      letterSpacing: pct(typeof ls === 'object' ? `${ls.value}` : ls),
      upper: k === 'overline',
      bindings: { fontFamily: `font/family/${mono ? 'mono' : 'sans'}`, fontSize: `font/size/${size}`, lineHeight: `font/line-height/${lh}` },
      description: [ts[k].$description, `Tailwind: text-${k}`, `CSS: var(--keel-type-${k}-size)`].filter(Boolean).join(' · '),
    }
  })

  const effectStyles = keys(effects.shadow).map((k) => ({
    name: `Shadow/${k}`,
    description: `${effects.shadow[k].$description} · CSS: var(--keel-shadow-${k}) · Tailwind: shadow-${k}`,
    layers: effects.shadow[k].$value.map((s) => ({ color: s.color.toUpperCase(), x: s.offsetX.value, y: s.offsetY.value, blur: s.blur.value, spread: s.spread.value })),
  }))

  return {
    raw: [
      { name: 'Primitives', variables: primitives },
      { name: 'Scale', variables: scale },
      { name: 'Type', variables: type },
    ],
    color: { modes: ['Light', 'Dark'], variables: semantic },
    textStyles,
    effectStyles,
  }
}

// What the plugin's "Export Figma variables" should return when Figma matches the repo.
export function expectedExport(data = buildData()) {
  const out = { variables: {}, textStyles: {}, effectStyles: {} }
  for (const coll of data.raw)
    for (const t of coll.variables)
      out.variables[`${coll.name}/${t.name}`] = { modes: { Value: t.value }, scopes: [...t.scopes].sort(), web: t.web || '' }
  for (const t of data.color.variables)
    out.variables[`Color/${t.name}`] = { modes: Object.fromEntries(Object.entries(t.values).map(([m, v]) => [m, `{${v}}`])), scopes: [...t.scopes].sort(), web: t.web }
  for (const s of data.textStyles)
    out.textStyles[s.name] = { family: s.family, style: s.style, size: s.size, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, upper: s.upper, bindings: s.bindings }
  for (const s of data.effectStyles) out.effectStyles[s.name] = s.layers
  return out
}

function colorScopes(p) {
  const end = p.split('.').pop()
  if (p.startsWith('text.')) return ['TEXT_FILL']
  if (p.startsWith('surface.')) return ['FRAME_FILL', 'SHAPE_FILL']
  if (p.startsWith('border.') || end === 'border' || p.startsWith('focus.')) return ['STROKE_COLOR']
  if (end === 'fg' || end === 'on-solid') return ['TEXT_FILL', 'SHAPE_FILL']
  if (end === 'indicator') return ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']
  return ['FRAME_FILL', 'SHAPE_FILL']
}

function twClass(p) {
  const name = p.replace(/^text\./, 'fg.').replace(/^border\./, 'line.').replace(/\./g, '-')
  const end = p.split('.').pop()
  if (p.startsWith('text.') || end === 'fg' || end === 'on-solid') return `text-${name}`
  if (p.startsWith('border.') || end === 'border') return `border-${name}`
  if (p === 'focus.ring') return `ring-${name}`
  return `bg-${name}`
}

function styleName(k) {
  const fixed = { display: 'Display', caption: 'Caption', overline: 'Overline', code: 'Code' }
  return fixed[k] || k.replace(/^(\w+)-(\w+)$/, (_, a, b) => a[0].toUpperCase() + a.slice(1) + '/' + b)
}

function buildCode() {
  const header = '// GENERATED by scripts/figma-plugin.mjs from src/tokens. Do not edit; run `npm run figma:plugin`.\n'
  return header + `const DATA = ${JSON.stringify(buildData())};\n\n` + readFileSync(join(PLUGIN, 'runtime.js'), 'utf8')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = join(PLUGIN, 'code.js')
  const code = buildCode()
  if (process.argv.includes('--check')) {
    if (!existsSync(file) || readFileSync(file, 'utf8') !== code) {
      console.error('figma/plugin/code.js is out of date. Run: npm run figma:plugin')
      process.exit(1)
    }
  } else {
    writeFileSync(file, code)
    const d = buildData()
    const n = d.raw.reduce((a, c) => a + c.variables.length, 0) + d.color.variables.length
    console.log(`figma/plugin/code.js: ${n} variables, ${d.textStyles.length} text styles, ${d.effectStyles.length} effect styles`)
  }
}
