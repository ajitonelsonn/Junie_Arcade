'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  gameType: string
  country?: string | null
  totalPoints?: number
  gamesPlayed?: number
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overall' | 'reflex' | 'jump' | 'memory'>('overall')
  const [countries, setCountries] = useState<Array<{ name: string; flag: string }>>([])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries')
        const data = await response.json()
        setCountries(data)
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      }
    }
    fetchCountries()
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [activeTab])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leaderboard?view=${activeTab}`)
      const data = await response.json()

      // Transform data based on view type
      if (activeTab === 'overall') {
        // Overall leaderboard with champion points
        const transformedEntries = data.leaderboard.slice(0, 5).map((player: any, index: number) => ({
          rank: index + 1,
          username: player.username,
          score: player.totalPoints,
          gameType: 'OVERALL',
          country: player.country,
          totalPoints: player.totalPoints,
          gamesPlayed: player.gamesPlayed
        }))
        setEntries(transformedEntries)
      } else {
        // Individual game leaderboard
        const transformedEntries = data.leaderboard.slice(0, 10).map((entry: any) => ({
          rank: entry.rank,
          username: entry.username,
          score: entry.score,
          gameType: data.gameType || activeTab.toUpperCase(),
          country: entry.country
        }))
        setEntries(transformedEntries)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setEntries([])
      setLoading(false)
    }
  }

  const getCountryFlag = (countryName: string | null | undefined) => {
    if (!countryName) return null
    const country = countries.find(c => c.name === countryName)
    return country?.flag || null
  }

  const getGameLogo = (gameType: string) => {
    switch (gameType) {
      case 'REFLEX_ARENA': return '/assets/images/logos/game_logo/reflex_arena.png'
      case 'JUMP_MASTER': return '/assets/images/logos/game_logo/jump_master.png'
      case 'MEMORY_MATCH': return '/assets/images/logos/game_logo/memory_match.png'
      case 'OVERALL': return null // Will fallback to trophy
      default: return null
    }
  }

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'text-yellow-400'
      case 'JUMP_MASTER': return 'text-cyan-400'
      case 'MEMORY_MATCH': return 'text-purple-400'
      case 'OVERALL': return 'text-emerald-400'
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

  const tabs = [
    { id: 'overall' as const, label: 'Overall Top 5', icon: '🏆', logo: null },
    { id: 'reflex' as const, label: 'Reflex', icon: '⚡', logo: '/assets/images/logos/game_logo/reflex_arena.png' },
    { id: 'jump' as const, label: 'Jump', icon: '🚀', logo: '/assets/images/logos/game_logo/jump_master.png' },
    { id: 'memory' as const, label: 'Memory', icon: '🧠', logo: '/assets/images/logos/game_logo/memory_match.png' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.logo ? (
              <div className="w-5 h-5 relative">
                <Image src={tab.logo} alt={tab.label} fill className="object-contain" />
              </div>
            ) : (
              <span>{tab.icon}</span>
            )}
            <span className="uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-black uppercase tracking-widest text-slate-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-5 text-right">Score</div>
        </div>
        
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
              />
              <div className="text-white/60 font-medium animate-pulse">Synchronizing Data...</div>
            </div>
          ) : (
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
                      key={`${entry.username}-${entry.gameType}-${entry.rank}`}
                      className={`grid grid-cols-12 gap-4 items-center px-6 py-5 group hover:bg-white/[0.03] transition-colors`}
                    >
                      <div className="col-span-1">
                        <span className={`text-xl font-black ${style.text}`}>
                          {style.medal}
                        </span>
                      </div>
                      
                      <div className="col-span-6 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform relative overflow-hidden`}>
                          {getGameLogo(entry.gameType) ? (
                            <Image 
                              src={getGameLogo(entry.gameType)!} 
                              alt={entry.gameType} 
                              fill 
                              className="p-2 object-contain"
                            />
                          ) : (
                            <span>🏆</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {getCountryFlag(entry.country) && (
                              <span className="text-xl">{getCountryFlag(entry.country)}</span>
                            )}
                            <div className="text-white font-black text-lg tracking-tight group-hover:text-cyan-400 transition-colors">
                              {entry.username}
                            </div>
                          </div>
                          <div className={`text-xs font-bold uppercase tracking-wider ${getGameColor(entry.gameType)} opacity-80`}>
                            {entry.gameType.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-5 text-right">
                        <div className={`text-2xl font-black tabular-nums tracking-tighter ${entry.rank <= 3 ? style.text : 'text-white'}`}>
                          {entry.gameType === 'OVERALL' ? `${entry.score} pts` : entry.score.toLocaleString()}
                        </div>
                        {entry.gameType === 'OVERALL' && entry.gamesPlayed && (
                          <div className="text-xs text-slate-500 font-medium mt-1">
                            {entry.gamesPlayed}/3 games
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
          
          {!loading && entries.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">🌑</div>
              <div className="text-slate-400 font-medium">No champions yet. Claim your spot.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
