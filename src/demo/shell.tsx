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

/** Which demo page the URL hash points to: #/components, otherwise tokens. */
export function usePage(): Page {
  const read = (): Page => (window.location.hash.startsWith('#/components') ? 'components' : 'tokens')
  const [page, setPage] = useState<Page>(read)
  useEffect(() => {
    const onHash = () => {
      const next = read()
      setPage((prev) => {
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return page
}

export function PageLinks({ current }: { current: Page }) {
  const links: [Page, string, string][] = [
    ['tokens', 'Tokens', '#/'],
    ['components', 'Components', '#/components'],
  ]
  return (
    <nav aria-label="Pages" className="flex gap-1">
      {links.map(([id, label, href]) => (
        <a
          key={id}
          href={href}
          aria-current={current === id ? 'page' : undefined}
          className="rounded-md px-2 py-1 text-label-md text-action-ghost-fg hover:bg-action-ghost-bg-hover aria-[current=page]:bg-selected-bg aria-[current=page]:text-selected-fg aria-[current=page]:underline aria-[current=page]:decoration-selected-indicator aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
