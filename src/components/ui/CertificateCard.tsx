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
}

interface CertificateCardProps {
  certificate: CertificateData
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <Card3D maxTilt={5}>
      <article className="apple-card p-6 flex flex-col justify-between h-full hover:border-black/10 transition-all">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="w-10 h-10 rounded-2xl bg-black/[0.04] text-[#0071e3] border border-black/[0.04] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </span>
            {certificate.date && (
              <span className="text-xs text-[#86868b] flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
                {certificate.date}
              </span>
            )}
          </div>

          <h4 className="text-base font-semibold text-[#1d1d1f] leading-snug tracking-tight">
            {certificate.title}
          </h4>
          <p className="mt-1 text-sm text-[#0071e3] font-medium">
            {certificate.organization}
          </p>
          {certificate.description && (
            <p className="mt-2 text-xs text-[#86868b] leading-relaxed line-clamp-2">
              {certificate.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-3.5 border-t border-black/[0.04] flex items-center justify-between text-xs">
          {certificate.credentialId && (
            <span className="text-[11px] text-[#86868b]">
              ID: {certificate.credentialId}
            </span>
          )}
          {certificate.credentialUrl && (
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="apple-btn-secondary !py-1.5 !px-3.5 !text-xs ml-auto"
            >
              <span>Verify Credential</span>
              <span className="font-korean text-[10px] text-[#86868b]">검증</span>
              <ArrowUpRight className="w-3 h-3 text-[#86868b]" />
            </a>
          )}
        </div>
      </article>
    </Card3D>
  )
}
