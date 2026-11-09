// Placeholder shell that proves the token build works in both modes.
// Replaced by the tokens demo page on Day 11.
function Sample({ mode }: { mode: 'Light' | 'Dark' }) {
  return (
    <section className="rounded-xl border border-line-subtle bg-surface-page p-6 text-fg-primary">
      <p className="text-caption text-fg-tertiary">{mode}</p>
      <h2 className="mt-1 text-heading-md">Workspace settings</h2>
      <p className="mt-1 text-body-sm text-fg-secondary">
        Control who can see and edit this workspace.{' '}
        <a href="#" className="text-fg-link underline hover:text-fg-link-hover">
          Learn more
        </a>
      </p>
      <div className="mt-4 rounded-lg border border-line-control bg-surface-page px-3 py-2 text-body-sm">
        Acme design team
      </div>
      <div className="mt-3 rounded-r-lg border-l-4 border-selected-indicator bg-selected-bg px-3 py-2 text-label-md text-selected-fg">
        Members
      </div>
      <div className="mt-3 rounded-lg border border-status-success-border bg-status-success-bg px-3 py-2 text-body-sm text-status-success-fg">
        Changes saved
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-action-primary-bg px-4 py-2 text-label-md text-action-primary-fg hover:bg-action-primary-bg-hover">
          Save changes
        </button>
        <button className="rounded-lg border border-action-secondary-border bg-action-secondary-bg px-4 py-2 text-label-md text-action-secondary-fg hover:bg-action-secondary-bg-hover">
          Cancel
        </button>
        <button className="rounded-lg bg-action-danger-bg px-4 py-2 text-label-md text-action-danger-fg hover:bg-action-danger-bg-hover">
          Delete
        </button>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-heading-xl">Keel</h1>
      <p className="mt-2 text-body-md text-fg-secondary">A token-driven design system with AI guardrails, by MJ.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Sample mode="Light" />
        <div className="dark">
          <Sample mode="Dark" />
        </div>
      </div>
    </main>
  )
}
