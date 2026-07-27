'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, Building2, Download, ExternalLink, FileText, Globe, LayoutGrid, MapPin,
  Phone, Rows3, SearchX, SlidersHorizontal, UserRound, X,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { getEditableDate, getEditablePostImage, hasEditablePostImage, toPlainText } from '@/editable/cards/PostCards'

/*
  Client-side browsing layer for task archives.

  The server still fetches, paginates and category-filters the feed; this only
  refines what is already on the page — a keyword filter, a sort order and a
  grid/list switch. Nothing here touches routing or data logic.
*/

type SortKey = 'newest' | 'oldest' | 'title'
type ViewKey = 'grid' | 'list'

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'title', label: 'A → Z' },
]

const readContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}

const readText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const readField = (post: SitePost, keys: string[]) => {
  const content = readContent(post)
  for (const key of keys) {
    const value = readText(content[key])
    if (value) return value
  }
  return ''
}

const readSummary = (post: SitePost, limit = 160) => {
  const content = readContent(post)
  const raw =
    readText(post.summary) ||
    readText(content.description) ||
    readText(content.excerpt) ||
    readText(content.body)
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

const readCategory = (post: SitePost, fallback: string) =>
  readText(readContent(post).category) || post.tags?.[0] || fallback

const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

const timeOf = (post: SitePost) => {
  const raw = post.publishedAt || post.createdAt || ''
  const time = raw ? new Date(raw).getTime() : Number.NaN
  return Number.isNaN(time) ? 0 : time
}

const cardShell =
  'group block min-w-0 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--tk-accent)] hover:shadow-[0_26px_60px_rgba(18,22,44,0.12)]'

export function EditableTaskExplorer({
  task,
  posts,
  basePath,
  label,
}: {
  task: TaskKey
  posts: SitePost[]
  basePath: string
  label: string
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [view, setView] = useState<ViewKey>('grid')

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = term
      ? posts.filter((post) =>
          [post.title, readSummary(post, 400), readCategory(post, ''), (post.tags || []).join(' ')]
            .some((value) => String(value || '').toLowerCase().includes(term))
        )
      : [...posts]

    return filtered.sort((a, b) => {
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '')
      if (sort === 'oldest') return timeOf(a) - timeOf(b)
      return timeOf(b) - timeOf(a)
    })
  }, [posts, query, sort])

  const gridClass =
    view === 'list'
      ? 'grid gap-4'
      : task === 'image'
      ? 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3'
      : task === 'profile'
      ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : task === 'listing'
      ? 'grid gap-5 xl:grid-cols-2'
      : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'

  return (
    <div>
      {/* Control bar */}
      <div className="flex flex-col gap-4 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4 sm:flex-row sm:items-center sm:gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-bg)] px-4 py-2.5">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Filter these ${label.toLowerCase()}`}
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--tk-text)] outline-none placeholder:text-[var(--tk-muted)]"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear filter" className="shrink-0 text-[var(--tk-muted)] hover:text-[var(--tk-text)]">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <div className="flex items-center gap-2">
          <div className="pm-noscroll flex gap-1 overflow-x-auto rounded-full border border-[var(--tk-line)] p-1">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSort(option.key)}
                aria-pressed={sort === option.key}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition duration-300 ${
                  sort === option.key ? 'bg-[var(--tk-text)] text-[var(--tk-surface)]' : 'text-[var(--tk-muted)] hover:text-[var(--tk-text)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="hidden gap-1 rounded-full border border-[var(--tk-line)] p-1 sm:flex">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={`rounded-full p-2 transition duration-300 ${view === 'grid' ? 'bg-[var(--tk-text)] text-[var(--tk-surface)]' : 'text-[var(--tk-muted)]'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={`rounded-full p-2 transition duration-300 ${view === 'list' ? 'bg-[var(--tk-text)] text-[var(--tk-surface)]' : 'text-[var(--tk-muted)]'}`}
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="pm-mono mt-5 text-[var(--tk-muted)]">
        Showing {visible.length} of {posts.length} {posts.length === 1 ? 'post' : 'posts'}
      </p>

      {visible.length ? (
        <div className={`mt-6 ${gridClass}`}>
          {visible.map((post, index) => (
            <ExplorerCard
              key={post.id || post.slug}
              post={post}
              task={task}
              href={`${basePath}/${post.slug}`}
              index={index}
              view={view}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
          <SearchX className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
          <h3 className="editable-display mt-5 text-xl font-semibold">Nothing matches “{query}”</h3>
          <p className="mt-2 text-sm text-[var(--tk-muted)]">Try a shorter keyword, or clear the filter to see everything again.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)]"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  )
}

/* --------------------------- Per-task card set --------------------------- */

function ExplorerCard({
  post,
  task,
  href,
  index,
  view,
}: {
  post: SitePost
  task: TaskKey
  href: string
  index: number
  view: ViewKey
}) {
  if (view === 'list') return <RowCard post={post} href={href} index={index} />
  if (task === 'image') return <GalleryCard post={post} href={href} index={index} />
  if (task === 'profile') return <PersonCard post={post} href={href} />
  if (task === 'listing') return <DirectoryCard post={post} href={href} />
  if (task === 'classified') return <OfferCard post={post} href={href} />
  if (task === 'pdf') return <DocumentCard post={post} href={href} />
  if (task === 'sbm') return <ResourceCard post={post} href={href} index={index} />
  return <ReadCard post={post} href={href} index={index} />
}

function CardMedia({ post, className = '' }: { post: SitePost; className?: string }) {
  if (!hasEditablePostImage(post)) {
    return (
      <div className={`flex items-center justify-center bg-[var(--tk-raised)] text-[var(--tk-muted)] ${className}`}>
        <FileText className="h-7 w-7" />
      </div>
    )
  }
  return (
    <div className={`overflow-hidden bg-[var(--tk-raised)] ${className}`}>
      <img
        src={getEditablePostImage(post)}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
    </div>
  )
}

/** Shared list row — used whenever the reader switches to list view. */
function RowCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`${cardShell} flex items-center gap-4 p-4 sm:gap-6 sm:p-5`}>
      <span className="pm-mono hidden w-8 shrink-0 text-[var(--tk-muted)] sm:block">{String(index + 1).padStart(2, '0')}</span>
      <CardMedia post={post} className="h-20 w-20 shrink-0 rounded-[0.9rem] sm:h-24 sm:w-32" />
      <span className="min-w-0 flex-1">
        <span className="pm-mono block truncate text-[var(--tk-accent)]">
          {readCategory(post, 'Post')}
          {getEditableDate(post) ? ` · ${getEditableDate(post)}` : ''}
        </span>
        <span className="editable-display mt-1.5 block line-clamp-2 text-[1.05rem] font-semibold leading-snug sm:text-[1.2rem]">{post.title}</span>
        <span className="mt-1.5 hidden line-clamp-1 text-sm text-[var(--tk-muted)] sm:block">{readSummary(post, 130)}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--tk-muted)] transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

/** Article / default: image top, editorial column below. */
function ReadCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`${cardShell} flex flex-col overflow-hidden`}>
      <CardMedia post={post} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-6">
        <span className="pm-mono flex items-center gap-2 text-[var(--tk-accent)]">
          <span className="truncate">{readCategory(post, 'Post')}</span>
          <span className="text-[var(--tk-muted)]">/ {String(index + 1).padStart(2, '0')}</span>
        </span>
        <h2 className="editable-display mt-3 line-clamp-2 text-[1.3rem] font-semibold leading-snug">{post.title}</h2>
        {readSummary(post) ? <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{readSummary(post)}</p> : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]">
          <span className="pm-link">Read this</span>
          <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

/** Image: masonry tile, caption over the artwork. */
function GalleryCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(18,22,44,0.14)]"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-[4/3]' : 'aspect-square'}`}>
        <CardMedia post={post} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(8,10,26,0.85))] opacity-90 transition duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="pm-mono block text-white/60">{readCategory(post, 'Gallery')}</span>
          <h2 className="editable-display mt-1.5 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-white">{post.title}</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Profile: portrait, role, short bio. */
function PersonCard({ post, href }: { post: SitePost; href: string }) {
  const role = readField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardShell} flex flex-col items-center p-7 text-center`}>
      <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {hasEditablePostImage(post) ? (
          <img src={getEditablePostImage(post)} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />
        )}
      </span>
      <h2 className="editable-display mt-5 line-clamp-1 text-[1.15rem] font-semibold">{post.title}</h2>
      {role ? <p className="pm-mono mt-2 line-clamp-1 text-[var(--tk-accent)]">{role}</p> : null}
      {readSummary(post, 110) ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--tk-muted)]">{readSummary(post, 110)}</p> : null}
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]">
        <span className="pm-link">Open profile</span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

/** Listing: logo block plus practical metadata. */
function DirectoryCard({ post, href }: { post: SitePost; href: string }) {
  const location = readField(post, ['location', 'address', 'city'])
  const phone = readField(post, ['phone', 'telephone', 'mobile'])
  const website = readField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardShell} flex items-center gap-5 p-5 sm:p-6`}>
      <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {hasEditablePostImage(post) ? (
          <img src={getEditablePostImage(post)} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Building2 className="h-9 w-9 text-[var(--tk-muted)]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="pm-mono block truncate text-[var(--tk-accent)]">{readCategory(post, 'Listing')}</span>
        <h2 className="editable-display mt-1.5 truncate text-[1.2rem] font-semibold">{post.title}</h2>
        <span className="mt-1.5 block line-clamp-1 text-sm text-[var(--tk-muted)]">{readSummary(post, 120)}</span>
        <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website)}</span> : null}
        </span>
      </span>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

/** Classified: price leads, condition badge, quiet footer. */
function OfferCard({ post, href }: { post: SitePost; href: string }) {
  const price = readField(post, ['price', 'amount', 'budget'])
  const location = readField(post, ['location', 'address', 'city'])
  const condition = readField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardShell} flex flex-col p-6 sm:p-7`}>
      <span className="flex items-start justify-between gap-4">
        <span className="pm-display text-[2rem] font-medium text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="pm-mono rounded-full bg-[var(--tk-accent-soft)] px-3 py-1.5 text-[var(--tk-accent)]">{condition}</span> : null}
      </span>
      <h2 className="editable-display mt-5 line-clamp-2 text-[1.2rem] font-semibold leading-snug">{post.title}</h2>
      {readSummary(post) ? <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{readSummary(post)}</p> : null}
      <span className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">
          {location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

/** PDF: document plate with a download cue. */
function DocumentCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className={`${cardShell} flex flex-col p-6 sm:p-7`}>
      <span className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-6 w-6" />
        </span>
        <span className="pm-mono rounded-full border border-[var(--tk-line)] px-3 py-1.5 text-[var(--tk-muted)]">{readCategory(post, 'Document')}</span>
      </span>
      <h2 className="editable-display mt-6 line-clamp-2 text-[1.2rem] font-semibold leading-snug">{post.title}</h2>
      {readSummary(post) ? <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{readSummary(post)}</p> : null}
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-accent)]">
        Open document <Download className="h-4 w-4" />
      </span>
    </Link>
  )
}

/** Bookmark: compact saved-link entry. */
function ResourceCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = readField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardShell} flex gap-4 p-6`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <ExternalLink className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="pm-mono block text-[var(--tk-muted)]">Saved · {String(index + 1).padStart(2, '0')}</span>
        <h2 className="editable-display mt-1.5 line-clamp-2 text-[1.05rem] font-semibold leading-snug">{post.title}</h2>
        {readSummary(post, 120) ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{readSummary(post, 120)}</p> : null}
        {website ? <p className="pm-mono mt-3 truncate text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </span>
    </Link>
  )
}
