'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, ChevronDown, Menu, MoveUpRight, Search, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { getVisibleTaskLinks } from '@/editable/content/global.content'

type NavLink = { label: string; href: string; note?: string }
type NavGroup = { id: string; label: string; links: NavLink[] }

/*
  Floating pill masthead.

  A transparent sticky wrapper holds one rounded white bar so the bar can float
  over a full-bleed hero. Menus open on click (and on hover for pointer users),
  close on outside click / Escape / route change. The bar tightens once the page
  is scrolled.
*/
export function EditableNavbar() {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)

  const taskLinks = useMemo<NavLink[]>(
    () => getVisibleTaskLinks().map((task) => ({ label: task.label, href: task.route, note: task.description })),
    []
  )

  const primaryRoute = taskLinks[0]?.href || '/search'

  const groups = useMemo<NavGroup[]>(
    () => [
      { id: 'explore', label: 'Explore', links: taskLinks },
      {
        id: 'resources',
        label: 'Resources',
        links: [
          { label: 'Search', href: '/search', note: 'Look across every published section' },
          { label: 'Comments', href: '/comments', note: 'Conversations saved on this device' },
        ],
      },
      {
        id: 'company',
        label: 'Company',
        links: [
          { label: 'About', href: '/about', note: `What ${SITE_CONFIG.name} is built for` },
          { label: 'Contact', href: '/contact', note: 'Reach the team behind the site' },
        ],
      },
    ],
    [taskLinks]
  )

  // Close every overlay when the route changes.
  useEffect(() => {
    setOpenMenu(null)
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenMenu(null)
      setSearchOpen(false)
      setMobileOpen(false)
    }
    const onClick = (event: MouseEvent) => {
      if (!headerRef.current || headerRef.current.contains(event.target as Node)) return
      setOpenMenu(null)
      setSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header ref={headerRef} className="sticky top-0 z-50 px-3 py-4 sm:px-5">
      <div
        className={`mx-auto flex h-16 w-full max-w-[var(--editable-container)] items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 pl-4 pr-3 text-[var(--editable-nav-text)] backdrop-blur-xl transition-shadow duration-500 sm:pl-6 sm:pr-4 ${
          scrolled ? 'shadow-[0_16px_44px_rgba(18,22,44,0.16)]' : 'shadow-[0_10px_30px_rgba(18,22,44,0.08)]'
        }`}
      >
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2.5" aria-label={SITE_CONFIG.name}>
          <img
            src="/favicon.png?v=20260413"
            alt=""
            className="h-10 w-10 shrink-0 object-contain transition duration-500 group-hover:opacity-75 sm:h-11 sm:w-11"
          />
          <span className="editable-display hidden max-w-[220px] truncate text-[20px] font-semibold leading-none tracking-[-0.03em] sm:block">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Centred menu groups */}
        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {groups.map((group) => {
            const open = openMenu === group.id
            const groupActive = group.links.some((link) => isActive(link.href))
            if (!group.links.length) return null
            return (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => setOpenMenu(group.id)}
                onMouseLeave={() => setOpenMenu((current) => (current === group.id ? null : current))}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenMenu(open ? null : group.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition duration-300 ${
                    open || groupActive
                      ? 'bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]'
                      : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                  }`}
                >
                  {group.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition duration-300 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open ? (
                  <div className="absolute left-1/2 top-[calc(100%+14px)] w-[320px] -translate-x-1/2 pm-rise">
                    <div className="overflow-hidden rounded-[1.25rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-2 shadow-[0_28px_70px_rgba(18,22,44,0.18)]">
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="group/item flex items-start gap-3 rounded-[0.9rem] px-3 py-3 transition duration-300 hover:bg-[var(--slot4-panel-bg)]"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--slot4-accent)] opacity-40 transition group-hover/item:opacity-100" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-[var(--slot4-page-text)]">{link.label}</span>
                            {link.note ? (
                              <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-[var(--slot4-muted-text)]">{link.note}</span>
                            ) : null}
                          </span>
                          <ArrowUpRight className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)] transition duration-300 group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-[var(--slot4-accent)]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((value) => !value)
              setOpenMenu(null)
            }}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--slot4-muted-text)] transition duration-300 hover:bg-[var(--slot4-panel-bg)] hover:text-[var(--slot4-page-text)]"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          <Link
            href={primaryRoute}
            className="hidden items-center gap-1.5 rounded-full border border-[var(--editable-border)] px-4 py-2 text-[13px] font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-page-text)] md:inline-flex"
          >
            Browse
          </Link>
          <Link
            href="/contact"
            className="hidden items-center gap-2 rounded-full bg-[var(--slot4-page-text)] px-5 py-2.5 text-[13px] font-semibold text-white transition duration-300 hover:bg-[var(--slot4-accent)] sm:inline-flex"
          >
            Get in touch <MoveUpRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)] lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Inline search drawer */}
      {searchOpen ? (
        <div className="pm-rise mx-auto mt-3 w-full max-w-[var(--editable-container)]">
          <form
            action="/search"
            className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-3 shadow-[0_18px_50px_rgba(18,22,44,0.14)]"
          >
            <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
            <input
              name="q"
              type="search"
              autoFocus
              placeholder="Search posts, people, topics"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
            />
            <button className="shrink-0 rounded-full bg-[var(--slot4-accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110">
              Search
            </button>
          </form>
        </div>
      ) : null}

      {/* Mobile sheet */}
      {mobileOpen ? (
        <div className="pm-rise mx-auto mt-3 w-full max-w-[var(--editable-container)] overflow-hidden rounded-[1.5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] shadow-[0_28px_70px_rgba(18,22,44,0.2)] lg:hidden">
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <form action="/search" className="mb-4 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
              <input name="q" type="search" placeholder="Search" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-soft-muted-text)]" />
            </form>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${pathname === '/' ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)]'}`}
            >
              Home
            </Link>

            {groups.map((group) => (
              <div key={group.id} className="mt-4">
                <p className="pm-mono px-3 text-[var(--slot4-soft-muted-text)]">{group.label}</p>
                <div className="mt-2 grid">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        isActive(link.href)
                          ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                          : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-panel-bg)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-5 grid gap-2 border-t border-[var(--editable-border)] pt-4">
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="rounded-full bg-[var(--slot4-page-text)] px-5 py-3 text-center text-sm font-semibold text-white">
                Get in touch
              </Link>
              <Link href={primaryRoute} onClick={() => setMobileOpen(false)} className="rounded-full border border-[var(--editable-border)] px-5 py-3 text-center text-sm font-semibold">
                Browse the archive
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
