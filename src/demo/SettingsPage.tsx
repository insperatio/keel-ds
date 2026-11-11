// Example page: workspace settings built only from Keel components and token
// classes. No custom CSS, colors, sizes or inline styles. If something here needed
// one, that would be a gap in the system to fix there, not here.
import { useState } from 'react'
import { MoreHorizontal, Trash2, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/ui/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Select, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { DemoLayout } from './DemoLayout'

const ROLES = { viewer: 'Viewer', editor: 'Editor', admin: 'Admin' } as const
type Role = keyof typeof ROLES | 'owner'
type Member = { email: string; name: string; role: Role; status: 'active' | 'invited' }

const TIMEZONES = { et: 'Eastern (ET)', ct: 'Central (CT)', pt: 'Pacific (PT)', gmt: 'London (GMT)' }

function ProfileSection() {
  const toast = useToast()
  return (
    <Card id="profile" className="scroll-mt-20">
      <Form onFormSubmit={() => toast.success('Profile saved')}>
        <CardHeader>
          <CardTitle as="h2">Profile</CardTitle>
          <CardDescription>How you appear to people in this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 grid gap-4 md:grid-cols-2">
          <Field name="name">
            <FieldLabel>Full name</FieldLabel>
            <Input required defaultValue="Mariana Johnels" autoComplete="name" />
            <FieldError match="valueMissing">Enter your name.</FieldError>
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" required defaultValue="mj@example.com" autoComplete="email" />
            <FieldError match="valueMissing">Enter your email.</FieldError>
            <FieldError match="typeMismatch">Enter an email like name@example.com.</FieldError>
          </Field>
          <Field name="title">
            <FieldLabel optional>Job title</FieldLabel>
            <Input defaultValue="Principal Designer" autoComplete="organization-title" />
          </Field>
          <Field name="timezone">
            <FieldLabel>Time zone</FieldLabel>
            <Select items={TIMEZONES} defaultValue="et">
              {Object.entries(TIMEZONES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </Select>
            <FieldDescription>Used for due dates and reminders.</FieldDescription>
          </Field>
        </CardContent>
        <CardFooter className="mt-6 justify-end">
          <Button type="submit" variant="primary">
            Save profile
          </Button>
        </CardFooter>
      </Form>
    </Card>
  )
}

function NotificationsSection() {
  return (
    <Card id="notifications" className="scroll-mt-20">
      <CardHeader>
        <CardTitle as="h2">Notifications</CardTitle>
        <CardDescription>These apply as soon as you change them.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-line-subtle">
        <Switch defaultChecked description="When someone mentions you or replies to you." className="py-4">
          Mentions and replies
        </Switch>
        <Switch defaultChecked description="When a task is assigned to you or its due date changes." className="py-4">
          Task updates
        </Switch>
        <Switch description="A summary of the week's activity, every Monday." className="py-4">
          Weekly digest
        </Switch>
        <Switch disabled defaultChecked description="Required for account and billing notices." className="py-4">
          Security alerts
        </Switch>
      </CardContent>
    </Card>
  )
}

function InviteDialog({ onInvite }: { onInvite: (m: Member) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" iconStart={<UserPlus />} />}>Invite</DialogTrigger>
      <DialogContent size="sm">
        <Form
          className="contents"
          onFormSubmit={(values) => {
            const email = String(values.email)
            onInvite({ email, name: email.split('@')[0], role: (values.role as Role) ?? 'editor', status: 'invited' })
            setOpen(false)
          }}
        >
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They'll get an email with a link to join.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <Field name="email">
              <FieldLabel>Email</FieldLabel>
              <Input type="email" required placeholder="name@example.com" />
              <FieldError match="valueMissing">Enter their email.</FieldError>
              <FieldError match="typeMismatch">Enter an email like name@example.com.</FieldError>
            </Field>
            <Field name="role">
              <FieldLabel>Role</FieldLabel>
              <Select items={ROLES} defaultValue="editor">
                {Object.entries(ROLES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </Select>
              <FieldDescription>Editors can change content; admins can also manage people and billing.</FieldDescription>
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" variant="primary">
              Send invite
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function TeamSection() {
  const toast = useToast()
  const [members, setMembers] = useState<Member[]>([
    { email: 'mj@example.com', name: 'Mariana Johnels', role: 'owner', status: 'active' },
    { email: 'sam@example.com', name: 'Sam Rivera', role: 'admin', status: 'active' },
    { email: 'priya@example.com', name: 'Priya Natarajan', role: 'editor', status: 'active' },
    { email: 'leo@example.com', name: 'leo', role: 'viewer', status: 'invited' },
  ])
  return (
    <Card id="team" className="scroll-mt-20">
      <CardHeader>
        <CardTitle as="h2">Team</CardTitle>
        <CardDescription>
          {members.length} people, {members.filter((m) => m.status === 'invited').length} invited
        </CardDescription>
        <CardAction>
          <InviteDialog
            onInvite={(m) => {
              setMembers((list) => [...list, m])
              toast.success(`Invite sent to ${m.email}`)
            }}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table caption="Team members" hideCaption density="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.email}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-label-md text-fg-primary">{m.name}</span>
                    <span className="text-body-sm text-fg-tertiary">{m.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-fg-secondary">{m.role === 'owner' ? 'Owner' : ROLES[m.role]}</TableCell>
                <TableCell>
                  {m.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge>Invited</Badge>}
                </TableCell>
                <TableCell>
                  <IconButton size="sm" label={`More actions for ${m.name}`} icon={<MoreHorizontal />} disabled={m.role === 'owner'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PlanSection() {
  return (
    <Card id="plan" className="scroll-mt-20">
      <CardHeader>
        <CardTitle as="h2">Plan</CardTitle>
        <CardDescription>Billed yearly. Renews January 12, 2027.</CardDescription>
        <CardAction>
          <Badge tone="success" size="md">
            Team plan
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            ['Seats', '4 of 10'],
            ['Storage', '41 of 50 GB'],
            ['Projects', '12'],
          ].map(([term, value]) => (
            <div key={term} className="flex flex-col gap-1">
              <dt className="text-body-sm text-fg-secondary">{term}</dt>
              <dd className="text-heading-md text-fg-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <CardFooter>
        <Button>Change plan</Button>
        <Button variant="ghost">Download invoices</Button>
      </CardFooter>
    </Card>
  )
}

function DangerSection() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  return (
    <Card id="danger" className="scroll-mt-20 border-status-danger-border">
      <CardHeader>
        <CardTitle as="h2">Delete workspace</CardTitle>
        <CardDescription>Removes all projects, files and history for everyone. You have 14 days to restore it.</CardDescription>
      </CardHeader>
      <CardFooter>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger render={<Button variant="danger" iconStart={<Trash2 />} />}>Delete workspace</AlertDialogTrigger>
          <AlertDialogContent>
            <DialogHeader className="pr-6">
              <AlertDialogTitle>Delete “Insperatio”?</AlertDialogTitle>
              <AlertDialogDescription>All 12 projects and their history are removed for 4 people. You can restore it for 14 days.</AlertDialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <AlertDialogCancel />
              <Button
                variant="danger"
                onClick={() => {
                  setOpen(false)
                  toast.warning('Workspace scheduled for deletion', { action: { label: 'Restore', onClick: () => toast.success('Workspace restored') } })
                }}
              >
                Delete workspace
              </Button>
            </DialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

export default function SettingsPage({ section }: { section: string | null }) {
  return (
    <DemoLayout
      page="example"
      section={section}
      sidebarTitle="Settings"
      sections={[
        { title: 'Account', items: [['profile', 'Profile'], ['notifications', 'Notifications']] },
        { title: 'Workspace', items: [['team', 'Team'], ['plan', 'Plan'], ['danger', 'Delete workspace']] },
      ]}
    >
      <PageHeader
        overline="Example"
        title="Workspace settings"
        description="A realistic page built only from Keel components and tokens: no custom CSS, colors, sizes or inline styles."
      />
      <div className="flex flex-col gap-8 *:min-w-0">
        <ProfileSection />
        <NotificationsSection />
        <TeamSection />
        <PlanSection />
        <DangerSection />
      </div>
    </DemoLayout>
  )
}
