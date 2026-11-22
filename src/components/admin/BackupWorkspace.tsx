'use client'

import { useRef, useState } from 'react'
import { AlertTriangle, Download, FileJson, ShieldCheck, Upload } from 'lucide-react'

/**
 * Backup & restore for the studio.
 *
 * The download is a plain link to the owner-only API route, so the browser's own
 * download handling saves the file. A restore is previewed locally first (the
 * server re-validates everything) and needs the word RESTORE typed before the
 * button unlocks: it can delete content in replace mode, and that should never
 * happen from a stray click.
 */

const MAX_BYTES = 25 * 1024 * 1024

interface FilePreview {
  name: string
  bytes: number
  records: number
  pages: number
  projects: number
  createdAt: string | null
  total: number
}

interface RestoreSummary {
  mode: string
  cmsContent: { inserted: number; updated: number; removed: number }
  pages: { inserted: number; updated: number }
  pageSections: number
  projects: { inserted: number; updated: number }
  siteSettings: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function summarise(summary: RestoreSummary) {
  const parts = [
    `${summary.cmsContent.inserted} record${summary.cmsContent.inserted === 1 ? '' : 's'} added`,
    `${summary.cmsContent.updated} updated`,
  ]
  if (summary.cmsContent.removed) parts.push(`${summary.cmsContent.removed} removed`)
  parts.push(`${summary.pages.inserted + summary.pages.updated} pages restored`)
  parts.push(`${summary.projects.inserted + summary.projects.updated} case studies restored`)
  if (summary.siteSettings) parts.push('site settings restored')
  return `Backup restored: ${parts.join(', ')}. Public pages refresh on their next request.`
}

export default function BackupWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<FilePreview | null>(null)
  const [fileText, setFileText] = useState<string | null>(null)
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const resetFile = () => {
    setPreview(null)
    setFileText(null)
    setConfirmation('')
    setMode('merge')
    setStatus(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleFile = async (file: File | undefined) => {
    setStatus(null)
    if (!file) return
    if (file.size > MAX_BYTES) {
      resetFile()
      setStatus({ tone: 'error', text: `${file.name} is larger than the 25 MB restore limit.` })
      return
    }

    const text = await file.text()
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cmsContent)) {
        throw new Error('not a backup')
      }
      const studio = (parsed.studio ?? {}) as Record<string, unknown>
      const pages = Array.isArray(studio.pages) ? studio.pages : []
      const projects = Array.isArray(studio.projects) ? studio.projects : []
      const createdAt =
        typeof parsed.createdAt === 'string' && !Number.isNaN(new Date(parsed.createdAt).getTime())
          ? new Date(parsed.createdAt).toISOString()
          : null

      setFileText(text)
      setPreview({
        name: file.name,
        bytes: file.size,
        records: parsed.cmsContent.length,
        pages: pages.length,
        projects: projects.length,
        createdAt,
        total: parsed.cmsContent.length + pages.length + projects.length,
      })
      setConfirmation('')
    } catch {
      resetFile()
      setStatus({
        tone: 'error',
        text: `${file.name} is not a portfolio CMS backup. Download a fresh one above and try again.`,
      })
    }
  }

  const handleRestore = async () => {
    if (!fileText || !preview) return
    setBusy(true)
    setStatus(null)
    try {
      const response = await fetch('/api/admin/cms-backup', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-backup-mode': mode },
        body: fileText,
      })
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; summary?: RestoreSummary }
        | null
      if (!response.ok || !payload?.summary) {
        throw new Error(payload?.message || `Restore failed (${response.status}).`)
      }
      setStatus({ tone: 'success', text: summarise(payload.summary) })
      setConfirmation('')
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Restore failed.',
      })
    } finally {
      setBusy(false)
    }
  }

  const canRestore = Boolean(fileText && preview) && confirmation.trim().toUpperCase() === 'RESTORE' && !busy

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Download className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Download a backup</h2>
            <p className="text-[11px] text-slate-500">
              One JSON file with every CMS record — drafts and published — plus the studio pages,
              their sections, the case studies and the site settings.
            </p>
          </div>
        </div>

        <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-[11px] leading-relaxed text-slate-500">
          Deliberately excluded: the owner account and password, sessions, contact inbox messages
          and newsletter subscribers. A backup can restore content; it can never hand anyone
          credentials or private mail.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-500">Save it somewhere outside this project.</p>
          {/* A plain link so the browser handles the download and its filename. */}
          <a
            href="/api/admin/cms-backup"
            download
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download backup
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Upload className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Restore from a backup</h2>
            <p className="text-[11px] text-slate-500">
              Recreates missing content and updates records that already exist. Records are matched
              by their locked key or slug, never by title.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <input
            ref={inputRef}
            id="cms-backup-file"
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <label
            htmlFor="cms-backup-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center transition-colors hover:border-teal-400 hover:bg-teal-50/40"
          >
            <FileJson className="h-5 w-5 text-slate-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-700">
              {preview ? preview.name : 'Choose a backup file'}
            </span>
            <span className="text-[11px] text-slate-500">
              {preview
                ? `${formatBytes(preview.bytes)} · ${preview.records} records · ${preview.pages} pages · ${preview.projects} case studies`
                : 'JSON, up to 25 MB. Nothing is written until you confirm.'}
            </span>
          </label>
        </div>

        {preview ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] text-slate-500">
                Taken{' '}
                {preview.createdAt
                  ? new Date(preview.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'at an unknown time'}
                {preview.total ? '' : ' — this backup contains no content.'}
              </p>

              <fieldset className="mt-3 space-y-2">
                <legend className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  How to apply it
                </legend>
                {(
                  [
                    {
                      value: 'merge' as const,
                      label: 'Merge',
                      hint: 'Adds missing records and updates existing ones. Nothing is deleted.',
                    },
                    {
                      value: 'replace' as const,
                      label: 'Replace the CMS with this file',
                      hint: 'Also deletes CMS records the file does not contain, so the collections end up exactly as they were in the backup. Pages and case studies are matched by slug and never deleted.',
                    },
                  ]
                ).map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 transition-colors ${
                      mode === option.value
                        ? 'border-teal-400 bg-teal-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="restore-mode"
                      value={option.value}
                      checked={mode === option.value}
                      onChange={() => setMode(option.value)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block text-xs font-semibold text-slate-800">{option.label}</span>
                      <span className="block text-[11px] text-slate-500">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </div>

            {mode === 'replace' ? (
              <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Replace deletes CMS records that are not in this file. Download a fresh backup
                before confirming if you are not certain the file is complete.
              </p>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="text-[11px] font-medium text-slate-600">
                Type RESTORE to confirm
                <input
                  type="text"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="RESTORE"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500 sm:w-40"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetFile}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleRestore()}
                  disabled={!canRestore}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {busy ? 'Restoring…' : 'Restore backup'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <p
          role="status"
          className={`mt-3 text-[11px] ${
            status?.tone === 'error' ? 'text-rose-600' : 'text-emerald-700'
          }`}
        >
          {status?.text ?? ''}
        </p>
      </section>
    </div>
  )
}
