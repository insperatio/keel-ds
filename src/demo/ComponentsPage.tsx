import { useState } from 'react'
import { ArrowRight, ChevronDown, Copy, Download, MoreHorizontal, Pencil, Plus, Settings, Trash2, X } from 'lucide-react'
import { brand } from '@/brand.generated'
import { Button, IconButton } from '@/components/ui/button'
import { PageLinks, useMode } from './shell'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const
const SIZES = ['sm', 'md', 'lg'] as const

function Section({ id, title, blurb, children }: { id: string; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line-subtle py-12">
      <h2 id={`${id}-title`} className="text-heading-lg">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-body-md text-fg-secondary">{blurb}</p>
      <div className="mt-8 grid gap-10">{children}</div>
    </section>
  )
}

function Example({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-heading-sm">{title}</h3>
      {note && <p className="mt-1 max-w-2xl text-body-sm text-fg-secondary">{note}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line-subtle bg-surface-subtle p-6">{children}</div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-code text-fg-primary">{children}</code>
}

function SaveDemo() {
  const [saving, setSaving] = useState(false)
  return (
    <Button
      variant="primary"
      loading={saving}
      onClick={() => {
        setSaving(true)
        setTimeout(() => setSaving(false), 2000)
      }}
    >
      {saving ? 'Saving…' : 'Save changes'}
    </Button>
  )
}

export default function ComponentsPage() {
  const [mode, setMode] = useMode()

  return (
    <div className="min-h-screen bg-surface-page text-fg-primary">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-surface-overlay focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-line-subtle bg-surface-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <span className="text-heading-sm">{brand.logo.wordmark}</span>
          <PageLinks current="components" />
          <Button size="sm" aria-pressed={mode === 'dark'} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} className="ml-auto">
            Dark mode: {mode === 'dark' ? 'on' : 'off'}
          </Button>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6">
        <div className="py-12">
          <p className="text-overline uppercase text-fg-tertiary">Components</p>
          <h1 className="mt-2 text-heading-xl">{brand.name} components</h1>
          <p className="mt-3 max-w-2xl text-body-lg text-fg-secondary">
            Built on Base UI, styled only with {brand.name} tokens. Tab through this page to see every focus ring.
          </p>
        </div>

        <Section
          id="button"
          title="Button"
          blurb="Starts an action. Use one primary per group; every other action is secondary or ghost. Labels are verbs: “Save changes”, not “OK”."
        >
          <Example title="Variants" note="Secondary is the default, so a primary is always a deliberate choice.">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Example>

          <Example title="Sizes" note="sm 32px, md 40px (default), lg 48px. Match the height of inputs in the same row.">
            {SIZES.map((s) => (
              <Button key={s} variant="primary" size={s}>
                Size {s}
              </Button>
            ))}
          </Example>

          <Example title="With icons" note="iconStart for what the action does, iconEnd for where it leads (a menu, the next step).">
            <Button variant="primary" iconStart={<Plus />}>
              New project
            </Button>
            <Button iconStart={<Download />}>Export</Button>
            <Button iconEnd={<ChevronDown />}>Options</Button>
            <Button variant="ghost" iconEnd={<ArrowRight />}>
              Continue
            </Button>
          </Example>

          <Example
            title="Loading"
            note="Keeps its color and stays focusable, sets aria-busy, and ignores clicks. Change the label so screen readers hear the new state."
          >
            <SaveDemo />
            <Button loading>Exporting…</Button>
          </Example>

          <Example title="Disabled" note="Fixed disabled colors, not opacity. Prefer explaining why an action is unavailable over disabling it silently.">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} disabled>
                {v[0].toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </Example>

          <Example title="A typical group" note="One primary, at the end. Destructive actions sit apart from the rest.">
            <Button variant="danger" iconStart={<Trash2 />} className="mr-auto">
              Delete project
            </Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save changes</Button>
          </Example>
        </Section>

        <Section
          id="icon-button"
          title="Icon button"
          blurb="A square button with only an icon, for toolbars and dense rows. The label prop is required, so every icon button has a name screen readers can announce."
        >
          <Example title="Variants" note="Ghost is the default for icon buttons.">
            <IconButton label="Edit" icon={<Pencil />} />
            <IconButton variant="secondary" label="Copy link" icon={<Copy />} />
            <IconButton variant="primary" label="Add item" icon={<Plus />} />
            <IconButton variant="danger" label="Delete row" icon={<Trash2 />} />
          </Example>

          <Example title="Sizes" note="Same heights as Button, so they line up in a row.">
            {SIZES.map((s) => (
              <IconButton key={s} variant="secondary" size={s} label={`Settings, size ${s}`} icon={<Settings />} />
            ))}
            <Button size="md">Next to a md button</Button>
          </Example>

          <Example title="States">
            <IconButton variant="secondary" label="More actions" icon={<MoreHorizontal />} />
            <IconButton variant="secondary" label="Close" icon={<X />} disabled />
            <IconButton variant="secondary" label="Refreshing" icon={<X />} loading />
          </Example>

          <p className="text-body-sm text-fg-secondary">
            Name it for the action, not the picture: <Code>label="Delete row"</Code>, not <Code>label="Trash"</Code>.
          </p>
        </Section>
      </main>
    </div>
  )
}
