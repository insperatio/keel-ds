import { Input as InputPrimitive } from '@base-ui/react/input'
import { cn } from '@/lib/utils'
import { controlVariants, type ControlSize } from './control'

type InputProps = Omit<InputPrimitive.Props, 'size' | 'className'> & {
  className?: string
  /** sm 32, md 40 (default), lg 48. Match the Button size in the same row. */
  size?: ControlSize
}

/**
 * Keel Input: single-line text entry. Put it inside a Field with a FieldLabel.
 * Placeholder is a format hint ("name@example.com"), never the label.
 */
function Input({ className, size, type = 'text', ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      data-size={size ?? 'md'}
      type={type}
      className={cn(controlVariants({ size }), 'placeholder:text-fg-tertiary', className)}
      {...props}
    />
  )
}

export { Input }
export type { InputProps }
