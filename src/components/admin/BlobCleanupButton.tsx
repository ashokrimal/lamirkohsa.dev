'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

/**
 * Deletes the listed unused files after a typed confirmation.
 *
 * The server re-derives the orphan list before deleting, so this button cannot
 * remove a file that became referenced while the page was open. Reloading after
 * the call shows the new state.
 */
export function BlobCleanupButton({ pathnames }: { pathnames: string[] }) {
  const router = useRouter()
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!pathnames.length) {
    return <span className="text-[11px] text-slate-400">Nothing to remove</span>
  }

  const remove = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/blob-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ confirm: 'DELETE', pathnames }),
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      setMessage(data.message ?? (response.ok ? 'Done.' : 'The cleanup failed.'))
      if (response.ok) {
        setArmed(false)
        router.refresh()
      }
    } catch {
      setMessage('The cleanup could not be completed.')
    } finally {
      setBusy(false)
    }
  }

  if (!armed) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Remove {pathnames.length} unused file{pathnames.length === 1 ? '' : 's'}
        </button>
        {message && <span className="text-[11px] text-slate-500">{message}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {busy ? 'Removing…' : 'Confirm removal'}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={busy}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        Cancel
      </button>
      {message && <span className="text-[11px] text-slate-500">{message}</span>}
    </div>
  )
}

export default BlobCleanupButton
