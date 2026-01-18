'use client';

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import GamesGrid from "./components/GamesGrid";
import SessionCleaner from "./components/SessionCleaner";

// Dynamically import heavy/below-the-fold components
const AnimatedBackground = dynamic(() => import("./components/AnimatedBackground"), {
  ssr: false,
});
const LeaderboardSection = dynamic(() => import("./components/LeaderboardSection"), {
  ssr: false,
});
const HowItWorksModal = dynamic(() => import("./components/HowItWorksModal"), {
  ssr: false,
});

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
        <SessionCleaner />
        {/* Dynamic Background */}
        <AnimatedBackground />

        <div className="relative z-10">
          {/* Navigation / Header Branding */}
          <Navigation />

          {/* Hero Section */}
          <HeroSection />

          <main className="container mx-auto px-4 sm:px-8 pb-24 sm:pb-32">
            {/* Games Grid */}
            <GamesGrid />

            {/* Leaderboard Section */}
            <LeaderboardSection />

            {/* How It Works Button - VALORANT/LoL Style */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-16 sm:mt-20"
            >
              {/* Section Divider */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#ff4655]/50" />
                <div className="w-2 h-2 rotate-45 bg-[#ff4655]/50" />
                <div className="w-8 h-px bg-white/20" />
                <div className="w-2 h-2 rotate-45 bg-[#00eeff]/50" />
                <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#00eeff]/50" />
              </div>

              <m.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-8 sm:px-12 py-4 sm:py-5 text-white font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-xs sm:text-sm overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.9), rgba(0, 238, 255, 0.9))',
                  clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)',
                  boxShadow: '0 0 40px rgba(255, 70, 85, 0.3), 0 0 60px rgba(0, 238, 255, 0.2)'
                }}
              >
                {/* Animated scan line */}
                <m.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                />

                <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">How It Works - Complete Game Guide</span>
                  <span className="sm:hidden">Game Guide</span>
                </span>

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.9), rgba(255, 70, 85, 0.9))' }}
                />
              </m.button>

              <p className="text-slate-500 text-[10px] sm:text-xs mt-4 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                Learn game mechanics, scoring systems & pro strategies
              </p>
            </m.div>
          </main>

          {/* How It Works Modal */}
          <HowItWorksModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

          {/* Footer - Tactical Esports Style */}
          <footer className="relative border-t border-white/5 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent" />

            {/* Hexagonal pattern */}
            <div className="absolute inset-0 opacity-[0.01]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }} />

            <div className="relative z-10 container mx-auto px-4 sm:px-8 py-12 sm:py-16">
              {/* Top Section - Logos */}
              <div className="flex flex-col items-center mb-8 sm:mb-10">
                <div className="flex justify-center items-center gap-6 sm:gap-12 mb-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  <div
                    className="relative p-2 sm:p-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.1), transparent)',
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                    }}
                  >
                    <Image
                      src="/assets/images/logos/cloud9-logo.png"
                      alt="C9"
                      width={60}
                      height={20}
                      sizes="60px"
                      style={{ width: 'auto', height: 'auto' }}
                      className="w-12 sm:w-[60px]"
                    />
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rotate-45 bg-[#ff4655]/50" />
                    <div className="h-6 sm:h-8 w-px bg-white/10" />
                    <div className="w-1 h-1 rotate-45 bg-[#00eeff]/50" />
                  </div>

                  <div
                    className="relative p-2 sm:p-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), transparent)',
                      clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                    }}
                  >
                    <Image
                      src="/assets/images/logos/jetbrains-logo.png"
                      alt="JB"
                      width={60}
                      height={20}
                      sizes="60px"
                      style={{ width: 'auto', height: 'auto' }}
                      className="w-12 sm:w-[60px]"
                    />
                  </div>
                </div>

                {/* Protocol Badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Junie Arcade Protocol // Active
                  </span>
                </div>
              </div>

              {/* Middle Section - Tagline */}
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2">
                  Engineered for Performance
                </p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#ff4655]/30" />
                  <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-wider">
                    Sky's the Limit
                  </span>
                  <div className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#00eeff]/30" />
                </div>
              </div>

              {/* Bottom Section - Copyright */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rotate-45 bg-[#ff4655]" />
                  <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">
                    © 2026 Cloud9 x JetBrains Hackathon
                  </span>
                  <div className="w-1 h-1 rotate-45 bg-[#00eeff]" />
                </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute bottom-4 left-4 w-8 h-8 pointer-events-none opacity-20 hidden sm:block">
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-[#ff4655] to-transparent" />
                <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-[#ff4655] to-transparent" />
              </div>
              <div className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none opacity-20 hidden sm:block">
                <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-[#00eeff] to-transparent" />
                <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-[#00eeff] to-transparent" />
              </div>
            </div>
          </footer>
        </div>
      </div>
    </LazyMotion>
  );
}
