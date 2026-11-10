'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { ArrowUpRight, Clock, Github, Globe, Linkedin, Mail, MapPin } from 'lucide-react'
import ScrollObserver from '@/components/ScrollObserver'
import ContactForm from '@/components/ContactForm'
import ErrorBoundary from '@/components/ErrorBoundaryWrapper'
import { Loading } from '@/components/Loading'
import { useDevMode } from '@/contexts/DevModeContext'
import DevSection from '@/components/devmode/DevSection'
import { MetaChip, PageHero, PageNav, PageSection, PageShell } from '@/components/ui/PageChrome'

const PAGE_KEY = 'contact'
const DEFAULT_SECTIONS = ['intro', 'channel'] as const

type SectionId = (typeof DEFAULT_SECTIONS)[number]

interface SocialLink {
  label: string
  href: string
  handle?: string
}

interface ContactContentProps {
  profile?: Record<string, unknown>
  socialLinks?: SocialLink[]
}

function getChannelIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('git')) return Github
  if (l.includes('link')) return Linkedin
  if (l.includes('mail')) return Mail
  return Globe
}

function ContactSection({
  socialLinks = [],
  profile,
}: {
  socialLinks?: SocialLink[]
  profile?: Record<string, unknown>
}) {
  const location =
    typeof profile?.location === 'string' ? profile.location : 'Kathmandu & Butwal, Nepal'
  const availability =
    typeof profile?.availability === 'string'
      ? profile.availability
      : 'Available for select engineering opportunities'

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-start">
      <ContactForm />

      <div className="space-y-6">
        <aside className="apple-card p-6 md:p-7 space-y-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              Direct channels
            </p>
            <h2 className="mt-1 text-lg md:text-xl font-semibold text-ink tracking-tight">
              Connect <span className="text-accent">directly</span>
            </h2>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Prefer asynchronous communication? Use any channel below — every record is managed
              through the CMS.
            </p>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {socialLinks.map((link) => {
              const Icon = getChannelIcon(link.label)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-line-subtle bg-overlay-faint hover:border-line-medium text-ink transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[9px] uppercase tracking-wider text-muted">
                        {link.label}
                      </span>
                      <span className="block truncate font-semibold text-xs group-hover:text-accent transition-colors">
                        {link.handle || link.href}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )
            })}
          </div>
        </aside>

        <aside className="apple-card p-6 md:p-7">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Coordinates</p>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-4">
              <dt className="inline-flex items-center gap-1.5 text-muted">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                Location
              </dt>
              <dd className="font-semibold text-ink text-right">{location} · Remote friendly</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="inline-flex items-center gap-1.5 text-muted">
                <Clock className="w-3.5 h-3.5 text-accent" />
                Timezone
              </dt>
              <dd className="font-semibold text-ink text-right">NPT (UTC+5:45)</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted">Availability</dt>
              <dd className="font-medium text-accent text-right">{availability}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}

export default function ContactContent({ profile, socialLinks }: ContactContentProps) {
  const { mode, registerPageSections, getSectionOrder } = useDevMode()

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
      label="Intro"
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageHero
        eyebrow="Contact / Direct Channel"
        krEyebrow="연락처"
        title="Let's build something"
        accent="thoughtful."
        description="Open to software engineering roles, independent client builds, and open-source initiatives. Send a message or reach out across any channel."
        meta={
          <>
            <MetaChip icon={MapPin}>
              {typeof profile?.location === 'string' ? profile.location : 'Nepal'} · Remote friendly
            </MetaChip>
            <MetaChip icon={Clock}>NPT · UTC+5:45</MetaChip>
            <MetaChip icon={Mail}>Replies within a few days</MetaChip>
          </>
        }
      />
    </DevSection>
  )

  const channel = (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="channel"
      label="Channels"
      fallbackAccent="var(--accent-secondary)"
      className="pt-0"
    >
      <PageSection
        eyebrow="01 / Channels"
        krEyebrow="연결"
        title="Start a"
        accent="conversation."
        description="Use the form for project details, or jump straight to a direct channel."
      >
        <ContactSection socialLinks={socialLinks} profile={profile} />
      </PageSection>
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
          <PageNav backLabel="Return home" nextHref="/projects" nextLabel="Browse case studies" />
        </PageShell>
      </Suspense>
    </ErrorBoundary>
  )
}
