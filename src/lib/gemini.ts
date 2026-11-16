import { GoogleGenAI } from '@google/genai'

/**
 * Shared server-side Gemini SDK client factory.
 * Never import this module from a Client Component.
 */
export function createGeminiClient(): GoogleGenAI | null {
  const rawKey = process.env.GEMINI_API_KEY
  if (!rawKey) return null

  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '').trim()
  if (!apiKey) return null

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  })
}

export function extractGeminiErrorStatus(error: unknown): {
  status: number
  code: 'auth' | 'rate_limit' | 'unavailable'
  message: string
  detail: string
} {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to query Gemini API.'

  const sanitizedDetail = rawMessage.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_KEY]')
  const normalized = sanitizedDetail.toUpperCase()

  if (
    normalized.includes('PERMISSION_DENIED') ||
    normalized.includes('API_KEY_INVALID') ||
    normalized.includes('API KEY NOT VALID')
  ) {
    return {
      status: 403,
      code: 'auth',
      message:
        'Live Google Search trends require a valid GEMINI_API_KEY configured in server secrets.',
      detail: sanitizedDetail,
    }
  }

  if (normalized.includes('RESOURCE_EXHAUSTED') || normalized.includes('429')) {
    return {
      status: 429,
      code: 'rate_limit',
      message: 'Trend lookup rate limit reached. Please retry in a moment.',
      detail: sanitizedDetail,
    }
  }

  if (normalized.includes('NOT_FOUND') || normalized.includes('404')) {
    return {
      status: 502,
      code: 'unavailable',
      message: 'Configured Gemini model was temporarily unavailable.',
      detail: sanitizedDetail,
    }
  }

  return {
    status: 502,
    code: 'unavailable',
    message: 'Unable to fetch industry trends from Google Search grounding right now.',
    detail: sanitizedDetail,
  }
}
