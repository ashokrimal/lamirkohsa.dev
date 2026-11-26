'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { editTargetsForPath } from '@/lib/owner-edit-targets'

/**
 * The owner-only edit affordance on public pages.
 *
 * It renders nothing for visitors and nothing inside the studio. The session
 * check is one no-store fetch on mount, so the public pages keep their static
 * caching instead of reading cookies during render.
 */
export function OwnerEditBar() {
  const pathname = usePathname() || '/'
  const [owner, setOwner] = useState(false)
  const [open, setOpen] = useState(false)

  const targets = editTargetsForPath(pathname)
  // A page with nothing to edit never asks the server whether the visitor is the
  // owner, so visitors do not pay a request for an affordance they cannot use.
  const hidden = pathname.startsWith('/admin') || pathname.startsWith('/api')
  const enabled = !hidden && targets.length > 0

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : { owner: false }))
      .then((data: { owner?: boolean }) => {
        if (!cancelled) setOwner(Boolean(data.owner))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [enabled])

  if (!enabled || !owner) return null

  return (
    <div className="fixed bottom-5 right-5 z-[60] print:hidden">
      {open && (
        <div className="mb-2 w-56 rounded-2xl border border-line-medium bg-surface/95 p-2 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted">
              Edit this page
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close edit menu"
              className="rounded p-0.5 text-muted hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-0.5">
            {targets.map((target) => (
              <li key={target.href}>
                <Link
                  href={target.href}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-ink-secondary hover:bg-overlay hover:text-accent"
                >
                  {target.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-line-medium bg-surface/95 px-3.5 py-2 text-[11px] font-semibold text-ink-secondary shadow-lg backdrop-blur transition-colors hover:border-accent hover:text-accent"
      >
        <Pencil className="h-3 w-3" aria-hidden="true" />
        Edit
      </button>
    </div>
  )
}
