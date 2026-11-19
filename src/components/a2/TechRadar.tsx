'use client'

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { arc as d3Arc, pie as d3Pie } from 'd3'

const PALETTE = ['#63f5d3', '#c9ff7a', '#7dd3fc', '#f0abfc', '#fcd34d', '#a3e635', '#fda4af', '#94a3b8']

interface TechSlice {
  label: string
  value: number
  color: string
  path: string
  centroid: [number, number]
}

function buildSlices(tags: Map<string, number>, size = 210): TechSlice[] {
  const entries = [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  if (entries.length === 0) return []

  const pie = d3Pie<[string, number]>().value((entry) => entry[1]).sort(null)
  const arc = d3Arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(size * 0.56)
    .outerRadius(size * 0.9)
    .padAngle(0.02)
    .cornerRadius(4)

  return pie(entries).map((slice, index) => ({
    label: slice.data[0],
    value: slice.data[1],
    color: PALETTE[index % PALETTE.length],
    path: arc({ startAngle: slice.startAngle, endAngle: slice.endAngle }) ?? '',
    centroid: d3Arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(size * 0.73)
      .outerRadius(size * 0.73)
      .centroid({ startAngle: slice.startAngle, endAngle: slice.endAngle }) as [number, number],
  }))
}

/**
 * A D3 donut of the technologies the published projects actually use. The arcs
 * draw themselves in on scroll; hovering a slice names it in the centre.
 */
export function TechRadar({ projects }: { projects: { techStack: string[] }[] }) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState<string | null>(null)

  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      for (const tech of project.techStack) {
        const label = tech.trim()
        if (!label) continue
        const key = [...counts.keys()].find((item) => item.toLowerCase() === label.toLowerCase()) ?? label
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return counts
  }, [projects])

  const slices = useMemo(() => buildSlices(tags), [tags])
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const focus = slices.find((slice) => slice.label === active) ?? slices[0]

  if (slices.length === 0) {
    return (
      <p className="a2-empty">
        Technology usage appears here as soon as projects with a tech stack are published.
      </p>
    )
  }

  return (
    <div className="a2-radar">
      <div className="a2-radar-chart">
        <svg viewBox="-115 -115 230 230" role="img" aria-label="Share of project technology usage">
          <circle cx="0" cy="0" r="105" className="a2-radar-track" />
          {slices.map((slice, index) => (
            <motion.path
              key={slice.label}
              d={slice.path}
              fill={slice.color}
              fillOpacity={active && active !== slice.label ? 0.18 : 0.9}
              stroke={slice.color}
              strokeWidth={active === slice.label ? 1.4 : 0}
              onMouseEnter={() => setActive(slice.label)}
              onMouseLeave={() => setActive(null)}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'center', cursor: 'pointer' }}
            />
          ))}
        </svg>

        <div className="a2-radar-center">
          <span>{focus ? Math.round((focus.value / total) * 100) : 0}%</span>
          <strong>{focus?.label ?? ''}</strong>
          <small>of project usage</small>
        </div>
      </div>

      <ul className="a2-radar-legend">
        {slices.map((slice) => (
          <li
            key={slice.label}
            onMouseEnter={() => setActive(slice.label)}
            onMouseLeave={() => setActive(null)}
            data-active={active === slice.label ? 'true' : undefined}
          >
            <span className="a2-radar-dot" style={{ background: slice.color }} />
            <span className="a2-radar-label">{slice.label}</span>
            <span className="a2-radar-value">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
