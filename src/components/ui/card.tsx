import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Keel Card: groups content about one thing, on a raised surface.
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Storage</CardTitle>
 *       <CardDescription>Across all projects</CardDescription>
 *       <CardAction><Badge tone="warning">82% used</Badge></CardAction>
 *     </CardHeader>
 *     <CardContent>...</CardContent>
 *     <CardFooter><Button>Manage</Button></CardFooter>
 *   </Card>
 *
 * - outlined (default): border on surface.raised. Most cards.
 * - elevated: a shadow instead of a border, for cards that float over busy content.
 *
 * Clickable card: give CardTitle an `href`. The title becomes the link and its click
 * area covers the whole card, so screen readers hear one clear link name (the title)
 * instead of the card's entire text. Buttons inside still work on their own.
 * Don't nest cards, and don't wrap a whole card in <a> or <button>.
 */
const cardVariants = cva('relative flex flex-col rounded-xl bg-surface-raised text-fg-primary', {
  variants: {
    variant: {
      outlined: 'border border-line-subtle',
      elevated: 'shadow-md',
    },
    size: {
      sm: 'gap-3 p-4',
      md: 'gap-4 p-6',
    },
  },
  defaultVariants: { variant: 'outlined', size: 'md' },
})

type CardProps = React.ComponentProps<'div'> & VariantProps<typeof cardVariants>

function Card({ className, variant, size, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        cardVariants({ variant, size }),
        // Clickable cards (a CardTitle with href) get a hover border
        'has-data-[slot=card-link]:transition-colors has-data-[slot=card-link]:duration-(--keel-duration-fast) has-data-[slot=card-link]:hover:border-line-control',
        className,
      )}
      {...props}
    />
  )
}

/** Title, description and an optional CardAction on the right. */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1', className)}
      {...props}
    />
  )
}

type CardTitleProps = Omit<React.ComponentProps<'h3'>, 'children'> & {
  children: React.ReactNode
  /** Heading level. Pick the one that fits the page outline; default h3. */
  as?: 'h2' | 'h3' | 'h4'
  /** Makes the whole card a link to this URL. */
  href?: string
}

function CardTitle({ className, as: Heading = 'h3', href, children, ...props }: CardTitleProps) {
  return (
    <Heading data-slot="card-title" className={cn('col-start-1 text-heading-sm text-fg-primary', className)} {...props}>
      {href ? (
        <a
          href={href}
          data-slot="card-link"
          className={cn(
            'outline-none',
            // Stretch the click area over the whole card; the focus ring goes on that area
            'after:absolute after:inset-0 after:rounded-xl',
            'focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-solid focus-visible:after:outline-focus-ring',
          )}
        >
          {children}
        </a>
      ) : (
        children
      )}
    </Heading>
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('col-start-1 text-body-sm text-fg-secondary', className)} {...props} />
}

// In a clickable card, only real controls sit above the card link; everything else
// lets clicks fall through, so clicking anywhere else on the card still opens it.
const aboveCardLink = 'pointer-events-none relative z-10 [&_:is(a,button,input,select,textarea,label,[tabindex])]:pointer-events-auto'

/** Top-right slot in the header: a Badge, or an IconButton for a menu. */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(aboveCardLink, 'col-start-2 row-span-2 row-start-1 self-start', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('text-body-md text-fg-secondary', className)} {...props} />
}

/** Actions or meta at the bottom. Its buttons and links stay clickable inside a clickable card. */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn(aboveCardLink, 'mt-auto flex items-center gap-3', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, cardVariants }
export type { CardProps, CardTitleProps }
