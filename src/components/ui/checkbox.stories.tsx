import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import { Checkbox, CheckboxGroup } from './checkbox'
import { textControl } from '@/storybook/controls'
import { Field, FieldError } from './field'
import { Form } from './form'

/**
 * On or off, saved when the form is submitted. For a setting that applies the moment it changes,
 * use Switch. Rules: `docs/rules/checkbox.md`.
 */
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { children: 'Email me when someone replies' },
  argTypes: { children: textControl, description: textControl },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Help text sits under the label and is read as the description, not as part of the name. */
export const WithDescription: Story = {
  args: { children: 'Weekly summary', description: 'One email a week, every Monday.' },
}

/** Checked and mixed are a check mark and a dash, so the state is never color alone. */
export const States: Story = {
  render: () => (
    <div className="grid gap-4">
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Mixed</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled, checked
      </Checkbox>
    </div>
  ),
}

/** The legend names the set; the parent box shows a dash while only some are checked. */
export const GroupWithSelectAll: Story = {
  render: function SelectAll() {
    const items = [
      { value: 'mentions', label: 'Mentions' },
      { value: 'replies', label: 'Replies to my comments' },
      { value: 'assigned', label: 'Tasks assigned to me' },
    ]
    const [value, setValue] = useState<string[]>(['mentions'])
    return (
      <CheckboxGroup legend="Email me about" value={value} onValueChange={setValue} allValues={items.map((i) => i.value)}>
        <Checkbox parent>All activity</Checkbox>
        <div className="flex flex-col gap-3 pl-8">
          {items.map((i) => (
            <Checkbox key={i.value} value={i.value}>
              {i.label}
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
    )
  },
}

/** Submit without checking it: the error says what to do, and focus moves to the box. */
export const Required: Story = {
  render: () => (
    <Form className="w-80" onFormSubmit={() => {}}>
      <Field name="terms">
        <Checkbox required>I agree to the terms of service</Checkbox>
        <FieldError match="valueMissing">Agree to the terms to create your account.</FieldError>
      </Field>
      <Button type="submit" variant="primary" className="self-start">
        Create account
      </Button>
    </Form>
  ),
}
