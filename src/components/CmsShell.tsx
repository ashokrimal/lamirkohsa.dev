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
  Film,
  BookOpen,
  GraduationCap,
  Globe2,
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
  LogOut,
  ShieldCheck,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
} from 'lucide-react'
import { CmsCommandPalette } from '@/components/admin/ui/CmsCommandPalette'
import { CmsModal } from '@/components/admin/ui/CmsModal'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  href?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Command',
    items: [
      { id: 'overview', label: 'Studio overview', icon: LayoutDashboard, href: '/admin' },
      { id: 'inbox', label: 'Inbox & mail', icon: Inbox, href: '/admin/inbox', badge: 'New' },
    ],
  },
  {
    label: 'Content vaults',
    items: [
      { id: 'music', label: 'Music', icon: Music, href: '/admin/music' },
      { id: 'gallery', label: 'Gallery', icon: Image, href: '/admin/gallery' },
      { id: 'media', label: 'Media', icon: Film, href: '/admin/media' },
      { id: 'blogs', label: 'Blogs & writing', icon: BookOpen, href: '/admin/blogs' },
      { id: 'projects', label: 'Projects & code', icon: FolderKanban, href: '/admin/projects' },
      { id: 'career', label: 'Career', icon: GraduationCap, href: '/admin/career' },
    ],
  },
  {
    label: 'Studio',
    items: [
      { id: 'meta', label: 'About & meta', icon: Globe2, href: '/admin/meta' },
      { id: 'appearance', label: 'Hero & footer', icon: Sparkles, href: '/admin?section=appearance' },
      { id: 'setup', label: 'Content setup', icon: CheckCircle2, href: '/admin?section=setup' },
      { id: 'content', label: 'All records', icon: FileText, href: '/admin?section=content' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/admin?section=settings' },
    ],
  },
]

const mobileNavItems: NavItem[] = [
  { id: 'overview', label: 'Home', icon: LayoutDashboard, href: '/admin' },
  { id: 'music', label: 'Music', icon: Music, href: '/admin/music' },
  { id: 'gallery', label: 'Gallery', icon: Image, href: '/admin/gallery' },
  { id: 'media', label: 'Media', icon: Film, href: '/admin/media' },
]

export default function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const search = searchParams.toString()

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem('studio-sidebar') === 'collapsed')
    } catch {
      // Storage can be unavailable in private browsing.
    }
  }, [])

  // Close the drawer after a route or query change.
  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname, search])

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

  function hrefFor(item: NavItem) {
    return item.href ?? `/admin?section=${item.id}`
  }

  function isActive(item: NavItem) {
    const [path, query] = hrefFor(item).split('?')
    if (query) return pathname === path && search === query
    return pathname === path
  }

  const activeItem = navGroups.flatMap((group) => group.items).find(isActive)
  const currentLabel = activeItem?.label ?? pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Studio'

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      window.localStorage.setItem('studio-sidebar', next ? 'collapsed' : 'open')
    } catch {
      // Ignore storage failures.
    }
  }

  const handleNavigate = (section: string) => {
    router.push(`/admin?section=${section}`)
  }

  return (
    <div className="studio-vault-admin flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-xs font-bold text-white">A</span>
            <span className="text-sm font-semibold text-slate-900">Studio Vaults</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <a
            href="https://ashokrimal.com.np"
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
          >
            Live ↗
          </a>
        </div>
      </header>

      <div className="relative flex w-full flex-1">
        <aside
          className={`fixed left-0 top-0 z-40 flex h-screen w-72 shrink-0 flex-col justify-between border-r border-slate-200/90 bg-white transition-all duration-300 ease-in-out lg:sticky ${
            collapsed ? 'lg:w-20' : 'lg:w-64'
          } ${mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="border-b border-slate-100 p-3.5">
            <div className={`flex items-center gap-2 ${collapsed ? 'lg:justify-between' : 'justify-between'}`}>
              <Link href="/admin" className="flex min-w-0 items-center gap-2.5 group">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold tracking-tight text-white shadow-xs transition-colors group-hover:bg-teal-600">
                  AR
                </div>
                <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                  <h1 className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-slate-900">
                    Ashok Rimal
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                  </h1>
                  <p className="text-[10px] font-medium text-slate-400">Studio &amp; Vault</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:inline-flex"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className={`mt-3 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-100 ${
                collapsed ? 'hidden lg:flex lg:justify-center lg:px-0' : 'flex'
              }`}
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span className={collapsed ? 'lg:hidden' : ''}>Search dashboard…</span>
              </span>
              <kbd className={`rounded border border-slate-200 bg-white px-1.5 text-[10px] font-mono text-slate-400 shadow-2xs ${collapsed ? 'lg:hidden' : ''}`}>
                ⌘K
              </kbd>
            </button>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-3" aria-label="Main sidebar navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <h3 className={`px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${collapsed ? 'lg:hidden' : ''}`}>
                  {group.label}
                </h3>
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item)
                    return (
                      <Link
                        key={`${group.label}-${item.label}`}
                        href={hrefFor(item)}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          collapsed ? 'lg:justify-center lg:px-0' : ''
                        } ${
                          active
                            ? 'bg-teal-50/80 font-semibold text-teal-900 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                        {item.badge && (
                          <span className={`ml-auto rounded-full bg-teal-100 px-1.5 py-0.2 text-[10px] font-semibold text-teal-800 ${collapsed ? 'lg:hidden' : ''}`}>
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

          <div className="space-y-1 border-t border-slate-100 bg-slate-50/50 p-2.5">
            <Link
              href="/admin/account"
              title={collapsed ? 'Account' : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 ${
                collapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
              <span className={collapsed ? 'lg:hidden' : ''}>Owner account</span>
            </Link>

            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              title={collapsed ? 'Support & docs' : undefined}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 ${
                collapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-slate-400" />
              <span className={collapsed ? 'lg:hidden' : ''}>Support &amp; docs</span>
            </button>

            <div className={`mt-2 flex items-center gap-2 border-t border-slate-200/60 px-2 pt-2 ${collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">AR</div>
                <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
                  <p className="truncate text-xs font-semibold text-slate-800">Ashok Rimal</p>
                  <p className="truncate text-[10px] text-slate-400">Owner account</p>
                </div>
              </div>
              <Link
                href="/admin/sign-out"
                title="Sign out"
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </aside>

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-2xs lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-slate-200/80 bg-white/95 px-8 py-3.5 backdrop-blur-md lg:flex">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/admin" className="font-medium hover:text-slate-800">
                Studio &amp; Vault
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-semibold capitalize text-slate-800">{currentLabel}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  aria-label="View notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-80 animate-in rounded-xl border border-slate-200 bg-white p-3 shadow-xl fade-in-0 zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                      <span className="font-semibold text-slate-800">Activity &amp; notifications</span>
                      <button type="button" onClick={() => setNotificationsOpen(false)} className="text-[11px] text-teal-700 hover:underline">
                        Close
                      </button>
                    </div>
                    <p className="px-4 py-6 text-center text-[11px] text-slate-500">No new activity.</p>
                  </div>
                )}
              </div>

              <a
                href="https://ashokrimal.com.np"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>Preview site</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">{children}</main>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Mobile vault navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.label}
                href={hrefFor(item)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition-colors ${
                  active ? 'text-teal-700' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-teal-600' : ''}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold text-slate-400 hover:text-slate-700"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <CmsCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      <CmsModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="Studio help & documentation"
        description="How the vaults, uploads and publishing flow work."
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="rounded-xl border border-teal-200/60 bg-teal-50/70 p-3 text-teal-950">
            <h4 className="font-semibold">Domain-isolated publishing</h4>
            <p className="mt-1 leading-relaxed">
              Each vault writes to its own CMS collection and revalidates the public pages automatically. Drafts stay out of the public site.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-slate-900">Keyboard shortcuts</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center justify-between border-b border-slate-100 py-1">
                <span>Open command palette</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">⌘K / Ctrl+K</kbd>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>Close any open modal</span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-slate-900">Uploads</h4>
            <p className="leading-relaxed">
              Images and music require Blob storage. Without it, paste a public URL instead. Gallery and media dropzones create drafts with automatic thumbnails.
            </p>
          </div>
        </div>
      </CmsModal>
    </div>
  )
}
