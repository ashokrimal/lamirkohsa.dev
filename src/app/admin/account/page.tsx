import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/** The owner account now lives inside Settings. */
export default function AdminAccountAliasPage() {
  redirect('/admin/settings')
}
