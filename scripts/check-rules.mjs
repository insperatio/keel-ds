// Checks the per-component rule files in docs/rules against the code they describe,
// so a rule file can't quietly drift from the component.
//   npm run check:rules
//
// For each docs/rules/*.md (except _template.md):
// 1. Frontmatter is complete, and `source` and `import` point at a file that exists.
// 2. Every name in `exports` is really exported from that file.
// 3. Every value in `variants` and `sizes` exists in the component's variant definition
//    (following sibling imports, so Input and Select find control.ts).
// 4. `defaults` match the code's defaults (cva defaultVariants or a prop default).
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

/** The {...} block that follows `key:`, with braces balanced. */
function block(text, key) {
  const start = text.indexOf(`${key}: {`)
  if (start === -1) return ''
  let depth = 0
  for (let i = text.indexOf('{', start); i < text.length; i++) {
    if (text[i] === '{') depth++
    if (text[i] === '}' && --depth === 0) return text.slice(start, i + 1)
  }
  return ''
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

  for (const [key, list] of [['variant', fm.variants], ['size', fm.sizes]]) {
    if (!list?.length) continue
    const variantBlock = block(code, key)
    if (!variantBlock) {
      fail(file, `frontmatter lists ${key}s but no "${key}: {" block was found in the source`)
      continue
    }
    for (const value of list)
      if (!new RegExp(`(^|[\\s{])${value}:`, 'm').test(variantBlock)) fail(file, `${key} "${value}" is not defined in the source`)
  }

  const componentBody = code.slice(code.indexOf(`function ${fm.component}(`))
  const cvaDefaults = block(code, 'defaultVariants')
  for (const [key, value] of Object.entries(fm.defaults ?? {})) {
    const inCva = new RegExp(`${key}:\\s*'${value}'`).test(cvaDefaults)
    const inProps = new RegExp(`${key}\\s*=\\s*'${value}'`).test(componentBody.slice(0, 400))
    if (!inCva && !inProps) fail(file, `default ${key} "${value}" does not match the source`)
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

const components = readdirSync(join(ROOT, 'src/components/ui')).filter((f) => f.endsWith('.tsx')).length
console.log(`${files.length} rule files checked, covering ${files.length} of ${components} components.`)

if (failures.length) {
  console.error(`\nRule check failed (${failures.length}):\n- ` + failures.join('\n- '))
  process.exit(1)
}
console.log('Rule files match the code they describe.')
