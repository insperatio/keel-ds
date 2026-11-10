import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, IconButton } from './button'

/**
 * Keel Dialog: a focused task or decision on top of the page. Focus moves into it,
 * stays inside while it's open, and returns to the trigger when it closes. Escape and
 * the close button dismiss it, and so does clicking the backdrop.
 *
 *   <Dialog>
 *     <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Edit profile</DialogTitle>
 *         <DialogDescription>Changes show to your whole team.</DialogDescription>
 *       </DialogHeader>
 *       <DialogBody>...fields...</DialogBody>
 *       <DialogFooter>
 *         <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
 *         <Button variant="primary">Save changes</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Use a dialog when the person must finish or cancel before going on. For a
 * notification, use a Toast; for a lot of content, use a page.
 * For "are you sure?" before something destructive, use AlertDialog.
 */
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const
type DialogSize = keyof typeof sizes

// Backdrop: surface.scrim at 60%. Fades with the popup; no motion if reduced motion is on.
const backdropClasses = cn(
  'fixed inset-0 z-50 bg-surface-scrim opacity-60',
  'transition-opacity duration-(--keel-duration-base) ease-standard motion-reduce:transition-none',
  'data-starting-style:opacity-0 data-ending-style:opacity-0',
)
const viewportClasses = 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4'
const popupClasses = (size: DialogSize) =>
  cn(
    'relative flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-line-subtle bg-surface-overlay text-fg-primary shadow-xl outline-none',
    sizes[size],
    'transition-[opacity,scale] duration-(--keel-duration-base) ease-enter data-ending-style:ease-exit',
    'data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
    'motion-reduce:transition-none',
  )

type DialogContentProps = Omit<DialogPrimitive.Popup.Props, 'className'> & {
  className?: string
  /** sm 384, md 512 (default), lg 672 px wide. Full width minus 16px on small screens. */
  size?: DialogSize
  /** Close button in the corner. Keep it unless the footer already has Cancel. */
  showClose?: boolean
}

function DialogContent({ className, size = 'md', showClose = true, children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop data-slot="dialog-backdrop" className={backdropClasses} />
      <DialogPrimitive.Viewport className={viewportClasses}>
        <DialogPrimitive.Popup data-slot="dialog-content" className={cn(popupClasses(size), className)} {...props}>
          {children}
          {showClose && (
            <DialogPrimitive.Close
              render={<IconButton size="sm" label="Close dialog" icon={<X />} className="absolute top-4 right-4" />}
            />
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  )
}

/** Title and description. Leaves room for the close button. */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-1.5 px-6 pt-6 pr-14', className)} {...props} />
}

/** Every dialog needs a title: it names the dialog for screen readers. */
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props & { className?: string }) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn('text-heading-md text-fg-primary', className)} {...props} />
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props & { className?: string }) {
  return (
    <DialogPrimitive.Description data-slot="dialog-description" className={cn('text-body-md text-fg-secondary', className)} {...props} />
  )
}

/** The content. Scrolls on its own when the dialog is taller than the screen; header and footer stay put. */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-body" className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-4 text-body-md', className)} {...props} />
}

/** Actions, right-aligned. Primary last; Cancel before it. Stacks on narrow screens. */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-3 border-t border-line-subtle px-6 py-4 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

/**
 * AlertDialog: "are you sure?" before something that's hard to undo.
 * - It can't be dismissed by clicking outside; the person has to choose.
 * - Focus starts on Cancel (the safe choice), never on the destructive button.
 * - Name the action in the button ("Delete project"), not "OK" or "Yes".
 *
 *   <AlertDialog>
 *     <AlertDialogTrigger render={<Button variant="danger" />}>Delete project</AlertDialogTrigger>
 *     <AlertDialogContent>
 *       <DialogHeader>
 *         <AlertDialogTitle>Delete “Atlas”?</AlertDialogTitle>
 *         <AlertDialogDescription>Its 14 pages and history are removed for everyone.</AlertDialogDescription>
 *       </DialogHeader>
 *       <DialogFooter>
 *         <AlertDialogCancel>Cancel</AlertDialogCancel>
 *         <Button variant="danger" onClick={remove}>Delete project</Button>
 *       </DialogFooter>
 *     </AlertDialogContent>
 *   </AlertDialog>
 */
const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogClose = AlertDialogPrimitive.Close

type AlertDialogContentProps = Omit<AlertDialogPrimitive.Popup.Props, 'className'> & { className?: string; size?: DialogSize }

function AlertDialogContent({ className, size = 'sm', children, ...props }: AlertDialogContentProps) {
  const popupRef = React.useRef<HTMLDivElement>(null)
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop data-slot="alert-dialog-backdrop" className={backdropClasses} />
      <AlertDialogPrimitive.Viewport className={viewportClasses}>
        <AlertDialogPrimitive.Popup
          ref={popupRef}
          data-slot="alert-dialog-content"
          // Start on the safe choice: the AlertDialogCancel button
          initialFocus={() => popupRef.current?.querySelector<HTMLElement>('[data-slot=alert-dialog-cancel]') ?? true}
          className={cn(popupClasses(size), className)}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  )
}

const AlertDialogTitle = DialogTitle
const AlertDialogDescription = DialogDescription

/** The safe way out (a secondary Button that closes the alert). Receives focus when the alert opens. */
function AlertDialogCancel({ children = 'Cancel', className }: { children?: React.ReactNode; className?: string }) {
  return (
    <AlertDialogPrimitive.Close data-slot="alert-dialog-cancel" render={<Button variant="secondary" className={className} />}>
      {children}
    </AlertDialogPrimitive.Close>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
}
export type { DialogContentProps, AlertDialogContentProps, DialogSize }
