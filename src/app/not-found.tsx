import Link from 'next/link'
import { Compass, Home, Search } from 'lucide-react'
import { ReportIssueButton } from '@/components/ui/ReportIssueButton'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-line-subtle bg-overlay-faint text-accent">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">404</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Page not found</h1>
          <p className="text-sm leading-relaxed text-muted">
            This page doesn&apos;t exist or has been moved. If a link on the site led you here,
            report it and it will be fixed.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-inverse shadow-xs transition-opacity hover:opacity-90"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Return home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-full border border-line-subtle px-4 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:border-line-medium hover:text-accent"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Search the site
          </Link>
          <ReportIssueButton
            context="404 page"
            label="Report a broken link"
            error={{
              name: 'BrokenLink',
              message: 'A link led to a page that does not exist.',
            }}
          />
        </div>
      </div>
    </div>
  )
}
