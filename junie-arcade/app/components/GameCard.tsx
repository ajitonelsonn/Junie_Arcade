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
}

export default function GameCard({ title, description, icon, href, gradient, brandIcon }: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -8 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative overflow-hidden rounded-[2rem] bg-slate-900 p-1 shadow-2xl cursor-pointer transition-all duration-500 h-full min-h-[350px] flex flex-col`}
      >
        {/* Animated Gradient Border Effect */}
        <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${gradient}`} />
        
        {/* Inner Content Container */}
        <div className="relative z-10 flex flex-col h-full bg-slate-900/90 backdrop-blur-xl rounded-[1.9rem] p-8 overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors duration-500">
          
          {/* Background Decorative Element */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-500 ${gradient}`} />

          <div className="flex justify-between items-start mb-6">
            <div className="text-6xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">{icon}</div>
            {brandIcon && (
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                <Image src={brandIcon} alt="Brand" width={32} height={32} className="object-contain" />
              </div>
            )}
          </div>

          <div className="flex-grow">
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
              {title}
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-200 transition-colors duration-500">
              {description}
            </p>
          </div>

          <div className="mt-8">
            <div className="relative inline-flex group/btn">
              <div className={`absolute -inset-px rounded-full opacity-0 group-hover/btn:opacity-100 transition duration-500 ${gradient} blur-sm`} />
              <button className="relative w-full bg-white text-slate-900 font-black py-4 px-10 rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300">
                ENTER ARENA
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
