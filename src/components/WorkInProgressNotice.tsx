'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY = 'work-in-progress-notice-dismissed';

export default function WorkInProgressNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-20 z-40 mx-4 md:mx-auto md:max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-100 via-white to-amber-50 px-6 py-5 shadow-xl">
        <div className="flex items-start gap-4 pr-10">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600">Heads up</p>
            <p className="mt-2 text-sm text-amber-700">
              This portfolio is still in active development. Some sections are getting polished, so you might run into unfinished pieces while I build in public.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss work in progress notice"
          className="absolute right-4 top-4 rounded-full p-1.5 text-amber-500 transition hover:bg-amber-100 hover:text-amber-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
