'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#020617] border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#020617] to-[#020617]/95 border-b border-white/10 px-8 py-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                    How It Works
                  </h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Complete Guide to Junie's Arcade</p>
                </div>
                <button
                  onClick={onClose}
                  className="group p-3 hover:bg-white/5 rounded-full transition-all duration-300"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-8 py-8">
              <div className="prose prose-invert prose-slate max-w-none">
                {/* Getting Started */}
                <section className="mb-12">
                  <h2 className="text-3xl font-black uppercase tracking-tight italic text-white mb-4">🎮 Getting Started</h2>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-black text-cyan-400">1.</span>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Enter Your Credentials</h3>
                        <p className="text-slate-400">Provide your name and country to create a unique Player ID</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-black text-cyan-400">2.</span>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Choose Your Challenge</h3>
                        <p className="text-slate-400">Select from 3 competitive mini-games</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-black text-cyan-400">3.</span>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Compete & Climb</h3>
                        <p className="text-slate-400">Set your best score and watch your rank rise on the global leaderboard</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* The Three Games */}
                <section className="mb-12">
                  <h2 className="text-3xl font-black uppercase tracking-tight italic text-white mb-6">🎯 The Three Games</h2>

                  {/* Jump Master */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-6 mb-6">
                    <h3 className="text-2xl font-black uppercase italic text-cyan-400 mb-3">🚀 Jump Master</h3>
                    <p className="text-slate-300 mb-4"><strong>Type:</strong> Endless Runner / Platformer | <strong>Duration:</strong> 50 seconds</p>
                    <div className="space-y-3 text-slate-300">
                      <p><strong className="text-white">Controls:</strong> Press SPACE to jump (Desktop) or Tap screen (Mobile). Press/tap twice for double jump!</p>
                      <p><strong className="text-white">Goal:</strong> Collect Cloud9 logos (50 pts) and Coins (20 pts) while avoiding bugs</p>
                      <p><strong className="text-white">Scoring:</strong> Final Score = Collectibles + Distance Bonus + Milestones</p>
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4 mt-3">
                        <p className="text-sm text-cyan-400 font-mono">Example: 350m, 15 coins, 8 logos = 810 points</p>
                        <p className="text-xs text-slate-500 mt-1">Collectibles (700) + Distance (35) + Milestones (75)</p>
                      </div>
                    </div>
                  </div>

                  {/* Reflex Arena */}
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-2xl p-6 mb-6">
                    <h3 className="text-2xl font-black uppercase italic text-orange-400 mb-3">⚡ Reflex Arena</h3>
                    <p className="text-slate-300 mb-4"><strong>Type:</strong> Target Clicking / Reaction Game | <strong>Duration:</strong> 50 seconds</p>
                    <div className="space-y-3 text-slate-300">
                      <p><strong className="text-white">Controls:</strong> Click or tap targets</p>
                      <p><strong className="text-white">Good Targets:</strong> Star (10), Coin (20), Gem (30), Trophy (50)</p>
                      <p><strong className="text-white">Bad Targets:</strong> Bug/Virus/Bomb (-25 points + combo reset)</p>
                      <p><strong className="text-white">Scoring:</strong> Points = Base × Reaction Bonus (2× if fast) × Combo (up to 5×)</p>
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4 mt-3">
                        <p className="text-sm text-orange-400 font-mono">Max combo example: Trophy + Fast + 5× = 500 points!</p>
                      </div>
                    </div>
                  </div>

                  {/* Memory Match */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-2xl font-black uppercase italic text-purple-400 mb-3">🧠 Memory Match</h3>
                    <p className="text-slate-300 mb-4"><strong>Type:</strong> Card Matching / Memory Puzzle | <strong>Duration:</strong> 100 seconds</p>
                    <div className="space-y-3 text-slate-300">
                      <p><strong className="text-white">Controls:</strong> Click or tap cards to flip them</p>
                      <p><strong className="text-white">Goal:</strong> Match all 8 pairs of champion cards</p>
                      <p><strong className="text-white">Scoring:</strong> Match points (75 × combo), Time Bonus, Accuracy Bonus, Completion Bonuses</p>
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4 mt-3">
                        <p className="text-sm text-purple-400 font-mono">Perfect Game: 16 moves + 60+ sec remaining = huge bonuses!</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Champion Points */}
                <section className="mb-12">
                  <h2 className="text-3xl font-black uppercase tracking-tight italic text-white mb-4">🏆 Champion Points System</h2>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-slate-300 mb-4">
                      Since each game has different scoring ranges, we use <strong className="text-emerald-400">Champion Points</strong> to create fair overall rankings.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">🥇</div>
                        <div className="text-xl font-black text-white">100</div>
                        <div className="text-xs text-slate-400">1st Place</div>
                      </div>
                      <div className="bg-gradient-to-br from-slate-400/20 to-slate-500/20 border border-slate-400/30 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">🥈</div>
                        <div className="text-xl font-black text-white">90</div>
                        <div className="text-xs text-slate-400">2nd Place</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 border border-orange-600/30 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">🥉</div>
                        <div className="text-xl font-black text-white">80</div>
                        <div className="text-xs text-slate-400">3rd Place</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-xl font-black text-white">1-80</div>
                        <div className="text-xs text-slate-400">4th-50th+</div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-4 text-center">
                      Your total Champion Points from all 3 games determine your overall rank!
                    </p>
                  </div>
                </section>

                {/* Tips */}
                <section className="mb-12">
                  <h2 className="text-3xl font-black uppercase tracking-tight italic text-white mb-4">💡 Pro Tips</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5">
                      <h3 className="text-lg font-black text-cyan-400 mb-2">Jump Master</h3>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• Prioritize Cloud9 logos (50 pts)</li>
                        <li>• Master double jump timing</li>
                        <li>• Late game = maximum speed!</li>
                      </ul>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
                      <h3 className="text-lg font-black text-orange-400 mb-2">Reflex Arena</h3>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• Build 5× combo ASAP</li>
                        <li>• Click within 250ms for 2× bonus</li>
                        <li>• Trophy at max combo = 500 pts!</li>
                      </ul>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                      <h3 className="text-lg font-black text-purple-400 mb-2">Memory Match</h3>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• Memorize positions first 30s</li>
                        <li>• Build consecutive matches</li>
                        <li>• Complete with 60+ sec = 400 bonus!</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Rewards */}
                <section className="mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tight italic text-white mb-4">🎁 Rewards</h2>
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-6">
                    <p className="text-slate-300 mb-3">
                      <strong className="text-white">For GDC Event Attendees:</strong> Top 3 players at Cloud9 & JetBrains booths win authentic Timor-Leste merchandise!
                    </p>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <div>🎋 Kelu Tais Timor (Traditional Bracelets)</div>
                      <div>🧣 Selendang Tais (Traditional Scarves)</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 italic">
                      Junie's Arcade was created by a developer from Timor-Leste 🇹🇱
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-[#020617] to-[#020617]/95 border-t border-white/10 px-8 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 uppercase tracking-widest">
                  Built with ❤️ from Timor-Leste 🇹🇱
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity"
                >
                  Let's Play!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
