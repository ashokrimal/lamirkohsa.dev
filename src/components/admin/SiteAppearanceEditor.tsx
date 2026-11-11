'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2 } from 'lucide-react'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { saveHeroSettings, saveSiteChromeSettings } from '@/app/actions/site-admin'

type Payload = Record<string, unknown> | undefined
type LinkRow = { label: string; href: string; kind?: string }

const inputClass =
  'mt-1 w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none'

function text(payload: Payload, key: string) {
  const value = payload?.[key]
  return typeof value === 'string' ? value : ''
}

function linkRows(payload: Payload, key: string): LinkRow[] {
  const value = payload?.[key]
  if (!Array.isArray(value)) return []
  return value
    .map((row) => ({
      label: typeof row?.label === 'string' ? row.label : '',
      href: typeof row?.href === 'string' ? row.href : '',
      ...(typeof row?.kind === 'string' ? { kind: row.kind } : {}),
    }))
    .filter((row) => row.label || row.href)
}

function LinkList({
  title,
  hint,
  rows,
  onChange,
  withKind = false,
}: {
  title: string
  hint: string
  rows: LinkRow[]
  onChange: (rows: LinkRow[]) => void
  withKind?: boolean
}) {
  const update = (index: number, patch: Partial<LinkRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-500">{hint}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...rows, { label: '', href: '' }])}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Add link
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-500">
          No links yet. The footer section stays hidden until one is added.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className={`grid gap-2 ${withKind ? 'sm:grid-cols-[1fr_1.4fr_0.8fr_auto]' : 'sm:grid-cols-[1fr_1.4fr_auto]'}`}>
              <input
                aria-label={`${title} label ${index + 1}`}
                value={row.label}
                onChange={(event) => update(index, { label: event.target.value })}
                placeholder="Label"
                className={inputClass}
              />
              <input
                aria-label={`${title} URL ${index + 1}`}
                value={row.href}
                onChange={(event) => update(index, { href: event.target.value })}
                placeholder="/media or https://…"
                className={inputClass}
              />
              {withKind && (
                <input
                  aria-label={`${title} icon ${index + 1}`}
                  value={row.kind ?? ''}
                  onChange={(event) => update(index, { kind: event.target.value })}
                  placeholder="github"
                  className={inputClass}
                />
              )}
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label={`Remove ${row.label || 'link'}`}
                className="mt-1 inline-flex h-9 w-9 items-center justify-center self-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Edits the two pieces of site chrome the owner changes most often: the hero
 * image/copy and the footer link columns. Each save merges into the same Site
 * Settings records the public layout already reads.
 */
export default function SiteAppearanceEditor({
  hero,
  navigation,
  footer,
}: {
  hero?: Payload
  navigation?: Payload
  footer?: Payload
}) {
  const router = useRouter()
  const [heroImage, setHeroImage] = useState(text(hero, 'imageUrl'))
  const [footerLinks, setFooterLinks] = useState<LinkRow[]>(() => linkRows(navigation, 'footer'))
  const [collectionLinks, setCollectionLinks] = useState<LinkRow[]>(() => linkRows(navigation, 'collections'))
  const [socialLinks, setSocialLinks] = useState<LinkRow[]>(() => linkRows(navigation, 'socials'))
  const [heroStatus, setHeroStatus] = useState<string | null>(null)
  const [chromeStatus, setChromeStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState<'hero' | 'chrome' | null>(null)

  const submitHero = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving('hero')
    setHeroStatus(null)
    try {
      const result = await saveHeroSettings(new FormData(event.currentTarget))
      setHeroStatus(result.ok ? 'Hero saved.' : result.error)
      if (result.ok) router.refresh()
    } finally {
      setSaving(null)
    }
  }

  const submitChrome = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving('chrome')
    setChromeStatus(null)
    try {
      const formData = new FormData(event.currentTarget)
      formData.set('footerLinks', JSON.stringify(footerLinks))
      formData.set('collectionLinks', JSON.stringify(collectionLinks))
      formData.set('socialLinks', JSON.stringify(socialLinks))
      const result = await saveSiteChromeSettings(formData)
      setChromeStatus(result.ok ? 'Footer saved.' : result.error)
      if (result.ok) router.refresh()
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submitHero} className="rounded-2xl border border-slate-200/90 bg-surface p-5 md:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Hero</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            The homepage headline, supporting line and portrait image.
          </p>
        </div>

        <label className="block text-xs text-slate-700">
          Heading
          <input name="heading" defaultValue={text(hero, 'heading')} className={inputClass} />
        </label>

        <label className="block text-xs text-slate-700">
          Subtitle
          <textarea name="subtitle" rows={2} defaultValue={text(hero, 'subtitle')} className={inputClass} />
        </label>

        <ImageUploadField
          label="Hero image"
          name="imageUrl"
          value={heroImage}
          onChange={setHeroImage}
          hint="Shown behind the hero copy. Upload a portrait or wide image."
        />

        <label className="block text-xs text-slate-700">
          Image alt text
          <input name="imageAlt" defaultValue={text(hero, 'imageAlt')} className={inputClass} />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-700">
            Location
            <textarea
              name="location"
              rows={2}
              defaultValue={text(hero, 'location')}
              className={inputClass}
            />
          </label>
          <label className="block text-xs text-slate-700">
            Initials (fallback when no image)
            <input name="initials" defaultValue={text(hero, 'initials')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Meta left
            <input name="metaLeft" defaultValue={text(hero, 'metaLeft')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Meta right
            <input name="metaRight" defaultValue={text(hero, 'metaRight')} className={inputClass} />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          {heroStatus && <p className="text-[11px] text-slate-600">{heroStatus}</p>}
          <button type="submit" disabled={saving === 'hero'} className="apple-btn-primary ml-auto disabled:opacity-60">
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {saving === 'hero' ? 'Saving…' : 'Save hero'}
          </button>
        </div>
      </form>

      <form onSubmit={submitChrome} className="rounded-2xl border border-slate-200/90 bg-surface p-5 md:p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Footer & navigation</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Keep the footer structure and change where each link goes. Empty columns stay hidden.
          </p>
        </div>

        <LinkList
          title="Footer links"
          hint="The Navigate column."
          rows={footerLinks}
          onChange={setFooterLinks}
        />
        <LinkList
          title="Collection links"
          hint="The Collections column."
          rows={collectionLinks}
          onChange={setCollectionLinks}
        />
        <LinkList
          title="Social links"
          hint="Icons beside the footer brand."
          rows={socialLinks}
          onChange={setSocialLinks}
          withKind
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-700">
            Tagline
            <textarea name="tagline" rows={2} defaultValue={text(footer, 'tagline')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Availability label
            <input name="availabilityLabel" defaultValue={text(footer, 'availabilityLabel')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Availability text
            <input name="availabilityText" defaultValue={text(footer, 'availabilityText')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            CTA label
            <input name="ctaLabel" defaultValue={text(footer, 'ctaLabel')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            CTA link
            <input name="ctaHref" defaultValue={text(footer, 'ctaHref')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Copyright name
            <input name="copyrightName" defaultValue={text(footer, 'copyrightName')} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Canonical line
            <input name="canonical" defaultValue={text(footer, 'canonical')} className={inputClass} />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          {chromeStatus && <p className="text-[11px] text-slate-600">{chromeStatus}</p>}
          <button type="submit" disabled={saving === 'chrome'} className="apple-btn-primary ml-auto disabled:opacity-60">
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {saving === 'chrome' ? 'Saving…' : 'Save footer'}
          </button>
        </div>
      </form>
    </div>
  )
}
