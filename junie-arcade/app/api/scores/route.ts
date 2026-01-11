import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, gameType, score, accuracy, time, maxCombo, distance } = body

    // Find or create player
    let player = await prisma.player.findFirst({
      where: { username }
    })

    if (!player) {
      player = await prisma.player.create({
        data: { username }
      })
    }

    // Create score record
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

    return NextResponse.json({ success: true, score: newScore })
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
