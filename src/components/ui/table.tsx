import * as React from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Keel Table: rows of records with the same columns. Real <table> markup, so screen
 * readers announce the column header with every cell.
 *
 *   <Table caption="Team members">
 *     <TableHeader>
 *       <TableRow>
 *         <TableHead sort={sort.name} onSort={() => toggle('name')}>Name</TableHead>
 *         <TableHead numeric>Seats</TableHead>
 *       </TableRow>
 *     </TableHeader>
 *     <TableBody>
 *       <TableRow><TableCell>Ada</TableCell><TableCell numeric>3</TableCell></TableRow>
 *     </TableBody>
 *   </Table>
 *
 * - `caption` is required: it names the table. Hide it with `hideCaption` if a heading
 *   above already says the same thing.
 * - Numbers: put `numeric` on the head and cells, so they right-align with even digits.
 * - Wide tables scroll sideways inside their frame, and the frame becomes keyboard
 *   focusable only when it actually scrolls.
 * - For layout, use grid or flex, never a table.
 */
type Density = 'comfortable' | 'compact'
const DensityContext = React.createContext<Density>('comfortable')

type TableProps = Omit<React.ComponentProps<'table'>, 'className'> & {
  className?: string
  /** Names the table for everyone. Required. */
  caption: React.ReactNode
  /** Keep the caption for screen readers only. */
  hideCaption?: boolean
  /** comfortable (default) or compact rows. */
  density?: Density
}

function Table({ className, caption, hideCaption, density = 'comfortable', children, ...props }: TableProps) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const captionId = React.useId()
  const [scrolls, setScrolls] = React.useState(false)

  React.useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [])

  return (
    <DensityContext.Provider value={density}>
      <div
        ref={frameRef}
        data-slot="table-frame"
        // Only a scrolling frame needs to be focusable (so arrow keys can scroll it)
        {...(scrolls ? { role: 'region', 'aria-labelledby': captionId, tabIndex: 0 } : {})}
        className={cn(
          // min-w-0 + max-w-full: inside a flex row, scroll here instead of widening the page
          // relative: keeps absolutely positioned bits (like sr-only header text) inside the scroll area
          'relative w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-line-subtle bg-surface-raised',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
          className,
        )}
      >
        <table data-slot="table" className="w-full border-collapse text-left text-body-sm text-fg-primary" {...props}>
          <caption
            id={captionId}
            className={cn(hideCaption ? 'sr-only' : 'px-4 pt-4 pb-2 text-left text-heading-sm text-fg-primary')}
          >
            {caption}
          </caption>
          {children}
        </table>
      </div>
    </DensityContext.Provider>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('border-b border-line-subtle bg-surface-subtle', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&>tr:last-child]:border-b-0', className)} {...props} />
}

type TableRowProps = React.ComponentProps<'tr'> & {
  /** Highlights the row. Pair it with a checked Checkbox in the row, so selection isn't shown by color alone. */
  selected?: boolean
}

function TableRow({ className, selected, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected || undefined}
      className={cn(
        'border-b border-line-subtle transition-colors duration-(--keel-duration-fast)',
        // Rows inside the body get hover and selection; header rows don't
        'in-data-[slot=table-body]:hover:bg-surface-row-hover',
        'data-selected:bg-selected-bg in-data-[slot=table-body]:data-selected:hover:bg-selected-bg',
        // Tertiary text is too light on the selected tint (4.44:1 in light mode), so inside a
        // selected row it uses the secondary color instead (checked: text.secondary on selected.bg)
        'data-selected:[--keel-text-tertiary:var(--keel-text-secondary)]',
        className,
      )}
      {...props}
    />
  )
}

type Sort = 'ascending' | 'descending' | 'none'

type TableHeadProps = Omit<React.ComponentProps<'th'>, 'className'> & {
  className?: string
  numeric?: boolean
  /** Current sort of this column. With onSort, the header becomes a sort button. */
  sort?: Sort
  onSort?: () => void
}

function TableHead({ className, numeric, sort = 'none', onSort, children, ...props }: TableHeadProps) {
  const density = React.useContext(DensityContext)
  const Icon = sort === 'ascending' ? ArrowUp : sort === 'descending' ? ArrowDown : ArrowUpDown
  return (
    <th
      data-slot="table-head"
      scope="col"
      aria-sort={onSort && sort !== 'none' ? sort : undefined}
      className={cn(
        'px-4 text-label-sm whitespace-nowrap text-fg-secondary',
        density === 'compact' ? 'h-9' : 'h-10',
        numeric && 'text-right',
        className,
      )}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            '-mx-2 inline-flex items-center gap-1 rounded-sm px-2 py-1 hover:bg-action-ghost-bg-hover hover:text-fg-primary',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-solid focus-visible:outline-focus-ring',
            numeric && 'flex-row-reverse',
            sort !== 'none' && 'text-fg-primary',
          )}
        >
          {children}
          <Icon aria-hidden="true" className={cn('size-3.5', sort === 'none' && 'text-fg-tertiary')} />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

type TableCellProps = Omit<React.ComponentProps<'td'>, 'className'> & { className?: string; numeric?: boolean }

function TableCell({ className, numeric, ...props }: TableCellProps) {
  const density = React.useContext(DensityContext)
  return (
    <td
      data-slot="table-cell"
      className={cn('px-4 align-middle', density === 'compact' ? 'py-2' : 'py-3', numeric && 'text-right tabular-nums', className)}
      {...props}
    />
  )
}

/** One full-width row for "no results". Say what to try next, not just "No data". */
function TableEmpty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr data-slot="table-empty">
      <td colSpan={colSpan} className="px-4 py-10 text-center text-body-md text-fg-secondary">
        {children}
      </td>
    </tr>
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty }
export type { TableProps, TableRowProps, TableHeadProps, TableCellProps, Sort }
