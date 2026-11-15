import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tab, Tabs, TabsList, TabsPanel } from './tabs'
import { figma } from '@/storybook/figma'

/**
 * Switch between 2 to 7 views of one object. Not steps in order, and not links to other pages.
 * Rules: `docs/rules/tabs.md`.
 */
const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: figma('tabs'),
  render: (args) => (
    <Tabs {...args} defaultValue="overview" className="w-full max-w-xl">
      <TabsList label="Project sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity" count={12}>
          Activity
        </Tab>
        <Tab value="members" count={4}>
          Members
        </Tab>
      </TabsList>
      <TabsPanel value="overview">
        <p className="text-body-md text-fg-secondary">The project at a glance: owner, status and the latest release.</p>
      </TabsPanel>
      <TabsPanel value="activity">
        <p className="text-body-md text-fg-secondary">12 events this week, newest first.</p>
      </TabsPanel>
      <TabsPanel value="members">
        <p className="text-body-md text-fg-secondary">4 people can see this project.</p>
      </TabsPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/** The underline slides to the active tab; arrow keys move, Tab goes into the panel. */
export const Default: Story = {}

/** A disabled tab still has a panel, so its `aria-controls` points at something real. */
export const WithDisabledTab: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="overview" className="w-full max-w-xl">
      <TabsList label="Project sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="billing" disabled>
          Billing
        </Tab>
      </TabsList>
      <TabsPanel value="overview">
        <p className="text-body-md text-fg-secondary">The project at a glance.</p>
      </TabsPanel>
      <TabsPanel value="billing">
        <p className="text-body-md text-fg-secondary">Billing is managed by your organization.</p>
      </TabsPanel>
    </Tabs>
  ),
}

/** When tabs don't fit, the row scrolls sideways instead of wrapping. */
export const Overflowing: Story = {
  render: (args) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June']
    return (
      <Tabs {...args} defaultValue="January" className="w-80">
        <TabsList label="Report months">
          {months.map((m) => (
            <Tab key={m} value={m}>
              {m}
            </Tab>
          ))}
        </TabsList>
        {months.map((m) => (
          <TabsPanel key={m} value={m}>
            <p className="text-body-md text-fg-secondary">{m} report.</p>
          </TabsPanel>
        ))}
      </Tabs>
    )
  },
}
