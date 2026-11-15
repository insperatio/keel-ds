// Builds a shadcn-compatible registry from the components in src/components/ui, so anyone can
// install a Keel component into their own project:
//
//   npx shadcn@latest add https://insperatio.github.io/keel-ds/r/button.json
//
//   npm run registry            write registry/
//   npm run registry -- --check build and validate without writing (CI)
//
// Dependencies are read from the imports rather than typed by hand, so they can't drift:
// an npm import becomes a `dependencies` entry (with the version this repo uses), an import of
// another Keel component becomes a `registryDependencies` URL, and a sibling file that isn't a
// component of its own (control.ts) is shipped inside the item that needs it.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'registry')
const BASE = (process.env.REGISTRY_URL ?? 'https://insperatio.github.io/keel-ds').replace(/\/$/, '')
const check = process.argv.includes('--check')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

const read = (path) => readFileSync(join(ROOT, path), 'utf8')
const pinned = (name) => `${name}@${(pkg.dependencies[name] ?? pkg.devDependencies[name] ?? '').replace(/^[\^~]/, '')}`
const exists = (path) => {
  try {
    read(path)
    return true
  } catch {
    return false
  }
}

const imports = (code) => [...code.matchAll(/^import\s[^']*'([^']+)'/gm)].map((m) => m[1])
const url = (name) => `${BASE}/r/${name}.json`

// Files that aren't components in their own right, so they travel inside whoever imports them.
// brand.generated.ts carries Keel's name and logo: whoever installs the app shell gets a starting
// brand they can edit, or they pass their own logo to AppShell.
const SHARED = {
  './control': ['src/components/ui/control.ts', 'components/ui/control.ts'],
  '@/brand.generated': ['src/brand.generated.ts', 'src/brand.generated.ts'],
}

const componentFiles = readdirSync(join(ROOT, 'src/components/ui'))
  .filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
  .sort()

const problems = []
const items = []

// The tokens: every component's colors, sizes and motion come from here, so this is what makes a
// pasted component look like Keel rather than unstyled markup.
items.push({
  name: 'keel-tokens',
  type: 'registry:file',
  title: 'Keel tokens',
  description: 'Generated CSS variables and Tailwind theme. Import it after Tailwind in your global stylesheet.',
  dependencies: [pinned('tailwindcss'), pinned('tw-animate-css')],
  files: [{ path: 'src/styles/keel.css', type: 'registry:file', target: 'src/styles/keel.css' }],
})

items.push({
  name: 'utils',
  type: 'registry:lib',
  title: 'cn',
  description: "Class merging that knows Keel's text styles are font sizes, not colors.",
  dependencies: [pinned('cn')],
  // cn reads the text-style names from the token file, so that file travels with it. Hard-coding
  // the names here would be one more thing to forget when a style is added.
  files: [
    { path: 'src/lib/utils.ts', type: 'registry:lib', target: 'src/lib/utils.ts' },
    { path: 'src/tokens/semantic/light.tokens.json', type: 'registry:file', target: 'src/tokens/semantic/light.tokens.json' },
  ],
})

for (const file of componentFiles) {
  const name = file.replace('.tsx', '')
  const path = `src/components/ui/${file}`
  const code = read(path)
  const files = [{ path, type: 'registry:ui', target: `components/ui/${file}` }]
  const dependencies = new Set()
  const registryDependencies = new Set([url('keel-tokens')])

  // Walk the component, and then anything shipped with it: a shared file's own imports are the
  // item's npm dependencies too, or the install arrives missing a package.
  const queue = [[path, code]]
  for (const [from, source] of queue)
    for (const specifier of imports(source)) {
      if (specifier === 'react' || specifier.startsWith('react/')) continue // a project using shadcn already has React
      if (specifier === '@/lib/utils') registryDependencies.add(url('utils'))
      else if (SHARED[specifier]) {
        if (files.some((f) => f.path === SHARED[specifier][0])) continue
        files.push({ path: SHARED[specifier][0], type: 'registry:file', target: SHARED[specifier][1] })
        queue.push([SHARED[specifier][0], read(SHARED[specifier][0])])
      } else if (specifier.startsWith('./')) registryDependencies.add(url(specifier.slice(2)))
      else if (specifier.startsWith('@/')) problems.push(`${from} imports ${specifier}, which the registry has no rule for`)
      else {
        const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
        const version = pkg.dependencies[name]
        if (!version) problems.push(`${from} imports ${name}, which is not in dependencies`)
        else dependencies.add(`${name}@${version.replace(/^[\^~]/, '')}`)
      }
    }

  items.push({
    name,
    type: 'registry:ui',
    title: name.replace(/(^|-)([a-z])/g, (_, dash, letter) => (dash ? ' ' : '') + letter.toUpperCase()),
    description: (code.match(/^ \* (Keel [^.]+\.|[A-Z][^.]+\.)/m)?.[1] ?? '').trim(),
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
    files,
  })
}

// Every file an item promises has to exist, and every registry dependency has to be a real item.
const byName = new Map(items.map((i) => [i.name, i]))
for (const item of items) {
  for (const file of item.files) if (!exists(file.path)) problems.push(`${item.name}: ${file.path} does not exist`)
  for (const dep of item.registryDependencies ?? []) {
    const dependency = dep.split('/').pop().replace('.json', '')
    if (!byName.has(dependency)) problems.push(`${item.name}: depends on "${dependency}", which is not in the registry`)
  }
}

// Would the install actually work? Walk each item with everything it pulls in, and check that
// every import in every installed file lands on a file that was installed, or on a package the
// item declares. This is what catches a helper that quietly imports something nobody ships.
const closure = (name, seen = new Set()) => {
  if (seen.has(name) || !byName.has(name)) return seen
  seen.add(name)
  for (const dep of byName.get(name).registryDependencies ?? []) closure(dep.split('/').pop().replace('.json', ''), seen)
  return seen
}

for (const item of items) {
  const installed = [...closure(item.name)].map((n) => byName.get(n))
  const targets = new Set(installed.flatMap((i) => i.files.map((f) => f.target.replace(/^src\//, '').replace(/\.(tsx?|css|json)$/, ''))))
  const packages = new Set(installed.flatMap((i) => (i.dependencies ?? []).map((d) => d.replace(/@[^@]*$/, ''))))
  for (const file of item.files.filter((f) => exists(f.path)))
    for (const m of read(file.path).matchAll(/^import\s[^']*'([^']+)'/gm)) {
      const specifier = m[1]
      if (specifier === 'react' || specifier.startsWith('react/') || specifier.startsWith('react-dom')) continue
      const relative = specifier.startsWith('./') && `components/ui/${specifier.slice(2)}`
      const alias = specifier.startsWith('@/') && specifier.slice(2)
      const wanted = relative || alias
      if (wanted) {
        if (!targets.has(wanted.replace(/\.(tsx?|css|json)$/, ''))) problems.push(`${item.name}: ${file.target} imports ${specifier}, which nothing in its dependencies installs`)
      } else {
        const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
        if (!packages.has(name)) problems.push(`${item.name}: ${file.target} imports ${name}, which no item declares as a dependency`)
      }
    }
}

if (problems.length) {
  console.error(`Registry build failed (${problems.length}):\n- ` + problems.join('\n- '))
  process.exit(1)
}

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'keel',
  homepage: BASE,
  items: items.map(({ name, type, title, description }) => ({ name, type, title, description })),
}

if (check) {
  console.log(`Registry: ${items.length} items, every file and dependency resolves (not written).`)
  process.exit(0)
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(join(OUT, 'r'), { recursive: true })

for (const item of items) {
  const withContent = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...item,
    files: item.files.map((f) => ({ ...f, content: read(f.path) })),
  }
  writeFileSync(join(OUT, 'r', `${item.name}.json`), JSON.stringify(withContent, null, 2) + '\n')
}
writeFileSync(join(OUT, 'registry.json'), JSON.stringify(registry, null, 2) + '\n')

// A human landing page at /r/, since someone will open that in a browser before they read the docs.
// It sits beside the JSON rather than at the root, where Storybook's own index.html lives.
const rows = items
  .map(
    (i) =>
      `      <tr><td><code>${i.name}</code></td><td>${i.description ?? ''}</td><td><a href="./${i.name}.json">r/${i.name}.json</a></td></tr>`,
  )
  .join('\n')
writeFileSync(
  join(OUT, 'r', 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Keel registry</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; }
      body { margin: 0 auto; max-width: 48rem; padding: 3rem 1rem; }
      code, pre { font-family: ui-monospace, monospace; }
      pre { overflow-x: auto; padding: 1rem; background: color-mix(in srgb, currentColor 8%, transparent); border-radius: 8px; }
      table { border-collapse: collapse; width: 100%; }
      td, th { border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent); padding: 0.5rem; text-align: left; vertical-align: top; }
    </style>
  </head>
  <body>
    <h1>Keel registry</h1>
    <p>Install any Keel component into your own project. It brings the tokens with it, so it looks like Keel rather than unstyled markup.</p>
    <pre><code>npx shadcn@latest add ${BASE}/r/button.json</code></pre>
    <p><a href="${BASE}/">Storybook</a> · <a href="https://github.com/insperatio/keel-ds">Source</a> · <a href="registry.json">registry.json</a></p>
    <table>
      <thead><tr><th>Item</th><th>What it is</th><th>URL</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </body>
</html>
`,
)

console.log(`Registry: ${items.length} items written to registry/ (base ${BASE}).`)
