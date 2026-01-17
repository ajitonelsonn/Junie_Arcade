'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import FlagIcon from './FlagIcon'

interface ChampionData {
  username: string
  rank: number
  score: number
  country?: string | null
  countryCode?: string | null
}

interface NewChampionAnnouncementProps {
  champion: ChampionData | null
  onComplete?: () => void
}

// Balloon colors based on rank
const getBalloonColors = (rank: number) => {
  switch (rank) {
    case 1: return ['#FFD700', '#FFA500', '#FFEC8B', '#FFD700', '#FFC125', '#FFB90F', '#EEEE00'] // Gold
    case 2: return ['#C0C0C0', '#A9A9A9', '#D3D3D3', '#E8E8E8', '#B8B8B8', '#DCDCDC', '#F5F5F5'] // Silver
    case 3: return ['#CD7F32', '#D2691E', '#DEB887', '#CD853F', '#B8860B', '#DAA520', '#F4A460'] // Bronze
    default: return ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3']
  }
}

// Get rank styling
const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1: return {
      gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
      glow: 'rgba(255, 215, 0, 0.8)',
      text: 'text-yellow-400',
      medal: '🥇',
      title: 'CHAMPION',
      bg: 'from-yellow-500/20 to-amber-600/10'
    }
    case 2: return {
      gradient: 'from-slate-300 via-gray-400 to-slate-500',
      glow: 'rgba(192, 192, 192, 0.8)',
      text: 'text-slate-300',
      medal: '🥈',
      title: 'RUNNER UP',
      bg: 'from-slate-400/20 to-gray-500/10'
    }
    case 3: return {
      gradient: 'from-orange-400 via-amber-600 to-orange-700',
      glow: 'rgba(205, 127, 50, 0.8)',
      text: 'text-orange-400',
      medal: '🥉',
      title: 'TOP 3',
      bg: 'from-orange-500/20 to-amber-700/10'
    }
    default: return {
      gradient: 'from-cyan-400 to-blue-500',
      glow: 'rgba(34, 211, 238, 0.8)',
      text: 'text-cyan-400',
      medal: '🏆',
      title: 'NEW ENTRY',
      bg: 'from-cyan-500/20 to-blue-600/10'
    }
  }
}

// Generate balloons
const generateBalloons = (count: number, rank: number) => {
  const colors = getBalloonColors(rank)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    startX: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 3 + Math.random() * 2,
    size: 50 + Math.random() * 40,
    wobble: Math.random() * 40 - 20,
    stringLength: 50 + Math.random() * 40,
  }))
}

// Balloon SVG
const Balloon = ({ color, size, stringLength }: { color: string; size: number; stringLength: number }) => (
  <svg width={size} height={size + stringLength} viewBox={`0 0 ${size} ${size + stringLength}`} fill="none">
    <defs>
      <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id={`shine-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
      </linearGradient>
    </defs>
    <ellipse
      cx={size / 2}
      cy={size / 2}
      rx={size / 2 - 3}
      ry={size / 2}
      fill={color}
      filter={`url(#glow-${color.replace('#', '')})`}
    />
    <ellipse
      cx={size / 2}
      cy={size / 2}
      rx={size / 2 - 3}
      ry={size / 2}
      fill={`url(#shine-${color.replace('#', '')})`}
    />
    <ellipse
      cx={size / 2 - size / 5}
      cy={size / 3}
      rx={size / 7}
      ry={size / 5}
      fill="rgba(255,255,255,0.5)"
    />
    <path
      d={`M${size / 2 - 5} ${size - 3} Q${size / 2} ${size + 8} ${size / 2 + 5} ${size - 3}`}
      fill={color}
    />
    <path
      d={`M${size / 2} ${size + 5}
         C${size / 2 + 12} ${size + stringLength / 4} ${size / 2 - 12} ${size + stringLength / 2} ${size / 2} ${size + stringLength}`}
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="2"
      fill="none"
    />
  </svg>
)

export default function NewChampionAnnouncement({ champion, onComplete }: NewChampionAnnouncementProps) {
  const [balloons, setBalloons] = useState<ReturnType<typeof generateBalloons>>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (champion) {
      setBalloons(generateBalloons(15, champion.rank))
      setIsVisible(true)

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onComplete?.(), 500)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [champion, onComplete])

  if (!champion) return null

  const style = getRankStyle(champion.rank)

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
        >
          {/* Dark overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />

          {/* Radial glow background */}
          <m.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${style.glow} 0%, transparent 60%)`,
            }}
          />

          {/* Flying Balloons */}
          {balloons.map((balloon) => (
            <m.div
              key={balloon.id}
              className="absolute"
              style={{
                left: `${balloon.startX}%`,
                bottom: '-150px',
              }}
              initial={{
                y: 0,
                x: 0,
                opacity: 0,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                y: [0, -window.innerHeight - 300],
                x: [0, balloon.wobble, -balloon.wobble, balloon.wobble * 0.5, balloon.wobble],
                opacity: [0, 1, 1, 1, 0.9, 0],
                scale: [0, 1.3, 1, 1.1, 1, 0.8],
                rotate: [0, balloon.wobble / 3, -balloon.wobble / 3, balloon.wobble / 4, 0],
              }}
              transition={{
                duration: balloon.duration,
                delay: balloon.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <Balloon
                color={balloon.color}
                size={balloon.size}
                stringLength={balloon.stringLength}
              />
            </m.div>
          ))}

          {/* Main Announcement Card */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 200,
                delay: 0.3,
              }}
              className="relative max-w-lg w-full"
            >
              {/* Glowing border effect */}
              <m.div
                animate={{
                  boxShadow: [
                    `0 0 30px ${style.glow}, 0 0 60px ${style.glow}`,
                    `0 0 50px ${style.glow}, 0 0 100px ${style.glow}`,
                    `0 0 30px ${style.glow}, 0 0 60px ${style.glow}`,
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`absolute -inset-1 bg-gradient-to-r ${style.gradient} rounded-3xl blur-sm`}
              />

              {/* Card content */}
              <div className={`relative bg-gradient-to-br ${style.bg} backdrop-blur-xl border border-white/20 rounded-3xl p-8 overflow-hidden`}>
                {/* Decorative corner accents */}
                <div className={`absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 ${style.text} opacity-50 rounded-tl-3xl`} />
                <div className={`absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 ${style.text} opacity-50 rounded-br-3xl`} />

                {/* NEW TOP badge */}
                <m.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mb-4"
                >
                  <span className={`inline-block px-4 py-1 bg-gradient-to-r ${style.gradient} text-black font-black text-xs uppercase tracking-[0.3em] rounded-full`}>
                    New {style.title}
                  </span>
                </m.div>

                {/* Medal and Rank */}
                <m.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="text-center mb-6"
                >
                  <span className="text-8xl filter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                    {style.medal}
                  </span>
                  <div className={`text-6xl font-black ${style.text} mt-2`}>
                    #{champion.rank}
                  </div>
                </m.div>

                {/* Player Info */}
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-center space-y-4"
                >
                  {/* Country Flag & Name */}
                  <div className="flex items-center justify-center gap-4">
                    {champion.countryCode && (
                      <div className="transform scale-150">
                        <FlagIcon code={champion.countryCode} className="w-10 h-7" animate={false} />
                      </div>
                    )}
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight italic">
                      {champion.username}
                    </h2>
                  </div>

                  {/* Country Name */}
                  {champion.country && (
                    <p className="text-lg text-white/60 font-bold uppercase tracking-widest">
                      {champion.country}
                    </p>
                  )}

                  {/* Score */}
                  <m.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className={`inline-block px-8 py-4 bg-black/30 rounded-2xl border border-white/10`}
                  >
                    <div className={`text-5xl md:text-6xl font-black ${style.text} tabular-nums tracking-tight`}>
                      {champion.score.toLocaleString()}
                    </div>
                    <div className="text-white/40 text-sm font-black uppercase tracking-[0.3em] mt-1">
                      Champion Points
                    </div>
                  </m.div>
                </m.div>

                {/* Sparkle effects */}
                {[...Array(8)].map((_, i) => (
                  <m.div
                    key={i}
                    className="absolute text-3xl pointer-events-none"
                    style={{
                      left: `${10 + (i % 4) * 25}%`,
                      top: `${20 + Math.floor(i / 4) * 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      rotate: [0, 180],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.8 + i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    ✨
                  </m.div>
                ))}
              </div>
            </m.div>
          </div>

          {/* Confetti burst from center */}
          {[...Array(30)].map((_, i) => {
            const colors = getBalloonColors(champion.rank)
            const angle = (i / 30) * Math.PI * 2
            const distance = 200 + Math.random() * 300
            return (
              <m.div
                key={`confetti-${i}`}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[i % colors.length] }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0.5],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2,
                  delay: 0.5 + Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            )
          })}
        </m.div>
      )}
    </AnimatePresence>
  )
}
