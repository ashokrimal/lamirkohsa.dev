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
  const isAudio =
    file instanceof File &&
    (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(file.name))
  const isPdf = file instanceof File && file.type === 'application/pdf'
  if (!(isImage || isAudio || isPdf)) {
    return NextResponse.json({ error: 'Please upload an image, audio track or PDF file.' }, { status: 400 })
  }
  const sizeLimit = isAudio ? 30 : isPdf ? 20 : 8
  if (file.size > sizeLimit * 1024 * 1024) {
    return NextResponse.json(
      { error: isAudio ? 'Audio tracks must be smaller than 30MB.' : isPdf ? 'PDFs must be smaller than 20MB.' : 'Images must be smaller than 8MB.' },
      { status: 400 },
    )
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '') || 'upload-file'
  try {
    const blob = await put(`site/${ownerId}/${Date.now()}-${safeName}`, file, { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ url: blob.url, kind: isAudio ? 'audio' : isPdf ? 'pdf' : 'image' })
  } catch (error) {
    console.error('[v0] File upload failed:', error)
    return NextResponse.json({ error: 'File upload failed. Please try again.' }, { status: 502 })
  }
}
