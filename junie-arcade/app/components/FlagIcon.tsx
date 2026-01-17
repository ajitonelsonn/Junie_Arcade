'use client'

import { m } from 'framer-motion'
import * as Flags from 'country-flag-icons/react/3x2'

interface FlagIconProps {
  code: string
  className?: string
  animate?: boolean
}

export default function FlagIcon({ code, className = "w-6 h-4", animate = true }: FlagIconProps) {
  // Ensure code is uppercase for the library
  const flagCode = code.toUpperCase() as keyof typeof Flags
  const Flag = Flags[flagCode]

  if (!Flag) {
    return (
      <div className={`${className} bg-slate-800 rounded-sm flex items-center justify-center text-[8px] text-white/40 font-bold border border-white/10`}>
        {code}
      </div>
    )
  }

  if (!animate) {
    return <Flag className={`${className} rounded-sm object-cover shadow-sm`} />
  }

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="inline-block"
    >
      <Flag className={`${className} rounded-sm object-cover shadow-sm`} />
    </m.div>
  )
}
