'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Clock, Globe } from 'lucide-react'

interface LiveStatusPillProps {
  email?: string
  location?: string
  status?: string
}

export function LiveStatusPill({
  email = 'info.ashokrimal@gmail.com',
  location = 'Nepal',
  status = 'Available for projects',
}: LiveStatusPillProps) {
  const [timeStr, setTimeStr] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date()
        // Nepal Time is UTC+5:45
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        setTimeStr(formatter.format(now))
      } catch {
        setTimeStr('')
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const copyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
      {/* Live Nepal Clock (Inspiration: tenztan.in & helloabdullah.com) */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        <Clock className="w-3 h-3 text-[var(--accent)]" />
        <span className="text-[var(--ink)] font-medium">
          NPT {timeStr || '12:00 PM'}
        </span>
        <span className="text-[var(--muted)]/60">·</span>
        <span>{location}</span>
      </div>

      {/* Copy Email Button with feedback toast (Inspiration: helloabdullah.com & aimane.dev) */}
      <button
        type="button"
        onClick={copyEmail}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer group"
        title="Click to copy email address"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-[var(--accent)]" />
            <span className="text-[var(--accent)] font-semibold">Email copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 text-[var(--muted)] group-hover:text-[var(--accent)]" />
            <span className="truncate max-w-[130px] sm:max-w-none">{email}</span>
            <span className="text-[9px] uppercase px-1 py-0.2 rounded-xs bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]">
              Copy
            </span>
          </>
        )}
      </button>
    </div>
  )
}
