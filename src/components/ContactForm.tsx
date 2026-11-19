'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Send, X } from 'lucide-react';
import { sensoryAudio } from '@/lib/sensory-audio';
import { uiStrings } from '@/lib/ui-strings';

type ContactFormProps = {
  /** Reply-time promise from Site Settings; hidden when not configured. */
  responseTime?: string;
  onSuccessMessage?: string;
};

const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const formContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

const fieldItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_SETTLE,
    },
  },
};

export default function ContactForm({
  responseTime,
  onSuccessMessage = uiStrings.contact.success.en,
}: ContactFormProps) {
  const reduceMotion = useReducedMotion();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successTimerRef = useRef<number | null>(null);

  const clearSuccessTimer = useCallback(() => {
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearSuccessTimer();
  }, [clearSuccessTimer]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) return;

      sensoryAudio.playClick();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const body = {
        name: formData.get('name')?.toString().trim(),
        email: formData.get('email')?.toString().trim(),
        subject: formData.get('subject')?.toString().trim(),
        message: formData.get('message')?.toString().trim(),
      };

      setIsSubmitting(true);
      setError(null);
      setShowSuccess(false);
      clearSuccessTimer();

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? uiStrings.contact.genericError.en);
        }

        form.reset();
        setShowSuccess(true);
        sensoryAudio.playChime();
        successTimerRef.current = window.setTimeout(() => {
          setShowSuccess(false);
          successTimerRef.current = null;
        }, 6500);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : uiStrings.contact.sendFailed.en;
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearSuccessTimer, isSubmitting]
  );

  return (
    <motion.div
      className="apple-card p-6 md:p-8 space-y-6"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: EASE_SETTLE }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-xl md:text-2xl text-ink tracking-tight">
            {uiStrings.contact.formTitle.en}
          </span>
          {uiStrings.contact.formTitle.kr && (
            <span lang="ko" className="font-korean text-xs text-muted font-normal">
              · {uiStrings.contact.formTitle.kr}
            </span>
          )}
        </div>
        {responseTime && <p className="text-xs text-muted">{responseTime}</p>}
      </div>

      <motion.form
        className="space-y-4"
        onSubmit={handleSubmit}
        variants={reduceMotion ? undefined : formContainerVariants}
        initial={reduceMotion ? false : 'hidden'}
        whileInView={reduceMotion ? undefined : 'visible'}
        viewport={{ once: true, amount: 0.12 }}
      >
        <motion.div variants={reduceMotion ? undefined : fieldItemVariants}>
          <label htmlFor="name" className="block text-xs font-medium text-ink-secondary mb-1.5">
            {uiStrings.contact.name.en}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-base text-ink caret-accent focus:border-accent focus:bg-surface focus:outline-none transition-all placeholder:text-muted/60 md:text-sm"
            placeholder={uiStrings.contact.namePlaceholder}
            required
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fieldItemVariants}>
          <label htmlFor="email" className="block text-xs font-medium text-ink-secondary mb-1.5">
            {uiStrings.contact.email.en}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-base text-ink caret-accent focus:border-accent focus:bg-surface focus:outline-none transition-all placeholder:text-muted/60 md:text-sm"
            placeholder={uiStrings.contact.emailPlaceholder}
            required
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fieldItemVariants}>
          <label htmlFor="subject" className="block text-xs font-medium text-ink-secondary mb-1.5">
            {uiStrings.contact.subject.en}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-base text-ink caret-accent focus:border-accent focus:bg-surface focus:outline-none transition-all placeholder:text-muted/60 md:text-sm"
            placeholder={uiStrings.contact.subjectPlaceholder}
            required
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fieldItemVariants}>
          <label htmlFor="message" className="block text-xs font-medium text-ink-secondary mb-1.5">
            {uiStrings.contact.message.en}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-base text-ink caret-accent focus:border-accent focus:bg-surface focus:outline-none transition-all leading-relaxed placeholder:text-muted/60 md:text-sm"
            placeholder={uiStrings.contact.messagePlaceholder}
            required
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fieldItemVariants}>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={reduceMotion || isSubmitting ? undefined : { scale: 0.99 }}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-overlay px-6 py-3 text-sm font-medium text-accent cursor-pointer transition-colors hover:bg-overlay-medium hover:border-accent ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{isSubmitting ? uiStrings.contact.sending.en : uiStrings.contact.submit.en}</span>
            {uiStrings.contact.submit.kr && (
              <span lang="ko" className="font-korean text-xs opacity-75">
                {uiStrings.contact.submit.kr}
              </span>
            )}
          </motion.button>
        </motion.div>
      </motion.form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="contact-error"
            role="alert"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.25, ease: EASE_SETTLE }}
            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start justify-between gap-3"
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

        {showSuccess && (
          <motion.div
            key="contact-success"
            role="status"
            aria-live="polite"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: EASE_SETTLE }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <motion.span
                initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.06, ease: EASE_SETTLE }}
                className="mt-0.5 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </motion.span>
              <div className="space-y-0.5">
                <p className="font-semibold text-xs">Message received</p>
                <p className="leading-relaxed opacity-90">{onSuccessMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                clearSuccessTimer();
                setShowSuccess(false);
              }}
              aria-label="Dismiss confirmation message"
              className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
