'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Link2, Share2, X, ZoomIn } from 'lucide-react'

/*
  Reader-side extras for detail pages.

  - EditableReadingProgress: a hairline progress bar tied to scroll depth.
  - EditableGallery: a click-to-open lightbox with keyboard paging.
  - EditableShareBar: native share when available, copy-link everywhere else.

  All three are presentation only — no data fetching, no routing.
*/

export function EditableReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / scrollable) * 100)) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="sticky top-0 z-30 h-[3px] w-full bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-[var(--tk-accent)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function EditableGallery({
  images,
  title,
  layout = 'masonry',
}: {
  images: string[]
  title?: string
  layout?: 'masonry' | 'strip'
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback(
    (delta: number) => setOpenIndex((current) => (current === null ? null : (current + delta + images.length) % images.length)),
    [images.length]
  )

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [openIndex, close, step])

  if (!images.length) return null

  return (
    <>
      <div
        className={
          layout === 'strip'
            ? 'grid grid-cols-2 gap-3 sm:grid-cols-4'
            : 'columns-1 gap-4 [column-fill:_balance] sm:columns-2'
        }
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open image ${index + 1}`}
            className={`group relative block w-full overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] ${
              layout === 'strip' ? 'aspect-[4/3]' : 'mb-4 break-inside-avoid'
            }`}
          >
            <img
              src={image}
              alt=""
              loading="lazy"
              className={`w-full object-cover transition duration-700 group-hover:scale-[1.03] ${layout === 'strip' ? 'h-full' : ''}`}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/25 group-hover:opacity-100">
              <span className="rounded-full bg-white/90 p-2.5 text-[#15171f]">
                <ZoomIn className="h-4 w-4" />
              </span>
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Image viewer'}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0a0c18]/95 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation()
                  step(-1)
                }}
                className="absolute left-3 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation()
                  step(1)
                }}
                className="absolute right-3 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <figure className="max-h-full w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <img src={images[openIndex]} alt="" className="mx-auto max-h-[80vh] w-auto rounded-[1rem] object-contain" />
            <figcaption className="pm-mono mt-4 text-center text-white/50">
              {openIndex + 1} / {images.length}
              {title ? ` — ${title}` : ''}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  )
}

export function EditableShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
      >
        <Share2 className="h-4 w-4" /> Share
      </button>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
      >
        {copied ? <Check className="h-4 w-4 text-[var(--tk-accent)]" /> : <Link2 className="h-4 w-4" />}
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  )
}
