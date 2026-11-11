'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Image,
  Music,
  Inbox,
  Settings,
  HelpCircle,
  Search,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { CmsCommandPalette } from '@/components/admin/ui/CmsCommandPalette'
import { CmsModal } from '@/components/admin/ui/CmsModal'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  /** Optional deep link; falls back to /admin?section=<id>. */
  href?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'content', label: 'Content Records', icon: FileText },
      { id: 'projects', label: 'Projects', icon: FolderKanban },
      { id: 'setup', label: 'Content Setup', icon: CheckCircle2 },
      { id: 'appearance', label: 'Hero & Footer', icon: Sparkles },
    ],
  },
  {
    label: 'Portfolio & Media',
    items: [
      { id: 'gallery', label: 'Visual Gallery', icon: Image },
      {
        id: 'content',
        label: 'Media Library',
        icon: Music,
        href: '/admin?section=content&collection=Music',
      },
    ],
  },
  {
    label: 'Communications',
    items: [
      { id: 'inbox', label: 'Inbox & Mail', icon: Inbox, badge: 'New' },
    ],
  },
]

export default function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSection = searchParams.get('section') || 'overview'

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Close mobile nav on change
  useEffect(() => {
    setMobileNavOpen(false)
  }, [currentSection, pathname])

  // Keyboard shortcut ⌘K or / to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNavigate = (section: string) => {
    router.push(`/admin?section=${section}`)
  }

  const notifications: Array<{ id: number; title: string; desc: string; time: string; unread: boolean }> = []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Mobile Top Navigation */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle mobile menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-teal-600 text-inverse font-bold text-xs flex items-center justify-center">
              A
            </span>
            <span className="text-sm font-semibold text-slate-900">Studio CMS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <a
            href="https://ashokrimal.com.np"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md"
          >
            Live ↗
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop & Mobile Drawer Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
            mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Brand Section */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-inverse flex items-center justify-center font-bold text-sm tracking-tight group-hover:bg-teal-600 transition-colors shadow-xs">
                  AR
                </div>
                <div>
                  <h1 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    Ashok Rimal
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  </h1>
                  <p className="text-[10px] text-slate-400 font-medium">SaaS Content Studio</p>
                </div>
              </Link>

              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            {/* Accessible Quick Search Trigger Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="mt-3.5 w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search dashboard...</span>
              </span>
              <kbd className="text-[10px] font-mono text-slate-400 bg-surface px-1.5 py-0.2 rounded border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5" aria-label="Main sidebar navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <h3 className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </h3>
                <div className="space-y-0.5 mt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const href = item.href ?? `/admin?section=${item.id}`
                    const isActive = item.href
                      ? `${pathname}?${searchParams.toString()}` === item.href
                      : currentSection === item.id
                    return (
                      <Link
                        key={item.label}
                        href={href}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-teal-50/80 text-teal-900 font-semibold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-teal-600' : 'text-slate-400'
                            }`}
                          />
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Settings, Support & User Controls */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
            <Link
              href="/admin?section=settings"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentSection === 'settings'
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings
                  className={`w-4 h-4 shrink-0 ${
                    currentSection === 'settings' ? 'text-teal-600' : 'text-slate-400'
                  }`}
                />
                <span>Settings</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-surface transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Support &amp; Docs</span>
              </span>
              <kbd className="text-[10px] font-mono text-slate-400 bg-surface px-1 rounded border border-slate-200">
                ?
              </kbd>
            </button>

            {/* Profile User Card */}
            <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-teal-600 text-inverse font-bold text-xs flex items-center justify-center shrink-0">
                  AR
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">Ashok Rimal</p>
                  <Link href="/admin/account" className="text-[10px] text-slate-400 truncate hover:text-teal-700">
                    Owner account
                  </Link>
                </div>
              </div>

              <Link
                href="/admin/sign-out"
                title="Sign out"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden backdrop-blur-2xs"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar on Desktop */}
          <header className="hidden lg:flex sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-slate-200/80 px-8 py-3.5 items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/admin" className="hover:text-slate-800 font-medium">
                CMS Studio
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-slate-800 capitalize">
                {currentSection.replace('-', ' ')}
              </span>
            </div>

            {/* Actions & Live Links */}
            <div className="flex items-center gap-3">
              {/* Notification Popover Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-inverse" />
                </button>

                {/* Notification Dropdown Popover */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">Activity &amp; Notifications</span>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[11px] text-teal-700 hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-4 py-6 text-center text-[11px] text-slate-500">
                          No new activity.
                        </p>
                      )}
                      {notifications.map((n) => (
                        <div key={n.id} className="py-2.5 flex items-start gap-2.5 text-xs">
                          <div className="w-2 h-2 rounded-full bg-teal-500 mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800">{n.title}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{n.desc}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Live Portfolio Link */}
              <a
                href="https://ashokrimal.com.np"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-surface hover:bg-slate-50 transition-colors"
              >
                <span>Preview Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </header>

          {/* Primary Viewport Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CmsCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Support & Documentation Modal */}
      <CmsModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="CMS Help & Documentation"
        description="Guidelines for managing content, media feeds, and site configuration."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl text-teal-950">
            <h4 className="font-semibold">Zero-Downtime Public Site Sync</h4>
            <p className="mt-1 leading-relaxed">
              Every edit made in this dashboard writes to the database and revalidates Next.js cached pages automatically. Changes reflect on the public site immediately.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Keyboard Shortcuts</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Open Command Palette &amp; Search</span>
                <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">⌘K / Ctrl+K</kbd>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Close any open modal</span>
                <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd>
              </li>
              <li className="flex justify-between items-center py-1">
                <span>Toggle support modal</span>
                <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">?</kbd>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Integrations &amp; Feeds</h4>
            <p className="leading-relaxed">
              Connected APIs (ListenBrainz, Last.fm, GitHub, MyAnimeList, and AniList) cache for 30 minutes to stay within rate limits while keeping status widgets active.
            </p>
          </div>
        </div>
      </CmsModal>
    </div>
  )
}
