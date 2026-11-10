'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'

const navLinks = [
  { href: '/', label: 'Home', kr: '홈' },
  { href: '/about', label: 'About', kr: '소개' },
  { href: '/projects', label: 'Projects', kr: '작업' },
  { href: '/media', label: 'Media', kr: '미디어' },
  { href: '/contact', label: 'Contact', kr: '연락처' },
]

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [nepalTime, setNepalTime] = useState<string>('')
  const [isMuted, setIsMuted] = useState(false)
  const pathname = usePathname()

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  useEffect(() => {
    const updateTime = () => {
      try {
        const d = new Date()
        setNepalTime(
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kathmandu',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(d)
        )
      } catch {}
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleNavClick = () => {
    sensoryAudio.playClick()
    setIsOpen(false)
  }

  const toggleSound = () => {
    const muted = sensoryAudio.toggleMute()
    setIsMuted(muted)
  }

  return (
    <header className="fixed top-0 inset-x-0 w-full z-50 glass-nav transition-all duration-300">
      <nav
        className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-14 flex items-center justify-between"
        aria-label="Global Apple-style navigation"
      >
        {/* Brand with Korean Tenztan-style Accent */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <span className="font-semibold text-[15px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
              Ashok Rimal
            </span>
            <span className="text-[11px] font-korean text-[#86868b] tracking-normal font-normal">
              아쇼크 리말
            </span>
          </Link>

          {/* Apple Live Availability Capsule */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] text-[11px] text-[#424245] border border-black/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">NPT {nepalTime || 'UTC+5:45'}</span>
            <span className="text-black/20">·</span>
            <span className="font-korean text-[#86868b]">가용</span>
          </div>
        </div>

        {/* Full Width Desktop Navigation — NO HAMBURGER ON DESKTOP */}
        <div className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => {
            const active = isCurrent(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => sensoryAudio.playClick()}
                className={`flex items-baseline gap-1 text-[13px] font-medium tracking-tight transition-all duration-200 ${
                  active
                    ? 'text-[#0071e3] font-semibold'
                    : 'text-[#424245] hover:text-[#1d1d1f]'
                }`}
              >
                <span>{link.label}</span>
                <span className="text-[10px] font-korean text-[#86868b] opacity-75 font-normal">
                  {link.kr}
                </span>
                {active && (
                  <span className="inline-block w-1 h-1 rounded-full bg-[#0071e3] ml-0.5" />
                )}
              </Link>
            )
          })}

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#86868b] hover:text-[#1d1d1f] transition-all cursor-pointer"
            title={isMuted ? 'Unmute Sensory UI Audio' : 'Mute Sensory UI Audio'}
            aria-label="Toggle sensory sound effects"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Mobile-Only Hamburger Toggle (Hidden on md, lg, xl, 2xl) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-black/[0.04] text-[#86868b]"
            aria-label="Toggle audio"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              sensoryAudio.playToggle()
              setIsOpen((open) => !open)
            }}
            className="p-2 rounded-full bg-black/[0.05] text-[#1d1d1f] transition-transform active:scale-90"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Only for phones < 768px) */}
      <div
        id="mobile-navigation"
        className={`mobile-menu fixed inset-y-0 right-0 z-50 w-[min(88vw,340px)] p-6 md:hidden shadow-2xl flex flex-col justify-between ${
          isOpen ? 'open' : ''
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
            <div>
              <span className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
                Ashok Rimal
              </span>
              <p className="text-[11px] font-korean text-[#86868b]">아쇼크 리말 · 메뉴</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-black/[0.05] text-[#1d1d1f]"
              aria-label="Close menu"
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
                      active
                        ? 'bg-[#0071e3] text-white font-medium shadow-sm'
                        : 'text-[#1d1d1f] hover:bg-black/[0.04]'
                    }`}
                  >
                    <span className="text-lg tracking-tight font-medium">{link.label}</span>
                    <span
                      className={`text-xs font-korean ${
                        active ? 'text-white/80' : 'text-[#86868b]'
                      }`}
                    >
                      {link.kr}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Mobile Drawer Footer with Apple Status */}
        <div className="pt-6 border-t border-black/[0.06] text-xs text-[#86868b] space-y-2">
          <div className="flex items-center justify-between">
            <span>Local Time:</span>
            <span className="font-semibold text-[#1d1d1f]">Nepal {nepalTime || 'NPT'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Availability:</span>
            <span className="font-medium text-emerald-600 font-korean">협업 가능 (Available)</span>
          </div>
        </div>
      </div>
    </header>
  )
}
