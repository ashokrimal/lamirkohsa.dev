'use client'

import React from 'react'
import { Briefcase, Calendar, CheckCircle2, GraduationCap, MapPin, Building2, Sparkles } from 'lucide-react'
import { Card3D } from '@/components/ui/Card3D'

import { EmptyState } from '@/components/ui/EmptyState'

export interface ExperienceItemData {
  id?: number | string
  title: string
  organization: string
  period: string
  location?: string
  description: string
  highlights?: string[]
}

interface ExperienceTimelineProps {
  items: ExperienceItemData[]
  type?: 'experience' | 'education'
  className?: string
  /** Shown when there are no records, linking to the admin section. */
  emptyMessage?: string
  emptyHint?: string
  emptyActionLabel?: string
  emptyActionHref?: string
}

export function ExperienceTimeline({
  items,
  type = 'experience',
  className = '',
  emptyMessage,
  emptyHint,
  emptyActionLabel,
  emptyActionHref,
}: ExperienceTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={type === 'experience' ? Briefcase : GraduationCap}
        message={emptyMessage ?? `No ${type} published yet.`}
        hint={emptyHint ?? 'Add a record in the CMS to show it on the timeline.'}
        actionLabel={emptyActionLabel}
        actionHref={emptyActionHref}
        className="rounded-[24px]"
      />
    )
  }

  const Icon = type === 'experience' ? Briefcase : GraduationCap
  const typeLabelKr = type === 'experience' ? '경력 사항' : '학력 사항'

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ============================================================== */}
      {/* MOBILE DISPLAY: LINKEDIN APP TIMELINE STYLE (< 768px)          */}
      {/* ============================================================== */}
      <div className="block md:hidden relative pl-4 pr-1">
        {/* Continuous LinkedIn Vertical Connector Line */}
        <div
          aria-hidden="true"
          className="absolute left-[36px] top-4 bottom-8 w-[2px] bg-neutral-200"
        />

        <div className="space-y-7">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <div key={item.id || index} className="relative flex items-start gap-3.5">
                {/* LinkedIn-style Company Squircle Logo Avatar */}
                <div className="relative z-10 w-11 h-11 rounded-2xl bg-surface border border-line shadow-sm flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>

                {/* Content Block */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="text-[15px] font-semibold text-ink tracking-tight leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[13px] font-medium text-ink-secondary mt-0.5">
                    {item.organization}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-accent" />
                      {item.period}
                    </span>
                    {item.location && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted" />
                          {item.location}
                        </span>
                      </>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-[13px] text-[#515154] mt-2.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.highlights && item.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-[12px] text-ink">
                      {item.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          <span className="leading-snug text-ink-secondary">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP DISPLAY: APPLE 3D GLASS CARDS (>= 768px)               */}
      {/* ============================================================== */}
      <div className="hidden md:grid grid-cols-1 gap-5">
        {items.map((item, index) => (
          <Card3D key={item.id || index} maxTilt={5}>
            <article className="apple-card p-6 lg:p-7 space-y-4">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-line-subtle">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-overlay border border-line-faint flex items-center justify-center text-accent shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-accent">
                      {item.organization}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-overlay text-xs font-medium text-ink-secondary border border-line-faint">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{item.period}</span>
                  </span>
                  {item.location && (
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-ink-secondary leading-relaxed">
                {item.description}
              </p>

              {item.highlights && item.highlights.length > 0 && (
                <div className="pt-3 border-t border-line-faint space-y-2">
                  <span className="text-[11px] font-korean uppercase tracking-wider text-muted block font-medium">
                    {typeLabelKr} · 핵심 성과
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink">
                    {item.highlights.map((h, hIdx) => (
                      <div
                        key={hIdx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-overlay-faint border border-line-hairline"
                      >
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span className="leading-snug text-ink-secondary">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </Card3D>
        ))}
      </div>
    </div>
  )
}
