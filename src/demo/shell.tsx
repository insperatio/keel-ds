import { useEffect, useState } from 'react'

export type Mode = 'light' | 'dark'
export type Page = 'tokens' | 'components'

export function useMode(): [Mode, (m: Mode) => void] {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const saved = localStorage.getItem('keel-mode')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    try {
      localStorage.setItem('keel-mode', mode)
    } catch {}
  }, [mode])
  return [mode, setMode]
}

/**
 * Hash routes for the demo: #/ and #/tokens/<section>, #/components and
 * #/components/<section>. Old in-page anchors like #color still open the tokens page.
 */
function parse(hash: string): { page: Page; section: string | null } {
  const m = hash.match(/^#\/(tokens|components)?(?:\/([\w-]+))?/)
  if (m) return { page: (m[1] as Page) ?? 'tokens', section: m[2] ?? null }
  return { page: 'tokens', section: hash.length > 1 ? hash.slice(1) : null }
}

export const sectionHref = (page: Page, id: string) => `#/${page}/${id}`

export function useRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash))
  useEffect(() => {
    const onHash = () => {
      const next = parse(window.location.hash)
      setRoute((prev) => {
        if (prev.page !== next.page && !next.section) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  // Jump to the section and move focus to its heading, so keyboard and screen reader
  // users land where they asked to go (not just the scroll position).
  useEffect(() => {
    if (!route.section) return
    const id = route.section
    requestAnimationFrame(() => {
      const target = document.getElementById(id)
      if (!target) return
      const heading = (target.querySelector('h2') as HTMLElement | null) ?? target
      heading.tabIndex = -1
      target.scrollIntoView()
      heading.focus({ preventScroll: true })
    })
  }, [route])
  return route
}
