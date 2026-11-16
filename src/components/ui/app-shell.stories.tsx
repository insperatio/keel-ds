import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell, PageHeader, SidebarNav } from './app-shell'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { noFigmaFrame } from '@/storybook/figma'

const NAV = [
  { label: 'Overview', href: '#', current: true },
  { label: 'Members', href: '#' },
  { label: 'Billing', href: '#' },
]

const SECTIONS = [
  { title: 'Workspace', items: [{ label: 'General', href: '#general', current: true }, { label: 'Members', href: '#members' }] },
  { title: 'Account', items: [{ label: 'Profile', href: '#profile' }, { label: 'Notifications', href: '#notifications' }] },
]

const meta = {
  title: 'Components/App shell',
  component: AppShell,
  parameters: {
    ...noFigmaFrame('App shell is the page frame rather than a component placed on a page; the Figma file shows it inside each page mockup.'),
    layout: 'fullscreen',
  },
  argTypes: {
    children: { control: false, table: { disable: true } },
    actions: { control: false },
    sidebar: { control: false },
    logo: { control: false },
    topNav: { control: false },
  },
  args: { topNav: NAV, topNavLabel: 'Pages' },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

const Body = () => (
  <Card>
    <CardHeader>
      <CardTitle as="h2">Storage</CardTitle>
      <CardDescription>Across all projects</CardDescription>
    </CardHeader>
    <CardContent>41 GB of 50 GB used.</CardContent>
  </Card>
)

export const Default: Story = {
  args: { children: null },
  render: (args) => (
    <AppShell {...args}>
      <PageHeader title="Team settings" description="Manage who can access this workspace." />
      <Body />
    </AppShell>
  ),
}

export const WithSidebar: Story = {
  name: 'With a sidebar',
  args: { children: null },
  render: (args) => (
    <AppShell {...args} sidebar={<SidebarNav sections={SECTIONS} label="Settings sections" />}>
      <PageHeader
        overline="Workspace"
        title="General"
        description="Names, defaults and anything that applies to the whole workspace."
        actions={<Button variant="primary">Save changes</Button>}
      />
      <Body />
    </AppShell>
  ),
}
