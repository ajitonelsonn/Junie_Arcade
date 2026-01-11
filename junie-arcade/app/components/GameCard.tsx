'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface GameCardProps {
  title: string
  description: string
  icon: string
  href: string
  gradient: string
}

export default function GameCard({ title, description, icon, href, gradient }: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -10 }}
        whileTap={{ scale: 0.95 }}
        className={`relative overflow-hidden rounded-2xl ${gradient} p-8 shadow-2xl cursor-pointer transition-all duration-300 h-full min-h-[300px] flex flex-col justify-between`}
      >
        <div className="relative z-10">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/90 text-lg">{description}</p>
        </div>
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full border-2 border-white/50 hover:bg-white/30 transition-all duration-200"
          >
            PLAY NOW
          </motion.button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      </motion.div>
    </Link>
  )
}
