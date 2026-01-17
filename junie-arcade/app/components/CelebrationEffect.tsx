'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CelebrationEffectProps {
  rank: number
  isActive: boolean
}

// Particle emojis for celebration
const PARTICLES = ['🎈', '🎊', '🏆', '⭐', '✨', '🎉', '🥳', '💫']

// Get color based on rank
const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return { glow: 'rgba(255, 215, 0, 0.8)', border: '#FFD700' } // Gold
    case 2: return { glow: 'rgba(192, 192, 192, 0.8)', border: '#C0C0C0' } // Silver
    case 3: return { glow: 'rgba(205, 127, 50, 0.8)', border: '#CD7F32' } // Bronze
    default: return { glow: 'rgba(255, 255, 255, 0.5)', border: '#ffffff' }
  }
}

// Generate random particles with positions
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: PARTICLES[Math.floor(Math.random() * PARTICLES.length)],
    x: Math.random() * 100 - 50, // Random horizontal spread
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    scale: 0.8 + Math.random() * 0.6,
  }))
}

export default function CelebrationEffect({ rank, isActive }: CelebrationEffectProps) {
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])
  const colors = getRankColor(rank)

  useEffect(() => {
    if (isActive) {
      setParticles(generateParticles(12))
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <>
      {/* Glowing border overlay */}
      <m.div
        className="absolute inset-0 pointer-events-none z-10 rounded-sm"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0.7, 1, 0],
          boxShadow: [
            `inset 0 0 0 2px transparent, 0 0 0 ${colors.glow}`,
            `inset 0 0 0 3px ${colors.border}, 0 0 30px ${colors.glow}`,
            `inset 0 0 0 2px ${colors.border}, 0 0 20px ${colors.glow}`,
            `inset 0 0 0 3px ${colors.border}, 0 0 40px ${colors.glow}`,
            `inset 0 0 0 0 transparent, 0 0 0 ${colors.glow}`,
          ],
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      {/* Floating particles container */}
      <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
        <AnimatePresence>
          {particles.map((particle) => (
            <m.div
              key={particle.id}
              className="absolute text-2xl md:text-3xl"
              style={{
                left: `${50 + particle.x * 0.3}%`,
                bottom: '50%',
              }}
              initial={{
                y: 0,
                opacity: 0,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                y: -200 - Math.random() * 100,
                opacity: [0, 1, 1, 0],
                scale: [0, particle.scale, particle.scale * 0.8, 0],
                rotate: Math.random() * 360 - 180,
                x: particle.x,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            >
              {particle.emoji}
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Spotlight/flash effect */}
      <m.div
        className="absolute inset-0 pointer-events-none z-5"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </>
  )
}
