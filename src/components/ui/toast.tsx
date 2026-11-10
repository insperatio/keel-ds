import * as React from 'react'
import { Toast as ToastPrimitive } from '@base-ui/react/toast'
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, IconButton } from './button'

/**
 * Keel Toast: a short, temporary message about something that just happened.
 * Wrap the app once in <ToastProvider>, then call useToast() anywhere:
 *
 *   const toast = useToast()
 *   toast.success('Changes saved')
 *   toast.error('Couldn't save', { description: 'Check your connection and try again.' })
 *   toast.info('Project archived', { action: { label: 'Undo', onClick: restore } })
 *
 * Built-in rules (WCAG 2.2.1, 4.1.3):
 * - success and info close after 5 seconds; with an action, after 10. Hovering,
 *   focusing or leaving the window pauses the timer.
 * - error and warning stay until dismissed, so nobody misses them.
 * - error interrupts screen readers; the rest wait for a pause.
 * - F6 moves keyboard focus to the toasts; each toast has its own close button.
 *
 * Don't put the only copy of important information or the only way to do something
 * in a toast: it can be missed. Say what happened in a few words, and how to fix
 * it if something went wrong.
 */
type ToastType = 'success' | 'info' | 'warning' | 'error'

const ICONS: Record<ToastType | 'loading', React.ReactNode> = {
  loading: <Loader2 className="text-fg-secondary motion-safe:animate-spin" />,
  success: <CheckCircle2 className="text-status-success-fg" />,
  info: <Info className="text-status-info-fg" />,
  warning: <AlertTriangle className="text-status-warning-fg" />,
  error: <XCircle className="text-status-danger-fg" />,
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return toasts.map((t) => {
    const type = (t.type ?? 'info') as ToastType | 'loading'
    return (
      <ToastPrimitive.Root
        key={t.id}
        toast={t}
        swipeDirection={['right', 'down']}
        data-slot="toast"
        className={cn(
          'pointer-events-auto relative flex w-full gap-3 rounded-lg border border-line-subtle bg-surface-overlay p-4 pr-12 text-fg-primary shadow-lg',
          'translate-x-(--toast-swipe-movement-x) translate-y-(--toast-swipe-movement-y)',
          'transition-[opacity,translate] duration-(--keel-duration-base) ease-enter data-ending-style:ease-exit',
          'data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:opacity-0',
          'data-swiping:transition-none motion-reduce:transition-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
        )}
      >
        <span aria-hidden="true" className="mt-0.5 flex shrink-0 [&_svg]:size-5">
          {ICONS[type] ?? ICONS.info}
        </span>
        <ToastPrimitive.Content className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastPrimitive.Title render={<div />} className="text-label-md text-fg-primary" />
          <ToastPrimitive.Description className="text-body-sm text-fg-secondary" />
          {t.actionProps && (
            <div className="mt-2">
              <ToastPrimitive.Action render={<Button size="sm" variant="secondary" />} />
            </div>
          )}
        </ToastPrimitive.Content>
        <ToastPrimitive.Close
          render={<IconButton size="sm" label="Dismiss notification" icon={<X />} className="absolute top-3 right-3" />}
        />
      </ToastPrimitive.Root>
    )
  })
}

/** Wrap the app once. Renders the "Notifications" region at the bottom right (bottom on small screens). */
function ToastProvider({ children, limit = 3 }: { children: React.ReactNode; limit?: number }) {
  return (
    <ToastPrimitive.Provider timeout={5000} limit={limit}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          className="pointer-events-none fixed right-4 bottom-4 left-4 z-60 flex flex-col-reverse gap-2 outline-none sm:left-auto sm:w-96"
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

type ToastOptions = {
  description?: React.ReactNode
  /** One action, like Undo or Retry. Keeps the toast up for 10 seconds instead of 5. */
  action?: { label: string; onClick: () => void }
  /** Milliseconds; 0 keeps it until dismissed. Defaults follow the rules above. */
  timeout?: number
}

const DEFAULT_TIMEOUT: Record<ToastType, number> = { success: 5000, info: 5000, warning: 0, error: 0 }

/** Shows toasts. Use the type that matches what happened, not the color you want. */
function useToast() {
  const manager = ToastPrimitive.useToastManager()
  return React.useMemo(() => {
    const show = (type: ToastType) => (title: string, options: ToastOptions = {}) =>
      manager.add({
        type,
        title,
        description: options.description,
        priority: type === 'error' ? 'high' : 'low',
        timeout: options.timeout ?? (options.action && DEFAULT_TIMEOUT[type] ? 10000 : DEFAULT_TIMEOUT[type]),
        actionProps: options.action ? { children: options.action.label, onClick: options.action.onClick } : undefined,
      })
    return {
      success: show('success'),
      info: show('info'),
      warning: show('warning'),
      error: show('error'),
      /**
       * Shows a loading toast while the promise runs, then turns it into success or error.
       *   toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Couldn't save' })
       */
      promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string; description?: { success?: string; error?: string } }) =>
        manager.promise(promise, {
          loading: { title: messages.loading, type: 'loading', description: undefined },
          success: { title: messages.success, type: 'success', description: messages.description?.success, timeout: DEFAULT_TIMEOUT.success },
          error: { title: messages.error, type: 'error', description: messages.description?.error, priority: 'high', timeout: DEFAULT_TIMEOUT.error },
        }),
      close: manager.close,
    }
  }, [manager])
}

export { ToastProvider, useToast }
export type { ToastOptions, ToastType }
