import type { CSSProperties } from 'react'

/*
  Design system: "Paper & Signal".

  Warm paper cream as the page ground, pure white for raised surfaces,
  an electric editorial blue as the single accent, and a deep charcoal for
  statement bands. Type is geometric display + quiet sans + mono micro-labels.
  Every visible surface reads from these CSS variables.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#f4f1ea',
  '--slot4-page-text': '#15171f',
  '--slot4-panel-bg': '#ebe7dd',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#5b6070',
  '--slot4-soft-muted-text': '#8d92a1',
  '--slot4-accent': '#2c4ce0',
  '--slot4-accent-fill': '#2c4ce0',
  '--slot4-accent-soft': '#e8ecff',
  '--slot4-on-accent': '#ffffff',
  '--slot4-dark-bg': '#26221f',
  '--slot4-dark-text': '#f6f3ec',
  '--slot4-media-bg': '#e5e0d6',
  '--slot4-cream': '#f4f1ea',
  '--slot4-warm': '#ebe7dd',
  '--slot4-lavender': '#eef1ff',
  '--slot4-gray': '#f8f7f3',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#f4f1ea',
  '--editable-page-text': '#15171f',
  '--editable-container': '1280px',
  '--editable-border': '#e1dcd1',
  '--editable-nav-bg': '#ffffff',
  '--editable-nav-text': '#15171f',
  '--editable-nav-active': '#2c4ce0',
  '--editable-nav-active-text': '#ffffff',
  '--editable-cta-bg': '#15171f',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#1a1714',
  '--editable-footer-text': '#f6f3ec',
  // Extra signal tokens used by the hero, statement bands and diagrams.
  '--pm-blue-deep': '#141d55',
  '--pm-charcoal': '#26221f',
  '--pm-radius': '1.5rem',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/12',
  shadow: 'shadow-[0_1px_2px_rgba(20,22,40,0.05)]',
  shadowStrong: 'shadow-[0_26px_60px_rgba(18,22,44,0.12)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(10,12,26,0.05),rgba(10,12,26,0.82))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-6 lg:px-8',
    sectionY: 'py-16 sm:py-20 lg:py-24',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'pm-noscroll flex snap-x gap-5 overflow-x-auto pb-4',
    minRailCard: 'w-[260px] shrink-0 snap-start sm:w-[300px]',
  },
  type: {
    eyebrow: 'pm-mono text-[var(--slot4-accent)]',
    heroTitle: 'pm-display text-[2.6rem] sm:text-6xl lg:text-[4.4rem]',
    sectionTitle: 'pm-display text-[2rem] leading-[1.08] sm:text-[2.75rem] lg:text-[3.1rem]',
    body: 'text-base leading-[1.75]',
  },
  surface: {
    card: `rounded-[var(--pm-radius)] border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-[var(--pm-radius)] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[var(--pm-radius)] ${editablePalette.darkBg} ${editablePalette.darkText} ${editablePalette.shadowStrong}`,
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-white transition duration-300 hover:bg-[var(--slot4-accent)] active:scale-[0.985]',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-page-text)] active:scale-[0.985]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-7 py-3.5 text-sm font-semibold text-[var(--slot4-on-accent)] transition duration-300 hover:brightness-110 active:scale-[0.985]',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--slot4-muted-text)] transition duration-300 hover:bg-[var(--slot4-panel-bg)] hover:text-[var(--slot4-page-text)]',
  },
  media: {
    frame: `relative overflow-hidden rounded-[1.15rem] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/5]',
  },
  motion: {
    lift: 'pm-lift',
    fade: 'transition duration-300 hover:opacity-75',
  },
} as const

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; every section consumes those CSS variables.',
  'Keep the homepage structure in src/editable/sections/HomeSections.tsx so the whole home experience can be redesigned in one file.',
  'Lead sections with a mono eyebrow, then a light display headline with one bold key word.',
  'Alternate cream, white and charcoal bands so the page has rhythm instead of one flat surface.',
  'Keep dynamic post fetching intact; never replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
