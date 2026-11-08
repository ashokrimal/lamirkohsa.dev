'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down' | 'neutral'
  }
  subtext?: string
  icon?: React.ReactNode
  onClick?: () => void
  active?: boolean
}

export function CmsStatCard({
  label,
  value,
  change,
  subtext,
  icon,
  onClick,
  active,
}: StatCardProps) {
  const isClickable = Boolean(onClick)

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={`group relative p-4 rounded-xl border bg-white transition-all duration-200 text-left ${
        active
          ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
      } ${isClickable ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:text-teal-700 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          {value}
        </span>

        {change && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
              change.trend === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : change.trend === 'down'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {change.trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {change.trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {change.trend === 'neutral' && <Minus className="w-3 h-3" />}
            {change.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-400 font-normal">
          {subtext}
        </p>
      )}
    </div>
  )
}

interface SectionCardProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function CmsSectionCard({
  title,
  description,
  action,
  children,
  footer,
  className = '',
  noPadding = false,
}: SectionCardProps) {
  return (
    <section className={`bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          {footer}
        </div>
      )}
    </section>
  )
}
