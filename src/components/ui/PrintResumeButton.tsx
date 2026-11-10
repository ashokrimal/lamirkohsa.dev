'use client'

import { Printer } from 'lucide-react'

/**
 * Triggers the browser's print dialog, which is where a PDF copy of the resume
 * is produced. The button itself is hidden by the print stylesheet.
 */
export function PrintResumeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="apple-btn-primary"
      data-print-hide
    >
      <Printer className="w-4 h-4" />
      <span>Download PDF</span>
    </button>
  )
}
