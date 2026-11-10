'use client'

import React from 'react'

export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
}

interface CmsTabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'line' | 'pill'
  className?: string
}

export function CmsTabs({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className = '',
}: CmsTabsProps) {
  if (variant === 'pill') {
    return (
      <div
        role="tablist"
        aria-label="Navigation tabs"
        className={`flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto max-w-full ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 ${
                isActive
                  ? 'bg-surface text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-surface/50'
              }`}
            >
              {tab.icon && <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="tablist"
      aria-label="Navigation tabs"
      className={`flex items-center gap-4 border-b border-slate-200/80 overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 pb-3 text-xs font-medium border-b-2 transition-all shrink-0 -mb-[2px] ${
              isActive
                ? 'border-teal-600 text-teal-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.icon && <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
