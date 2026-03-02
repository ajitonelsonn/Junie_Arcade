"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LazyMotion, domAnimation, m } from "framer-motion";
import FlagIcon from "@/app/components/FlagIcon";
import { isMobilePhone } from "@/app/utils/deviceDetection";
import { useMusic } from "@/app/components/MusicProvider";
import { api } from "@/app/lib/api";

// Dynamically import components only shown conditionally
const GameOverCard = dynamic(() => import("@/app/components/GameOverCard"), {
  ssr: false,
});
const MobileWarningModal = dynamic(() => import("@/app/components/MobileWarningModal"), {
  ssr: false,
});

export default function JumpMasterPage() {
  const router = useRouter();
  const { stopMenuMusic, playVictoryMusic, stopAllMusic } = useMusic();
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState<
    Array<{ name: string; flag: string; code: string }>
  >([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hasPlayedThisSession, setHasPlayedThisSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Load player ID from local storage if available
  useEffect(() => {
    const savedPlayerId = localStorage.getItem("junie_player_id");
    if (savedPlayerId) {
      setPlayerId(savedPlayerId);

      // Check if player has already played this game in this session
      const checkStatus = async () => {
        try {
          const response = await fetch(
            `/api/leaderboard?view=overall&playerId=${savedPlayerId}`
          );
          const data = await response.json();
          if (data.currentPlayer && data.currentPlayer.jumpScore > 0) {
            setHasPlayedThisSession(true);
          }
        } catch (error) {
          console.error("Failed to check game status:", error);
        }
      };
      checkStatus();
    }
  }, []);
  const [JumpMasterScene, setJumpMasterScene] = useState<any>(null);
  const [PhaserGame, setPhaserGame] = useState<any>(null);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // Check for mobile phone on mount
  useEffect(() => {
    if (isMobilePhone()) {
      setShowMobileWarning(true);
    }
  }, []);

  // Defer loading PhaserGame and JumpMasterScene until game starts to reduce initial bundle
  useEffect(() => {
    if (gameStarted && !JumpMasterScene) {
      Promise.all([
        import("@/app/components/PhaserGame"),
        import("@/app/lib/phaser/JumpMasterScene"),
      ]).then(([phaserMod, sceneMod]) => {
        setPhaserGame(() => phaserMod.default);
        setJumpMasterScene(() => sceneMod.default);
      });
    }
  }, [gameStarted, JumpMasterScene]);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };
    fetchCountries();

    // Check for saved credentials
    const savedUsername = localStorage.getItem("junie_username");
    const savedCountry = localStorage.getItem("junie_country");
    if (savedUsername && !username) {
      setUsername(savedUsername);
    }
    if (savedCountry && !country) {
      setCountry(savedCountry);
      // Also update search to reflect saved country
      setCountrySearch(savedCountry);
    }
  }, [username, country]);

  // Clear player session if finishing or exiting
  const clearSession = () => {
    setPlayerId(null);
    localStorage.removeItem("junie_player_id");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Stop menu music when game starts (Phaser handles its own game music)
  useEffect(() => {
    if (gameStarted && !gameOver) {
      stopAllMusic();
      document.body.classList.add('hide-custom-cursor');
    } else {
      document.body.classList.remove('hide-custom-cursor');
    }

    return () => {
      document.body.classList.remove('hide-custom-cursor');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver]);

  // Play victory music when game ends
  useEffect(() => {
    if (gameOver) {
      playVictoryMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  const handleGameEnd = (finalScore: number, finalDistance: number) => {
    setScore(finalScore);
    setDistance(finalDistance);
    setGameOver(true);
    setGameStarted(false);
  };

  const phaserConfig: any = {
    type: 0, // Phaser.AUTO is 0
    width: 1000,
    height: 450,
    backgroundColor: "#87ceeb",
    parent: "phaser-game-container",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
  };

  // Preload all game resources (images + audio) before starting
  const preloadResources = async (): Promise<void> => {
    const imageAssets = [
      // Junie sprites
      "/assets/images/junie/junie-idle.png",
      "/assets/images/junie/junie-run-1.png",
      "/assets/images/junie/junie-run-2.png",
      "/assets/images/junie/junie-run-3.png",
      "/assets/images/junie/junie-jump.png",
      "/assets/images/junie/junie-sad.png",
      "/assets/images/junie/junie-happy.png",
      // Game assets
      "/assets/images/backgrounds/Gemini_Generated_Image_4crhid4crhid4crh.webp",
      "/assets/images/targets/target-bug.png",
      "/assets/images/targets/target-coin.png",
      "/assets/images/logos/cloud9-icon.png",
    ];

    const audioAssets = [
      "/assets/sounds/sfx/jump.mp3",
      "/assets/sounds/sfx/coin.mp3",
      "/assets/sounds/sfx/gameover.mp3",
      "/assets/sounds/music/music-game.mp3",
      "/assets/sounds/music/music-victory.mp3",
    ];

    const totalAssets = imageAssets.length + audioAssets.length;
    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      setLoadProgress(Math.round((loaded / totalAssets) * 100));
    };

    // Preload images (blocking — wait for all)
    const imagePromises = imageAssets.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            updateProgress();
            resolve();
          };
          img.onerror = () => {
            updateProgress();
            resolve();
          };
          img.src = src;
        }),
    );

    // Preload audio (non-blocking — fire and forget)
    audioAssets.forEach((src) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = src;
      updateProgress();
    });

    await Promise.all(imagePromises);
  };

  const startGameAfterLoad = () => {
    setIsLoading(false);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setDistance(0);
  };

  const handleStart = async () => {
    if (username.trim() && country) {
      // If we already have a playerId, just load resources and start
      if (playerId) {
        setIsLoading(true);
        setLoadProgress(0);
        await preloadResources();
        startGameAfterLoad();
        return;
      }

      setIsSaving(true);
      try {
        const response = await api.post("/api/players", { username, country });
        const data = await response.json();
        if (data.playerId) {
          setPlayerId(data.playerId);
          localStorage.setItem("junie_player_id", data.playerId);
          localStorage.setItem("junie_username", username);
          localStorage.setItem("junie_country", country);

          setIsLoading(true);
          setLoadProgress(0);
          await preloadResources();
          startGameAfterLoad();
        }
      } catch (error) {
        console.error("Failed to create player session:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveScore = async () => {
    if (!username || !country || isSaving) return;

    // Check if score was already saved recently to prevent duplicates
    const lastSaved = localStorage.getItem("last_saved_score_jump");
    const now = Date.now();
    if (lastSaved && now - parseInt(lastSaved) < 5000) {
      return;
    }

    setIsSaving(true);
    localStorage.setItem("last_saved_score_jump", now.toString());

    try {
      const response = await api.post("/api/scores", {
        username,
        country,
        gameType: "JUMP_MASTER",
        score,
        distance,
        playerId,
      });
      const data = await response.json();
      if (data.playerId) {
        setPlayerId(data.playerId);
        localStorage.setItem("junie_player_id", data.playerId);
        localStorage.setItem("junie_username", username);
        localStorage.setItem("junie_country", country);
      }
      // No longer redirecting automatically here, as it's auto-saved in GameOverCard
    } catch (error) {
      console.error("Failed to auto-save score:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const heroImages = [
    "/assets/images/hero/APA.png",
    "/assets/images/hero/Blaber.png",
    "/assets/images/hero/Thanatos.png",
    "/assets/images/hero/Xeppaa.png",
    "/assets/images/hero/Zellsis.png",
    "/assets/images/hero/Zven.png",
    "/assets/images/hero/penny.png",
    "/assets/images/hero/v1c.png",
    "/assets/images/hero/oxy.png",
    "/assets/images/hero/vulcan.png",
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-hidden">
        {/* Animated Background - VALORANT/LoL Tactical Style */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <Image
              src="/assets/images/backgrounds/Gemini_Generated_Image_4crhid4crhid4crh.webp"
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
            style={{ background: 'linear-gradient(90deg, transparent, #00eeff, #00eeff, transparent)' }}
          />

          {/* Animated Orbs - Cloud9/Cyan Colors */}
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
            <div className="w-full h-full bg-gradient-to-br from-[#00eeff]/40 to-blue-600/20 rounded-full" />
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
            <div className="w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-600/20 rounded-full" />
          </m.div>
          <m.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
            className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-[#00eeff]/20 rounded-full" />
          </m.div>

          {/* Floating Hero Characters - Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            {heroImages.map((img, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0.8, 1, 1.2],
                  x: i % 2 === 0 ? [0, 50, 0] : [0, -50, 0],
                  y: [0, -100, 0],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  delay: i * 3,
                  ease: "linear",
                }}
                className={`absolute ${i === 0
                  ? "top-[15%] left-[8%]"
                  : i === 1
                    ? "top-[25%] right-[12%]"
                    : i === 2
                      ? "top-[50%] left-[5%]"
                      : i === 3
                        ? "top-[70%] right-[8%]"
                        : i === 4
                          ? "bottom-[15%] left-[15%]"
                          : "bottom-[30%] right-[10%]"
                  } w-64 h-[400px]`}
              >
                <Image
                  src={img}
                  alt="Hero"
                  fill
                  sizes="(max-width: 768px) 200px, 256px"
                  loading="lazy"
                  quality={50}
                  className="object-contain filter brightness-110 contrast-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                />
              </m.div>
            ))}
          </div>

          {/* Floating Junie Mascots */}
          <m.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[20%] left-[3%] w-32 h-32 pointer-events-none opacity-60"
          >
            <Image
              src="/assets/images/junie/junie-jump.png"
              alt="Junie Jump"
              fill
              sizes="128px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_20px_rgba(0,238,255,0.6)]"
            />
          </m.div>

          <m.div
            animate={{
              y: [0, -25, 0],
              rotate: [0, -10, 10, 0],
              x: [0, -15, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-[25%] right-[5%] w-28 h-28 pointer-events-none opacity-50"
          >
            <Image
              src="/assets/images/junie/junie-happy.png"
              alt="Junie Happy"
              fill
              sizes="112px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
          </m.div>

          <m.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 8, -8, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-[60%] left-[10%] w-24 h-24 pointer-events-none opacity-50"
          >
            <Image
              src="/assets/images/junie/junie-idle.png"
              alt="Junie Idle"
              fill
              sizes="96px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_15px_rgba(0,238,255,0.4)]"
            />
          </m.div>

          {/* Corner Decorative Elements - Tactical HUD Style */}
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
            <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#00eeff] to-transparent" />
            <div className="absolute top-4 left-4 h-20 w-[1px] bg-gradient-to-b from-[#00eeff] to-transparent" />
            <div className="absolute top-8 left-8 text-[8px] font-black text-[#00eeff]/50 uppercase tracking-[0.3em]">
              JMP//
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
            <div className="absolute top-4 right-4 w-20 h-[1px] bg-gradient-to-l from-[#00eeff] to-transparent" />
            <div className="absolute top-4 right-4 h-20 w-[1px] bg-gradient-to-b from-[#00eeff] to-transparent" />
            <div className="absolute top-8 right-8 text-[8px] font-black text-[#00eeff]/50 uppercase tracking-[0.3em]">
            //MASTER
            </div>
          </div>
        </div>

        <div className="relative z-10">
          {/* Header - Tactical Style */}
          <nav className="relative px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
            {/* Background blur bar */}
            <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md border-b border-white/5" />

            <div className="relative z-10 flex justify-between items-center">
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link
                  href="/"
                  className="group relative px-4 py-2 flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), transparent)',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  <span className="text-[#00eeff] text-xl font-black">←</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-white transition-colors">
                    Back to Arena
                  </span>
                </Link>
              </m.div>
              <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="relative p-1.5 sm:p-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), transparent)',
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                    }}
                  >
                    <Image
                      src="/assets/images/logos/cloud9-logo.png"
                      alt="Cloud9"
                      width={60}
                      height={20}
                      sizes="60px"
                      style={{ width: "auto", height: "auto" }}
                      className="brightness-110 w-12 sm:w-[60px]"
                    />
                  </div>
                  {/* Divider */}
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rotate-45 bg-[#00eeff]" />
                    <div className="h-5 sm:h-6 w-px bg-white/20" />
                    <div className="w-1 h-1 rotate-45 bg-[#00eeff]" />
                  </div>
                  <div
                    className="relative p-1.5 sm:p-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), transparent)',
                      clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                    }}
                  >
                    <Image
                      src="/assets/images/logos/jetbrains-logo.png"
                      alt="JetBrains"
                      width={60}
                      height={20}
                      sizes="60px"
                      style={{ width: "auto", height: "auto" }}
                      className="opacity-90 w-12 sm:w-[60px]"
                    />
                  </div>
                </div>
                <button
                  onClick={toggleFullscreen}
                  tabIndex={-1}
                  className="relative p-2 sm:p-2.5 group transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.15), rgba(0, 238, 255, 0.05))',
                    border: '1px solid rgba(0, 238, 255, 0.3)',
                    clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)'
                  }}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#00eeff] group-hover:text-white transition-colors"
                  >
                    {isFullscreen ? (
                      <>
                        <polyline points="4 14 4 20 10 20" />
                        <polyline points="20 10 20 4 14 4" />
                        <line x1="14" y1="10" x2="20" y2="4" />
                        <line x1="4" y1="20" x2="10" y2="14" />
                      </>
                    ) : (
                      <>
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </>
                    )}
                  </svg>
                </button>
                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-black text-[#00eeff]/60 uppercase tracking-[0.2em]">
                    Sky's the Limit
                  </div>
                  <div className="text-[10px] font-bold text-white/80">Hackathon 2026</div>
                </div>
              </m.div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="px-4 sm:px-8 pb-4 max-w-7xl mx-auto">
            {/* Title Section - Tactical Style */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              {/* Tactical Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 mb-3 backdrop-blur-md relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), rgba(0, 238, 255, 0.05))',
                  border: '1px solid rgba(0, 238, 255, 0.3)',
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00eeff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00eeff]"></span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#00eeff]">
                  Endless Pipeline
                </span>
                {/* Animated scan line */}
                <m.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#00eeff]/20 to-transparent"
                />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 tracking-tighter leading-none italic">
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00eeff] via-blue-500 to-indigo-600"
                  style={{ textShadow: '0 0 60px rgba(0, 238, 255, 0.5)' }}
                >
                  JUMP MASTER
                </span>
              </h1>

              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-[#00eeff]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#00eeff]" />
                <div className="w-6 sm:w-8 h-[1px] bg-white/30" />
                <div className="w-1.5 h-1.5 rotate-45 bg-blue-500" />
                <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-blue-500" />
              </div>

              <p className="text-xs sm:text-sm text-slate-400 font-bold max-w-2xl mx-auto uppercase tracking-wide">
                <span className="text-white">Traverse the digital void.</span> Master momentum
                as you navigate
                <span className="text-[#00eeff]">
                  {" "}
                  the endless cloud pipeline.
                </span>
              </p>
            </m.div>

            {/* Username Input Screen */}
            {!gameStarted && !gameOver && !isLoading && (
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto"
              >
                <div
                  className="relative bg-[#0a0e13]/90 backdrop-blur-xl p-8 sm:p-12 border border-[#00eeff]/20 shadow-2xl overflow-hidden"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                  }}
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00eeff] via-blue-500 to-indigo-600" />

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00eeff] to-transparent" />
                    <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#00eeff] to-transparent" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-blue-500 to-transparent" />
                    <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-blue-500 to-transparent" />
                  </div>

                  {/* Hexagonal pattern background */}
                  <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                  }} />

                  <div className="relative z-10 text-center mb-8">
                    {/* Hexagonal logo frame */}
                    <div className="inline-block p-6 mb-6 relative">
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                          background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.4), rgba(59, 130, 246, 0.2))'
                        }}
                      />
                      <div className="w-20 h-20 relative">
                        <Image
                          src="/assets/images/logos/game_logo/jump_master.png"
                          alt="Jump Master"
                          fill
                          sizes="80px"
                          priority
                          fetchPriority="high"
                          quality={70}
                          className="object-contain filter drop-shadow-[0_0_20px_rgba(0,238,255,0.5)]"
                        />
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight italic">
                      Initialize Runner
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      Enter credentials to begin deployment
                    </p>
                  </div>

                  <div className="relative z-30 space-y-4 mb-6">
                    {hasPlayedThisSession && (
                      <div
                        className="p-4 text-center mb-4"
                        style={{
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                        }}
                      >
                        <p className="text-red-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                          ⚠️ This game has already been played in this session.
                        </p>
                      </div>
                    )}
                    <div className="relative group">
                      <input
                        id="jump-username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Name"
                        disabled={!!playerId}
                        className="w-full px-6 py-4 text-lg text-left border-2 border-[#00eeff]/30 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00eeff]/50 focus:border-[#00eeff]/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                        }}
                        maxLength={20}
                        autoComplete="name"
                        autoFocus
                      />
                      {playerId && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00eeff] text-xs font-black uppercase tracking-widest pointer-events-none">
                          Locked
                        </div>
                      )}
                    </div>

                    <div className="relative z-20" ref={countryDropdownRef}>
                      <input
                        id="jump-country"
                        name="country"
                        type="text"
                        value={countrySearch}
                        onChange={(e) => {
                          setCountrySearch(e.target.value);
                          setShowCountryDropdown(true);
                        }}
                        onFocus={() => !playerId && setShowCountryDropdown(true)}
                        placeholder={country || "Search your country"}
                        disabled={!!playerId}
                        className="w-full pl-14 pr-6 py-4 text-lg text-left border-2 border-[#00eeff]/30 bg-white/5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00eeff]/50 focus:border-[#00eeff]/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                        }}
                        autoComplete="country-name"
                      />
                      {playerId && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00eeff] text-xs font-black uppercase tracking-widest pointer-events-none">
                          Locked
                        </div>
                      )}
                      {country && (
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                          <FlagIcon
                            code={
                              countries.find((c) => c.name === country)?.code ||
                              "US"
                            }
                            className="w-8 h-5"
                          />
                        </div>
                      )}
                      {showCountryDropdown && (
                        <div
                          className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-[#0a0e13] backdrop-blur-xl border border-[#00eeff]/30 shadow-2xl rounded-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {countries
                            .filter((c) =>
                              c.name
                                .toLowerCase()
                                .includes(countrySearch.toLowerCase())
                            )
                            .slice(0, 100)
                            .map((c) => (
                              <button
                                key={c.name}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCountry(c.name);
                                  setCountrySearch("");
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full px-6 py-3 text-left hover:bg-[#00eeff]/20 transition-colors text-white flex items-center gap-3 border-b border-white/5 last:border-0"
                              >
                                <FlagIcon
                                  code={c.code}
                                  className="w-8 h-5"
                                  animate={false}
                                />
                                <span>{c.name}</span>
                              </button>
                            ))}
                          {countries.filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(countrySearch.toLowerCase())
                          ).length === 0 && (
                              <div className="px-6 py-4 text-center text-slate-400">
                                No countries found
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deploy Button - Tactical Style */}
                  <m.button
                    onClick={handleStart}
                    disabled={
                      !username.trim() || !country || hasPlayedThisSession
                    }
                    whileHover={
                      username.trim() && country && !hasPlayedThisSession
                        ? { scale: 1.02, y: -2 }
                        : {}
                    }
                    whileTap={
                      username.trim() && country && !hasPlayedThisSession
                        ? { scale: 0.98 }
                        : {}
                    }
                    className="relative z-0 w-full text-white font-black py-4 sm:py-5 px-8 text-lg sm:text-xl uppercase tracking-[0.1em] transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #00eeff, #3b82f6, #6366f1)',
                      clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)',
                      boxShadow: username.trim() && country && !hasPlayedThisSession
                        ? '0 0 30px rgba(0, 238, 255, 0.4)'
                        : 'none'
                    }}
                  >
                    {/* Animated scan line */}
                    <m.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span>▶</span>
                      {hasPlayedThisSession ? "Protocol Complete" : "Deploy Runner"}
                    </span>
                  </m.button>
                </div>
              </m.div>
            )}

            {/* Loading Screen — Preloading Resources */}
            {isLoading && !gameStarted && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-lg mx-auto text-center py-20"
              >
                <div
                  className="relative bg-[#0a0e13]/90 backdrop-blur-xl p-10 sm:p-14 border border-[#00eeff]/20 shadow-2xl overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
                  }}
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00eeff] via-blue-500 to-indigo-600" />

                  {/* Animated scan line */}
                  <m.div
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00eeff] to-transparent opacity-40 pointer-events-none"
                  />

                  {/* Status badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 backdrop-blur-md"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0, 238, 255, 0.1), rgba(0, 238, 255, 0.05))",
                      border: "1px solid rgba(0, 238, 255, 0.3)",
                      clipPath:
                        "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00eeff] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00eeff]" />
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00eeff]">
                      Preparing Pipeline
                    </span>
                  </div>

                  <p className="text-sm text-white/40 font-bold uppercase tracking-widest mb-6">
                    Loading Game Resources...
                  </p>

                  {/* Progress bar */}
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                    <m.div
                      className="h-full bg-gradient-to-r from-[#00eeff] to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-white/30 font-bold uppercase tracking-wider">
                    {loadProgress}% — Sprites & Audio
                  </p>
                </div>
              </m.div>
            )}

            {/* Loading Screen - while Phaser engine initializes */}
            {gameStarted && !gameOver && (!JumpMasterScene || !PhaserGame) && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div
                  className="relative bg-[#0a0e13]/90 backdrop-blur-xl p-12 border border-[#00eeff]/20 shadow-2xl text-center"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                  }}
                >
                  <div className="w-16 h-16 border-4 border-[#00eeff]/30 border-t-[#00eeff] rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-lg font-black text-white mb-2 uppercase italic">Initializing Game Engine</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading Phaser assets...</p>
                </div>
              </m.div>
            )}

            {/* Game Screen */}
            {gameStarted && !gameOver && JumpMasterScene && PhaserGame && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Player Info Bar */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div
                    className="bg-white/5 backdrop-blur-xl px-4 py-2 border border-white/10 flex items-center gap-3"
                    style={{
                      clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                    }}
                  >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Player
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white uppercase italic">
                        {username}
                      </span>
                      <span className="text-2xl">
                        {countries.find((c) => c.name === country)?.flag}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="relative bg-white/5 backdrop-blur-xl p-3 border border-white/10 shadow-2xl max-w-5xl mx-auto"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 32px 100%, 0 calc(100% - 32px))'
                  }}
                >
                  <div
                    id="phaser-game-container"
                    className="overflow-hidden border-2 border-white/10"
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                    }}
                  >
                    <PhaserGame
                      config={{
                        ...phaserConfig,
                        scene: [
                          {
                            key: "BootScene",
                            create: function (this: any) {
                              this.scene.start("JumpMasterScene", {
                                onGameEnd: handleGameEnd,
                              });
                            },
                          },
                          JumpMasterScene,
                        ],
                      }}
                    />
                  </div>
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-3 text-white text-sm font-bold bg-white/5 px-6 py-2 backdrop-blur-sm border border-white/10"
                    style={{
                      clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">⌨️</span>
                      <span className="uppercase tracking-wide">
                        Press{" "}
                        <span className="text-[#00eeff] font-black">SPACE</span> or{" "}
                        <span className="text-[#00eeff] font-black">CLICK</span> to
                        Jump!
                      </span>
                    </div>
                  </m.div>
                </div>
              </m.div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <GameOverCard
                username={username}
                country={country}
                score={score}
                gameType="JUMP_MASTER"
                stats={[
                  {
                    label: "Final Score",
                    value: score.toLocaleString(),
                    color: "text-cyan-400",
                  },
                  {
                    label: "Distance",
                    value: `${distance}m`,
                    color: "text-blue-400",
                  },
                  ...(distance > 1000
                    ? [
                      {
                        label: "Achievement",
                        value: "🌟 Marathon",
                        color: "text-yellow-400",
                      },
                    ]
                    : []),
                ]}
                onSaveScore={handleSaveScore}
                isSaving={isSaving}
              />
            )}
          </div>
        </div>

        {/* Mobile Warning Modal */}
        <MobileWarningModal
          isOpen={showMobileWarning}
          gameName="Jump Master"
          gradient="from-cyan-400 via-blue-500 to-indigo-600"
          onClose={() => {
            clearSession();
            router.push("/");
          }}
        />
      </div>
    </LazyMotion>
  );
}
