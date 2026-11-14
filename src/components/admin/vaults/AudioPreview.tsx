'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2 } from 'lucide-react'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export default function AudioPreview({ src, title }: { src: string; title: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    setFailed(false)
  }, [src])

  if (!src) return null

  if (failed) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:border-teal-400 hover:text-teal-700"
      >
        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> Open audio
      </a>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setFailed(true)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const element = audio.current
            if (!element) return
            if (element.paused) void element.play()
            else element.pause()
          }}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-700"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          aria-label={`Seek ${title}`}
          onChange={(event) => {
            const next = Number(event.target.value)
            setCurrent(next)
            if (audio.current) audio.current.currentTime = next
          }}
          className="h-1 min-w-0 flex-1 accent-teal-600"
        />
        <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
