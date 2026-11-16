import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Input } from './input'
import { textControl } from '@/storybook/controls'
import { noFigmaFrame } from '@/storybook/figma'

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: noFigmaFrame('Field is wiring: what you see is the Input inside it, which has its own frame.'),
  argTypes: { children: textControl },
  args: { name: 'email' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Email address</FieldLabel>
      <Input type="email" autoComplete="email" placeholder="name@example.com" />
    </Field>
  ),
}

export const WithDescription: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Email address</FieldLabel>
      <Input type="email" autoComplete="email" placeholder="name@example.com" />
      <FieldDescription>We only use this to sign you in.</FieldDescription>
    </Field>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <Field {...args} invalid>
      <FieldLabel>Email address</FieldLabel>
      <Input type="email" defaultValue="not-an-email" />
      <FieldError>Enter a work email address, like name@example.com.</FieldError>
    </Field>
  ),
}

export const Optional: Story = {
  render: (args) => (
    <Field {...args} name="nickname">
      <FieldLabel optional>What should we call you?</FieldLabel>
      <Input placeholder="Ada" />
    </Field>
  ),
}
