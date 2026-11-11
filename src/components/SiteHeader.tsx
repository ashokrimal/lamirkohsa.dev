'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Volume2, VolumeX } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'
import type { ContactDetails, SiteBrand, SiteNavigation } from '@/lib/site-content'
import { uiStrings } from '@/lib/ui-strings'

export default function SiteHeader({
  brand,
  navigation,
  contact,
}: {
  brand: SiteBrand
  navigation: SiteNavigation
  contact: ContactDetails
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [localTime, setLocalTime] = useState<string>('')
  const [isMuted, setIsMuted] = useState(false)
  const pathname = usePathname()

  const navLinks = navigation.primary

  // Reflect the stored sound preference, not just the in-session toggle
  useEffect(() => {
    setIsMuted(!sensoryAudio.isEnabled())
  }, [])

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  useEffect(() => {
    if (!contact.timeZone) return
    const updateTime = () => {
      try {
        setLocalTime(
          new Intl.DateTimeFormat('en-US', {
            timeZone: contact.timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(new Date()),
        )
      } catch {
        setLocalTime('')
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [contact.timeZone])

  const handleNavClick = () => {
    sensoryAudio.playClick()
    setIsOpen(false)
  }

  const toggleSound = () => {
    // toggle() returns whether audio is now ENABLED; the icon reflects mute state
    setIsMuted(!sensoryAudio.toggle())
  }

  return (
    <header className="fixed top-0 inset-x-0 w-full z-50 glass-nav transition-all duration-300">
      <nav
        className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-14 flex items-center justify-between"
        aria-label={uiStrings.nav.primary.en}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <span className="font-semibold text-[15px] tracking-tight text-ink group-hover:text-accent transition-colors">
              {brand.name}
            </span>
            {brand.korean && (
              <span lang="ko" className="text-[11px] font-korean text-muted tracking-normal font-normal">
                {brand.korean}
              </span>
            )}
          </Link>

          {contact.timeZone && (
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-overlay text-[11px] text-ink-secondary border border-line-faint">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">
                {contact.timeZone ? `${contact.timeZone} ` : ''}
                {localTime}
              </span>
              {contact.availability && (
                <>
                  <span className="text-scrim/20">·</span>
                  <span lang="ko" className="font-korean text-muted">
                    {contact.availability}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => {
            const active = isCurrent(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => sensoryAudio.playClick()}
                className={`flex items-baseline gap-1 text-[13px] font-medium tracking-tight transition-all duration-200 ${
                  active ? 'text-accent font-semibold' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <span>{link.label}</span>
                {link.kr && (
                  <span lang="ko" className="text-[10px] font-korean text-muted opacity-75 font-normal">
                    {link.kr}
                  </span>
                )}
                {active && <span className="inline-block w-1 h-1 rounded-full bg-accent ml-0.5" />}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-overlay hover:bg-overlay-medium text-muted hover:text-ink transition-all cursor-pointer"
            title={isMuted ? uiStrings.nav.unmuteSound.en : uiStrings.nav.muteSound.en}
            aria-label={uiStrings.nav.toggleSound.en}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-overlay text-muted"
            aria-label={uiStrings.nav.toggleAudio.en}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              sensoryAudio.playToggle()
              setIsOpen((open) => !open)
            }}
            className="p-2 rounded-full bg-overlay-soft text-ink transition-transform active:scale-90"
            aria-expanded={isOpen}
            aria-label={isOpen ? uiStrings.nav.closeMenu.en : uiStrings.nav.openMenu.en}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`mobile-menu fixed inset-0 z-[100] w-full p-6 md:hidden flex flex-col justify-between ${
          isOpen ? 'open' : ''
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-line-subtle">
            <div>
              <span className="text-sm font-semibold tracking-tight text-ink">{brand.name}</span>
              {brand.korean && (
                <p lang="ko" className="text-[11px] font-korean text-muted">
                  {brand.korean}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-overlay-soft text-ink"
              aria-label={uiStrings.nav.closeMenu.en}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ul className="mt-8 space-y-4">
            {navLinks.map((link) => {
              const active = isCurrent(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={handleNavClick}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      active ? 'bg-accent text-inverse font-medium shadow-sm' : 'text-ink hover:bg-overlay'
                    }`}
                  >
                    <span className="text-lg tracking-tight font-medium">{link.label}</span>
                    {link.kr && (
                      <span
                        lang="ko"
                        className={`text-xs font-korean ${active ? 'text-inverse/80' : 'text-muted'}`}
                      >
                        {link.kr}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {(contact.location || contact.availability) && (
          <div className="pt-6 border-t border-line-subtle text-xs text-muted space-y-2">
            {contact.timeZone && (
              <div className="flex items-center justify-between">
                <span>{uiStrings.nav.localTime.en}</span>
                <span className="font-semibold text-ink">{localTime || contact.timeZone}</span>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center justify-between">
                <span>{uiStrings.nav.location.en}</span>
                <span className="font-semibold text-ink">{contact.location}</span>
              </div>
            )}
            {contact.availability && (
              <div className="flex items-center justify-between">
                <span>{uiStrings.nav.availability.en}</span>
                <span lang="ko" className="font-medium text-emerald-600 font-korean">
                  {contact.availability}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
