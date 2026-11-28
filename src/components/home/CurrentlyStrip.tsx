'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, Clock, Disc3, Film, Github, Tv, type LucideIcon } from 'lucide-react'
import type { CurrentlyEntry } from '@/lib/currently'

const KIND_ICONS: Record<string, LucideIcon> = {
  music: Disc3,
  movies: Film,
  anime: Tv,
  manga: BookOpen,
  commit: Github,
}

/** How many cards are visible in the deck at once (top card plus two behind). */
const STACK_DEPTH = 2
const ROTATE_MS = 4800

/**
 * The homepage's "currently" deck: medium cards stacked on one another that
 * cycle on their own, rotating from left to right. The content comes from
 * published media records and public GitHub activity, never from copy typed
 * into a component.
 */
export function CurrentlyStrip({
  entries,
  label,
}: {
  entries: CurrentlyEntry[]
  label: string
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = entries.length

  useEffect(() => {
    if (count < 2 || paused) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % count)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [count, paused])

  if (count === 0) return null

  return (
    <section
      aria-label={label}
      aria-roledescription="carousel"
      className="mt-10 md:mt-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center gap-3 pb-3 border-b border-line-subtle">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">{label}</span>
        <span className="h-px flex-1 bg-line-subtle" aria-hidden="true" />
      </div>

      <div className="relative mx-auto mt-5 h-[188px] w-full max-w-md sm:h-[196px]">
        {entries.map((entry, index) => {
          const depth = (index - active + count) % count
          const hidden = depth > STACK_DEPTH
          const isTop = depth === 0
          const Icon = KIND_ICONS[entry.key] ?? Disc3

          const body = (
            <article className="flex h-full gap-4 rounded-2xl border border-line-subtle bg-surface px-4 py-4 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.45)]">
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border border-line-hairline bg-overlay-faint sm:w-24">
                {entry.imageUrl ? (
                  <Image
                    src={entry.imageUrl}
                    alt={entry.value}
                    fill
                    sizes="96px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted">
                  <Icon className="h-3 w-3 text-accent" aria-hidden="true" />
                  {entry.label}
                </span>
                <span className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-ink">
                  {entry.value}
                </span>
                {entry.meta && (
                  <span className="mt-0.5 line-clamp-1 text-xs text-muted">{entry.meta}</span>
                )}
                <span className="mt-auto flex items-center gap-1.5 pt-2 text-[11px] text-muted">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {entry.timeLabel ?? 'Just now'}
                </span>
              </div>

              {entry.href && isTop && (
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 self-start text-muted"
                  aria-hidden="true"
                />
              )}
            </article>
          )

          return (
            <div
              key={entry.key}
              aria-hidden={!isTop}
              className="absolute inset-x-0 top-0 h-full origin-bottom transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                zIndex: count - depth,
                opacity: hidden ? 0 : 1 - depth * 0.24,
                pointerEvents: isTop ? 'auto' : 'none',
                transform: `translate3d(${depth * 8}px, ${depth * 14}px, 0) scale(${
                  1 - depth * 0.05
                }) rotate(${depth === 0 ? 0 : depth % 2 === 1 ? -1.4 : 1.6}deg)`,
              }}
            >
              {entry.href ? (
                <Link
                  href={entry.href}
                  className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  tabIndex={isTop ? 0 : -1}
                  aria-label={`${entry.label}: ${entry.value}`}
                >
                  {body}
                </Link>
              ) : (
                <div className="h-full">{body}</div>
              )}
            </div>
          )
        })}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {entries.map((entry, index) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${entry.label}: ${entry.value}`}
              aria-current={index === active}
              className={`h-1.5 rounded-full transition-all ${
                index === active ? 'w-5 bg-accent' : 'w-1.5 bg-line-medium hover:bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
