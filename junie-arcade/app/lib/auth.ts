import { NextRequest, NextResponse } from 'next/server'

// API Key validation for protected endpoints
export function validateApiKey(request: NextRequest): { valid: boolean; error?: NextResponse } {
  const apiKey = request.headers.get('x-api-key')
  const serverApiKey = process.env.API_SECRET_KEY

  // If no API key is configured on server, allow all requests (development mode)
  if (!serverApiKey) {
    console.warn('⚠️ API_SECRET_KEY not configured. API is running in open mode.')
    return { valid: true }
  }

  // Check if API key is provided and matches
  if (!apiKey) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'API key required. Include x-api-key header.' },
        { status: 401 }
      )
    }
  }

  if (apiKey !== serverApiKey) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 403 }
      )
    }
  }

  return { valid: true }
}

// Rate limiting using in-memory store (for simple protection)
// For production, use Redis or Upstash
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; error?: NextResponse } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      error: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000))
          }
        }
      )
    }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

// Get client IP for rate limiting
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

// Input validation helpers
export function sanitizeString(input: string | undefined | null, maxLength: number = 100): string {
  if (!input) return ''
  return input.toString().trim().slice(0, maxLength)
}

export function isValidGameType(gameType: string): boolean {
  const validTypes = ['REFLEX_ARENA', 'JUMP_MASTER', 'MEMORY_MATCH', 'OVERALL']
  return validTypes.includes(gameType)
}

export function isValidScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 1000000 && Number.isInteger(score)
}
