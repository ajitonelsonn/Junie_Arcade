'use client'

import { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'

type MusicTrack = 'menu' | 'game' | 'victory' | null

interface MusicContextType {
  playMenuMusic: () => void
  playGameMusic: () => void
  playVictoryMusic: () => void
  stopAllMusic: () => void
  stopMenuMusic: () => void
  pauseMenuMusic: () => void
  resumeMenuMusic: () => void
  currentTrack: MusicTrack
}

const MusicContext = createContext<MusicContextType>({
  playMenuMusic: () => {},
  playGameMusic: () => {},
  playVictoryMusic: () => {},
  stopAllMusic: () => {},
  stopMenuMusic: () => {},
  pauseMenuMusic: () => {},
  resumeMenuMusic: () => {},
  currentTrack: null
})

export function MusicProvider({ children }: { children: ReactNode }) {
  const menuMusicRef = useRef<HTMLAudioElement | null>(null)
  const gameMusicRef = useRef<HTMLAudioElement | null>(null)
  const victoryMusicRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const interactionHandledRef = useRef(false)
  const pathname = usePathname()

  // Initialize all audio elements
  const initializeAudio = () => {
    if (!isInitialized) {
      // Menu music
      const menuMusic = new Audio()
      menuMusic.preload = 'none'
      menuMusic.loop = true
      menuMusic.volume = 0.3
      menuMusic.src = '/assets/sounds/music/music-menu.mp3'
      menuMusicRef.current = menuMusic

      // Game music
      const gameMusic = new Audio()
      gameMusic.preload = 'none'
      gameMusic.loop = true
      gameMusic.volume = 0.4
      gameMusic.src = '/assets/sounds/music/music-game.mp3'
      gameMusicRef.current = gameMusic

      // Victory music
      const victoryMusic = new Audio()
      victoryMusic.preload = 'none'
      victoryMusic.loop = false
      victoryMusic.volume = 0.4
      victoryMusic.src = '/assets/sounds/music/music-victory.mp3'
      victoryMusicRef.current = victoryMusic

      setIsInitialized(true)
    }
  }

  // Stop all music tracks
  const stopAllMusic = () => {
    [menuMusicRef, gameMusicRef, victoryMusicRef].forEach(ref => {
      if (ref.current) {
        ref.current.pause()
        ref.current.currentTime = 0
      }
    })
    setCurrentTrack(null)
  }

  // Play menu music
  const playMenuMusic = () => {
    if (!isInitialized) {
      initializeAudio()
      // Wait a tick for initialization
      setTimeout(() => playMenuMusic(), 0)
      return
    }

    // Stop only non-menu tracks
    if (gameMusicRef.current) {
      gameMusicRef.current.pause()
      gameMusicRef.current.currentTime = 0
    }
    if (victoryMusicRef.current) {
      victoryMusicRef.current.pause()
      victoryMusicRef.current.currentTime = 0
    }

    if (menuMusicRef.current && menuMusicRef.current.paused) {
      const playPromise = menuMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setCurrentTrack('menu')
          })
          .catch(() => {
            // Silently handle autoplay blocking - will retry on user interaction
          })
      }
    }
  }

  // Play game music
  const playGameMusic = () => {
    if (!isInitialized) {
      initializeAudio()
      setTimeout(() => playGameMusic(), 0)
      return
    }

    // Stop only non-game tracks
    if (menuMusicRef.current) {
      menuMusicRef.current.pause()
      menuMusicRef.current.currentTime = 0
    }
    if (victoryMusicRef.current) {
      victoryMusicRef.current.pause()
      victoryMusicRef.current.currentTime = 0
    }

    if (gameMusicRef.current && gameMusicRef.current.paused) {
      const playPromise = gameMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setCurrentTrack('game')
          })
          .catch(() => {
            // Silently handle play errors
          })
      }
    }
  }

  // Play victory music
  const playVictoryMusic = () => {
    if (!isInitialized) {
      initializeAudio()
      setTimeout(() => playVictoryMusic(), 0)
      return
    }

    // Stop only non-victory tracks
    if (menuMusicRef.current) {
      menuMusicRef.current.pause()
      menuMusicRef.current.currentTime = 0
    }
    if (gameMusicRef.current) {
      gameMusicRef.current.pause()
      gameMusicRef.current.currentTime = 0
    }

    if (victoryMusicRef.current && victoryMusicRef.current.paused) {
      const playPromise = victoryMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setCurrentTrack('victory')
          })
          .catch(() => {
            // Silently handle play errors
          })
      }

      victoryMusicRef.current.onended = () => {
        playMenuMusic()
      }
    }
  }

  const stopMenuMusic = () => {
    if (menuMusicRef.current && !menuMusicRef.current.paused) {
      menuMusicRef.current.pause()
      menuMusicRef.current.currentTime = 0
      setCurrentTrack(null)
    }
  }

  const pauseMenuMusic = () => {
    if (menuMusicRef.current && !menuMusicRef.current.paused) {
      menuMusicRef.current.pause()
    }
  }

  const resumeMenuMusic = () => {
    if (menuMusicRef.current && menuMusicRef.current.paused) {
      const playPromise = menuMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setCurrentTrack('menu'))
          .catch(() => {
            // Silently handle play errors
          })
      }
    }
  }

  useEffect(() => {
    const menuPages = ['/', '/gallery', '/leaderboard']
    const shouldPlayMenuMusic = menuPages.some(page => pathname === page)

    if (shouldPlayMenuMusic) {
      // Initialize audio immediately
      if (!isInitialized) {
        initializeAudio()
        return
      }

      // Play menu music when on menu pages
      // This includes: first visit, returning from game, or when no music is playing
      if (currentTrack === null || currentTrack !== 'menu') {
        // Try to play immediately
        playMenuMusic()
      }
    }
  }, [pathname, currentTrack, isInitialized])

  useEffect(() => {
    return () => {
      stopAllMusic()
      if (menuMusicRef.current) menuMusicRef.current.src = ''
      if (gameMusicRef.current) gameMusicRef.current.src = ''
      if (victoryMusicRef.current) victoryMusicRef.current.src = ''
    }
  }, [])

  return (
    <MusicContext.Provider value={{
      playMenuMusic,
      playGameMusic,
      playVictoryMusic,
      stopAllMusic,
      stopMenuMusic,
      pauseMenuMusic,
      resumeMenuMusic,
      currentTrack
    }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}
