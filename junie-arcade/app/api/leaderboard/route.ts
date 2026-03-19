import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { GameType } from '@prisma/client'

// Configure route segment to revalidate every 0 seconds to ensure fresh data for session tracking
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') || 'overall' // overall, reflex, jump, memory, daily
    const country = searchParams.get('country') // filter by country
    const playerId = searchParams.get('playerId') // get stats for specific player
    const dateParam = searchParams.get('date') // for daily leaderboard (YYYY-MM-DD)

    // Daily leaderboard view — derives top scores from Score table filtered by date
    if (view === 'daily') {
      const targetDate = dateParam ? new Date(dateParam) : new Date()
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

      // Fetch all scores for the selected day
      const dayScores = await prisma.score.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          player: true,
        },
        orderBy: {
          score: 'desc',
        },
      })

      // Group by gameType, then best score per player
      const result: Record<string, any[]> = {}
      const gameTypes: GameType[] = ['REFLEX_ARENA', 'JUMP_MASTER', 'MEMORY_MATCH']

      for (const gt of gameTypes) {
        const gameScores = dayScores.filter((s) => s.gameType === gt)
        const playerBest = new Map<string, { playerId: string; username: string; score: number; country: string | null }>()

        for (const s of gameScores) {
          const existing = playerBest.get(s.playerId)
          if (!existing || s.score > existing.score) {
            playerBest.set(s.playerId, {
              playerId: s.playerId,
              username: s.player.username,
              score: s.score,
              country: s.player.country || null,
            })
          }
        }

        result[gt] = Array.from(playerBest.values()).sort((a, b) => b.score - a.score)
      }

      const response = NextResponse.json({
        type: 'daily',
        date: startOfDay.toISOString().split('T')[0],
        leaderboards: result,
      })
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
      return response
    }

    if (view === 'overall') {
      // If playerId is provided, we can fetch just that player for speed and accuracy
      let targetedPlayer = null
      if (playerId) {
        targetedPlayer = await prisma.player.findUnique({
          where: { id: playerId },
          include: { scores: true }
        })
      }

      // Get all players for overall ranking to ensure current player is found
      let players = await prisma.player.findMany({
        where: country ? { country: country } : undefined,
        include: {
          scores: {
            orderBy: {
              score: 'desc'
            }
          }
        }
      })

      // If targetedPlayer exists but is not in the players list (e.g. because of country filter), add it
      if (targetedPlayer && !players.find((p: any) => p.id === targetedPlayer.id)) {
        players.push(targetedPlayer as any)
      }

      // Calculate overall rankings
      const playerStats = players.map((player: any) => {
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
      }).filter((p: any) => p.gamesPlayed > 0) // Only include players who have played at least one game

      // Get rankings for each game separately
      const reflexRankings = [...playerStats]
        .filter((p: any) => p.reflexScore > 0)
        .sort((a: any, b: any) => b.reflexScore - a.reflexScore)
        .map((p: any, index: number) => ({ playerId: p.playerId, rank: index + 1 }))

      const jumpRankings = [...playerStats]
        .filter((p: any) => p.jumpScore > 0)
        .sort((a: any, b: any) => b.jumpScore - a.jumpScore)
        .map((p: any, index: number) => ({ playerId: p.playerId, rank: index + 1 }))

      const memoryRankings = [...playerStats]
        .filter((p: any) => p.memoryScore > 0)
        .sort((a: any, b: any) => b.memoryScore - a.memoryScore)
        .map((p: any, index: number) => ({ playerId: p.playerId, rank: index + 1 }))

      // Calculate champion points based on rankings — no rank decay
      const calculatePoints = (rank: number) => {
        if (rank === 1) return 100
        if (rank === 2) return 90
        if (rank === 3) return 80
        if (rank <= 10) return 100 - (rank * 5)
        if (rank <= 25) return 50 - ((rank - 10) * 2)
        // No further decay — everyone rank 26+ gets a flat minimum
        return Math.max(5, 25 - (rank - 25))
      }

      const overallLeaderboard = playerStats.map((player: any) => {
        const reflexRank = reflexRankings.find((r: any) => r.playerId === player.playerId)
        const jumpRank = jumpRankings.find((r: any) => r.playerId === player.playerId)
        const memoryRank = memoryRankings.find((r: any) => r.playerId === player.playerId)

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
      const sortedLeaderboard = overallLeaderboard.sort((a: any, b: any) => {
        if (a.hasPlayedAll && !b.hasPlayedAll) return -1
        if (!a.hasPlayedAll && b.hasPlayedAll) return 1
        return b.totalPoints - a.totalPoints
      })

      // Find the current player and include their server-calculated rank
      const currentPlayerId = targetedPlayer ? targetedPlayer.id : playerId
      let currentPlayer = null
      if (currentPlayerId) {
        const playerIndex = sortedLeaderboard.findIndex((p: any) => p.playerId === currentPlayerId)
        if (playerIndex !== -1) {
          currentPlayer = { ...sortedLeaderboard[playerIndex], rank: playerIndex + 1 }
        }
      }

      const response = NextResponse.json({
        type: 'overall',
        totalPlayers: sortedLeaderboard.length,
        leaderboard: sortedLeaderboard,
        currentPlayer
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
      scores.forEach((score: any) => {
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
      const sortedScores = Array.from(playerBestScores.values())
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      const totalPlayers = sortedScores.length
      const leaderboard = sortedScores

      const response = NextResponse.json({
        type: view,
        gameType,
        totalPlayers,
        leaderboard
      })

      // Add cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')

      return response
    }
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard',
        details: error.message,
        leaderboard: [],
        type: 'error'
      },
      { status: 500 }
    )
  }
}
