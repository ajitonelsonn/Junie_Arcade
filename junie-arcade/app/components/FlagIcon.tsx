'use client'

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

  // Use CSS animations instead of framer-motion to avoid LazyMotion conflicts
  return (
    <div
      className={`inline-block ${animate ? 'animate-flag-in hover:scale-110' : ''} transition-transform duration-200`}
    >
      <Flag className={`${className} rounded-sm object-cover shadow-sm`} />
    </div>
  )
}
