import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'

export function EditableArticleArchive({
  posts,
  pagination,
  category = 'all',
  basePath = '/article',
}: {
  posts: SitePost[]
  pagination: SiteFeedPagination
  category?: string
  basePath?: string
}) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) =>
    `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`

  return (
    <main className={dc.shell.page}>
      {/* Masthead */}
      <section className="pm-stage relative overflow-hidden text-white">
        <span className="pm-shard pm-shard--a" />
        <span className="pm-shard pm-shard--c" />
        <span className="pm-grain" />
        <div className={`relative z-10 ${dc.shell.section} py-16 sm:py-20`}>
          <p className="pm-mono pm-marker text-white/60">{voice.eyebrow}</p>
          <h1 className="pm-display mt-5 max-w-4xl text-[2.3rem] sm:text-[3.2rem] lg:text-[3.8rem]">{voice.headline}</h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.8] text-white/65">{voice.description}</p>

          <form action={basePath} className="mt-9 flex max-w-xl flex-col gap-3 sm:flex-row">
            <select
              name="category"
              defaultValue={category || 'all'}
              className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white outline-none backdrop-blur [&>option]:text-[#15171f]"
            >
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
            <button className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#141416] transition hover:bg-[var(--slot4-accent-soft)]">
              Filter
            </button>
          </form>
        </div>
      </section>

      {/* Feed */}
      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        {posts.length ? (
          <div className="grid gap-5">
            {posts.map((post, index) => (
              <ArticleListCard
                key={post.id}
                post={post}
                href={postHref('article', post, basePath)}
                index={index + (page - 1) * (pagination.limit || 24)}
              />
            ))}
          </div>
        ) : (
          <div className={`${dc.surface.soft} px-8 py-16 text-center`}>
            <h2 className="pm-display text-[1.8rem]">No posts in this view</h2>
            <p className={`mx-auto mt-3 max-w-md text-sm leading-7 ${pal.mutedText}`}>
              Try another category, or go back to everything published.
            </p>
            <Link href={basePath} className={`${dc.button.primary} mt-7`}>
              Reset filters
            </Link>
          </div>
        )}

        {posts.length ? (
          <nav className="mt-14 flex flex-wrap items-center justify-center gap-2">
            {pagination.hasPrevPage ? (
              <Link href={pageHref(page - 1)} className={dc.button.secondary}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </Link>
            ) : null}
            <span className="pm-mono rounded-full bg-[var(--slot4-page-text)] px-6 py-3.5 text-white">
              {page} / {pagination.totalPages || 1}
            </span>
            {pagination.hasNextPage ? (
              <Link href={pageHref(page + 1)} className={dc.button.secondary}>
                Next <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Link href="/article" className="pm-mono inline-flex items-center gap-2 text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
          <ChevronLeft className="h-3.5 w-3.5" /> All articles
        </Link>
        <p className="pm-mono pm-marker mt-10 text-[var(--slot4-accent)]">{voice.eyebrow}</p>
        <h1 className="pm-display mt-5 text-[2.3rem] sm:text-[3.1rem]">
          {post?.title || pagesContent.detailPages.article.fallbackTitle}
        </h1>
        <p className={`mt-8 text-[1.0625rem] leading-[1.85] ${pal.mutedText}`}>
          {post?.summary || `Details for ${slug} will render through the editable detail page.`}
        </p>

        <aside className={`mt-12 ${dc.surface.dark} p-7`}>
          <p className="pm-mono text-white/45">Reading note</p>
          <p className="mt-4 text-sm leading-7 text-white/70">{voice.secondaryNote}</p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1a1714] transition hover:bg-[var(--slot4-accent)] hover:text-white"
          >
            Get in touch <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </main>
  )
}
