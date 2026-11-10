'use client'

import React, { createContext, useContext, useState, useCallback, useId } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'success' | 'error' | 'info'
  duration?: number
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useCmsToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useCmsToast must be used within a CmsToastProvider')
  }
  return context
}

export function CmsToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ title, description, variant = 'success', duration = 4000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, title, description, variant, duration }
    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Notification Container */}
      <aside 
        aria-live="polite" 
        aria-label="System notifications" 
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              item.variant === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-950 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-100'
                : item.variant === 'info'
                ? 'bg-sky-50/95 border-sky-200 text-sky-950 dark:bg-sky-950/90 dark:border-sky-800 dark:text-sky-100'
                : 'bg-emerald-50/95 border-emerald-200 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.variant === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />}
              {item.variant === 'info' && <Info className="w-4 h-4 text-sky-600" aria-hidden="true" />}
              {item.variant === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{item.title}</p>
              {item.description && (
                <p className="text-xs text-slate-600 mt-0.5 leading-normal">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-overlay-soft transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  )
}
