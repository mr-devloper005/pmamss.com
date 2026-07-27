import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Filter, ImageOff, Search, SearchX } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getEditableDate, toPlainText } from '@/editable/cards/PostCards'
import { getVisibleTaskLinks } from '@/editable/content/global.content'
import { pagesContent } from '@/editable/content/pages.content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  // compactRaw only trims — it does NOT strip HTML — so the raw payload could leak markup
  // into the card summary. Route every candidate through toPlainText so cards stay plain,
  // and fall back to the post body when there's no dedicated summary/description.
  return toPlainText(
    (typeof post.summary === 'string' && post.summary) ||
    compactRaw(content.description) ||
    compactRaw(content.excerpt) ||
    compactRaw(content.body) ||
    '',
  )
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  // Route from the task config (e.g. /profile/<slug>); buildPostUrl can fall
  // back to /posts for tasks missing from the enabled taskViews map, which 404s.
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  // Every fifth result runs wide, so a long list never reads as one flat grid.
  const wide = index % 5 === 0

  return (
    <Link
      href={href}
      className={`pm-zoom group flex min-w-0 flex-col overflow-hidden rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--slot4-page-text)] hover:shadow-[0_26px_60px_rgba(18,22,44,0.12)] ${
        wide ? 'md:col-span-2 md:flex-row' : ''
      }`}
    >
      <div className={`relative shrink-0 overflow-hidden bg-[var(--slot4-media-bg)] ${wide ? 'aspect-[16/10] md:aspect-auto md:w-[46%]' : 'aspect-[16/10]'}`}>
        {image ? (
          <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[var(--slot4-soft-muted-text)]">
            <ImageOff className="h-6 w-6" />
          </span>
        )}
        <span className="pm-mono absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[var(--slot4-page-text)] backdrop-blur">
          {taskLabel}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-6">
        <span className="pm-mono text-[var(--slot4-soft-muted-text)]">
          {getEditableDate(post) || `Result ${String(index + 1).padStart(2, '0')}`}
        </span>
        <h2 className={`editable-display mt-2.5 line-clamp-3 font-semibold leading-snug ${wide ? 'text-[1.5rem] sm:text-[1.9rem]' : 'text-[1.2rem]'}`}>
          {post.title}
        </h2>
        {summary ? <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-page-text)]">
          <span className="pm-link">Open</span>
          <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = getVisibleTaskLinks()

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Search-first masthead */}
        <section className="pm-stage relative -mt-24 overflow-hidden pt-24 text-white">
          <span className="pm-shard pm-shard--a" />
          <span className="pm-shard pm-shard--c" />
          <span className="pm-grain" />
          <div className="relative z-10 mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="pm-mono pm-marker text-white/60">{pagesContent.search.hero.badge}</p>
            <h1 className="pm-display mt-5 max-w-3xl text-[2.3rem] sm:text-[3.2rem] lg:text-[3.8rem]">
              {pagesContent.search.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-[1.8] text-white/65">{pagesContent.search.hero.description}</p>

            <form action="/search" className="mt-9 grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
              <input type="hidden" name="master" value="1" />
              <label className="flex min-w-0 items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 backdrop-blur">
                <Search className="h-4 w-4 shrink-0 text-white/60" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                />
              </label>
              <label className="flex min-w-0 items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 backdrop-blur">
                <Filter className="h-4 w-4 shrink-0 text-white/60" />
                <input
                  name="category"
                  defaultValue={category}
                  placeholder="Category"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                />
              </label>
              <select
                name="task"
                defaultValue={task}
                className="min-w-0 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white outline-none backdrop-blur [&>option]:text-[#15171f]"
              >
                <option value="">All sections</option>
                {enabledTasks.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
              <button className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#141416] transition hover:bg-[var(--slot4-accent-soft)]" type="submit">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-[var(--editable-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="pm-mono text-[var(--slot4-soft-muted-text)]">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
              <h2 className="pm-display mt-3 text-[1.7rem] sm:text-[2.2rem]">
                {query ? <>Results for <span className="pm-strong">“{query}”</span></> : pagesContent.search.resultsTitle}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {enabledTasks.map((item) => (
                <Link
                  key={item.key}
                  href={item.route}
                  className="pm-mono rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2 text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-page-text)] hover:text-[var(--slot4-page-text)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {results.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-[var(--pm-radius)] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-8 py-16 text-center">
              <SearchX className="mx-auto h-7 w-7 text-[var(--slot4-soft-muted-text)]" />
              <h3 className="pm-display mt-5 text-[1.6rem]">Nothing matched that search</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--slot4-muted-text)]">
                Try a shorter keyword, drop the category filter, or open a section directly.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {enabledTasks.slice(0, 3).map((item) => (
                  <Link
                    key={item.key}
                    href={item.route}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--slot4-accent)]"
                  >
                    {item.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
