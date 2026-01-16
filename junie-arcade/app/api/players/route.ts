import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { validateApiKey, rateLimit, getClientIp, sanitizeString } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authResult = validateApiKey(request)
    if (!authResult.valid) {
      return authResult.error
    }

    // Rate limiting: 10 player creations per minute per IP
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(`players:${clientIp}`, 10, 60000)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.error
    }

    const body = await request.json()
    const { username, country } = body

    // Sanitize inputs
    const sanitizedUsername = sanitizeString(username, 50)
    const sanitizedCountry = sanitizeString(country, 100)

    if (!sanitizedUsername || !sanitizedCountry) {
      return NextResponse.json(
        { error: 'Username and country are required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.create({
      data: {
        username: sanitizedUsername,
        country: sanitizedCountry
      }
    })

    return NextResponse.json({ 
      success: true, 
      playerId: player.id,
      username: player.username,
      country: player.country
    })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
}
