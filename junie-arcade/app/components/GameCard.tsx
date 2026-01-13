'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface GameCardProps {
  title: string
  description: string
  icon: string
  href: string
  gradient: string
  brandIcon?: string
  gameLogo?: string
}

export default function GameCard({ title, description, icon, href, gradient, gameLogo }: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03, y: -10 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl cursor-pointer transition-all duration-500 h-full min-h-[380px] flex flex-col hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
      >
        {/* Gradient Background Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />

        {/* Top Gradient Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-8">

          {/* Decorative Glow */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br ${gradient}`} />

          {/* Icon / Logo */}
          <div className="mb-6 h-20 flex items-center">
            {gameLogo ? (
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                style={{ willChange: 'transform' }}
                className="relative w-full h-full"
              >
                <Image
                  src={gameLogo}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
                  loading="lazy"
                  className="object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                />
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                style={{ willChange: 'transform' }}
                className="inline-block"
              >
                <div className={`text-7xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transform transition-transform duration-500`}>
                  {icon}
                </div>
              </motion.div>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-4xl font-black mb-4 tracking-tight transition-all duration-500 text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-slate-300 text-base leading-relaxed mb-8 flex-grow group-hover:text-white transition-colors duration-500">
            {description}
          </p>

          {/* Button */}
          <div className="mt-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Glow effect on hover */}
              <div className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r ${gradient} blur-lg`} />

              {/* Button */}
              <button className={`relative w-full bg-gradient-to-r ${gradient} text-white font-black py-4 px-8 rounded-2xl text-lg uppercase tracking-wider shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300`}>
                Enter Arena
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
