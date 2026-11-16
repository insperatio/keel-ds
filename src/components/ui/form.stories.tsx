import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form } from './form'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Input } from './input'
import { Button } from './button'
import { noFigmaFrame } from '@/storybook/figma'

const meta = {
  title: 'Components/Form',
  component: Form,
  parameters: noFigmaFrame('Form is wiring: what you see is the fields and the button inside it, which have their own frames.'),
  argTypes: { children: { control: false, table: { disable: true } } },
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function InviteForm() {
    return (
      <Form className="w-full max-w-sm" onFormSubmit={() => {}}>
        <Field name="email">
          <FieldLabel>Email address</FieldLabel>
          <Input type="email" autoComplete="email" placeholder="name@example.com" required />
          <FieldError match="valueMissing">Enter the address to send the invite to.</FieldError>
          <FieldError match="typeMismatch">That doesn't look like an email address.</FieldError>
        </Field>
        <Button type="submit" variant="primary">
          Send invite
        </Button>
      </Form>
    )
  },
}

export const WithServerError: Story = {
  name: 'With an error from the server',
  render: function ServerErrorForm() {
    return (
      <Form className="w-full max-w-sm" errors={{ email: 'That person is already on the team.' }} onFormSubmit={() => {}}>
        <Field name="email">
          <FieldLabel>Email address</FieldLabel>
          <Input type="email" autoComplete="email" defaultValue="ada@example.com" />
          <FieldDescription>They'll be added as soon as they accept.</FieldDescription>
          <FieldError />
        </Field>
        <Button type="submit" variant="primary">
          Send invite
        </Button>
      </Form>
    )
  },
}
