import { Field as FieldPrimitive } from '@base-ui/react/field'
import { cn } from '@/lib/utils'

/**
 * Keel Field: wraps one form control with its label, help text and error.
 * Base UI wires the ids, so the label, description and error are announced with
 * the control automatically. Every Input and Select goes inside a Field.
 *
 *   <Field name="email" invalid={!!error}>
 *     <FieldLabel>Email</FieldLabel>
 *     <Input type="email" />
 *     <FieldDescription>We only use it for sign-in.</FieldDescription>
 *     <FieldError>{error}</FieldError>
 *   </Field>
 */
function Field({ className, ...props }: FieldPrimitive.Root.Props & { className?: string }) {
  return <FieldPrimitive.Root data-slot="field" className={cn('flex flex-col gap-1.5', className)} {...props} />
}

type FieldLabelProps = FieldPrimitive.Label.Props & {
  className?: string
  /** Adds a quiet "(optional)" after the label. Mark the few optional fields, not the many required ones. */
  optional?: boolean
}

function FieldLabel({ className, optional, children, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn('text-label-md text-fg-primary data-disabled:text-fg-disabled', className)}
      {...props}
    >
      {children}
      {optional && <span className="ml-1 font-normal text-fg-tertiary">(optional)</span>}
    </FieldPrimitive.Label>
  )
}

function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props & { className?: string }) {
  return <FieldPrimitive.Description data-slot="field-description" className={cn('text-body-sm text-fg-secondary', className)} {...props} />
}

/**
 * The error under a field.
 * - App-controlled: `<Field invalid={!!error}><FieldError>{error}</FieldError>`. A message
 *   passed as children always shows, so render it only when there is an error.
 * - Browser checks: `<FieldError match="valueMissing">Enter your email.</FieldError>` shows
 *   only for that check. With no children and no match, it shows the browser's message.
 * Write what to do, not what went wrong: "Enter an email like name@example.com".
 */
function FieldError({ className, children, match, ...props }: FieldPrimitive.Error.Props & { className?: string }) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      match={match ?? (children ? true : undefined)}
      className={cn('flex items-start gap-1.5 text-body-sm text-fg-danger', className)}
      {...props}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-4 shrink-0 fill-current">
        <path d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 8.75a.875.875 0 1 0 0 1.75.875.875 0 0 0 0-1.75ZM8 4.25a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0V5A.75.75 0 0 0 8 4.25Z" />
      </svg>
      <span>{children ?? <FieldPrimitive.Validity>{(v) => v.error}</FieldPrimitive.Validity>}</span>
    </FieldPrimitive.Error>
  )
}

export { Field, FieldLabel, FieldDescription, FieldError }
export type { FieldLabelProps }

