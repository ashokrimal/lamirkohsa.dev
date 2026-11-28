'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass,
  Disc3,
  FolderGit2,
  Home,
  Mail,
  User,
  type LucideIcon,
} from 'lucide-react'
import type { SiteNavigation } from '@/lib/site-content'
import { useAppShellState } from '@/lib/app-shell'

const ROUTE_ICONS: Record<string, LucideIcon> = {
  '/': Home,
  '/about': User,
  '/media': Disc3,
  '/projects': FolderGit2,
  '/contact': Mail,
}

function iconForRoute(route: string) {
  return ROUTE_ICONS[route] ?? Compass
}

/**
 * Bottom tab bar for the installed app layout.
 *
 * Only rendered when the visitor chose the app layout from an installed app,
 * and only below the `xl` breakpoint, so phones and iPads get tabs while a
 * desktop window keeps the top navigation. The tabs mirror the CMS-managed
 * primary navigation, so hiding or renaming a page in the studio changes them.
 */
export function AppBottomNav({ navigation }: { navigation: SiteNavigation }) {
  const pathname = usePathname()
  const state = useAppShellState()

  if (!state.installed || state.mode !== 'app') return null

  const links = navigation.primary
  if (links.length === 0) return null

  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line glass-nav pb-[max(0.375rem,env(safe-area-inset-bottom))] xl:hidden"
    >
      <ul className="mx-auto flex w-full max-w-lg items-stretch justify-between px-2 pt-1.5">
        {links.map((link) => {
          const Icon = iconForRoute(link.href)
          const active =
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
