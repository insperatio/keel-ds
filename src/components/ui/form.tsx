import { Form as FormPrimitive } from '@base-ui/react/form'
import { cn } from '@/lib/utils'

/**
 * Keel Form: turns off the browser's validation popups so each Field shows its own
 * FieldError instead. Fields check on submit, then again as the person fixes them.
 * `onFormSubmit` runs only when every field is valid and gets the values by field name.
 *
 *   <Form onFormSubmit={(values) => save(values)}>
 *     <Field name="email">...</Field>
 *     <Button type="submit" variant="primary">Save</Button>
 *   </Form>
 */
function Form({ className, ...props }: FormPrimitive.Props & { className?: string }) {
  return <FormPrimitive data-slot="form" className={cn('flex flex-col gap-4', className)} {...props} />
}

export { Form }
