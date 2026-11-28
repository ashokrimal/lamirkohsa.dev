'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useSyncExternalStore } from 'react'
import { ArrowLeft, Menu, X } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'
import {
  getSubpageChrome,
  getSubpageChromeOnServer,
  subscribeSubpageChrome,
} from '@/lib/page-chrome'
import type { ContactDetails, SiteBrand, SiteNavigation } from '@/lib/site-content'
import { SITE_NAME } from '@/lib/seo'
import { useUiStrings } from '@/components/ui/UiCopyProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { InstallAppButton } from '@/components/ui/InstallAppButton'

export default function SiteHeader({
  brand,
  navigation,
  contact,
}: {
  brand: SiteBrand
  navigation: SiteNavigation
  contact: ContactDetails
}) {
  const uiStrings = useUiStrings()
  const [isOpen, setIsOpen] = useState(false)
  const [localTime, setLocalTime] = useState<string>('')
  const pathname = usePathname()
  const subpageChrome = useSyncExternalStore(
    subscribeSubpageChrome,
    getSubpageChrome,
    getSubpageChromeOnServer,
  )

  const navLinks = navigation.primary
  // Nested routes (a page of a page) swap the navigation for their own title,
  // so the back link stays reachable wherever the reader has scrolled to.
  const isNestedRoute = pathname.split('/').filter(Boolean).length >= 2
  const subpage = isNestedRoute ? subpageChrome : null

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

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleNavClick = () => {
    sensoryAudio.playClick()
    setIsOpen(false)
  }

  return (
    <>
      {subpage && (
        <header className="fixed top-0 inset-x-0 w-full z-50 glass-nav">
          <nav
            className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-14 flex items-center gap-3"
            aria-label={subpage.title}
          >
            <Link
              href={subpage.backHref}
              onClick={handleNavClick}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-subtle bg-overlay-faint px-3 py-1.5 text-[11px] font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              <span>{subpage.backLabel}</span>
            </Link>

            <span className="hidden h-4 w-px shrink-0 bg-line-subtle sm:block" aria-hidden="true" />

            <p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-ink">
              {subpage.title}
            </p>

            <div className="hidden items-center gap-2 md:flex">
              <InstallAppButton />
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
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
        </header>
      )}

      {!subpage && (
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
                {brand.name || SITE_NAME}
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

            <InstallAppButton />
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
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
      </header>
      )}

      <div
        id="mobile-navigation"
        aria-hidden={!isOpen}
        className={`mobile-menu fixed inset-0 z-[100] h-[100dvh] w-full overflow-y-auto px-5 py-6 md:hidden flex flex-col justify-between ${
          isOpen ? 'open' : ''
        }`}
      >
        <div className="w-full">
          <div className="flex items-center justify-between pb-4 border-b border-line-subtle">
            <div>
              <span className="text-sm font-semibold tracking-tight text-ink">{brand.name || SITE_NAME}</span>
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

          <ul className="mt-6 w-full space-y-2">
            {navLinks.map((link) => {
              const active = isCurrent(link.href)
              return (
                <li key={link.href} className="w-full">
                  <Link
                    href={link.href}
                    onClick={handleNavClick}
                    className={`flex w-full items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
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

          <div className="mt-5 w-full">
            <InstallAppButton className="w-full justify-center py-2.5 text-xs" />
          </div>
        </div>

        {(contact.location || contact.availability || contact.timeZone) && (
          <div className="mt-8 w-full pt-6 border-t border-line-subtle text-xs text-muted space-y-2">
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
    </>
  )
}
