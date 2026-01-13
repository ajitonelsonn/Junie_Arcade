import Image from "next/image";
import AnimatedBackground from "./components/AnimatedBackground";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import GamesGrid from "./components/GamesGrid";
import LeaderboardSection from "./components/LeaderboardSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
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
        </main>

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
            <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.3em] mb-4">
              Engineered for Performance
            </p>
            <p className="text-slate-600 text-xs">
              Sky's the Limit
              <br />© 2026 Cloud9 x JetBrains Hackathon
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
