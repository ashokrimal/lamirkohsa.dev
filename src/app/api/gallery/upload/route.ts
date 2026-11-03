import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { galleryItem } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !file.type.startsWith('image/')) return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 })
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: 'Images must be smaller than 12MB.' }, { status: 400 })
  const blob = await put(`gallery/${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`, file, { access: 'public' })
  const title = String(formData.get('title') || '').trim() || null
  const category = String(formData.get('category') || '').trim() || 'Selected work'
  const slug = `${title || 'photo'}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  await db.insert(galleryItem).values({ userId: session.user.id, title, slug, description: null, imageUrl: blob.url, category, featured: false, published: true })
  revalidatePath('/gallery'); revalidatePath('/media'); revalidatePath('/admin')
  return NextResponse.json({ url: blob.url })
}
