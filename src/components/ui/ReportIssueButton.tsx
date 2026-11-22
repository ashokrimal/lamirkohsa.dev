'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, Copy, Github, X } from 'lucide-react'
import { ISSUE_REPO, buildIssueReport } from '@/lib/report-issue'

interface ReportIssueButtonProps {
  error?: unknown
  digest?: string
  context?: string
  /** Trigger label. */
  label?: string
  className?: string
}

/**
 * Error-screen action that opens a small menu explaining what will be reported,
 * then deep-links to a GitHub issue with the error, page and browser already
 * filled in. Nothing is sent anywhere until the visitor submits on GitHub.
 */
export function ReportIssueButton({
  error,
  digest,
  context,
  label = 'Report the issue',
  className = '',
}: ReportIssueButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const report = useMemo(
    () => (open ? buildIssueReport({ error, digest, context }) : null),
    [open, error, digest, context],
  )

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const copyDetails = async () => {
    if (!report) return
    try {
      await navigator.clipboard.writeText(`${report.title}\n\n${report.body}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCopied(false)
          setOpen(true)
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-line-medium bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-xs transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      >
        <AlertTriangle className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-issue-title"
            className="w-full max-w-md rounded-2xl border border-line-subtle bg-surface p-5 text-left shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 id="report-issue-title" className="text-base font-semibold text-ink">
                  Report this issue
                </h2>
                <p className="text-xs leading-relaxed text-muted">
                  Opens a new GitHub issue in{' '}
                  <span className="font-medium text-ink-secondary">{ISSUE_REPO}</span> with the
                  error, page and browser details filled in for you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close report menu"
                className="rounded-full p-1 text-muted transition-colors hover:bg-overlay hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <ul className="mt-4 space-y-1.5 rounded-xl border border-line-hairline bg-overlay-faint p-3 text-[11px] leading-relaxed text-ink-secondary">
              <li>• The page you were on and the time it happened</li>
              <li>• The error message, digest and stack trace</li>
              <li>• Your browser and screen size</li>
            </ul>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Nothing is sent until you review and submit the issue on GitHub.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <a
                href={report?.url ?? `https://github.com/${ISSUE_REPO}/issues/new`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-inverse shadow-xs transition-opacity hover:opacity-90"
              >
                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                Open GitHub issue
              </a>
              <button
                type="button"
                onClick={copyDetails}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line-subtle px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:bg-overlay hover:text-ink"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copied ? 'Copied' : 'Copy details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
