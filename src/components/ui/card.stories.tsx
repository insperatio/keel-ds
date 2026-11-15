import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'
import { Button } from './button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

/**
 * Everything about one object, on a raised surface. A clickable card gives `CardTitle` an `href`,
 * so there is one link named by the title. Rules: `docs/rules/card.md`.
 */
const meta = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    variant: { control: 'inline-radio', options: ['outlined', 'elevated'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle as="h2">Storage</CardTitle>
        <CardDescription>Across all projects</CardDescription>
        <CardAction>
          <Badge tone="warning">82% used</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>
          <span className="text-heading-lg text-fg-primary">41 GB</span> of 50 GB
        </p>
        <p className="mt-1 text-body-sm text-fg-tertiary">At this rate, full in about 3 weeks.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary" size="sm">
          Upgrade plan
        </Button>
        <Button variant="ghost" size="sm">
          Clean up files
        </Button>
      </CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Elevated swaps the border for a shadow, for cards over busy content. */
export const Elevated: Story = { args: { variant: 'elevated' } }

/** The title is the link, and its click area covers the card. Tab shows the ring around the whole card. */
export const Clickable: Story = {
  render: () => (
    <ul className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
      {[
        { id: 'atlas', name: 'Atlas redesign', desc: 'Marketing site, 14 pages', tone: 'success' as const, label: 'On track' },
        { id: 'harbor', name: 'Harbor app', desc: 'Mobile web checkout', tone: 'warning' as const, label: 'At risk' },
      ].map((p) => (
        <li key={p.id} className="flex">
          <Card className="w-full">
            <CardHeader>
              <CardTitle as="h2" href={`#${p.id}`}>
                {p.name}
              </CardTitle>
              <CardDescription>{p.desc}</CardDescription>
              <CardAction>
                <Badge tone={p.tone}>{p.label}</Badge>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <span className="text-body-sm text-fg-tertiary">Updated 2 hours ago</span>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  ),
}
