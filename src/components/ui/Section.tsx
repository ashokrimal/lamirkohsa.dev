import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Section({ children, className, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={cn('portfolio-section', className)} {...props}>{children}</section>;
}

export function SectionHeader({ label, title, action, className }: { label?: string; title: ReactNode; action?: ReactNode; className?: string }) {
  return <div className={cn('section-heading', className)}><div>{label && <p className="section-label">{label}</p>}<h2>{title}</h2></div>{action}</div>;
}

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn('portfolio-card', className)} {...props}>{children}</div>;
}
