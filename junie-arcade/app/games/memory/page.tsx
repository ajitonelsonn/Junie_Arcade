'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [gameStarted, setGameStarted] = useState(false)
  const [username, setUsername] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [gameOver, setGameOver] = useState(false)
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
    playSound('/assets/sounds/sfx/click.mp3', 0.4)

    if (newFlipped.length === 2) {
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
    if (!username || isSaving) return
    setIsSaving(true)

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
      // Success animation then redirect
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Failed to save score:', error)
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-arena.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-[2px]" />

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
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
              <motion.button
                onClick={handleSaveScore}
                disabled={isSaving}
                whileHover={!isSaving ? { scale: 1.05 } : {}}
                whileTap={!isSaving ? { scale: 0.95 } : {}}
                animate={isSaving ? { 
                  backgroundColor: ["#ffffff", "#ec4899", "#ffffff"],
                  transition: { repeat: Infinity, duration: 1.5 }
                } : {}}
                className="w-full bg-white text-pink-600 font-bold py-4 px-8 rounded-full text-xl flex items-center justify-center gap-3 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block w-6 h-6 border-4 border-pink-600 border-t-transparent rounded-full"
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
