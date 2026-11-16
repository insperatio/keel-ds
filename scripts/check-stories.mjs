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
    // Storybook's a11y addon runs axe on the same page, and axe refuses to run twice at once.
    // Retry rather than fail: a race between two correct checks is not a finding about the story.
    const violations = await page.evaluate(async () => {
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          const result = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })
          return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`)
        } catch (error) {
          if (!/already running/i.test(String(error?.message ?? error))) throw error
          await new Promise((r) => setTimeout(r, 300))
        }
      }
      return ['axe could not get a turn to run after 10 tries']
    })
    for (const v of violations) failures.push(`${mode} ${story.id}: ${v}`)
    await page.close()
  }
  await context.close()
}

// The Design tab, checked in the manager UI rather than in the story frame. check:docs proves
// every story carries a Figma link; this proves the addon is still wired up to show it, which
// the parameters alone can't tell you — drop the addon from main.ts and the links go silent.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const [id, node] = ['components-button--primary', '25-291']
  await page.goto(`http://localhost:${port}/?path=/story/${id}`, { waitUntil: 'networkidle' })
  const tab = page.locator('[role="tab"]', { hasText: /Design/ }).first()
  if ((await tab.count()) === 0) failures.push('Design tab is missing: is @storybook/addon-designs still in .storybook/main.ts?')
  else {
    await tab.click()
    const embed = page.locator('#storybook-panel-root iframe[src*="figma.com"]').first()
    await embed.waitFor({ timeout: 10000 }).catch(() => {})
    const src = (await embed.count()) ? await embed.getAttribute('src') : ''
    if (!src) failures.push('Design tab opened but embedded no Figma frame')
    else if (!src.includes(node)) failures.push(`Design tab points at ${src.match(/node-id=([\d-]+)/)?.[1] ?? 'nothing'}, expected ${node}`)
  }
  await page.close()
}

await browser.close()
server.close()

console.log(
  `${stories.length} stories in light and dark: ${failures.length ? `${failures.length} problem(s)` : 'no axe violations, no console errors'}.` +
    (failures.length ? '' : ' Design tab embeds the Figma frame.'),
)
if (failures.length) {
  console.error('\n- ' + failures.join('\n- '))
  process.exit(1)
}
