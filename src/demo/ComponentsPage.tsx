import { useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Circle, XCircle, ChevronDown, Copy, Download, MoreHorizontal, Pencil, Plus, Search, Settings, Trash2, X } from 'lucide-react'
import { brand } from '@/brand.generated'
import { Badge } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectGroup, SelectItem, SelectSeparator } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow, type Sort } from '@/components/ui/table'
import { Tab, Tabs, TabsList, TabsPanel } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { PageHeader } from '@/components/ui/app-shell'
import { DemoLayout } from './DemoLayout'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const
const SIZES = ['sm', 'md', 'lg'] as const

function Section({ id, title, blurb, children }: { id: string; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-line-subtle py-12">
      <h2 id={`${id}-title`} className="text-heading-lg">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-body-md text-fg-secondary">{blurb}</p>
      <div className="mt-8 grid gap-10 *:min-w-0">{children}</div>
    </section>
  )
}

function Example({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-heading-sm">{title}</h3>
      {note && <p className="mt-1 max-w-2xl text-body-sm text-fg-secondary">{note}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line-subtle bg-surface-subtle p-4 *:min-w-0 *:max-w-full md:p-6">{children}</div>
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

const PROJECTS = [
  { id: 'atlas', name: 'Atlas redesign', desc: 'Marketing site, 14 pages', status: 'success' as const, label: 'On track', updated: 'Updated 2 hours ago' },
  { id: 'harbor', name: 'Harbor app', desc: 'Mobile web checkout', status: 'warning' as const, label: 'At risk', updated: 'Updated yesterday' },
  { id: 'compass', name: 'Compass reports', desc: 'Internal dashboards', status: 'neutral' as const, label: 'Planning', updated: 'Updated Nov 2' },
]

const MEMBERS = [
  { id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', seats: 12, active: '2026-11-09' },
  { id: 'u2', name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', seats: 8, active: '2026-11-10' },
  { id: 'u3', name: 'Alan Turing', email: 'alan@example.com', role: 'Editor', seats: 3, active: '2026-10-28' },
  { id: 'u4', name: 'Katherine Johnson', email: 'katherine@example.com', role: 'Editor', seats: 5, active: '2026-11-04' },
  { id: 'u5', name: 'Edsger Dijkstra', email: 'edsger@example.com', role: 'Viewer', seats: 1, active: '2026-09-30' },
]
type MemberKey = 'name' | 'seats' | 'active'

function MembersTable() {
  const [sortKey, setSortKey] = useState<MemberKey>('name')
  const [dir, setDir] = useState<Exclude<Sort, 'none'>>('ascending')
  const [selected, setSelected] = useState<string[]>(['u2'])
  const [query, setQuery] = useState('')
  const rows = MEMBERS.filter((m) => (m.name + m.email).toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
    const r = sortKey === 'seats' ? a.seats - b.seats : String(a[sortKey]).localeCompare(String(b[sortKey]))
    return dir === 'ascending' ? r : -r
  })
  const sortOf = (k: MemberKey): Sort => (k === sortKey ? dir : 'none')
  const toggleSort = (k: MemberKey) => {
    if (k === sortKey) setDir(dir === 'ascending' ? 'descending' : 'ascending')
    else {
      setSortKey(k)
      setDir('ascending')
    }
  }
  const visibleIds = rows.map((r) => r.id)
  const checkedVisible = visibleIds.filter((id) => selected.includes(id))
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-64">
          <FieldLabel>Filter members</FieldLabel>
          <Input size="sm" type="search" placeholder="Name or email" value={query} onValueChange={setQuery} />
        </Field>
        <p role="status" className="pb-1.5 text-body-sm text-fg-secondary">
          {selected.length} selected
        </p>
      </div>
      <Table caption="Team members">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                aria-label="Select all members"
                checked={checkedVisible.length > 0 && checkedVisible.length === visibleIds.length}
                indeterminate={checkedVisible.length > 0 && checkedVisible.length < visibleIds.length}
                disabled={visibleIds.length === 0}
                onCheckedChange={(on) => setSelected(on ? [...new Set([...selected, ...visibleIds])] : selected.filter((id) => !visibleIds.includes(id)))}
              />
            </TableHead>
            <TableHead sort={sortOf('name')} onSort={() => toggleSort('name')}>
              Name
            </TableHead>
            <TableHead>Role</TableHead>
            <TableHead numeric sort={sortOf('seats')} onSort={() => toggleSort('seats')}>
              Seats
            </TableHead>
            <TableHead sort={sortOf('active')} onSort={() => toggleSort('active')}>
              Last active
            </TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={6}>No members match “{query}”. Check the spelling or clear the filter.</TableEmpty>
          ) : (
            rows.map((m) => {
              const isSel = selected.includes(m.id)
              return (
                <TableRow key={m.id} selected={isSel}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${m.name}`}
                      checked={isSel}
                      onCheckedChange={(on) => setSelected(on ? [...selected, m.id] : selected.filter((id) => id !== m.id))}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-label-md">{m.name}</span>
                      <span className="text-body-sm text-fg-tertiary">{m.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge tone={m.role === 'Owner' ? 'success' : 'neutral'}>{m.role}</Badge>
                  </TableCell>
                  <TableCell numeric>{m.seats}</TableCell>
                  <TableCell className="text-fg-secondary">
                    {new Date(m.active + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <IconButton size="sm" label={`More actions for ${m.name}`} icon={<MoreHorizontal />} />
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

const USAGE = [
  { month: 'July', builds: 1284, minutes: 9310.5, cost: 186.21 },
  { month: 'August', builds: 1432, minutes: 10224.25, cost: 204.49 },
  { month: 'September', builds: 1190, minutes: 8402, cost: 168.04 },
  { month: 'October', builds: 1611, minutes: 12007.75, cost: 240.16 },
]

function EditProfileDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Mariana Johnels')
  return (
    <div className="flex items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button iconStart={<Pencil />} />}>Edit profile</DialogTrigger>
        <DialogContent>
          <Form
            className="contents"
            onFormSubmit={(values) => {
              setName(String(values.name))
              setOpen(false)
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Your name and role show to everyone on the team.</DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">
              <Field name="name">
                <FieldLabel>Full name</FieldLabel>
                <Input required defaultValue={name} autoComplete="name" />
                <FieldError match="valueMissing">Enter your name.</FieldError>
              </Field>
              <Field name="role">
                <FieldLabel>Role</FieldLabel>
                <Select items={ROLES} defaultValue="admin">
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </Select>
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button type="submit" variant="primary">
                Save changes
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
      <p role="status" className="text-body-sm text-fg-secondary">
        Name: {name}
      </p>
    </div>
  )
}

function DeleteProjectDialog() {
  const [deleted, setDeleted] = useState(false)
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button variant="danger" iconStart={<Trash2 />} />}>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <DialogHeader className="pr-6">
            <AlertDialogTitle>Delete “Atlas redesign”?</AlertDialogTitle>
            <AlertDialogDescription>Its 14 pages and all history are removed for everyone. This can’t be undone.</AlertDialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <AlertDialogCancel />
            <Button
              variant="danger"
              onClick={() => {
                setDeleted(true)
                setOpen(false)
              }}
            >
              Delete project
            </Button>
          </DialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-body-sm text-fg-secondary">
        {deleted ? 'Project deleted' : ''}
      </p>
    </div>
  )
}

function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" />}>Read the terms</DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Last updated November 1, 2026.</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4 text-fg-secondary">
          {Array.from({ length: 12 }, (_, i) => (
            <section key={i}>
              <h3 className="text-heading-sm text-fg-primary">
                {i + 1}. Section {i + 1}
              </h3>
              <p className="mt-1">
                Placeholder text for a long agreement. The body scrolls on its own, so the title stays visible at the top and the
                actions stay at the bottom while you read.
              </p>
            </section>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="primary" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ToastDemo() {
  const toast = useToast()
  const [archived, setArchived] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.success('Changes saved')}>Success</Button>
        <Button onClick={() => toast.info('New version available', { description: 'Refresh to get the latest features.' })}>Info</Button>
        <Button onClick={() => toast.warning('Storage almost full', { description: '41 of 50 GB used. Upgrade or clean up files.' })}>Warning</Button>
        <Button onClick={() => toast.error('Couldn’t save changes', { description: 'Check your connection and try again.' })}>Error</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            setArchived(true)
            toast.info('Project archived', { action: { label: 'Undo', onClick: () => setArchived(false) } })
          }}
        >
          Archive with undo
        </Button>
        <Button
          onClick={() =>
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
              loading: 'Publishing…',
              success: 'Published',
              error: 'Couldn’t publish',
            })
          }
        >
          Publish (loading, then success)
        </Button>
        <p className="text-body-sm text-fg-secondary">Project: {archived ? 'archived' : 'active'}</p>
      </div>
    </div>
  )
}

export default function ComponentsPage({ section }: { section: string | null }) {

  return (
    <DemoLayout
      page="components"
      section={section}
      sidebarTitle="Components"
      sections={[
        { title: 'Actions', items: [['button', 'Button'], ['icon-button', 'Icon button']] },
        { title: 'Forms', items: [['input', 'Input'], ['select', 'Select'], ['checkbox', 'Checkbox'], ['switch', 'Switch'], ['form-row', 'In a row']] },
        { title: 'Display', items: [['badge', 'Badge'], ['tabs', 'Tabs'], ['card', 'Card'], ['table', 'Table']] },
        { title: 'Overlays', items: [['dialog', 'Dialog'], ['toast', 'Toast']] },
      ]}
    >
      <PageHeader
        overline="Components"
        title={`${brand.name} components`}
        description={`Built on Base UI, styled only with ${brand.name} tokens. Tab through this page to see every focus ring.`}
      />

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

        <Section
          id="card"
          title="Card"
          blurb="Groups content about one thing on a raised surface. A clickable card has one link, its title, with a click area that covers the whole card."
        >
          <Example title="Anatomy" note="Header with title, description and an optional action on the right; then content; then a footer for actions.">
            <Card className="w-full max-w-sm self-start">
              <CardHeader>
                <CardTitle>Storage</CardTitle>
                <CardDescription>Across all projects</CardDescription>
                <CardAction>
                  <Badge tone="warning">82% used</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>
                  <span className="text-heading-lg text-fg-primary">41 GB</span> of 50 GB
                </p>
                <p className="mt-1 text-body-sm text-fg-tertiary">At this rate, full in about 3 weeks.</p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">
                  Upgrade plan
                </Button>
                <Button variant="ghost" size="sm">
                  Clean up files
                </Button>
              </CardFooter>
            </Card>
          </Example>

          <Example title="Clickable cards" note="The whole card opens the project. Screen readers hear one link per card, named by its title. Hover shows a stronger border; Tab shows the focus ring around the card.">
            <ul className="grid w-full gap-4 md:grid-cols-3">
              {PROJECTS.map((p) => (
                <li key={p.id} className="flex">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle href={`#/components?project=${p.id}`}>{p.name}</CardTitle>
                      <CardDescription>{p.desc}</CardDescription>
                      <CardAction>
                        <Badge tone={p.status}>{p.label}</Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter>
                      <span className="text-body-sm text-fg-tertiary">{p.updated}</span>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          </Example>

          <Example title="Elevated and small" note="Elevated swaps the border for a shadow, for cards over busy content. Small tightens the padding for dense layouts.">
            <Card variant="elevated" className="w-full max-w-xs self-start">
              <CardHeader>
                <CardTitle>Elevated</CardTitle>
                <CardDescription>Shadow md, no border.</CardDescription>
              </CardHeader>
            </Card>
            <Card size="sm" className="w-full max-w-xs self-start">
              <CardHeader>
                <CardTitle>Small</CardTitle>
                <CardDescription>16px padding instead of 24px.</CardDescription>
              </CardHeader>
            </Card>
          </Example>
        </Section>

        <Section
          id="table"
          title="Table"
          blurb="Rows of records with the same columns. Real table markup, so screen readers announce the column with every cell. Never use a table for layout."
        >
          <Example title="Sort, select and filter" note="Header buttons sort; the arrow shows the direction and screen readers hear it. A selected row is tinted and its checkbox is checked. Filter to nothing to see the empty state.">
            <MembersTable />
          </Example>

          <Example title="Compact, numeric and narrow" note="Numbers right-align with even-width digits. When the table is wider than its frame, the frame scrolls sideways and can be scrolled with the keyboard.">
            <div className="w-full max-w-sm">
              <Table caption="Build usage by month" density="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead numeric>Builds</TableHead>
                    <TableHead numeric>Build minutes</TableHead>
                    <TableHead numeric>Minutes per build</TableHead>
                    <TableHead numeric>Cost (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {USAGE.map((u) => (
                    <TableRow key={u.month}>
                      <TableCell>{u.month}</TableCell>
                      <TableCell numeric>{u.builds.toLocaleString('en-US')}</TableCell>
                      <TableCell numeric>{u.minutes.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell numeric>{(u.minutes / u.builds).toFixed(1)}</TableCell>
                      <TableCell numeric>{u.cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Example>
        </Section>

        <Section
          id="dialog"
          title="Dialog"
          blurb="A focused task or decision on top of the page. Focus moves in, stays inside, and returns to the button that opened it. Escape closes it."
        >
          <Example title="Form in a dialog" note="Title and description name the dialog for screen readers. Save validates first; Cancel or Escape discards.">
            <EditProfileDialog />
          </Example>

          <Example title="Confirm before deleting" note="AlertDialog: clicking outside doesn't close it, and focus starts on Cancel, so a stray Enter can't delete anything. The button says what it does.">
            <DeleteProjectDialog />
          </Example>

          <Example title="Long content" note="The body scrolls; the title and the footer stay in place.">
            <TermsDialog />
          </Example>
        </Section>

        <Section
          id="toast"
          title="Toast"
          blurb="A short, temporary message about something that just happened. Never the only place important information or an action lives."
        >
          <Example
            title="Types and timing"
            note="Success and info close after 5 seconds (10 with an action); hover or focus pauses them. Warning and error stay until dismissed. Press F6 to reach the toasts by keyboard."
          >
            <ToastDemo />
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
    </DemoLayout>
  )
}
