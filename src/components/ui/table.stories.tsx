import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal } from 'lucide-react'
import { Badge } from './badge'
import { IconButton } from './button'
import { Checkbox } from './checkbox'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow, type Sort } from './table'
import { textControl } from '@/storybook/controls'

const MEMBERS = [
  { id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', seats: 12 },
  { id: 'u2', name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', seats: 8 },
  { id: 'u3', name: 'Alan Turing', email: 'alan@example.com', role: 'Editor', seats: 3 },
]

/**
 * Rows with the same columns, for scanning and comparing. Real table markup, so every cell is
 * announced with its column. Never for layout. Rules: `docs/rules/table.md`.
 */
const meta = {
  title: 'Components/Table',
  component: Table,
  args: { caption: 'Team members' },
  argTypes: { density: { control: 'inline-radio', options: ['comfortable', 'compact'] }, caption: textControl },
  render: (args) => (
    <Table {...args} className="w-full max-w-2xl">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead numeric>Seats</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {MEMBERS.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.name}</TableCell>
            <TableCell className="text-fg-secondary">{m.role}</TableCell>
            <TableCell numeric>{m.seats}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Numbers right-align with even-width digits, so a column can be compared at a glance. */
export const Compact: Story = { args: { density: 'compact' } }

/** Sorting lives in a header button: the arrow shows the direction and `aria-sort` carries it. */
export const Sortable: Story = {
  render: function Sortable(args) {
    const [dir, setDir] = useState<Exclude<Sort, 'none'>>('ascending')
    const rows = [...MEMBERS].sort((a, b) => (dir === 'ascending' ? a.seats - b.seats : b.seats - a.seats))
    return (
      <Table {...args} className="w-full max-w-2xl">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead numeric sort={dir} onSort={() => setDir(dir === 'ascending' ? 'descending' : 'ascending')}>
              Seats
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell numeric>{m.seats}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
}

/** A selected row is tinted and its checkbox is checked, so selection is never color alone. */
export const WithSelection: Story = {
  render: function Selectable(args) {
    const [selected, setSelected] = useState<string[]>(['u2'])
    return (
      <Table {...args} className="w-full max-w-2xl">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                aria-label="Select all members"
                checked={selected.length === MEMBERS.length}
                indeterminate={selected.length > 0 && selected.length < MEMBERS.length}
                onCheckedChange={(on) => setSelected(on ? MEMBERS.map((m) => m.id) : [])}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MEMBERS.map((m) => (
            <TableRow key={m.id} selected={selected.includes(m.id)}>
              <TableCell>
                <Checkbox
                  aria-label={`Select ${m.name}`}
                  checked={selected.includes(m.id)}
                  onCheckedChange={(on) => setSelected(on ? [...selected, m.id] : selected.filter((id) => id !== m.id))}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-label-md">{m.name}</span>
                  <span className="text-body-sm text-fg-tertiary">{m.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge tone={m.role === 'Owner' ? 'success' : 'neutral'}>{m.role}</Badge>
              </TableCell>
              <TableCell>
                <IconButton size="sm" label={`More actions for ${m.name}`} icon={<MoreHorizontal />} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
}

/** An empty table says what to try next, never just "No data". */
export const Empty: Story = {
  render: (args) => (
    <Table {...args} className="w-full max-w-2xl">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableEmpty colSpan={2}>No members match “zz”. Clear the filter to see everyone.</TableEmpty>
      </TableBody>
    </Table>
  ),
}
