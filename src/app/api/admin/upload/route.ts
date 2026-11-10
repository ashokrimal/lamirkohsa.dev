import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getAdminActorId } from '@/lib/admin-auth'

export async function POST(request: Request) {

  const ownerId = await getAdminActorId()
  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'Device uploads need Blob storage. Add BLOB_READ_WRITE_TOKEN to the deployment, or paste an image URL instead.',
      },
      { status: 503 },
    )
  }
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
