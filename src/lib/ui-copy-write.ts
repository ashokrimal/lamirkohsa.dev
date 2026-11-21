import { getTemplateArgs, validateTemplate } from './ui-strings'

/**
 * The decision half of `saveUiCopyValue`, kept free of database and session
 * access so it can be tested: an empty row deletes the override, a template key
 * stores English only, and an unknown placeholder is rejected instead of being
 * saved to render literally on the public site.
 */
export interface UiCopyWriteInput {
  key: string
  value: string
  korean: string
  reset: boolean
}

export type UiCopyWritePlan =
  | { action: 'delete' }
  | { action: 'upsert'; payload: { key: string; value: string; korean?: string } }

export function planUiCopyWrite(input: UiCopyWriteInput): UiCopyWritePlan {
  const key = input.key.trim()
  if (!key) throw new Error('A copy key is required.')

  const isTemplate = getTemplateArgs(key) !== null
  const value = input.reset ? '' : input.value.trim()
  // Generated sentences render English templates only, so they store no Korean.
  const korean = input.reset || isTemplate ? '' : input.korean.trim()

  if (!input.reset) {
    const problem = validateTemplate(key, value)
    if (problem) throw new Error(problem)
  }

  if (!value && !korean) return { action: 'delete' }
  return { action: 'upsert', payload: { key, value, ...(korean ? { korean } : {}) } }
}
