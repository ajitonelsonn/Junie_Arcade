"use client";

import Image from "next/image";
import { m } from "framer-motion";

export default function HeroSection() {
  return (
    <header className="px-4 sm:px-8 pt-36 sm:pt-48 pb-12 sm:pb-20 text-center max-w-5xl mx-auto relative overflow-visible">
      {/* Tactical Corner Accents */}
      <div className="absolute top-8 left-4 sm:left-8 w-16 sm:w-24 h-16 sm:h-24 pointer-events-none hidden md:block">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#ff4655] to-transparent" />
        <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#ff4655] to-transparent" />
        <div className="absolute top-3 left-3 text-[8px] font-black text-[#ff4655]/60 uppercase tracking-[0.2em]">
          SYS.01
        </div>
      </div>
      <div className="absolute top-8 right-4 sm:right-8 w-16 sm:w-24 h-16 sm:h-24 pointer-events-none hidden md:block">
        <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-[#00eeff] to-transparent" />
        <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-[#00eeff] to-transparent" />
        <div className="absolute top-3 right-3 text-[8px] font-black text-[#00eeff]/60 uppercase tracking-[0.2em]">
          SYS.02
        </div>
      </div>

      {/* Junie Mascot Animation - Hexagonal Frame */}
      <div className="absolute top-4 sm:top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
        <m.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-full h-full"
        >
          {/* Hexagonal Glow Frame */}
          <div
            className="absolute inset-4 sm:inset-6"
            style={{
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              background:
                "linear-gradient(135deg, rgba(0, 238, 255, 0.2), rgba(168, 85, 247, 0.2))",
              filter: "blur(20px)",
            }}
          />
          <Image
            src="/assets/images/junie/junie-happy.png"
            alt="Junie Mascot"
            fill
            sizes="(max-width: 640px) 192px, 256px"
            priority
            fetchPriority="high"
            quality={75}
            className="object-contain drop-shadow-[0_0_40px_rgba(0,238,255,0.6)]"
          />
        </m.div>

        {/* Secondary Junie - Left */}
        <m.div
          initial={{ x: -150, opacity: 0 }}
          animate={{
            x: [-120, -100, -120],
            opacity: 0.7,
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-16 sm:top-20 left-0 w-16 h-16 sm:w-24 sm:h-24"
        >
          <Image
            src="/assets/images/junie/junie-idle.png"
            alt="Junie Idle"
            fill
            sizes="(max-width: 640px) 64px, 96px"
            quality={60}
            className="object-contain"
          />
        </m.div>

        {/* Secondary Junie - Right */}
        <m.div
          initial={{ x: 150, opacity: 0 }}
          animate={{
            x: [120, 100, 120],
            opacity: 0.7,
            rotate: [5, -5, 5],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-16 sm:top-20 right-0 w-16 h-16 sm:w-24 sm:h-24"
        >
          <Image
            src="/assets/images/junie/junie-jump.png"
            alt="Junie Jump"
            fill
            sizes="(max-width: 640px) 64px, 96px"
            quality={60}
            className="object-contain"
          />
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Live Badge - VALORANT Style */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 backdrop-blur-md relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 70, 85, 0.1), rgba(255, 70, 85, 0.05))",
            border: "1px solid rgba(255, 70, 85, 0.3)",
            clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4655] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4655]"></span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4655]">
            Live Hackathon Event
          </span>
          {/* Animated scan line */}
          <m.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#ff4655]/20 to-transparent"
          />
        </div>

        {/* Main Title - VALORANT/LoL Style */}
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-4 sm:mb-6 tracking-tighter leading-none relative">
          {/* Background glow */}
          <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 -z-10" />

          <m.span
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 italic"
          >
            JUNIE'S
          </m.span>
          <br />
          <m.span
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-[#00eeff] to-[#c284f9] italic"
            style={{ textShadow: "0 0 60px rgba(0, 238, 255, 0.5)" }}
          >
            ARCADE
          </m.span>
        </h1>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
          <div className="w-12 sm:w-20 h-[2px] bg-gradient-to-r from-transparent to-[#ff4655]" />
          <div className="w-2 h-2 rotate-45 bg-[#ff4655]" />
          <div className="w-8 sm:w-12 h-[1px] bg-white/30" />
          <div className="w-2 h-2 rotate-45 bg-[#00eeff]" />
          <div className="w-12 sm:w-20 h-[2px] bg-gradient-to-l from-transparent to-[#00eeff]" />
        </div>

        {/* Tagline - Tactical Style */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="relative"
        >
          <p className="text-base sm:text-xl md:text-2xl text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
            <span className="text-[#ff4655]">Three</span> legendary challenges.
            <span className="text-[#00eeff]"> One</span> elite arena.
          </p>
          <p className="text-sm sm:text-lg text-white/80 font-black uppercase tracking-[0.15em] mt-2">
            Push your limits & claim your spot
          </p>
        </m.div>

        {/* Protocol Badge */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-3 py-1.5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
            Cloud9 x JetBrains // Protocol v1.0
          </span>
        </m.div>
      </m.div>
    </header>
  );
}
