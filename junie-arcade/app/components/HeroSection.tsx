'use client';

import Image from "next/image";
import { motion } from "framer-motion";

const heroImages = [
  "/assets/images/hero/Jinx_Render.webp",
  "/assets/images/hero/Yasuo_Render.webp",
  "/assets/images/hero/Lux_Render.webp",
  "/assets/images/hero/Ezreal_Render.webp",
  "/assets/images/hero/Jett_Artwork_Full.webp",
  "/assets/images/hero/Phoenix_Artwork_Full.webp",
  "/assets/images/hero/Reyna_Artwork_Full.webp",
  "/assets/images/hero/Sage_Artwork_Full.webp",
];

export default function HeroSection() {
  return (
    <header className="px-8 pt-24 pb-20 text-center max-w-5xl mx-auto relative contain-[layout]">
      {/* Junie Mascot Animation */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-64 h-64">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-full h-full"
        >
          <Image
            src="/assets/images/junie/junie-happy.png"
            alt="Junie Mascot"
            fill
            sizes="256px"
            priority
            fetchPriority="high"
            className="object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]"
          />
        </motion.div>

        {/* Secondary Junie Animation - Idle/Floating */}
        <motion.div
          initial={{ x: -150, opacity: 0 }}
          animate={{
            x: [-150, -120, -150],
            opacity: 0.8,
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-0 w-24 h-24"
        >
          <Image
            src="/assets/images/junie/junie-idle.png"
            alt="Junie Idle"
            fill
            sizes="96px"
            className="object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ x: 150, opacity: 0 }}
          animate={{
            x: [150, 120, 150],
            opacity: 0.8,
            rotate: [5, -5, 5],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-0 w-24 h-24"
        >
          <Image
            src="/assets/images/junie/junie-jump.png"
            alt="Junie Jump"
            fill
            sizes="96px"
            className="object-contain"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            Live Hackathon Event
          </span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-none">
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            JUNIE'S
          </span>
          <br />
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            ARCADE
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Three legendary challenges. One elite arena.
          <span className="text-white"> Push your limits</span> and claim
          your spot on the leaderboard.
        </p>
      </motion.div>
    </header>
  );
}
