'use client'

import React, { useMemo } from 'react'

/**
 * Dither Kit Component
 * Inspired by dithered graphics & charts (tripwire.sh / dither-kit)
 * Implements retro-digital ordered halftone dithering on canvas and SVG
 * Perfectly harmonizes with the paper-and-ink aesthetic.
 */

interface DitherSparklineProps {
  data?: number[]
  width?: number
  height?: number
  label?: string
  className?: string
}

export function DitherSparkline({
  data = [12, 19, 15, 27, 24, 38, 32, 45, 40, 52, 48, 60, 55, 68, 72, 65, 80, 85, 78, 92, 88, 95, 90, 100],
  width = 240,
  height = 48,
  label = 'Engineering Cadence',
  className = '',
}: DitherSparklineProps) {
  const max = useMemo(() => Math.max(...data, 1), [data])
  const points = useMemo(() => {
    const step = width / (data.length - 1)
    return data.map((val, i) => {
      const x = i * step
      const y = height - (val / max) * (height - 8) - 4
      return { x, y, val }
    })
  }, [data, width, height, max])

  const pathD = useMemo(() => {
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
  }, [points])

  const fillD = useMemo(() => {
    if (!points.length) return ''
    return `${pathD} L ${width} ${height} L 0 ${height} Z`
  }, [pathD, width, height, points])

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-xs bg-[var(--accent)]" />
          {label}
        </span>
        <span className="text-[var(--accent)] font-semibold">
          +{data[data.length - 1]} commits · 30d
        </span>
      </div>

      <div className="relative rounded-xs border border-[var(--line)] bg-[var(--surface)] p-2 overflow-hidden">
        {/* Dither pattern background overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(var(--accent) 1px, transparent 1px)`,
            backgroundSize: '4px 4px',
          }}
        />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-10 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Halftone / Dither Dot Grid Pattern */}
            <pattern id="dither-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="1.5" height="1.5" fill="var(--accent)" fillOpacity="0.3" />
            </pattern>
          </defs>

          {/* Dithered Fill */}
          <path d={fillD} fill="url(#dither-dots)" />

          {/* Stepped Dither Line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Key Milestone Nodes */}
          {points.filter((_, idx) => idx % 4 === 0 || idx === points.length - 1).map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill="var(--surface)"
              stroke="var(--accent)"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

/**
 * Dithered Spotify Soundwave Equalizer
 */
export function DitherEqualizer({ isPlaying = false }: { isPlaying?: boolean }) {
  const bars = [8, 14, 22, 16, 26, 12, 18, 10]

  return (
    <div className="flex items-end gap-1 h-5 px-1 py-0.5 rounded-xs bg-[var(--paper)] border border-[var(--line)]">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 bg-[var(--accent)] transition-all duration-300"
          style={{
            height: isPlaying ? `${Math.max(4, (height * (1 + Math.sin(i * 1.5))) % 20)}px` : '4px',
            animation: isPlaying ? `ditherBounce ${0.6 + (i % 3) * 0.2}s infinite alternate` : 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, var(--accent), var(--accent) 1px, transparent 1px, transparent 2px)',
          }}
        />
      ))}
    </div>
  )
}
