import { cache } from 'react'
import { getPublishedCmsContent } from '@/lib/cms-content'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import { resolveUiStrings, type UiCopyOverrides } from '@/lib/ui-strings'

/**
 * Interface copy lives in the `UI Copy` collection. Each published record holds
 * `{ key, value, korean? }`, where the key is the dotted path of a label in
 * `ui-strings.ts`. Anything without a record keeps its built-in literal.
 */
export const UI_COPY_COLLECTION = CMS_COLLECTIONS.uiCopy

function readOverride(payload: unknown): { key: string; en?: string; kr?: string } | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  const key = typeof record.key === 'string' ? record.key.trim() : ''
  if (!key) return null
  const en = typeof record.value === 'string' ? record.value.trim() : ''
  const kr = typeof record.korean === 'string' ? record.korean.trim() : ''
  if (!en && !kr) return null
  return { key, en: en || undefined, kr: kr || undefined }
}

/** Published label overrides, ready for `resolveUiStrings`. */
export async function getUiCopyOverrides(): Promise<UiCopyOverrides> {
  const records = await getPublishedCmsContent(UI_COPY_COLLECTION)
  const overrides: UiCopyOverrides = {}
  for (const record of records) {
    const parsed = readOverride(record.payload)
    if (!parsed) continue
    overrides[parsed.key] = { en: parsed.en, kr: parsed.kr }
  }
  return overrides
}

/** The resolved interface strings for this request, cached per render pass. */
export const getUiCopy = cache(async () => resolveUiStrings(await getUiCopyOverrides()))
