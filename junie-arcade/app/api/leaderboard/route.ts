import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameType = searchParams.get('gameType')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get top scores grouped by player for each game type
    const scores = await prisma.score.findMany({
      where: gameType ? { gameType: gameType as any } : {},
      include: {
        player: true
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit
    })

    // Format response
    const leaderboard = scores.map((score, index) => ({
      rank: index + 1,
      username: score.player.username,
      score: score.score,
      gameType: score.gameType,
      accuracy: score.accuracy,
      time: score.time,
      distance: score.distance,
      createdAt: score.createdAt
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
