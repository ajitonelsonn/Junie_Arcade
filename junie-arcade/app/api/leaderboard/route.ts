import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { GameType } from '@prisma/client'

// Configure route segment to revalidate every 10 seconds
export const revalidate = 10

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') || 'overall' // overall, reflex, jump, memory
    const country = searchParams.get('country') // filter by country

    if (view === 'overall') {
      // Get top 100 players with their best scores in each game (optimized)
      const players = await prisma.player.findMany({
        where: country ? { country: country } : undefined,
        take: 100, // Limit to top 100 players for performance
        include: {
          scores: {
            take: 10, // Only get top 10 scores per player
            orderBy: {
              score: 'desc'
            }
          }
        }
      })

      // Calculate overall rankings
      const playerStats = players.map(player => {
        const reflexScores = player.scores.filter((s: any) => s.gameType === 'REFLEX_ARENA')
        const jumpScores = player.scores.filter((s: any) => s.gameType === 'JUMP_MASTER')
        const memoryScores = player.scores.filter((s: any) => s.gameType === 'MEMORY_MATCH')

        const bestReflex = reflexScores.length > 0 ? Math.max(...reflexScores.map((s: any) => s.score)) : 0
        const bestJump = jumpScores.length > 0 ? Math.max(...jumpScores.map((s: any) => s.score)) : 0
        const bestMemory = memoryScores.length > 0 ? Math.max(...memoryScores.map((s: any) => s.score)) : 0

        return {
          playerId: player.id,
          username: player.username,
          country: player.country || null,
          reflexScore: bestReflex,
          jumpScore: bestJump,
          memoryScore: bestMemory,
          gamesPlayed: [
            reflexScores.length > 0,
            jumpScores.length > 0,
            memoryScores.length > 0
          ].filter(Boolean).length,
          hasPlayedAll: reflexScores.length > 0 && jumpScores.length > 0 && memoryScores.length > 0
        }
      }).filter(p => p.gamesPlayed > 0) // Only include players who have played at least one game

      // Get rankings for each game separately
      const reflexRankings = [...playerStats]
        .filter(p => p.reflexScore > 0)
        .sort((a, b) => b.reflexScore - a.reflexScore)
        .map((p, index) => ({ playerId: p.playerId, rank: index + 1 }))

      const jumpRankings = [...playerStats]
        .filter(p => p.jumpScore > 0)
        .sort((a, b) => b.jumpScore - a.jumpScore)
        .map((p, index) => ({ playerId: p.playerId, rank: index + 1 }))

      const memoryRankings = [...playerStats]
        .filter(p => p.memoryScore > 0)
        .sort((a, b) => b.memoryScore - a.memoryScore)
        .map((p, index) => ({ playerId: p.playerId, rank: index + 1 }))

      // Calculate champion points based on rankings
      const calculatePoints = (rank: number) => {
        if (rank === 1) return 100
        if (rank === 2) return 90
        if (rank === 3) return 80
        if (rank <= 10) return 100 - (rank * 5)
        if (rank <= 25) return 50 - ((rank - 10) * 2)
        if (rank <= 50) return 20 - (rank - 25)
        return Math.max(1, 10 - Math.floor(rank / 10))
      }

      const overallLeaderboard = playerStats.map(player => {
        const reflexRank = reflexRankings.find(r => r.playerId === player.playerId)
        const jumpRank = jumpRankings.find(r => r.playerId === player.playerId)
        const memoryRank = memoryRankings.find(r => r.playerId === player.playerId)

        const reflexPoints = reflexRank ? calculatePoints(reflexRank.rank) : 0
        const jumpPoints = jumpRank ? calculatePoints(jumpRank.rank) : 0
        const memoryPoints = memoryRank ? calculatePoints(memoryRank.rank) : 0

        const totalPoints = reflexPoints + jumpPoints + memoryPoints

        return {
          ...player,
          reflexRank: reflexRank?.rank || null,
          jumpRank: jumpRank?.rank || null,
          memoryRank: memoryRank?.rank || null,
          reflexPoints,
          jumpPoints,
          memoryPoints,
          totalPoints
        }
      })

      // Sort by total points (players who played all games get priority)
      const sortedLeaderboard = overallLeaderboard.sort((a, b) => {
        if (a.hasPlayedAll && !b.hasPlayedAll) return -1
        if (!a.hasPlayedAll && b.hasPlayedAll) return 1
        return b.totalPoints - a.totalPoints
      })

      const response = NextResponse.json({
        type: 'overall',
        leaderboard: sortedLeaderboard.slice(0, 100)
      })

      // Add cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')

      return response
    } else {
      // Individual game leaderboard
      const gameType: GameType = view === 'reflex' ? 'REFLEX_ARENA'
        : view === 'jump' ? 'JUMP_MASTER'
        : 'MEMORY_MATCH'

      const scores = await prisma.score.findMany({
        where: {
          gameType,
          player: country ? { country: country } : undefined
        },
        take: 200, // Limit to top 200 scores for performance
        include: {
          player: true
        },
        orderBy: {
          score: 'desc'
        }
      })

      // Get best score per player
      const playerBestScores = new Map<string, any>()
      scores.forEach(score => {
        const existing = playerBestScores.get(score.playerId)
        if (!existing || score.score > existing.score) {
          playerBestScores.set(score.playerId, {
            rank: 0, // Will be calculated after
            username: score.player.username,
            country: score.player.country || null,
            score: score.score,
            maxCombo: score.maxCombo,
            accuracy: score.accuracy,
            time: score.time,
            distance: score.distance,
            createdAt: score.createdAt
          })
        }
      })

      // Convert to array and add rankings
      const leaderboard = Array.from(playerBestScores.values())
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))
        .slice(0, 100)

      const response = NextResponse.json({
        type: view,
        gameType,
        leaderboard
      })

      // Add cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')

      return response
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
