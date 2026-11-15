'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Loader2, Mail, X } from 'lucide-react'
import { sensoryAudio } from '@/lib/sensory-audio'
import { uiStrings } from '@/lib/ui-strings'

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function NewsletterForm() {
  const reduceMotion = useReducedMotion()
  const emailInputId = useId()
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return

      const normalizedEmail = email.trim().toLowerCase()
      if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
        setSuccessMessage(null)
        setError(uiStrings.journal.newsletterInvalidEmail.en)
        return
      }

      sensoryAudio.playClick()
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)
      clearTimer()

      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            website: honeypot,
          }),
        })

        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
          message?: string
          alreadySubscribed?: boolean
        }

        if (!response.ok) {
          throw new Error(payload.error ?? uiStrings.journal.newsletterFailed.en)
        }

        setEmail('')
        setSuccessMessage(
          payload.message ??
            (payload.alreadySubscribed
              ? uiStrings.journal.newsletterAlreadySubscribed.en
              : uiStrings.journal.newsletterSuccess.en),
        )
        sensoryAudio.playChime()

        timerRef.current = window.setTimeout(() => {
          setSuccessMessage(null)
          timerRef.current = null
        }, 7000)
      } catch (err) {
        setError(err instanceof Error ? err.message : uiStrings.journal.newsletterFailed.en)
      } finally {
        setIsSubmitting(false)
      }
    },
    [clearTimer, email, honeypot, isSubmitting],
  )

  return (
    <motion.section
      aria-labelledby={`${emailInputId}-heading`}
      className="apple-card p-6 md:p-8"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: EASE_SETTLE }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
        <div className="max-w-md space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-muted">
            <Mail className="w-3 h-3 text-accent" aria-hidden="true" />
            <span>{uiStrings.journal.newsletterEyebrow.en}</span>
            {uiStrings.journal.newsletterEyebrow.kr && (
              <span lang="ko" className="font-korean normal-case tracking-normal opacity-80">
                · {uiStrings.journal.newsletterEyebrow.kr}
              </span>
            )}
          </div>

          <h2
            id={`${emailInputId}-heading`}
            className="text-lg md:text-xl font-semibold text-ink tracking-[-0.025em]"
          >
            {uiStrings.journal.newsletterTitle.en}
          </h2>

          <p className="text-xs md:text-sm text-muted leading-relaxed">
            {uiStrings.journal.newsletterDescription.en}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full lg:max-w-md shrink-0 space-y-3"
        >
          {/* Honeypot field hidden from screen readers and keyboard navigation */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="sr-only"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <label htmlFor={emailInputId} className="sr-only">
              {uiStrings.journal.newsletterEmailLabel.en}
            </label>
            <input
              id={emailInputId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError(null)
              }}
              placeholder={uiStrings.journal.newsletterPlaceholder}
              className="flex-1 min-w-0 rounded-full border border-line bg-overlay-faint px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:bg-surface focus:outline-none transition-colors disabled:opacity-60"
            />

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={reduceMotion || isSubmitting ? undefined : { scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-overlay px-5 py-2.5 text-sm font-medium text-accent whitespace-nowrap cursor-pointer transition-colors hover:bg-overlay-medium hover:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>
                {isSubmitting
                  ? uiStrings.journal.newsletterSubscribing.en
                  : uiStrings.journal.newsletterSubmit.en}
              </span>
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="newsletter-error"
                role="alert"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduceMotion ? 0.1 : 0.22, ease: EASE_SETTLE }}
                className="flex items-start justify-between gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400"
              >
                <p className="leading-relaxed">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  aria-label="Dismiss error message"
                  className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key="newsletter-success"
                role="status"
                aria-live="polite"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.99 }}
                transition={{ duration: reduceMotion ? 0.1 : 0.25, ease: EASE_SETTLE }}
                className="flex items-start justify-between gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="leading-relaxed">{successMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearTimer()
                    setSuccessMessage(null)
                  }}
                  aria-label="Dismiss confirmation message"
                  className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.section>
  )
}
