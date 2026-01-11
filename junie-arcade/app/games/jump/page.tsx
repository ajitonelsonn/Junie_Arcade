'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const PhaserGame = dynamic(() => import('@/app/components/PhaserGame'), { ssr: false })

export default function JumpMasterPage() {
  const router = useRouter()
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [username, setUsername] = useState('')
  const [score, setScore] = useState(0)
  const [distance, setDistance] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [JumpMasterScene, setJumpMasterScene] = useState<any>(null)

  useEffect(() => {
    import('@/app/lib/phaser/JumpMasterScene').then((mod) => {
      setJumpMasterScene(() => mod.default)
    })
  }, [])

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
    if (username.trim()) {
      setGameStarted(true)
      setGameOver(false)
      setScore(0)
      setDistance(0)
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
          gameType: 'JUMP_MASTER',
          score,
          distance
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
      <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-space.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            🚀 JUMP MASTER
          </h1>
          <p className="text-2xl text-white/90">
            Endless runner! Jump over obstacles.
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
              className="bg-white text-cyan-600 font-bold py-4 px-12 rounded-full text-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START GAME
            </button>
          </div>
        )}

        {gameStarted && !gameOver && JumpMasterScene && (
          <div className="flex flex-col items-center">
            <div id="phaser-game-container" className="rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl">
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
            <div className="text-center mt-6 text-white text-xl font-bold bg-black/20 px-8 py-3 rounded-full backdrop-blur-sm">
              Press SPACE or CLICK to Jump!
            </div>
          </div>
        )}

        {gameOver && (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-white/30 max-w-md mx-auto">
            <h2 className="text-4xl font-black text-white mb-4">GAME OVER!</h2>
            <p className="text-5xl font-black text-white mb-2">{score}</p>
            <p className="text-2xl text-white/90 mb-8">Distance: {distance}m</p>
            <div className="space-y-4">
              <motion.button
                onClick={handleSaveScore}
                disabled={isSaving}
                whileHover={!isSaving ? { scale: 1.05 } : {}}
                whileTap={!isSaving ? { scale: 0.95 } : {}}
                animate={isSaving ? { 
                  backgroundColor: ["#ffffff", "#22c55e", "#ffffff"],
                  transition: { repeat: Infinity, duration: 1.5 }
                } : {}}
                className="w-full bg-white text-cyan-600 font-bold py-4 px-8 rounded-full text-xl flex items-center justify-center gap-3 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block w-6 h-6 border-4 border-cyan-600 border-t-transparent rounded-full"
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
