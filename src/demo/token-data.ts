// Reads the token source files so the tokens page always matches them.
// Nothing here is hand-copied: change a token, rebuild, and the page updates.
import colorFile from '@/tokens/primitives/color.tokens.json'
import brandFile from '@/tokens/primitives/brand.tokens.json'
import typographyFile from '@/tokens/primitives/typography.tokens.json'
import layoutFile from '@/tokens/primitives/layout.tokens.json'
import effectsFile from '@/tokens/primitives/effects.tokens.json'
import lightFile from '@/tokens/semantic/light.tokens.json'
import darkFile from '@/tokens/semantic/dark.tokens.json'

type Node = { $value?: unknown; $description?: string; $type?: string; [key: string]: unknown }
export type Token = { path: string; value: unknown; description?: string }
type Dim = { value: number; unit: string }

function flatten(node: Node, path: string[] = [], out: Token[] = []): Token[] {
  if ('$value' in node) {
    out.push({ path: path.join('.'), value: node.$value, description: node.$description })
    return out
  }
  for (const [key, child] of Object.entries(node)) {
    if (!key.startsWith('$') && child && typeof child === 'object') flatten(child as Node, [...path, key], out)
  }
  return out
}

const primitives = new Map(
  [colorFile, brandFile, typographyFile, layoutFile, effectsFile].flatMap((f) => flatten(f as Node)).map((t) => [t.path, t]),
)
const resolve = (v: unknown) => {
  const m = typeof v === 'string' ? v.match(/^\{(.+)\}$/) : null
  return m ? primitives.get(m[1])?.value : v
}
const aliasName = (v: unknown) => (typeof v === 'string' ? v.replace(/[{}]/g, '').replace(/^color\./, '') : '')
export const px = (v: unknown) => `${(v as Dim).value}${(v as Dim).unit}`

// ---- contrast (WCAG 2.2) ----
function luminance(hex: string) {
  const lin = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5)
}
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10
}

// ---- semantic colors ----
export type ColorRole = {
  path: string // e.g. action.primary.bg
  cssVar: string // --keel-action-primary-bg
  className: string // bg-action-primary-bg
  description?: string
  light: { hex: string; alias: string }
  dark: { hex: string; alias: string }
}

// Same naming rule as scripts/build-tokens.mjs: text -> fg, border -> line.
function tailwindClass(path: string) {
  const name = path.replace(/^text\./, 'fg.').replace(/^border\./, 'line.').replace(/\./g, '-')
  if (path.startsWith('text.') || /(^|\.)(fg|on-solid)$/.test(path)) return `text-${name}`
  if (path.startsWith('border.') || path.endsWith('.border')) return `border-${name}`
  if (path.startsWith('focus.ring') && !path.endsWith('offset')) return `ring-${name}`
  return `bg-${name}`
}

const darkByPath = new Map(flatten(darkFile as Node).map((t) => [t.path, t]))
export const colorRoles: ColorRole[] = flatten(lightFile as Node)
  .filter((t) => t.path.startsWith('color.'))
  .map((t) => {
    const path = t.path.replace(/^color\./, '')
    const d = darkByPath.get(t.path)!
    return {
      path,
      cssVar: `--keel-${path.replace(/\./g, '-')}`,
      className: tailwindClass(path),
      description: t.description,
      light: { hex: resolve(t.value) as string, alias: aliasName(t.value) },
      dark: { hex: resolve(d.value) as string, alias: aliasName(d.value) },
    }
  })

export const colorGroups = [
  { id: 'text', title: 'Text', blurb: 'Words on the page. Every one reaches 4.5:1 on the page and on subtle surfaces.' },
  { id: 'surface', title: 'Surfaces', blurb: 'Backgrounds, from the page to cards, wells, popovers and inverse.' },
  { id: 'border', title: 'Borders', blurb: 'Decorative dividers, and control borders that reach 3:1.' },
  { id: 'focus', title: 'Focus', blurb: 'The ring every focusable element shows on keyboard focus.' },
  { id: 'action', title: 'Actions', blurb: 'Buttons in every state. One primary action per view.' },
  { id: 'selected', title: 'Selection', blurb: 'Selected rows and nav items. Always paired with the indicator, never tint alone.' },
  { id: 'status', title: 'Status', blurb: 'Success, warning, danger and info. Info is neutral, so the accent only ever means action.' },
]

// ---- primitive ramps ----
export const ramps = Object.entries((colorFile as { color: Record<string, Node> }).color)
  .filter(([name]) => name !== 'base')
  .map(([name, ramp]) => ({
    name,
    description: ramp.$description as string,
    steps: Object.entries(ramp)
      .filter(([k]) => !k.startsWith('$'))
      .map(([step, t]) => ({ step, hex: (t as Node).$value as string })),
  }))

// ---- type, spacing, radius, shadow, motion ----
type Typo = { fontSize: string; lineHeight: string; fontWeight: string; letterSpacing: string; fontFamily: string }
export const textStyles = flatten(lightFile as Node)
  .filter((t) => t.path.startsWith('text-style.'))
  .map((t) => {
    const v = t.value as Typo
    return {
      name: t.path.replace('text-style.', ''),
      description: t.description,
      size: px(resolve(v.fontSize)),
      lineHeight: px(resolve(v.lineHeight)),
      weight: resolve(v.fontWeight) as number,
      mono: v.fontFamily.includes('mono'),
    }
  })

const under = (prefix: string) => [...primitives.values()].filter((t) => t.path.startsWith(prefix + '.'))
export const spacing = under('space').map((t) => ({ name: t.path.replace('space.', ''), px: (t.value as Dim).value, description: t.description }))
export const radii = under('radius').map((t) => ({ name: t.path.replace('radius.', ''), value: px(t.value), description: t.description }))
export const shadows = under('shadow').map((t) => ({ name: t.path.replace('shadow.', ''), description: t.description }))
export const durations = under('duration').map((t) => ({ name: t.path.replace('duration.', ''), ms: (t.value as Dim).value, description: t.description }))
export const easings = under('easing').map((t) => ({ name: t.path.replace('easing.', ''), value: t.value as number[], description: t.description }))
export const fontSans = (primitives.get('font.family.sans')?.value as string[])[0]
