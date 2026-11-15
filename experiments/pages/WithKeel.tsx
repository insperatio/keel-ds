// The same brief, built from Keel with AGENTS.md and the rule files in context.
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, IconButton } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'

const members = [
  { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', status: 'Active' as const },
  { name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'Active' as const },
  { name: 'Alan Turing', email: 'alan@example.com', role: 'Editor', status: 'Invited' as const },
]

const ROLES = { editor: 'Editor', admin: 'Admin', owner: 'Owner' }

export default function WithKeel() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-surface-page p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 *:min-w-0">
        <header className="flex flex-col gap-1">
          <h1 className="text-heading-lg text-fg-primary">Team settings</h1>
          <p className="text-body-md text-fg-secondary">Manage who can access this workspace.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle as="h2">Invite a teammate</CardTitle>
            <CardDescription>They get an email with a link that expires in 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault()
                setEmail('')
              }}
            >
              <Field name="email" className="min-w-0 flex-1">
                <FieldLabel>Email address</FieldLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                <FieldDescription>They'll be added as soon as they accept.</FieldDescription>
              </Field>
              <Field name="role" className="sm:w-40">
                <FieldLabel>Role</FieldLabel>
                <Select items={ROLES} defaultValue="editor">
                  {Object.entries(ROLES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </Select>
              </Field>
              <Button type="submit" variant="primary">
                Send invite
              </Button>
            </form>
          </CardContent>
        </Card>

        <Table caption="Members of this workspace">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Remove</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.email}>
                <TableCell>
                  <div className="text-body-sm text-fg-primary">{m.name}</div>
                  <div className="text-body-sm text-fg-secondary">{m.email}</div>
                </TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>
                  <Badge tone={m.status === 'Active' ? 'success' : 'warning'}>{m.status}</Badge>
                </TableCell>
                <TableCell align="right">
                  <IconButton label={`Remove ${m.name}`} icon={<Trash2 />} size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Card>
          <CardHeader>
            <CardTitle as="h2">Danger zone</CardTitle>
            <CardDescription>Deleting the workspace removes every project and file in it. This cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="danger" />}>Delete workspace</AlertDialogTrigger>
              <AlertDialogContent>
                <DialogHeader>
                  <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Its 14 projects and all their history are removed for everyone. This cannot be undone.
                  </AlertDialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <AlertDialogCancel>Keep workspace</AlertDialogCancel>
                  <Button variant="danger">Delete workspace</Button>
                </DialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
