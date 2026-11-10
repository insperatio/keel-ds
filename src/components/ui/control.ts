import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared look for single-line form controls: Input and the Select trigger.
 * Heights match Button (sm 32, md 40, lg 48) so a control and a button line up in a row.
 * md and lg use 16px text so iOS doesn't zoom in when the control is focused.
 */
export const controlVariants = cva(
  [
    'w-full min-w-0 border bg-surface-raised text-fg-primary',
    'border-line-control hover:border-line-control-hover',
    'transition-colors duration-(--keel-duration-fast) ease-standard',
    // Focus: the same 2px ring as Button. Browsers treat a clicked text field as
    // focus-visible, so the ring shows for mouse and keyboard alike.
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
    // Invalid: red border (3:1 checked). The error text says why; color is never the only cue.
    'data-invalid:border-line-danger aria-invalid:border-line-danger',
    // Disabled: fixed disabled colors, never opacity
    'data-disabled:cursor-not-allowed data-disabled:border-line-subtle data-disabled:bg-action-disabled-bg data-disabled:text-fg-disabled',
    'disabled:cursor-not-allowed disabled:border-line-subtle disabled:bg-action-disabled-bg disabled:text-fg-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 rounded-md px-2.5 text-body-sm',
        md: 'h-10 rounded-lg px-3 text-body-md',
        lg: 'h-12 rounded-lg px-4 text-body-md',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export type ControlSize = NonNullable<VariantProps<typeof controlVariants>['size']>
