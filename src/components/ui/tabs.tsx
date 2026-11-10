import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cn } from '@/lib/utils'

/**
 * Keel Tabs: switch between views of the same thing without leaving the page.
 * Use them for 2 to 7 peer views. Not for steps in order (use a stepper) or for
 * navigating to other pages (use links).
 *
 *   <Tabs defaultValue="overview">
 *     <TabsList label="Project sections">
 *       <Tab value="overview">Overview</Tab>
 *       <Tab value="activity">Activity</Tab>
 *     </TabsList>
 *     <TabsPanel value="overview">...</TabsPanel>
 *     <TabsPanel value="activity">...</TabsPanel>
 *   </Tabs>
 *
 * Keyboard: Tab moves into the list, arrow keys move between tabs, Home and End jump,
 * Tab again moves into the panel. A disabled tab can be reached with the arrows (so people
 * know it exists) but not opened.
 */
function Tabs({ className, ...props }: TabsPrimitive.Root.Props & { className?: string }) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col', className)} {...props} />
}

type TabsListProps = Omit<TabsPrimitive.List.Props, 'className'> & {
  className?: string
  /** What the tabs switch between, read by screen readers ("Project sections"). */
  label: string
}

function TabsList({ className, label, children, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      aria-label={label}
      className={cn('relative flex gap-1 overflow-x-auto border-b border-line-subtle', className)}
      {...props}
    >
      {children}
      {/* The active tab gets a 2px underline in selected.indicator (3:1 checked) as well as
          a colored label, so it never relies on color alone. The label keeps its weight so
          tabs don't shift width when switching. */}
      <TabsPrimitive.Indicator
        className={cn(
          'absolute bottom-0 left-(--active-tab-left) h-0.5 w-(--active-tab-width) rounded-full bg-selected-indicator',
          'transition-[left,width] duration-(--keel-duration-base) ease-standard motion-reduce:transition-none',
        )}
      />
    </TabsPrimitive.List>
  )
}

type TabProps = Omit<TabsPrimitive.Tab.Props, 'className'> & {
  className?: string
  /** Optional count after the label, e.g. open items. Announced as "Activity (12)". */
  count?: number
}

function Tab({ className, children, count, ...props }: TabProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tab"
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-t-md px-3 text-label-md',
        'text-fg-secondary hover:text-fg-primary hover:bg-action-ghost-bg-hover',
        'transition-colors duration-(--keel-duration-fast) ease-standard',
        'data-active:text-selected-fg',
        // Inset ring: the list scrolls sideways, so an outside ring would be clipped
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
        'data-disabled:cursor-not-allowed data-disabled:text-fg-disabled data-disabled:hover:bg-transparent',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <>
          {/* Screen readers hear "Activity (12)"; the pill is for sighted users */}
          <span className="sr-only">({count})</span>
          <span aria-hidden="true" className="rounded-full bg-status-info-bg px-1.5 text-label-sm text-status-info-fg">
            {count}
          </span>
        </>
      )}
    </TabsPrimitive.Tab>
  )
}

/** Panels stay in the page while hidden, so every tab's aria-controls points to a real element. */
function TabsPanel({ className, keepMounted = true, ...props }: TabsPrimitive.Panel.Props & { className?: string }) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      keepMounted={keepMounted}
      className={cn(
        'pt-6 outline-none',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-focus-ring focus-visible:rounded-md',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, Tab, TabsPanel }
export type { TabsListProps, TabProps }
