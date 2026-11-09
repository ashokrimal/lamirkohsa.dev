'use client'

import { Suspense, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Github, Globe, Linkedin, Mail, MapPin, Terminal } from 'lucide-react'
import ScrollObserver from '@/components/ScrollObserver'
import ContactForm from '@/components/ContactForm'
import ErrorBoundary from '@/components/ErrorBoundaryWrapper'
import { Loading } from '@/components/Loading'
import { useDevMode } from '@/contexts/DevModeContext'
import DevSection from '@/components/devmode/DevSection'
import SkeletonReveal from '@/components/SkeletonReveal'

const PAGE_KEY = 'contact'
const DEFAULT_SECTIONS = ['intro', 'terminal', 'channel'] as const

type SectionId = (typeof DEFAULT_SECTIONS)[number]

const SECTION_ACCENTS: Record<SectionId, string> = {
  intro: '#52725d',
  terminal: '#17252b',
  channel: '#52725d',
}

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

function IntroSection() {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="intro"
      label="Intro"
      fallbackAccent={SECTION_ACCENTS.intro}
      className="text-center py-6"
    >
      <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-[var(--accent)]">
        Direct Communication Channel
      </p>
      <h1 className="mt-3 text-4xl md:text-6xl font-normal text-[var(--ink)] tracking-[-0.06em] leading-tight">
        Let&apos;s build something <span className="font-serif italic text-[var(--accent)]">thoughtful.</span>
      </h1>
      <p className="mt-4 text-sm md:text-base text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
        I&apos;m open to software engineering roles, independent client builds, or open-source initiatives. Send a message or reach out across any channel below.
      </p>
    </DevSection>
  )
}

function TerminalSection({ profile }: { profile?: Record<string, unknown> }) {
  const location = typeof profile?.location === 'string' ? profile.location : 'Kathmandu, Nepal'
  const availability = typeof profile?.availability === 'string' ? profile.availability : 'Available for select engineering opportunities'

  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="terminal"
      label="Terminal"
      fallbackAccent={SECTION_ACCENTS.terminal}
      className="relative overflow-hidden rounded-sm border border-[var(--line)] bg-[#131d22] text-[#f4f1eb]"
    >
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#24353d]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e26d5c]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e9c46a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#52725d]" />
            <span className="ml-3 font-mono text-xs text-[#8ca3af]">ashok@workstation — zsh</span>
          </div>
          <span className="font-mono text-[10px] text-[#6d8491] flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-[var(--accent)]" /> UTF-8
          </span>
        </div>

        <div className="font-mono text-xs md:text-sm leading-relaxed space-y-2 text-[#dce5e0]">
          <p className="text-[#8ca3af]"># Developer coordinates &amp; status</p>
          <p>
            <span className="text-[var(--accent)] font-semibold">ashok@dev</span>
            <span className="text-[#6d8491]">:~</span>$ curl -s https://ashokrimal.com.np/status
          </p>
          <div className="p-3 rounded-xs bg-[#0c1316] border border-[#1e2d33] text-[11px] text-[#b8c9c0] space-y-1">
            <p>• Status: {availability}</p>
            <p>• Location: {location} · Remote Friendly</p>
            <p>• Focus: Next.js, TypeScript, React Native, Full-Stack Architecture</p>
          </div>
        </div>
      </div>
    </DevSection>
  )
}

function ChannelSection({
  socialLinks = [],
  profile,
}: {
  socialLinks?: SocialLink[]
  profile?: Record<string, unknown>
}) {
  return (
    <DevSection
      pageKey={PAGE_KEY}
      sectionId="channel"
      label="Channels"
      fallbackAccent={SECTION_ACCENTS.channel}
      className="py-6"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-start">
        {/* Form */}
        <div>
          <ContactForm />
        </div>

        {/* Aside / Direct Links */}
        <aside className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-6 space-y-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
              Direct Channels
            </p>
            <h2 className="mt-1 text-lg font-normal text-[var(--ink)]">
              Connect <span className="font-serif italic text-[var(--accent)]">directly</span>
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
              If you prefer asynchronous communication or direct email, feel free to use the links below. Managed via CMS.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {socialLinks.map((link) => {
              const Icon = getChannelIcon(link.label)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xs border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--accent)] text-[var(--ink)] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-[var(--muted)]">
                        {link.label}
                      </span>
                      <span className="font-semibold text-xs group-hover:text-[var(--accent)]">
                        {link.handle || link.href}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )
            })}

            {/* Location */}
            <div className="flex items-center gap-2.5 p-3 rounded-xs border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-[var(--muted)]">
                  Coordinates
                </span>
                <span className="text-xs text-[var(--ink)]">
                  {typeof profile?.location === 'string' ? profile.location : 'Kathmandu & Butwal, Nepal'} · Remote Friendly
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DevSection>
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
      (DEFAULT_SECTIONS as readonly string[]).includes(section as SectionId)
    )
    return filtered.length ? filtered : [...DEFAULT_SECTIONS]
  }, [getSectionOrder])

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <SkeletonReveal variant="cards">
          <main className="contact-page shell-width py-12 md:py-20">
            <ScrollObserver />
            <div className="space-y-8">
              {mode === 'classic' ? (
                <>
                  <IntroSection />
                  <TerminalSection profile={profile} />
                  <ChannelSection socialLinks={socialLinks} profile={profile} />
                </>
              ) : (
                orderedSections.map((sectionId) => {
                  if (sectionId === 'intro') return <IntroSection key={sectionId} />
                  if (sectionId === 'terminal') return <TerminalSection key={sectionId} profile={profile} />
                  if (sectionId === 'channel') return <ChannelSection key={sectionId} socialLinks={socialLinks} profile={profile} />
                  return null
                })
              )}
            </div>
          </main>
        </SkeletonReveal>
      </Suspense>
    </ErrorBoundary>
  )
}
