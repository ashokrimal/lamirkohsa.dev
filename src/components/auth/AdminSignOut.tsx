'use client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
export default function AdminSignOut() { const router = useRouter(); return <Button variant="ghost" className="signout-button" onClick={async () => { await authClient.signOut(); router.push('/'); router.refresh() }}>Sign out</Button> }
