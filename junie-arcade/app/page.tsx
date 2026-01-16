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

          <main className="container mx-auto px-8 pb-32">
            {/* Games Grid */}
            <GamesGrid />

            {/* Leaderboard Section */}
            <LeaderboardSection />

            {/* How It Works Button */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-20"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black uppercase tracking-widest text-base rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                  How It Works - Complete Game Guide
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <p className="text-slate-500 text-sm mt-4 font-medium uppercase tracking-wider">
                Learn game mechanics, scoring systems, and pro strategies
              </p>
            </m.div>
          </main>

        {/* How It Works Modal */}
        <HowItWorksModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        <footer className="border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl py-16">
          <div className="container mx-auto px-8 text-center">
            <div className="flex justify-center items-center gap-12 mb-10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <Image
                src="/assets/images/logos/cloud9-logo.png"
                alt="C9"
                width={80}
                height={25}
                sizes="80px"
              />
              <Image
                src="/assets/images/logos/jetbrains-logo.png"
                alt="JB"
                width={80}
                height={25}
                sizes="80px"
              />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em] mb-4">
              Engineered for Performance
            </p>
            <p className="text-slate-400 text-xs">
              Sky's the Limit
              <br />© 2026 Cloud9 x JetBrains Hackathon
            </p>
          </div>
        </footer>
        </div>
      </div>
    </LazyMotion>
  );
}
