import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !file.type.startsWith('image/')) return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 })
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Images must be smaller than 8MB.' }, { status: 400 })
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '') || 'upload-image'
  try {
    const blob = await put(`site/${session.user.id}/${Date.now()}-${safeName}`, file, { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[v0] Image upload failed:', error)
    return NextResponse.json({ error: 'Image upload failed. Please try again.' }, { status: 502 })
  }
}
