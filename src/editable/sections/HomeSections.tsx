import Link from 'next/link'
import {
  ArrowRight, Bookmark, Building2, FileText, Image as ImageIcon, Layers, LibraryBig,
  Megaphone, MoveUpRight, Search, Sparkles, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { getVisibleTaskLinks } from '@/editable/content/global.content'
import { pagesContent } from '@/editable/content/pages.content'
import {
  ArticleListCard, EditorialFeatureCard, EditorialRowCard, CompactIndexCard, ImageFirstCard,
  RailPostCard, getEditableCategory, getEditableDate, getEditablePostImage, hasEditablePostImage,
  postHref, toPlainText,
} from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'
import { EditableAreaSwitcher, EditableStatCounter, type AreaPanel } from '@/editable/sections/HomeInteractive'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-6 lg:px-8'

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: LibraryBig,
  profile: UserRound,
}

const taskBlurb: Record<TaskKey, string> = {
  article: 'Long-form writing, explainers and reference pieces kept in one readable stream.',
  listing: 'Organisations and services described consistently, so they can be compared at a glance.',
  classified: 'Time-sensitive offers and openings, written to be acted on quickly.',
  image: 'A visual index where the picture leads and the caption stays out of the way.',
  sbm: 'Saved references grouped into shelves that stay easy to search later.',
  pdf: 'Reports, guides and documents ready to open or download.',
  profile: 'The people and organisations behind the work, with the context that matters.',
}

function taskLabel(task: TaskKey) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || task
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
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

// Merge the primary feed with the time-window feeds so home always has content,
// even when one source comes back empty for this site.
function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function pool({ posts, timeSections }: HomeSectionProps) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

// Latest posts' real artwork (newest first, deduped, placeholders dropped).
function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    if (!hasEditablePostImage(post)) continue
    const img = getEditablePostImage(post)
    if (seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

function topicList(posts: SitePost[], max = 14) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    for (const value of [getEditableCategory(post), ...(post.tags || [])]) {
      const clean = typeof value === 'string' ? value.trim() : ''
      if (!clean || clean.length > 26) continue
      const key = clean.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(clean)
      if (out.length >= max) return out
    }
  }
  return out
}

/* -------------------------- Section furniture -------------------------- */

function SectionHead({
  eyebrow,
  title,
  strong,
  description,
  href,
  linkLabel = 'See all',
  center = false,
  tone = 'ink',
}: {
  eyebrow: string
  title: string
  strong?: string
  description?: string
  href?: string
  linkLabel?: string
  center?: boolean
  tone?: 'ink' | 'light'
}) {
  const light = tone === 'light'
  return (
    <div className={`flex flex-col gap-5 ${center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={center ? 'max-w-3xl' : 'max-w-2xl'}>
        <p className={`pm-mono pm-marker ${light ? 'text-white/55' : 'text-[var(--slot4-accent)]'}`}>{eyebrow}</p>
        <h2 className={`pm-display mt-4 text-[2rem] sm:text-[2.6rem] lg:text-[3rem] ${light ? 'text-white' : 'text-[var(--slot4-page-text)]'}`}>
          {title} {strong ? <span className="pm-strong">{strong}</span> : null}
        </h2>
        {description ? (
          <p className={`mt-4 text-base leading-[1.75] ${light ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'} ${center ? 'mx-auto max-w-2xl' : ''}`}>
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className={`group inline-flex shrink-0 items-center gap-2 text-sm font-semibold ${light ? 'text-white' : 'text-[var(--slot4-page-text)]'}`}
        >
          <span className="pm-link">{linkLabel}</span>
          <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  )
}

/* -------------------------------- Hero --------------------------------- */

export function EditableHomeHero(props: HomeSectionProps) {
  const { primaryTask, primaryRoute } = props
  const all = pool(props)
  const heroImages = latestPostImages(all)
  const topics = topicList(all)
  const heroTitle = pagesContent.home.hero.title
  const [titleLead, titleStrong] = Array.isArray(heroTitle)
    ? [heroTitle[0], heroTitle.slice(1).join(' ')]
    : [String(heroTitle || ''), '']
  const primaryCta = pagesContent.home.hero.primaryCta
  const secondaryCta = pagesContent.home.hero.secondaryCta

  return (
    <section>
      {/* Faceted masthead — pulled up behind the floating navbar */}
      <div className="pm-stage relative -mt-24 overflow-hidden pt-24 text-white">
        <span className="pm-shard pm-shard--a" />
        <span className="pm-shard pm-shard--b" />
        <span className="pm-shard pm-shard--c" />
        <span className="pm-shard pm-shard--d" />
        <span className="pm-grain" />

        <div className={`relative z-10 ${container} pb-16 pt-16 text-center sm:pb-20 sm:pt-24 lg:pb-24 lg:pt-28`}>
          <p className="pm-mono pm-rise pm-rise-1 text-white/65">{pagesContent.home.hero.badge || SITE_CONFIG.name}</p>

          <h1 className="pm-display pm-rise pm-rise-2 mx-auto mt-7 max-w-4xl text-balance text-[2.6rem] leading-[1.02] sm:text-[3.6rem] lg:text-[4.5rem]">
            {titleLead} {titleStrong ? <span className="pm-strong">{titleStrong}</span> : null}
          </h1>

          <p className="pm-rise pm-rise-3 mx-auto mt-7 max-w-2xl text-base leading-[1.8] text-white/70 sm:text-lg">
            {pagesContent.home.hero.description}
          </p>

          <div className="pm-rise pm-rise-3 mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primaryCta?.href || primaryRoute}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur transition duration-300 hover:bg-white/25"
            >
              {primaryCta?.label || `Browse ${taskLabel(primaryTask).toLowerCase()}`}
            </Link>
            <Link
              href={secondaryCta?.href || '/contact'}
              className="inline-flex items-center gap-2 rounded-full bg-[#141416] px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-black"
            >
              {secondaryCta?.label || 'Get in touch'} <MoveUpRight className="h-4 w-4" />
            </Link>
          </div>

          <form
            action="/search"
            className="pm-rise pm-rise-4 mx-auto mt-10 flex w-full max-w-xl items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 pl-5 backdrop-blur-xl"
          >
            <Search className="h-4 w-4 shrink-0 text-white/60" />
            <input
              name="q"
              placeholder={pagesContent.home.hero.searchPlaceholder || 'Search everything'}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/45"
            />
            <button className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#141416] transition hover:bg-[var(--slot4-accent-soft)]">
              Search
            </button>
          </form>

          {heroImages.length ? (
            <div className="pm-rise pm-rise-4 mx-auto mt-14 max-w-4xl">
              <p className="pm-mono mb-4 text-white/45">{pagesContent.home.hero.featureCardBadge || 'Latest covers'}</p>
              <EditableHeroCollage images={heroImages} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Topics in circulation — marquee band */}
      {topics.length ? (
        <div className="border-b border-[var(--editable-border)] bg-[var(--slot4-page-bg)] py-10">
          <p className="pm-mono mb-6 text-center text-[var(--slot4-soft-muted-text)]">In circulation right now</p>
          <div className="pm-marquee">
            <div className="pm-marquee__track">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center">
                  {topics.map((topic) => (
                    <span
                      key={`${copy}-${topic}`}
                      className="editable-display whitespace-nowrap px-8 text-[1.05rem] font-medium uppercase tracking-[0.06em] text-[var(--slot4-soft-muted-text)] sm:px-11 sm:text-[1.3rem]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

/* --------------------- Statement + all-in-one panels -------------------- */

export function EditableStoryRail(props: HomeSectionProps) {
  const { primaryTask, primaryRoute } = props
  const all = pool(props)
  const featured = all[0]
  const secondary = all.slice(1, 4)
  const categories = getVisibleTaskLinks()
  const withImages = all.filter(hasEditablePostImage).length

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-16 sm:py-20 lg:py-24`}>
        <h2 className="pm-display mx-auto max-w-4xl text-center text-[2.1rem] leading-[1.08] sm:text-[3rem] lg:text-[3.5rem]">
          {pagesContent.home.intro.title}
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-7">
          {/* Left: statement card */}
          <div className="flex flex-col justify-between rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 sm:p-10">
            <div>
              <p className="pm-mono pm-marker text-[var(--slot4-accent)]">{pagesContent.home.intro.badge}</p>
              <h3 className="pm-display mt-5 max-w-md text-[1.8rem] sm:text-[2.3rem]">
                Everything in <span className="pm-strong">one place.</span>
              </h3>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--slot4-muted-text)] sm:text-[15px]">
                {pagesContent.home.intro.paragraphs.slice(0, 2).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-4 border-t border-[var(--editable-border)] pt-8">
              <EditableStatCounter value={all.length} suffix="+" label="Posts live" />
              <EditableStatCounter value={categories.length} label="Sections" />
              <EditableStatCounter value={withImages} suffix="+" label="With visuals" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={pagesContent.home.intro.primaryLink?.href || primaryRoute}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[var(--slot4-accent)]"
              >
                {pagesContent.home.intro.primaryLink?.label || 'Start browsing'} <MoveUpRight className="h-4 w-4" />
              </Link>
              <Link
                href={pagesContent.home.intro.secondaryLink?.href || '/about'}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-3 text-sm font-semibold transition duration-300 hover:border-[var(--slot4-page-text)]"
              >
                {pagesContent.home.intro.secondaryLink?.label || 'How it works'}
              </Link>
            </div>
          </div>

          {/* Right: live feature */}
          {featured ? (
            <EditorialFeatureCard
              post={featured}
              href={postHref(primaryTask, featured, primaryRoute)}
              label={pagesContent.home.hero.focusLabel || 'In focus'}
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-[var(--pm-radius)] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-10 text-center">
              <p className="text-sm text-[var(--slot4-muted-text)]">New posts will feature here as soon as they are published.</p>
            </div>
          )}
        </div>

        {/* Secondary picks */}
        {secondary.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:mt-7 lg:grid-cols-3">
            {secondary.map((post, index) => (
              <ImageFirstCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} tall={index === 1} />
            ))}
          </div>
        ) : null}

        {/* Section index */}
        {categories.length ? (
          <div className="mt-14">
            <p className="pm-mono text-[var(--slot4-soft-muted-text)]">Jump to a section</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((task) => {
                const Icon = taskIcon[task.key] || Layers
                return (
                  <Link
                    key={task.key}
                    href={task.route}
                    className="group flex min-w-0 items-center gap-3 rounded-[1.1rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-4 transition duration-300 hover:-translate-y-1 hover:border-[var(--slot4-page-text)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)] transition duration-300 group-hover:bg-[var(--slot4-page-text)] group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{task.label}</span>
                      <span className="pm-mono block truncate text-[var(--slot4-soft-muted-text)]">Browse</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/* ---------------- Connected areas + editorial latest column -------------- */

export function EditableMagazineSplit(props: HomeSectionProps) {
  const { primaryTask, primaryRoute } = props
  const all = pool(props)
  if (!all.length) return null

  const enabled = getVisibleTaskLinks()
  const primaryPosts = props.posts.length ? props.posts : all

  // One panel per enabled section. Posts come from the already-fetched feed —
  // no extra requests, and every panel degrades gracefully when empty.
  const areas: AreaPanel[] = enabled.map((task) => {
    const source = task.key === primaryTask ? primaryPosts : all
    return {
      key: task.key,
      label: task.label,
      title: `${task.label} that stay easy to browse.`,
      description: taskBlurb[task.key] || task.description || '',
      href: task.route,
      posts: source.slice(0, 4).map((post) => ({
        id: post.id || post.slug,
        title: post.title,
        href: postHref(task.key, post, task.route),
        image: hasEditablePostImage(post) ? getEditablePostImage(post) : '',
        category: getEditableCategory(post),
        date: getEditableDate(post),
      })),
    }
  })

  const rows = all.slice(0, 5)
  const index = all.slice(5, 13)

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${container} py-16 sm:py-20 lg:py-24`}>
        <SectionHead
          center
          eyebrow="Connected sections"
          title="What does"
          strong={`${SITE_CONFIG.name} connect?`}
          description="Each section keeps its own rhythm, and all of them share one navigation, one search and one visual language."
        />

        <span className="pm-rail mx-auto" aria-hidden="true" />

        {areas.length ? <EditableAreaSwitcher areas={areas} /> : null}

        <span className="pm-rail mx-auto" aria-hidden="true" />

        {/* Editorial latest: rules on the left, quiet index on the right */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className="min-w-0">
            <SectionHead
              eyebrow="Latest"
              title="Fresh off"
              strong="the feed."
              href={primaryRoute}
              linkLabel="Open the archive"
            />
            <div className="mt-8">
              {rows.map((post, i) => (
                <EditorialRowCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
              ))}
            </div>
          </div>

          {index.length ? (
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                <p className="pm-mono pm-marker text-[var(--slot4-accent)]">The index</p>
                <h3 className="editable-display mt-3 text-xl font-semibold">More worth opening</h3>
                <div className="mt-4">
                  {index.map((post, i) => (
                    <CompactIndexCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ------------------- Discovery engine + time collections ----------------- */

const engineSteps = [
  { title: 'Structure', body: 'Every post is captured with the same fields, so sections stay comparable.' },
  { title: 'Surface', body: 'New work moves to the front automatically, without manual curation.' },
  { title: 'Connect', body: 'Related posts, sections and people stay one click away from each other.' },
  { title: 'Measure', body: 'Categories and time windows show what people are actually opening.' },
]

const sectionCopy: Record<string, { eyebrow: string; title: string; strong: string }> = {
  spotlight: { eyebrow: 'Last seven days', title: 'New', strong: 'this week.' },
  browse: { eyebrow: 'Past month', title: 'Still getting', strong: 'opened.' },
  index: { eyebrow: 'Evergreen', title: 'From the', strong: 'archive.' },
}

function EngineDiagram() {
  return (
    <div className="relative mx-auto flex h-[220px] w-full max-w-3xl items-center justify-center gap-3 sm:h-[300px] sm:gap-6" aria-hidden="true">
      <span className="pm-ring pm-ring--dense h-24 w-24 shrink-0 opacity-70 sm:h-40 sm:w-40" />
      <span className="pm-ring pm-ring--spokes h-16 w-16 shrink-0 opacity-60 sm:h-28 sm:w-28" />
      <span className="pm-ring h-10 w-10 shrink-0 opacity-50 sm:h-16 sm:w-16" />
      <span className="editable-display shrink-0 px-2 text-2xl font-semibold text-white sm:px-5 sm:text-4xl">
        {SITE_CONFIG.name.slice(0, 3).toUpperCase()}
      </span>
      <span className="pm-ring h-10 w-10 shrink-0 opacity-50 sm:h-16 sm:w-16" />
      <span className="pm-ring pm-ring--spokes h-16 w-16 shrink-0 opacity-60 sm:h-28 sm:w-28" />
      <span className="pm-ring pm-ring--dense h-24 w-24 shrink-0 opacity-70 sm:h-40 sm:w-40" />
    </div>
  )
}

export function EditableTimeCollections(props: HomeSectionProps) {
  const { primaryTask, primaryRoute, posts, timeSections } = props

  // Use the real time windows; fall back to slicing posts so the page stays full.
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)

  return (
    <>
      {/* Statement band */}
      <section className="bg-[var(--pm-charcoal)] text-white">
        <div className={`${container} py-16 text-center sm:py-20 lg:py-24`}>
          <p className="pm-mono pm-marker text-[var(--slot4-accent)]">Discovery engine</p>
          <h2 className="pm-display mx-auto mt-5 max-w-3xl text-[2.1rem] sm:text-[3rem] lg:text-[3.4rem]">
            Built so good work <span className="pm-strong">gets found.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-[1.8] text-white/55 sm:text-base">
            Sections, categories and time windows work together, so a visitor who arrives for one post
            leaves having read three.
          </p>

          <EngineDiagram />

          <div className="mt-6 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
            {engineSteps.map((step, i) => (
              <div key={step.title} className="border-l border-white/15 pl-5">
                <p className="editable-display text-[15px] font-semibold text-white">
                  {String(i + 1).padStart(2, '0')}. {step.title}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-white/50">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Time-window collections — a different card language per band */}
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'More', title: 'Worth', strong: 'a look.' }
        const items = section.posts.slice(0, 8)
        const bg = index % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-panel-bg)]'

        return (
          <section key={section.key} className={bg}>
            <div className={`${container} py-16 sm:py-20`}>
              <SectionHead
                eyebrow={copy.eyebrow}
                title={copy.title}
                strong={copy.strong}
                href={section.href || primaryRoute}
                linkLabel="See all"
              />

              {index === 0 ? (
                <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                  {items.map((post, i) => (
                    <ImageFirstCard
                      key={post.id || post.slug}
                      post={post}
                      href={postHref(primaryTask, post, primaryRoute)}
                      tall={i % 4 === 0 || i % 4 === 3}
                    />
                  ))}
                </div>
              ) : null}

              {index === 1 ? (
                <div className="mt-10 grid gap-5 xl:grid-cols-2">
                  {items.slice(0, 6).map((post, i) => (
                    <ArticleListCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
                  ))}
                </div>
              ) : null}

              {index >= 2 ? (
                <div className="pm-noscroll -mx-5 mt-10 flex snap-x gap-5 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
                  {items.map((post, i) => (
                    <RailPostCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
    </>
  )
}

/* -------------------------------- CTA band ------------------------------ */

export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section id="get-app" className="pm-stage relative scroll-mt-28 overflow-hidden text-white">
      <span className="pm-shard pm-shard--a" />
      <span className="pm-shard pm-shard--c" />
      <span className="pm-grain" />
      <div className={`relative z-10 ${container} flex flex-col items-center gap-7 py-20 text-center sm:py-24`}>
        <p className="pm-mono pm-marker text-white/60">{cta.badge}</p>
        <h2 className="pm-display max-w-3xl text-[2.1rem] sm:text-[3rem] lg:text-[3.4rem]">
          {cta.title}
        </h2>
        <p className="max-w-xl text-base leading-[1.8] text-white/65">{cta.description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={cta.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#141416] transition duration-300 hover:bg-[var(--slot4-accent-soft)]"
          >
            {cta.primaryCta.label} <Sparkles className="h-4 w-4" />
          </Link>
          <Link
            href={cta.secondaryCta.href}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:border-white/80"
          >
            {cta.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}

/* Named export kept for callers that want a compact excerpt helper. */
export { getExcerpt as getEditableHomeExcerpt }
