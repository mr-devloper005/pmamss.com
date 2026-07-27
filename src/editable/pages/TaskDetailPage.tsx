import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, Bookmark, Building2, CheckCircle2, Download, ExternalLink, FileText,
  Globe2, Mail, MapPin, Phone, Tag, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableGallery, EditableReadingProgress, EditableShareBar } from '@/editable/components/EditableDetailExtras'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

/* ------------------------------ Post readers ----------------------------- */

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return Array.from(new Set([...media, ...images, ...singleImages])).filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const dateOf = (post: SitePost) => {
  const raw = post.publishedAt || post.createdAt || ''
  if (!raw) return ''
  const time = new Date(raw).getTime()
  if (Number.isNaN(time)) return ''
  return new Date(time).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}
const readTimeOf = (post: SitePost) => {
  const words = stripHtml(getBody(post)).split(' ').filter(Boolean).length
  return words > 40 ? `${Math.max(1, Math.round(words / 200))} min read` : ''
}
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

/* ------------------------------- Entry view ------------------------------ */

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <EditableReadingProgress />
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* ------------------------------ Shared parts ----------------------------- */

const shell = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-6 lg:px-8'

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <p className="pm-mono pm-marker text-[var(--tk-accent)]">
      {theme.kicker} — {children}
    </p>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="pm-mono inline-flex items-center gap-2 text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> All {(taskConfig?.label || 'posts').toLowerCase()}
    </Link>
  )
}

function MetaLine({ post, extra, center = false }: { post: SitePost; extra?: string; center?: boolean }) {
  const bits = [dateOf(post), readTimeOf(post), extra, post.authorName || ''].filter(Boolean)
  if (!bits.length) return null
  return (
    <div className={`pm-mono mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[var(--tk-muted)] ${center ? 'justify-center' : ''}`}>
      {bits.map((bit, index) => (
        <span key={`${bit}-${index}`} className="flex items-center gap-3">
          {index > 0 ? <span className="opacity-40">/</span> : null}
          {bit}
        </span>
      ))}
    </div>
  )
}

function Divider() {
  return <div className="my-12 h-px bg-[var(--tk-line)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-[1.75]' : 'text-[1.0625rem] leading-[1.85]'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-9 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.15rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
          <p className="pm-mono flex items-center gap-2 text-[var(--tk-muted)]">
            <Icon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {label}
          </p>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <p className="flex items-center gap-2 p-4 text-sm font-semibold">
        <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}
      </p>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
          <Phone className="h-4 w-4" /> Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
          <Mail className="h-4 w-4" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="pm-mono text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="pm-mono text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="pm-mono text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="pm-mono text-[var(--tk-accent)]">All</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className={`${shell} py-14 sm:py-16`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="pm-mono text-[var(--tk-muted)]">Keep reading</p>
            <h2 className="pm-display mt-3 text-[1.7rem] sm:text-[2.2rem]">
              More <span className="pm-strong">{(taskConfig?.label || 'posts').toLowerCase()}</span>
            </h2>
          </div>
          <Link href={taskConfig?.route || '/'} className="group inline-flex items-center gap-2 text-sm font-semibold">
            <span className="pm-link">View all</span>
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-bg)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--tk-accent)]">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? (
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          ) : (
            <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>
          )}
        </div>
        <div className="p-5">
          <p className="pm-mono truncate text-[var(--tk-accent)]">{categoryOf(post, 'Post')}</p>
          <h3 className="editable-display mt-2 line-clamp-2 text-base font-semibold leading-snug">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? (
        <img src={image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></span>
      )}
      <span className="min-w-0">
        <span className="block line-clamp-2 text-sm font-semibold leading-snug">{post.title}</span>
        <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</span>
      </span>
    </Link>
  )
}

/* --------------------------------- Article -------------------------------- */

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <BackLink task="article" />
        <p className="pm-mono pm-marker mt-10 text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="pm-display mt-5 text-balance text-[2.3rem] sm:text-[3.1rem] lg:text-[3.5rem]">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-[1.75] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        <MetaLine post={post} extra={SITE_CONFIG.name} />
        <div className="mt-7"><EditableShareBar title={post.title} /></div>
        {images[0] ? (
          <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />
        ) : null}
        <BodyContent post={post} />
        {images.length > 1 ? (
          <div className="mt-12">
            <p className="pm-mono text-[var(--tk-muted)]">From this piece</p>
            <div className="mt-4"><EditableGallery images={images.slice(1)} title={post.title} layout="strip" /></div>
          </div>
        ) : null}
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* --------------------------------- Listing -------------------------------- */

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <section className={`${shell} py-14 sm:py-20`}>
        <BackLink task="listing" />
        <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          <article className="min-w-0">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-11 w-11 text-[var(--tk-muted)]" />}
              </span>
              <div className="min-w-0">
                <Kicker task="listing">{categoryOf(post, 'Listing')}</Kicker>
                <h1 className="pm-display mt-4 text-[2.1rem] sm:text-[2.9rem]">{post.title}</h1>
                <MetaLine post={post} />
              </div>
            </div>
            {leadText(post) ? <p className="mt-7 max-w-2xl text-lg leading-[1.75] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <div className="mt-7"><EditableShareBar title={post.title} /></div>
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <Divider />
            <BodyContent post={post} />
            {images.length > 1 ? (
              <div className="mt-12">
                <p className="pm-mono text-[var(--tk-muted)]">Showcase</p>
                <div className="mt-4"><EditableGallery images={images.slice(1)} title={post.title} layout="strip" /></div>
              </div>
            ) : null}
          </article>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
            <ContactAction website={website} phone={phone} email={email} />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

/* ------------------------------- Classified ------------------------------- */

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className={`${shell} grid gap-10 py-14 sm:py-20 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-14`}>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
            <Kicker task="classified">{categoryOf(post, 'Offer')}</Kicker>
            <h1 className="pm-display mt-4 text-[1.6rem] leading-tight">{post.title}</h1>
            <p className="pm-display mt-6 text-[2.6rem] font-medium text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <MetaLine post={post} />
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
                  <Phone className="h-4 w-4" /> Call now
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]">
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
            <div className="mt-6 border-t border-[var(--tk-line)] pt-5"><EditableShareBar title={post.title} /></div>
          </div>
        </aside>
        <article className="min-w-0">
          {images.length ? <EditableGallery images={images} title={post.title} layout="strip" /> : null}
          <BodyContent post={post} />
          <div className="mt-10"><ContactAction website={website} phone={phone} email={email} /></div>
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* --------------------------------- Image ---------------------------------- */

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      {/* Full-bleed lead frame */}
      <section className="border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        <div className={`${shell} py-10 sm:py-14`}>
          <BackLink task="image" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-12">
            <div className="relative overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <img src={gallery[0]} alt="" className="aspect-[16/10] w-full object-cover" />
            </div>
            <div className="min-w-0">
              <Kicker task="image">{categoryOf(post, 'Visual')}</Kicker>
              <h1 className="pm-display mt-4 text-[2.1rem] sm:text-[2.8rem]">{post.title}</h1>
              {leadText(post) ? <p className="mt-5 text-base leading-[1.8] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
              <MetaLine post={post} extra={`${gallery.length} ${gallery.length === 1 ? 'image' : 'images'}`} />
              <div className="mt-6"><EditableShareBar title={post.title} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${shell} py-14 sm:py-16`}>
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12">
          <div className="min-w-0">
            {gallery.length > 1 ? (
              <>
                <p className="pm-mono text-[var(--tk-muted)]">The set</p>
                <div className="mt-5"><EditableGallery images={gallery.slice(1)} title={post.title} /></div>
              </>
            ) : null}
          </div>
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="pm-mono text-[var(--tk-muted)]">Notes</p>
              <BodyContent post={post} compact />
            </div>
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* -------------------------------- Bookmark -------------------------------- */

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <BackLink task="sbm" />
        <span className="mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Bookmark className="h-6 w-6" />
        </span>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="pm-display mt-4 text-[2.2rem] sm:text-[2.9rem]">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-[1.75] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        <MetaLine post={post} />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {website ? (
            <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
              Open resource <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
          <EditableShareBar title={post.title} />
        </div>
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ---------------------------------- PDF ----------------------------------- */

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className={`${shell} py-14 sm:py-20`}>
      <BackLink task="pdf" />
      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <span className="flex h-18 w-18 shrink-0 items-center justify-center rounded-[var(--tk-radius)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
              <FileText className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="pm-display mt-3 text-[1.9rem] sm:text-[2.5rem]">{post.title}</h1>
            </div>
          </div>
          <MetaLine post={post} />
          <div className="mt-6"><EditableShareBar title={post.title} /></div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="pm-mono text-[var(--tk-muted)]">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
                  Download <Download className="h-3.5 w-3.5" />
                </Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-sm font-semibold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
                Download <Download className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

/* -------------------------------- Profile --------------------------------- */

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company'])
  const location = getField(post, ['location', 'city', 'address'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  return (
    <>
      {/* Identity band */}
      <section className="border-b border-[var(--tk-line)] bg-[var(--tk-surface)]">
        <div className={`${shell} py-12 sm:py-16`}>
          <BackLink task="profile" />
          <div className="mt-9 flex flex-col items-start gap-7 sm:flex-row sm:items-center">
            <span className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] sm:h-32 sm:w-32">
              {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
            </span>
            <div className="min-w-0 flex-1">
              <Kicker task="profile">Profile</Kicker>
              <h1 className="pm-display mt-4 text-[2.1rem] sm:text-[2.9rem]">{post.title}</h1>
              {role ? <p className="pm-mono mt-3 text-[var(--tk-accent)]">{role}{location ? ` · ${location}` : ''}</p> : null}
              <MetaLine post={post} />
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <ContactAction website={website} phone={phone} email={email} bare />
                <EditableShareBar title={post.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${shell} py-14 sm:py-16`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <article className="min-w-0">
            <p className="pm-mono text-[var(--tk-muted)]">Background</p>
            <BodyContent post={post} />
            {images.length > 1 ? (
              <div className="mt-12">
                <p className="pm-mono text-[var(--tk-muted)]">Gallery</p>
                <div className="mt-4"><EditableGallery images={images.slice(1)} title={post.title} layout="strip" /></div>
              </div>
            ) : null}
          </article>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <InfoGrid items={[['Role', role, Tag], ['Location', location, MapPin], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <RelatedPanel task="profile" post={post} related={related} />
          </aside>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}
