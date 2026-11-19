/**
 * Client-side image preparation for studio uploads.
 *
 * Phone photos are routinely larger than the 4.5 MB request body a serverless
 * function accepts, so the raw file never reaches `/api/admin/upload` and the
 * upload appears to fail. Downscaling and re-encoding large images in the
 * browser keeps every device upload inside the limit. Anything the browser
 * cannot decode is returned untouched and the server reports a clear error.
 */

/** Hard ceiling the deployment route accepts for images. */
export const IMAGE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024
/** What the browser aims for, leaving room for multipart overhead. */
export const IMAGE_UPLOAD_TARGET_BYTES = 3.2 * 1024 * 1024
/** Files under this size upload as they are. */
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024
const MAX_DIMENSION = 2200

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // Fall through to the <img> decoder (some formats are unsupported here).
    }
  }

  return await new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    image.src = url
  })
}

async function encode(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

/**
 * Returns a file that is safe to POST: smaller images are passed through, and
 * large photos are resized to at most 2200px and compressed under the target.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file
  if (file.size <= SKIP_BELOW_BYTES) return file
  if (typeof document === 'undefined') return file

  try {
    const source = await decodeImage(file)
    if (!source) return file

    const sourceWidth =
      source instanceof HTMLImageElement ? source.naturalWidth : source.width
    const sourceHeight =
      source instanceof HTMLImageElement ? source.naturalHeight : source.height
    if (!sourceWidth || !sourceHeight) return file

    const scale = Math.min(1, MAX_DIMENSION / Math.max(sourceWidth, sourceHeight))
    const width = Math.max(1, Math.round(sourceWidth * scale))
    const height = Math.max(1, Math.round(sourceHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file

    context.drawImage(source as CanvasImageSource, 0, 0, width, height)
    if (source instanceof ImageBitmap) source.close()

    let quality = 0.86
    let blob: Blob | null = null
    for (let attempt = 0; attempt < 4; attempt += 1) {
      blob = await encode(canvas, quality)
      if (blob && blob.size <= IMAGE_UPLOAD_TARGET_BYTES) break
      quality -= 0.14
    }

    if (!blob) return file
    if (blob.size >= file.size && file.size <= IMAGE_UPLOAD_MAX_BYTES) return file

    const name = `${file.name.replace(/\.[^.]+$/, '') || 'upload'}.jpg`
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}

/** Turns a failed upload response into a message the owner can act on. */
export function uploadErrorMessage(
  response: Response,
  payload: { error?: unknown },
): string {
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
  if (response.status === 413) {
    return 'That file is too large to send. Try a smaller image (under 4 MB).'
  }
  if (response.status === 401) return 'Your studio session expired. Sign in again and retry.'
  if (response.status === 503) {
    return 'Device uploads are not configured on this deployment. Paste an image URL instead.'
  }
  return `Upload failed (${response.status}). Please try again.`
}
