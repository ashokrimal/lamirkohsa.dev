import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getAdminActorId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { galleryItem } from '@/lib/db/schema'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CMS_CACHE_TAG, cmsCollectionTag } from '@/lib/cms-cache'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'

const MAX_IMAGE_SIZE = 12 * 1024 * 1024

function messageFor(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'The image could not be uploaded. Please try again.'
}

export async function POST(request: Request) {
  const ownerId = await getAdminActorId()
  if (!ownerId) return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 })

  try {
    const formData = await request.formData()
    const files = formData.getAll('file')
    if (!files.length || files.some((file) => !(file instanceof File) || !file.type.startsWith('image/'))) {
      return NextResponse.json({ error: 'Choose one or more image files from your device.' }, { status: 400 })
    }
    if (files.some((file) => (file as File).size === 0)) return NextResponse.json({ error: 'One of the selected files is empty. Choose it again.' }, { status: 400 })
    if (files.some((file) => (file as File).size > MAX_IMAGE_SIZE)) return NextResponse.json({ error: 'Each image must be smaller than 12MB.' }, { status: 413 })

    const title = String(formData.get('title') || '').trim() || null
    const category = String(formData.get('category') || '').trim() || 'Selected work'
    const timestamp = Date.now()
    const uploaded: string[] = []

    for (const [index, fileValue] of files.entries()) {
      const file = fileValue as File
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '') || `photo-${index + 1}.jpg`
      const blob = await put(`gallery/${ownerId}/${timestamp}-${index}-${safeName}`, file, { access: 'public' })
      const baseTitle = title || file.name.replace(/\.[^.]+$/, '') || `Photo ${index + 1}`
      const recordTitle = files.length > 1 && title ? `${title} ${index + 1}` : baseTitle
      const slug = `${recordTitle}-${timestamp}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      await db.insert(galleryItem).values({ userId: ownerId, title: recordTitle, slug, description: null, imageUrl: blob.url, category, featured: false, published: true })
      uploaded.push(blob.url)
    }

    revalidatePath('/about/gallery')
    revalidatePath('/media')
    revalidatePath('/admin')
    revalidateTag(CMS_CACHE_TAG)
    revalidateTag(cmsCollectionTag(CMS_COLLECTIONS.gallery))
    return NextResponse.json({ urls: uploaded, count: uploaded.length })
  } catch (error) {
    console.error('[v0] Gallery upload failed:', error)
    return NextResponse.json({ error: messageFor(error) }, { status: 502 })
  }
}
