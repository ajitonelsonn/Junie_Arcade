'use client'

import { useEffect, useRef, useState } from 'react'

interface PhaserGameProps {
  config: any // Use any for now to avoid importing Phaser at top level for types
  className?: string
}

export default function PhaserGame({ config, className }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)
  const [Phaser, setPhaser] = useState<any>(null)

  useEffect(() => {
    import('phaser').then((P) => {
      setPhaser(P)
    })
  }, [])

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current || !Phaser) return

    const gameConfig = {
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
  }, [config, Phaser])

  return <div ref={gameRef} className={className} />
}
