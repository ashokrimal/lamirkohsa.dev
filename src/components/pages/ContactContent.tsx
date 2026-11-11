'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { ArrowUpRight, Clock, Github, Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import ScrollObserver from '@/components/ScrollObserver'
import ContactForm from '@/components/ContactForm'
import ErrorBoundary from '@/components/ErrorBoundaryWrapper'
import { Loading } from '@/components/Loading'
import { useDevMode } from '@/contexts/DevModeContext'
import DevSection from '@/components/devmode/DevSection'
import { MetaChip, PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'
import { CmsErrorState } from '@/components/ui/CmsState'
import { EmptyState } from '@/components/ui/EmptyState'
import { uiStrings } from '@/lib/ui-strings'
import type { ContactDetails, PageCopy, SiteSocial } from '@/lib/site-content'

const PAGE_KEY = 'contact'
const DEFAULT_SECTIONS = ['intro', 'channel'] as const

type SectionId = (typeof DEFAULT_SECTIONS)[number]

interface ContactContentProps {
  copy?: PageCopy
  contact: ContactDetails
  socials: SiteSocial[]
  error?: string
}

function iconFor(label: string) {
  const key = label.toLowerCase()
  if (key.includes('git')) return Github
  if (key.includes('link')) return Linkedin
  if (key.includes('mail')) return Mail
  return Globe
}

function ChannelSection({
  copy,
  contact,
  socials,
  error,
}: {
  copy?: PageCopy
  contact: ContactDetails
  socials: SiteSocial[]
  error?: string
}) {
  const channels = copy?.sections?.channels
  const formEnabled = contact.formEnabled !== false
  const hasChannels = Boolean(contact.email || contact.phone || socials.length > 0)
  const hasContactMethod = hasChannels || formEnabled

  if (error) return <CmsErrorState message={error} />

  if (!hasContactMethod) {
    return <EmptyState icon={Mail} message={uiStrings.contact.noMethod.en} />
  }

  return (
    <div
      className={
        formEnabled
          ? 'grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-start'
          : 'grid gap-6'
      }
    >
      {formEnabled && <ContactForm responseTime={contact.responseTime} />}

      <div className="space-y-6">
        {hasChannels && (
          <aside className="apple-card p-6 md:p-7 space-y-5">
            <div>
              {channels?.eyebrow && (
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                  {channels.eyebrow}
                </p>
              )}
              {(channels?.title || channels?.accent) && (
                <h2 className="mt-1 text-lg md:text-xl font-semibold text-ink tracking-tight">
                  {channels?.title}{' '}
                  {channels?.accent && <span className="text-accent">{channels.accent}</span>}
                </h2>
              )}
              {channels?.description && (
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{channels.description}</p>
              )}
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-line-subtle bg-overlay-faint hover:border-line-medium text-ink transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-accent shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[9px] uppercase tracking-wider text-muted">
                        {uiStrings.contact.emailLabel.en}
                      </span>
                      <span className="block truncate font-semibold text-xs group-hover:text-accent transition-colors">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}

              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-line-subtle bg-overlay-faint hover:border-line-medium text-ink transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[9px] uppercase tracking-wider text-muted">
                        {uiStrings.contact.phoneLabel.en}
                      </span>
                      <span className="block truncate font-semibold text-xs group-hover:text-accent transition-colors">
                        {contact.phone}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}

              {socials.map((social) => {
                const Icon = iconFor(social.label)
                return (
                  <a
                    key={`${social.label}-${social.href}`}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-line-subtle bg-overlay-faint hover:border-line-medium text-ink transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[9px] uppercase tracking-wider text-muted">
                          {social.label}
                        </span>
                        <span className="block truncate font-semibold text-xs group-hover:text-accent transition-colors">
                          {social.href.replace(/^mailto:/, '')}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )
              })}
            </div>
          </aside>
        )}

        {(contact.location || contact.timeZone || contact.availability) && (
          <aside className="apple-card p-6 md:p-7">
            {copy?.sections?.coordinates?.title && (
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                {copy.sections.coordinates.title}
              </p>
            )}
            <dl className="mt-4 space-y-3 text-xs">
              {contact.location && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    {uiStrings.contact.locationLabel.en}
                  </dt>
                  <dd className="font-semibold text-ink text-right">{contact.location}</dd>
                </div>
              )}
              {contact.timeZone && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {uiStrings.contact.timezoneLabel.en}
                  </dt>
                  <dd className="font-semibold text-ink text-right">{contact.timeZone}</dd>
                </div>
              )}
              {contact.availability && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">{uiStrings.contact.availabilityLabel.en}</dt>
                  <dd className="font-medium text-accent text-right">{contact.availability}</dd>
                </div>
              )}
            </dl>
          </aside>
        )}
      </div>
    </div>
  )
}

export default function ContactContent({ copy, contact, socials, error }: ContactContentProps) {
  const { mode, registerPageSections, getSectionOrder } = useDevMode()
  const sections = copy?.sections

  useEffect(() => {
    registerPageSections(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[])
  }, [registerPageSections])

  const orderedSections = useMemo(() => {
    const sections = getSectionOrder(PAGE_KEY, DEFAULT_SECTIONS as unknown as string[])
    const filtered = sections.filter((section): section is SectionId =>
      (DEFAULT_SECTIONS as readonly string[]).includes(section as SectionId),
    )
    return filtered.length ? filtered : [...DEFAULT_SECTIONS]
  }, [getSectionOrder])

  const intro = (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="intro"
      label={copy?.eyebrow ?? ''}
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageHero
        eyebrow={copy?.eyebrow ?? ''}
        krEyebrow={copy?.krEyebrow}
        title={copy?.title ?? ''}
        accent={copy?.accent}
        description={copy?.description}
        meta={
          contact.location || contact.availability ? (
            <>
              {contact.location && <MetaChip icon={MapPin}>{contact.location}</MetaChip>}
              {contact.timeZone && <MetaChip icon={Clock}>{contact.timeZone}</MetaChip>}
              {contact.availability && <MetaChip>{contact.availability}</MetaChip>}
            </>
          ) : undefined
        }
      />
    </DevSection>
  )

  const channel = (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="channel"
      label={sections?.channels?.eyebrow ?? ''}
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      {sections?.channels?.title && (
        <PageSection
          number={0}
          eyebrow={sections.channels.eyebrow}
          krEyebrow={sections.channels.krEyebrow}
          title={sections.channels.title}
          accent={sections.channels.accent}
          description={sections.channels.description}
        >
          <ChannelSection copy={copy} contact={contact} socials={socials} error={error} />
        </PageSection>
      )}
      {!sections?.channels?.title && (
        <ChannelSection copy={copy} contact={contact} socials={socials} error={error} />
      )}
    </DevSection>
  )

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <PageShell>
          <ScrollObserver />
          <div className="space-y-16 md:space-y-24">
            {mode === 'classic' ? (
              <>
                {intro}
                {channel}
              </>
            ) : (
              orderedSections.map((sectionId) => (
                <div key={sectionId}>{sectionId === 'intro' ? intro : channel}</div>
              ))
            )}
          </div>
          <PageNav />
        </PageShell>
      </Suspense>
    </ErrorBoundary>
  )
}
