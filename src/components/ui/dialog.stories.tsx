import type { Meta, StoryObj } from '@storybook/react-vite'
import { Trash2 } from 'lucide-react'
import { Button } from './button'
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
} from './dialog'
import { Field, FieldError, FieldLabel } from './field'
import { Form } from './form'
import { Input } from './input'
import { figma } from '@/storybook/figma'

/**
 * A focused task on top of the page: finish it or dismiss it. Focus moves in, stays inside, and
 * returns to the trigger. Rules: `docs/rules/dialog.md`.
 */
// The props worth playing with are on DialogContent, not on the root, so the stories take the
// size directly rather than through the component's own props.
type Args = { size?: 'sm' | 'md' | 'lg' }

const meta: Meta<Args> = {
  title: 'Components/Dialog',
  parameters: figma('dialog'),
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
}

export default meta
type Story = StoryObj<Args>

/** Open it to see focus move in; Escape or Cancel closes it and focus comes back to the button. */
export const WithAForm: Story = {
  render: ({ size = 'sm' }) => (
    <Dialog>
      <DialogTrigger render={<Button variant="primary" />}>Invite a teammate</DialogTrigger>
      <DialogContent size={size}>
        <Form className="contents" onFormSubmit={() => {}}>
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
  ),
}

/** Open on load, so the panel itself can be reviewed. */
export const Open: Story = {
  render: ({ size = 'md' }) => (
    <Dialog defaultOpen>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Your name and role show to everyone on the team.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-body-md text-fg-secondary">The body scrolls when the dialog is taller than the screen, so the title and the actions stay put.</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button variant="primary">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** A destructive confirmation: clicking outside doesn't dismiss it, and focus starts on Cancel. */
export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="danger" iconStart={<Trash2 />} />}>Delete project</AlertDialogTrigger>
      <AlertDialogContent>
        <DialogHeader className="pr-6">
          <AlertDialogTitle>Delete “Atlas redesign”?</AlertDialogTitle>
          <AlertDialogDescription>Its 14 pages and all history are removed for everyone. This can't be undone.</AlertDialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <AlertDialogCancel />
          <Button variant="danger">Delete project</Button>
        </DialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
