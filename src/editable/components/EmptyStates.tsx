import Link from 'next/link'
import { ArrowRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing published here yet',
  description = 'Posts appear here automatically once this section has published content.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        'rounded-[var(--pm-radius,1.5rem)] border border-dashed border-current/15 bg-current/[0.03] px-8 py-14 text-center',
        className
      )}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-current/15">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="pm-display mt-6 text-[1.6rem] sm:text-[1.9rem]">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-current/65">{description}</p>
      <Link
        href={actionHref}
        className="group mt-7 inline-flex items-center gap-2 rounded-full border border-current/20 px-6 py-3 text-sm font-semibold transition duration-300 hover:border-current"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'posts', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Published ${taskLabel} will appear here automatically. The layout stays ready even while the feed is empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out — your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
