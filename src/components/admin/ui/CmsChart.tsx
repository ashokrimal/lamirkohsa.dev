'use client'

import React, { useState } from 'react'

export interface DataPoint {
  label: string
  value: number
  secondary?: number
}

interface TrafficChartProps {
  data: DataPoint[]
  height?: number
  metricName?: string
  secondaryMetricName?: string
}

export function CmsTrafficChart({
  data,
  height = 180,
  metricName = 'Page Views',
  secondaryMetricName = 'Unique Visitors',
}: TrafficChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (!data.length) return null

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondary || 0)), 10)
  const paddingX = 35
  const paddingY = 25
  const width = 600

  // Points for primary line
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
    const y = height - paddingY - (d.value / maxValue) * (height - paddingY * 2)
    return { x, y, ...d }
  })

  // Points for secondary line
  const secondaryPoints = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
    const val = d.secondary ?? d.value * 0.65
    const y = height - paddingY - (val / maxValue) * (height - paddingY * 2)
    return { x, y, val }
  })

  const primaryPathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
  const areaPathD = `${primaryPathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
  const secondaryPathD = secondaryPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null
  const activeSecondary = hoverIndex !== null ? secondaryPoints[hoverIndex] : null

  return (
    <div className="relative w-full select-none">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span className="font-medium text-slate-700">{metricName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-500">{secondaryMetricName}</span>
          </div>
        </div>
        <div className="text-slate-400 text-[11px]">Last 30 Days</div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = height - paddingY - pct * (height - paddingY * 2)
            const val = Math.round(pct * maxValue)
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94a3b8"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Area under primary curve */}
          <path d={areaPathD} fill="url(#chartGradient)" />

          {/* Secondary line (dashed) */}
          <path
            d={secondaryPathD}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Primary line */}
          <path
            d={primaryPathD}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive vertical hover indicator and points */}
          {points.map((p, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
            >
              {/* Invisible wide hit area */}
              <rect
                x={p.x - 10}
                y={paddingY}
                width={20}
                height={height - paddingY * 2}
                fill="transparent"
              />
              {hoverIndex === idx && (
                <>
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="#0d9488"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#0d9488"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-900 text-inverse px-2.5 py-1.5 rounded-lg shadow-xl text-xs z-20 transition-all duration-150 transform -translate-x-1/2"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
            }}
          >
            <p className="font-semibold text-[11px] text-slate-300">{activePoint.label}</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-bold text-teal-300">
                {activePoint.value} views
              </span>
              {activeSecondary && (
                <span className="text-slate-400">
                  {Math.round(activeSecondary.val)} visitors
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-8 mt-1 text-[10px] text-slate-400">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

interface DistributionItem {
  label: string
  count: number
  color: string
}

export function CmsDistributionChart({ items }: { items: DistributionItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1

  return (
    <div className="flex flex-col gap-3">
      {/* Horizontal Stacked Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
        {items.map((item, idx) => {
          const pct = Math.max((item.count / total) * 100, item.count > 0 ? 3 : 0)
          return (
            <div
              key={idx}
              style={{
                width: `${pct}%`,
                backgroundColor: item.color,
              }}
              title={`${item.label}: ${item.count} (${Math.round((item.count / total) * 100)}%)`}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
            />
          )
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 truncate">{item.label}</span>
            </div>
            <span className="font-semibold text-slate-800">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
