'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ImageOff, MoveUpRight } from 'lucide-react'

/*
  Client-side interaction layer for the homepage.

  Everything here takes plain serializable props prepared on the server, so no
  data fetching moves into the browser. Two pieces live here:

  - EditableAreaSwitcher: the "what this platform connects" panel, where each
    area reveals its own live preview list.
  - EditableStatCounter: a number that counts up once, on first paint.
*/

export type AreaPreviewPost = {
  id: string
  title: string
  href: string
  image: string
  category: string
  date: string
}

export type AreaPanel = {
  key: string
  label: string
  title: string
  description: string
  href: string
  posts: AreaPreviewPost[]
}

export function EditableAreaSwitcher({ areas }: { areas: AreaPanel[] }) {
  const [activeKey, setActiveKey] = useState(areas[0]?.key || '')
  const active = useMemo(() => areas.find((area) => area.key === activeKey) || areas[0], [areas, activeKey])
  if (!areas.length || !active) return null

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
      {/* Selector rail */}
      <div className="pm-noscroll -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {areas.map((area) => {
          const isActive = area.key === active.key
          return (
            <button
              key={area.key}
              type="button"
              onClick={() => setActiveKey(area.key)}
              aria-pressed={isActive}
              className={`group shrink-0 rounded-[1.1rem] border px-5 py-4 text-left transition duration-300 lg:w-full ${
                isActive
                  ? 'border-transparent bg-[var(--slot4-page-text)] text-white shadow-[0_18px_44px_rgba(18,22,44,0.18)]'
                  : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] text-[var(--slot4-page-text)] hover:border-[var(--slot4-page-text)]'
              }`}
            >
              <span className={`pm-mono block ${isActive ? 'text-white/50' : 'text-[var(--slot4-soft-muted-text)]'}`}>
                {String(areas.indexOf(area) + 1).padStart(2, '0')}
              </span>
              <span className="editable-display mt-1.5 block whitespace-nowrap text-[1.05rem] font-semibold lg:whitespace-normal">
                {area.label}
              </span>
              <span
                className={`mt-1 hidden text-xs leading-5 lg:block ${isActive ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'}`}
              >
                {area.posts.length} published
              </span>
            </button>
          )
        })}
      </div>

      {/* Panel */}
      <div
        key={active.key}
        className="pm-rise min-w-0 overflow-hidden rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]"
      >
        <div className="border-b border-[var(--editable-border)] p-6 sm:p-9">
          <p className="pm-mono pm-marker text-[var(--slot4-accent)]">{active.label}</p>
          <h3 className="pm-display mt-4 max-w-xl text-[1.7rem] text-[var(--slot4-page-text)] sm:text-[2.15rem]">{active.title}</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--slot4-muted-text)] sm:text-base">{active.description}</p>
          <Link
            href={active.href}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[var(--slot4-accent)]"
          >
            Open {active.label.toLowerCase()} <MoveUpRight className="h-4 w-4" />
          </Link>
        </div>

        {active.posts.length ? (
          <div className="grid gap-px bg-[var(--editable-border)] sm:grid-cols-2">
            {active.posts.slice(0, 4).map((post) => (
              <Link
                key={post.id}
                href={post.href}
                className="group flex min-w-0 items-center gap-4 bg-[var(--slot4-surface-bg)] p-5 transition duration-300 hover:bg-[var(--slot4-panel-bg)]"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.8rem] bg-[var(--slot4-media-bg)]">
                  {post.image ? (
                    <img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[var(--slot4-soft-muted-text)]">
                      <ImageOff className="h-4 w-4" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="pm-mono block truncate text-[var(--slot4-soft-muted-text)]">
                    {post.category}
                    {post.date ? ` · ${post.date}` : ''}
                  </span>
                  <span className="editable-display mt-1 block line-clamp-2 text-[0.98rem] font-semibold leading-snug text-[var(--slot4-page-text)]">
                    {post.title}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)] transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--slot4-accent)]" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-[var(--slot4-muted-text)] sm:p-9">
            Nothing published in this section yet — it will fill in as posts go live.
          </p>
        )}
      </div>
    </div>
  )
}

export function EditableStatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const done = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node || done.current) return
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    const run = () => {
      if (done.current) return
      done.current = true
      const duration = 1100
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration)
        // easeOutExpo — fast start, soft landing
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        setDisplay(Math.round(value * eased))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    if (!('IntersectionObserver' in window)) {
      run()
      return
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && run()),
      { threshold: 0.35 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="min-w-0">
      <p className="pm-display text-[2.4rem] font-medium leading-none text-[var(--slot4-page-text)] sm:text-[3rem]">
        {display}
        {suffix}
      </p>
      <p className="pm-mono mt-3 text-[var(--slot4-soft-muted-text)]">{label}</p>
    </div>
  )
}
