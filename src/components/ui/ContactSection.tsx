import Link from 'next/link'
import { ArrowUpRight, Github, Globe, Linkedin, Mail, MapPin } from 'lucide-react'
import ContactForm from '@/components/ContactForm'
import { LiveStatusPill } from '@/components/ui/LiveStatusPill'

export interface SocialLinkItem {
  id?: number | string
  label: string
  href: string
  handle?: string
  icon?: string
}

interface ContactSectionProps {
  eyebrow?: string
  title?: string
  accent?: string
  description?: string
  socialLinks?: SocialLinkItem[]
  email?: string
  location?: string
  timeZone?: string
  timezoneLabel?: string
  className?: string
}

function getSocialIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('git')) return Github
  if (l.includes('link')) return Linkedin
  if (l.includes('mail')) return Mail
  return Globe
}

export function ContactSection({
  eyebrow,
  title,
  accent,
  description,
  socialLinks = [],
  email,
  location,
  timeZone,
  timezoneLabel,
  className = '',
}: ContactSectionProps) {
  return (
    <section className={`contact-preview-section ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        {/* Left Column: Heading & Contact Channels */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
                {eyebrow}
              </span>
              <span className="font-korean text-[11px] text-muted">
                · 연락 및 협업
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold text-ink tracking-tight leading-tight">
              {title}{' '}
              <span className="font-normal text-accent">
                {accent}
              </span>
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted leading-relaxed max-w-xl font-normal">
              {description}
            </p>
          </div>

          {/* Live Nepal Clock & One-Click Copy Email Pill */}
          <div className="pt-1">
            <LiveStatusPill email={email} location={location} timeZone={timeZone} timezoneLabel={timezoneLabel} />
          </div>

          {/* Social Channels List with Apple Squircles */}
          <div className="space-y-3 pt-2 max-w-md">
            {socialLinks.map((link) => {
              const Icon = getSocialIcon(link.label)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-surface/80 border border-line-subtle hover:border-line-strong shadow-xs hover:shadow-sm text-ink transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-overlay text-accent flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wide text-muted font-medium">
                        {link.label}
                      </span>
                      <span className="font-semibold text-sm group-hover:text-accent transition-colors">
                        {link.handle || link.href}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )
            })}

            {location && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/80 border border-line-subtle shadow-xs text-ink">
              <span className="w-9 h-9 rounded-xl bg-overlay text-accent flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <span className="block text-[10px] uppercase tracking-wide text-muted font-medium">
                  Coordinates
                </span>
                <span className="text-sm text-ink font-semibold">{location}</span>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Form or Full Link */}
        <div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
