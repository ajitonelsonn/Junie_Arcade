'use client'

import { useEffect, useState } from 'react'

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  gameType: string
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?limit=10')
      const data = await response.json()
      setEntries(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLoading(false)
    }
  }

  const getGameEmoji = (gameType: string) => {
    switch (gameType) {
      case 'REFLEX_ARENA':
        return '⚡'
      case 'JUMP_MASTER':
        return '🚀'
      case 'MEMORY_MATCH':
        return '🧠'
      default:
        return '🎮'
    }
  }

  const getGameName = (gameType: string) => {
    switch (gameType) {
      case 'REFLEX_ARENA':
        return 'Reflex Arena'
      case 'JUMP_MASTER':
        return 'Jump Master'
      case 'MEMORY_MATCH':
        return 'Memory Match'
      default:
        return gameType
    }
  }

  if (loading) {
    return (
      <div className="text-center text-white/80 text-lg">
        Loading leaderboard...
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center text-white/80 text-lg">
        No scores yet. Be the first to play!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={`${entry.username}-${entry.score}-${entry.rank}`}
          className="flex items-center justify-between bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-black ${
              entry.rank === 1 ? 'text-yellow-300' :
              entry.rank === 2 ? 'text-gray-300' :
              entry.rank === 3 ? 'text-orange-300' :
              'text-white/70'
            }`}>
              {entry.rank === 1 ? '🥇' :
               entry.rank === 2 ? '🥈' :
               entry.rank === 3 ? '🥉' :
               `#${entry.rank}`}
            </div>
            <div>
              <div className="text-white font-bold text-lg">{entry.username}</div>
              <div className="text-white/70 text-sm">
                {getGameEmoji(entry.gameType)} {getGameName(entry.gameType)}
              </div>
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {entry.score.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
