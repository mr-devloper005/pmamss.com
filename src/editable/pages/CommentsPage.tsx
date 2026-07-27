'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, MessageSquare, RefreshCw, Search } from 'lucide-react'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

type StoredComment = {
  id: string
  name: string
  email?: string
  comment: string
  createdAt: string
  articleTitle?: string
  articleSlug?: string
}

const COMMENTS_PER_PAGE = 8
const COMMENT_KEY_PREFIX = 'slot4:article-comments:'

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Just now'
  }
}

const readCommentsFromStorage = (): StoredComment[] => {
  const items: StoredComment[] = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(COMMENT_KEY_PREFIX)) continue
    const articleSlug = key.replace(COMMENT_KEY_PREFIX, '')
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
      if (!Array.isArray(parsed)) continue
      for (const item of parsed) {
        if (!item || typeof item !== 'object') continue
        if (typeof item.name !== 'string' || typeof item.comment !== 'string') continue
        items.push({
          id: typeof item.id === 'string' ? item.id : `${articleSlug}-${items.length}`,
          name: item.name,
          email: typeof item.email === 'string' ? item.email : undefined,
          comment: item.comment,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          articleTitle: typeof item.articleTitle === 'string' ? item.articleTitle : undefined,
          articleSlug: typeof item.articleSlug === 'string' ? item.articleSlug : articleSlug,
        })
      }
    } catch {
      // Ignore corrupted local comment records.
    }
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export default function CommentsPage() {
  const [comments, setComments] = useState<StoredComment[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setComments(readCommentsFromStorage())
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return comments
    return comments.filter((item) =>
      [item.name, item.email, item.comment, item.articleTitle, item.articleSlug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
  }, [comments, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / COMMENTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleComments = filtered.slice((currentPage - 1) * COMMENTS_PER_PAGE, currentPage * COMMENTS_PER_PAGE)

  function refreshComments() {
    setComments(readCommentsFromStorage())
    setPage(1)
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-6 border-b border-[var(--editable-border)] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="pm-mono pm-marker text-[var(--slot4-accent)]">
                <MessageSquare className="mr-1 inline h-3.5 w-3.5 align-[-2px]" /> On this device
              </p>
              <h1 className="pm-display mt-5 text-[2.2rem] sm:text-[3rem]">
                Your <span className="pm-strong">comments.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-[1.8] text-[var(--slot4-muted-text)]">
                Everything you have posted from a detail page, kept locally in this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshComments}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold transition duration-300 hover:border-[var(--slot4-page-text)]"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex w-full min-w-0 items-center gap-2.5 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-3 sm:max-w-md">
              <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search your comments"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
              />
            </label>
            <p className="pm-mono text-[var(--slot4-soft-muted-text)]">
              {filtered.length} {filtered.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>

          {visibleComments.length ? (
            <div className="mt-8 grid gap-4">
              {visibleComments.map((item) => (
                <article
                  key={`${item.articleSlug}-${item.id}`}
                  className="rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(18,22,44,0.1)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-semibold text-[var(--slot4-accent)]">
                        {(item.name.trim()[0] || 'G').toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="pm-mono mt-0.5 text-[var(--slot4-soft-muted-text)]">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    {item.articleSlug ? (
                      <Link
                        href={`/article/${item.articleSlug}`}
                        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)]"
                      >
                        <span className="pm-link">Open post</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    ) : null}
                  </div>
                  {item.articleTitle ? <p className="editable-display mt-5 text-[1.05rem] font-semibold">{item.articleTitle}</p> : null}
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--slot4-muted-text)]">{item.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[var(--pm-radius)] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-8 py-16 text-center">
              <MessageSquare className="mx-auto h-7 w-7 text-[var(--slot4-soft-muted-text)]" />
              <h2 className="pm-display mt-5 text-[1.6rem]">No comments yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--slot4-muted-text)]">
                Add a comment on any detail page and it will show up here.
              </p>
            </div>
          )}

          {filtered.length > COMMENTS_PER_PAGE ? (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--editable-border)] pt-6">
              <p className="pm-mono text-[var(--slot4-soft-muted-text)]">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}
