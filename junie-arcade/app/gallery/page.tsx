'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface GalleryItem {
  id: string
  url: string
  username: string
  score: number
  gameType: string
  country: string | null
  createdAt: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery')
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error('Failed to fetch gallery:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGallery()
  }, [])

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'text-[#ff4655]'
      case 'JUMP_MASTER': return 'text-[#00eeff]'
      case 'MEMORY_MATCH': return 'text-[#c284f9]'
      case 'OVERALL': return 'text-emerald-400'
      default: return 'text-white'
    }
  }

  const getGameTitle = (gameType: string) => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'Reflex Arena'
      case 'JUMP_MASTER': return 'Jump Master'
      case 'MEMORY_MATCH': return 'Memory Match'
      case 'OVERALL': return 'Ultimate Champion'
      default: return 'Game'
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-space.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/assets/images/logos/cloud9-logo.png" alt="Cloud9" width={100} height={35} style={{ width: 'auto', height: 'auto' }} className="brightness-110" />
            <div className="h-6 w-px bg-white/20" />
            <Image src="/assets/images/logos/jetbrains-logo.png" alt="JetBrains" width={100} height={35} style={{ width: 'auto', height: 'auto' }} className="opacity-90" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Arena</Link>
            <span className="text-white">Gallery</span>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <a href="https://cloud9.devpost.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Tournament</a>
          </div>
        </nav>

        <header className="px-8 pt-16 pb-12 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic">
              Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Victory</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">
              Immortalized moments from the arena. The legacy of champions, captured in high-definition.
            </p>
          </motion.div>
        </header>

        <main className="container mx-auto px-8 pb-32">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <p className="text-2xl font-black text-slate-500 uppercase italic">The gallery is currently empty.</p>
              <p className="text-slate-600 mt-2">Win a game and save your card to appear here!</p>
              <Link href="/" className="inline-block mt-8 px-8 py-3 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500 transition-colors">
                Enter the Arena
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {images.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedImage(item)}
                    className="group relative aspect-[4/5] bg-slate-900 border border-white/10 overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={item.url}
                      alt={`${item.username}'s card`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                          {getGameTitle(item.gameType)}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getGameColor(item.gameType)}`}>
                          {item.score.toLocaleString()} PTS
                        </span>
                      </div>
                      <div className="text-xl font-black text-white uppercase tracking-tighter truncate">
                        {item.username}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl aspect-[4/5] shadow-2xl"
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.username}
                fill
                className="object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white font-black uppercase tracking-widest text-sm"
              >
                Close [ESC]
              </button>
              
              <div className="absolute -bottom-16 left-0 right-0 flex justify-between items-center text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
                <div>
                  <span className="text-white">{selectedImage.username}</span> // {getGameTitle(selectedImage.gameType)}
                </div>
                <div>
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
