// Runs every built Storybook story in a real browser, in light and dark, and fails on any
// accessibility violation or console error.
//   npm run check:stories        (builds Storybook first)
//
// The accessibility panel in Storybook shows this to whoever opens a story. This script is what
// makes it a gate: a story that breaks WCAG 2.2 A or AA fails the pull request.
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const STATIC = join(ROOT, 'storybook-static')
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

const server = createServer((req, res) => {
  let file = join(STATIC, decodeURIComponent(req.url.split('?')[0]))
  if (!extname(file)) file = join(STATIC, 'index.html')
  let body
  try {
    body = readFileSync(file)
  } catch {
    res.writeHead(404)
    res.end('not found')
    return
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  res.end(body)
}).listen(0)
const port = server.address().port

const stories = Object.values(JSON.parse(readFileSync(join(STATIC, 'index.json'), 'utf8')).entries).filter((e) => e.type === 'story')
const browser = await chromium.launch()
const failures = []

for (const mode of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width: 900, height: 600 } })
  for (const story of stories) {
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)))
    await page.goto(`http://localhost:${port}/iframe.html?id=${story.id}&globals=mode:${mode}`)
    await page.waitForTimeout(400)

    const rendered = await page.evaluate(() => document.querySelector('#storybook-root')?.children.length ?? 0)
    if (rendered === 0) failures.push(`${mode} ${story.id}: rendered nothing`)
    for (const error of errors) failures.push(`${mode} ${story.id}: ${error}`)

    await page.addScriptTag({ content: AXE })
    const violations = await page.evaluate(async () =>
      (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`,
      ),
    )
    for (const v of violations) failures.push(`${mode} ${story.id}: ${v}`)
    await page.close()
  }
  await context.close()
}

await browser.close()
server.close()

console.log(`${stories.length} stories in light and dark: ${failures.length ? `${failures.length} problem(s)` : 'no axe violations, no console errors'}.`)
if (failures.length) {
  console.error('\n- ' + failures.join('\n- '))
  process.exit(1)
}
