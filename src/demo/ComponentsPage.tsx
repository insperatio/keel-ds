import { useState } from 'react'
import { ArrowRight, ChevronDown, Copy, Download, MoreHorizontal, Pencil, Plus, Search, Settings, Trash2, X } from 'lucide-react'
import { brand } from '@/brand.generated'
import { Button, IconButton } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectGroup, SelectItem, SelectSeparator } from '@/components/ui/select'
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

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
]

function FieldBox({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-xs self-start">{children}</div>
}

function EmailDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null)
  return (
    <Form className="w-full max-w-md" onFormSubmit={(values) => setSubmitted(String(values.email))}>
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input type="email" required placeholder="name@example.com" autoComplete="email" />
        <FieldError match="valueMissing">Enter your work email.</FieldError>
        <FieldError match="typeMismatch">Enter an email like name@example.com.</FieldError>
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Send invite
        </Button>
        <p role="status" className="text-body-sm text-fg-secondary">
          {submitted ? `Invite sent to ${submitted}` : ''}
        </p>
      </div>
    </Form>
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
        <Section
          id="input"
          title="Input"
          blurb="Single-line text entry. Always inside a Field with a visible label: the placeholder is a format hint, never the label, because it disappears as soon as someone types."
        >
          <Example title="Field anatomy" note="Label, control, then help text. Field links them, so screen readers read the label and help text with the input.">
            <FieldBox>
              <Field>
                <FieldLabel>Project name</FieldLabel>
                <Input placeholder="e.g. Spring launch" />
                <FieldDescription>Shown to everyone on the team.</FieldDescription>
              </Field>
            </FieldBox>
            <FieldBox>
              <Field>
                <FieldLabel optional>Reference code</FieldLabel>
                <Input />
                <FieldDescription>Mark the few optional fields, not the many required ones.</FieldDescription>
              </Field>
            </FieldBox>
          </Example>

          <Example title="Sizes" note="Same heights as Button. Use the size of the buttons in the same row.">
            {SIZES.map((s) => (
              <FieldBox key={s}>
                <Field>
                  <FieldLabel>Size {s}</FieldLabel>
                  <Input size={s} placeholder={s === 'sm' ? '32px' : s === 'md' ? '40px, default' : '48px'} />
                </Field>
              </FieldBox>
            ))}
          </Example>

          <Example title="States" note="Invalid adds a red border and an error message with an icon, so it never relies on color alone.">
            <FieldBox>
              <Field invalid>
                <FieldLabel>Username</FieldLabel>
                <Input defaultValue="mj" />
                <FieldError>Use at least 3 characters.</FieldError>
              </Field>
            </FieldBox>
            <FieldBox>
              <Field disabled>
                <FieldLabel>Account ID</FieldLabel>
                <Input defaultValue="KEEL-2041" />
                <FieldDescription>Set by your admin.</FieldDescription>
              </Field>
            </FieldBox>
          </Example>

          <Example title="Validation" note="Uses the browser's own checks. Errors appear after submit, then update as you fix them. Try sending it empty, then with a broken email.">
            <EmailDemo />
          </Example>
        </Section>

        <Section
          id="select"
          title="Select"
          blurb="Pick one option from a short list, about 3 to 15. Fewer that all fit on screen: radio buttons. Long or searchable lists: a combobox."
        >
          <Example title="Basic" note="The chosen option gets a check mark, so selection isn't shown by color alone. Arrow keys and type-ahead work.">
            <FieldBox>
              <Field name="role">
                <FieldLabel>Role</FieldLabel>
                <Select items={ROLES} placeholder="Choose a role">
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </Select>
                <FieldDescription>Controls what they can change.</FieldDescription>
              </Field>
            </FieldBox>
            <FieldBox>
              <Field name="timezone">
                <FieldLabel>Time zone</FieldLabel>
                <Select defaultValue="et" items={{ et: 'Eastern (ET)', ct: 'Central (CT)', mt: 'Mountain (MT)', pt: 'Pacific (PT)', gmt: 'London (GMT)', cet: 'Berlin (CET)' }}>
                  <SelectGroup label="Americas">
                    <SelectItem value="et">Eastern (ET)</SelectItem>
                    <SelectItem value="ct">Central (CT)</SelectItem>
                    <SelectItem value="mt">Mountain (MT)</SelectItem>
                    <SelectItem value="pt">Pacific (PT)</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup label="Europe">
                    <SelectItem value="gmt">London (GMT)</SelectItem>
                    <SelectItem value="cet">Berlin (CET)</SelectItem>
                  </SelectGroup>
                </Select>
              </Field>
            </FieldBox>
          </Example>

          <Example title="States">
            <FieldBox>
              <Field invalid>
                <FieldLabel>Plan</FieldLabel>
                <Select items={{ free: 'Free', team: 'Team' }} placeholder="Choose a plan">
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="enterprise" disabled>
                    Enterprise (contact sales)
                  </SelectItem>
                </Select>
                <FieldError>Choose a plan to continue.</FieldError>
              </Field>
            </FieldBox>
            <FieldBox>
              <Field disabled>
                <FieldLabel>Region</FieldLabel>
                <Select defaultValue="us" items={{ us: 'United States' }}>
                  <SelectItem value="us">United States</SelectItem>
                </Select>
                <FieldDescription>Can't change after setup.</FieldDescription>
              </Field>
            </FieldBox>
          </Example>
        </Section>

        <Section id="form-row" title="In a row" blurb="Input, Select and Button share heights, so a toolbar lines up without extra work.">
          <Example title="Filter bar, size sm">
            <div className="flex w-full flex-wrap items-end gap-3">
              <Field className="w-64">
                <FieldLabel>Search</FieldLabel>
                <Input size="sm" type="search" placeholder="Name or email" />
              </Field>
              <Field className="w-44">
                <FieldLabel>Role</FieldLabel>
                <Select size="sm" items={ROLES} defaultValue="editor">
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </Select>
              </Field>
              <Button size="sm" iconStart={<Search />}>
                Apply
              </Button>
            </div>
          </Example>
        </Section>
      </main>
    </div>
  )
}
