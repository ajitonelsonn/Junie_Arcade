'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      case 'REFLEX_ARENA': return '⚡'
      case 'JUMP_MASTER': return '🚀'
      case 'MEMORY_MATCH': return '🧠'
      default: return '🎮'
    }
  }

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'text-yellow-400'
      case 'JUMP_MASTER': return 'text-cyan-400'
      case 'MEMORY_MATCH': return 'text-purple-400'
      default: return 'text-slate-400'
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.2)]',
        medal: '🥇'
      }
      case 2: return {
        bg: 'bg-gradient-to-r from-slate-300/20 to-gray-400/20',
        border: 'border-slate-300/30',
        text: 'text-slate-300',
        glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
        medal: '🥈'
      }
      case 3: return {
        bg: 'bg-gradient-to-r from-orange-500/20 to-amber-700/20',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]',
        medal: '🥉'
      }
      default: return {
        bg: 'bg-white/5',
        border: 'border-white/5',
        text: 'text-slate-400',
        glow: '',
        medal: `#${rank}`
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
        <div className="text-white/60 font-medium animate-pulse">Synchronizing Data...</div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-black uppercase tracking-widest text-slate-500">
        <div className="col-span-1">Rank</div>
        <div className="col-span-6">Player</div>
        <div className="col-span-5 text-right">Score</div>
      </div>
      
      <div className="divide-y divide-white/5">
        <AnimatePresence mode='popLayout'>
          {entries.map((entry, index) => {
            const style = getRankStyle(entry.rank)
            return (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={`${entry.username}-${entry.gameType}`}
                className={`grid grid-cols-12 gap-4 items-center px-6 py-5 group hover:bg-white/[0.03] transition-colors`}
              >
                <div className="col-span-1">
                  <span className={`text-xl font-black ${style.text}`}>
                    {style.medal}
                  </span>
                </div>
                
                <div className="col-span-6 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform`}>
                    {getGameEmoji(entry.gameType)}
                  </div>
                  <div>
                    <div className="text-white font-black text-lg tracking-tight group-hover:text-cyan-400 transition-colors">
                      {entry.username}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${getGameColor(entry.gameType)} opacity-80`}>
                      {entry.gameType.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="col-span-5 text-right">
                  <div className={`text-2xl font-black tabular-nums tracking-tighter ${entry.rank <= 3 ? style.text : 'text-white'}`}>
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      
      {entries.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-4xl mb-4">🌑</div>
          <div className="text-slate-400 font-medium">No champions yet. Claim your spot.</div>
        </div>
      )}
    </div>
  )
}
