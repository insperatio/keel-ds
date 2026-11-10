import * as React from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { controlVariants, type ControlSize } from './control'

/**
 * Keel Select: pick one option from a short list (about 3 to 15 options).
 * Fewer than 4 options that all fit: consider radio buttons. Long or searchable
 * lists: use a combobox. Put it inside a Field with a FieldLabel.
 *
 *   <Field name="role">
 *     <FieldLabel>Role</FieldLabel>
 *     <Select items={roles} placeholder="Choose a role">
 *       {roles.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
 *     </Select>
 *   </Field>
 */
type SelectProps<Value> = Omit<SelectPrimitive.Root.Props<Value>, 'children'> & {
  children: React.ReactNode
  /** Shown when nothing is chosen. */
  placeholder?: string
  size?: ControlSize
  className?: string
}

function Select<Value>({ children, placeholder, size, className, ...props }: SelectProps<Value>) {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectTrigger size={size} className={className} placeholder={placeholder} />
      <SelectContent>{children}</SelectContent>
    </SelectPrimitive.Root>
  )
}

function SelectTrigger({ size, className, placeholder }: { size?: ControlSize; className?: string; placeholder?: string }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size ?? 'md'}
      className={cn(
        controlVariants({ size }),
        'group flex cursor-default items-center justify-between gap-2 text-left',
        'data-popup-open:border-line-control-hover',
        className,
      )}
    >
      <SelectPrimitive.Value placeholder={placeholder} className="truncate data-placeholder:text-fg-tertiary" />
      <SelectPrimitive.Icon className="flex shrink-0 text-fg-secondary group-data-disabled:text-fg-disabled">
        <ChevronDown aria-hidden="true" className={size === 'sm' ? 'size-4' : 'size-5'} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4} alignItemWithTrigger={false} className="z-50 outline-none">
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-line-subtle bg-surface-overlay p-1 text-fg-primary shadow-lg',
            'origin-(--transform-origin) transition-[opacity,scale] duration-(--keel-duration-fast) ease-enter',
            'data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
            'motion-reduce:transition-none',
            className,
          )}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/** One option. The chosen one gets a check mark, so selection never relies on color alone. */
function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props & { className?: string }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'flex cursor-default items-center gap-2 rounded-md py-2 pr-3 pl-2 text-body-sm outline-none select-none',
        'data-highlighted:bg-action-ghost-bg-hover',
        'data-selected:text-selected-fg',
        'data-disabled:cursor-not-allowed data-disabled:text-fg-disabled',
        className,
      )}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden="true" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <SelectPrimitive.Group>
      <SelectPrimitive.GroupLabel className="px-2 pt-2 pb-1 text-overline uppercase text-fg-tertiary">{label}</SelectPrimitive.GroupLabel>
      {children}
    </SelectPrimitive.Group>
  )
}

function SelectSeparator() {
  return <SelectPrimitive.Separator className="my-1 h-px bg-line-subtle" />
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectSeparator }
export type { SelectProps }
