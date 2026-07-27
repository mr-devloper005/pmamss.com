import { cn } from '@/lib/utils'

type LoadingStateProps = {
  label?: string
  className?: string
}

function PulseBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[1rem] bg-current/[0.08]', className)} />
}

export function PageLoadingState({ label = 'Loading page', className }: LoadingStateProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8', className)}
      aria-live="polite"
      aria-busy="true"
    >
      <p className="pm-mono text-current/45">{label}</p>
      <PulseBlock className="mt-6 h-14 w-3/4 max-w-3xl" />
      <PulseBlock className="mt-4 h-5 w-2/3 max-w-2xl" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-[var(--pm-radius,1.5rem)] border border-current/10 p-4">
            <PulseBlock className="h-44 w-full" />
            <PulseBlock className="mt-5 h-5 w-4/5" />
            <PulseBlock className="mt-3 h-4 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardGridLoadingState({ count = 6, className }: LoadingStateProps & { count?: number }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} aria-live="polite" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-[var(--pm-radius,1.5rem)] border border-current/10 p-4">
          <PulseBlock className="h-40 w-full" />
          <PulseBlock className="mt-5 h-5 w-5/6" />
          <PulseBlock className="mt-3 h-4 w-2/3" />
          <PulseBlock className="mt-6 h-10 w-32 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DetailLoadingState({ label = 'Loading detail', className }: LoadingStateProps) {
  return (
    <div
      className={cn('mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr]', className)}
      aria-live="polite"
      aria-busy="true"
    >
      <PulseBlock className="h-80 w-full rounded-[var(--pm-radius,1.5rem)]" />
      <div>
        <p className="pm-mono text-current/45">{label}</p>
        <PulseBlock className="mt-6 h-14 w-4/5" />
        <PulseBlock className="mt-5 h-4 w-full" />
        <PulseBlock className="mt-3 h-4 w-5/6" />
        <PulseBlock className="mt-3 h-4 w-2/3" />
      </div>
    </div>
  )
}
