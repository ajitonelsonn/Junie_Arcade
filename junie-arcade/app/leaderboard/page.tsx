"use client";

import Leaderboard from "../components/Leaderboard";
import Image from "next/image";
import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";

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
    <LazyMotion features={domAnimation} strict>
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background - Consistent with Home and Gallery */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/lol_.webp')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />

        {/* Animated Orbs */}
        <m.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
        />
        <m.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.4, 0.3],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"
        />

        {/* Floating Hero Characters - Subtle decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 hidden lg:block">
          {heroImages.slice(0, 4).map((img, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0.8, 1, 1.1],
                y: [0, -60, 0],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                delay: i * 6,
                ease: "linear",
              }}
              className={`absolute w-48 h-75 ${
                ["top-[15%] left-[2%]", "top-[30%] right-[3%]", "bottom-[25%] left-[3%]", "bottom-[15%] right-[5%]"][i]
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="192px"
                loading="lazy"
                quality={50}
                className="object-contain filter grayscale brightness-110 contrast-125"
              />
            </m.div>
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

        {/* Header Section - Compact for better leaderboard visibility */}
        <header className="px-8 pt-6 pb-4 text-center max-w-5xl mx-auto relative">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4655] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4655]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4655]">
                Live Rankings
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter leading-none italic uppercase">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                Global
              </span>{" "}
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-[#ff4655] to-orange-600">
                Leaderboard
              </span>
            </h1>

            <p className="text-sm text-slate-400 font-medium max-w-xl mx-auto uppercase tracking-tight">
              Top performers of the{" "}
              <span className="text-[#ff4655]">Junie Arcade Protocol</span>
            </p>
          </m.div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto relative">
            {/* Decorative Corner Accents */}
            <div className="absolute -top-6 -left-6 w-12 h-12 border-l-2 border-t-2 border-[#ff4655]/30 pointer-events-none hidden md:block" />
            <div className="absolute -bottom-6 -right-6 w-12 h-12 border-r-2 border-b-2 border-[#ff4655]/30 pointer-events-none hidden md:block" />

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Leaderboard />
            </m.div>
          </div>
        </main>

        <footer className="border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl py-8">
          <div className="container mx-auto px-8 text-center">
            <div className="flex justify-center items-center gap-8 mb-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <Image
                src="/assets/images/logos/cloud9-logo.png"
                alt="C9"
                width={60}
                height={20}
                style={{ width: "auto", height: "auto" }}
              />
              <Image
                src="/assets/images/logos/jetbrains-logo.png"
                alt="JB"
                width={60}
                height={20}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.3em]">
              © 2026 Cloud9 x JetBrains Hackathon
            </p>
          </div>
        </footer>
      </div>
    </div>
    </LazyMotion>
  );
}
