'use client'

import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'

interface GameCardProps {
  title: string
  description: string
  icon: string
  href: string
  gradient: string
  brandIcon?: string
  gameLogo?: string
}

// Game-specific theme colors matching GameOverCard
const GAME_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  'Reflex Arena': {
    primary: '#ff4655',
    secondary: '#fd4556',
    glow: 'rgba(255, 70, 85, 0.4)'
  },
  'Jump Master': {
    primary: '#00eeff',
    secondary: '#0ff',
    glow: 'rgba(0, 238, 255, 0.4)'
  },
  'Memory Match': {
    primary: '#c284f9',
    secondary: '#a855f7',
    glow: 'rgba(194, 132, 249, 0.4)'
  }
}

export default function GameCard({ title, description, href, gameLogo }: GameCardProps) {
  const colors = GAME_COLORS[title] || GAME_COLORS['Reflex Arena']

  return (
    <Link href={href}>
      <m.div
        whileHover={{ scale: 1.02, y: -8 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden cursor-pointer transition-all duration-500 h-full min-h-[340px] sm:min-h-[380px] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 14, 19, 0.95), rgba(15, 25, 35, 0.95))',
          border: `1px solid ${colors.primary}20`,
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
        }}
      >
        {/* Top Accent Bar - Angular */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
        />

        {/* Animated Scan Line */}
        <m.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[2px] opacity-20 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)` }}
        />

        {/* Corner Accents - VALORANT Style */}
        <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, ${colors.primary}, transparent)` }} />
          <div className="absolute top-0 left-0 h-full w-[2px]" style={{ background: `linear-gradient(180deg, ${colors.primary}, transparent)` }} />
        </div>
        <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none">
          <div className="absolute top-0 right-0 w-8 h-[2px]" style={{ background: `linear-gradient(270deg, ${colors.primary}60, transparent)` }} />
        </div>
        <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-8 h-[2px]" style={{ background: `linear-gradient(90deg, ${colors.primary}60, transparent)` }} />
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-[2px]" style={{ background: `linear-gradient(270deg, ${colors.primary}, transparent)` }} />
          <div className="absolute bottom-0 right-0 h-full w-[2px]" style={{ background: `linear-gradient(0deg, ${colors.primary}, transparent)` }} />
        </div>

        {/* Hexagonal Grid Pattern Background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        {/* Hover Glow Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 60px ${colors.glow}` }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-5 sm:p-8">
          {/* Status Indicator */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
            <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: colors.primary }}>Online</span>
          </div>

          {/* Decorative Glow */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${colors.glow}, transparent)` }}
          />

          {/* Icon / Logo - Hexagonal Frame */}
          <div className="mb-4 sm:mb-6 h-16 sm:h-20 flex items-center">
            {gameLogo ? (
              <m.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                style={{ willChange: 'transform' }}
                className="relative w-full h-full"
              >
                {/* Hexagonal glow behind logo */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                    background: `radial-gradient(circle, ${colors.glow}, transparent)`
                  }}
                />
                <Image
                  src={gameLogo}
                  alt={title}
                  fill
                  sizes="160px"
                  loading="lazy"
                  quality={70}
                  className="object-contain"
                  style={{ filter: `drop-shadow(0 0 20px ${colors.glow})` }}
                />
              </m.div>
            ) : (
              <m.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                style={{ willChange: 'transform' }}
                className="inline-block"
              >
                <div
                  className="text-5xl sm:text-7xl filter transform transition-transform duration-500"
                  style={{ filter: `drop-shadow(0 0 20px ${colors.glow})` }}
                >
                  🎮
                </div>
              </m.div>
            )}
          </div>

          {/* Game Type Label */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 rotate-45" style={{ backgroundColor: colors.primary }} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>
              Protocol Active
            </span>
          </div>

          {/* Title - Angular Style */}
          <h2
            className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 tracking-tight italic uppercase"
            style={{ color: colors.primary, textShadow: `0 0 30px ${colors.glow}` }}
          >
            {title}
          </h2>

          {/* Description */}
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 flex-grow group-hover:text-slate-300 transition-colors duration-500 font-medium">
            {description}
          </p>

          {/* Button - Angular VALORANT Style */}
          <div className="mt-auto">
            <m.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative"
            >
              {/* Button Glow */}
              <div
                className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition duration-500 blur-lg"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              />

              {/* Button */}
              <button
                className="relative w-full text-white font-black py-3 sm:py-4 px-6 sm:px-8 text-xs sm:text-sm uppercase tracking-[0.15em] transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                  boxShadow: `0 0 20px ${colors.glow}`
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>▶</span>
                  Enter Arena
                </span>
              </button>
            </m.div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${colors.primary}10, transparent)` }}
        />
      </m.div>
    </Link>
  )
}
