// Regenerates docs/media/contrast-check.gif, the animation in the README.
//
// The README's claim is that a broken rule fails the build. The GIF is the evidence, so the
// terminal text in it has to be real: this script breaks a token for real, runs the real check,
// captures its stdout, and renders that. It also writes the captured text next to the GIF, so
// `--check` can re-run the commands and fail when what the GIF shows no longer matches what the
// checks say. A screenshot nobody re-takes is a screenshot that quietly starts lying.
//
//   node scripts/media.mjs            rebuild the GIF (needs ffmpeg)
//   node scripts/media.mjs --check    verify the recorded output still matches; no ffmpeg needed
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOKENS = join(ROOT, 'src/tokens/semantic/light.tokens.json')
const OUT = join(ROOT, 'docs/media')
const RECORD = join(OUT, 'contrast-check.txt')
const GIF = join(OUT, 'contrast-check.gif')
const checkOnly = process.argv.includes('--check')

// The edit the GIF performs: secondary body text, two steps lighter, which drops it under 4.5:1.
const BEFORE = '"secondary": {\n        "$value": "{color.neutral.600}",'
const AFTER = '"secondary": {\n        "$value": "{color.neutral.400}",'

const runCheck = () => {
  try {
    return execFileSync('node', [join(ROOT, 'scripts/check-tokens.mjs')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (e) {
    return (e.stdout ?? '').trim() + (e.stderr ?? '').trim()
  }
}

// ---- capture the two real outputs ----
const original = readFileSync(TOKENS, 'utf8')
if (!original.includes(BEFORE)) {
  console.error(
    'Media check failed: src/tokens/semantic/light.tokens.json no longer contains the token line the\n' +
      'README animation edits, so the GIF demonstrates something that is no longer there.\n' +
      'Point BEFORE/AFTER in scripts/media.mjs at a token that still exists, then run: npm run media',
  )
  process.exit(1)
}
let pass, fail
try {
  pass = runCheck()
  writeFileSync(TOKENS, original.replace(BEFORE, AFTER))
  fail = runCheck()
} finally {
  writeFileSync(TOKENS, original)
}
const record = `$ npm run tokens:check\n${fail}\n\n$ npm run tokens:check\n${pass}\n`

if (checkOnly) {
  if (!existsSync(RECORD)) {
    console.error(`Media check failed: ${RECORD} is missing. Run: npm run media`)
    process.exit(1)
  }
  if (readFileSync(RECORD, 'utf8') !== record) {
    console.error(
      'Media check failed: docs/media/contrast-check.gif shows output the checks no longer produce,\n' +
        'so the README is showing something that is no longer true. Run: npm run media',
    )
    process.exit(1)
  }
  console.log('The README animation still matches what the checks print.')
  process.exit(0)
}

// ---- render ----
for (const bin of ['ffmpeg']) {
  try {
    execFileSync(bin, ['-version'], { stdio: 'ignore' })
  } catch {
    console.error(`media: ${bin} is not installed, and the GIF is assembled with it. Install ffmpeg, then re-run.`)
    process.exit(1)
  }
}
const { chromium } = await import('playwright')
const WORK = join(tmpdir(), 'keel-media')
rmSync(WORK, { recursive: true, force: true })
mkdirSync(join(WORK, 'frames'), { recursive: true })
mkdirSync(OUT, { recursive: true })

const FONT = join(ROOT, 'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2')
writeFileSync(join(WORK, 'stage.html'), readFileSync(join(ROOT, 'scripts/media.stage.html'), 'utf8').replace('MANROPE_URL', `file://${FONT}`))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const CMD = 'npm run tokens:check'
const failLines = fail.split('\n')
const header = failLines[0]
const errs = failLines.slice(1).filter((l) => !/is out of date/.test(l))
const warns = failLines.slice(1).filter((l) => /is out of date/.test(l))
const L = (t, text, cursor) => ({ t, text: esc(text), cursor })

const steps = []
const add = (n, state) => { for (let i = 0; i < n; i++) steps.push(state) }
add(14, { code: 'before', lines: [L('cmd', '', true)] })
add(16, { code: 'after', lines: [L('cmd', '', true)] })
for (let i = 1; i <= CMD.length; i++) add(1, { code: 'after', lines: [L('cmd', CMD.slice(0, i), true)] })
add(5, { code: 'after', lines: [L('cmd', CMD, false)] })
const shown = [L('cmd', CMD, false), { t: 'gap' }]
add(4, { code: 'after', lines: [...shown] })
shown.push(L('hdr', header))
add(4, { code: 'after', lines: [...shown] })
for (const e of errs) { shown.push(L('err', e)); add(2, { code: 'after', lines: [...shown] }) }
for (const w of warns) { shown.push(L('warn', w)); add(2, { code: 'after', lines: [...shown] }) }
add(34, { code: 'after', lines: [...shown] })
add(16, { code: 'before', lines: [L('cmd', CMD, false), { t: 'gap' }, L('hdr', header)] })
add(8, { code: 'before', lines: [L('cmd', CMD, true)] })
add(4, { code: 'before', lines: [L('cmd', CMD, false)] })
add(30, { code: 'before', lines: [L('cmd', CMD, false), { t: 'gap' }, ...pass.split('\n').map((p) => L('pass', p))] })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 580 }, deviceScaleFactor: 2 })
await page.goto(`file://${join(WORK, 'stage.html')}`)
await page.waitForTimeout(500)
let n = 0
for (const s of steps) {
  await page.evaluate((st) => window.setState(st), s)
  await page.screenshot({ path: join(WORK, 'frames', `f${String(n++).padStart(4, '0')}.png`) })
}
await browser.close()

const frames = join(WORK, 'frames/f%04d.png')
const palette = join(WORK, 'palette.png')
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })
ff(['-framerate', '10', '-i', frames, '-vf', 'palettegen=stats_mode=diff:max_colors=64', palette])
ff(['-framerate', '10', '-i', frames, '-i', palette, '-lavfi',
  'paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', '-loop', '0', GIF])
writeFileSync(RECORD, record)

const kb = (readFileSync(GIF).length / 1024).toFixed(0)
console.log(`docs/media/contrast-check.gif rebuilt: ${n} frames, ${(n / 10).toFixed(1)}s, ${kb}KB, from ${errs.length} real contrast failures.`)
