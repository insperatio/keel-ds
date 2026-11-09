// Compares a Figma export (from the Keel tokens plugin) with the repo's tokens.
//   npm run figma:diff -- path/to/figma-export.json
// Exit code 0 = Figma matches the repo. 1 = drift, with every difference listed.
// The repo wins: fix drift by changing the token files (then `npm run tokens` and
// "Update Figma from repo"), or by re-running "Update Figma from repo" to undo a Figma edit.
import { readFileSync } from 'node:fs'
import { expectedExport } from './figma-plugin.mjs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: npm run figma:diff -- path/to/figma-export.json')
  process.exit(2)
}
const figma = JSON.parse(readFileSync(file, 'utf8'))
const repo = expectedExport()
// Stable JSON: key order never counts as drift
const sort = (v) => (Array.isArray(v) ? v.map(sort) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort(v[k])])) : v)
const show = (v) => JSON.stringify(sort(v))
const diffs = []

for (const section of ['variables', 'textStyles', 'effectStyles']) {
  const a = repo[section], b = figma[section] || {}
  for (const name of Object.keys(a)) {
    if (!(name in b)) diffs.push(`missing in Figma   ${section} ${name}`)
    else if (section === 'variables' || section === 'textStyles') {
      for (const field of Object.keys(a[name]))
        if (show(a[name][field]) !== show(b[name][field])) diffs.push(`changed            ${section} ${name} ${field}: repo ${show(a[name][field])}, Figma ${show(b[name][field])}`)
    } else if (show(a[name]) !== show(b[name])) diffs.push(`changed            ${section} ${name}: repo ${show(a[name])}, Figma ${show(b[name])}`)
  }
  for (const name of Object.keys(b)) if (!(name in a)) diffs.push(`only in Figma      ${section} ${name}`)
}

const count = (s) => Object.keys(repo[s]).length
if (diffs.length) {
  console.error(`Figma drift (${diffs.length}):\n  ` + diffs.join('\n  '))
  process.exit(1)
}
console.log(`Figma matches the repo: ${count('variables')} variables, ${count('textStyles')} text styles, ${count('effectStyles')} effect styles.`)
