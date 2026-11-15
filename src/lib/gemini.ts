import { GoogleGenAI } from '@google/genai'

/**
 * Shared server-side Gemini SDK client factory.
 * Never import this module from a Client Component.
 */
export function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
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
  message: string
} {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Failed to query Gemini API.'

  const normalized = rawMessage.toUpperCase()

  if (normalized.includes('PERMISSION_DENIED') || normalized.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: 'Gemini API authentication failed. Verify GEMINI_API_KEY in server configuration.',
    }
  }

  if (normalized.includes('RESOURCE_EXHAUSTED') || normalized.includes('429')) {
    return {
      status: 429,
      message: 'Trend lookup rate limit reached. Please retry in a moment.',
    }
  }

  if (normalized.includes('NOT_FOUND') || normalized.includes('404')) {
    return {
      status: 502,
      message: 'Configured Gemini model was unavailable.',
    }
  }

  return {
    status: 502,
    message: rawMessage || 'Unable to fetch industry trends from Google Search grounding.',
  }
}
