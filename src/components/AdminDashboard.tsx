'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Buffer } from 'buffer';
import MessagesTable, { Message } from '@/components/MessagesTable';

const ADMIN_EMAIL = 'admin@lamirkohsa.dev';
const ADMIN_PASSWORD = 'ashokrimal#9847177515';

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total messages',
    description: 'All inbound requests collected from your contact form.',
  },
  {
    key: 'recent',
    label: 'Last message',
    description: 'The most recent inquiry you have received.',
  },
  {
    key: 'unique',
    label: 'Unique senders',
    description: 'Distinct email addresses who have contacted you.',
  },
];

export default function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authHeader, setAuthHeader] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!authHeader) return;
    setFetchError(null);
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/messages', {
        headers: { Authorization: authHeader },
        cache: 'no-store',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to load messages.');
      }

      const data = (await response.json()) as Message[];
      setMessages(data);
      if (data.length > 0) {
        setSelectedId(prev => (prev && data.some(message => message.id === prev) ? prev : data[0].id));
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages.';
      setFetchError(message);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    if (!authHeader) return;
    setIsLoading(true);
    fetchMessages();
  }, [authHeader, fetchMessages]);

  const stats = useMemo(() => {
    const total = messages.length;
    const unique = new Set(messages.map(message => message.email)).size;
    const recent = messages[0]?.createdAt ?? null;
    return { total, unique, recent };
  }, [messages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const encoded = typeof window !== 'undefined' && typeof window.btoa === 'function'
        ? window.btoa(`${email}:${password}`)
        : Buffer.from(`${email}:${password}`).toString('base64');
      setAuthHeader(`Basic ${encoded}`);
      setError(null);
    } else {
      setError('Invalid credentials.');
    }
  };

  if (!authHeader) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-lg">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Secure access</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Portfolio Admin</h1>
            <p className="mt-3 text-sm text-gray-600">
              Enter the credentials to view and manage contact form submissions.
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder="admin@lamirkohsa.dev"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 transition"
            >
              Access dashboard
            </button>
          </form>

          {error && <p className="mt-6 text-center text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-white p-10 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Contact inbox</p>
            <h1 className="mt-3 text-4xl font-black text-gray-900">Welcome back, Ashok 👋</h1>
            <p className="mt-4 max-w-2xl text-base text-gray-600">
              Every form submission lands here. Review inquiries, follow up directly, and keep tabs on who&apos;s interested in collaborating.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STAT_CARDS.map(card => (
            <div key={card.key} className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                {card.key === 'total' && stats.total}
                {card.key === 'unique' && stats.unique}
                {card.key === 'recent' && (stats.recent ? new Date(stats.recent).toLocaleString() : '—')}
              </p>
              <p className="mt-2 text-xs text-gray-500">{card.description}</p>
            </div>
          ))}
        </div>
      </header>

      <MessagesTable
        messages={messages}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRefresh={fetchMessages}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        error={fetchError}
      />
    </div>
  );
}
