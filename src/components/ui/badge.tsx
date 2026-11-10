import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Keel Badge: a short, non-interactive label for status or a count.
 *
 * Tones map to the status tokens: neutral, success, warning, danger.
 * There is no accent tone on purpose: the accent color means "you can act on this",
 * and a badge can't be clicked. For something clickable, use a Button.
 *
 * - subtle (default): tinted background with a border. For most status labels.
 * - solid: filled. Use sparingly, for the one thing that needs to stand out.
 *
 * The text must carry the meaning ("Failed", not just a red dot). Status pairs are
 * contrast-checked (4.5:1+) in every mode.
 */
const badgeVariants = cva('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-medium', {
  variants: {
    tone: { neutral: '', success: '', warning: '', danger: '' },
    variant: { subtle: '', solid: 'border-transparent' },
    size: {
      sm: 'h-5 px-2 text-label-sm [&_svg]:size-3',
      md: 'h-6 px-2.5 text-label-md [&_svg]:size-3.5',
    },
  },
  compoundVariants: [
    { variant: 'subtle', tone: 'neutral', class: 'border-status-info-border bg-status-info-bg text-status-info-fg' },
    { variant: 'subtle', tone: 'success', class: 'border-status-success-border bg-status-success-bg text-status-success-fg' },
    { variant: 'subtle', tone: 'warning', class: 'border-status-warning-border bg-status-warning-bg text-status-warning-fg' },
    { variant: 'subtle', tone: 'danger', class: 'border-status-danger-border bg-status-danger-bg text-status-danger-fg' },
    { variant: 'solid', tone: 'neutral', class: 'bg-status-info-solid text-status-info-on-solid' },
    { variant: 'solid', tone: 'success', class: 'bg-status-success-solid text-status-success-on-solid' },
    { variant: 'solid', tone: 'warning', class: 'bg-status-warning-solid text-status-warning-on-solid' },
    { variant: 'solid', tone: 'danger', class: 'bg-status-danger-solid text-status-danger-on-solid' },
  ],
  defaultVariants: { tone: 'neutral', variant: 'subtle', size: 'sm' },
})

type BadgeProps = Omit<React.ComponentProps<'span'>, 'className'> &
  VariantProps<typeof badgeVariants> & {
    className?: string
    /** Optional icon before the text. It's decorative; the text carries the meaning. */
    icon?: React.ReactNode
  }

function Badge({ className, tone, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" data-tone={tone ?? 'neutral'} className={cn(badgeVariants({ tone, variant, size }), className)} {...props}>
      {icon && <span aria-hidden="true" className="flex">{icon}</span>}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
