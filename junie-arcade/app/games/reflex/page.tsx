'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Target {
  id: number
  x: number
  y: number
  type: 'good' | 'bad'
  image: string
  value: number
  spawnTime: number
}

const GOOD_TARGETS = [
  { image: '/assets/images/targets/target-star.png', value: 10 },
  { image: '/assets/images/targets/target-trophy.png', value: 50 },
  { image: '/assets/images/targets/target-gem.png', value: 30 },
  { image: '/assets/images/targets/target-coin.png', value: 20 },
]

const BAD_TARGETS = [
  { image: '/assets/images/targets/target-bug.png', value: -20 },
  { image: '/assets/images/targets/target-virus.png', value: -20 },
  { image: '/assets/images/targets/target-bomb.png', value: -20 },
]

export default function ReflexArenaPage() {
  const router = useRouter()
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [username, setUsername] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [combo, setCombo] = useState(0)
  const [targets, setTargets] = useState<Target[]>([])
  const [nextId, setNextId] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

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

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver) return

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

  // Spawn targets
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawnInterval = setInterval(() => {
      const isGood = Math.random() > 0.25 // More good targets
      const targetList = isGood ? GOOD_TARGETS : BAD_TARGETS
      const selected = targetList[Math.floor(Math.random() * targetList.length)]

      const newTarget: Target = {
        id: nextId,
        x: Math.random() * 80 + 10, // 10-90% of width
        y: Math.random() * 70 + 15, // 15-85% of height
        type: isGood ? 'good' : 'bad',
        image: selected.image,
        value: selected.value,
        spawnTime: Date.now()
      }

      setNextId(prev => prev + 1)
      setTargets(prev => [...prev, newTarget])

      // Remove target faster for more challenge
      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== newTarget.id))
      }, 1500) // Reduced from 2000ms to 1500ms
    }, 600) // Spawn faster - reduced from 1000ms to 600ms

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameOver, nextId])

  const handleTargetClick = (target: Target) => {
    const reactionTime = Date.now() - target.spawnTime
    let points = target.value

    if (target.type === 'good') {
      playSound('/assets/sounds/sfx/pop.mp3', 0.4)
      // Time bonus
      if (reactionTime < 300) points *= 2

      // Combo multiplier
      const newCombo = combo + 1
      setCombo(newCombo)
      const comboMultiplier = Math.min(newCombo, 5)
      points *= comboMultiplier
    } else {
      playSound('/assets/sounds/sfx/error.mp3', 0.5)
      setCombo(0)
    }

    setScore(prev => prev + points)
    setTargets(prev => prev.filter(t => t.id !== target.id))
  }

  const handleStart = () => {
    if (username.trim()) {
      setGameStarted(true)
      setGameOver(false)
      setScore(0)
      setTimeLeft(60)
      setCombo(0)
      setTargets([])
    }
  }

  const handleSaveScore = async () => {
    if (!username || isSaving) return
    setIsSaving(true)

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          gameType: 'REFLEX_ARENA',
          score
        })
      })
      // Success animation then redirect
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Failed to save score:', error)
      alert('Failed to save score')
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-tech.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]" />

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            ⚡ REFLEX ARENA
          </h1>
          <p className="text-2xl text-white/90">
            Click targets as fast as you can!
          </p>
        </div>

        {!gameStarted && !gameOver && (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-white/30 max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Enter Your Name</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full px-6 py-4 rounded-full text-2xl text-center mb-6 border-2 border-white/50 bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/50"
              maxLength={20}
            />
            <button
              onClick={handleStart}
              disabled={!username.trim()}
              className="bg-white text-orange-600 font-bold py-4 px-12 rounded-full text-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START GAME
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div>
            <div className="flex justify-between items-center mb-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="text-2xl font-bold text-white">Score: {score}</div>
              <div className="text-2xl font-bold text-yellow-300">Combo: {combo}x</div>
              <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-300' : 'text-white'}`}>
                Time: {timeLeft}s
              </div>
            </div>

            <div className="relative bg-blue-900 rounded-3xl h-[600px] overflow-hidden border-4 border-white/30">
              <AnimatePresence>
                {targets.map((target) => (
                  <motion.div
                    key={target.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${target.x}%`,
                      top: `${target.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => handleTargetClick(target)}
                  >
                    <Image
                      src={target.image}
                      alt="Target"
                      width={80}
                      height={80}
                      className="hover:scale-110 transition-transform"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-white/30 max-w-md mx-auto">
            <h2 className="text-4xl font-black text-white mb-4">GAME OVER!</h2>
            <p className="text-6xl font-black text-white mb-8">{score}</p>
            <div className="space-y-4">
              <motion.button
                onClick={handleSaveScore}
                disabled={isSaving}
                whileHover={!isSaving ? { scale: 1.05 } : {}}
                whileTap={!isSaving ? { scale: 0.95 } : {}}
                animate={isSaving ? { 
                  backgroundColor: ["#ffffff", "#f97316", "#ffffff"],
                  transition: { repeat: Infinity, duration: 1.5 }
                } : {}}
                className="w-full bg-white text-orange-600 font-bold py-4 px-8 rounded-full text-xl flex items-center justify-center gap-3 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  'Save Score'
                )}
              </motion.button>
              <Link href="/">
                <button 
                  disabled={isSaving}
                  className="w-full bg-white/30 text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-white/40 transition-colors disabled:opacity-50"
                >
                  Back to Menu
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
