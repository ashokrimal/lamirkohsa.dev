import Link from 'next/link'
import { ArrowUpRight, Github, Globe, Linkedin, Mail, Twitter } from 'lucide-react'
import type {
  ContactDetails,
  SiteBrand,
  SiteFooterConfig,
  SiteNavigation,
} from '@/lib/site-content'
import { SITE_NAME } from '@/lib/seo'
import { uiStrings } from '@/lib/ui-strings'

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
  const hasContactCard = Boolean(resolvedAvailability || footer.ctaLabel)

  return (
    <footer className="mt-20 md:mt-28 border-t border-line bg-surface">
      <div className="shell-width py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr] gap-10 md:gap-12">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-baseline gap-2 text-base font-semibold tracking-[-0.04em] text-ink hover:text-accent transition-colors"
            >
              {brand.name || SITE_NAME}
              <span className="text-accent">.</span>
              {brand.korean && (
                <span lang="ko" className="font-korean text-[11px] font-normal text-muted">
                  {brand.korean}
                </span>
              )}
            </Link>

            {footer.tagline && (
              <p className="mt-3 text-sm text-muted leading-relaxed">{footer.tagline}</p>
            )}

            {resolvedSocials.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {resolvedSocials.map((social) => {
                  const Icon = iconFor(social.kind, social.label)
                  return (
                    <a
                      key={`${social.label}-${social.href}`}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="p-2 rounded-full border border-line-subtle bg-overlay text-muted hover:text-accent hover:border-line-medium transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {navigation.footer.length > 0 && (
            <nav aria-label={uiStrings.footer.footerNavigation.en}>
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                {uiStrings.footer.navigate.en}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navigation.footer.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-baseline gap-1.5 text-ink-secondary hover:text-accent transition-colors"
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
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                {uiStrings.footer.collections.en}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navigation.collections.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-baseline gap-1.5 text-ink-secondary hover:text-accent transition-colors"
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

          {hasContactCard && (
            <div>
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                {uiStrings.footer.elsewhere.en}
              </h2>
              <div className="mt-4 apple-card p-5">
                {footer.availabilityLabel && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                    {footer.availabilityLabel}
                  </p>
                )}
                {resolvedAvailability && (
                  <p className="mt-2 text-sm text-ink leading-relaxed">{resolvedAvailability}</p>
                )}
                {footer.ctaLabel && footer.ctaHref && (
                  <Link
                    href={footer.ctaHref}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    {footer.ctaLabel}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell-width py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.12em] text-muted">
          <p>
            &copy; {year} {footer.copyrightName || brand.name || SITE_NAME}
          </p>
          {footer.canonical && <p className="text-center">{footer.canonical}</p>}
          {resolvedEmail && (
            <a href={`mailto:${resolvedEmail}`} className="hover:text-accent transition-colors">
              {resolvedEmail}
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
