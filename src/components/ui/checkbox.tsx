import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group'
import { Fieldset as FieldsetPrimitive } from '@base-ui/react/fieldset'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Keel Checkbox: turn one option on or off, as part of a form that saves on submit.
 * For a setting that applies the moment it changes, use Switch.
 *
 *   <Checkbox name="terms" required>I agree to the terms</Checkbox>
 *   <Checkbox description="Sent once a week.">Product updates</Checkbox>
 *
 * The whole label is clickable, so the target is far larger than the 20px box.
 * The name comes from the label only (aria-labelledby) and the help text is the
 * description, so screen readers don't read the help text twice.
 * Without children it renders the box alone: give it an aria-label or put it in a Field.
 */
type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'className' | 'children'> & {
  className?: string
  /** The label. Say what turning it on means: "Email me about replies". */
  children?: React.ReactNode
  /** Extra help under the label. */
  description?: React.ReactNode
}

const boxClasses = [
  'relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border',
  'border-line-control bg-surface-raised text-action-primary-fg',
  'transition-colors duration-(--keel-duration-fast) ease-standard',
  'hover:border-line-control-hover',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
  // Checked and mixed: filled with the primary action color (3:1 against every surface, checked)
  'data-checked:not-data-disabled:border-action-primary-bg data-checked:not-data-disabled:bg-action-primary-bg',
  'data-indeterminate:not-data-disabled:border-action-primary-bg data-indeterminate:not-data-disabled:bg-action-primary-bg',
  'data-checked:not-data-disabled:hover:border-action-primary-bg-hover data-checked:not-data-disabled:hover:bg-action-primary-bg-hover',
  'data-indeterminate:not-data-disabled:hover:border-action-primary-bg-hover data-indeterminate:not-data-disabled:hover:bg-action-primary-bg-hover',
  'data-invalid:data-unchecked:border-line-danger',
  'data-disabled:cursor-not-allowed data-disabled:border-line-subtle data-disabled:bg-action-disabled-bg data-disabled:text-fg-disabled',
]

function CheckboxBox({ className, ...props }: Omit<CheckboxPrimitive.Root.Props, 'className'> & { className?: string }) {
  return (
    <CheckboxPrimitive.Root data-slot="checkbox" className={cn('group', boxClasses, className)} {...props}>
      <CheckboxPrimitive.Indicator className="flex data-unchecked:hidden">
        <Check aria-hidden="true" strokeWidth={3} className="size-3.5 group-data-indeterminate:hidden" />
        <Minus aria-hidden="true" strokeWidth={3} className="hidden size-3.5 group-data-indeterminate:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

function Checkbox({ className, children, description, disabled, ...props }: CheckboxProps) {
  const labelId = React.useId()
  const descriptionId = React.useId()
  if (!children) return <CheckboxBox disabled={disabled} className={className} {...props} />
  return (
    <label data-slot="checkbox-label" className={cn('flex items-start gap-3', disabled ? 'cursor-not-allowed' : 'cursor-pointer', className)}>
      <CheckboxBox
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        {...props}
      />
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
    </label>
  )
}

/**
 * A labelled set of checkboxes that share one value (an array of the checked values).
 * The legend names the group for screen readers. Add `allValues` and a Checkbox with
 * `parent` to get a "select all" that shows a dash when only some are checked.
 */
type CheckboxGroupProps = Omit<CheckboxGroupPrimitive.Props, 'className'> & {
  className?: string
  legend: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
}

function CheckboxGroup({ legend, description, children, className, ...props }: CheckboxGroupProps) {
  return (
    <FieldsetPrimitive.Root
      data-slot="checkbox-group"
      render={<CheckboxGroupPrimitive {...props} />}
      className={cn('flex flex-col gap-3', className)}
    >
      <FieldsetPrimitive.Legend className="text-label-md text-fg-primary">{legend}</FieldsetPrimitive.Legend>
      {description && <p className="-mt-2 text-body-sm text-fg-secondary">{description}</p>}
      {children}
    </FieldsetPrimitive.Root>
  )
}

export { Checkbox, CheckboxGroup }
export type { CheckboxProps, CheckboxGroupProps }
