import * as React from 'react'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Keel Button.
 *
 * Variants
 * - primary    the one main action in a group (one per group)
 * - secondary  any other action; has a 3:1 border so it reads as a button
 * - ghost      low-emphasis actions in toolbars and dense rows
 * - danger     destroys or removes something; pair it with a confirmation
 *
 * Every color comes from the action.* tokens, so states keep their contrast in
 * both modes and every brand. Never fade a button with opacity.
 */
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none',
    'border border-transparent font-sans',
    'transition-colors duration-(--keel-duration-fast) ease-standard',
    // Focus: a 2px ring in focus.ring, offset so it never touches the fill (3:1 checked)
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
    // Disabled: fixed disabled colors, never opacity. Loading keeps the variant's colors.
    'data-disabled:not-aria-busy:cursor-not-allowed data-disabled:not-aria-busy:border-transparent data-disabled:not-aria-busy:bg-action-disabled-bg data-disabled:not-aria-busy:text-action-disabled-fg',
    'aria-busy:cursor-progress',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-action-primary-bg text-action-primary-fg hover:bg-action-primary-bg-hover active:bg-action-primary-bg-active',
        secondary:
          'border-action-secondary-border bg-action-secondary-bg text-action-secondary-fg hover:bg-action-secondary-bg-hover active:bg-action-secondary-bg-active',
        ghost: 'bg-transparent text-action-ghost-fg hover:bg-action-ghost-bg-hover active:bg-action-ghost-bg-active',
        danger:
          'bg-action-danger-bg text-action-danger-fg hover:bg-action-danger-bg-hover active:bg-action-danger-bg-active',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-label-md [&_svg]:size-4',
        md: 'h-10 rounded-lg px-4 text-label-md [&_svg]:size-4',
        lg: 'h-12 rounded-lg px-5 text-body-md font-medium [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

const iconButtonSizes = { sm: 'w-8 px-0', md: 'w-10 px-0', lg: 'w-12 px-0' } as const

type ButtonVariantProps = VariantProps<typeof buttonVariants>

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="motion-safe:animate-spin">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

type ButtonProps = Omit<ButtonPrimitive.Props, 'className'> &
  ButtonVariantProps & {
    className?: string
    /** Shows a spinner, sets aria-busy and blocks clicks. The button stays focusable. */
    loading?: boolean
    /** Icon before the label. Use a lucide-react icon. */
    iconStart?: React.ReactNode
    /** Icon after the label, e.g. ChevronDown for a menu. */
    iconEnd?: React.ReactNode
  }

function Button({ className, variant, size, loading = false, disabled, iconStart, iconEnd, children, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant ?? 'secondary'}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : iconStart}
      {children}
      {!loading && iconEnd}
    </ButtonPrimitive>
  )
}

type IconButtonProps = Omit<ButtonPrimitive.Props, 'className' | 'children' | 'aria-label'> &
  ButtonVariantProps & {
    className?: string
    /** Required. What the button does, read by screen readers ("Delete row", not "Trash"). */
    label: string
    /** The icon. Use a lucide-react icon; it is hidden from screen readers. */
    icon: React.ReactNode
    loading?: boolean
  }

/**
 * Square button with only an icon. `label` is required so it always has an
 * accessible name. Default variant is ghost, since icon buttons mostly live in toolbars.
 */
function IconButton({ className, variant = 'ghost', size, label, icon, loading = false, disabled, ...props }: IconButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      data-variant={variant}
      aria-label={label}
      className={cn(buttonVariants({ variant, size }), iconButtonSizes[size ?? 'md'], className)}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : <span aria-hidden="true" className="contents">{icon}</span>}
    </ButtonPrimitive>
  )
}

export { Button, IconButton, buttonVariants }
export type { ButtonProps, IconButtonProps }
