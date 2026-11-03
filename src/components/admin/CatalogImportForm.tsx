'use client'

import { useState } from 'react'
import { importAnimeManga } from '@/app/actions/catalog'

export default function CatalogImportForm() {
  const [kind, setKind] = useState<'anime' | 'manga'>('anime')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(formData: FormData) {
    setPending(true)
    setMessage('')
    try {
      const result = await importAnimeManga(formData)
      setMessage(`${result.imported} ${result.kind} entries imported.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.')
    } finally {
      setPending(false)
    }
  }

  return <form className="gallery-form catalog-import-form" action={submit}><div className="catalog-import-controls"><label>Content type<select name="kind" value={kind} onChange={(event) => setKind(event.target.value as 'anime' | 'manga')}><option value="anime">Anime</option><option value="manga">Manga</option></select></label><label>JSON or XML file<input name="file" type="file" accept=".json,.xml,application/json,application/xml,text/xml" required /></label></div><button type="submit" disabled={pending}>{pending ? 'Importing…' : 'Import catalog'} <span>↗</span></button>{message && <p className="form-status" role="status">{message}</p>}<p className="form-help">Imports replace the selected catalog and map common MAL, AniList, and custom JSON/XML fields.</p></form>
}
