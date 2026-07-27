'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function timeAgo(value?: string) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}

function initial(name: string) {
  return (name.trim()[0] || 'G').toUpperCase()
}

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  // Load this post's comments after mount (the initial render stays in sync with
  // the server so there's no hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      /* storage unavailable — keep the in-memory list */
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  // User comments (newest first) sit above any existing comments.
  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  return (
    <section className="mt-16 border-t border-[var(--tk-line)] pt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="pm-mono text-[var(--tk-muted)]">Discussion</p>
          <h2 className="pm-display mt-3 text-[1.7rem]">
            {all.length} {all.length === 1 ? 'comment' : 'comments'}
          </h2>
        </div>
        <MessageCircle className="h-6 w-6 shrink-0 text-[var(--tk-accent)]" />
      </div>

      <form onSubmit={submit} className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 sm:p-6">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="h-12 w-full rounded-full border border-[var(--tk-line)] bg-[var(--tk-bg)] px-5 text-sm text-[var(--tk-text)] outline-none transition duration-300 focus:border-[var(--tk-accent)]"
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add to the discussion…"
          rows={4}
          maxLength={1500}
          className="mt-3 w-full resize-y rounded-[1.15rem] border border-[var(--tk-line)] bg-[var(--tk-bg)] px-5 py-4 text-sm leading-7 text-[var(--tk-text)] outline-none transition duration-300 focus:border-[var(--tk-accent)]"
        />
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="pm-mono text-[var(--tk-muted)]">Saved on this device</p>
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-text)] px-6 py-3 text-sm font-semibold text-[var(--tk-surface)] transition duration-300 hover:bg-[var(--tk-accent)] hover:text-[var(--tk-on-accent)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" /> Post
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-line)]">
        {all.map((comment) => (
          <article key={comment.id} className="bg-[var(--tk-surface)] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-sm font-semibold text-[var(--tk-accent)]">
                {initial(comment.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--tk-text)]">{comment.name || 'Guest'}</p>
                {comment.createdAt ? <p className="pm-mono mt-0.5 text-[var(--tk-muted)]">{timeAgo(comment.createdAt)}</p> : null}
              </div>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--tk-text)]">{comment.comment}</p>
          </article>
        ))}
        {!all.length ? (
          <p className="bg-[var(--tk-surface)] p-8 text-center text-sm text-[var(--tk-muted)]">
            No comments yet — be the first to add one.
          </p>
        ) : null}
      </div>
    </section>
  )
}
