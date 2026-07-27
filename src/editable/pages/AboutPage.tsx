import Link from 'next/link'
import { ArrowRight, MoveUpRight } from 'lucide-react'
import { getVisibleTaskLinks } from '@/editable/content/global.content'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export default function AboutPage() {
  const sections = getVisibleTaskLinks()

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Statement */}
        <section className="pm-stage relative -mt-24 overflow-hidden pt-24 text-white">
          <span className="pm-shard pm-shard--a" />
          <span className="pm-shard pm-shard--c" />
          <span className="pm-grain" />
          <div className="relative z-10 mx-auto w-full max-w-[var(--editable-container)] px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
            <p className="pm-mono pm-marker text-white/60">{pagesContent.about.badge}</p>
            <h1 className="pm-display mt-6 max-w-4xl text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem]">
              {pagesContent.about.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-[1.8] text-white/65">{pagesContent.about.description}</p>
          </div>
        </section>

        {/* Body + principles */}
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
            <article className="min-w-0">
              <p className="pm-mono text-[var(--slot4-soft-muted-text)]">The idea</p>
              <div className="mt-6 space-y-6 text-[1.0625rem] leading-[1.85] text-[var(--slot4-muted-text)]">
                {pagesContent.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-12 border-t border-[var(--editable-border)] pt-10">
                <p className="pm-mono text-[var(--slot4-soft-muted-text)]">What that gives you</p>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {pagesContent.home.intro.sidePoints.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-7 text-[var(--slot4-muted-text)]">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--slot4-accent)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <aside className="min-w-0 space-y-4">
              {pagesContent.about.values.map((value, index) => (
                <div
                  key={value.title}
                  className="rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(18,22,44,0.1)]"
                >
                  <p className="pm-mono text-[var(--slot4-soft-muted-text)]">{String(index + 1).padStart(2, '0')}</p>
                  <h2 className="editable-display mt-3 text-[1.25rem] font-semibold">{value.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                </div>
              ))}
            </aside>
          </div>
        </section>

        {/* Sections index */}
        {sections.length ? (
          <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
            <div className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="pm-display text-[1.8rem] sm:text-[2.3rem]">
                  Where to <span className="pm-strong">start.</span>
                </h2>
                <Link href="/contact" className="group inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="pm-link">Ask a question</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((task) => (
                  <Link
                    key={task.key}
                    href={task.route}
                    className="group flex min-w-0 flex-col justify-between rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 transition duration-500 hover:-translate-y-1.5 hover:border-[var(--slot4-page-text)]"
                  >
                    <div>
                      <h3 className="editable-display text-[1.15rem] font-semibold">{task.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{task.description}</p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)]">
                      <span className="pm-link">Open</span>
                      <MoveUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </EditableSiteShell>
  )
}
