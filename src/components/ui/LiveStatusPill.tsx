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
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-black/[0.06] text-[#424245] shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
        <span className="text-[#1d1d1f] font-medium">
          NPT {timeStr || '12:00 PM'}
        </span>
        <span className="text-black/20">·</span>
        <span className="text-[#86868b]">{location}</span>
        <span className="font-korean text-[10px] text-[#86868b]">네팔</span>
      </div>

      {/* Copy Email Button Pill */}
      <button
        type="button"
        onClick={copyEmail}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-black/[0.06] hover:border-black/15 text-[#424245] hover:text-[#1d1d1f] transition-all shadow-xs cursor-pointer active:scale-95 group"
        title="Click to copy email address"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-medium">Email copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-[#86868b] group-hover:text-[#0071e3]" />
            <span className="truncate max-w-[140px] sm:max-w-none">{email}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] text-[#86868b]">
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
            ? 'border-[#0071e3]/30 bg-[#0071e3]/10 text-[#0071e3] font-medium'
            : 'border-black/[0.06] bg-white/80 text-[#86868b] hover:text-[#1d1d1f]'
        }`}
        title={soundOn ? 'Sensory interface audio enabled' : 'Sensory interface audio muted (Click to enable)'}
      >
        {soundOn ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="text-xs">Audio On</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-[#86868b]" />
            <span className="text-xs">Muted</span>
          </>
        )}
      </button>
    </div>
  )
}
