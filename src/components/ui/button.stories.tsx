import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { Button } from './button'
import { iconControl } from '@/storybook/controls'

/**
 * Actions on the current page. One primary per group; everything else is secondary or ghost.
 * The rules, and when to use something else, are in `docs/rules/button.md`.
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Save changes' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    iconStart: iconControl,
    iconEnd: iconControl,
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary' } }

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
    </div>
  ),
}

export const WithIcon: Story = { args: { variant: 'primary', iconStart: <Plus />, children: 'New project' } }
