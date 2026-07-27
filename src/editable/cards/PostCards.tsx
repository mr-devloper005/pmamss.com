import Link from 'next/link'
import { ArrowUpRight, ImageOff, MoveUpRight, UserRound } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

/* ------------------------------------------------------------------ *
 * Safe post readers — every card renders even when fields are missing
 * ------------------------------------------------------------------ */

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const single = ['image', 'featuredImage', 'thumbnail', 'avatar', 'logo']
    .map((key) => (typeof content[key] === 'string' ? (content[key] as string) : ''))
    .find(Boolean)
  return mediaUrl || contentImage || single || '/placeholder.svg?height=900&width=1400'
}

/** True when the post has no real artwork and the card should fall back to type. */
export function hasEditablePostImage(post?: SitePost | null) {
  const image = getEditablePostImage(post)
  return Boolean(image) && !image.includes('placeholder')
}

// Reduce any content payload — rich HTML, entity-encoded HTML, or already-plain text — to
// a clean plain-text card summary. Card excerpts must never show raw markup regardless of
// what the content API sends. Two tag-strip passes (before + after entity decode) also catch
// entity-encoded markup like &lt;p&gt;.
export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

/** Short, locale-stable date label. Returns '' when there is no usable date. */
export function getEditableDate(post?: SitePost | null) {
  const raw = post?.publishedAt || post?.createdAt || ''
  if (!raw) return ''
  const time = new Date(raw).getTime()
  if (Number.isNaN(time)) return ''
  return new Date(time).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Rough read length from the body text — a quiet piece of editorial furniture. */
export function getEditableReadTime(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const body = toPlainText(
    (typeof content.body === 'string' && content.body) ||
    (typeof content.description === 'string' && content.description) ||
    post?.summary ||
    ''
  )
  if (!body) return ''
  return `${Math.max(1, Math.round(body.split(' ').length / 200))} min read`
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ------------------------------------------------------------------ *
 * Shared micro pieces
 * ------------------------------------------------------------------ */

export function PostKicker({ post, tone = 'ink' }: { post?: SitePost | null; tone?: 'ink' | 'light' }) {
  const date = getEditableDate(post)
  return (
    <span className={`pm-mono flex flex-wrap items-center gap-x-2.5 gap-y-1 ${tone === 'light' ? 'text-white/60' : 'text-[var(--slot4-accent)]'}`}>
      <span className="truncate">{getEditableCategory(post)}</span>
      {date ? (
        <>
          <span className={tone === 'light' ? 'text-white/25' : 'text-[var(--slot4-soft-muted-text)]'}>/</span>
          <span className={tone === 'light' ? 'text-white/45' : 'text-[var(--slot4-soft-muted-text)]'}>{date}</span>
        </>
      ) : null}
    </span>
  )
}

function MediaFallback({ label }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--slot4-media-bg)] text-[var(--slot4-soft-muted-text)]">
      <ImageOff className="h-6 w-6" />
      {label ? <span className="pm-mono">{label}</span> : null}
    </div>
  )
}

function CardImage({ post, className = '' }: { post: SitePost; className?: string }) {
  if (!hasEditablePostImage(post)) return <MediaFallback />
  return (
    <img
      src={getEditablePostImage(post)}
      alt={post.title || ''}
      loading="lazy"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  )
}

/* ------------------------------------------------------------------ *
 * 1. Featured card — full-bleed image, dark scrim, oversized headline
 * ------------------------------------------------------------------ */

export function EditorialFeatureCard({ post, href, label = 'Featured' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`pm-zoom group relative block min-w-0 overflow-hidden rounded-[var(--pm-radius)] ${pal.darkBg} ${dc.motion.lift}`}>
      <div className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-[560px]">
        <CardImage post={post} className="opacity-70 transition duration-700" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,14,30,0.15)_18%,rgba(12,14,30,0.9)_100%)]" />
        <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end p-6 sm:min-h-[500px] sm:p-9 lg:min-h-[560px] lg:p-11">
          <span className="pm-mono pm-marker w-fit text-white/70">{label}</span>
          <h3 className="pm-display mt-5 max-w-3xl text-[1.9rem] text-white sm:text-[2.6rem] lg:text-[3.1rem]">
            {post.title}
          </h3>
          {getEditableExcerpt(post, 170) ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{getEditableExcerpt(post, 170)}</p>
          ) : null}
          <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-500 group-hover:bg-[var(--slot4-accent)] group-hover:text-white">
            Open this post <MoveUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
 * 2. Image-first rail card — tall portrait media, minimal caption
 * ------------------------------------------------------------------ */

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`pm-zoom group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} ${dc.media.ratio} rounded-none`}>
        <CardImage post={post} />
        <span className="pm-mono absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[var(--slot4-page-text)] backdrop-blur">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-5">
        <PostKicker post={post} />
        <h3 className={`editable-display mt-3 line-clamp-2 text-[1.15rem] font-semibold leading-snug ${pal.panelText}`}>{post.title}</h3>
        {getEditableExcerpt(post, 90) ? (
          <p className={`mt-2 line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 90)}</p>
        ) : null}
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
 * 3. Compact index card — numbered, text-only, dense
 * ------------------------------------------------------------------ */

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-start gap-4 border-b border-[var(--editable-border)] py-4 transition duration-300 last:border-b-0 hover:bg-[var(--slot4-panel-bg)]/60"
    >
      <span className="pm-mono mt-1 shrink-0 text-[var(--slot4-soft-muted-text)]">{String(index + 1).padStart(2, '0')}</span>
      <span className="min-w-0 flex-1">
        <span className={`editable-display block line-clamp-2 text-[1.02rem] font-semibold leading-snug ${pal.panelText}`}>{post.title}</span>
        <span className={`mt-1.5 block truncate text-xs ${pal.mutedText}`}>
          {getEditableCategory(post)}
          {getEditableReadTime(post) ? ` · ${getEditableReadTime(post)}` : ''}
        </span>
      </span>
      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)] transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--slot4-accent)]" />
    </Link>
  )
}

/* ------------------------------------------------------------------ *
 * 4. Horizontal card — media left, editorial column right
 * ------------------------------------------------------------------ */

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`pm-zoom group grid min-w-0 gap-5 overflow-hidden ${dc.surface.card} p-4 ${dc.motion.lift} sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-6`}
    >
      <div className={`${dc.media.frame} aspect-[16/11] sm:aspect-auto sm:min-h-[210px]`}>
        <CardImage post={post} />
      </div>
      <div className="min-w-0 sm:py-4 sm:pr-5">
        <PostKicker post={post} />
        <h2 className={`editable-display mt-3 line-clamp-3 text-[1.4rem] font-semibold leading-[1.2] ${pal.panelText} sm:text-[1.7rem]`}>
          {post.title}
        </h2>
        {getEditableExcerpt(post, 190) ? (
          <p className={`mt-3 line-clamp-3 text-sm leading-7 ${pal.mutedText}`}>{getEditableExcerpt(post, 190)}</p>
        ) : null}
        <span className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${pal.panelText}`}>
          <span className="pm-link">Read more</span>
          <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <span className="pm-mono sr-only">{String(index + 1).padStart(2, '0')}</span>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
 * 5. Editorial row — rule-separated list entry with a small thumbnail
 * ------------------------------------------------------------------ */

export function EditorialRowCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className="group grid min-w-0 grid-cols-[minmax(0,1fr)_84px] items-center gap-5 border-t border-[var(--editable-border)] py-6 transition duration-300 hover:border-[var(--slot4-accent)] sm:grid-cols-[64px_minmax(0,1fr)_120px] sm:gap-7"
    >
      <span className="pm-mono hidden text-[var(--slot4-soft-muted-text)] sm:block">{String(index + 1).padStart(2, '0')}</span>
      <span className="min-w-0">
        <PostKicker post={post} />
        <span className={`editable-display mt-2 block line-clamp-2 text-[1.35rem] font-semibold leading-[1.22] ${pal.panelText} sm:text-[1.6rem]`}>
          {post.title}
        </span>
        {getEditableExcerpt(post, 130) ? (
          <span className={`mt-2 block line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 130)}</span>
        ) : null}
      </span>
      <span className="pm-zoom relative aspect-square overflow-hidden rounded-[0.9rem] bg-[var(--slot4-media-bg)] sm:aspect-[4/3]">
        <CardImage post={post} />
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
 * 6. Image-first tile — media dominates, caption overlays on hover
 * ------------------------------------------------------------------ */

export function ImageFirstCard({ post, href, tall = false }: { post: SitePost; href: string; tall?: boolean }) {
  return (
    <Link
      href={href}
      className={`pm-zoom group relative block overflow-hidden rounded-[1.15rem] bg-[var(--slot4-media-bg)] ${dc.motion.lift} ${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
    >
      <CardImage post={post} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(10,12,26,0.85))] opacity-90 transition duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <PostKicker post={post} tone="light" />
        <h3 className="editable-display mt-2 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-white">{post.title}</h3>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
 * 7. Profile card — round portrait, identity-first
 * ------------------------------------------------------------------ */

export function ProfileSpotlightCard({ post, href }: { post: SitePost; href: string }) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const role = ['role', 'designation', 'company', 'location']
    .map((key) => (typeof content[key] === 'string' ? (content[key] as string) : ''))
    .find(Boolean)
  return (
    <Link href={href} className={`group flex min-w-0 flex-col items-center ${dc.surface.card} p-7 text-center ${dc.motion.lift}`}>
      <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
        {hasEditablePostImage(post) ? (
          <img src={getEditablePostImage(post)} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-8 w-8 text-[var(--slot4-soft-muted-text)]" />
        )}
      </span>
      <h3 className={`editable-display mt-5 line-clamp-1 text-[1.1rem] font-semibold ${pal.panelText}`}>{post.title}</h3>
      {role ? <p className="pm-mono mt-1.5 line-clamp-1 text-[var(--slot4-accent)]">{role}</p> : null}
      {getEditableExcerpt(post, 90) ? (
        <p className={`mt-3 line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 90)}</p>
      ) : null}
      <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${pal.accentText}`}>
        <span className="pm-link">View profile</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
