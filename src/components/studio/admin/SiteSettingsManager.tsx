'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react'
import { saveSiteSettings } from '@/app/actions/studio'
import type { SocialLink } from '@/lib/studio/sections'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-400'

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** Repeater for footer socials plus the contact email and availability badge. */
export default function SiteSettingsManager({
  contactEmail,
  availabilityStatus,
  socialLinks,
}: {
  contactEmail: string
  availabilityStatus: string
  socialLinks: SocialLink[]
}) {
  const router = useRouter()
  const [email, setEmail] = useState(contactEmail)
  const [availability, setAvailability] = useState(availabilityStatus)
  const [links, setLinks] = useState<SocialLink[]>(socialLinks)
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const update = (index: number, patch: Partial<SocialLink>) => {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= links.length) return
    setLinks((current) => {
      const next = [...current]
      const [link] = next.splice(index, 1)
      next.splice(target, 0, link)
      return next
    })
  }

  const add = () => {
    setLinks((current) => [
      ...current,
      {
        id: `link-${Date.now()}`,
        platform: 'website',
        label: 'New link',
        url: '',
        is_visible: true,
        sort_order: current.length,
      },
    ])
  }

  const remove = (index: number) => {
    setLinks((current) => current.filter((_, i) => i !== index))
  }

  const save = async () => {
    setSaving(true)
    setStatus(null)
    try {
      await saveSiteSettings({
        contactEmail: email,
        availabilityStatus: availability,
        socialLinks: links.map((link, index) => ({
          ...link,
          id: slugify(link.id || link.label) || `link-${index + 1}`,
          platform: slugify(link.platform || link.label) || 'website',
          sort_order: index,
        })),
      })
      setStatus('Site settings published.')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save the site settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-surface p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Contact &amp; availability</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-700">
            Contact email
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-xs text-slate-700">
            Availability status
            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Footer social links</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Visible links render in the footer in this order.
            </p>
          </div>
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add link
          </button>
        </div>

        <ul className="space-y-2">
          {links.map((link, index) => (
            <li
              key={`${link.id}-${index}`}
              className={`rounded-xl border p-3 ${
                link.is_visible ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50'
              }`}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-[11px] text-slate-600">
                  Label
                  <input
                    value={link.label}
                    onChange={(e) => update(index, { label: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block text-[11px] text-slate-600">
                  Platform
                  <input
                    value={link.platform}
                    onChange={(e) => update(index, { platform: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block text-[11px] text-slate-600 sm:col-span-2">
                  URL
                  <input
                    value={link.url}
                    onChange={(e) => update(index, { url: e.target.value })}
                    className={inputClass}
                  />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-md border border-slate-200 p-1 text-slate-500 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === links.length - 1}
                  className="rounded-md border border-slate-200 p-1 text-slate-500 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => update(index, { is_visible: !link.is_visible })}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700"
                >
                  {link.is_visible ? (
                    <EyeOff className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3 w-3" aria-hidden="true" />
                  )}
                  {link.is_visible ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-600"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" /> Remove
                </button>
              </div>
            </li>
          ))}
          {links.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
              No social links. Add one to replace the footer icon row.
            </li>
          )}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          {saving ? 'Publishing…' : 'Publish settings'}
        </button>
        {status && (
          <span className="text-[11px] font-medium text-slate-600" role="status">
            {status}
          </span>
        )}
      </div>
    </div>
  )
}
