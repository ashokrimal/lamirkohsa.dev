'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { resolveUiStrings, uiStrings, type UiCopyOverrides } from '@/lib/ui-strings'

const UiCopyContext = createContext<typeof uiStrings>(uiStrings)

/**
 * Supplies the CMS-resolved interface strings to client components. The root
 * layout passes the plain override map it read on the server, so a label edited
 * in the studio reaches the browser without sending functions across the
 * server/client boundary.
 */
export function UiCopyProvider({
  overrides,
  children,
}: {
  overrides: UiCopyOverrides
  children: ReactNode
}) {
  const value = useMemo(() => resolveUiStrings(overrides), [overrides])
  return <UiCopyContext.Provider value={value}>{children}</UiCopyContext.Provider>
}

export function useUiStrings(): typeof uiStrings {
  return useContext(UiCopyContext)
}
