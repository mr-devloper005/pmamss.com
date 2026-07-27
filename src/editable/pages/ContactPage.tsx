'use client'

import Link from 'next/link'
import { Bookmark, Building2, FileText, Image as ImageIcon, Mail, MapPin, MoveUpRight, Phone, Sparkles } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Add an entry', body: 'Get a business or organisation listed, with the details checked before it goes live.' },
      { icon: Phone, title: 'Partnerships', body: 'Bulk publishing, category sponsorship and operational setup questions.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new area or category covered? Tell us what is missing.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Submissions', body: 'Pitch essays, columns and long-form ideas that fit what is published here.' },
      { icon: Mail, title: 'Partnerships', body: 'Collaborations, sponsorships and campaign-level questions.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Help with voice, formatting and the publishing workflow.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Feature a set', body: 'Gallery launches, creator features and visual campaigns.' },
      { icon: Sparkles, title: 'Usage and licensing', body: 'Rights, commercial requests and permission questions.' },
      { icon: Mail, title: 'Media kits', body: 'Request decks, editorial support or feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Suggest a resource', body: 'Links, boards and references that deserve a place in the library.' },
    { icon: Mail, title: 'Curation projects', body: 'Reference pages, collections and link programmes.' },
    { icon: Sparkles, title: 'Curator support', body: 'Help organising shelves, collections and connected boards.' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Masthead — same faceted stage as the other top-level pages */}
        <section className="pm-stage relative -mt-24 overflow-hidden pt-24 text-white">
          <span className="pm-shard pm-shard--a" />
          <span className="pm-shard pm-shard--c" />
          <span className="pm-grain" />
          <div className="relative z-10 mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="pm-mono pm-marker text-white/60">{pagesContent.contact.eyebrow}</p>
            <h1 className="pm-display mt-5 max-w-3xl text-[2.3rem] sm:text-[3.2rem] lg:text-[3.6rem]">
              {pagesContent.contact.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-[1.8] text-white/65">
              {pagesContent.contact.description}
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
            <div className="min-w-0">
              <p className="pm-mono text-[var(--slot4-soft-muted-text)]">Pick a lane</p>
              <h2 className="pm-display mt-3 text-[1.8rem] sm:text-[2.3rem]">
                What can we <span className="pm-strong">help with?</span>
              </h2>

              <div className="mt-8 space-y-3">
                {lanes.map((lane, index) => (
                  <div
                    key={lane.title}
                    className="flex gap-4 rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-page-text)]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <lane.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="pm-mono text-[var(--slot4-soft-muted-text)]">{String(index + 1).padStart(2, '0')}</p>
                      <h3 className="editable-display mt-1.5 text-[1.15rem] font-semibold">{lane.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{lane.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-[var(--pm-radius)] bg-[var(--pm-charcoal)] p-7 text-white">
                <p className="pm-mono text-white/45">Prefer to browse first?</p>
                <p className="editable-display mt-3 text-[1.3rem] font-semibold">
                  Everything published is already open to read.
                </p>
                <Link
                  href="/search"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1a1714] transition hover:bg-[var(--slot4-accent)] hover:text-white"
                >
                  Search {SITE_CONFIG.name} <MoveUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="min-w-0 rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-9 lg:sticky lg:top-28">
              <p className="pm-mono text-[var(--slot4-soft-muted-text)]">Direct line</p>
              <h2 className="pm-display mt-3 text-[1.8rem]">
                {pagesContent.contact.formTitle}
              </h2>
              <EditableContactLeadForm />
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
