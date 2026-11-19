import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getAdminActorId } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Vercel Blob accepts either the store integration name or the legacy name,
 * depending on how the store was attached to the project.
 */
function blobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ||
    ''
  )
}

export async function POST(request: Request) {
  const ownerId = await getAdminActorId()
  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = blobToken()
  if (!token) {
    return NextResponse.json(
      {
        error:
          'Device uploads need Blob storage. Add BLOB_READ_WRITE_TOKEN to the deployment, or paste an image URL instead.',
      },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      {
        error:
          'The upload could not be read. Very large files are rejected before they reach the studio — try a smaller image.',
      },
      { status: 413 },
    )
  }

  const file = formData.get('file')
  const isImage = file instanceof File && file.type.startsWith('image/')
  const isAudio =
    file instanceof File &&
    (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(file.name))
  const isPdf = file instanceof File && file.type === 'application/pdf'
  if (!(isImage || isAudio || isPdf)) {
    return NextResponse.json(
      { error: 'Please upload an image, audio track or PDF file.' },
      { status: 400 },
    )
  }

  // The deployment platform rejects request bodies above ~4.5 MB before this
  // handler runs, so the image ceiling stays below it. The studio resizes
  // device photos in the browser to fit.
  const sizeLimit = isAudio ? 30 : isPdf ? 20 : 4
  if (file.size > sizeLimit * 1024 * 1024) {
    return NextResponse.json(
      {
        error: isAudio
          ? 'Audio tracks must be smaller than 30MB.'
          : isPdf
            ? 'PDFs must be smaller than 20MB.'
            : 'Images must be smaller than 4MB. The studio shrinks device photos automatically — try again, or paste an image URL.',
      },
      { status: 400 },
    )
  }

  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '') || 'upload-file'

  try {
    const blob = await put(`site/${ownerId}/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: false,
      token,
    })
    return NextResponse.json({
      url: blob.url,
      kind: isAudio ? 'audio' : isPdf ? 'pdf' : 'image',
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error('[studio] File upload failed:', detail)

    // The token env var can outlive the store it came from, so point the owner
    // at the actual fix instead of a generic "try again".
    let message = 'File upload failed. Please try again.'
    if (/not found|deleted|does not exist|no such store/i.test(detail)) {
      message =
        'The Blob store linked to this deployment no longer exists. Create a Blob store in Vercel → Storage, connect it to this project so BLOB_READ_WRITE_TOKEN is issued, then redeploy. You can paste an image URL in the meantime.'
    } else if (/private/i.test(detail) && /access/i.test(detail)) {
      message =
        'The connected Blob store is private, so images cannot be served publicly. Connect a public Blob store to this project and redeploy, or paste an image URL instead.'
    } else if (/token|unauthorized|forbidden|access|permission/i.test(detail)) {
      message =
        'Blob storage rejected the upload. Check that BLOB_READ_WRITE_TOKEN belongs to an active Vercel Blob store, or paste an image URL instead.'
    }

    return NextResponse.json({ error: message }, { status: 502 })
  }
}
