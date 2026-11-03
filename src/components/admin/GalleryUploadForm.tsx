'use client'

import { useState } from 'react'

export default function GalleryUploadForm() {
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(formData: FormData) {
    setPending(true); setStatus('')
    try { const response = await fetch('/api/gallery/upload', { method: 'POST', body: formData }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Upload failed.'); setStatus(`Uploaded ${result.url.split('/').pop()}. Add the URL to the gallery form to publish it.`) } catch (error) { setStatus(error instanceof Error ? error.message : 'Upload failed.') } finally { setPending(false) }
  }
  return <form className="gallery-upload-form" action={submit}><div className="upload-dropzone"><strong>Upload a gallery photo</strong><span>Choose from your device or use the camera on mobile.</span><input name="file" type="file" accept="image/*" capture="environment" required /></div><label>Title <span>(optional)</span><input name="title" placeholder="Untitled frame" /></label><label>Category<input name="category" defaultValue="Selected work" /></label><button type="submit" disabled={pending}>{pending ? 'Uploading…' : 'Upload and publish'} <span>↗</span></button>{status && <p className="form-status" role="status">{status}</p>}</form>
}
