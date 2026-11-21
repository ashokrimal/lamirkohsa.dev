'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, CheckCircle2, Share2, X } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'
import { useUiStrings } from '@/components/ui/UiCopyProvider'

interface ShareProjectButtonProps {
  projectTitle: string
  slug?: string
}

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall back to execCommand below when clipboard API is blocked
    }
  }

  if (typeof document === 'undefined') return false

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.className = 'fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function ShareProjectButton({ projectTitle, slug }: ShareProjectButtonProps) {
  const uiStrings = useUiStrings()
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const dismissToast = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToastOpen(false)
  }, [])

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return

    sensoryAudio.playClick()

    const fallbackUrl = slug ? `${window.location.origin}/projects/${slug}` : window.location.href
    const shareUrl = window.location.href || fallbackUrl
    const ok = await copyTextToClipboard(shareUrl)

    if (!ok) return

    sensoryAudio.playChime()
    setCopied(true)
    setToastOpen(true)

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setCopied(false)
      setToastOpen(false)
      timerRef.current = null
    }, 3000)
  }, [slug])

  return (
    <>
      <motion.button
        type="button"
        onClick={handleShare}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        aria-label={uiStrings.project.shareAria(projectTitle)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          copied
            ? 'border-accent/50 bg-overlay-medium text-accent'
            : 'border-line-subtle bg-surface/85 text-ink hover:border-line-medium hover:bg-surface hover:text-accent'
        }`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        ) : (
          <Share2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        )}
        <span>{copied ? uiStrings.project.copiedToast.en : uiStrings.project.share.en}</span>
      </motion.button>

      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
              {toastOpen && (
                <motion.div
                  key="share-copied-toast"
                  role="status"
                  aria-live="polite"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.24, ease: EASE_SETTLE }}
                  className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line-medium bg-surface/95 px-4 py-3 text-xs text-ink shadow-xl backdrop-blur-xl"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <div className="space-y-0.5 pr-1">
                    <p className="font-semibold text-ink">{uiStrings.project.copiedToast.en}</p>
                    <p className="text-[11px] text-muted">
                      {uiStrings.project.copiedSubtitle.en}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={dismissToast}
                    aria-label="Dismiss notification"
                    className="rounded-full p-1 text-muted transition-colors hover:bg-overlay hover:text-ink cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </>
  )
}
