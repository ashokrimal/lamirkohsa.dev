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
  showForm?: boolean
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
  eyebrow = '06 / Direct Dispatch',
  title = "Let's build something",
  accent = 'thoughtful.',
  description = 'Open to software engineering roles, independent client contracts, and collaborative open-source builds.',
  socialLinks = [],
  showForm = true,
  className = '',
}: ContactSectionProps) {
  return (
    <section className={`contact-preview-section ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        {/* Left Column: Heading & Contact Channels */}
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
              {eyebrow}
            </p>
            <h2 className="text-3xl md:text-5xl font-normal text-[var(--ink)] tracking-[-0.05em] leading-tight">
              {title} <span className="font-serif italic text-[var(--accent)]">{accent}</span>
            </h2>
            <p className="mt-3 text-xs md:text-sm text-[var(--muted)] leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          {/* Live Nepal Clock & One-Click Copy Email Pill */}
          <div className="pt-1">
            <LiveStatusPill />
          </div>

          {/* Social Channels List */}
          <div className="space-y-2.5 pt-2 font-mono text-xs max-w-md">
            {socialLinks.map((link) => {
              const Icon = getSocialIcon(link.label)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xs border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] text-[var(--ink)] transition-colors group"
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

            <div className="flex items-center gap-2.5 p-3 rounded-xs border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-[var(--muted)]">
                  Coordinates
                </span>
                <span className="text-xs text-[var(--ink)] font-semibold">
                  Kathmandu &amp; Butwal, Nepal · Remote Friendly
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form or Full Link */}
        <div className="rounded-sm">
          {showForm ? (
            <ContactForm />
          ) : (
            <div className="p-8 rounded-sm border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <h3 className="text-xl font-normal text-[var(--ink)]">
                Have a project or opportunity in <span className="font-serif italic text-[var(--accent)]">mind?</span>
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Whether you want to discuss a full-time role, a contracting project, or exchange thoughts on architecture, I am always glad to connect.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xs bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[#435d4c] transition shadow-2xs"
              >
                <span>Open Communication Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
