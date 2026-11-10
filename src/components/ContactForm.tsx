'use client';

import { useCallback, useState } from 'react';
import { sensoryAudio } from '@/lib/sensory-audio';
import { Send, CheckCircle2 } from 'lucide-react';

type ContactFormProps = {
  onSuccessMessage?: string;
};

export default function ContactForm({
  onSuccessMessage = "Thank you for reaching out. Your note has been received and I'll respond as soon as possible.",
}: ContactFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? 'Something went wrong.');
        }

        form.reset();
        setShowSuccess(true);
        sensoryAudio.playChime();
        const timeout = window.setTimeout(() => setShowSuccess(false), 5000);
        return () => window.clearTimeout(timeout);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  return (
    <div className="apple-card p-6 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-xl md:text-2xl text-ink tracking-tight">
            Send a direct message
          </span>
          <span className="font-korean text-xs text-muted font-normal">
            · 문의하기
          </span>
        </div>
        <p className="text-xs text-muted">
          Typically responding within 24 hours.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-sm text-ink focus:border-accent focus:bg-surface focus:outline-none transition-all placeholder:text-muted/60"
            placeholder="e.g. Maya Sharma"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-sm text-ink focus:border-accent focus:bg-surface focus:outline-none transition-all placeholder:text-muted/60"
            placeholder="e.g. maya@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Topic or Project
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-sm text-ink focus:border-accent focus:bg-surface focus:outline-none transition-all placeholder:text-muted/60"
            placeholder="e.g. Full-stack engineering / Project collaboration"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Message Details
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full rounded-2xl border border-line bg-overlay-faint px-4 py-2.5 text-sm text-ink focus:border-accent focus:bg-surface focus:outline-none transition-all leading-relaxed placeholder:text-muted/60"
            placeholder="Tell me about what you're building, timelines, or thoughts..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-overlay px-6 py-3 text-sm font-medium text-accent cursor-pointer transition-colors hover:bg-overlay-medium hover:border-accent ${
            isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Sending Message…' : 'Transmit Message'}</span>
          <span lang="ko" className="font-korean text-xs opacity-75">전송</span>
        </button>
      </form>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
          <p>{error}</p>
        </div>
      )}
      {showSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>{onSuccessMessage}</p>
        </div>
      )}
    </div>
  );
}
