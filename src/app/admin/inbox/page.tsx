import { redirect } from 'next/navigation'

export default function AdminInboxPage() {
  redirect('/admin?section=inbox')
}
