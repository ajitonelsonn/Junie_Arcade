'use client'

import { m, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CelebrationEffectProps {
  rank: number
  isActive: boolean
}

// Balloon colors based on rank
const getBalloonColors = (rank: number) => {
  switch (rank) {
    case 1: return ['#FFD700', '#FFA500', '#FFEC8B', '#FFD700', '#FFC125'] // Gold
    case 2: return ['#C0C0C0', '#A9A9A9', '#D3D3D3', '#E8E8E8', '#B8B8B8'] // Silver
    case 3: return ['#CD7F32', '#D2691E', '#DEB887', '#CD853F', '#B8860B'] // Bronze
    default: return ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']
  }
}

// Get glow color based on rank
const getGlowColor = (rank: number) => {
  switch (rank) {
    case 1: return 'rgba(255, 215, 0, 0.8)'
    case 2: return 'rgba(192, 192, 192, 0.8)'
    case 3: return 'rgba(205, 127, 50, 0.8)'
    default: return 'rgba(255, 255, 255, 0.5)'
  }
}

// Generate balloons with random properties
const generateBalloons = (count: number, rank: number) => {
  const colors = getBalloonColors(rank)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100 - 50, // Random horizontal spread
    startX: Math.random() * 80 + 10, // Start position (10% to 90% of container)
    delay: Math.random() * 0.8,
    duration: 2.5 + Math.random() * 1.5,
    size: 35 + Math.random() * 25, // Balloon size 35-60px
    wobble: Math.random() * 30 - 15, // Random wobble amount
    stringLength: 40 + Math.random() * 30, // String length
  }))
}

// Generate confetti particles
const generateConfetti = (count: number, rank: number) => {
  const colors = getBalloonColors(rank)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 200 - 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    rotation: Math.random() * 720 - 360,
    size: 8 + Math.random() * 8,
    shape: ['square', 'rectangle', 'circle'][Math.floor(Math.random() * 3)],
  }))
}

// Balloon SVG component
const Balloon = ({ color, size, stringLength }: { color: string; size: number; stringLength: number }) => (
  <svg width={size} height={size + stringLength} viewBox={`0 0 ${size} ${size + stringLength}`} fill="none">
    {/* Balloon body */}
    <ellipse
      cx={size / 2}
      cy={size / 2}
      rx={size / 2 - 2}
      ry={size / 2}
      fill={color}
      filter="url(#balloonGlow)"
    />
    {/* Balloon highlight */}
    <ellipse
      cx={size / 2 - size / 6}
      cy={size / 3}
      rx={size / 8}
      ry={size / 6}
      fill="rgba(255,255,255,0.4)"
    />
    {/* Balloon knot */}
    <path
      d={`M${size / 2 - 4} ${size - 2} Q${size / 2} ${size + 6} ${size / 2 + 4} ${size - 2}`}
      fill={color}
    />
    {/* Balloon string - wavy line */}
    <path
      d={`M${size / 2} ${size + 4}
         Q${size / 2 + 8} ${size + stringLength / 3} ${size / 2} ${size + stringLength / 2}
         Q${size / 2 - 8} ${size + (stringLength * 2) / 3} ${size / 2} ${size + stringLength}`}
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Glow filter */}
    <defs>
      <filter id="balloonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
)

export default function CelebrationEffect({ rank, isActive }: CelebrationEffectProps) {
  const [balloons, setBalloons] = useState<ReturnType<typeof generateBalloons>>([])
  const [confetti, setConfetti] = useState<ReturnType<typeof generateConfetti>>([])
  const glowColor = getGlowColor(rank)

  useEffect(() => {
    if (isActive) {
      setBalloons(generateBalloons(8, rank))
      setConfetti(generateConfetti(20, rank))
    }
  }, [isActive, rank])

  if (!isActive) return null

  return (
    <>
      {/* Glowing border overlay with pulsing effect */}
      <m.div
        className="absolute inset-0 pointer-events-none z-10 rounded-sm"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0.7, 1, 0.8, 1, 0],
          boxShadow: [
            `inset 0 0 0 2px transparent, 0 0 0px ${glowColor}`,
            `inset 0 0 0 4px ${glowColor}, 0 0 50px ${glowColor}`,
            `inset 0 0 0 2px ${glowColor}, 0 0 30px ${glowColor}`,
            `inset 0 0 0 4px ${glowColor}, 0 0 60px ${glowColor}`,
            `inset 0 0 0 3px ${glowColor}, 0 0 40px ${glowColor}`,
            `inset 0 0 0 4px ${glowColor}, 0 0 50px ${glowColor}`,
            `inset 0 0 0 0 transparent, 0 0 0px ${glowColor}`,
          ],
        }}
        transition={{ duration: 3.5, ease: 'easeInOut' }}
      />

      {/* Flying Balloons Container - positioned to fly across the full viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[100]">
        <AnimatePresence>
          {balloons.map((balloon) => (
            <m.div
              key={balloon.id}
              className="absolute"
              style={{
                left: `${balloon.startX}%`,
                bottom: '-100px',
              }}
              initial={{
                y: 0,
                x: 0,
                opacity: 0,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                y: [0, -window.innerHeight - 200],
                x: [0, balloon.wobble, -balloon.wobble, balloon.wobble, balloon.x],
                opacity: [0, 1, 1, 1, 0.8, 0],
                scale: [0, 1.2, 1, 1, 0.9],
                rotate: [0, balloon.wobble / 2, -balloon.wobble / 2, balloon.wobble / 3, 0],
              }}
              transition={{
                duration: balloon.duration,
                delay: balloon.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
                x: {
                  duration: balloon.duration,
                  ease: 'easeInOut',
                  times: [0, 0.25, 0.5, 0.75, 1],
                },
              }}
            >
              <Balloon
                color={balloon.color}
                size={balloon.size}
                stringLength={balloon.stringLength}
              />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confetti burst */}
      <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
        <AnimatePresence>
          {confetti.map((piece) => (
            <m.div
              key={piece.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                width: piece.size,
                height: piece.shape === 'rectangle' ? piece.size * 2 : piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.shape === 'circle' ? '50%' : '2px',
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: piece.x,
                y: [-20, -100 - piece.y, 50],
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.5],
                rotate: piece.rotation,
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Sparkle burst effect */}
      <div className="absolute inset-0 overflow-visible pointer-events-none z-15">
        {[...Array(12)].map((_, i) => (
          <m.div
            key={i}
            className="absolute left-1/2 top-1/2 text-2xl"
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0
            }}
            animate={{
              x: Math.cos((i * 30 * Math.PI) / 180) * 150,
              y: Math.sin((i * 30 * Math.PI) / 180) * 80,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.1 + i * 0.05,
              ease: 'easeOut',
            }}
          >
            ✨
          </m.div>
        ))}
      </div>

      {/* Central flash effect */}
      <m.div
        className="absolute inset-0 pointer-events-none z-5"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0, 0.6, 0.3, 0.5, 0],
          scale: [0.5, 1.5, 1.2, 1.3, 2],
        }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Celebration text */}
      <m.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0, 1.2, 1, 0.8],
          y: [20, 0, 0, -30],
        }}
        transition={{ duration: 2, delay: 0.3 }}
      >
        <div
          className="text-4xl md:text-5xl font-black uppercase tracking-wider px-6 py-3 rounded-lg"
          style={{
            color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
            textShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`,
          }}
        >
          {rank === 1 ? '🏆 CHAMPION! 🏆' : rank === 2 ? '🥈 TOP 2! 🥈' : '🥉 TOP 3! 🥉'}
        </div>
      </m.div>
    </>
  )
}
