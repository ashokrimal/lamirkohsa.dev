'use client'

import Link from 'next/link'
import {
  ArrowUp,
  ArrowUpRight,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
} from 'lucide-react'
import type {
  ContactDetails,
  SiteBrand,
  SiteFooterConfig,
  SiteNavigation,
} from '@/lib/site-content'
import { SITE_NAME } from '@/lib/seo'
import { useUiStrings } from '@/components/ui/UiCopyProvider'

const icons = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  email: Mail,
  twitter: Twitter,
  globe: Globe,
} as const

function iconFor(kind?: string, label?: string) {
  const key = (kind || label || '').toLowerCase()
  const match = Object.keys(icons).find((name) => key.includes(name))
  return match ? icons[match as keyof typeof icons] : Globe
}

export interface FooterSocialLink {
  id: string
  platform: string
  label: string
  url: string
  is_visible: boolean
  sort_order: number
}

/**
 * The footer closes every page: a sign-off with the studio-managed contact
 * channels and availability, the navigation columns, a slim legal bar, and the
 * over-sized brand wordmark that bleeds off the bottom edge. Brand, tagline,
 * availability, CTA, email and socials all come from the CMS; the copy that
 * frames them comes from UI copy. Every colour here is a palette token, so the
 * footer follows the light palette on cream and the dark palette on warm ink.
 */
export default function SiteFooter({
  brand,
  navigation,
  footer,
  contact,
  socialLinks,
  contactEmail,
  availabilityStatus,
}: {
  brand: SiteBrand
  navigation: SiteNavigation
  footer: SiteFooterConfig
  contact: ContactDetails
  /** Studio-managed social links; visible ones replace the legacy list. */
  socialLinks?: FooterSocialLink[]
  /** Studio-managed contact email, overriding the legacy contact record. */
  contactEmail?: string
  /** Studio-managed availability badge. */
  availabilityStatus?: string
}) {
  const uiStrings = useUiStrings()
  const year = new Date().getFullYear()
  const studioSocials = (socialLinks ?? [])
    .filter((link) => link.is_visible && link.url.trim().length > 0)
    .sort((a, b) => a.sort_order - b.sort_order)
  const resolvedSocials: Array<{ label: string; href: string; kind?: string }> =
    studioSocials.length > 0
      ? studioSocials.map((link) => ({ label: link.label, href: link.url, kind: link.platform }))
      : navigation.socials
  const resolvedEmail = contactEmail || contact.email
  const resolvedAvailability = availabilityStatus || footer.availabilityText
  const ctaHref = footer.ctaHref && footer.ctaLabel ? footer.ctaHref : '/contact'
  const ctaLabel = footer.ctaLabel || 'Start a conversation'
  const brandName = brand.name || SITE_NAME

  return (
    <footer className="relative mt-20 border-t border-line bg-surface md:mt-28">
      {/* Faint dot grain behind the sign-off, masked so it never reaches the columns. */}
      <div
        aria-hidden="true"
        className="footer-texture pointer-events-none absolute inset-x-0 top-0 h-[420px]"
      />

      <div className="relative shell-width">
        {/* Sign-off: the one loud line on the page, with the live status pills. */}
        <div className="grid gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              {uiStrings.footer.elsewhere.en}
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.04] tracking-[-0.045em] text-ink md:text-5xl">
              {footer.tagline || 'Let’s build something worth keeping.'}
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {resolvedAvailability && (
                <span className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-overlay-faint px-3 py-1.5 text-[11px] font-medium text-ink-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  {resolvedAvailability}
                </span>
              )}
              {contact.location && (
                <span className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-overlay-faint px-3 py-1.5 text-[11px] font-medium text-ink-secondary">
                  <Globe className="h-3 w-3 text-accent" aria-hidden="true" />
                  {contact.location}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-surface transition-opacity hover:opacity-85"
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {resolvedEmail && (
              <a
                href={`mailto:${resolvedEmail}`}
                className="inline-flex items-center gap-2 rounded-full border border-line-subtle px-5 py-3 font-mono text-xs text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
              >
                <Mail className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {resolvedEmail}
              </a>
            )}
          </div>
        </div>

        {/* Columns: identity, then the navigation groups, then the channels. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-t border-line py-10 sm:grid-cols-2 md:py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-baseline gap-2 text-lg font-semibold tracking-[-0.04em] text-ink transition-colors hover:text-accent"
            >
              {brandName}
              <span className="text-accent">.</span>
            </Link>
            {brand.korean && (
              <p lang="ko" className="mt-1 font-korean text-[11px] text-muted">
                {brand.korean}
              </p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {brand.role || 'Full-Stack Software Engineer & Product Designer'}
            </p>
            {brand.domain && (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {brand.domain}
              </p>
            )}
          </div>

          {navigation.footer.length > 0 && (
            <nav aria-label={uiStrings.footer.footerNavigation.en}>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                {uiStrings.footer.navigate.en}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navigation.footer.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-baseline gap-1.5 text-ink-secondary transition-colors hover:text-accent"
                    >
                      <span>{link.label}</span>
                      {link.kr && (
                        <span lang="ko" className="font-korean text-[10px] text-muted">
                          {link.kr}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {navigation.collections.length > 0 && (
            <nav aria-label={uiStrings.footer.footerCollections.en}>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                {uiStrings.footer.collections.en}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navigation.collections.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-baseline gap-1.5 text-ink-secondary transition-colors hover:text-accent"
                    >
                      <span>{link.label}</span>
                      {link.kr && (
                        <span lang="ko" className="font-korean text-[10px] text-muted">
                          {link.kr}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              {uiStrings.footer.elsewhere.en}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {resolvedSocials.map((social) => {
                const Icon = iconFor(social.kind, social.label)
                return (
                  <li key={`${social.label}-${social.href}`}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 text-ink-secondary transition-colors hover:text-accent"
                    >
                      <Icon
                        className="h-3.5 w-3.5 text-muted transition-colors group-hover:text-accent"
                        aria-hidden="true"
                      />
                      {social.label}
                    </a>
                  </li>
                )
              })}
              {contact.location && (
                <li className="inline-flex items-center gap-2 text-muted">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {contact.location}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div className="flex flex-col gap-4 border-t border-line py-6 text-[11px] font-mono uppercase tracking-[0.12em] text-muted md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {footer.copyrightName || brandName} &middot; All rights reserved
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {footer.canonical && <p>{footer.canonical}</p>}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle px-3 py-1.5 transition-colors hover:border-line-strong hover:text-accent"
            >
              Back to top
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Sign-off wordmark: bleeds off the bottom edge like a printed poster. */}
      <div className="relative overflow-hidden border-t border-line-subtle">
        <p aria-hidden="true" className="footer-wordmark pt-8 md:pt-10">
          {brandName}
          <span className="mark">.</span>
        </p>
      </div>
    </footer>
  )
}
