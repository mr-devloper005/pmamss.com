'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Bookmark, Building2, CheckCircle2, FileText, Image as ImageIcon, Lock,
  Megaphone, MoveUpRight, Send, UserRound,
} from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  profile: UserRound,
  pdf: FileText,
  sbm: Bookmark,
}

const fieldClass =
  'w-full rounded-[1.15rem] border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3.5 text-sm text-[var(--slot4-page-text)] outline-none transition duration-300 placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)] focus:bg-[var(--slot4-surface-bg)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="grid gap-10 overflow-hidden rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] md:grid-cols-[0.85fr_1.15fr]">
              <div className="pm-stage relative flex min-h-64 items-center justify-center overflow-hidden">
                <span className="pm-shard pm-shard--a" />
                <span className="pm-shard pm-shard--c" />
                <Lock className="relative z-10 h-16 w-16 text-white/80" />
              </div>
              <div className="self-center p-7 sm:p-10">
                <p className="pm-mono pm-marker text-[var(--slot4-accent)]">{pagesContent.create.locked.badge}</p>
                <h1 className="pm-display mt-5 text-[2rem] sm:text-[2.6rem]">{pagesContent.create.locked.title}</h1>
                <p className="mt-5 max-w-lg text-base leading-[1.8] text-[var(--slot4-muted-text)]">
                  {pagesContent.create.locked.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[var(--slot4-accent)]"
                  >
                    Sign in <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-3 text-sm font-semibold transition duration-300 hover:border-[var(--slot4-page-text)]"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <aside className="min-w-0">
              <p className="pm-mono pm-marker text-[var(--slot4-accent)]">{pagesContent.create.hero.badge}</p>
              <h1 className="pm-display mt-5 text-[2.1rem] sm:text-[2.8rem]">{pagesContent.create.hero.title}</h1>
              <p className="mt-5 max-w-lg text-base leading-[1.8] text-[var(--slot4-muted-text)]">
                {pagesContent.create.hero.description}
              </p>

              <p className="pm-mono mt-10 text-[var(--slot4-soft-muted-text)]">Choose a section</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      aria-pressed={active}
                      className={`rounded-[1.15rem] border p-5 text-left transition duration-300 ${
                        active
                          ? 'border-transparent bg-[var(--slot4-page-text)] text-white shadow-[0_18px_44px_rgba(18,22,44,0.18)]'
                          : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] hover:-translate-y-1 hover:border-[var(--slot4-page-text)]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="editable-display mt-3 block text-[1.05rem] font-semibold">{item.label}</span>
                      <span className={`mt-1 block text-xs leading-5 ${active ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'}`}>
                        {item.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="min-w-0 rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-9">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--editable-border)] pb-6">
                <div>
                  <p className="pm-mono text-[var(--slot4-soft-muted-text)]">New {activeTask?.label || 'post'}</p>
                  <h2 className="pm-display mt-2 text-[1.7rem]">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="pm-mono rounded-full bg-[var(--slot4-panel-bg)] px-4 py-2 text-[var(--slot4-muted-text)]">
                  {session.name}
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24 leading-7`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-56 leading-7`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details or description" required />
              </div>

              {created ? (
                <div className="mt-6 flex items-start gap-3 rounded-[1.15rem] bg-emerald-50 px-5 py-4 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{pagesContent.create.successTitle}</p>
                    <p className="mt-1 truncate text-sm opacity-80">{created.title}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-6 text-sm font-semibold text-white transition duration-300 hover:bg-[var(--slot4-accent)] active:scale-[0.985]"
                >
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </button>
                <Link
                  href={activeTask?.route || '/'}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] px-6 text-sm font-semibold transition duration-300 hover:border-[var(--slot4-page-text)]"
                >
                  View section <MoveUpRight className="h-4 w-4" />
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
