import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Select, SelectGroup, SelectItem, SelectSeparator } from './select'
import { hiddenControl } from '@/storybook/controls'
import { figma } from '@/storybook/figma'

const ROLES = { viewer: 'Viewer', editor: 'Editor', admin: 'Admin', owner: 'Owner' }

/**
 * Pick one of 3 to 15 options. Fewer that all fit: radio buttons. Long or searchable: a combobox.
 * Rules: `docs/rules/select.md`.
 */
const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: figma('select'),
  // Every story renders its own Field and options; these satisfy the required props.
  args: { items: ROLES, children: null },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }, children: hiddenControl },
  render: (args) => (
    <Field className="w-80">
      <FieldLabel>Role</FieldLabel>
      <Select {...args} items={ROLES} placeholder="Choose a role">
        {Object.entries(ROLES).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </Select>
    </Field>
  ),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing chosen yet, so the trigger shows the instruction. */
export const Default: Story = {}

/** With `items`, the trigger shows the label, not the stored value. */
export const WithValue: Story = {
  render: (args) => (
    <Field className="w-80">
      <FieldLabel>Role</FieldLabel>
      <Select {...args} items={ROLES} defaultValue="editor">
        {Object.entries(ROLES).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </Select>
      <FieldDescription>Editors can change content; admins can also manage people.</FieldDescription>
    </Field>
  ),
}

/** Groups earn their line only when they mean something. */
export const Grouped: Story = {
  render: (args) => (
    <Field className="w-80">
      <FieldLabel>Time zone</FieldLabel>
      <Select {...args} defaultValue="et" items={{ et: 'Eastern (ET)', ct: 'Central (CT)', pt: 'Pacific (PT)', gmt: 'London (GMT)', cet: 'Berlin (CET)' }}>
        <SelectGroup label="Americas">
          <SelectItem value="et">Eastern (ET)</SelectItem>
          <SelectItem value="ct">Central (CT)</SelectItem>
          <SelectItem value="pt">Pacific (PT)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup label="Europe">
          <SelectItem value="gmt">London (GMT)</SelectItem>
          <SelectItem value="cet">Berlin (CET)</SelectItem>
        </SelectGroup>
      </Select>
    </Field>
  ),
}

/** A disabled option says why it can't be chosen. */
export const Invalid: Story = {
  render: (args) => (
    <Field invalid className="w-80">
      <FieldLabel>Plan</FieldLabel>
      <Select {...args} items={{ free: 'Free', team: 'Team' }} placeholder="Choose a plan">
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="team">Team</SelectItem>
        <SelectItem value="enterprise" disabled>
          Enterprise (contact sales)
        </SelectItem>
      </Select>
      <FieldError>Choose a plan to continue.</FieldError>
    </Field>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <Field disabled className="w-80">
      <FieldLabel>Region</FieldLabel>
      <Select {...args} defaultValue="us" items={{ us: 'United States' }}>
        <SelectItem value="us">United States</SelectItem>
      </Select>
      <FieldDescription>Can't change after setup.</FieldDescription>
    </Field>
  ),
}
