import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronDown, Search } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { getVisibleTaskLinks } from '@/editable/content/global.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableTaskExplorer } from '@/editable/components/EditableTaskExplorer'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const totalPages = pagination.totalPages || 1
  const label = taskConfig?.label || task
  const categoryLabel =
    category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const otherSections = getVisibleTaskLinks().filter((item) => item.key !== task)

  // A short, readable window of page numbers around the current page.
  const pageWindow = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1
  )

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {/* Masthead */}
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
          <div className="relative mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
            <Link
              href="/"
              className="pm-mono inline-flex items-center gap-2 text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {SITE_CONFIG.name}
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
              <div className="min-w-0">
                <p className="pm-mono pm-marker text-[var(--tk-accent)]">
                  {theme.kicker} — {label}
                </p>
                <h1 className="pm-display mt-5 max-w-3xl text-balance text-[2.4rem] sm:text-[3.2rem] lg:text-[3.9rem]">
                  {voice?.headline || `Browse ${label}`}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-[1.8] text-[var(--tk-muted)]">
                  {voice?.description || theme.note}
                </p>
                {voice?.chips?.length ? (
                  <div className="mt-7 flex flex-wrap gap-2">
                    {voice.chips.map((chip) => (
                      <span
                        key={chip}
                        className="pm-mono rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-2 text-[var(--tk-muted)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Category form — stays URL-driven so paging and SEO keep working */}
              <form
                action={basePath}
                className="min-w-0 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5"
              >
                <p className="pm-mono text-[var(--tk-muted)]">{voice?.filterLabel || 'Filter category'}</p>
                <div className="relative mt-3">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-11 w-full appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-bg)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--tk-accent)] text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
                  Apply
                </button>
                <p className="mt-4 border-t border-[var(--tk-line)] pt-4 text-xs text-[var(--tk-muted)]">
                  Showing <span className="font-semibold text-[var(--tk-text)]">{categoryLabel}</span> · page {page} of {totalPages}
                </p>
              </form>
            </div>
          </div>
        </header>

        {/* Feed */}
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
          {posts.length ? (
            <EditableTaskExplorer task={task} posts={posts} basePath={basePath} label={label} />
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">
                Try another category, or check back once new {label.toLowerCase()} are published.
              </p>
              <Link
                href={basePath}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)]"
              >
                Reset filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {posts.length && totalPages > 1 ? (
            <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
              {pagination.hasPrevPage ? (
                <Link
                  href={pageHref(basePath, category, page - 1)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Link>
              ) : null}

              <span className="flex items-center gap-1">
                {pageWindow.map((item, i) => (
                  <span key={item} className="flex items-center gap-1">
                    {i > 0 && item - pageWindow[i - 1] > 1 ? <span className="px-1 text-[var(--tk-muted)]">…</span> : null}
                    <Link
                      href={pageHref(basePath, category, item)}
                      aria-current={item === page ? 'page' : undefined}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                        item === page
                          ? 'bg-[var(--tk-text)] text-[var(--tk-surface)]'
                          : 'border border-[var(--tk-line)] text-[var(--tk-muted)] hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]'
                      }`}
                    >
                      {item}
                    </Link>
                  </span>
                ))}
              </span>

              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(basePath, category, page + 1)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>

        {/* Cross-section rail */}
        {otherSections.length ? (
          <section className="border-t border-[var(--tk-line)] bg-[var(--tk-surface)]">
            <div className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="pm-mono text-[var(--tk-muted)]">Elsewhere on the site</p>
                  <h2 className="pm-display mt-3 text-[1.6rem] sm:text-[2rem]">
                    Keep <span className="pm-strong">exploring.</span>
                  </h2>
                </div>
                <Link href="/search" className="group inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="pm-link">Search everything</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherSections.map((item) => (
                  <Link
                    key={item.key}
                    href={item.route}
                    className="group flex min-w-0 items-center justify-between gap-4 rounded-[1.1rem] border border-[var(--tk-line)] bg-[var(--tk-bg)] px-5 py-4 transition duration-300 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block line-clamp-1 text-xs text-[var(--tk-muted)]">{item.description}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--tk-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--tk-accent)]" />
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
