import { Award, ArrowUpRight, Calendar, CheckCircle } from 'lucide-react'

export interface CertificateData {
  id?: number | string
  title: string
  organization: string
  date?: string
  credentialUrl?: string
  credentialId?: string
  description?: string
}

interface CertificateCardProps {
  certificate: CertificateData
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <article className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-5 flex flex-col justify-between hover:border-[var(--accent)] transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="p-1.5 rounded-xs bg-[var(--paper)] text-[var(--accent)] border border-[var(--line)]">
            <Award className="w-4 h-4" />
          </span>
          {certificate.date && (
            <span className="text-[10px] font-mono text-[var(--muted)] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--accent)]" />
              {certificate.date}
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-[var(--ink)] leading-snug">
          {certificate.title}
        </h4>
        <p className="mt-1 text-xs text-[var(--accent)] font-medium">
          {certificate.organization}
        </p>
        {certificate.description && (
          <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
            {certificate.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--line)]/50 flex items-center justify-between text-xs">
        {certificate.credentialId && (
          <span className="text-[10px] font-mono text-[var(--muted)]">
            ID: {certificate.credentialId}
          </span>
        )}
        {certificate.credentialUrl && (
          <a
            href={certificate.credentialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline ml-auto"
          >
            <span>Verify</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  )
}
