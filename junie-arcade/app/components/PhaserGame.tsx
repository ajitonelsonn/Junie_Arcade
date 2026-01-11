'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

interface PhaserGameProps {
  config: Phaser.Types.Core.GameConfig
  className?: string
}

export default function PhaserGame({ config, className }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    const gameConfig: Phaser.Types.Core.GameConfig = {
      ...config,
      parent: gameRef.current,
    }

    phaserGameRef.current = new Phaser.Game(gameConfig)

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [config])

  return <div ref={gameRef} className={className} />
}
