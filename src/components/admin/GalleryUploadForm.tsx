'use client'

import { useState } from 'react'

type DriveFile = { id?: string | null; name?: string | null; thumbnailLink?: string | null }

export default function GalleryUploadForm() {
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState(false)
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [driveOpen, setDriveOpen] = useState(false)
  async function submit(formData: FormData) { setPending(true); setStatus(''); try { const response = await fetch('/api/gallery/upload', { method: 'POST', body: formData }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Upload failed.'); setStatus('Photo published.') } catch (error) { setStatus('Upload failed. Please try again.') } finally { setPending(false) } }
  async function openDrive() { setDriveOpen(true); setStatus('Loading Drive photos…'); const response = await fetch('/api/gallery/drive'); const result = await response.json(); if (!response.ok) setStatus(result.error || 'Drive is unavailable.'); else { setDriveFiles(result.files); setStatus('') } }
  async function importDrive(fileId: string) { setPending(true); const response = await fetch('/api/gallery/drive', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fileId }) }); const result = await response.json(); setStatus(response.ok ? 'Drive photo published.' : result.error || 'Drive import failed.'); setPending(false) }
  return <div className="gallery-upload-stack"><form className="gallery-upload-form" action={submit}><div className="upload-dropzone"><strong>Upload a gallery photo</strong><span>Choose from your device or use the camera on mobile.</span><input name="file" type="file" accept="image/*" capture="environment" required /></div><label>Title <span>(optional)</span><input name="title" placeholder="Untitled frame" /></label><label>Category<input name="category" defaultValue="Selected work" /></label><button type="submit" disabled={pending}>{pending ? 'Uploading…' : 'Upload and publish'} <span>↗</span></button></form><button className="button button-quiet" type="button" onClick={openDrive} disabled={pending}>Choose from Google Drive <span>↗</span></button>{driveOpen && <div className="drive-picker" aria-label="Google Drive photos">{driveFiles.map((file) => <button type="button" key={file.id} onClick={() => file.id && importDrive(file.id)} disabled={pending}>{file.thumbnailLink && <img src={file.thumbnailLink} alt="" />}<span>{file.name}</span></button>)}{!driveFiles.length && !status && <p>No image files found in Drive.</p>}</div>}{status && <p className="form-status" role="status">{status}</p>}</div>
}
