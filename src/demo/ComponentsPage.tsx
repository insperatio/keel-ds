import { useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Circle, XCircle, ChevronDown, Copy, Download, MoreHorizontal, Pencil, Plus, Search, Settings, Trash2, X } from 'lucide-react'
import { brand } from '@/brand.generated'
import { Badge } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectGroup, SelectItem, SelectSeparator } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tab, Tabs, TabsList, TabsPanel } from '@/components/ui/tabs'
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

const NOTIFY = [
  { value: 'mentions', label: 'Mentions' },
  { value: 'replies', label: 'Replies to my comments' },
  { value: 'assigned', label: 'Tasks assigned to me' },
]

function SelectAllDemo() {
  const [value, setValue] = useState<string[]>(['mentions'])
  return (
    <CheckboxGroup
      legend="Email me about"
      description="Choose any. Use the first box to change them all."
      value={value}
      onValueChange={setValue}
      allValues={NOTIFY.map((n) => n.value)}
    >
      <Checkbox parent>All activity</Checkbox>
      <div className="flex flex-col gap-3 pl-8">
        {NOTIFY.map((n) => (
          <Checkbox key={n.value} value={n.value}>
            {n.label}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  )
}

function TermsDemo() {
  const [done, setDone] = useState(false)
  return (
    <Form className="w-full max-w-md" onFormSubmit={() => setDone(true)}>
      <Field name="terms">
        <Checkbox required>I agree to the terms of service</Checkbox>
        <FieldError match="valueMissing">Agree to the terms to create your account.</FieldError>
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Create account
        </Button>
        <p role="status" className="text-body-sm text-fg-secondary">
          {done ? 'Account created' : ''}
        </p>
      </div>
    </Form>
  )
}

function SettingsDemo() {
  const [compact, setCompact] = useState(false)
  return (
    <div className="w-full max-w-md divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface-raised">
      <Switch defaultChecked description="A dot on the app icon when something new arrives." className="p-4">
        Notifications
      </Switch>
      <Switch checked={compact} onCheckedChange={setCompact} description={compact ? 'On: tighter rows in lists.' : 'Off: comfortable rows in lists.'} className="p-4">
        Compact layout
      </Switch>
      <Switch disabled description="Your admin manages this setting." className="p-4">
        Share usage data
      </Switch>
    </div>
  )
}

const TONES = ['neutral', 'success', 'warning', 'danger'] as const

const DEPLOYS = [
  { name: 'keel-docs', when: '2 min ago', status: 'success' as const, label: 'Live' },
  { name: 'keel-registry', when: '14 min ago', status: 'warning' as const, label: 'Slow build' },
  { name: 'keel-storybook', when: '1 hr ago', status: 'danger' as const, label: 'Failed' },
  { name: 'keel-site', when: 'Queued', status: 'neutral' as const, label: 'Waiting' },
]
const STATUS_ICON = { success: <CheckCircle2 />, warning: <AlertTriangle />, danger: <XCircle />, neutral: <Circle /> }

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

        <Section
          id="checkbox"
          title="Checkbox"
          blurb="Turns one option on or off in a form that saves when submitted. The whole label is clickable. For a setting that applies the moment it changes, use Switch."
        >
          <Example title="With labels" note="Say what turning it on means. Help text goes under the label and is announced with the box.">
            <div className="flex w-full max-w-md flex-col gap-4 self-start">
              <Checkbox defaultChecked>Email me when someone replies</Checkbox>
              <Checkbox description="One email a week, every Monday.">Weekly summary</Checkbox>
            </div>
          </Example>

          <Example title="States" note="Checked and mixed use the primary color with a check or dash, so the state never relies on color alone.">
            <div className="grid w-full grid-cols-2 gap-4 self-start md:grid-cols-3">
              <Checkbox>Unchecked</Checkbox>
              <Checkbox defaultChecked>Checked</Checkbox>
              <Checkbox indeterminate>Mixed</Checkbox>
              <Checkbox disabled>Disabled</Checkbox>
              <Checkbox disabled defaultChecked>
                Disabled, checked
              </Checkbox>
            </div>
          </Example>

          <Example title="Group with select all" note="A legend names the group. The parent box shows a dash when only some are checked.">
            <SelectAllDemo />
          </Example>

          <Example title="Required" note="Submit without checking it to see the error.">
            <TermsDemo />
          </Example>
        </Section>

        <Section
          id="switch"
          title="Switch"
          blurb="A setting that takes effect immediately, like a light switch. If the change waits for a Save button, use Checkbox. Label it with the setting, not the action."
        >
          <Example title="Settings list" note="Label first, switch at the end of the row. The thumb moves and changes color when on.">
            <SettingsDemo />
          </Example>
        </Section>

        <Section
          id="badge"
          title="Badge"
          blurb="A short label for status or a count. Not clickable, so there's no accent tone: in Keel, accent means you can act on it. The words carry the meaning, not the color."
        >
          <Example title="Tones" note="Subtle is the default. Solid is for the one item that has to stand out.">
            <div className="grid gap-3 self-start">
              {(['subtle', 'solid'] as const).map((v) => (
                <div key={v} className="flex flex-wrap items-center gap-2">
                  <span className="w-14 text-body-sm text-fg-secondary">{v}</span>
                  {TONES.map((t) => (
                    <Badge key={t} tone={t} variant={v}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </Badge>
                  ))}
                </div>
              ))}
            </div>
          </Example>

          <Example title="Sizes and icons" note="sm (20px) for tables and dense lists, md (24px) next to headings. Icons are decorative.">
            <Badge size="sm" tone="success" icon={<CheckCircle2 />}>
              Passed
            </Badge>
            <Badge size="md" tone="success" icon={<CheckCircle2 />}>
              Passed
            </Badge>
            <Badge size="md" tone="danger" variant="solid" icon={<XCircle />}>
              2 errors
            </Badge>
          </Example>

          <Example title="In a list" note="Same tone, same meaning everywhere: success is done, warning needs a look, danger is broken, neutral is waiting or unknown.">
            <ul className="w-full max-w-lg divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface-raised">
              {DEPLOYS.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="flex flex-col">
                    <span className="text-label-md text-fg-primary">{d.name}</span>
                    <span className="text-body-sm text-fg-tertiary">{d.when}</span>
                  </span>
                  <Badge tone={d.status} icon={STATUS_ICON[d.status]}>
                    {d.label}
                  </Badge>
                </li>
              ))}
            </ul>
          </Example>
        </Section>

        <Section
          id="tabs"
          title="Tabs"
          blurb="Switch between 2 to 7 views of the same thing without leaving the page. Not for steps in order, and not for links to other pages."
        >
          <Example title="Basic" note="Arrow keys move between tabs; Tab moves into the panel. The underline slides to the active tab.">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList label="Project sections">
                <Tab value="overview">Overview</Tab>
                <Tab value="activity" count={12}>
                  Activity
                </Tab>
                <Tab value="members" count={4}>
                  Members
                </Tab>
                <Tab value="billing" disabled>
                  Billing
                </Tab>
              </TabsList>
              <TabsPanel value="overview">
                <p className="max-w-xl text-body-md text-fg-secondary">The project at a glance: owner, status and the latest release.</p>
              </TabsPanel>
              <TabsPanel value="activity">
                <p className="max-w-xl text-body-md text-fg-secondary">12 events this week, newest first.</p>
              </TabsPanel>
              <TabsPanel value="members">
                <p className="max-w-xl text-body-md text-fg-secondary">4 people can see this project.</p>
              </TabsPanel>
              <TabsPanel value="billing">
                <p className="max-w-xl text-body-md text-fg-secondary">Billing is managed by your organization.</p>
              </TabsPanel>
            </Tabs>
          </Example>

          <Example title="Many tabs" note="When tabs don't fit, the row scrolls sideways instead of wrapping. More than 7 usually means you need a different pattern.">
            <Tabs defaultValue="t1" className="w-full max-w-sm">
              <TabsList label="Report months">
                {['January', 'February', 'March', 'April', 'May', 'June'].map((m, i) => (
                  <Tab key={m} value={`t${i + 1}`}>
                    {m}
                  </Tab>
                ))}
              </TabsList>
              {['January', 'February', 'March', 'April', 'May', 'June'].map((m, i) => (
                <TabsPanel key={m} value={`t${i + 1}`}>
                  <p className="text-body-md text-fg-secondary">{m} report.</p>
                </TabsPanel>
              ))}
            </Tabs>
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
