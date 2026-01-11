'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
  const [gameStarted, setGameStarted] = useState(false)
  const [username, setUsername] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver])

  useEffect(() => {
    if (matchedPairs === 8) {
      setGameOver(true)
      const timeBonus = timeLeft * 10
      setScore((prev) => prev + timeBonus + 200)
    }
  }, [matchedPairs, timeLeft])

  const initializeGame = () => {
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

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped

      if (cards[first].imageUrl === cards[second].imageUrl) {
        // Match found
        setTimeout(() => {
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
          setFlippedIndices([])
        }, 1000)
      }
    }
  }

  const handleSaveScore = async () => {
    if (!username) return

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          gameType: 'MEMORY_MATCH',
          score,
          time: 120 - timeLeft
        })
      })
      alert('Score saved!')
    } catch (error) {
      console.error('Failed to save score:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            🧠 MEMORY MATCH
          </h1>
          <p className="text-2xl text-white/90">
            Find all the pairs!
          </p>
        </div>

        {!gameStarted && (
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
              onClick={initializeGame}
              disabled={!username.trim()}
              className="bg-white text-pink-600 font-bold py-4 px-12 rounded-full text-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START GAME
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div>
            <div className="flex justify-between items-center mb-8 bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
              <div className="text-3xl font-bold text-white">
                Score: {score}
              </div>
              <div className="text-3xl font-bold text-white">
                Pairs: {matchedPairs}/8
              </div>
              <div className={`text-3xl font-bold ${timeLeft < 20 ? 'text-red-300' : 'text-white'}`}>
                Time: {timeLeft}s
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-[3/4] cursor-pointer"
                  onClick={() => handleCardClick(index)}
                >
                  <div className="relative w-full h-full">
                    {(flippedIndices.includes(index) || card.matched) ? (
                      <Image
                        src={card.imageUrl}
                        alt="Card"
                        fill
                        className="object-cover rounded-xl border-4 border-white shadow-xl"
                      />
                    ) : (
                      <Image
                        src="/assets/images/cards/card-back.png"
                        alt="Card back"
                        fill
                        className="object-cover rounded-xl border-4 border-white shadow-xl"
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-white/30 max-w-md mx-auto">
            <h2 className="text-4xl font-black text-white mb-4">
              {matchedPairs === 8 ? 'PERFECT!' : 'TIME UP!'}
            </h2>
            <p className="text-6xl font-black text-white mb-4">{score}</p>
            <p className="text-2xl text-white/90 mb-8">
              Pairs: {matchedPairs}/8
            </p>
            <div className="space-y-4">
              <button
                onClick={handleSaveScore}
                className="w-full bg-white text-pink-600 font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform"
              >
                Save Score
              </button>
              <button
                onClick={initializeGame}
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
