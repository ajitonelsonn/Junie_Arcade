"use client";

import { useState, useCallback } from "react";
import Leaderboard, { NewChampionData } from "../components/Leaderboard";
import NewChampionAnnouncement from "../components/NewChampionAnnouncement";
import Image from "next/image";
import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";
import Navigation from "../components/Navigation";

export default function LeaderboardPage() {
  const [newChampion, setNewChampion] = useState<NewChampionData | null>(null);

  const handleNewChampion = useCallback((champion: NewChampionData) => {
    setNewChampion(champion);
  }, []);

  const handleAnnouncementComplete = useCallback(() => {
    setNewChampion(null);
  }, []);
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
      {/* Navigation / Header Branding */}
      <div className="relative z-50">
        <Navigation />
      </div>
      
      {/* New Champion Announcement Overlay */}
      <NewChampionAnnouncement
        champion={newChampion}
        onComplete={handleAnnouncementComplete}
      />
      {/* Animated Background - VALORANT/LoL Tactical Style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <Image
            src="/assets/images/backgrounds/lol_.webp"
            alt=""
            fill
            sizes="100vw"
            loading="lazy"
            quality={60}
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/30 via-[#020617]/70 to-[#020617]" />

        {/* Hexagonal Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />

        {/* Diagonal Scan Lines */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 3px)',
          backgroundSize: '20px 20px'
        }} />

        {/* Animated Scan Line - Horizontal */}
        <m.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[1px] opacity-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, #ff4655, #ff4655, transparent)' }}
        />

        {/* Animated Orbs - VALORANT Red / Leaderboard Colors */}
        <m.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 80, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px]"
        >
          <div className="w-full h-full bg-gradient-to-br from-[#ff4655]/40 to-orange-600/20 rounded-full" />
        </m.div>
        <m.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
            x: [0, -60, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
          className="absolute top-1/3 -right-40 w-[450px] h-[450px] rounded-full blur-[100px]"
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-500/30 to-red-600/20 rounded-full" />
        </m.div>

        {/* Corner Decorative Elements - Tactical HUD Style */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
          <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#ff4655] to-transparent" />
          <div className="absolute top-4 left-4 h-20 w-[1px] bg-gradient-to-b from-[#ff4655] to-transparent" />
          <div className="absolute top-8 left-8 text-[8px] font-black text-[#ff4655]/50 uppercase tracking-[0.3em]">
            LDR//
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
          <div className="absolute top-4 right-4 w-20 h-[1px] bg-gradient-to-l from-[#ff4655] to-transparent" />
          <div className="absolute top-4 right-4 h-20 w-[1px] bg-gradient-to-b from-[#ff4655] to-transparent" />
          <div className="absolute top-8 right-8 text-[8px] font-black text-[#ff4655]/50 uppercase tracking-[0.3em]">
            //BOARD
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header Section - Compact for better leaderboard visibility */}
        <header className="px-8 pt-4 pb-4 text-center max-w-5xl mx-auto relative">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Tactical Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 backdrop-blur-md relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.1), rgba(255, 70, 85, 0.05))',
                border: '1px solid rgba(255, 70, 85, 0.3)',
                clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4655] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4655]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4655]">
                Live Rankings
              </span>
              {/* Animated scan line */}
              <m.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#ff4655]/20 to-transparent"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-3 tracking-tighter leading-none italic uppercase">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                GLOBAL
              </span>{" "}
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-red-500 to-orange-600"
                style={{ textShadow: '0 0 60px rgba(255, 70, 85, 0.4)' }}
              >
                LEADERBOARD
              </span>
            </h1>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-[#ff4655]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#ff4655]" />
              <div className="w-8 h-[1px] bg-white/30" />
              <div className="w-1.5 h-1.5 rotate-45 bg-orange-500" />
              <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-orange-500" />
            </div>

            <p className="text-slate-400 font-bold max-w-xl mx-auto uppercase tracking-wide text-sm">
              Top performers of the <span className="text-white">Junie Arcade</span> protocol.
              <span className="text-[#ff4655]"> High-intensity data stream.</span>
            </p>
          </m.div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto relative">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative p-1 bg-[#0a0e13]/40 backdrop-blur-xl border border-white/5"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 32px 100%, 0 calc(100% - 32px))'
              }}
            >
              {/* Tactical Inner Border */}
              <div 
                className="absolute inset-0 border-2 border-[#ff4655]/10 pointer-events-none"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 32px 100%, 0 calc(100% - 32px))'
                }}
              />
              <Leaderboard onNewChampion={handleNewChampion} />
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
