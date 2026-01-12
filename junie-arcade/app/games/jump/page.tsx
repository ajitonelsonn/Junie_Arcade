'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import GameOverCard from '@/app/components/GameOverCard'
import FlagIcon from '@/app/components/FlagIcon'
import MobileWarningModal from '@/app/components/MobileWarningModal'
import { isMobilePhone } from '@/app/utils/deviceDetection'

const PhaserGame = dynamic(() => import('@/app/components/PhaserGame'), { ssr: false })

export default function JumpMasterPage() {
  const router = useRouter()
  const countryDropdownRef = useRef<HTMLDivElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [username, setUsername] = useState('')
  const [country, setCountry] = useState('')
  const [countries, setCountries] = useState<Array<{ name: string; flag: string; code: string }>>([])
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [score, setScore] = useState(0)
  const [distance, setDistance] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [JumpMasterScene, setJumpMasterScene] = useState<any>(null)
  const [showMobileWarning, setShowMobileWarning] = useState(false)

  // Check for mobile phone on mount
  useEffect(() => {
    if (isMobilePhone()) {
      setShowMobileWarning(true)
    }
  }, [])

  useEffect(() => {
    import('@/app/lib/phaser/JumpMasterScene').then((mod) => {
      setJumpMasterScene(() => mod.default)
    })
  }, [])

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

  // Victory music for the game over screen
  useEffect(() => {
    if (gameOver) {
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
    }
  }, [gameOver])

  const handleGameEnd = (finalScore: number, finalDistance: number) => {
    setScore(finalScore)
    setDistance(finalDistance)
    setGameOver(true)
    setGameStarted(false)
  }

  const phaserConfig: any = {
    type: 0, // Phaser.AUTO is 0
    width: 800,
    height: 500,
    backgroundColor: '#87ceeb',
    parent: 'phaser-game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    }
  }

  const handleStart = () => {
    if (username.trim() && country) {
      setGameStarted(true)
      setGameOver(false)
      setScore(0)
      setDistance(0)
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
          gameType: 'JUMP_MASTER',
          score,
          distance
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
    '/assets/images/hero/Reyna_Artwork_Full.webp',
    '/assets/images/hero/Sage_Artwork_Full.webp',
    '/assets/images/hero/Jinx_Render.webp',
    '/assets/images/hero/Yasuo_Render.webp',
    '/assets/images/hero/Lux_Render.webp',
    '/assets/images/hero/Ezreal_Render.webp',
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-hidden">
      {/* Animated Background - Matching Home Page Style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-space.jpg')] opacity-30 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 100, 0],
            y: [0, 70, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-cyan-600/30 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -90, 0],
            y: [0, 90, 0]
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]"
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
                x: i % 2 === 0 ? [0, 60, 0] : [0, -60, 0],
                y: [0, -110, 0]
              }}
              transition={{
                duration: 19,
                repeat: Infinity,
                delay: i * 3.2,
                ease: "linear"
              }}
              className={`absolute ${
                i === 0 ? 'top-[12%] left-[6%]' :
                i === 1 ? 'top-[28%] right-[10%]' :
                i === 2 ? 'top-[48%] left-[8%]' :
                i === 3 ? 'top-[68%] right-[6%]' :
                i === 4 ? 'bottom-[18%] left-[12%]' :
                'bottom-[35%] right-[12%]'
              } w-64 h-[400px]`}
            >
              <Image
                src={img}
                alt="Hero"
                fill
                sizes="256px"
                className="object-contain filter brightness-110 contrast-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              />
            </motion.div>
          ))}
        </div>

        {/* Floating Junie Mascots */}
        <motion.div
          animate={{
            y: [0, -35, 0],
            rotate: [0, 12, -12, 0],
            x: [0, 25, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[18%] left-[4%] w-32 h-32 pointer-events-none opacity-60"
        >
          <Image
            src="/assets/images/junie/junie-jump.png"
            alt="Junie Jump"
            fill
            sizes="128px"
            className="object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
          />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -28, 0],
            rotate: [0, -8, 8, 0],
            x: [0, -18, 0]
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
          className="absolute bottom-[28%] right-[4%] w-28 h-28 pointer-events-none opacity-50"
        >
          <Image
            src="/assets/images/junie/junie-happy.png"
            alt="Junie Happy"
            fill
            sizes="112px"
            className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -22, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.08, 1]
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
          className="absolute top-[58%] left-[8%] w-24 h-24 pointer-events-none opacity-50"
        >
          <Image
            src="/assets/images/junie/junie-idle.png"
            alt="Junie Idle"
            fill
            sizes="96px"
            className="object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
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
              <Image src="/assets/images/logos/cloud9-logo.png" alt="Cloud9" width={70} height={24} style={{ width: 'auto', height: 'auto' }} className="brightness-110" />
              <div className="h-6 w-px bg-white/20" />
              <Image src="/assets/images/logos/jetbrains-logo.png" alt="JetBrains" width={70} height={24} style={{ width: 'auto', height: 'auto' }} className="opacity-90" />
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Endless Pipeline</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-black mb-4 tracking-tighter leading-none">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                JUMP MASTER
              </span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
              <span className="text-white">Traverse the digital void.</span> Master momentum as you navigate
              <span className="text-cyan-400"> the endless cloud pipeline.</span>
            </p>
          </motion.div>

          {/* Username Input Screen */}
          {!gameStarted && !gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-block p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6">
                    <div className="w-20 h-20 relative">
                      <Image
                        src="/assets/images/logos/game_logo/jump_master.png"
                        alt="Jump Master"
                        fill
                        sizes="80px"
                        className="object-contain filter drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Initialize Runner</h2>
                  <p className="text-slate-400 text-sm">Enter credentials to begin deployment</p>
                </div>

                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Runner username"
                    className="w-full px-6 py-4 rounded-2xl text-lg text-center border-2 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm transition-all"
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
                      className="w-full px-6 py-4 rounded-2xl text-lg text-center border-2 border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm transition-all"
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
                              className="w-full px-6 py-3 text-left hover:bg-cyan-500/20 transition-colors text-white flex items-center gap-3"
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
                  onClick={handleStart}
                  disabled={!username.trim() || !country}
                  whileHover={username.trim() && country ? { scale: 1.02 } : {}}
                  whileTap={username.trim() && country ? { scale: 0.98 } : {}}
                  className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white font-black py-5 px-8 rounded-2xl text-xl uppercase tracking-wider hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Deploy Runner
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Game Screen */}
          {gameStarted && !gameOver && JumpMasterScene && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl max-w-4xl">
                <div id="phaser-game-container" className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-inner">
                  <PhaserGame
                    config={{
                      ...phaserConfig,
                      scene: [
                        {
                          key: 'BootScene',
                          create: function(this: any) {
                            this.scene.start('JumpMasterScene', { onGameEnd: handleGameEnd });
                          }
                        },
                        JumpMasterScene
                      ]
                    }}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-6 text-white text-lg font-bold bg-white/5 px-8 py-4 rounded-2xl backdrop-blur-sm border border-white/10"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">⌨️</span>
                    <span>Press <span className="text-cyan-400 font-black">SPACE</span> or <span className="text-cyan-400 font-black">CLICK</span> to Jump!</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Game Over Screen */}
          {gameOver && (
            <GameOverCard
              username={username}
              country={country}
              score={score}
              gameType="JUMP_MASTER"
              stats={[
                { label: 'Final Score', value: score.toLocaleString(), color: 'text-cyan-400' },
                { label: 'Distance', value: `${distance}m`, color: 'text-blue-400' },
                ...(distance > 1000 ? [{ label: 'Achievement', value: '🌟 Marathon', color: 'text-yellow-400' }] : [])
              ]}
              onSaveScore={handleSaveScore}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>

      {/* Mobile Warning Modal */}
      <MobileWarningModal
        isOpen={showMobileWarning}
        gameName="Jump Master"
        gradient="from-cyan-400 via-blue-500 to-indigo-600"
        onClose={() => router.push('/')}
      />
    </div>
  )
}
