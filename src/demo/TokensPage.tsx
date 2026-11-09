import { useEffect, useState } from 'react'
import { brand } from '@/brand.generated'
import {
  colorGroups,
  colorRoles,
  contrast,
  durations,
  easings,
  fontSans,
  radii,
  ramps,
  shadows,
  spacing,
  textStyles,
  type ColorRole,
} from './token-data'

type Mode = 'light' | 'dark'

function useMode(): [Mode, (m: Mode) => void] {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const saved = localStorage.getItem('keel-mode')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    try {
      localStorage.setItem('keel-mode', mode)
    } catch {}
  }, [mode])
  return [mode, setMode]
}

const SECTIONS = [
  ['color', 'Color'],
  ['ramps', 'Ramps'],
  ['type', 'Type'],
  ['spacing', 'Spacing'],
  ['radius', 'Radius'],
  ['shadow', 'Shadow'],
  ['motion', 'Motion'],
] as const

function Section({ id, title, blurb, children }: { id: string; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-line-subtle py-12">
      <h2 id={`${id}-title`} className="text-heading-lg">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-body-md text-fg-secondary">{blurb}</p>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-code text-fg-primary">{children}</code>
}

// What a role is drawn on, so text and labels are previewed on their real background.
function backgroundFor(role: ColorRole) {
  const p = role.path
  if (p === 'text.inverse') return 'surface.inverse'
  if (p.endsWith('.on-solid')) return p.replace(/on-solid$/, 'solid')
  if (p.endsWith('.fg') && colorRoles.some((r) => r.path === p.replace(/fg$/, 'bg'))) return p.replace(/fg$/, 'bg')
  if (p.endsWith('.fg') && p.startsWith('status.')) return p.replace(/fg$/, 'bg')
  if (p === 'action.ghost.fg') return 'action.ghost.bg-hover'
  return 'surface.page'
}
const cssVar = (path: string) => `var(--keel-${path.replace(/\./g, '-')})`

function Swatch({ role }: { role: ColorRole }) {
  // Disabled colors are exempt from contrast (WCAG 1.4.3), so they're shown as chips, not as readable text.
  const isText = role.className.startsWith('text-') && !role.path.includes('disabled')
  const isBorder = role.className.startsWith('border-') || role.path.startsWith('focus.ring')
  if (isText)
    return (
      <div
        className="grid size-12 shrink-0 place-items-center rounded-lg border border-line-subtle text-heading-md"
        style={{ background: cssVar(backgroundFor(role)), color: `var(${role.cssVar})` }}
        aria-hidden="true"
      >
        Aa
      </div>
    )
  if (isBorder)
    return <div className="size-12 shrink-0 rounded-lg bg-surface-page" style={{ border: `2px solid var(${role.cssVar})` }} aria-hidden="true" />
  return <div className="size-12 shrink-0 rounded-lg border border-line-subtle" style={{ background: `var(${role.cssVar})` }} aria-hidden="true" />
}

function ColorRow({ role, mode }: { role: ColorRole; mode: Mode }) {
  const current = role[mode]
  const bg = colorRoles.find((r) => r.path === backgroundFor(role))?.[mode].hex
  const exempt = role.path.includes('disabled') && role.className.startsWith('text-')
  const showRatio = role.className.startsWith('text-') && bg && !exempt
  return (
    <li className="flex items-start gap-4 border-b border-line-subtle py-3">
      <Swatch role={role} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-label-md">{role.path}</span>
          <Code>{role.className}</Code>
        </div>
        {role.description && <p className="mt-1 text-body-sm text-fg-secondary">{role.description}</p>}
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <div className="font-mono text-code">{current.hex}</div>
        <div className="text-caption text-fg-tertiary">
          {current.alias}
          {showRatio && ` · ${contrast(current.hex, bg)}:1`}
          {exempt && ' · exempt (disabled)'}
        </div>
      </div>
    </li>
  )
}

function MotionDemo({ ms, easing }: { ms: number; easing: string }) {
  const [on, setOn] = useState(false)
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className="rounded-lg border border-action-secondary-border bg-action-secondary-bg px-3 py-1.5 text-label-md text-action-secondary-fg hover:bg-action-secondary-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        Play
      </button>
      <div className="relative h-2 flex-1 rounded-full bg-surface-sunken">
        <div
          className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-status-info-solid motion-reduce:transition-none"
          style={{ left: on ? 'calc(100% - 16px)' : '0', transition: `left ${ms}ms ${easing}` }}
        />
      </div>
    </div>
  )
}

export default function TokensPage() {
  const [mode, setMode] = useMode()
  const counts = `${colorRoles.length} color roles · ${textStyles.length} text styles · ${spacing.length} spacing steps · ${radii.length} radii · ${shadows.length} shadows`

  return (
    <div className="min-h-screen bg-surface-page text-fg-primary">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-surface-overlay focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-line-subtle bg-surface-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <span className="text-heading-sm">{brand.logo.wordmark}</span>
          <nav aria-label="Token sections" className="hidden flex-1 gap-1 md:flex">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-md px-2 py-1 text-label-md text-action-ghost-fg hover:bg-action-ghost-bg-hover">
                {label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            aria-pressed={mode === 'dark'}
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="ml-auto rounded-lg border border-action-secondary-border bg-action-secondary-bg px-3 py-1.5 text-label-md text-action-secondary-fg hover:bg-action-secondary-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            Dark mode: {mode === 'dark' ? 'on' : 'off'}
          </button>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6">
        <div className="py-12">
          <p className="text-overline uppercase text-fg-tertiary">Design tokens</p>
          <h1 className="mt-2 text-heading-xl">{brand.name} tokens</h1>
          <p className="mt-3 max-w-2xl text-body-lg text-fg-secondary">
            Every value in {brand.name}, read straight from the token files. Components use only these names. Switch modes to see each role re-point.
          </p>
          <p className="mt-4 text-body-sm text-fg-tertiary">{counts}</p>
        </div>

        <Section id="color" title="Color roles" blurb="Semantic colors components use. Each shows its Tailwind class, the ramp step it points to in this mode, and its contrast where it carries text.">
          <div className="grid gap-12">
            {colorGroups.map((g) => (
              <div key={g.id}>
                <h3 className="text-heading-sm">{g.title}</h3>
                <p className="mt-1 text-body-sm text-fg-secondary">{g.blurb}</p>
                <ul className="mt-3">
                  {colorRoles
                    .filter((r) => r.path.startsWith(g.id + '.'))
                    .map((r) => (
                      <ColorRow key={r.path} role={r} mode={mode} />
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="ramps" title="Ramps" blurb="The primitives under the roles. Components never use these directly. The number under each step is its contrast with white.">
          <div className="grid gap-6">
            {ramps.map((r) => (
              <div key={r.name}>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-heading-sm">{r.name}</h3>
                  <span className="text-body-sm text-fg-secondary">{r.description}</span>
                </div>
                <ol className="mt-2 grid grid-cols-11 gap-1">
                  {r.steps.map((s) => (
                    <li key={s.step}>
                      <div className="h-12 rounded-md border border-line-subtle" style={{ background: s.hex }} title={`${r.name}.${s.step} ${s.hex}`} />
                      <div className="mt-1 text-caption">{s.step}</div>
                      <div className="text-caption text-fg-tertiary">{contrast(s.hex, '#FFFFFF')}</div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Type" blurb={`${fontSans}. Each style is one class that sets size, line height, weight and letter spacing.`}>
          <ul>
            {textStyles.map((t) => (
              <li key={t.name} className="grid gap-2 border-b border-line-subtle py-4 sm:grid-cols-[220px_1fr]">
                <div>
                  <Code>text-{t.name}</Code>
                  <div className="mt-1 text-caption text-fg-tertiary">
                    {t.size} / {t.lineHeight} · {t.weight}
                  </div>
                </div>
                <p
                  className={t.name === 'overline' ? 'uppercase' : ''}
                  style={{
                    fontFamily: `var(--keel-type-${t.name}-family)`,
                    fontSize: `var(--keel-type-${t.name}-size)`,
                    lineHeight: `var(--keel-type-${t.name}-line-height)`,
                    fontWeight: `var(--keel-type-${t.name}-weight)`,
                    letterSpacing: `var(--keel-type-${t.name}-tracking)`,
                  }}
                >
                  {t.mono ? 'const keel = steadyCourse()' : 'Steady course for every brand'}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="spacing" title="Spacing" blurb="A 4px grid. The name is the multiple of 4, and it matches Tailwind: space.3 is 12px, written p-3 or gap-3.">
          <ul className="grid gap-2">
            {spacing.map((s) => (
              <li key={s.name} className="grid grid-cols-[80px_64px_1fr] items-center gap-4">
                <Code>{s.name.replace('-', '.')}</Code>
                <span className="text-body-sm text-fg-secondary">{s.px}px</span>
                <div className="h-3 rounded-sm bg-line-default" style={{ width: s.px }} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="radius" title="Radius" blurb="Set by the brand's corner style. Buttons and inputs use lg, cards xl, dialogs 2xl.">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {radii.map((r) => (
              <li key={r.name}>
                <div className="h-20 border-2 border-line-control bg-surface-subtle" style={{ borderRadius: `var(--keel-radius-${r.name})` }} />
                <div className="mt-2 text-label-md">rounded-{r.name}</div>
                <div className="text-caption text-fg-tertiary">{r.value === '9999px' ? 'full' : r.value}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="shadow" title="Shadow" blurb="Tinted with the darkest neutral so shadows read cool, not muddy.">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {shadows.map((s) => (
              <li key={s.name} className="rounded-xl bg-surface-raised p-5" style={{ boxShadow: `var(--keel-shadow-${s.name})` }}>
                <div className="text-label-md">shadow-{s.name}</div>
                <div className="mt-1 text-body-sm text-fg-secondary">{s.description}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="motion" title="Motion" blurb="Short and purposeful: nothing runs longer than 400ms. Press Play to compare. Reduced-motion users see no movement.">
          <ul className="grid gap-4">
            {durations.map((d) => (
              <li key={d.name} className="grid items-center gap-2 sm:grid-cols-[220px_1fr]">
                <div>
                  <div className="text-label-md">
                    {d.name} · {d.ms}ms
                  </div>
                  <div className="text-caption text-fg-tertiary">{d.description}</div>
                </div>
                <MotionDemo ms={d.ms} easing="var(--keel-ease-standard)" />
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid gap-2">
            {easings.map((e) => (
              <li key={e.name} className="flex flex-wrap items-baseline gap-3">
                <Code>ease-{e.name}</Code>
                <span className="font-mono text-code text-fg-secondary">cubic-bezier({e.value.join(', ')})</span>
                <span className="text-body-sm text-fg-tertiary">{e.description}</span>
              </li>
            ))}
          </ul>
        </Section>
      </main>
      <footer className="border-t border-line-subtle py-8 text-center text-body-sm text-fg-tertiary">
        {brand.name} · a token-driven design system by MJ · Insperatio Designs LLC
      </footer>
    </div>
  )
}
