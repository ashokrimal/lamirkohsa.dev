import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { ADMIN_OWNER_ID, hasAdminSession } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const ownerId = session?.user?.id ?? ((await hasAdminSession()) ? ADMIN_OWNER_ID : null)
  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  const isImage = file instanceof File && file.type.startsWith('image/')
  const isPdf = file instanceof File && file.type === 'application/pdf'
  if (!(isImage || isPdf)) return NextResponse.json({ error: 'Please upload an image or PDF file.' }, { status: 400 })
  if (file.size > (isPdf ? 20 : 8) * 1024 * 1024) return NextResponse.json({ error: isPdf ? 'PDFs must be smaller than 20MB.' : 'Images must be smaller than 8MB.' }, { status: 400 })
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '') || 'upload-image'
  try {
    const blob = await put(`site/${ownerId}/${Date.now()}-${safeName}`, file, { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[v0] Image upload failed:', error)
    return NextResponse.json({ error: 'Image upload failed. Please try again.' }, { status: 502 })
  }
}
