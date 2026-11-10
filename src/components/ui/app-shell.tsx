import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Menu, X } from 'lucide-react'
import { brand } from '@/brand.generated'
import { cn } from '@/lib/utils'
import { IconButton } from './button'

/**
 * Keel AppShell: the frame every app page sits in.
 *
 *   <AppShell
 *     topNav={[{ label: 'Projects', href: '/projects', current: true }, ...]}
 *     actions={<Button size="sm">Invite</Button>}
 *     sidebar={<SidebarNav label="Project" sections={[{ items: [...] }]} />}
 *   >
 *     <PageHeader title="Projects" description="..." actions={<Button variant="primary">New project</Button>} />
 *     ...page content...
 *   </AppShell>
 *
 * - A skip link is the first thing Tab reaches; it jumps to the main content.
 * - Header: the brand logo (from the brand file), top-level navigation, then actions.
 * - Sidebar: shown from 1024px up. Below that, the menu button opens it as a drawer
 *   that traps focus, closes with Escape, and closes itself when a link is chosen.
 * - Landmarks: banner, navigation (named), main. One h1 per page, in PageHeader.
 */

/** The brand's logo image if the brand file sets one, otherwise its wordmark. */
function BrandLogo({ className }: { className?: string }) {
  const { src, alt, wordmark } = brand.logo as { src: string | null; alt: string; wordmark: string }
  return src ? (
    <img src={src} alt={alt} className={cn('h-6 w-auto', className)} />
  ) : (
    <span className={cn('text-heading-sm text-fg-primary', className)}>{wordmark}</span>
  )
}

type NavLink = { label: string; href: string; current?: boolean; icon?: React.ReactNode; count?: number }
type NavSection = { title?: string; items: NavLink[] }

// Close the mobile drawer when a nav link is chosen
const DrawerCloseContext = React.createContext<(() => void) | null>(null)

/**
 * Vertical navigation for the sidebar and the mobile drawer. The current page is
 * marked with aria-current, a tint and a bar on the left, never color alone.
 */
function SidebarNav({ label, sections }: { label: string; sections: NavSection[] }) {
  const close = React.useContext(DrawerCloseContext)
  const idBase = React.useId()
  return (
    <nav aria-label={label} className="flex flex-col gap-6 p-3">
      {sections.map((section, i) => (
        <div key={section.title ?? i} className="flex flex-col gap-0.5">
          {/* A label, not a heading: the sidebar comes before the page's h1 */}
          {section.title && (
            <p id={`${idBase}-${i}`} className="px-3 pb-1 text-overline uppercase text-fg-tertiary">
              {section.title}
            </p>
          )}
          <ul aria-labelledby={section.title ? `${idBase}-${i}` : undefined} className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={() => close?.()}
                  className={cn(
                    'relative flex h-9 items-center gap-3 rounded-md px-3 text-label-md text-fg-secondary',
                    'hover:bg-action-ghost-bg-hover hover:text-fg-primary',
                    'aria-[current=page]:bg-selected-bg aria-[current=page]:text-selected-fg',
                    // Bar on the left of the current item (selected.indicator, 3:1 checked)
                    'before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full aria-[current=page]:before:bg-selected-indicator',
                    '[&_svg]:size-4 [&_svg]:shrink-0',
                  )}
                >
                  {item.icon && <span aria-hidden="true">{item.icon}</span>}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.count !== undefined && (
                    <>
                      <span className="sr-only">({item.count})</span>
                      <span aria-hidden="true" className="rounded-full bg-status-info-bg px-1.5 text-label-sm text-status-info-fg">
                        {item.count}
                      </span>
                    </>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

type AppShellProps = {
  children: React.ReactNode
  /** Top-level destinations in the header (2 to 5). Shown in the drawer on small screens. */
  topNav?: NavLink[]
  /** Name of the top navigation for screen readers. */
  topNavLabel?: string
  /** Buttons at the right of the header: search, account, mode switch. */
  actions?: React.ReactNode
  /** Usually a SidebarNav. Omit for pages without a sidebar. */
  sidebar?: React.ReactNode
  /** Replaces the brand logo. */
  logo?: React.ReactNode
  /** Where the logo links to. */
  homeHref?: string
}

function AppShell({ children, topNav = [], topNavLabel = 'Main', actions, sidebar, logo, homeHref = '/' }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const hasDrawer = Boolean(sidebar || topNav.length)

  return (
    <div data-slot="app-shell" className="min-h-dvh bg-surface-page text-fg-primary">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          const main = document.getElementById('main')
          main?.focus()
          main?.scrollIntoView()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface-overlay focus:px-3 focus:py-2 focus:text-label-md focus:shadow-md"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line-subtle bg-surface-page">
        <div className="flex h-14 items-center gap-2 px-4 lg:gap-6 lg:px-6">
          {hasDrawer && (
            <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DialogPrimitive.Trigger render={<IconButton label="Open navigation" icon={<Menu />} className={cn(!sidebar && 'md:hidden', sidebar && 'lg:hidden')} />} />
              <DialogPrimitive.Portal>
                <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-surface-scrim opacity-60 transition-opacity duration-(--keel-duration-base) data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none" />
                <DialogPrimitive.Popup
                  aria-label="Navigation"
                  className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-line-subtle bg-surface-overlay shadow-xl outline-none transition-transform duration-(--keel-duration-base) ease-enter data-starting-style:-translate-x-full data-ending-style:-translate-x-full data-ending-style:ease-exit motion-reduce:transition-none"
                >
                  <div className="flex h-14 shrink-0 items-center justify-between border-b border-line-subtle px-4">
                    {logo ?? <BrandLogo />}
                    <DialogPrimitive.Close render={<IconButton label="Close navigation" icon={<X />} />} />
                  </div>
                  <DrawerCloseContext.Provider value={() => setDrawerOpen(false)}>
                    {topNav.length > 0 && <SidebarNav label={topNavLabel} sections={[{ items: topNav }]} />}
                    {sidebar}
                  </DrawerCloseContext.Provider>
                </DialogPrimitive.Popup>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          )}

          <a href={homeHref} className="flex shrink-0 items-center rounded-md">
            {logo ?? <BrandLogo />}
            <span className="sr-only">, home</span>
          </a>

          {topNav.length > 0 && (
            <nav aria-label={topNavLabel} className="hidden md:block">
              <ul className="flex gap-1">
                {topNav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={item.current ? 'page' : undefined}
                      className={cn(
                        'flex h-9 items-center rounded-md px-3 text-label-md text-fg-secondary hover:bg-action-ghost-bg-hover hover:text-fg-primary',
                        'aria-[current=page]:bg-selected-bg aria-[current=page]:text-selected-fg',
                        'aria-[current=page]:underline aria-[current=page]:decoration-selected-indicator aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4',
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>

      <div className="flex">
        {sidebar && (
          <aside
            data-slot="app-sidebar"
            className="sticky top-14 hidden h-[calc(100dvh-(--spacing(14)))] w-60 shrink-0 overflow-y-auto border-r border-line-subtle bg-surface-subtle lg:block"
          >
            {sidebar}
          </aside>
        )}
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 scroll-mt-14 px-4 pb-16 outline-none md:px-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

type PageHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Small label above the title, e.g. the section the page belongs to. */
  overline?: React.ReactNode
  /** Page-level actions; the primary one goes last. */
  actions?: React.ReactNode
  children?: React.ReactNode
}

/** The page's h1, with an optional description and actions. One per page. */
function PageHeader({ title, description, overline, actions, children }: PageHeaderProps) {
  return (
    <div data-slot="page-header" className="flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between md:py-12">
      <div className="flex max-w-2xl flex-col gap-2">
        {overline && <p className="text-overline uppercase text-fg-tertiary">{overline}</p>}
        <h1 className="text-heading-xl text-fg-primary">{title}</h1>
        {description && <p className="text-body-lg text-fg-secondary">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

export { AppShell, PageHeader, SidebarNav, BrandLogo }
export type { AppShellProps, PageHeaderProps, NavLink, NavSection }
