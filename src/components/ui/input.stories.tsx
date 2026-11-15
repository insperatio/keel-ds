import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Form } from './form'
import { Button } from './button'
import { Input } from './input'

/**
 * One line of text. Always inside a `Field` with a visible `FieldLabel`: the placeholder is a
 * format hint, never the label. Rules: `docs/rules/input.md`.
 */
const meta = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: 'name@example.com' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: (args) => (
    <Field className="w-80">
      <FieldLabel>Work email</FieldLabel>
      <Input {...args} />
    </Field>
  ),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHelpText: Story = {
  render: (args) => (
    <Field className="w-80">
      <FieldLabel>Project name</FieldLabel>
      <Input {...args} placeholder="e.g. Spring launch" />
      <FieldDescription>Shown to everyone on the team.</FieldDescription>
    </Field>
  ),
}

/** 32, 40 and 48px. Use the size of the buttons in the same row. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Field key={size}>
          <FieldLabel>Size {size}</FieldLabel>
          <Input {...args} size={size} />
        </Field>
      ))}
    </div>
  ),
}

/** Invalid adds a red border and a message with an icon, so it never relies on color alone. */
export const Invalid: Story = {
  render: () => (
    <Field invalid className="w-80">
      <FieldLabel>Username</FieldLabel>
      <Input defaultValue="mj" />
      <FieldError>Use at least 3 characters.</FieldError>
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field disabled className="w-80">
      <FieldLabel>Account ID</FieldLabel>
      <Input defaultValue="KEEL-2041" />
      <FieldDescription>Set by your admin.</FieldDescription>
    </Field>
  ),
}

/** Submit it empty, then with a broken address: the error says what to do, and focus moves there. */
export const Validation: Story = {
  render: () => (
    <Form className="w-80" onFormSubmit={() => {}}>
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input type="email" required placeholder="name@example.com" autoComplete="email" />
        <FieldError match="valueMissing">Enter your work email.</FieldError>
        <FieldError match="typeMismatch">Enter an email like name@example.com.</FieldError>
      </Field>
      <Button type="submit" variant="primary" className="self-start">
        Send invite
      </Button>
    </Form>
  ),
}
