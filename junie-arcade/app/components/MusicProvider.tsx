'use client'

import { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'

type MusicTrack = 'menu' | 'game' | 'victory' | null

interface MusicContextType {
  playMenuMusic: () => void
  playGameMusic: () => void
  playVictoryMusic: () => void
  stopAllMusic: () => void
  pauseMenuMusic: () => void
  resumeMenuMusic: () => void
  currentTrack: MusicTrack
}

const MusicContext = createContext<MusicContextType>({
  playMenuMusic: () => {},
  playGameMusic: () => {},
  playVictoryMusic: () => {},
  stopAllMusic: () => {},
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
  const pathname = usePathname()

  // Initialize all audio elements
  const initializeAudio = () => {
    if (!isInitialized) {
      // Menu music
      const menuMusic = new Audio()
      menuMusic.loop = true
      menuMusic.volume = 0.3
      menuMusic.src = '/assets/sounds/music/music-menu.mp3'
      menuMusicRef.current = menuMusic

      // Game music
      const gameMusic = new Audio()
      gameMusic.loop = true
      gameMusic.volume = 0.4
      gameMusic.src = '/assets/sounds/music/music-game.mp3'
      gameMusicRef.current = gameMusic

      // Victory music
      const victoryMusic = new Audio()
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
    }

    stopAllMusic()

    if (menuMusicRef.current) {
      const playPromise = menuMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setCurrentTrack('menu')
            console.log('Menu music playing')
          })
          .catch((e) => console.log('Menu music autoplay blocked:', e))
      }
    }
  }

  // Play game music
  const playGameMusic = () => {
    if (!isInitialized) {
      initializeAudio()
    }

    stopAllMusic()

    if (gameMusicRef.current) {
      const playPromise = gameMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setCurrentTrack('game')
            console.log('Game music playing')
          })
          .catch((e) => console.log('Game music error:', e))
      }
    }
  }

  // Play victory music
  const playVictoryMusic = () => {
    if (!isInitialized) {
      initializeAudio()
    }

    stopAllMusic()

    if (victoryMusicRef.current) {
      const playPromise = victoryMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setCurrentTrack('victory')
            console.log('Victory music playing')
          })
          .catch((e) => console.log('Victory music error:', e))
      }

      victoryMusicRef.current.onended = () => {
        playMenuMusic()
      }
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
          .catch((e) => console.log('Error resuming menu music:', e))
      }
    }
  }

  useEffect(() => {
    const menuPages = ['/', '/gallery', '/leaderboard', '/games/reflex', '/games/jump', '/games/memory']
    const shouldPlayMenuMusic = menuPages.some(page => pathname.startsWith(page))

    if (shouldPlayMenuMusic && currentTrack === null) {
      const handleInteraction = () => {
        if (!isInitialized) {
          initializeAudio()
        }
        if (currentTrack === null) {
          playMenuMusic()
        }
        window.removeEventListener('click', handleInteraction)
        window.removeEventListener('keydown', handleInteraction)
      }

      window.addEventListener('click', handleInteraction, { once: true })
      window.addEventListener('keydown', handleInteraction, { once: true })

      return () => {
        window.removeEventListener('click', handleInteraction)
        window.removeEventListener('keydown', handleInteraction)
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
