import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { validateApiKey, rateLimit, getClientIp, sanitizeString, isValidGameType, isValidScore } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authResult = validateApiKey(request)
    if (!authResult.valid) {
      return authResult.error
    }

    // Rate limiting: 30 score submissions per minute per IP
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(`scores:${clientIp}`, 30, 60000)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.error
    }

    const body = await request.json()
    const { username, country, gameType, score, accuracy, time, maxCombo, distance, playerId } = body

    // Input validation
    if (!gameType || !isValidGameType(gameType)) {
      return NextResponse.json(
        { error: 'Invalid game type' },
        { status: 400 }
      )
    }

    if (score === undefined || !isValidScore(score)) {
      return NextResponse.json(
        { error: 'Invalid score value' },
        { status: 400 }
      )
    }

    // Sanitize string inputs
    const sanitizedUsername = sanitizeString(username, 50)
    const sanitizedCountry = sanitizeString(country, 100)

    // Find player
    let player = null

    if (playerId) {
      player = await prisma.player.findUnique({
        where: { id: playerId }
      })
    }

    if (!player) {
      if (!sanitizedUsername || !sanitizedCountry) {
        return NextResponse.json(
          { error: 'Player ID or username/country required' },
          { status: 400 }
        )
      }

      // If no playerId provided or not found, create a new one as requested by the system
      // though the frontend should ideally handle this via /api/players
      player = await prisma.player.create({
        data: {
          username: sanitizedUsername,
          country: sanitizedCountry || null
        }
      })
    } else if (player.country !== sanitizedCountry || (sanitizedUsername && player.username !== sanitizedUsername)) {
      // Update player's country or username if it changed (optional, but good for consistency)
      player = await prisma.player.update({
        where: { id: player.id },
        data: {
          country: sanitizedCountry || player.country,
          username: sanitizedUsername || player.username
        }
      })
    }

    // Create score record - Check if this exact score (same player, gameType, score, and very recent) already exists
    // This helps prevent double submissions from client-side issues
    const tenSecondsAgo = new Date(Date.now() - 10000)
    const existingScore = await prisma.score.findFirst({
      where: {
        playerId: player.id,
        gameType,
        score,
        createdAt: {
          gte: tenSecondsAgo
        }
      }
    })

    if (existingScore) {
      return NextResponse.json({ success: true, score: existingScore, playerId: player.id, alreadyExists: true })
    }

    const newScore = await prisma.score.create({
      data: {
        playerId: player.id,
        gameType,
        score,
        accuracy: accuracy || null,
        time: time || null,
        maxCombo: maxCombo || null,
        distance: distance || null
      }
    })

    return NextResponse.json({ success: true, score: newScore, playerId: player.id })
  } catch (error) {
    console.error('Error saving score:', error)
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameType = searchParams.get('gameType')

    let where = {}
    if (gameType) {
      where = { gameType: gameType as any }
    }

    const scores = await prisma.score.findMany({
      where,
      include: {
        player: true
      },
      orderBy: {
        score: 'desc'
      },
      take: 50
    })

    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}
