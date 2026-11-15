---
component: Table
source: src/components/ui/table.tsx
import: "@/components/ui/table"
exports: [Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty]
variants: []
sizes: []
densities: [comfortable, compact]
defaults: {density: comfortable}
---

# Table

Rows of records with the same columns, for scanning, comparing and sorting.

## Use it when

- Every row has the same fields, and people compare them down a column.
- They need to sort, select or act on rows.

## Use something else when

- Each item is a different shape, or you want a picture per item → [Card](card.md) in a grid.
- It's one record's details → a description list (`<dl>`), not a two-column table.
- You only want the layout → CSS grid or flex. Never a table for layout.
- There are thousands of rows → a table with paging or windowing, plus filters first.

## Import

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table'
```

## Anatomy

| Part | Required | What it's for |
| --- | --- | --- |
| `Table` | yes | The frame; takes the required `caption` |
| `TableHeader` + `TableRow` + `TableHead` | yes | The column headers |
| `TableBody` + `TableRow` + `TableCell` | yes | The data |
| `TableEmpty` | when it can be empty | One row saying what to try next |

## Props that matter

| Prop | Values | Default | Notes |
| --- | --- | --- | --- |
| `caption` | node | — | **Required.** Names the table |
| `hideCaption` | boolean | `false` | Keeps it for screen readers when a heading says the same |
| `density` | `comfortable`, `compact` | `comfortable` | Compact for data-heavy tables |
| `numeric` (head and cell) | boolean | `false` | Right-aligns with even-width digits |
| `sort` + `onSort` (head) | `ascending`, `descending`, `none` | `none` | Makes the header a sort button |
| `selected` (row) | boolean | `false` | Tints the row; pair with a checked checkbox |

## Rules

1. **Every table has a `caption`,** even if `hideCaption` keeps it off screen.
   Why: it's the table's name when someone lists the tables on a page.
2. **Put `numeric` on the header and the cells** for money, counts and durations.
   Why: right-aligned, even-width digits are what makes a column comparable at a glance.
3. **Sorting lives in the header button,** with `sort` set so `aria-sort` is right.
   Why: without it a screen reader can't tell which column the order comes from.
4. **A selected row needs a checked checkbox,** not just the tint.
   Why: the tint alone is color as the only cue.
5. **Label every row checkbox and row action with the row:** "Select Ada Lovelace",
   "More actions for Ada Lovelace".
   Why: twelve buttons called "More actions" are useless by voice or in a list of controls.
6. **Never use a table for layout,** and never nest tables.
   Why: screen readers announce rows and columns that don't mean anything.
7. **Show an empty state that says what to do:** "No members match "zz". Clear the filter."
   Why: a blank body looks broken, and "No data" doesn't help.
8. **Give the table's parent `min-w-0`** in a flex or grid row.
   Why: otherwise the table widens the page instead of scrolling inside its own frame.
9. **Put the most important column first,** since that's the one that survives a narrow screen.
   Why: people read the first column and scroll for the rest.

## Accessibility

Already handled: real `<table>` markup so each cell is announced with its column, `aria-sort` on
sorted headers, the caption, a scrolling frame that becomes a named focusable region only when it
actually scrolls, and gray text that darkens inside a selected row to stay at 4.5:1.

You must still: write the caption, label row controls with the row, and keep layout out of tables.

## Examples

```tsx
// Good: caption, numeric columns, sortable header, row-specific labels
<Table caption="Team members" density="compact">
  <TableHeader>
    <TableRow>
      <TableHead sort={sortOf('name')} onSort={() => toggleSort('name')}>Name</TableHead>
      <TableHead numeric>Seats</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.length === 0 ? (
      <TableEmpty colSpan={2}>No members match “{query}”. Clear the filter to see everyone.</TableEmpty>
    ) : rows.map((m) => (
      <TableRow key={m.id} selected={isSelected(m)}>
        <TableCell>{m.name}</TableCell>
        <TableCell numeric>{m.seats}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

```tsx
// Bad: no caption, numbers left-aligned, selection by tint only, "More" repeated every row
<Table>
  <TableBody>
    <TableRow className="bg-selected-bg">
      <TableCell>{m.name}</TableCell>
      <TableCell>{m.seats}</TableCell>
      <TableCell><IconButton label="More" icon={<MoreHorizontal />} /></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Checked by

- `npm run check:ui` — focus ring, 24px targets, axe (caption, headers, named controls), reflow at 320px.
- `npm run tokens:check` — text on hovered and selected rows, row checkbox borders at 3:1.
