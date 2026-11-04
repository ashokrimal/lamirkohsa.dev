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
  const files = formData.getAll('file')
  if (!files.length || files.some((file) => !(file instanceof File) || !file.type.startsWith('image/'))) return NextResponse.json({ error: 'Choose one or more image files.' }, { status: 400 })
  if (files.some((file) => (file as File).size > 12 * 1024 * 1024)) return NextResponse.json({ error: 'Each image must be smaller than 12MB.' }, { status: 400 })
  const title = String(formData.get('title') || '').trim() || null
  const category = String(formData.get('category') || '').trim() || 'Selected work'
  const uploaded = []
  for (const [index, fileValue] of files.entries()) { const file = fileValue as File; const blob = await put(`gallery/${session.user.id}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`, file, { access: 'public' }); const slug = `${title || file.name.replace(/\.[^.]+$/, '') || 'photo'}-${Date.now()}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); await db.insert(galleryItem).values({ userId: session.user.id, title: files.length > 1 ? (title ? `${title} ${index + 1}` : file.name.replace(/\.[^.]+$/, '')) : title, slug, description: null, imageUrl: blob.url, category, featured: false, published: true }); uploaded.push(blob.url) }
  revalidatePath('/gallery'); revalidatePath('/media'); revalidatePath('/admin')
  return NextResponse.json({ urls: uploaded, count: uploaded.length })
}
