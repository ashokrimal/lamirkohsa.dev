'use client';

import { useCallback, useState } from 'react';

type ContactFormProps = {
  onSuccessMessage?: string;
};

export default function ContactForm({ onSuccessMessage = "Thanks for reaching out! I'll respond as soon as possible." }: ContactFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
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
  }, [isSubmitting]);

  return (
    <div className="form-container p-8 md:p-10 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900">Send a message</h2>
      <p className="mt-2 text-sm text-gray-500">I usually respond within 24 hours.</p>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            id="name"
            name="name"
            className="peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder="Your Name"
            required
          />
          <label
            htmlFor="name"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-white px-1"
          >
            Full Name
          </label>
        </div>

        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            className="peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder="Email Address"
            required
          />
          <label
            htmlFor="email"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-white px-1"
          >
            Email Address
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            id="subject"
            name="subject"
            className="peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder="Project Subject"
            required
          />
          <label
            htmlFor="subject"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-white px-1"
          >
            Project Subject
          </label>
        </div>

        <div className="relative">
          <textarea
            id="message"
            name="message"
            rows={5}
            className="peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-900 placeholder-transparent focus:border-blue-600 focus:outline-none focus:ring-0"
            placeholder="Tell me about your project"
            required
          />
          <label
            htmlFor="message"
            className="pointer-events-none absolute left-4 top-4 text-gray-500 duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-white px-1"
          >
            Project details
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center rounded-lg py-3 px-6 font-semibold transition-colors duration-300 ${
            isSubmitting ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Sending…' : 'Send message'}
        </button>
      </form>

      {error && (
        <div className="mt-6 text-center p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      {showSuccess && (
        <div className="mt-6 text-center p-4 bg-green-100 text-green-800 rounded-lg">
          <p>{onSuccessMessage}</p>
        </div>
      )}
    </div>
  );
}
