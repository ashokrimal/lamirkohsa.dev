'use client';

import { useCallback, useState } from 'react';

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
    <div className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-normal text-[var(--ink)] tracking-[-0.03em]">
        Send a direct <span className="font-serif italic text-[var(--accent)]">dispatch</span>
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)] font-mono">
        Typically responding within 24 hours.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-xs border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            placeholder="e.g. Maya Sharma"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full rounded-xs border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            placeholder="e.g. maya@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Topic or Project
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="w-full rounded-xs border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            placeholder="e.g. Freelance web app / Collaboration"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Message Details
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full rounded-xs border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors leading-relaxed"
            placeholder="Tell me about what you're building, timelines, or thoughts..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center rounded-xs py-2.5 px-5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            isSubmitting
              ? 'bg-[var(--line)] text-[var(--muted)] cursor-not-allowed'
              : 'bg-[var(--accent)] text-white hover:bg-[#435d4c] shadow-2xs'
          }`}
        >
          {isSubmitting ? 'Sending Message…' : 'Transmit Message'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-xs bg-red-50 border border-red-200 text-red-800 text-xs">
          <p>{error}</p>
        </div>
      )}
      {showSuccess && (
        <div className="mt-4 p-3 rounded-xs bg-[var(--accent-soft)] border border-[var(--accent)] text-[var(--accent)] text-xs font-medium">
          <p>{onSuccessMessage}</p>
        </div>
      )}
    </div>
  );
}
