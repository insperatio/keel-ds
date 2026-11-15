import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from './badge'
import { iconControl } from '@/storybook/controls'
import { figma } from '@/storybook/figma'

/**
 * A short label for status or a count, and never clickable. There is no accent tone on purpose:
 * accent means "you can act on this". The words carry the meaning, not the color.
 * Rules: `docs/rules/badge.md`.
 */
const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: figma('badge'),
  args: { children: 'Active' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'success', 'warning', 'danger'] },
    variant: { control: 'inline-radio', options: ['subtle', 'solid'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    icon: iconControl,
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every tone and variant is contrast-checked at 4.5:1 or better, in both modes. */
export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-3">
      {(['subtle', 'solid'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-2">
          <span className="w-14 text-body-sm text-fg-secondary">{variant}</span>
          {(['neutral', 'success', 'warning', 'danger'] as const).map((tone) => (
            <Badge key={tone} {...args} tone={tone} variant={variant}>
              {tone[0].toUpperCase() + tone.slice(1)}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
}

/** sm (20px) for tables and dense lists, md (24px) beside a heading. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Badge {...args} size="sm" tone="success" icon={<CheckCircle2 />}>
        Passed
      </Badge>
      <Badge {...args} size="md" tone="success" icon={<CheckCircle2 />}>
        Passed
      </Badge>
    </div>
  ),
}

/** The icon is decorative; the words say the state. */
export const InAList: Story = {
  render: () => (
    <ul className="w-96 divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface-raised">
      {[
        { name: 'keel-docs', tone: 'success' as const, label: 'Live', icon: <CheckCircle2 /> },
        { name: 'keel-registry', tone: 'warning' as const, label: 'Slow build', icon: <AlertTriangle /> },
        { name: 'keel-storybook', tone: 'danger' as const, label: 'Failed', icon: <XCircle /> },
        { name: 'keel-site', tone: 'neutral' as const, label: 'Waiting', icon: undefined },
      ].map((row) => (
        <li key={row.name} className="flex items-center justify-between px-4 py-3">
          <span className="text-label-md">{row.name}</span>
          <Badge tone={row.tone} icon={row.icon}>
            {row.label}
          </Badge>
        </li>
      ))}
    </ul>
  ),
}
