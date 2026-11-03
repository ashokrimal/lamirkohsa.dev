import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('section-label', className)}>{children}</p>
}

export function ActionLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={cn('text-link inline-flex items-center gap-1', className)}>{children}<ArrowUpRight size={14} aria-hidden="true" /></Link>
}

export function ContentSection({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={cn('media-section', className)} {...props}>{children}</section>
}

export function SectionTitle({ label, title, description, action }: { label: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return <div className="media-section-heading"><div><Label>{label}</Label><h2>{title}</h2></div>{description && <p>{description}</p>}{action}</div>
}
