'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Clock, Volume2, VolumeX } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'

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
  const [soundOn, setSoundOn] = useState(false)

  useEffect(() => {
    setSoundOn(sensoryAudio.isEnabled())
    const updateTime = () => {
      try {
        const now = new Date()
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
    sensoryAudio.playChime()
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const toggleSound = () => {
    const next = sensoryAudio.toggle()
    setSoundOn(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Live Nepal Clock Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle text-ink-secondary shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-accent" />
        <span className="text-ink font-medium">
          NPT {timeStr || '12:00 PM'}
        </span>
        <span className="text-scrim/20">·</span>
        <span className="text-muted">{location}</span>
        <span className="font-korean text-[10px] text-muted">네팔</span>
      </div>

      {/* Copy Email Button Pill */}
      <button
        type="button"
        onClick={copyEmail}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-line-subtle hover:border-line-strong text-ink-secondary hover:text-ink transition-all shadow-xs cursor-pointer active:scale-95 group"
        title="Click to copy email address"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-medium">Email copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-muted group-hover:text-accent" />
            <span className="truncate max-w-[140px] sm:max-w-none">{email}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-overlay text-muted">
              Copy
            </span>
          </>
        )}
      </button>

      {/* Sensory UI Sound Toggle Pill */}
      <button
        type="button"
        onClick={toggleSound}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs active:scale-95 ${
          soundOn
            ? 'border-accent/30 bg-accent/10 text-accent font-medium'
            : 'border-line-subtle bg-surface/80 text-muted hover:text-ink'
        }`}
        title={soundOn ? 'Sensory interface audio enabled' : 'Sensory interface audio muted (Click to enable)'}
      >
        {soundOn ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs">Audio On</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs">Muted</span>
          </>
        )}
      </button>
    </div>
  )
}
