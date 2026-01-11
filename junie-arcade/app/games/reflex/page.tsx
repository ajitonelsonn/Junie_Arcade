'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import ReflexArenaScene from '@/app/lib/phaser/ReflexArenaScene'

const PhaserGame = dynamic(() => import('@/app/components/PhaserGame'), {
  ssr: false
})

export default function ReflexArenaPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [username, setUsername] = useState('')

  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1e40af',
    scene: ReflexArenaScene,
    callbacks: {
      postBoot: (game) => {
        game.scene.start('ReflexArenaScene', {
          onGameEnd: handleGameEnd
        })
      }
    }
  }

  const handleGameEnd = (score: number) => {
    setFinalScore(score)
    setGameStarted(false)
  }

  const handleStart = () => {
    if (username.trim()) {
      setGameStarted(true)
      setFinalScore(null)
    }
  }

  const handleSaveScore = async () => {
    if (!finalScore || !username) return

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          gameType: 'REFLEX_ARENA',
          score: finalScore
        })
      })
      alert('Score saved!')
    } catch (error) {
      console.error('Failed to save score:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            ⚡ REFLEX ARENA
          </h1>
          <p className="text-2xl text-white/90">
            Click targets as fast as you can!
          </p>
        </div>

        {!gameStarted && !finalScore && (
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

        {gameStarted && (
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 border-2 border-white/30">
              <PhaserGame config={gameConfig} className="rounded-2xl overflow-hidden shadow-2xl" />
            </div>
          </div>
        )}

        {finalScore !== null && (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-white/30 max-w-md mx-auto">
            <h2 className="text-4xl font-black text-white mb-4">GAME OVER!</h2>
            <p className="text-6xl font-black text-white mb-8">{finalScore}</p>
            <div className="space-y-4">
              <button
                onClick={handleSaveScore}
                className="w-full bg-white text-orange-600 font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform"
              >
                Save Score
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white/30 text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-white/40 transition-colors"
              >
                Play Again
              </button>
              <Link href="/">
                <button className="w-full bg-white/30 text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-white/40 transition-colors">
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
