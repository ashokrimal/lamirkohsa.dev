'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

/**
 * Re-runs every server-side check on the status page. The checks themselves are
 * live reads (database ping, blob listing, CMS counts), so a refresh is the same
 * thing "run now" means for them.
 */
export function StatusRefreshButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-3">
      {checkedAt && <span className="text-[11px] text-slate-400">Checked {checkedAt}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => {
            router.refresh()
            setCheckedAt(
              new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            )
          })
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? 'animate-spin' : ''}`} />
        Run checks again
      </button>
    </div>
  )
}
