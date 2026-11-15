import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal, Pencil, Trash2, X } from 'lucide-react'
import { IconButton } from './button'
import { iconControl } from '@/storybook/controls'

/**
 * A square button with an icon and no visible text, for toolbars, table rows and dialog corners.
 * `label` is required, so it can't ship without a name for screen readers. Rules: `docs/rules/icon-button.md`.
 */
const meta = {
  title: 'Components/Icon button',
  component: IconButton,
  args: { label: 'Edit', icon: <Pencil /> },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: iconControl,
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} label="Edit" icon={<Pencil />} />
      <IconButton {...args} variant="secondary" label="Close dialog" icon={<X />} />
      <IconButton {...args} variant="primary" label="More actions" icon={<MoreHorizontal />} />
      <IconButton {...args} variant="danger" label="Delete row" icon={<Trash2 />} />
    </div>
  ),
}

/** Same heights as Button and Input, so a toolbar lines up with no custom sizes. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <IconButton key={size} {...args} size={size} variant="secondary" label={`Edit, size ${size}`} />
      ))}
    </div>
  ),
}

/** In a list, every label names its row: "More actions for Ada Lovelace", never twelve "More actions". */
export const InATableRow: Story = {
  render: () => (
    <ul className="w-80 divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface-raised">
      {['Ada Lovelace', 'Grace Hopper'].map((name) => (
        <li key={name} className="flex items-center justify-between px-4 py-2">
          <span className="text-body-sm">{name}</span>
          <IconButton size="sm" label={`More actions for ${name}`} icon={<MoreHorizontal />} />
        </li>
      ))}
    </ul>
  ),
}

export const Disabled: Story = { args: { variant: 'secondary', disabled: true, label: 'Delete row', icon: <Trash2 /> } }
