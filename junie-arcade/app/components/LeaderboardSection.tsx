'use client';

import { motion } from "framer-motion";
import Leaderboard from "./Leaderboard";

export default function LeaderboardSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
              HALL OF FAME
            </h2>
            <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">
              Top performers from the current cycle
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#0f1923] border border-white/10 px-6 py-4 rounded-sm backdrop-blur-md relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4655]" />
            <div className="text-right">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Global Status
              </div>
              <div className="text-[#ff4655] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-pulse" />
                Live Feed
              </div>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              🏆
            </div>
          </div>
        </div>

        <Leaderboard />
      </motion.div>
    </div>
  );
}
