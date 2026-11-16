import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import { ToastProvider, useToast } from './toast'
import { figma } from '@/storybook/figma'

/**
 * A short message about something that just happened. Never the only place for important
 * information or an action. Rules: `docs/rules/toast.md`.
 *
 * Success and info close after 5 seconds (10 with an action) and pause on hover or focus;
 * warning and error stay until dismissed.
 */
const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: figma('toast'),
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ToastProvider>

export default meta
type Story = StoryObj<typeof meta>

function Buttons() {
  const toast = useToast()
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast.success('Changes saved')}>Success</Button>
      <Button onClick={() => toast.info('New version available', { description: 'Refresh to get the latest features.' })}>Info</Button>
      <Button onClick={() => toast.warning('Storage almost full', { description: '41 of 50 GB used.' })}>Warning</Button>
      <Button onClick={() => toast.danger('Couldn’t save changes', { description: 'Check your connection and try again.' })}>Error</Button>
    </div>
  )
}

/** One of each type. Watch the timing: the first two close themselves, the last two wait for you. */
export const Types: Story = { render: () => <Buttons />, args: { children: null } }

/** An action keeps the toast up for 10 seconds instead of 5. */
export const WithAnUndo: Story = {
  args: { children: null },
  render: function Undo() {
    const toast = useToast()
    return (
      <Button onClick={() => toast.info('Project archived', { action: { label: 'Undo', onClick: () => toast.success('Project restored') } })}>
        Archive project
      </Button>
    )
  },
}

/** One toast that becomes the result, instead of one before and one after. */
export const Promise_: Story = {
  name: 'Loading, then the result',
  args: { children: null },
  render: function Publishing() {
    const toast = useToast()
    return (
      <Button
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: 'Publishing…',
            success: 'Published',
            danger: 'Couldn’t publish',
          })
        }
      >
        Publish
      </Button>
    )
  },
}
