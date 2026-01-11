'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import JumpMasterScene from '@/app/lib/phaser/JumpMasterScene'

const PhaserGame = dynamic(() => import('@/app/components/PhaserGame'), {
  ssr: false
})

export default function JumpMasterPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [finalScore, setFinalScore] = useState<{ score: number; distance: number } | null>(null)
  const [username, setUsername] = useState('')

  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    scene: JumpMasterScene,
    callbacks: {
      postBoot: (game) => {
        game.scene.start('JumpMasterScene', {
          onGameEnd: handleGameEnd
        })
      }
    }
  }

  const handleGameEnd = (score: number, distance: number) => {
    setFinalScore({ score, distance })
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
          gameType: 'JUMP_MASTER',
          score: finalScore.score,
          distance: finalScore.distance
        })
      })
      alert('Score saved!')
    } catch (error) {
      console.error('Failed to save score:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-cyan-500 to-blue-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            🚀 JUMP MASTER
          </h1>
          <p className="text-2xl text-white/90">
            Endless runner! Jump over obstacles.
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
              className="bg-white text-cyan-600 font-bold py-4 px-12 rounded-full text-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-5xl font-black text-white mb-2">{finalScore.score}</p>
            <p className="text-2xl text-white/90 mb-8">Distance: {finalScore.distance}m</p>
            <div className="space-y-4">
              <button
                onClick={handleSaveScore}
                className="w-full bg-white text-cyan-600 font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform"
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
