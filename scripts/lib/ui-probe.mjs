// The measurements behind both `check:ui` and `compare`. They live here so the before/after
// comparison can't be accused of measuring the two pages differently: it runs the same probes,
// in the same browser, as the check that gates every pull request.
//
// Each probe returns findings; the caller decides whether a finding fails a build or fills a
// row in a report.
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
export const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

/** Runs inside the page: colour maths and element descriptions. */
export const PAGE_HELPERS = `
window.__rgba = (c) => { const x = document.createElement('canvas').getContext('2d'); x.fillStyle = '#000'; x.fillStyle = c; x.fillRect(0,0,1,1); const d = x.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255] }
window.__lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
window.__ratio = (a, b) => { const [x, y] = [__lum(a), __lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
window.__bgBehind = (el) => { for (let n = el; n; n = n.parentElement) { const c = __rgba(getComputedStyle(n).backgroundColor); if (c[3] > 0.5) return c } return __rgba(getComputedStyle(document.body).backgroundColor) }
window.__describe = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.tagName).trim().replace(/\\s+/g, ' ').slice(0, 40) + ' <' + (el.getAttribute('role') || el.tagName.toLowerCase()) + '>'
`

export const HEIGHTS = { sm: 32, md: 40, lg: 48 }

/** Keel's controls, measured against the one height their size name promises. */
export async function measureSizes(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-slot=button],[data-slot=icon-button],[data-slot=input],[data-slot=select-trigger]')]
      .filter((e) => e.offsetParent !== null && e.dataset.size)
      .map((e) => ({ slot: e.dataset.slot, size: e.dataset.size, h: e.getBoundingClientRect().height, w: e.getBoundingClientRect().width, label: __describe(e) })),
  )
}

/** Tab through the whole page, reporting the focus ring at every stop. */
export async function walkFocus(page) {
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
  return stops
}

/** Which focus stops break WCAG 2.4.7 / 2.4.11 / 1.4.11, and why. */
export function focusProblems(stops) {
  const out = []
  for (const s of stops) {
    if (!s.ring) out.push(`no visible focus ring on ${s.label}`)
    else if (s.ring.width < 2) out.push(`focus ring on ${s.label} is ${s.ring.width}px, needs 2px`)
    else if (s.contrast < 3) out.push(`focus ring on ${s.label} is ${s.contrast.toFixed(2)}:1, needs 3:1`)
  }
  return out
}

/** Targets under 24x24 that also sit within 24px of another target (WCAG 2.5.8). */
export async function smallTargets(page) {
  return page.evaluate(() => {
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
}

/** axe-core, WCAG 2.2 A and AA. */
export async function axeViolations(page) {
  await page.addScriptTag({ content: AXE })
  return page.evaluate(async () =>
    (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      count: v.nodes.length,
      where: v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | '),
    })),
  )
}

/** Widths at which the page scrolls sideways (WCAG 1.4.10). */
export async function reflowFailures(page, widths = [320, 375]) {
  const out = []
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 })
    await page.waitForTimeout(150)
    const w = await page.evaluate(() => document.documentElement.scrollWidth)
    if (w > width) out.push({ width, actual: w })
  }
  return out
}
