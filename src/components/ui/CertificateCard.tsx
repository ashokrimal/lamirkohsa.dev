import { Award, ArrowUpRight, Calendar } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'

export interface CertificateData {
  id?: number | string
  title: string
  organization: string
  date?: string
  credentialUrl?: string
  credentialId?: string
  description?: string
  /** Uploaded photo of the certificate, or a PDF of it. */
  imageUrl?: string
}

interface CertificateCardProps {
  certificate: CertificateData
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const isPdf = certificate.imageUrl ? /\.pdf(?:$|[?#])/i.test(certificate.imageUrl) : false

  return (
    <Card3D maxTilt={5}>
      <article className="apple-card p-6 flex flex-col justify-between h-full hover:border-line-medium transition-all">
        <div>
          {certificate.imageUrl && !isPdf && (
            <div className="mb-4 overflow-hidden rounded-xl border border-line-faint bg-overlay">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={certificate.imageUrl}
                alt={certificate.title}
                className="h-40 w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="w-10 h-10 rounded-2xl bg-overlay text-accent border border-line-faint flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </span>
            {certificate.date && (
              <span className="text-xs text-muted flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                {certificate.date}
              </span>
            )}
          </div>

          <h4 className="text-base font-semibold text-ink leading-snug tracking-tight">
            {certificate.title}
          </h4>
          <p className="mt-1 text-sm text-accent font-medium">
            {certificate.organization}
          </p>
          {certificate.description && (
            <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2">
              {certificate.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-3.5 border-t border-line-faint flex items-center justify-between text-xs">
          {certificate.credentialId && (
            <span className="text-[11px] text-muted">
              ID: {certificate.credentialId}
            </span>
          )}
          {isPdf && certificate.imageUrl && (
            <a
              href={certificate.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="apple-btn-secondary !py-1.5 !px-3.5 !text-xs"
            >
              <span>Open certificate</span>
              <span lang="ko" className="font-korean text-[10px] text-muted">증명서</span>
              <ArrowUpRight className="w-3 h-3 text-muted" />
            </a>
          )}
          {certificate.credentialUrl && (
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="apple-btn-secondary !py-1.5 !px-3.5 !text-xs ml-auto"
            >
              <span>Verify Credential</span>
              <span lang="ko" className="font-korean text-[10px] text-muted">검증</span>
              <ArrowUpRight className="w-3 h-3 text-muted" />
            </a>
          )}
        </div>
      </article>
    </Card3D>
  )
}
