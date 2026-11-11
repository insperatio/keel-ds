// Checks the built demo pages in a real browser, in light and dark mode.
//   npm run check:ui            (builds first)
//   node scripts/check-ui.mjs --verbose   lists every focus stop
//
// 1. Sizes: Button, IconButton, Input and Select trigger are 32 / 40 / 48px for
//    sm / md / lg, so controls in a row always line up. Icon buttons are square.
// 2. Focus: Tab through each page. Every stop must show a focus ring at least 2px
//    wide with 3:1 contrast against what's behind it (WCAG 2.4.7, 2.4.11, 1.4.11).
// 3. Target size: everything clickable is at least 24 x 24px, or has enough space
//    around it (WCAG 2.5.8).
// 4. axe-core: no WCAG 2.2 A/AA violations.
// 5. Reflow: no sideways scrolling at 320 and 375px wide (WCAG 1.4.10).
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import { preview } from 'vite'

const require = createRequire(import.meta.url)
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const VERBOSE = process.argv.includes('--verbose')
const PAGES = [
  ['tokens', '/#/'],
  ['components', '/#/components'],
  ['example', '/#/example'],
]
const HEIGHTS = { sm: 32, md: 40, lg: 48 }

// Runs inside the page: color math and helpers
const PAGE_HELPERS = `
window.__rgba = (c) => { const x = document.createElement('canvas').getContext('2d'); x.fillStyle = '#000'; x.fillStyle = c; x.fillRect(0,0,1,1); const d = x.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255] }
window.__lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
window.__ratio = (a, b) => { const [x, y] = [__lum(a), __lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
window.__bgBehind = (el) => { for (let n = el; n; n = n.parentElement) { const c = __rgba(getComputedStyle(n).backgroundColor); if (c[3] > 0.5) return c } return __rgba(getComputedStyle(document.body).backgroundColor) }
window.__describe = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.tagName).trim().replace(/\\s+/g, ' ').slice(0, 40) + ' <' + (el.getAttribute('role') || el.tagName.toLowerCase()) + '>'
`

const failures = []
const fail = (msg) => failures.push(msg)

const server = await preview({ preview: { port: 4317, strictPort: false }, logLevel: 'silent' })
const base = server.resolvedUrls.local[0].replace(/\/$/, '')
const browser = await chromium.launch()

for (const mode of ['light', 'dark']) {
  for (const [name, path] of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    const where = `${mode} ${name}`
    page.on('pageerror', (e) => fail(`${where}: page error: ${e.message}`))
    await page.addInitScript((m) => {
      try {
        localStorage.setItem('keel-mode', m)
      } catch {}
    }, mode)
    await page.goto(base + path)
    await page.waitForTimeout(500)
    await page.addScriptTag({ content: PAGE_HELPERS })

    // 1. Sizes
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot=button],[data-slot=icon-button],[data-slot=input],[data-slot=select-trigger]')]
        .filter((e) => e.offsetParent !== null && e.dataset.size)
        .map((e) => ({ slot: e.dataset.slot, size: e.dataset.size, h: e.getBoundingClientRect().height, w: e.getBoundingClientRect().width, label: __describe(e) })),
    )
    for (const s of sizes) {
      if (Math.abs(s.h - HEIGHTS[s.size]) > 0.5) fail(`${where}: ${s.slot} "${s.label}" size ${s.size} is ${s.h}px tall, expected ${HEIGHTS[s.size]}px`)
      if (s.slot === 'icon-button' && Math.abs(s.w - s.h) > 0.5) fail(`${where}: icon button "${s.label}" is ${s.w}x${s.h}, not square`)
    }

    // 2. Focus: walk the whole tab order
    await page.evaluate(() => {
      document.activeElement?.blur()
      window.scrollTo(0, 0)
    })
    const stops = []
    let first = null
    for (let i = 0; i < 400; i++) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return null
        if (el.hasAttribute('data-base-ui-focus-guard')) return { skip: true }
        const key = el.id || __describe(el) + el.getBoundingClientRect().top
        const s = getComputedStyle(el)
        const a = getComputedStyle(el, '::after')
        let ring = null
        if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ring = { width: parseFloat(s.outlineWidth), color: s.outlineColor, offset: parseFloat(s.outlineOffset) }
        else if (a.outlineStyle !== 'none' && parseFloat(a.outlineWidth) > 0) ring = { width: parseFloat(a.outlineWidth), color: a.outlineColor, offset: parseFloat(a.outlineOffset) }
        let contrast = null
        if (ring) {
          // A ring outside the element sits on the parent's background; an inset ring on the element's own
          const behind = ring.offset < 0 ? __bgBehind(el) : __bgBehind(el.parentElement)
          contrast = __ratio(__rgba(ring.color), behind)
        }
        return { key, label: __describe(el), ring, contrast }
      })
      if (!info || info.skip) continue
      if (first === info.key) break
      first ??= info.key
      stops.push(info)
    }
    for (const s of stops) {
      if (!s.ring) fail(`${where}: no visible focus ring on ${s.label}`)
      else if (s.ring.width < 2) fail(`${where}: focus ring on ${s.label} is ${s.ring.width}px, needs 2px`)
      else if (s.contrast < 3) fail(`${where}: focus ring on ${s.label} is ${s.contrast.toFixed(2)}:1, needs 3:1`)
    }
    if (VERBOSE) for (const s of stops) console.log(`  ${where}  ${s.label}  ${s.ring ? s.ring.width + 'px ' + s.contrast.toFixed(2) + ':1' : 'NO RING'}`)

    // 2b. Focus that arrives by shortcut: F6 moves focus to the toast region
    if (name === 'components') {
      const trigger = page.locator('#toast').getByRole('button', { name: 'Warning', exact: true })
      await trigger.click()
      await page.waitForTimeout(300)
      await trigger.focus()
      await page.keyboard.press('F6')
      await page.waitForTimeout(150)
      const f6 = await page.evaluate(() => {
        const el = document.activeElement
        const s = getComputedStyle(el)
        const ok = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2
        return { label: __describe(el), ok, contrast: ok ? __ratio(__rgba(s.outlineColor), __bgBehind(el.parentElement)) : 0 }
      })
      if (!f6.ok) fail(`${where}: F6 focuses ${f6.label} with no visible focus ring`)
      else if (f6.contrast < 3) fail(`${where}: F6 focus ring on ${f6.label} is ${f6.contrast.toFixed(2)}:1, needs 3:1`)
      await page.keyboard.press('Escape')
      await page.evaluate(() => document.activeElement?.blur())
    }

    // 3. Target size (WCAG 2.5.8): 24x24, or a 24px circle around it touches no other target
    const small = await page.evaluate(() => {
      const sel = 'a[href],button,input:not([type=hidden]),select,textarea,[role=checkbox],[role=switch],[role=tab],[role=combobox],[tabindex="0"]'
      const els = [...document.querySelectorAll(sel)].filter((e) => {
        const r = e.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && !e.closest('[aria-hidden=true]') && getComputedStyle(e).visibility !== 'hidden' && !e.matches('[data-slot=table-frame],[role=tabpanel]')
      })
      // A control inside a <label> uses the label as its target
      const rectOf = (e) => (e.closest('label') ?? e).getBoundingClientRect()
      const rects = els.map((e) => ({ e, r: rectOf(e) }))
      const out = []
      for (const { e, r } of rects) {
        if (r.width >= 24 && r.height >= 24) continue
        if (e.closest('p, li') && e.tagName === 'A' && !e.closest('nav')) continue // inline links in text are exempt
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const crowded = rects.some(({ e: o, r: q }) => {
          if (o === e || q === r || o.contains(e) || e.contains(o)) return false
          const dx = Math.max(q.left - cx, 0, cx - q.right)
          const dy = Math.max(q.top - cy, 0, cy - q.bottom)
          return Math.hypot(dx, dy) < 12
        })
        if (crowded) out.push(`${__describe(e)} ${Math.round(r.width)}x${Math.round(r.height)}`)
      }
      return out
    })
    for (const s of small) fail(`${where}: target under 24px and crowded: ${s}`)

    // 4. axe
    await page.addScriptTag({ content: AXE })
    const violations = await page.evaluate(async () =>
      (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`,
      ),
    )
    for (const v of violations) fail(`${where}: axe ${v}`)

    // 5. Reflow
    const overflow = []
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 800 })
      await page.waitForTimeout(150)
      const w = await page.evaluate(() => document.documentElement.scrollWidth)
      if (w > width) overflow.push(width)
      if (w > width) fail(`${where}: page is ${w}px wide at a ${width}px viewport (sideways scrolling)`)
    }

    console.log(`${where.padEnd(17)} ${sizes.length} sized controls, ${stops.length} focus stops, ${violations.length} axe violations, ${overflow.length ? 'overflows' : 'reflows'} at 320/375`)
    await ctx.close()
  }
}

await browser.close()
server.httpServer.close()

if (failures.length) {
  console.error(`\nUI check failed (${failures.length}):\n- ` + failures.join('\n- '))
  process.exit(1)
}
console.log('\nUI check passed: sizes, focus rings, target sizes, axe and reflow, in light and dark.')
