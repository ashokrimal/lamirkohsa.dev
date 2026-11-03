'use client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
export default function AdminSignOut() { const router = useRouter(); return <button className="signout-button" onClick={async () => { await authClient.signOut(); router.push('/'); router.refresh() }}>Sign out</button> }
