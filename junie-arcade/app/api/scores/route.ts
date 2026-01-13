import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, country, gameType, score, accuracy, time, maxCombo, distance, playerId } = body

    // Find or create player
    let player = null

    if (playerId) {
      player = await prisma.player.findUnique({
        where: { id: playerId }
      })
    }

    if (!player && username) {
      // Check if a player with this username and country already exists to avoid duplicates
      // but only if they don't have a playerId (e.g. first game)
      player = await prisma.player.findFirst({
        where: {
          username,
          country: country || null
        }
      })
    }

    if (!player) {
      // Use upsert or a more careful approach if needed, but here we just created it
      // To be extra safe against race conditions, we can use a transaction or findFirst again
      try {
        player = await prisma.player.create({
          data: {
            username,
            country: country || null
          }
        })
      } catch (e) {
        // If creation fails (e.g. race condition), try to find the player again
        player = await prisma.player.findFirst({
          where: {
            username,
            country: country || null
          }
        })
        if (!player) throw e; // Rethrow if still not found
      }
    } else {
      // Update player's country or username if it changed
      if (player.country !== country || (username && player.username !== username)) {
        player = await prisma.player.update({
          where: { id: player.id },
          data: { 
            country: country || null,
            username: username || player.username
          }
        })
      }
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
