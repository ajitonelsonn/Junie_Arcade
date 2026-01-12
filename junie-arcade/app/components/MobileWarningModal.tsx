'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface MobileWarningModalProps {
  isOpen: boolean
  gameName: string
  gradient: string
  onClose?: () => void
}

export default function MobileWarningModal({ isOpen, gameName, gradient, onClose }: MobileWarningModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-lg w-full bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-white/20 overflow-hidden shadow-2xl my-auto"
          >
            {/* Top gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r ${gradient}`} />

            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors group"
              >
                <span className="text-white text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform">×</span>
              </button>
            )}

            <div className="p-4 sm:p-6 md:p-8 text-center">
              {/* Warning Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-6 rounded-full bg-red-500/20 border-2 sm:border-4 border-red-500"
              >
                <span className="text-3xl sm:text-4xl md:text-5xl">📱</span>
              </motion.div>

              {/* Junie mascot - Hidden on very small screens */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden sm:block absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
              >
                <Image
                  src="/assets/images/junie/junie-idle.png"
                  alt="Junie"
                  fill
                  sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                  className="object-contain opacity-60"
                />
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden sm:block absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
              >
                <Image
                  src="/assets/images/junie/junie-idle.png"
                  alt="Junie"
                  fill
                  sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                  className="object-contain opacity-60 scale-x-[-1]"
                />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 tracking-tight px-2"
              >
                Mobile Not Supported
              </motion.h2>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
              >
                <p className="text-base sm:text-lg text-red-400 font-bold px-2">
                  {gameName} requires a larger screen!
                </p>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed px-2">
                  For the best gaming experience, please use a <span className="text-white font-bold">laptop</span>, <span className="text-white font-bold">desktop</span>, or <span className="text-white font-bold">tablet</span> to play this game.
                </p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 text-3xl sm:text-4xl opacity-70 mt-4 sm:mt-6">
                  <span>💻</span>
                  <span>🖥️</span>
                  <span className="text-2xl sm:text-3xl">📱</span>
                </div>
              </motion.div>

              {/* Info box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm"
              >
                <div className="flex items-start gap-2 sm:gap-3 text-left">
                  <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5 sm:mt-1">ℹ️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs sm:text-sm mb-1 sm:mb-2">Why is this restricted?</p>
                    <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">
                      Our games are optimized for larger screens to ensure proper controls, visibility, and gameplay experience. Mobile phones don't provide the screen real estate needed for the best performance.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10"
              >
                <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-black">
                  Junie's Arcade • {new Date().getFullYear()}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
