import { NextRequest, NextResponse } from 'next/server'
import { ThinkingLevel } from '@google/genai'
import { createGeminiClient, extractGeminiErrorStatus } from '@/lib/gemini'

export interface IndustryTrendItem {
  title: string
  category: string
  relatedTo: string[]
  summary: string
  momentum?: string
}

export interface GroundingSource {
  title: string
  url: string
  domain: string
}

export interface IndustryTrendsResponse {
  available?: boolean
  error?: string
  code?: string
  summary: string
  trends: IndustryTrendItem[]
  sources: GroundingSource[]
  searchQueries: string[]
  technologies: string[]
  generatedAt: string
  cached: boolean
}

const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes
const trendsCache = new Map<
  string,
  { payload: Omit<IndustryTrendsResponse, 'cached'>; expiresAt: number }
>()

function sanitizeStringList(input: unknown, maxItems: number, maxLength = 48): string[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of input) {
    if (typeof raw !== 'string') continue
    const cleaned = raw.trim().replace(/\s+/g, ' ').slice(0, maxLength)
    if (!cleaned) continue
    const key = cleaned.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(cleaned)
    if (result.length >= maxItems) break
  }

  return result
}

function buildCacheKey(technologies: string[], categories: string[]): string {
  const techPart = [...technologies].map((t) => t.toLowerCase()).sort().join('|')
  const catPart = [...categories].map((c) => c.toLowerCase()).sort().join('|')
  return `${techPart}::${catPart}`
}

function parseJsonPayload(rawText: string): {
  summary: string
  trends: IndustryTrendItem[]
} | null {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const candidates = [cleaned]
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(cleaned.slice(firstBrace, lastBrace + 1))
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as {
        summary?: unknown
        trends?: unknown
      }

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.trends)) {
        continue
      }

      const trends: IndustryTrendItem[] = parsed.trends
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => ({
          title: typeof item.title === 'string' ? item.title.trim() : '',
          category:
            typeof item.category === 'string' && item.category.trim()
              ? item.category.trim()
              : 'Ecosystem',
          relatedTo: sanitizeStringList(item.relatedTo, 4, 32),
          summary: typeof item.summary === 'string' ? item.summary.trim() : '',
          momentum:
            typeof item.momentum === 'string' && item.momentum.trim()
              ? item.momentum.trim()
              : undefined,
        }))
        .filter((item) => item.title.length > 0 && item.summary.length > 0)
        .slice(0, 5)

      if (trends.length > 0) {
        return {
          summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
          trends,
        }
      }
    } catch {
      // Try next JSON extraction candidate
    }
  }

  return null
}

function parseFallbackText(rawText: string, technologies: string[]): {
  summary: string
  trends: IndustryTrendItem[]
} {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const bullets = lines
    .filter((line) => /^[-*•\d.]+\s+/.test(line))
    .map((line) => line.replace(/^[-*•\d.]+\s+/, '').trim())
    .slice(0, 4)

  if (bullets.length > 0) {
    return {
      summary: lines.find((line) => !/^[-*•\d.]+\s+/.test(line)) ?? '',
      trends: bullets.map((bullet, idx) => {
        const colonSplit = bullet.split(/:\s+/)
        const title =
          colonSplit.length > 1
            ? colonSplit[0].replace(/\*\*/g, '').trim()
            : `Industry Signal ${idx + 1}`
        const summary =
          colonSplit.length > 1 ? colonSplit.slice(1).join(': ').trim() : bullet.replace(/\*\*/g, '')
        return {
          title,
          category: 'Grounded Brief',
          relatedTo: technologies.slice(0, 2),
          summary,
        }
      }),
    }
  }

  return {
    summary: rawText.trim().slice(0, 400),
    trends: [],
  }
}

function extractGroundingSources(groundingChunks: unknown): GroundingSource[] {
  if (!Array.isArray(groundingChunks)) return []
  const seenUrls = new Set<string>()
  const sources: GroundingSource[] = []

  for (const chunk of groundingChunks) {
    if (!chunk || typeof chunk !== 'object') continue
    const web = (chunk as { web?: { uri?: unknown; title?: unknown } }).web
    if (!web || typeof web.uri !== 'string') continue

    try {
      const parsed = new URL(web.uri)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') continue
      const canonical = parsed.toString()
      if (seenUrls.has(canonical)) continue
      seenUrls.add(canonical)

      const domain = parsed.hostname.replace(/^www\./, '')
      const title =
        typeof web.title === 'string' && web.title.trim() ? web.title.trim() : domain

      sources.push({ title, url: canonical, domain })
      if (sources.length >= 6) break
    } catch {
      continue
    }
  }

  return sources
}

export async function POST(request: NextRequest) {
  let body: {
    technologies?: unknown
    categories?: unknown
    projectTitles?: unknown
    forceRefresh?: unknown
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 })
  }

  const technologies = sanitizeStringList(body.technologies, 12)
  const categories = sanitizeStringList(body.categories, 6)
  const projectTitles = sanitizeStringList(body.projectTitles, 6, 64)
  const forceRefresh = body.forceRefresh === true

  if (technologies.length === 0 && categories.length === 0 && projectTitles.length === 0) {
    return NextResponse.json(
      { error: 'At least one project technology or category is required.' },
      { status: 400 },
    )
  }

  const cacheKey = buildCacheKey(technologies, categories)
  if (!forceRefresh) {
    const cached = trendsCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ ...cached.payload, cached: true })
    }
  }

  const ai = createGeminiClient()
  if (!ai) {
    return NextResponse.json({
      available: false,
      code: 'missing',
      error:
        'Live Google Search trends require a valid GEMINI_API_KEY configured in server secrets.',
      summary: '',
      trends: [],
      sources: [],
      searchQueries: [],
      technologies,
      generatedAt: new Date().toISOString(),
      cached: false,
    })
  }

  const techContext = technologies.length ? technologies.join(', ') : 'modern full-stack web engineering'
  const categoryContext = categories.length ? categories.join(', ') : 'Web & Software Engineering'
  const projectContext = projectTitles.length ? `Projects: ${projectTitles.join('; ')}.` : ''

  const prompt = [
    'Use Google Search to identify 4 current, verifiable engineering and ecosystem trends directly related to these portfolio technologies and project domains.',
    `Technologies: ${techContext}.`,
    `Domains: ${categoryContext}.`,
    projectContext,
    'Focus on concrete, recent framework releases, runtime/tooling shifts, standards, or architectural patterns happening now.',
    'Return ONLY valid raw JSON (no markdown fences) matching this shape:',
    '{"summary":"One concise 1-2 sentence synthesis across these stacks.","trends":[{"title":"Short specific trend name","category":"Framework | Tooling | Architecture | AI | Runtime","relatedTo":["MatchingTechFromInput"],"summary":"2 concise sentences grounded in recent developments.","momentum":"Rising | Mainstream | Emerging"}]}',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a concise staff engineering radar. Rely on Google Search grounding results, avoid hype, cite specific releases or patterns, and keep every summary crisp and factual.',
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    })

    const rawText = response.text ?? ''
    const parsed = parseJsonPayload(rawText) ?? parseFallbackText(rawText, technologies)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata
    const sources = extractGroundingSources(groundingMetadata?.groundingChunks)
    const searchQueries = sanitizeStringList(groundingMetadata?.webSearchQueries, 5, 80)

    const payload: Omit<IndustryTrendsResponse, 'cached'> = {
      summary: parsed.summary,
      trends: parsed.trends,
      sources,
      searchQueries,
      technologies,
      generatedAt: new Date().toISOString(),
    }

    trendsCache.set(cacheKey, {
      payload,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return NextResponse.json({ ...payload, available: true, cached: false })
  } catch (error) {
    const { code, message } = extractGeminiErrorStatus(error)
    return NextResponse.json({
      available: false,
      code,
      error: message,
      summary: '',
      trends: [],
      sources: [],
      searchQueries: [],
      technologies,
      generatedAt: new Date().toISOString(),
      cached: false,
    })
  }
}
