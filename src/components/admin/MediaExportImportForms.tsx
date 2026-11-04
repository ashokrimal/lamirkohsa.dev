'use client'

import { useState } from 'react'
import { importMovieExport, importMusicExport } from '@/app/actions/catalog'

function ImportCard({ kind, action, accept, help }: { kind: 'music' | 'movies'; action: (data: FormData) => Promise<{ imported: number }>; accept: string; help: string }) {
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(data: FormData) { setPending(true); setMessage(''); try { const result = await action(data); setMessage(`${result.imported} ${kind} imported.`) } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed.') } finally { setPending(false) } }
  return <form className="cms-import-card" action={submit}><div><p className="section-label">{kind === 'music' ? 'Music library' : 'Movie library'}</p><h3>Import {kind}</h3><p>{help}</p></div><label>Export file<input name="file" type="file" accept={accept} required /></label><button type="submit" disabled={pending}>{pending ? 'Importing…' : `Import ${kind}`} ↗</button>{message && <p className="form-status" role="status">{message}</p>}</form>
}

export default function MediaExportImportForms() { return <div className="cms-import-grid"><ImportCard kind="music" action={importMusicExport} accept=".json,application/json" help="Spotify Extended Streaming History or YouTube Music Takeout JSON." /><ImportCard kind="movies" action={importMovieExport} accept=".csv,text/csv" help="IMDb ratings or watchlist CSV export." /></div> }
