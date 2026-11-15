// Checks the documentation against the code and against itself:
//   npm run check:docs
//
// Part 1, the index: every .md file in the repo is listed in llms.txt, every link in llms.txt
// resolves, and llms.txt has the title and summary the llmstxt.org format expects.
//
// Part 2, the rule files in docs/rules, so one can't quietly drift from its component:
//
// For each docs/rules/*.md (except _template.md):
// 1. Frontmatter is complete, and `source` and `import` point at a file that exists.
// 2. Every name in `exports` is really exported from that file.
// 3. Every value in `variants`, `sizes`, `tones`, `densities` and `types` exists in the source,
//    whether the component defines them with cva, a const object, or a TypeScript union
//    (following sibling imports, so Input and Select find control.ts).
// 4. `defaults` match the code (cva defaultVariants, or a prop default in `component`
//    or in the function named by `defaultsFrom`).
// 5. The body has the sections the template requires, and every numbered rule has a why.
// 6. Links to other files resolve, and every `npm run x` named exists in package.json.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RULES = join(ROOT, 'docs/rules')
const SECTIONS = ['## Use it when', '## Use something else when', '## Rules', '## Accessibility', '## Examples', '## Checked by']
const KEYS = ['component', 'source', 'import', 'exports', 'variants', 'sizes', 'defaults']
const scripts = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts

const failures = []
const fail = (file, msg) => failures.push(`${file}: ${msg}`)

// ---- Part 1: llms.txt indexes every document ----
const index = readFileSync(join(ROOT, 'llms.txt'), 'utf8')
if (!/^# .+/m.test(index)) fail('llms.txt', 'no "# Title" line')
if (!/^> .+/m.test(index)) fail('llms.txt', 'no "> summary" blockquote')

const docs = []
;(function walk(dir) {
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const path = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) walk(path)
    else if (entry.name.endsWith('.md')) docs.push(path)
  }
})('')

for (const doc of docs) if (!index.includes(`(${doc})`)) fail('llms.txt', `does not list ${doc}`)
for (const m of index.matchAll(/\]\(([^)]+)\)/g)) {
  const target = m[1].replace(/\/$/, '')
  if (!existsSync(join(ROOT, target))) fail('llms.txt', `links to ${m[1]}, which does not exist`)
}

// ---- Part 2: rule files match their components ----

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return null
  const out = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (!kv) continue
    const [, key, raw] = kv
    const value = raw.trim()
    if (value.startsWith('[')) out[key] = value.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
    else if (value.startsWith('{'))
      out[key] = Object.fromEntries(
        value.slice(1, -1).split(',').map((s) => s.split(':').map((p) => p.trim())).filter(([k]) => k),
      )
    else out[key] = value.replace(/^["']|["']$/g, '')
  }
  return out
}

/** The source file plus any sibling files it imports, so shared variants are found. */
function sourceText(sourcePath) {
  const main = readFileSync(join(ROOT, sourcePath), 'utf8')
  let text = main
  for (const m of main.matchAll(/from '\.\/([\w-]+)'/g)) {
    for (const ext of ['.ts', '.tsx']) {
      const sibling = join(ROOT, dirname(sourcePath), m[1] + ext)
      if (existsSync(sibling)) text += '\n' + readFileSync(sibling, 'utf8')
    }
  }
  return text
}

/** The {...} block that starts at `opener`, with braces balanced. */
function block(text, opener) {
  const start = text.indexOf(opener)
  if (start === -1) return ''
  let depth = 0
  for (let i = text.indexOf('{', start); i < text.length; i++) {
    if (text[i] === '{') depth++
    if (text[i] === '}' && --depth === 0) return text.slice(start, i + 1)
  }
  return ''
}

/**
 * Everywhere a component might define the values of one axis: a cva variants block
 * (`variant: { ... }`), a const object (`const sizes = { ... }`), or a TypeScript union
 * (`type Density = 'comfortable' | 'compact'`).
 */
function definedValues(code, key) {
  let text = block(code, `${key}: {`) + block(code, `const ${key}s = {`)
  for (const m of code.matchAll(/^type\s+(\w+)\s*=\s*([^\n;]+)/gm)) if (m[1].toLowerCase().includes(key)) text += '\n' + m[2]
  return text
}

const files = readdirSync(RULES).filter((f) => f.endsWith('.md') && f !== '_template.md')
if (!files.length) fail('docs/rules', 'no rule files found')

for (const file of files) {
  const text = readFileSync(join(RULES, file), 'utf8')
  const fm = frontmatter(text)
  if (!fm) {
    fail(file, 'no frontmatter')
    continue
  }
  for (const key of KEYS) if (!(key in fm)) fail(file, `frontmatter is missing "${key}"`)
  if (!fm.source) continue

  if (!existsSync(join(ROOT, fm.source))) {
    fail(file, `source ${fm.source} does not exist`)
    continue
  }
  const importPath = (fm.import ?? '').replace(/^@\//, 'src/')
  if (importPath && !['.ts', '.tsx'].some((ext) => existsSync(join(ROOT, importPath + ext))))
    fail(file, `import "${fm.import}" does not resolve to a file`)

  const code = sourceText(fm.source)
  const exported = new Set()
  for (const m of code.matchAll(/export\s*\{([^}]*)\}/g))
    for (const name of m[1].split(',')) {
      const clean = name.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()
      if (clean) exported.add(clean)
    }
  for (const m of code.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+(\w+)/g)) exported.add(m[1])
  for (const name of fm.exports ?? []) if (!exported.has(name)) fail(file, `exports lists "${name}", which ${fm.source} does not export`)

  const axes = [['variant', fm.variants], ['size', fm.sizes], ['tone', fm.tones], ['density', fm.densities], ['type', fm.types]]
  for (const [key, list] of axes) {
    if (!list?.length) continue
    const defined = definedValues(code, key)
    if (!defined) {
      fail(file, `frontmatter lists ${key}s but the source defines none`)
      continue
    }
    for (const value of list)
      if (!new RegExp(`(^|[\\s{])${value}:|'${value}'`, 'm').test(defined)) fail(file, `${key} "${value}" is not defined in the source`)
  }

  // Defaults come from cva's defaultVariants or from a prop default in the function that takes
  // them, which isn't always the component itself: `defaultsFrom: DialogContent`.
  const defaultsIn = fm.defaultsFrom ?? fm.component
  const at = code.indexOf(`function ${defaultsIn}(`)
  const cvaDefaults = block(code, 'defaultVariants: {')
  if (Object.keys(fm.defaults ?? {}).length && at === -1 && !cvaDefaults)
    fail(file, `defaults are listed but the source has no "function ${defaultsIn}(" and no defaultVariants`)
  const body = at === -1 ? '' : code.slice(at)
  const signature = body.slice(0, body.indexOf(') {') + 1)
  for (const [key, value] of Object.entries(fm.defaults ?? {})) {
    // A prop default in the signature wins: cva defaults can come from a sibling file that
    // this component doesn't actually use for this axis.
    const set = new RegExp(`${key}\\s*=\\s*'?${value}'?[,\\s)]`).test(signature)
    const ok = new RegExp(`${key}\\s*=`).test(signature) ? set : new RegExp(`${key}:\\s*'?${value}'?`).test(cvaDefaults)
    if (!ok) fail(file, `default ${key} "${value}" does not match the source`)
  }

  for (const section of SECTIONS) if (!text.includes(`\n${section}\n`)) fail(file, `missing section "${section}"`)
  const rules = text.split('\n## Rules\n')[1]?.split('\n## ')[0] ?? ''
  const numbered = (rules.match(/^\d+\. \*\*/gm) ?? []).length
  const whys = (rules.match(/^\s+Why: /gm) ?? []).length
  if (numbered === 0) fail(file, 'no numbered rules')
  if (numbered !== whys) fail(file, `${numbered} rules but ${whys} "Why:" lines`)

  for (const m of text.matchAll(/\]\((?!https?:)([^)#]+)\)/g))
    if (!existsSync(resolve(RULES, m[1]))) fail(file, `link to ${m[1]} does not resolve`)
  for (const m of text.matchAll(/`npm run ([\w:]+)[^`]*`/g))
    if (!(m[1] in scripts)) fail(file, `names "npm run ${m[1]}", which package.json does not define`)
}

// Coverage counts component files, not rule files: button.md and icon-button.md both describe
// button.tsx, so the honest number is how many sources have a rule file at all.
const sources = new Set(files.map((f) => frontmatter(readFileSync(join(RULES, f), 'utf8'))?.source).filter(Boolean))
const components = readdirSync(join(ROOT, 'src/components/ui')).filter((f) => f.endsWith('.tsx'))
const uncovered = components.filter((f) => !sources.has(`src/components/ui/${f}`))
console.log(
  `llms.txt indexes all ${docs.length} documents. ` +
    `${files.length} rule files checked, covering ${sources.size} of ${components.length} components` +
    (uncovered.length ? ` (no rule file yet: ${uncovered.join(', ')})` : '') + '.',
)

if (failures.length) {
  console.error(`\nDocs check failed (${failures.length}):\n- ` + failures.join('\n- '))
  process.exit(1)
}
console.log('Docs match the code they describe.')
