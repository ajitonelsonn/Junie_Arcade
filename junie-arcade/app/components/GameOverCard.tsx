'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import FlagIcon from './FlagIcon'

interface GameOverCardProps {
  username: string
  country: string
  score: number
  gameType: 'REFLEX_ARENA' | 'JUMP_MASTER' | 'MEMORY_MATCH' | 'OVERALL'
  stats: {
    label: string
    value: string | number
    color?: string
  }[]
  onSaveScore: () => void
  isSaving: boolean
}

export default function GameOverCard({
  username,
  country,
  score,
  gameType,
  stats,
  onSaveScore,
  isSaving
}: GameOverCardProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [selfieData, setSelfieData] = useState<string | null>(null)
  const [tempSelfie, setTempSelfie] = useState<string | null>(null)
  const [countries, setCountries] = useState<Array<{ name: string; flag: string; code: string }>>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [hasAutoSaved, setHasAutoSaved] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null)
  const [showExitModal, setShowExitModal] = useState(false)
  const [playerRank, setPlayerRank] = useState<number | null>(null)
  const [allRanks, setAllRanks] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [selectedJunie, setSelectedJunie] = useState<string>('')
  const [selectedHero, setSelectedHero] = useState<string>('')
  const [junieIndex, setJunieIndex] = useState(0)
  const [heroIndex, setHeroIndex] = useState(0)

  // Pre-load html-to-image for faster first save/download
  useEffect(() => {
    import('html-to-image').then(() => {
      console.log('html-to-image pre-loaded')
    })
  }, [])

  const junies = [
    'junie-happy.png', 'junie-jump.png', 'junie-run-1.png', 'junie-run-3.png',
    'junie-idle.png', 'junie-run-2.png', 'junie-sad.png'
  ]

  const heroes = [
    'Ezreal_Render.webp', 'Jett_Artwork_Full.webp', 'Jinx_Render.webp', 
    'Lux_Render.webp', 'Phoenix_Artwork_Full.webp', 'Reyna_Artwork_Full.webp', 
    'Sage_Artwork_Full.webp', 'Yasuo_Render.webp'
  ]

  useEffect(() => {
    // Selection that is unique for this specific game over instance
    const initialJunieIdx = Math.floor(Math.random() * junies.length)
    const initialHeroIdx = Math.floor(Math.random() * heroes.length)
    
    setJunieIndex(initialJunieIdx)
    setHeroIndex(initialHeroIdx)
    setSelectedJunie(junies[initialJunieIdx])
    setSelectedHero(heroes[initialHeroIdx])
  }, [])

  useEffect(() => {
    // Auto-save score to database when game is over
    if (!hasAutoSaved) {
      onSaveScore()
      setHasAutoSaved(true)
    }
  }, [hasAutoSaved, onSaveScore])

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

    // Fetch all rankings for the current player
    const fetchRankings = async () => {
      const playerId = localStorage.getItem('junie_player_id')
      if (playerId) {
        try {
          // Use a timestamp to prevent cached responses
          const response = await fetch(`/api/leaderboard?view=overall&playerId=${playerId}&t=${Date.now()}`)
          const data = await response.json()
          if (data.currentPlayer) {
            setAllRanks({
              overall: data.currentPlayer.rank || (data.leaderboard && data.leaderboard.findIndex((p: any) => p.playerId === playerId) + 1),
              reflex: data.currentPlayer.reflexScore > 0 ? (data.currentPlayer.reflexRank || 1) : null,
              jump: data.currentPlayer.jumpScore > 0 ? (data.currentPlayer.jumpRank || 1) : null,
              memory: data.currentPlayer.memoryScore > 0 ? (data.currentPlayer.memoryRank || 1) : null
            })
          }
        } catch (error) {
          console.error('Failed to fetch rankings:', error)
        }
      }
    }
    fetchRankings()
  }, [hasAutoSaved])

  // Auto-start camera with 5-second countdown when game over card appears
  useEffect(() => {
    // Small delay to allow initial animations to settle
    const timer = setTimeout(() => {
      setCountdown(5)

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval)
            // Auto-start camera when countdown reaches 0
            startCamera()
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const getCountryCode = () => {
    // If country is already a 2-character code, return it
    if (country && country.length === 2) return country.toUpperCase()
    const countryData = countries.find(c => c.name === country)
    return countryData?.code || 'US'
  }

  const getGameLogo = () => {
    switch (gameType) {
      case 'REFLEX_ARENA': return '/assets/images/logos/game_logo/reflex_arena.png'
      case 'JUMP_MASTER': return '/assets/images/logos/game_logo/jump_master.png'
      case 'MEMORY_MATCH': return '/assets/images/logos/game_logo/memory_match.png'
      case 'OVERALL': return '/assets/images/logos/junie-logo.png'
      default: return null
    }
  }

  const getGameTitle = () => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'Reflex Arena'
      case 'JUMP_MASTER': return 'Jump Master'
      case 'MEMORY_MATCH': return 'Memory Match'
      case 'OVERALL': return 'Ultimate Champion'
      default: return 'Game'
    }
  }

  const getGameColor = () => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'from-[#ff4655] to-[#ff4655]/80' // Valorant Red
      case 'JUMP_MASTER': return 'from-[#00eeff] to-[#00eeff]/80' // Cyber Cyan
      case 'MEMORY_MATCH': return 'from-[#c284f9] to-[#c284f9]/80' // LoL Magic Purple
      case 'OVERALL': return 'from-emerald-400 to-cyan-500'
      default: return 'from-slate-500 to-gray-500'
    }
  }

  const getGameGlow = () => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'shadow-[#ff4655]/20'
      case 'JUMP_MASTER': return 'shadow-[#00eeff]/20'
      case 'MEMORY_MATCH': return 'shadow-[#c284f9]/20'
      case 'OVERALL': return 'shadow-emerald-500/20'
      default: return 'shadow-white/10'
    }
  }

  const getAccentColor = () => {
    switch (gameType) {
      case 'REFLEX_ARENA': return 'text-[#ff4655]'
      case 'JUMP_MASTER': return 'text-[#00eeff]'
      case 'MEMORY_MATCH': return 'text-[#c284f9]'
      case 'OVERALL': return 'text-emerald-400'
      default: return 'text-white'
    }
  }

  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: isMobile ? 720 : 1080 },
          height: { ideal: isMobile ? 1280 : 1350 },
          aspectRatio: { ideal: 0.8 } // 4:5 ratio
        }
      })
      streamRef.current = stream
      setShowCamera(true)

      // Wait a bit for React to render the video element
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current
          videoRef.current.play().catch((err) => {
            console.error('Error playing video:', err)
            alert('Unable to start camera preview.')
          })
        }
      }, 200)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const takeSelfie = () => {
    setCaptureCountdown(5)

    const countdownInterval = setInterval(() => {
      setCaptureCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          // Take the photo
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const video = videoRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(video, 0, 0)
              const imageData = canvas.toDataURL('image/png')
              setTempSelfie(imageData)
            }
          }
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const confirmSelfie = () => {
    if (tempSelfie) {
      setSelfieData(tempSelfie)
      setTempSelfie(null)
      stopCamera()
    }
  }

  const retakeSelfie = () => {
    setTempSelfie(null)
    setCaptureCountdown(null)
    // Give React time to unmount the image and mount the video element
    setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch((err) => {
          console.error('Error resuming video:', err)
          // If playback fails, try to restart the camera completely
          startCamera()
        })
      } else {
        // If refs are missing, restart camera
        startCamera()
      }
    }, 100)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    setTempSelfie(null)
  }

  const saveCardToS3 = async () => {
    if (!cardRef.current) return
    setIsUploading(true)

    try {
      const { toJpeg } = await import('html-to-image')
      const dataUrl = await toJpeg(cardRef.current, {
        backgroundColor: '#0f1923',
        pixelRatio: 1.5,
        quality: 0.85,
        filter: (node) => {
          if (node instanceof HTMLElement && node.dataset.exportHide === 'true') {
            return false
          }
          return true
        },
      })

      const filename = `card-${username}-${score}-${Date.now()}.jpg`
      const response = await fetch('/api/upload-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: dataUrl, 
          filename,
          username,
          score,
          gameType,
          country,
          playerId: localStorage.getItem('junie_player_id')
        }),
      })

      const data = await response.json()
      if (data.url) {
        setUploadedUrl(data.url)
        console.log('Card uploaded successfully:', data.url)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Failed to upload card:', error)
      alert('Failed to save card to cloud. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadCard = async () => {
    if (!cardRef.current) {
      console.error('Card ref is not available')
      return
    }

    setIsDownloading(true)
    console.log('Starting download...')

    try {
      // Dynamically import html-to-image
      console.log('Importing html-to-image...')
      const { toPng } = await import('html-to-image')
      console.log('html-to-image loaded successfully')

      if (!cardRef.current) throw new Error('Card ref not found')

      // Capture the card as PNG using html-to-image
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#0f1923',
        pixelRatio: 1.5,
        filter: (node) => {
          // Hide elements with 'data-export-hide' attribute
          if (node instanceof HTMLElement && node.dataset.exportHide === 'true') {
            return false
          }
          return true
        },
        style: {
          // Ensure the card looks consistent during capture
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      })

      const link = document.createElement('a')
      const timestamp = new Date().getTime()
      link.download = `junie-arcade-${username}-${score}-${timestamp}.png`
      link.href = dataUrl
      link.click()

      console.log('Download triggered successfully via html-to-image')
      setIsDownloading(false)

    } catch (error) {
      console.error('html-to-image error, falling back to manual canvas:', error)
      
      try {
        // Fallback to manual high-quality canvas drawing
        console.log('Creating ultra-modern professional card design (Manual Fallback)...')
        
        // Create a premium, high-quality canvas (landscape format)
        const canvas = document.createElement('canvas')
        canvas.width = 1920
        canvas.height = 1080
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          throw new Error('Could not get canvas context')
        }

        // Helper function to draw rounded rectangle
        const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
          ctx.beginPath()
          ctx.moveTo(x + r, y)
          ctx.lineTo(x + w - r, y)
          ctx.quadraticCurveTo(x + w, y, x + w, y + r)
          ctx.lineTo(x + w, y + h - r)
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
          ctx.lineTo(x + r, y + h)
          ctx.quadraticCurveTo(x, y + h, x, y + h - r)
          ctx.lineTo(x, y + r)
          ctx.quadraticCurveTo(x, y, x + r, y)
          ctx.closePath()
        }

        // Get game colors
        const gameColors = {
          primary: gameType === 'REFLEX_ARENA' ? '#ff4655' : gameType === 'JUMP_MASTER' ? '#00eeff' : '#c284f9',
          secondary: '#ffffff',
          dark: '#0f1923'
        }

        // Premium dark background with noise texture
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        bgGradient.addColorStop(0, '#0a0f1e')
        bgGradient.addColorStop(0.5, '#111827')
        bgGradient.addColorStop(1, '#0a0f1e')
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Subtle grid pattern
        ctx.globalAlpha = 0.02
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        for (let i = 0; i < canvas.width; i += 50) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i, canvas.height)
          ctx.stroke()
        }
        for (let j = 0; j < canvas.height; j += 50) {
          ctx.beginPath()
          ctx.moveTo(0, j)
          ctx.lineTo(canvas.width, j)
          ctx.stroke()
        }
        ctx.globalAlpha = 1

        // Top accent gradient bar
        const topGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        topGradient.addColorStop(0, gameColors.primary)
        topGradient.addColorStop(0.5, gameColors.secondary)
        topGradient.addColorStop(1, gameColors.primary)
        ctx.fillStyle = topGradient
        ctx.fillRect(0, 0, canvas.width, 8)

        // Load and draw all images first
        const loadImage = (src: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = document.createElement('img')
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = src
          })
        }

        // Draw everything - inspired by Valorant/League of Legends
        const drawComplete = async () => {
          // Hero background (subtle, large)
          if (selectedHero) {
            try {
              const heroImg = await loadImage(`/assets/images/hero/${selectedHero}`)
              const heroHeight = canvas.height * 0.9
              const heroWidth = (heroImg.width / heroImg.height) * heroHeight
              ctx.globalAlpha = 0.12
              ctx.drawImage(heroImg, canvas.width - heroWidth + 100, (canvas.height - heroHeight) / 2, heroWidth, heroHeight)
              ctx.globalAlpha = 1
            } catch (err) {
              console.log('Hero image failed to load for fallback')
            }
          }

          // Small Mascot background (top left)
          if (selectedJunie) {
            try {
              const mascotImg = await loadImage(`/assets/images/junie/${selectedJunie}`)
              const mascotSize = 120
              ctx.globalAlpha = 0.15
              ctx.drawImage(mascotImg, 50, 150, mascotSize, mascotSize)
              ctx.globalAlpha = 1
            } catch (err) {
              console.log('Small mascot image failed to load for fallback')
            }
          }

          // Diagonal accent lines (Valorant style)
          ctx.globalAlpha = 0.1
          ctx.strokeStyle = gameColors.primary
          ctx.lineWidth = 3
          for (let i = -canvas.height; i < canvas.width; i += 80) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i + canvas.height, canvas.height)
            ctx.stroke()
          }
          ctx.globalAlpha = 1

          try {
            // Load all images including Junie mascot
            const [junieLogo, cloud9Logo, jetbrainsLogo, junieMascot] = await Promise.all([
              loadImage('/assets/images/logos/junie-logo.png'),
              loadImage('/assets/images/logos/cloud9-logo.png'),
              loadImage('/assets/images/logos/jetbrains-logo.png'),
              loadImage(`/assets/images/junie/${selectedJunie || 'junie-happy.png'}`)
            ]).catch(() => [null, null, null, null])

            // Top section with logos and branding
            if (junieLogo) {
              ctx.globalAlpha = 0.9
              ctx.drawImage(junieLogo, 30, 30, 90, 90)
              ctx.globalAlpha = 1
            }

            // Sponsor logos (top right)
            const logoY = 35
            if (jetbrainsLogo) {
              ctx.globalAlpha = 0.85
              ctx.drawImage(jetbrainsLogo, canvas.width - 110, logoY, 70, 70)
              ctx.globalAlpha = 1
            }
            if (cloud9Logo) {
              ctx.globalAlpha = 0.85
              ctx.drawImage(cloud9Logo, canvas.width - 200, logoY, 70, 70)
              ctx.globalAlpha = 1
            }

            // Add Junie mascot (happy) on the left side
            if (junieMascot) {
              const mascotSize = 350
              const mascotX = 30
              const mascotY = canvas.height / 2 - mascotSize / 2

              // Glow effect behind Junie
              ctx.shadowColor = gameColors.primary
              ctx.shadowBlur = 50
              ctx.globalAlpha = 0.9
              ctx.drawImage(junieMascot, mascotX, mascotY, mascotSize, mascotSize)
              ctx.shadowBlur = 0
              ctx.globalAlpha = 1
            }
          } catch (err) {
            console.log('Images failed to load, continuing')
          }

          // Main title section (League/Valorant style)
          const titleY = 140

          // Large "MISSION ACCOMPLISHED" text with glow
          ctx.textAlign = 'center'
          ctx.font = 'bold 90px system-ui, -apple-system, sans-serif'

          // Text shadow/glow effect
          ctx.shadowColor = gameColors.primary
          ctx.shadowBlur = 50
          ctx.fillStyle = '#ffffff'
          ctx.fillText('MISSION ACCOMPLISHED', canvas.width / 2, titleY)

          // Second layer for stronger glow
          ctx.shadowBlur = 30
          ctx.fillText('MISSION ACCOMPLISHED', canvas.width / 2, titleY)

          ctx.shadowBlur = 0

          // Accent line under VICTORY
          const lineY = titleY + 20
          ctx.strokeStyle = gameColors.primary
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(canvas.width / 2 - 200, lineY)
          ctx.lineTo(canvas.width / 2 + 200, lineY)
          ctx.stroke()

          // Game type badge
          ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
          ctx.fillStyle = gameColors.secondary
          ctx.fillText(getGameTitle().toUpperCase(), canvas.width / 2, lineY + 45)

          // Champion photo section with hexagon frame (Valorant style)
          let contentY = 260
          if (selfieData) {
            const selfieImg = document.createElement('img')
            selfieImg.src = selfieData
            await new Promise((resolve) => {
              selfieImg.onload = () => {
                const photoSize = 320
                const photoX = (canvas.width - photoSize) / 2

                // Hexagonal glow background
                ctx.shadowColor = gameColors.primary
                ctx.shadowBlur = 60
                ctx.globalAlpha = 0.3
                ctx.fillStyle = gameColors.primary
                ctx.beginPath()
                for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i
                  const x = photoX + photoSize / 2 + Math.cos(angle) * (photoSize / 2 + 20)
                  const y = contentY + photoSize / 2 + Math.sin(angle) * (photoSize / 2 + 20)
                  if (i === 0) ctx.moveTo(x, y)
                  else ctx.lineTo(x, y)
                }
                ctx.closePath()
                ctx.fill()
                ctx.globalAlpha = 1
                ctx.shadowBlur = 0

                // Circular photo with enhanced border
                ctx.save()
                ctx.beginPath()
                ctx.arc(photoX + photoSize / 2, contentY + photoSize / 2, photoSize / 2, 0, Math.PI * 2)
                ctx.closePath()
                ctx.clip()
                ctx.drawImage(selfieImg, photoX, contentY, photoSize, photoSize)
                ctx.restore()

                // Double border ring effect
                ctx.strokeStyle = gameColors.primary
                ctx.lineWidth = 5
                ctx.beginPath()
                ctx.arc(photoX + photoSize / 2, contentY + photoSize / 2, photoSize / 2 + 3, 0, Math.PI * 2)
                ctx.stroke()

                ctx.strokeStyle = gameColors.secondary
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.arc(photoX + photoSize / 2, contentY + photoSize / 2, photoSize / 2 + 12, 0, Math.PI * 2)
                ctx.stroke()

                // Corner accent marks (Valorant style)
                const corners = [
                  { x: photoX - 20, y: contentY - 20 },
                  { x: photoX + photoSize + 20, y: contentY - 20 },
                  { x: photoX - 20, y: contentY + photoSize + 20 },
                  { x: photoX + photoSize + 20, y: contentY + photoSize + 20 }
                ]
                ctx.strokeStyle = gameColors.primary
                ctx.lineWidth = 3
                corners.forEach((corner, idx) => {
                  const size = 25
                  ctx.beginPath()
                  if (idx === 0) { // Top-left
                    ctx.moveTo(corner.x, corner.y + size)
                    ctx.lineTo(corner.x, corner.y)
                    ctx.lineTo(corner.x + size, corner.y)
                  } else if (idx === 1) { // Top-right
                    ctx.moveTo(corner.x - size, corner.y)
                    ctx.lineTo(corner.x, corner.y)
                    ctx.lineTo(corner.x, corner.y + size)
                  } else if (idx === 2) { // Bottom-left
                    ctx.moveTo(corner.x, corner.y - size)
                    ctx.lineTo(corner.x, corner.y)
                    ctx.lineTo(corner.x + size, corner.y)
                  } else { // Bottom-right
                    ctx.moveTo(corner.x - size, corner.y)
                    ctx.lineTo(corner.x, corner.y)
                    ctx.lineTo(corner.x, corner.y - size)
                  }
                  ctx.stroke()
                })

                contentY += photoSize + 50
                resolve(true)
              }
              selfieImg.onerror = () => resolve(false)
            })
          }

          // Player info panel (League style)
          const infoY = contentY

          // Player name card
          const nameCardHeight = 140
          roundRect(50, infoY, canvas.width - 100, nameCardHeight, 15)
          ctx.fillStyle = 'rgba(17, 24, 39, 0.85)'
          ctx.fill()
          ctx.strokeStyle = gameColors.primary
          ctx.lineWidth = 2
          ctx.stroke()

          // "CHAMPION" label
          ctx.fillStyle = gameColors.primary
          ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('CHAMPION', canvas.width / 2, infoY + 35)

          // Player name with flag (larger)
          const flagEmoji = '' // getCountryFlag() || ''
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 52px system-ui, -apple-system, sans-serif'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
          ctx.shadowBlur = 15
          ctx.fillText(`${username}`, canvas.width / 2, infoY + 80)
          ctx.shadowBlur = 0

          // Country
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
          ctx.font = '22px system-ui, -apple-system, sans-serif'
          ctx.fillText(country, canvas.width / 2, infoY + 115)

          // Massive score display (Valorant style)
          const scoreY = infoY + 170

          // Draw Ranks if available
          if (allRanks) {
            const rankY = scoreY - 40
            const rankWidth = (canvas.width - 160) / 4
            const rankHeight = 100
            
            const ranks = [
              { label: 'OVERALL', val: allRanks.overall, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
              { label: 'REFLEX', val: allRanks.reflex, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
              { label: 'JUMP', val: allRanks.jump, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
              { label: 'MEMORY', val: allRanks.memory, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' }
            ]

            ranks.forEach((r, i) => {
              const rx = 80 + (i * (rankWidth + 20))
              
              // Rank Box
              roundRect(rx, rankY, rankWidth, rankHeight, 10)
              ctx.fillStyle = r.bg
              ctx.fill()
              ctx.strokeStyle = r.color
              ctx.lineWidth = 1
              ctx.globalAlpha = 0.3
              ctx.stroke()
              ctx.globalAlpha = 1

              // Rank Label
              ctx.fillStyle = r.color
              ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
              ctx.textAlign = 'center'
              ctx.fillText(r.label, rx + rankWidth/2, rankY + 35)

              // Rank Value
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 42px system-ui, -apple-system, sans-serif'
              ctx.fillText(`#${r.val || '--'}`, rx + rankWidth/2, rankY + 80)
            })
          }

          // Score background panel
          const adjustedScoreY = allRanks ? scoreY + 60 : scoreY
          roundRect(50, adjustedScoreY, canvas.width - 100, 220, 15)
          const scoreGradient = ctx.createLinearGradient(50, adjustedScoreY, canvas.width - 50, adjustedScoreY)
          scoreGradient.addColorStop(0, 'rgba(17, 24, 39, 0.95)')
          scoreGradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.95)')
          scoreGradient.addColorStop(1, 'rgba(17, 24, 39, 0.95)')
          ctx.fillStyle = scoreGradient
          ctx.fill()

          // Score accent border
          ctx.strokeStyle = gameColors.primary
          ctx.lineWidth = 3
          ctx.stroke()

          // Top accent line inside
          ctx.strokeStyle = gameColors.secondary
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(70, adjustedScoreY + 20)
          ctx.lineTo(canvas.width - 70, adjustedScoreY + 20)
          ctx.stroke()

          // "FINAL SCORE" label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
          ctx.fillText('FINAL SCORE', canvas.width / 2, adjustedScoreY + 55)

          // The actual score - HUGE
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 110px system-ui, -apple-system, sans-serif'
          ctx.shadowColor = gameColors.primary
          ctx.shadowBlur = 40
          ctx.fillText(score.toLocaleString(), canvas.width / 2, adjustedScoreY + 145)
          ctx.shadowBlur = 20
          ctx.fillText(score.toLocaleString(), canvas.width / 2, adjustedScoreY + 145)
          ctx.shadowBlur = 0

          // "POINTS" label
          ctx.fillStyle = gameColors.secondary
          ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
          ctx.fillText('POINTS', canvas.width / 2, adjustedScoreY + 185)

          // Stats section (compact Valorant style)
          const statsY = adjustedScoreY + 250
          const statsPadding = 40
          const statsWidth = canvas.width - (statsPadding * 2)
          const statBoxHeight = 90
          const statBoxMargin = 15

          stats.forEach((stat, index) => {
            const y = statsY + (index * (statBoxHeight + statBoxMargin))

            // Stat box
            roundRect(statsPadding, y, statsWidth, statBoxHeight, 10)
            ctx.fillStyle = 'rgba(30, 41, 59, 0.6)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.lineWidth = 1
            ctx.stroke()

            // Accent line on left
            ctx.fillStyle = gameColors.primary
            ctx.fillRect(statsPadding, y, 5, statBoxHeight)

            // Stat label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
            ctx.font = 'bold 15px system-ui, -apple-system, sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(stat.label.toUpperCase(), statsPadding + 25, y + 35)

            // Stat value
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 40px system-ui, -apple-system, sans-serif'
            const statText = String(stat.value)
            ctx.fillText(statText.length > 15 ? statText.substring(0, 13) + '...' : statText, statsPadding + 25, y + 70)
          })

          // QR Code and Logos (bottom right)
          const qrSize = 200
          const qrX = canvas.width - qrSize - 60
          const qrY = (allRanks ? statsY + 100 : statsY + 50)
          
          try {
            // Draw Secure Code (QR) background
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)
            
            const qrImg = await loadImage(qrCodeUrl)
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
            
            // "SECURE CODE" text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
            ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
            ctx.textAlign = 'right'
            ctx.fillText('SECURE CODE', canvas.width - 60, qrY - 25)
            
            // Note: Branding logos are displayed at the top of the card
          } catch (err) {
            console.log('QR/Branding failed to load for fallback')
          }

          // Footer section
          const footerY = canvas.height - 70

          // Separator line
          ctx.strokeStyle = gameColors.primary
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.moveTo(40, footerY)
          ctx.lineTo(canvas.width - 40, footerY)
          ctx.stroke()
          ctx.globalAlpha = 1

          // Footer text
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText("Generated with Junie's Arcade", canvas.width / 2, footerY + 30)

          ctx.font = '14px system-ui, -apple-system, sans-serif'
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          ctx.fillText(currentDate, canvas.width / 2, footerY + 52)
        }

        await drawComplete()
        console.log('Ultra-modern professional card created successfully')

        console.log('Canvas captured successfully, size:', canvas.width, 'x', canvas.height)

        // Convert to blob and download
        console.log('Converting to blob...')
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Failed to create blob')
            alert('Unable to create image. Please try again.')
            setIsDownloading(false)
            return
          }

          console.log('Blob created, size:', blob.size)
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          const timestamp = new Date().getTime()
          link.download = `junie-arcade-${username}-${score}-${timestamp}.png`
          link.href = url
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          console.log('Download triggered successfully')

          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(url)
            setIsDownloading(false)
            console.log('Download complete, cleaned up')
          }, 100)
        }, 'image/png')
      } catch (fallbackError) {
        console.error('Manual fallback failed:', fallbackError)
        setIsDownloading(false)
      }
    }
  }

  const shareUrl = uploadedUrl || (typeof window !== 'undefined' ? 'https://www.juniearcade.fun' : '')
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`

  const getNextGame = () => {
    // If allRanks is not loaded yet, we can't reliably show the continue button
    // But we want to avoid flicker, so we should probably show it based on local knowledge if possible
    if (!allRanks) return null;

    const gameStatus = [
      { name: 'Jump Master', path: '/games/jump', played: (allRanks.jump !== null && allRanks.jump !== undefined) },
      { name: 'Reflex Arena', path: '/games/reflex', played: (allRanks.reflex !== null && allRanks.reflex !== undefined) },
      { name: 'Memory Match', path: '/games/memory', played: (allRanks.memory !== null && allRanks.memory !== undefined) }
    ];

    // Force current game as played
    const currentGameIdx = gameStatus.findIndex(g => 
      (gameType === 'JUMP_MASTER' && g.path === '/games/jump') ||
      (gameType === 'REFLEX_ARENA' && g.path === '/games/reflex') ||
      (gameType === 'MEMORY_MATCH' && g.path === '/games/memory')
    );
    
    if (currentGameIdx !== -1) {
      gameStatus[currentGameIdx].played = true;
    }

    // Circular search for the next unplayed game
    for (let i = 1; i <= gameStatus.length; i++) {
      const nextIdx = (currentGameIdx + i) % gameStatus.length;
      if (!gameStatus[nextIdx].played) {
        return { name: gameStatus[nextIdx].name, path: gameStatus[nextIdx].path };
      }
    }

    // If we've played all games, but the current game was the LAST one to be played,
    // we return null to show "Generate Leaderboard Card"
    return null; // All games played
  }

  const nextGame = getNextGame()

  // For visual feedback while loading
  const isAllRanksLoading = !allRanks && gameType !== 'OVERALL';

  // Debugging log to trace why continue button might be missing
  useEffect(() => {
    if (hasAutoSaved && allRanks) {
      console.log('GameOverCard Debug:', {
        gameType,
        allRanks,
        nextGame,
        playerId: localStorage.getItem('junie_player_id')
      });
    }
  }, [hasAutoSaved, allRanks, nextGame, gameType]);

  const handleExit = async () => {
    setIsCalculating(true)
    setShowExitModal(true)
    
    try {
      const playerId = localStorage.getItem('junie_player_id')
      
      // If no scores saved yet, just go home
      if (!playerId) {
        window.location.href = '/'
        return
      }

      // Small delay to simulate "calculating overall leaderboard"
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await fetch(`/api/leaderboard?view=overall&playerId=${playerId}`)
      const data = await response.json()
      
      if (data.currentPlayer && data.leaderboard) {
        // Find position in the leaderboard
        const position = data.leaderboard.findIndex((p: any) => p.playerId === playerId)
        setPlayerRank(position !== -1 ? position + 1 : null)
        
        // Reset credentials since the tournament is being exited/finished
        localStorage.removeItem('junie_player_id')
        localStorage.removeItem('junie_username')
        localStorage.removeItem('junie_country')

        // Redirect to leaderboard with showOverall flag to generate the card
        window.location.href = `/leaderboard?showOverall=true&playerId=${playerId}&rank=${position !== -1 ? position + 1 : ''}`
      } else {
        // Fallback if no player stats found
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to calculate rank:', error)
      window.location.href = '/'
    }
  }

  const handleGenerateLeaderboardCard = async () => {
    setIsCalculating(true)
    setShowExitModal(true)
    
    try {
      const playerId = localStorage.getItem('junie_player_id')
      
      // If no scores saved yet, just go home
      if (!playerId) {
        window.location.href = '/'
        return
      }

      // Small delay to simulate "calculating overall leaderboard"
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await fetch(`/api/leaderboard?view=overall&playerId=${playerId}`)
      const data = await response.json()
      
      if (data.currentPlayer && data.leaderboard) {
        // Find position in the leaderboard
        const position = data.leaderboard.findIndex((p: any) => p.playerId === playerId)
        setPlayerRank(position !== -1 ? position + 1 : null)
        
        // Reset credentials since the tournament is over
        localStorage.removeItem('junie_player_id')
        localStorage.removeItem('junie_username')
        localStorage.removeItem('junie_country')

        // Redirect to leaderboard
        window.location.href = `/leaderboard?showOverall=true&playerId=${playerId}&rank=${position !== -1 ? position + 1 : ''}`
      } else {
        // Fallback
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to generate leaderboard card:', error)
      window.location.href = '/'
    }
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div
        ref={cardRef}
        data-card-clone="true"
        className="bg-[#0f1923] border border-white/10 shadow-2xl overflow-hidden relative"
      >
        {/* Hero and Small Mascot Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            {selectedHero && (
              <motion.img 
                key={selectedHero}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.12, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                src={`/assets/images/hero/${selectedHero}`} 
                alt="Hero background" 
                className="absolute -right-16 top-1/2 -translate-y-1/2 h-[90%] object-contain grayscale-0"
              />
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {selectedJunie && (
              <motion.img 
                key={selectedJunie}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.15, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 1 }}
                src={`/assets/images/junie/${selectedJunie}`} 
                alt="Small mascot accent" 
                className="absolute left-8 top-32 w-24 h-24 object-contain brightness-125"
              />
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-[#ff4655]/30 -translate-x-16 -translate-y-16 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-[#ff4655]/30 translate-x-16 translate-y-16 pointer-events-none" />
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
          <div className="text-4xl font-black italic tracking-tighter text-white">JUNIE ARCADE // 2026</div>
        </div>

        {/* Header with Game Branding */}
        <div data-card-header="true" className="relative p-8 flex flex-col md:flex-row items-center justify-between border-b border-white/10 overflow-hidden">
          {/* Animated Background Pulse */}
          <div className={`absolute inset-0 bg-gradient-to-r ${getGameColor()} opacity-5`} />
          
          <div className="relative z-10 flex items-center gap-6 mb-4 md:mb-0">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-24 h-24 relative drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {getGameLogo() ? (
                <Image 
                  src={getGameLogo()!} 
                  alt={getGameTitle()} 
                  fill 
                  className="object-contain"
                />
              ) : (
                <span className="text-7xl">🎮</span>
              )}
              
              {/* Dynamic floating mascot next to title */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedJunie}
                  initial={{ opacity: 0, scale: 0.5, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: -20 }}
                  src={`/assets/images/junie/${selectedJunie}`}
                  alt="Dynamic Junie"
                  className="absolute -top-6 -right-6 w-12 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
              </AnimatePresence>
            </motion.div>
            <div>
              <h2 className="text-sm font-black text-[#ff4655] uppercase tracking-[0.3em] mb-1">Mission Accomplished</h2>
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">{getGameTitle()}</h1>
            </div>
          </div>

          <div className="relative z-10 text-center md:text-right">
            <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Ultimate Rating</div>
            <div className={`text-6xl font-black ${getAccentColor()} italic tracking-tighter`}>
              {score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* Left Column: Player & Selfie (LoL/Valorant Agent Style) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group">
              {/* Selfie Container with Valorant Frame */}
              <div className="aspect-[4/5] bg-slate-900 border border-white/10 overflow-hidden relative">
                {!selfieData && !showCamera && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    {countdown !== null ? (
                      // Countdown display (auto start)
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-[#ff4655] flex items-center justify-center mb-4 bg-[#ff4655]/10 relative">
                          <motion.span
                            key={countdown}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-7xl font-black text-[#ff4655]"
                          >
                            {countdown}
                          </motion.span>
                          <div className="absolute inset-0 rounded-full border-4 border-[#ff4655] animate-ping opacity-20" />
                        </div>
                        <h3 className="text-white font-black uppercase tracking-wider mb-2">Camera Starting...</h3>
                        <p className="text-slate-400 text-xs">Get ready for your victory shot!</p>
                      </div>
                    ) : (
                      // Default state (no countdown)
                      <>
                        <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-4 bg-white/5">
                          <span className="text-4xl">👤</span>
                        </div>
                        <h3 className="text-white font-black uppercase tracking-wider mb-2">Access Granted</h3>
                        <p className="text-slate-500 text-xs mb-6">Capture your victory pose to immortalize this moment in the arena.</p>
                        <motion.button
                          onClick={startCamera}
                          data-export-hide="true"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-[#ff4655] text-white font-black uppercase tracking-widest text-xs skew-x-[-10deg]"
                        >
                          <span className="inline-block skew-x-[10deg]">Initiate Capture</span>
                        </motion.button>
                      </>
                    )}
                  </div>
                )}

                {selfieData && (
                  <div className="absolute inset-0">
                    <img
                      src={selfieData}
                      alt="Player selfie"
                      className="w-full h-full object-cover brightness-110 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-transparent to-transparent opacity-60" />
                    {!uploadedUrl && (
                      <div data-export-hide="true" className="absolute top-4 right-4 z-10">
                        <motion.button
                          onClick={async () => {
                            setSelfieData(null);
                            await startCamera();
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="group px-4 py-2 bg-white hover:bg-white/90 text-black text-xs font-black uppercase tracking-wider backdrop-blur-xl transition-all rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/50"
                        >
                          <span className="group-hover:tracking-widest transition-all">Retake</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Camera Modal Overlay */}
              <AnimatePresence>
                {showCamera && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
                  >
                    <div className="relative h-[85vh] aspect-[4/5] bg-slate-900 border border-white/10 overflow-hidden shadow-2xl">
                      {!tempSelfie ? (
                        <div className="absolute inset-0">
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover grayscale brightness-110 contrast-125"
                            autoPlay
                            playsInline
                            muted
                          />
                          <div className="absolute inset-0 border-[20px] md:border-[40px] border-[#0f1923]/80 pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#ff4655]/20 to-transparent pointer-events-none" />
                          <canvas ref={canvasRef} className="hidden" />

                          {/* Capture Countdown Overlay - Bottom Position */}
                          {captureCountdown !== null && (
                            <div className="absolute bottom-0 left-0 right-0 pb-24 z-50">
                              <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full border-4 border-[#ff4655] flex items-center justify-center mb-3 bg-[#ff4655]/10 relative backdrop-blur-sm">
                                  <motion.span
                                    key={captureCountdown}
                                    initial={{ scale: 1.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-7xl font-black text-[#ff4655]"
                                  >
                                    {captureCountdown}
                                  </motion.span>
                                  <div className="absolute inset-0 rounded-full border-4 border-[#ff4655] animate-ping opacity-20" />
                                </div>
                                <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full">
                                  <h3 className="text-white font-black uppercase tracking-wider text-lg mb-1">Get Ready!</h3>
                                  <p className="text-slate-300 text-xs text-center">Strike your best pose...</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Camera Controls */}
                          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-6">
                            <button
                              onClick={takeSelfie}
                              disabled={captureCountdown !== null}
                              className="w-full max-w-xs py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-sm skew-x-[-10deg] hover:bg-[#ff4655] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="inline-block skew-x-[10deg]">Capture Victory</span>
                            </button>
                            <button
                              onClick={stopCamera}
                              className="w-full max-w-xs py-3 bg-[#ff4655]/20 text-white/70 font-black uppercase tracking-[0.2em] text-[10px] skew-x-[-10deg] hover:bg-[#ff4655] hover:text-white transition-colors"
                            >
                              <span className="inline-block skew-x-[10deg]">Abort Mission</span>
                            </button>
                          </div>

                          {/* Decorative Elements */}
                          <div className="absolute top-10 left-10 text-white/40 font-black text-xs uppercase tracking-[0.5em]">
                            System Status: Ready
                          </div>
                          <div className="absolute top-10 right-10 text-[#ff4655] font-black text-xs uppercase tracking-[0.5em] animate-pulse">
                            • Live Feed
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0">
                          <img
                            src={tempSelfie}
                            alt="Temp selfie"
                            className="w-full h-full object-cover brightness-110 contrast-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-transparent to-transparent opacity-60" />
                          
                          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-6">
                            <button
                              onClick={confirmSelfie}
                              className="w-full max-w-xs py-4 bg-[#00ff9d] text-black font-black uppercase tracking-[0.2em] text-sm skew-x-[-10deg] hover:brightness-110 transition-all"
                            >
                              <span className="inline-block skew-x-[10deg]">Confirm Identity</span>
                            </button>
                            <button
                              onClick={retakeSelfie}
                              className="w-full max-w-xs py-3 bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] skew-x-[-10deg] hover:bg-white/20 transition-all backdrop-blur-md"
                            >
                              <span className="inline-block skew-x-[10deg]">Recapture</span>
                            </button>
                          </div>
                          
                          <div className="absolute top-10 left-10 text-[#00ff9d] font-black text-xs uppercase tracking-[0.5em]">
                            Image Captured
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="absolute -bottom-4 -right-4 bg-[#ff4655] p-4 skew-x-[-10deg] shadow-xl">
                <div className="skew-x-[10deg] flex items-center gap-3">
                  <FlagIcon code={getCountryCode()} className="w-10 h-7" />
                  <div>
                    <div className="text-xs font-black text-black/60 uppercase tracking-widest leading-none">Champion</div>
                    <div className="text-xl font-black text-white uppercase tracking-tighter leading-tight">{username}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Country Info Bar */}
            <div className="flex items-center justify-between border-b border-white/5 py-4 px-2">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Origin</span>
              <span className="text-sm font-black text-white uppercase italic">{country}</span>
            </div>
          </div>

          {/* Right Column: Stats & Actions */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex-1 space-y-6">
              {/* Force refresh button if rankings not loaded */}
              {!allRanks && gameType !== 'OVERALL' && (
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center mb-4">
                  <p className="text-slate-400 text-xs mb-3 italic">Syncing session progress...</p>
                  <button 
                    onClick={() => {
                      setHasAutoSaved(false);
                      setTimeout(() => setHasAutoSaved(true), 100);
                    }}
                    className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
                  >
                    🔄 Manual Sync
                  </button>
                </div>
              )}

              {/* Positions / Ranks Section - Only show on OVERALL card per user request */}
              {allRanks && gameType === 'OVERALL' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
                    <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Overall</div>
                    <div className="text-xl font-black text-white italic">#{allRanks.overall || '--'}</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl text-center">
                    <div className="text-[8px] font-black text-yellow-400 uppercase tracking-widest mb-1">Reflex</div>
                    <div className="text-xl font-black text-white italic">#{allRanks.reflex || '--'}</div>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl text-center">
                    <div className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1">Jump</div>
                    <div className="text-xl font-black text-white italic">#{allRanks.jump || '--'}</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl text-center">
                    <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">Memory</div>
                    <div className="text-xl font-black text-white italic">#{allRanks.memory || '--'}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/5 border-l-2 border-[#ff4655]/50 p-4 relative overflow-hidden group hover:bg-white/10 transition-colors"
                  >
                    <div className="absolute top-0 right-0 p-1 opacity-5">
                      <div className="text-4xl font-black">0{index + 1}</div>
                    </div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                    <div className={`text-2xl font-black italic tracking-tighter ${stat.color || 'text-white'}`}>
                      {stat.value}
                    </div>
                  </motion.div>
                ))}
              </div>

            {/* Action Buttons with Valorant Style */}
            <div data-export-hide="true" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {isAllRanksLoading && (
                <div className="col-span-1 sm:col-span-2 py-4 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-lg mb-2 animate-pulse">
                  <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-2" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Identifying Next Mission...</span>
                </div>
              )}

              {nextGame && (
                <Link
                  href={nextGame.path}
                  className="col-span-1 sm:col-span-2 group relative overflow-hidden bg-white py-4 transition-all hover:brightness-110 mb-2 border-l-4 border-cyan-400"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 font-black text-black uppercase tracking-[0.15em] text-sm">
                    <span>➡️</span>
                    Continue to {nextGame.name}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </Link>
              )}
              
              {!nextGame && gameType !== 'OVERALL' && (
                <button
                  onClick={handleGenerateLeaderboardCard}
                  className="col-span-1 sm:col-span-2 group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 py-4 transition-all hover:brightness-110 mb-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 font-black text-white uppercase tracking-[0.15em] text-sm">
                    <span>🏆</span>
                    Generate Leaderboard Card
                  </div>
                </button>
              )}

              {gameType !== 'OVERALL' && nextGame && (
                <button
                  onClick={handleExit}
                  className="col-span-1 sm:col-span-2 group relative overflow-hidden border border-white/20 py-4 transition-all hover:bg-white/5 mb-2"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 font-black text-white/60 group-hover:text-white uppercase tracking-[0.15em] text-sm transition-colors">
                    <span>🚪</span>
                    Exit & Generate Leaderboard Card
                  </div>
                  <div className="absolute inset-0 bg-white/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              )}

              {gameType === 'OVERALL' && (
                <Link
                  href="/"
                  className="col-span-1 sm:col-span-2 group relative overflow-hidden border-2 border-[#ff4655] py-4 transition-all hover:bg-[#ff4655]/10 mb-2"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 font-black text-[#ff4655] uppercase tracking-[0.15em] text-sm">
                    <span>❌</span>
                    Exit to Home
                  </div>
                </Link>
              )}

              <button
                onClick={saveCardToS3}
                disabled={isUploading || !!uploadedUrl}
                className={`group relative overflow-hidden bg-[#ff4655] py-4 transition-all hover:brightness-110 disabled:opacity-50`}
              >
                  <div className="relative z-10 flex items-center justify-center gap-3 font-black text-white uppercase tracking-[0.15em] text-sm">
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : uploadedUrl ? (
                      <>
                        <span>✅</span>
                        Card Saved
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        Save Card
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>

                <button
                  onClick={downloadCard}
                  disabled={isDownloading || !uploadedUrl}
                  className="group relative overflow-hidden border border-white/20 py-4 transition-all hover:bg-white/5 disabled:opacity-50"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 font-black text-white uppercase tracking-[0.15em] text-sm">
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <span>⬇️</span>
                        Export Card
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#ff4655] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
              </div>

              {/* Share & QR Section */}
              <div className="border-t border-white/5 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Secure Code</span>
                  <div className="flex items-center gap-2">
                    <img src="/assets/images/logos/cloud9-logo.png" alt="Cloud9" className="h-4 opacity-50" />
                    <span className="text-[10px] font-black text-white/20">x</span>
                    <img src="/assets/images/logos/jetbrains-logo.png" alt="JetBrains" className="h-4 opacity-50" />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center gap-6 bg-black/40 p-6 border border-white/5"
                >
                  <div className="p-3 bg-white relative">
                    {/* Decorative corners for QR */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-[#ff4655]" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-[#ff4655]" />
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Challenge Issued</h4>
                    <p className="text-slate-500 text-[10px] leading-relaxed mb-4">Scan to share your dominance or copy the secure link below.</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl)
                        // Could add a "Copied!" toast here
                      }}
                      data-export-hide="true"
                      className="text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest border border-white/20 px-4 py-2 transition-colors disabled:opacity-30"
                      disabled={!uploadedUrl}
                    >
                      {uploadedUrl ? 'Copy Access URL' : 'Save Card to Generate URL'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Footer Return Link */}
            <div data-export-hide="true">
              <Link href="/" className="mt-8">
                <div className="group flex items-center gap-4 text-white/40 hover:text-[#ff4655] transition-colors">
                  <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-[#ff4655]/30 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Menu</span>
                  <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-[#ff4655]/30 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Banner Branding */}
        <div className="bg-white/5 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-[#ff4655] rotate-45" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Protocol // Junie Arcade</span>
          </div>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">System Stable // {new Date().getFullYear()}</span>
        </div>
      </div>
    </motion.div>

    <AnimatePresence>
      {showExitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
        >
          <div className="max-w-md w-full text-center">
            {isCalculating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                {/* Modern Backdrop Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                
                <div className="relative space-y-10 py-12">
                  <div className="relative w-32 h-32 mx-auto">
                    {/* Outer Rotating Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-t-2 border-b-2 border-l-2 border-transparent border-t-emerald-500/50 border-b-cyan-500/50 rounded-full"
                    />
                    
                    {/* Inner Faster Rotating Ring */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 border-r-2 border-l-2 border-transparent border-r-emerald-400 border-l-cyan-400 rounded-full"
                    />
                    
                    {/* Pulsing Core */}
                    <motion.div
                      animate={{ 
                        scale: [0.9, 1.1, 0.9],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center text-3xl"
                    >
                      📊
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <motion.h3 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl font-black text-white uppercase tracking-tighter italic"
                    >
                      Analyzing <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Results</span>
                    </motion.h3>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">
                        Calculating overall leaderboard position
                      </p>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              duration: 1, 
                              repeat: Infinity, 
                              delay: i * 0.2 
                            }}
                            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Cyberpunk Decorative Lines */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-emerald-500/0 to-emerald-500/50" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-t from-cyan-500/0 to-cyan-500/50" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0f1923] border border-white/10 p-10 relative overflow-hidden"
              >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -rotate-45 translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 -rotate-45 -translate-x-16 translate-y-16" />

                <div className="text-sm font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 italic">Tournament Summary</div>
                
                <div className="mb-8">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Your Final Rank</div>
                  <div className="text-8xl font-black text-white italic tracking-tighter">
                    #{playerRank || '??'}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Player</span>
                    <span className="text-sm font-black text-white uppercase italic">{username}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Score</span>
                    <span className="text-sm font-black text-emerald-400 uppercase italic">{score.toLocaleString()} PTS</span>
                  </div>
                </div>

                <Link
                  href="/leaderboard"
                  className="block w-full bg-white text-black font-black py-4 px-8 rounded-sm text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors skew-x-[-10deg]"
                >
                  <span className="inline-block skew-x-[10deg]">View Hall of Fame</span>
                </Link>
                
                <button
                  onClick={() => setShowExitModal(false)}
                  className="mt-4 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.3em] transition-colors"
                >
                  [ Close and Return ]
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
