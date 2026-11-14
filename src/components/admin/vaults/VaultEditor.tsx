'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { CmsModal } from '@/components/admin/ui/CmsModal'
import {
  CmsFormField,
  CmsInput,
  CmsSelect,
  CmsTagInput,
  CmsTextarea,
  CmsToggle,
} from '@/components/admin/ui/CmsFormPrimitives'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { createCmsContent, updateCmsContent } from '@/app/actions/content-cms'
import type { VaultDefinition, VaultField, VaultRecord } from '@/lib/admin-vaults'
import AudioUploadField from '@/components/admin/vaults/AudioUploadField'
import MarkdownField from '@/components/admin/vaults/MarkdownField'

type FieldValue = string | boolean | number | string[]

function initialValue(field: VaultField, payload: Record<string, unknown>, record?: VaultRecord): FieldValue {
  if (field.type === 'json') return JSON.stringify(record?.payload ?? {}, null, 2)
  if (field.type === 'key') return typeof payload.key === 'string' ? payload.key : ''
  if (field.type === 'boolean') return payload[field.key] === true
  if (field.type === 'tags') {
    const value = payload[field.key]
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  }
  if (field.type === 'number') {
    const value = payload[field.key]
    return typeof value === 'number' ? value : ''
  }
  const value = payload[field.key]
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

export default function VaultEditor({
  vault,
  fields,
  record,
  collection,
  keyed,
  onClose,
  onSaved,
}: {
  vault: VaultDefinition
  fields: VaultField[]
  record?: VaultRecord
  collection: string
  keyed?: boolean
  onClose: () => void
  onSaved: (record: VaultRecord) => void
}) {
  const payload = record?.payload ?? {}
  const [title, setTitle] = useState(record?.title ?? '')
  const [status, setStatus] = useState(record?.status === 'published' ? 'published' : 'draft')
  const [values, setValues] = useState<Record<string, FieldValue>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, initialValue(field, payload, record)])),
  )
  const [keyValue, setKeyValue] = useState(typeof payload.key === 'string' ? payload.key : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = (key: string, value: FieldValue) =>
    setValues((current) => ({ ...current, [key]: value }))

  const save = async () => {
    if (!title.trim()) {
      setError('Give this item a title before saving.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      let nextPayload: Record<string, unknown> = record ? { ...record.payload } : {}

      for (const field of fields) {
        const value = values[field.key]
        if (field.type === 'json') {
          const raw = typeof value === 'string' ? value.trim() : ''
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                nextPayload = { ...nextPayload, ...(parsed as Record<string, unknown>) }
              } else {
                throw new Error('not an object')
              }
            } catch {
              throw new Error(`${field.label} must be a valid JSON object.`)
            }
          }
          continue
        }
        if (field.type === 'key') continue
        if (field.type === 'number') {
          nextPayload[field.key] = value === '' ? undefined : Number(value)
        } else {
          nextPayload[field.key] = value
        }
      }

      if (keyed) {
        if (!keyValue.trim()) throw new Error('A key is required for this collection.')
        nextPayload.key = keyValue.trim().toLowerCase()
      }

      const formData = new FormData()
      formData.set('collection', collection)
      formData.set('title', title.trim())
      formData.set('status', status)
      formData.set('payload', JSON.stringify(nextPayload))
      if (keyed) formData.set('key', keyValue.trim().toLowerCase())

      if (record) {
        await updateCmsContent(record.id, formData)
        onSaved({
          ...record,
          collection,
          title: title.trim(),
          status,
          payload: nextPayload,
        })
      } else {
        await createCmsContent(formData)
        onSaved({
          id: -Date.now(),
          collection,
          title: title.trim(),
          status,
          payload: nextPayload,
        })
      }
      onClose()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <CmsModal
      isOpen
      onClose={onClose}
      title={record ? `Edit ${vault.itemNoun.replace(/s$/, '')}` : vault.addLabel}
      description={
        record
          ? `Update “${record.title}” in the ${vault.title.toLowerCase()}. Changes are saved to the CMS.`
          : `Create a new item in ${collection}. It starts in the state you choose below.`
      }
      maxWidth="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : record ? 'Save changes' : 'Create item'}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <CmsFormField label="Title" required>
            <CmsInput
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={`Name this ${vault.itemNoun.replace(/s$/, '')}`}
              autoFocus
            />
          </CmsFormField>
        </div>

        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Collection</span>
            <span className="rounded-md bg-white px-2 py-0.5 font-medium text-slate-700 shadow-xs">{collection}</span>
          </div>
          <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>

        {fields.map((field) => {
          if (field.type === 'key') {
            return (
              <div key={field.key} className="sm:col-span-2">
                <CmsFormField label={field.label} hint={field.help} required={keyed}>
                  <CmsInput
                    value={keyValue}
                    onChange={(event) => setKeyValue(event.target.value)}
                    placeholder="locked-key"
                    disabled={Boolean(record)}
                  />
                </CmsFormField>
              </div>
            )
          }

          const value = values[field.key]

          return (
            <div key={field.key} className={field.span === 'full' ? 'sm:col-span-2' : ''}>
              {field.type === 'text' && (
                <CmsFormField label={field.label} hint={field.help} required={field.required}>
                  <CmsInput
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </CmsFormField>
              )}

              {field.type === 'url' && (
                <CmsFormField label={field.label} hint={field.help} required={field.required}>
                  <CmsInput
                    type="url"
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                    placeholder={field.placeholder ?? 'https://…'}
                  />
                </CmsFormField>
              )}

              {field.type === 'textarea' && (
                <CmsFormField label={field.label} hint={field.help} required={field.required}>
                  <CmsTextarea
                    rows={4}
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </CmsFormField>
              )}

              {field.type === 'number' && (
                <CmsFormField label={field.label} hint={field.help} required={field.required}>
                  <CmsInput
                    type="number"
                    step="0.1"
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </CmsFormField>
              )}

              {field.type === 'date' && (
                <CmsFormField label={field.label} hint={field.help}>
                  <CmsInput
                    type="datetime-local"
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                </CmsFormField>
              )}

              {field.type === 'select' && (
                <CmsFormField label={field.label} hint={field.help} required={field.required}>
                  <CmsSelect
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                    options={[
                      { label: 'Not set', value: '' },
                      ...(field.options ?? []),
                      ...(value && !(field.options ?? []).some((option) => option.value === value)
                        ? [{ label: String(value), value: String(value) }]
                        : []),
                    ]}
                  />
                </CmsFormField>
              )}

              {field.type === 'image' && (
                <ImageUploadField
                  label={field.label}
                  value={String(value ?? '')}
                  onChange={(next) => setField(field.key, next)}
                  hint={field.help}
                />
              )}

              {field.type === 'audio' && (
                <AudioUploadField
                  label={field.label}
                  value={String(value ?? '')}
                  onChange={(next) => setField(field.key, next)}
                  hint={field.help}
                />
              )}

              {field.type === 'markdown' && (
                <MarkdownField
                  label={field.label}
                  value={String(value ?? '')}
                  onChange={(next) => setField(field.key, next)}
                />
              )}

              {field.type === 'tags' && (
                <CmsFormField label={field.label} hint={field.help}>
                  <CmsTagInput
                    tags={Array.isArray(value) ? value : []}
                    onChange={(next) => setField(field.key, next)}
                  />
                </CmsFormField>
              )}

              {field.type === 'boolean' && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3">
                  <CmsToggle
                    label={field.label}
                    description={field.help}
                    checked={value === true}
                    onChange={(next) => setField(field.key, next)}
                  />
                </div>
              )}

              {field.type === 'json' && (
                <CmsFormField label={field.label} hint={field.help}>
                  <CmsTextarea
                    rows={12}
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                    className="font-mono text-[11px]"
                    spellCheck={false}
                  />
                </CmsFormField>
              )}
            </div>
          )
        })}

        {error && (
          <p className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}
      </div>
    </CmsModal>
  )
}
