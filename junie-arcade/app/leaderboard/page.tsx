"use client";

import Leaderboard from "../components/Leaderboard";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background - Consistent with Home and Gallery */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/lol_.webp')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.4, 0.3],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"
        />

        {/* Floating Hero Characters - Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.8, 1, 1.2],
                x: i % 2 === 0 ? [0, 40, 0] : [0, -40, 0],
                y: [0, -80, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                delay: i * 4,
                ease: "linear",
              }}
              className={`absolute ${
                i === 0
                  ? "top-[10%] left-[2%]"
                  : i === 1
                  ? "top-[20%] right-[5%]"
                  : i === 2
                  ? "top-[45%] left-[5%]"
                  : i === 3
                  ? "top-[65%] right-[2%]"
                  : i === 4
                  ? "bottom-[15%] left-[8%]"
                  : i === 5
                  ? "bottom-[25%] right-[15%]"
                  : i === 6
                  ? "bottom-[45%] left-[2%]"
                  : "bottom-[65%] right-[10%]"
              } w-64 h-[400px]`}
            >
              <Image
                src={img}
                alt="Hero"
                fill
                className="object-contain filter grayscale brightness-110 contrast-125 opacity-30"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/assets/images/logos/cloud9-logo.png"
              alt="Cloud9"
              width={100}
              height={35}
              style={{ width: "auto", height: "auto" }}
              className="brightness-110"
            />
            <div className="h-6 w-px bg-white/20" />
            <Image
              src="/assets/images/logos/jetbrains-logo.png"
              alt="JetBrains"
              width={100}
              height={35}
              style={{ width: "auto", height: "auto" }}
              className="opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Arena
            </Link>
            <Link
              href="/gallery"
              className="hover:text-white transition-colors"
            >
              Gallery
            </Link>
            <Link href="/leaderboard" className="text-white transition-colors">
              Leaderboard
            </Link>
            <Link
              href="/merchandise"
              className="hover:text-white transition-colors"
            >
              Merchandise
            </Link>
            <a
              href="https://cloud9.devpost.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white cursor-pointer transition-colors"
            >
              Tournament
            </a>
          </div>
        </nav>

        {/* Header Section */}
        <header className="px-8 pt-16 pb-12 text-center max-w-5xl mx-auto relative">
          {/* Junie Mascot Decoration */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-48 h-48 opacity-80">
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full h-full"
            >
              <Image
                src="/assets/images/junie/junie-happy.png"
                alt="Junie Mascot"
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(255,70,85,0.4)]"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pt-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4655] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4655]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4655]">
                Competitive Integrity Verified
              </span>
            </div>

            <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter leading-none italic uppercase">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                Global
              </span>
              <br />
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-[#ff4655] to-orange-600">
                Leaderboard
              </span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-tight">
              Witness the legends of the arena. The top performers
              <span className="text-white"> pushing the limits</span> of the{" "}
              <span className="text-[#ff4655]">Junie Arcade Protocol</span>.
            </p>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-8 pb-32">
          <div className="max-w-5xl mx-auto relative">
            {/* Decorative Corner Accents */}
            <div className="absolute -top-10 -left-10 w-20 h-20 border-l-2 border-t-2 border-[#ff4655]/30 pointer-events-none hidden md:block" />
            <div className="absolute -bottom-10 -right-10 w-20 h-20 border-r-2 border-b-2 border-[#ff4655]/30 pointer-events-none hidden md:block" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Leaderboard />
            </motion.div>
          </div>
        </main>

        <footer className="border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl py-16">
          <div className="container mx-auto px-8 text-center">
            <div className="flex justify-center items-center gap-12 mb-10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <Image
                src="/assets/images/logos/cloud9-logo.png"
                alt="C9"
                width={80}
                height={25}
                style={{ width: "auto", height: "auto" }}
              />
              <Image
                src="/assets/images/logos/jetbrains-logo.png"
                alt="JB"
                width={80}
                height={25}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.3em] mb-4">
              © 2026 Cloud9 x JetBrains Hackathon
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
