"use client";

import GameCard from "./components/GameCard";
import Leaderboard from "./components/Leaderboard";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  useEffect(() => {
    const menuMusic = new Audio("/assets/sounds/music/music-menu.mp3");
    menuMusic.loop = true;
    menuMusic.volume = 0.3;
    let isPlaying = false;
    let playPromise: Promise<void> | null = null;

    const playAttempt = () => {
      if (!isPlaying) {
        playPromise = menuMusic.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              isPlaying = true;
            })
            .catch((err) => {
              console.log("Autoplay blocked, waiting for user interaction");
            });
        }
      }
    };

    playAttempt();

    // Fallback for autoplay policy
    window.addEventListener("click", playAttempt, { once: true });

    return () => {
      if (playPromise !== undefined && playPromise !== null) {
        playPromise
          .then(() => {
            menuMusic.pause();
            menuMusic.src = "";
          })
          .catch(() => {
            menuMusic.pause();
            menuMusic.src = "";
          });
      } else {
        menuMusic.pause();
        menuMusic.src = "";
      }
      window.removeEventListener("click", playAttempt);
    };
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
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-space.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay" />
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0.8, 1, 1.2],
                x: i % 2 === 0 ? [0, 60, 0] : [0, -60, 0],
                y: [0, -120, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                delay: i * 3,
                ease: "linear",
              }}
              className={`absolute ${
                i === 0
                  ? "top-[10%] left-[5%]"
                  : i === 1
                  ? "top-[20%] right-[10%]"
                  : i === 2
                  ? "top-[40%] left-[15%]"
                  : i === 3
                  ? "top-[60%] right-[5%]"
                  : i === 4
                  ? "bottom-[10%] left-[10%]"
                  : i === 5
                  ? "bottom-[20%] right-[20%]"
                  : i === 6
                  ? "bottom-[40%] left-[5%]"
                  : "bottom-[60%] right-[15%]"
              } w-72 h-[450px]`}
            >
              <Image
                src={img}
                alt="Hero"
                fill
                className="object-contain filter brightness-110 contrast-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation / Header Branding */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Image
              src="/assets/images/logos/cloud9-logo.png"
              alt="Cloud9"
              width={100}
              height={35}
              className="brightness-110"
            />
            <div className="h-6 w-px bg-white/20" />
            <Image
              src="/assets/images/logos/jetbrains-logo.png"
              alt="JetBrains"
              width={100}
              height={35}
              className="opacity-90 hover:opacity-100 transition-opacity"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400"
          >
            <Link
              href="/"
              className="text-white hover:text-white transition-colors"
            >
              Arena
            </Link>
            <Link
              href="/gallery"
              className="hover:text-white cursor-pointer transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/leaderboard"
              className="hover:text-white cursor-pointer transition-colors"
            >
              Leaderboard
            </Link>
            <a
              href="https://cloud9.devpost.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white cursor-pointer transition-colors"
            >
              Tournament
            </a>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <header className="px-8 pt-24 pb-20 text-center max-w-5xl mx-auto relative">
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

        <main className="container mx-auto px-8 pb-32">
          {/* Games Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-32">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GameCard
                title="Reflex Arena"
                description="High-intensity reaction test. Neutralize bugs, avoid traps, and sync with the system."
                icon=""
                href="/games/reflex"
                gradient="from-yellow-400 via-orange-500 to-red-500"
                brandIcon="/assets/images/logos/webstorm-logo.png"
                gameLogo="/assets/images/logos/game_logo/reflex_arena.png"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GameCard
                title="Jump Master"
                description="Traverse the digital void. Master momentum as you navigate the endless cloud pipeline."
                icon=""
                href="/games/jump"
                gradient="from-cyan-400 via-blue-500 to-indigo-600"
                brandIcon="/assets/images/logos/intellij-logo.png"
                gameLogo="/assets/images/logos/game_logo/jump_master.png"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GameCard
                title="Memory Match"
                description="Pattern recognition at scale. Link the identities of champions across the multiverse."
                icon=""
                href="/games/memory"
                gradient="from-purple-400 via-fuchsia-500 to-pink-600"
                brandIcon="/assets/images/logos/pycharm-logo.png"
                gameLogo="/assets/images/logos/game_logo/memory_match.png"
              />
            </motion.div>
          </div>

          {/* Leaderboard Section */}
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
        </main>

        <footer className="border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl py-16">
          <div className="container mx-auto px-8 text-center">
            <div className="flex justify-center items-center gap-12 mb-10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <Image
                src="/assets/images/logos/cloud9-logo.png"
                alt="C9"
                width={80}
                height={25}
              />
              <Image
                src="/assets/images/logos/jetbrains-logo.png"
                alt="JB"
                width={80}
                height={25}
              />
            </div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.3em] mb-4">
              Engineered for Performance
            </p>
            <p className="text-slate-600 text-xs">
              Sky’s the Limit
              <br />© 2026 Cloud9 x JetBrains Hackathon
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
