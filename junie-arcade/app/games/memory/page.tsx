'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import GameOverCard from '@/app/components/GameOverCard'
import FlagIcon from '@/app/components/FlagIcon'

interface Card {
  id: number
  imageUrl: string
  matched: boolean
}

const cardImages = [
  '/assets/images/cards/card-jinx.png',
  '/assets/images/cards/card-yasuo.png',
  '/assets/images/cards/card-lux.png',
  '/assets/images/cards/card-ezreal.png',
  '/assets/images/cards/card-jett.png',
  '/assets/images/cards/card-sage.png',
  '/assets/images/cards/card-phoenix.png',
  '/assets/images/cards/card-reyna.png',
]

export default function MemoryMatchPage() {
  const router = useRouter()
  const countryDropdownRef = useRef<HTMLDivElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [username, setUsername] = useState('')
  const [country, setCountry] = useState('')
  const [countries, setCountries] = useState<Array<{ name: string; flag: string; code: string }>>([])
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [gameOver, setGameOver] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch countries on mount
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCountryDropdown])

  // Menu music for the entry screen
  useEffect(() => {
    if (!gameStarted && !gameOver) {
      const menuMusic = new Audio('/assets/sounds/music/music-menu.mp3')
      menuMusic.loop = true
      menuMusic.volume = 0.3
      let playPromise: Promise<void> | null = null

      playPromise = menuMusic.play()
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error("Error playing menu music:", e))
      }

      return () => {
        if (playPromise !== null) {
          playPromise.then(() => {
            menuMusic.pause()
            menuMusic.src = ""
          }).catch(() => {
            menuMusic.pause()
            menuMusic.src = ""
          })
        } else {
          menuMusic.pause()
          menuMusic.src = ""
        }
      }
    }
  }, [gameStarted, gameOver])

  // Audio helpers
  const playSound = (path: string, volume = 0.5) => {
    const audio = new Audio(path)
    audio.volume = volume
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(e => console.error("Error playing sound:", e))
    }
  }

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const bgm = new Audio('/assets/sounds/music/music-game.mp3')
      bgm.loop = true
      bgm.volume = 0.4
      let playPromise: Promise<void> | null = null

      playPromise = bgm.play()
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error("Error playing BGM:", e))
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true)
            playSound('/assets/sounds/sfx/gameover.mp3', 0.6)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        clearInterval(timer)
        if (playPromise !== null) {
          playPromise.then(() => {
            bgm.pause()
            bgm.src = ""
          }).catch(() => {
            bgm.pause()
            bgm.src = ""
          })
        } else {
          bgm.pause()
          bgm.src = ""
        }
      }
    }
  }, [gameStarted, gameOver])

  // Victory music on game over
  useEffect(() => {
    if (!gameOver || !gameStarted) return

    const victoryMusic = new Audio('/assets/sounds/music/music-victory.mp3')
    victoryMusic.loop = true
    victoryMusic.volume = 0.4
    let playPromise: Promise<void> | null = null

    playPromise = victoryMusic.play()
    if (playPromise !== undefined) {
      playPromise.catch(e => console.error("Error playing victory music:", e))
    }

    return () => {
      if (playPromise !== null) {
        playPromise.then(() => {
          victoryMusic.pause()
          victoryMusic.src = ""
        }).catch(() => {
          victoryMusic.pause()
          victoryMusic.src = ""
        })
      } else {
        victoryMusic.pause()
        victoryMusic.src = ""
      }
    }
  }, [gameOver, gameStarted])

  useEffect(() => {
    if (matchedPairs === 8) {
      setGameOver(true)
      const timeBonus = timeLeft * 10
      const accuracyBonus = Math.floor((16 / moves) * 100)
      setScore((prev) => prev + timeBonus + accuracyBonus + 200)
      playSound('/assets/sounds/sfx/success.mp3', 0.7)
    }
  }, [matchedPairs, timeLeft, moves])

  const initializeGame = () => {
    if (!username.trim() || !country) return

    const shuffled = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((img, index) => ({
        id: index,
        imageUrl: img,
        matched: false
      }))
    setCards(shuffled)
    setFlippedIndices([])
    setMatchedPairs(0)
    setMoves(0)
    setScore(0)
    setTimeLeft(120)
    setGameOver(false)
    setGameStarted(true)
  }

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      cards[index].matched ||
      gameOver
    ) {
      return
    }

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)
    playSound('/assets/sounds/sfx/click.mp3', 0.4)

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1)
      const [first, second] = newFlipped

      if (cards[first].imageUrl === cards[second].imageUrl) {
        // Match found
        setTimeout(() => {
          playSound('/assets/sounds/sfx/success.mp3', 0.5)
          const newCards = [...cards]
          newCards[first].matched = true
          newCards[second].matched = true
          setCards(newCards)
          setMatchedPairs((prev) => prev + 1)
          setScore((prev) => prev + 50)
          setFlippedIndices([])
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          playSound('/assets/sounds/sfx/error.mp3', 0.4)
          setFlippedIndices([])
        }, 1000)
      }
    }
  }

  const handleSaveScore = async () => {
    if (!username || !country || isSaving) return
    setIsSaving(true)

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          country,
          gameType: 'MEMORY_MATCH',
          score,
          time: 120 - timeLeft
        })
      })
      // No longer redirecting automatically here, as it's auto-saved in GameOverCard
    } catch (error) {
      console.error('Failed to auto-save score:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const heroImages = [
    '/assets/images/hero/Jinx_Render.webp',
    '/assets/images/hero/Lux_Render.webp',
    '/assets/images/hero/Reyna_Artwork_Full.webp',
    '/assets/images/hero/Sage_Artwork_Full.webp',
    '/assets/images/hero/Jett_Artwork_Full.webp',
    '/assets/images/hero/Phoenix_Artwork_Full.webp',
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-fuchsia-500/30 overflow-hidden">
      {/* Animated Background - Matching Home Page Style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-arena.jpg')] opacity-30 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 110, 0],
            y: [0, 65, 0]
          }}
          transition={{ duration: 21, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-purple-600/30 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -95, 0],
            y: [0, 85, 0]
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-fuchsia-500/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 17, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px]"
        />

        {/* Floating Hero Characters - Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.8, 1, 1.2],
                x: i % 2 === 0 ? [0, 55, 0] : [0, -55, 0],
                y: [0, -105, 0]
              }}
              transition={{
                duration: 17,
                repeat: Infinity,
                delay: i * 2.8,
                ease: "linear"
              }}
              className={`absolute ${
                i === 0 ? 'top-[14%] left-[7%]' :
                i === 1 ? 'top-[26%] right-[11%]' :
                i === 2 ? 'top-[46%] left-[6%]' :
                i === 3 ? 'top-[66%] right-[7%]' :
                i === 4 ? 'bottom-[16%] left-[13%]' :
                'bottom-[32%] right-[11%]'
              } w-64 h-[400px]`}
            >
              <Image
                src={img}
                alt="Hero"
                fill
                className="object-contain filter brightness-110 contrast-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              />
            </motion.div>
          ))}
        </div>

        {/* Floating Junie Mascots */}
        <motion.div
          animate={{
            y: [0, -32, 0],
            rotate: [0, 14, -14, 0],
            x: [0, 22, 0]
          }}
          transition={{
            duration: 7.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[19%] left-[3.5%] w-32 h-32 pointer-events-none opacity-60"
        >
          <Image
            src="/assets/images/junie/junie-happy.png"
            alt="Junie Happy"
            fill
            className="object-contain drop-shadow-[0_0_20px_rgba(192,38,211,0.6)]"
          />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -26, 0],
            rotate: [0, -9, 9, 0],
            x: [0, -17, 0]
          }}
          transition={{
            duration: 6.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.9
          }}
          className="absolute bottom-[26%] right-[4.5%] w-28 h-28 pointer-events-none opacity-50"
        >
          <Image
            src="/assets/images/junie/junie-idle.png"
            alt="Junie Idle"
            fill
            className="object-contain drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]"
          />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -21, 0],
            rotate: [0, 9, -9, 0],
            scale: [1, 1.09, 1]
          }}
          transition={{
            duration: 5.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8
          }}
          className="absolute top-[57%] left-[9%] w-24 h-24 pointer-events-none opacity-50"
        >
          <Image
            src="/assets/images/junie/junie-jump.png"
            alt="Junie Jump"
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(192,38,211,0.4)]"
          />
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-3xl">←</span>
              <span className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Back to Arena</span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <Image src="/assets/images/logos/cloud9-logo.png" alt="Cloud9" width={70} height={24} className="brightness-110" />
              <div className="h-6 w-px bg-white/20" />
              <Image src="/assets/images/logos/jetbrains-logo.png" alt="JetBrains" width={70} height={24} className="opacity-90" />
            </div>
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sky's the Limit</div>
              <div className="text-xs font-bold text-white">Hackathon 2026</div>
            </div>
          </motion.div>
        </nav>

        {/* Main Content */}
        <div className="px-8 pb-20 max-w-7xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-400">Pattern Recognition</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-black mb-4 tracking-tighter leading-none">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600">
                MEMORY MATCH
              </span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
              <span className="text-white">Link the identities</span> of champions across the multiverse.
              <span className="text-fuchsia-400"> Pattern recognition at scale.</span>
            </p>
          </motion.div>

          {/* Username Input Screen */}
          {!gameStarted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-block p-6 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-2xl mb-6">
                    <div className="w-20 h-20 relative">
                      <Image 
                        src="/assets/images/logos/game_logo/memory_match.png" 
                        alt="Memory Match" 
                        fill 
                        className="object-contain filter drop-shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Sync Neural Network</h2>
                  <p className="text-slate-400 text-sm">Initialize memory matrix protocol</p>
                </div>

                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Neural ID"
                    className="w-full px-6 py-4 rounded-2xl text-lg text-center border-2 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 backdrop-blur-sm transition-all"
                    maxLength={20}
                    autoFocus
                  />

                  <div className="relative" ref={countryDropdownRef}>
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => {
                        setCountrySearch(e.target.value)
                        setShowCountryDropdown(true)
                      }}
                      onFocus={() => setShowCountryDropdown(true)}
                      placeholder={country ? country : "Search your country"}
                      className="w-full px-6 py-4 rounded-2xl text-lg text-center border-2 border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 backdrop-blur-sm transition-all"
                    />
                    {country && (
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FlagIcon code={countries.find(c => c.name === country)?.code || 'US'} className="w-8 h-5" />
                      </div>
                    )}
                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-2 border-white/10 rounded-2xl shadow-2xl">
                        {countries
                          .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                          .slice(0, 50)
                          .map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setCountry(c.name)
                                setCountrySearch('')
                                setShowCountryDropdown(false)
                              }}
                              className="w-full px-6 py-3 text-left hover:bg-fuchsia-500/20 transition-colors text-white flex items-center gap-3"
                            >
                              <FlagIcon code={c.code} className="w-8 h-5" animate={false} />
                              <span>{c.name}</span>
                            </button>
                          ))}
                        {countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                          <div className="px-6 py-4 text-center text-slate-400">No countries found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={initializeGame}
                  disabled={!username.trim() || !country}
                  whileHover={username.trim() && country ? { scale: 1.02 } : {}}
                  whileTap={username.trim() && country ? { scale: 0.98 } : {}}
                  className="w-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600 text-white font-black py-5 px-8 rounded-2xl text-xl uppercase tracking-wider hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Initialize Matrix
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Game Screen */}
          {gameStarted && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Stats Bar */}
              <div className="flex justify-between items-center gap-4 mb-8 max-w-5xl mx-auto">
                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</div>
                  <div className="text-3xl font-black text-white">{score.toLocaleString()}</div>
                </div>

                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pairs</div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">
                    {matchedPairs}/8
                  </div>
                </div>

                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Moves</div>
                  <div className="text-3xl font-black text-white">{moves}</div>
                </div>

                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time</div>
                  <div className={`text-3xl font-black transition-colors ${timeLeft < 20 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
                <AnimatePresence>
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                      whileHover={{ scale: card.matched ? 1 : 1.05 }}
                      whileTap={{ scale: card.matched ? 1 : 0.95 }}
                      className="aspect-[3/4] cursor-pointer"
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="relative w-full h-full perspective-1000">
                        <motion.div
                          className="relative w-full h-full"
                          animate={{
                            rotateY: (flippedIndices.includes(index) || card.matched) ? 180 : 0
                          }}
                          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Card Back */}
                          <div className="absolute inset-0 backface-hidden">
                            <div className="relative w-full h-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-2xl border-2 border-white/20 backdrop-blur-sm overflow-hidden">
                              <Image
                                src="/assets/images/cards/card-back.png"
                                alt="Card back"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>

                          {/* Card Front */}
                          <div className="absolute inset-0 backface-hidden" style={{ transform: "rotateY(180deg)" }}>
                            <div className={`relative w-full h-full rounded-2xl border-4 overflow-hidden transition-all ${
                              card.matched ? 'border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'border-white/30'
                            }`}>
                              <Image
                                src={card.imageUrl}
                                alt="Card"
                                fill
                                className="object-cover"
                              />
                              {card.matched && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute inset-0 bg-green-500/20 backdrop-blur-[1px] flex items-center justify-center"
                                >
                                  <span className="text-6xl">✓</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Game Over Screen */}
          {gameOver && (
            <GameOverCard
              username={username}
              country={country}
              score={score}
              gameType="MEMORY_MATCH"
              stats={[
                { label: 'Final Score', value: score.toLocaleString(), color: 'text-purple-400' },
                { label: 'Pairs Matched', value: `${matchedPairs}/8`, color: 'text-fuchsia-400' },
                { label: 'Moves', value: moves, color: 'text-white' },
                ...(matchedPairs === 8 && moves <= 20 ? [{ label: 'Achievement', value: '🌟 Perfect', color: 'text-yellow-400' }] : [])
              ]}
              onSaveScore={handleSaveScore}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  )
}
