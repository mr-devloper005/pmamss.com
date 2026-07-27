import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Task surfaces for the "Paper & Signal" system.

  Every task shares one identity — paper cream ground, white raised cards,
  hairline warm borders, one electric blue signal accent, geometric display
  type. Only the per-task voice (kicker / note) changes, so no section ever
  reads as a different site. Tokens ship as CSS variables (`--tk-*`) so archive
  + detail layouts stay fully themeable.
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Outfit', 'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const BODY_FONT = "'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#f4f1ea',
  surface: '#ffffff',
  raised: '#ebe7dd',
  text: '#15171f',
  muted: '#5b6070',
  line: '#e1dcd1',
  accent: '#2c4ce0',
  accentSoft: '#e8ecff',
  onAccent: '#ffffff',
  glow: 'rgba(44,76,224,0.10)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Reading', note: 'Long-form pieces, guides and reference writing worth the time.' },
  listing: { ...base, kicker: 'Directory', note: 'Organisations and services, arranged so they can be compared quickly.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Current offers and openings, written to be acted on the same day.' },
  image: { ...base, kicker: 'Gallery', note: 'A visual index where the image leads and the caption follows.' },
  sbm: { ...base, kicker: 'Collections', note: 'Saved references, shelved by theme so they stay findable.' },
  pdf: { ...base, kicker: 'Library', note: 'Downloadable reports, guides and documents in one place.' },
  profile: { ...base, kicker: 'People', note: 'The people and organisations behind the work, with the context that matters.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    // Re-point the shared article-body accent vars so post HTML (headings,
    // links) inherits this task's accent instead of the global site accent.
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
