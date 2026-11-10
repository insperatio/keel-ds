import * as React from 'react'
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'

/**
 * Keel Switch: a setting that takes effect immediately, like a light switch.
 * If the change waits for a Save button, use Checkbox instead.
 *
 *   <Switch defaultChecked description="Show a dot on new messages.">Notifications</Switch>
 *
 * The label sits first and the switch at the end of the row, as in a settings list.
 * Label it with the setting, not the action: "Dark mode", not "Turn on dark mode".
 */
type SwitchProps = Omit<SwitchPrimitive.Root.Props, 'className' | 'children'> & {
  className?: string
  children?: React.ReactNode
  description?: React.ReactNode
}

function SwitchControl({ className, ...props }: Omit<SwitchPrimitive.Root.Props, 'className'> & { className?: string }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // 40 x 24 track. Off uses the control border color, so the track itself reaches 3:1.
        'group relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 border-transparent',
        'bg-line-control transition-colors duration-(--keel-duration-fast) ease-standard',
        'hover:bg-line-control-hover',
        'data-checked:bg-action-primary-bg data-checked:hover:bg-action-primary-bg-hover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
        'data-invalid:data-unchecked:bg-line-danger',
        'data-disabled:cursor-not-allowed data-disabled:border-line-subtle data-disabled:bg-action-disabled-bg',
        'motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          // Position is the main cue; the thumb also changes color when on.
          'block size-5 rounded-full bg-surface-raised shadow-sm',
          'transition-transform duration-(--keel-duration-fast) ease-standard motion-reduce:transition-none',
          'data-checked:translate-x-4 data-checked:bg-action-primary-fg',
          'data-disabled:bg-fg-disabled data-disabled:shadow-none',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

function Switch({ className, children, description, disabled, ...props }: SwitchProps) {
  const labelId = React.useId()
  const descriptionId = React.useId()
  if (!children) return <SwitchControl disabled={disabled} className={className} {...props} />
  return (
    <label
      data-slot="switch-label"
      className={cn('flex items-start justify-between gap-4', disabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}
    >
      <span className="flex flex-col gap-0.5">
        <span id={labelId} className={cn('text-body-md', disabled ? 'text-fg-disabled' : 'text-fg-primary')}>
          {children}
        </span>
        {description && (
          <span id={descriptionId} className={cn('text-body-sm', disabled ? 'text-fg-disabled' : 'text-fg-secondary')}>
            {description}
          </span>
        )}
      </span>
      <SwitchControl
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        {...props}
      />
    </label>
  )
}

export { Switch }
export type { SwitchProps }
