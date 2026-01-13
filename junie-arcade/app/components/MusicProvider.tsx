'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface MusicContextType {
  pauseMenuMusic: () => void
  resumeMenuMusic: () => void
}

const MusicContext = createContext<MusicContextType>({
  pauseMenuMusic: () => {},
  resumeMenuMusic: () => {}
})

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isInitializedRef = useRef(false)
  const pathname = usePathname()

  useEffect(() => {
    // Only initialize once globally
    if (!isInitializedRef.current) {
      isInitializedRef.current = true

      const menuMusic = new Audio('/assets/sounds/music/music-menu.mp3')
      menuMusic.loop = true
      menuMusic.volume = 0.3
      audioRef.current = menuMusic
    }
  }, [])

  const pauseMenuMusic = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }

  const resumeMenuMusic = () => {
    if (audioRef.current && audioRef.current.paused) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log('Error resuming menu music')
        })
      }
    }
  }

  useEffect(() => {
    if (!audioRef.current) return

    // Define pages where music should play automatically
    // Includes main pages AND game pages (before game starts)
    const musicPages = ['/', '/gallery', '/leaderboard', '/games/reflex', '/games/jump', '/games/memory']
    const shouldPlayMusic = musicPages.some(page => pathname.startsWith(page))

    const playAttempt = () => {
      if (audioRef.current && audioRef.current.paused) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Menu music playing')
            })
            .catch(() => {
              console.log('Autoplay blocked, waiting for user interaction')
            })
        }
      }
    }

    const stopMusic = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }

    if (shouldPlayMusic) {
      // Play music on main pages and game entry pages
      playAttempt()

      // Fallback for autoplay policy
      const handleInteraction = () => {
        playAttempt()
        window.removeEventListener('click', handleInteraction)
        window.removeEventListener('keydown', handleInteraction)
      }

      window.addEventListener('click', handleInteraction)
      window.addEventListener('keydown', handleInteraction)

      return () => {
        window.removeEventListener('click', handleInteraction)
        window.removeEventListener('keydown', handleInteraction)
      }
    } else {
      // Stop music on other pages
      stopMusic()
    }
  }, [pathname])

  // Cleanup only when the entire app unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  return (
    <MusicContext.Provider value={{ pauseMenuMusic, resumeMenuMusic }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}
