// Audits source files against the rules in AGENTS.md that a machine can judge.
//   npm run audit                 audit src/
//   npm run audit -- src/demo     audit one path
//   npm run audit -- --quiet      only the summary line
//
// Every rule here is one from AGENTS.md, with its number and its why, so a finding teaches the
// rule rather than just pointing at a line. The exemptions are code, not a note in a doc: a rule
// that cries wolf gets ignored, and then it protects nothing.
//
// What this can't judge — one primary per group, whether a label says what happens, whether the
// right component was used — is in .claude/commands/audit.md for a person or an AI to read.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const quiet = args.includes('--quiet')
const scopes = args.filter((a) => !a.startsWith('--'))
// Generated files are built from the tokens and checked by tokens:check; auditing them would
// report the token values themselves.
const SKIP = ['src/brand.generated.ts', 'src/styles/keel.css']

// The one place raw token values belong is the page whose subject is the tokens: a swatch has to
// be painted with the ramp step it documents, and primitives have no CSS variable to point at.
// Everywhere else, an inline style or a raw value is a finding.
const TOKEN_DOCS = ['src/demo/TokensPage.tsx', 'src/demo/token-data.ts']

// Arbitrary Tailwind values that describe structure rather than a design value. Rule 9 allows
// these: there is no token for a grid template or a viewport fraction.
const STRUCTURAL = [
  /^(aria|data|has|in|group|peer|supports|not)-/, // state selectors: aria-[current=page]:
  /^grid-(cols|rows)-/, // grid templates
  /^transition-/, // property lists: transition-[opacity,scale]
  /^(min-|max-)?[wh]-\[[\d.]+(vw|vh|dvh|svh|lvh|%)\]$/, // viewport and percentage limits
  /\[calc\(.*--spacing\(/, // calc() built from the spacing scale
  /^(top|bottom|left|right|inset)-/, // positioning against the viewport
  /^z-/,
]

const rules = [
  {
    id: 'raw-color',
    rule: 2,
    why: 'a raw color was never contrast-checked, and it stays the same when the brand or the mode changes',
    fix: 'use a semantic class: text-fg-*, bg-surface-*, border-line-*, bg-action-*, *-status-*',
    find: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\boklch\(|\bhsla?\(/g,
    allow: (line, file) => TOKEN_DOCS.includes(file) || /^\s*(\/\/|\*)/.test(line),
  },
  {
    id: 'palette-class',
    rule: 2,
    why: "Tailwind's default palette is removed in Keel, so these classes don't exist and silently do nothing",
    fix: 'use a semantic class, e.g. bg-action-primary-bg instead of bg-blue-600',
    find: /\b(bg|text|border|ring|outline|fill|stroke|from|to|via)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|stone)-\d{2,3}\b/g,
  },
  {
    id: 'opacity-fade',
    rule: 3,
    why: "transparency changes contrast depending on what's behind it, so it can't be checked",
    fix: 'use the disabled tokens for disabled states; keep opacity for enter and exit animations and the dialog backdrop',
    find: /\bopacity-\d+\b|\b(bg|text|border|outline|ring)-[a-z-]+\/\d+\b/g,
    allow: (line, _file, match) =>
      // Animations fade; so does the scrim, which is a token used at a fixed opacity.
      /data-(starting|ending)-style:/.test(line) || /surface-scrim/.test(line) || /opacity-0\b/.test(match),
  },
  {
    id: 'off-scale',
    rule: '7, 9',
    why: 'the scale keeps everything on a 4px grid and pairs each size with its line height, so one-off values break the rhythm',
    fix: 'use the scale: text-body-sm, p-3, gap-4, h-10, rounded-lg',
    find: /\b[a-z][a-z-]*-\[[^\]]+\]/g,
    allow: (_line, _file, match) => STRUCTURAL.some((re) => re.test(match)) || /\[&|\[>|\[\.\.\./.test(match),
  },
  {
    id: 'inline-style',
    rule: '2, 9',
    why: 'an inline style skips the tokens, so it is never checked and never changes with the brand or the mode',
    fix: 'use token classes; if a value is genuinely dynamic, pass var(--keel-*)',
    find: /style=\{\{[^}]*\}/g,
    allow: (_line, file, match) => TOKEN_DOCS.includes(file) || /var\(--keel-|var\(\$\{|`var\(/.test(match),
  },
  {
    id: 'primitive-in-ui',
    rule: 4,
    why: "primitives don't change between light and dark or between brands; the semantic role does",
    fix: 'use the semantic role, e.g. bg-surface-subtle instead of the neutral ramp',
    find: /\bcolor\.(neutral|accent)\.\d{2,3}\b/g,
    allow: (_line, file) => file.startsWith('src/tokens/') || TOKEN_DOCS.includes(file),
  },
]

function files(dir) {
  const out = []
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) out.push(...files(path))
    else if (/\.(tsx?|css)$/.test(entry.name) && !SKIP.includes(path)) out.push(path)
  }
  return out
}

const targets = (scopes.length ? scopes : ['src']).flatMap((scope) => {
  const path = relative(ROOT, join(ROOT, scope))
  return statSync(join(ROOT, path)).isDirectory() ? files(path) : [path]
})

const findings = []
for (const file of targets) {
  const lines = readFileSync(join(ROOT, file), 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const rule of rules)
      for (const m of line.matchAll(rule.find)) {
        if (rule.allow?.(line, file, m[0])) continue
        findings.push({ file, line: i + 1, rule, match: m[0].slice(0, 60) })
      }
  })
}

if (!quiet)
  for (const f of findings) {
    console.log(`${f.file}:${f.line}  ${f.match}`)
    console.log(`    rule ${f.rule.rule} — ${f.rule.why}`)
    console.log(`    fix: ${f.rule.fix}\n`)
  }

const counted = [...new Set(findings.map((f) => f.rule.id))]
console.log(
  findings.length
    ? `Audit: ${findings.length} finding(s) in ${new Set(findings.map((f) => f.file)).size} file(s) — ${counted.join(', ')}.`
    : `Audit: ${targets.length} files, no findings. Rules a machine can't judge are in .claude/commands/audit.md.`,
)
process.exit(findings.length ? 1 : 0)
