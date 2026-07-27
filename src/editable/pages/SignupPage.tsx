import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Create account', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid w-full max-w-[var(--editable-container)] items-stretch gap-6 px-5 py-14 sm:px-6 lg:grid-cols-[0.85fr_1fr] lg:px-8 lg:py-20">
          <div className="order-2 min-w-0 self-center rounded-[var(--pm-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 sm:p-9 lg:order-1">
            <p className="pm-mono text-[var(--slot4-soft-muted-text)]">Get started</p>
            <h1 className="pm-display mt-3 text-[1.7rem]">{pagesContent.auth.signup.formTitle}</h1>
            <EditableLocalSignupForm />
            <p className="mt-7 border-t border-[var(--editable-border)] pt-6 text-sm text-[var(--slot4-muted-text)]">
              Already have an account?{' '}
              <Link href="/login" className="pm-link font-semibold text-[var(--slot4-accent)]">
                {pagesContent.auth.signup.loginCta}
              </Link>
            </p>
          </div>

          {/* Faceted panel — the same stage the top-level pages use */}
          <div className="pm-stage relative order-1 flex min-w-0 items-end overflow-hidden rounded-[var(--pm-radius)] p-8 text-white sm:p-11 lg:order-2">
            <span className="pm-shard pm-shard--a" />
            <span className="pm-shard pm-shard--c" />
            <span className="pm-grain" />
            <div className="relative z-10">
              <p className="pm-mono pm-marker text-white/60">{pagesContent.auth.signup.badge}</p>
              <h2 className="pm-display mt-6 max-w-md text-[2.1rem] sm:text-[2.8rem]">{pagesContent.auth.signup.title}</h2>
              <p className="mt-6 max-w-md text-base leading-[1.8] text-white/65">
                {pagesContent.auth.signup.description}
              </p>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
