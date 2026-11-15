import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './switch'
import { textControl } from '@/storybook/controls'

/**
 * A setting that takes effect right away. If the change waits for a Save button, use Checkbox.
 * Label it with the setting ("Dark mode"), not the action ("Turn on dark mode").
 * Rules: `docs/rules/switch.md`.
 */
const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { children: 'Notifications' },
  argTypes: { children: textControl, description: textControl },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const On: Story = { args: { defaultChecked: true } }

export const WithDescription: Story = {
  args: { defaultChecked: true, description: 'A dot on the app icon when something new arrives.' },
}

/** A disabled switch says who can change it. */
export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true, children: 'Share usage data', description: 'Your admin manages this setting.' },
}

/** In a settings list the label leads and the switch sits at the end of each row. */
export const SettingsList: Story = {
  render: () => (
    <div className="w-96 divide-y divide-line-subtle rounded-xl border border-line-subtle bg-surface-raised">
      <Switch defaultChecked description="When someone mentions you or replies." className="p-4">
        Mentions and replies
      </Switch>
      <Switch description="A summary of the week, every Monday." className="p-4">
        Weekly digest
      </Switch>
      <Switch disabled defaultChecked description="Required for account and billing notices." className="p-4">
        Security alerts
      </Switch>
    </div>
  ),
}
