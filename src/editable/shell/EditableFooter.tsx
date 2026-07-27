'use client'

import Link from 'next/link'
import { ArrowUpRight, Mail, MoveUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { getVisibleTaskLinks, globalContent } from '@/editable/content/global.content'

/*
  Charcoal editorial footer: a closing statement band, three link columns,
  an oversized wordmark rule, then a quiet legal strip.
*/
export function EditableFooter() {
  const taskLinks = getVisibleTaskLinks()
  const year = new Date().getFullYear()

  const siteLinks: Array<[string, string]> = [
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Search', '/search'],
  ]

  return (
    <footer className="mt-auto bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-6 lg:px-8">
        {/* Closing statement */}
        <div className="grid gap-8 border-b border-white/10 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:py-20">
          <div>
            <p className="pm-mono pm-marker text-white/45">Keep exploring</p>
            <h2 className="pm-display mt-5 max-w-2xl text-[2rem] text-white sm:text-[2.75rem]">
              Everything worth reading, <span className="pm-strong">in one place.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href={taskLinks[0]?.route || '/search'}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#1a1714] transition duration-300 hover:bg-[var(--slot4-accent)] hover:text-white"
            >
              Browse the archive <MoveUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:border-white/70"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </Link>
          </div>
        </div>

        {/* Columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/favicon.png?v=20260413" alt="" className="h-11 w-11 shrink-0 object-contain" />
              <span className="editable-display truncate text-[19px] font-semibold text-white">{SITE_CONFIG.name}</span>
            </Link>
          </div>

          <FooterColumn title="Sections">
            {taskLinks.map((task) => (
              <FooterLink key={task.key} href={task.route}>
                {task.label}
              </FooterLink>
            ))}
            {!taskLinks.length ? <FooterLink href="/search">Search</FooterLink> : null}
          </FooterColumn>

          <FooterColumn title="Site">
            {siteLinks.map(([label, href]) => (
              <FooterLink key={href} href={href}>
                {label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="More">
            <FooterLink href="/comments">Comments</FooterLink>
            <FooterLink href="/search">Full archive</FooterLink>
            <FooterLink href="/contact">Partnerships</FooterLink>
          </FooterColumn>
        </div>
      </div>

      {/* Oversized wordmark rule */}
      <div className="overflow-hidden border-t border-white/10">
        <p className="pm-display select-none whitespace-nowrap px-5 py-6 text-center text-[13vw] leading-none text-white/[0.06] sm:px-6 lg:px-8">
          {SITE_CONFIG.name}
        </p>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col gap-3 px-5 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} {SITE_CONFIG.name}. All rights reserved.</p>
          <p className="pm-mono text-white/30">{globalContent.footer?.bottomNote || 'Built for clear reading and easy discovery.'}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="pm-mono text-white/40">{title}</h3>
      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex w-fit items-center gap-1.5 text-sm text-white/60 transition duration-300 hover:text-white">
      <span className="pm-link">{children}</span>
      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition duration-300 group-hover:opacity-70" />
    </Link>
  )
}
