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
import { chromium } from 'playwright'
import { preview } from 'vite'
import { HEIGHTS, PAGE_HELPERS, axeViolations, focusProblems, measureSizes, reflowFailures, smallTargets, walkFocus } from './lib/ui-probe.mjs'

const VERBOSE = process.argv.includes('--verbose')
const failures = []
const fail = (msg) => failures.push(msg)

const server = await preview({ preview: { port: 4317, strictPort: false }, logLevel: 'silent' })
const base = server.resolvedUrls.local[0].replace(/\/$/, '')
const browser = await chromium.launch()

// Which pages get checked is the app's own navigation, not a list kept here. Add a page to the
// router and the nav and it is checked from that moment. Before this, PAGES was hard-coded, so a
// new page shipped unchecked while check:ui reported success — and docs/commands/new-page.md
// told you the opposite. Found by handing the kit to someone who had never seen it.
const PAGES = await (async () => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(`${base}/#/`)
  await page.waitForTimeout(400)
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('[data-slot=app-shell] nav a[href^="#/"]')]
      .map((a) => ({ label: a.textContent.trim(), hash: a.getAttribute('href') }))
      .filter((l) => /^#\/[\w-]*$/.test(l.hash)),
  )
  await ctx.close()
  const seen = new Map()
  for (const l of links) seen.set(l.hash, l.label.toLowerCase() || 'home')
  return [...seen].map(([hash, label]) => [label, `/${hash}`])
})()

if (PAGES.length < 3) {
  console.error(`Found ${PAGES.length} pages in the app's navigation, expected at least 3. Has the nav markup changed?`)
  process.exit(1)
}
console.log(`Checking ${PAGES.length} pages from the app's own navigation: ${PAGES.map(([n]) => n).join(', ')}\n`)

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
    const sizes = await measureSizes(page)
    for (const s of sizes) {
      if (Math.abs(s.h - HEIGHTS[s.size]) > 0.5) fail(`${where}: ${s.slot} "${s.label}" size ${s.size} is ${s.h}px tall, expected ${HEIGHTS[s.size]}px`)
      if (s.slot === 'icon-button' && Math.abs(s.w - s.h) > 0.5) fail(`${where}: icon button "${s.label}" is ${s.w}x${s.h}, not square`)
    }

    // 2. Focus: walk the whole tab order
    const stops = await walkFocus(page)
    for (const problem of focusProblems(stops)) fail(`${where}: ${problem}`)
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

    // 2c. Dialogs, opened for real. docs/rules/dialog.md claims the checks run axe with a dialog
    // open; until a cold reader called that bluff, nothing ever opened one. A dialog is where
    // focus handling and labelling are easiest to get wrong, so it is worth the two clicks.
    if (name === 'components') {
      // Scoped to the dialog section: "Delete project" also appears as a plain danger button
      // elsewhere on the page, and clicking that one opens nothing.
      const dialogs = page.locator('#dialog')
      for (const [label, role, firstFocus] of [
        ['Edit profile', 'dialog', null],
        ['Delete project', 'alertdialog', 'Cancel'],
      ]) {
        await dialogs.getByRole('button', { name: label, exact: true }).first().click()
        const popup = page.getByRole(role)
        await popup.waitFor({ timeout: 5000 }).catch(() => {})
        // Let the backdrop finish fading: axe measures contrast against whatever is behind the
        // element at that instant, and a half-faded scrim is not what anyone will ever see.
        await page.waitForTimeout(450)
        if (!(await popup.count())) {
          fail(`${where}: "${label}" opened no ${role}`)
          continue
        }
        const named = await popup.first().evaluate((el) => {
          const id = el.getAttribute('aria-labelledby')
          return Boolean((id && document.getElementById(id)?.textContent?.trim()) || el.getAttribute('aria-label'))
        })
        if (!named) fail(`${where}: the ${role} has no accessible name`)
        if (firstFocus) {
          const focused = await page.evaluate(() => (document.activeElement?.textContent ?? '').trim())
          if (!focused.startsWith(firstFocus)) fail(`${where}: ${role} starts focus on "${focused}", expected "${firstFocus}" — the safe choice`)
        }
        for (const v of await axeViolations(page)) fail(`${where}: axe with the ${role} open — ${v.id}: ${v.where}`)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(250)
      }
    }

    // 3. Target size (WCAG 2.5.8): 24x24, or a 24px circle around it touches no other target
    const small = await smallTargets(page)
    for (const s of small) fail(`${where}: target under 24px and crowded: ${s}`)

    // 4. axe
    const violations = await axeViolations(page)
    for (const v of violations) fail(`${where}: axe ${v.id}: ${v.where}`)

    // 5. Reflow
    const overflow = await reflowFailures(page)
    for (const o of overflow) fail(`${where}: page is ${o.actual}px wide at a ${o.width}px viewport (sideways scrolling)`)

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
