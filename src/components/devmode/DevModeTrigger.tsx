'use client';

import { useDevMode } from '@/contexts/DevModeContext';

export default function DevModeTrigger() {
  const { mode, setMode } = useDevMode();

  if (mode === 'classic') {
    return (
      <button
        type="button"
        onClick={() => setMode('dev')}
        className="hidden md:inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-500/20"
      >
        <span className="font-mono text-sm text-blue-700">&lt;/dev&gt;</span>
      </button>
    );
  }

  // In dev mode, show a simple indicator
  return (
    <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-green-300/60 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600">
      DEV MODE
    </span>
  );

  return null;
}
