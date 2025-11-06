'use client';

import { useMemo } from 'react';

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

type MessagesTableProps = {
  messages: Message[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isLoading: boolean;
  error: string | null;
};

const formatDateTime = (isoString: string) =>
  new Date(isoString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function MessagesTable({
  messages,
  selectedId,
  onSelect,
  onRefresh,
  isRefreshing,
  isLoading,
  error,
}: MessagesTableProps) {
  const selectedMessage = useMemo(
    () => messages.find(message => message.id === selectedId) ?? null,
    [messages, selectedId]
  );

  const handleCopyEmail = async (email: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(email);
      } catch (_error) {
        console.error('Unable to copy email address');
      }
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <p className="text-base font-semibold">{error}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-6 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-4 w-full animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">No messages yet</h2>
        <p className="mt-3 text-sm text-gray-600">
          Once someone reaches out through your contact form, their message will appear here.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-6 inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="lg:hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Inbox</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {messages.length} message{messages.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold transition ${
              isRefreshing
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : 'text-gray-700 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {messages.map(message => {
          const isActive = message.id === selectedId;
          const initials = message.name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={message.id}
              className={`rounded-2xl border p-5 shadow-sm transition ${
                isActive ? 'border-blue-200 bg-blue-50/60' : 'border-gray-200 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(message.id)}
                className="flex w-full items-start gap-4 text-left"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {initials}
                </span>
                <span className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="truncate text-sm font-semibold text-gray-900">{message.name}</p>
                    <span className="whitespace-nowrap text-xs text-gray-500">{formatDateTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-blue-600">{message.email}</p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{message.subject}</p>
                </span>
              </button>

              {isActive && (
                <div className="mt-4 space-y-4 border-t border-blue-100 pt-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {selectedMessage?.message}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                    >
                      Reply via email
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(message.email)}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      Copy email address
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Inbox</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {messages.length} message{messages.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold transition ${
                isRefreshing
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'text-gray-700 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="max-h-[540px] overflow-y-auto divide-y divide-gray-100">
            {messages.map(message => {
              const isActive = message.id === selectedId;
              const initials = message.name
                .split(' ')
                .map(part => part.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => onSelect(message.id)}
                  className={`flex w-full items-start gap-4 px-6 py-4 text-left transition ${
                    isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{message.name}</p>
                      <span className="whitespace-nowrap text-xs text-gray-500">{formatDateTime(message.createdAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-blue-600">{message.email}</p>
                    <p className="mt-2 overflow-hidden text-sm text-gray-600 text-ellipsis whitespace-nowrap">
                      {message.subject}
                    </p>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {selectedMessage ? (
            <>
              <div className="border-b border-gray-100 px-6 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Message details</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{selectedMessage.name}</span>
                  <span className="hidden text-gray-300 md:inline">•</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                  <span className="hidden text-gray-300 md:inline">•</span>
                  <span>{formatDateTime(selectedMessage.createdAt)}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="whitespace-pre-line text-base leading-relaxed text-gray-700">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-6 py-4">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  Reply via email
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyEmail(selectedMessage.email)}
                  className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition"
                >
                  Copy email address
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-12 text-center text-gray-500">
              <h2 className="text-lg font-semibold text-gray-700">Select a message</h2>
              <p className="max-w-sm text-sm text-gray-500">
                Choose a message from the inbox to view the full details, respond, or copy the sender’s email.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
