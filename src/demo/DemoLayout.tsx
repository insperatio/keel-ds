import { Moon, Sun } from 'lucide-react'
import { brand } from '@/brand.generated'
import { AppShell, SidebarNav, type NavSection } from '@/components/ui/app-shell'
import { Button } from '@/components/ui/button'
import { sectionHref, useMode, type Page } from './shell'

/** The demo pages, built on Keel's own AppShell. */
export function DemoLayout({
  page,
  section,
  sidebarTitle,
  sections,
  children,
}: {
  page: Page
  section: string | null
  sidebarTitle: string
  sections: { title?: string; items: [id: string, label: string][] }[]
  children: React.ReactNode
}) {
  const [mode, setMode] = useMode()
  const navSections: NavSection[] = sections.map((s) => ({
    title: s.title,
    items: s.items.map(([id, label]) => ({ label, href: sectionHref(page, id), current: section === id })),
  }))
  return (
    <AppShell
      homeHref="#/"
      topNavLabel="Pages"
      topNav={[
        { label: 'Tokens', href: '#/tokens', current: page === 'tokens' },
        { label: 'Components', href: '#/components', current: page === 'components' },
        { label: 'Example', href: '#/example', current: page === 'example' },
      ]}
      actions={
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={mode === 'dark'}
          iconStart={mode === 'dark' ? <Moon /> : <Sun />}
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        >
          Dark mode
        </Button>
      }
      sidebar={<SidebarNav label={sidebarTitle} sections={navSections} />}
    >
      {children}
      <footer className="mt-16 border-t border-line-subtle pt-8 text-body-sm text-fg-tertiary">
        {brand.name} · a token-driven design system by MJ · Insperatio Designs LLC
      </footer>
    </AppShell>
  )
}
