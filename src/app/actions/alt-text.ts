'use server'

import { getAdminActorId } from '@/lib/admin-auth'
import { createGeminiClient } from '@/lib/gemini'

/**
 * A suggested alt text for an image the owner is editing.
 *
 * The health check warns about images without alt text after the fact; this
 * offers a sentence while the record is open. It is a suggestion only — nothing
 * is saved until the owner keeps it. The call needs the owner session, an
 * http(s) image no larger than 4 MB, and GEMINI_API_KEY on the server.
 */

export type AltTextSuggestion = { ok: true; text: string } | { ok: false; error: string }

const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const MODEL = process.env.GEMINI_ALT_TEXT_MODEL?.trim() || 'gemini-2.5-flash'

export async function suggestAltText(input: {
  imageUrl?: unknown
  title?: unknown
}): Promise<AltTextSuggestion> {
  if (!(await getAdminActorId())) {
    return { ok: false, error: 'Sign in to the studio first.' }
  }

  const imageUrl = typeof input?.imageUrl === 'string' ? input.imageUrl.trim() : ''
  if (!imageUrl) return { ok: false, error: 'Add or upload an image first.' }

  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    return { ok: false, error: 'Only a full https image URL can be described.' }
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, error: 'Only http(s) images can be described.' }
  }

  const client = createGeminiClient()
  if (!client) {
    return { ok: false, error: 'Alt-text suggestions need GEMINI_API_KEY on the server.' }
  }

  let response: Response
  try {
    response = await fetch(parsed.toString(), { cache: 'no-store' })
  } catch {
    return { ok: false, error: 'The image could not be downloaded.' }
  }

  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim()
  if (!response.ok || !contentType.startsWith('image/')) {
    return { ok: false, error: 'That URL did not return an image.' }
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'That image is larger than 4 MB, so it was not described.' }
  }

  const title = typeof input?.title === 'string' ? input.title.trim().slice(0, 120) : ''
  const prompt = [
    'Write one alt-text sentence for this image for a screen-reader user.',
    'Describe what the image shows, not the fact that it is an image.',
    'Keep it under 140 characters, plain prose, no quotation marks.',
    title ? `The record title is "${title}".` : '',
  ]
    .filter(Boolean)
    .join(' ')

  try {
    const result = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: contentType, data: buffer.toString('base64') } },
          ],
        },
      ],
    })

    const text = (result.text ?? '').replace(/\s+/g, ' ').replace(/^["']|["']$/g, '').trim()
    if (!text) return { ok: false, error: 'The model returned no description. Try again.' }
    return { ok: true, text: text.slice(0, 220) }
  } catch (error) {
    console.error('[alt-text] Suggestion failed:', (error as Error).message)
    return { ok: false, error: 'The suggestion service is unavailable right now.' }
  }
}
