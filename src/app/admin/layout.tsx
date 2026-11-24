import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AdminSessionKeepAlive from '@/components/admin/AdminSessionKeepAlive'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Renews a remembered session on every studio visit, so the owner is not
          sent back to sign-in while they keep using the studio. */}
      <AdminSessionKeepAlive />
      {children}
    </>
  )
}
