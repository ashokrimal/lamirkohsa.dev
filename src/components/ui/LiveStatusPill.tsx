'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Clock } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'

interface LiveStatusPillProps {
  email?: string
  location?: string
  timeZone?: string
  timezoneLabel?: string
}

export function LiveStatusPill({ email, location, timeZone, timezoneLabel }: LiveStatusPillProps) {
  const [timeStr, setTimeStr] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!timeZone) return

    const updateTime = () => {
      try {
        setTimeStr(
          new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).format(new Date()),
        )
      } catch {
        setTimeStr('')
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [timeZone])

  const copyEmail = () => {
    if (!email || typeof navigator === 'undefined' || !navigator.clipboard) return
    sensoryAudio.playChime()
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {(timeZone || location) && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle text-ink-secondary shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-accent" />
          {timeStr && (
            <span className="text-ink font-medium">
              {timezoneLabel ? timezoneLabel + ' ' : ''}
              {timeStr}
            </span>
          )}
          {location && (
            <>
              <span className="text-scrim/20">·</span>
              <span className="text-muted">{location}</span>
            </>
          )}
        </div>
      )}

      {email && (
        <button
          type="button"
          onClick={copyEmail}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle hover:border-line-strong text-ink-secondary hover:text-ink transition-all shadow-xs cursor-pointer active:scale-95 group"
          title="Copy email address"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-muted group-hover:text-accent" />
              <span className="truncate max-w-[140px] sm:max-w-none">{email}</span>
            </>
          )}
        </button>
      )}

    </div>
  )
}
