"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import FlagIcon from "@/app/components/FlagIcon";
import { isMobilePhone } from "@/app/utils/deviceDetection";
import { useMusic } from "@/app/components/MusicProvider";
import { api } from "@/app/lib/api";

// Dynamically import components only shown conditionally
const GameOverCard = dynamic(() => import("@/app/components/GameOverCard"), {
  ssr: false,
});
const MobileWarningModal = dynamic(
  () => import("@/app/components/MobileWarningModal"),
  {
    ssr: false,
  },
);

interface Target {
  id: number;
  x: number;
  y: number;
  type: "good" | "bad";
  image: string;
  value: number;
  spawnTime: number;
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  value: number;
  type: "good" | "bad";
}

const GOOD_TARGETS = [
  { image: "/assets/images/targets/target-star.png", value: 10 },
  { image: "/assets/images/targets/target-trophy.png", value: 50 },
  { image: "/assets/images/targets/target-gem.png", value: 30 },
  { image: "/assets/images/targets/target-coin.png", value: 20 },
];

const BAD_TARGETS = [
  { image: "/assets/images/targets/target-bug.png", value: -20 },
  { image: "/assets/images/targets/target-virus.png", value: -20 },
  { image: "/assets/images/targets/target-bomb.png", value: -20 },
];

export default function ReflexArenaPage() {
  const router = useRouter();
  const { playGameMusic, playVictoryMusic, stopAllMusic } = useMusic();
  const countryDropdownRef = useRef<HTMLDivElement>(null);
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
  const [timeLeft, setTimeLeft] = useState(50);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [nextId, setNextId] = useState(0);
  const [nextScoreId, setNextScoreId] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hasPlayedThisSession, setHasPlayedThisSession] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null); // NEW: Countdown state (3, 2, 1, 0=GO)

  // Load player ID from local storage if available
  useEffect(() => {
    const savedPlayerId = localStorage.getItem("junie_player_id");
    if (savedPlayerId) {
      setPlayerId(savedPlayerId);

      // Check if player has already played this game in this session
      const checkStatus = async () => {
        try {
          const response = await fetch(
            `/api/leaderboard?view=overall&playerId=${savedPlayerId}`,
          );
          const data = await response.json();
          if (data.currentPlayer && data.currentPlayer.reflexScore > 0) {
            setHasPlayedThisSession(true);
          }
        } catch (error) {
          console.error("Failed to check game status:", error);
        }
      };
      checkStatus();
    }
  }, []);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // Check for mobile phone on mount
  useEffect(() => {
    if (isMobilePhone()) {
      setShowMobileWarning(true);
    }
  }, []);

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

  // Play game music when game starts
  useEffect(() => {
    if (gameStarted && !gameOver) {
      stopAllMusic();
      playGameMusic();
      document.body.classList.add("hide-custom-cursor");
    } else {
      document.body.classList.remove("hide-custom-cursor");
    }

    return () => {
      document.body.classList.remove("hide-custom-cursor");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver]);

  // Play victory music when game ends
  useEffect(() => {
    if (gameOver) {
      stopAllMusic();
      playVictoryMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  // Audio helpers
  const playSound = (path: string, volume = 0.5) => {
    const audio = new Audio(path);
    audio.volume = volume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => console.error("Error playing sound:", e));
    }
  };

  // NEW: Countdown effect before game starts
  useEffect(() => {
    if (!gameStarted || gameOver || countdown === null) return;

    if (countdown > 0) {
      playSound("/assets/sounds/sfx/click.mp3", 0.3);
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Show "GO!" briefly then start the game
      playSound("/assets/sounds/sfx/pop.mp3", 0.5);
      const timer = setTimeout(() => {
        setCountdown(null); // Clear countdown to start game
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameOver, countdown]);

  // Game timer - only runs when countdown is complete (null)
  useEffect(() => {
    if (!gameStarted || gameOver || countdown !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          playSound("/assets/sounds/sfx/gameover.mp3", 0.6);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [gameStarted, gameOver, countdown]);

  // Spawn targets - only when countdown is complete
  useEffect(() => {
    if (!gameStarted || gameOver || countdown !== null) return;

    const spawnInterval = setInterval(() => {
      const isGood = Math.random() > 0.25;
      const targetList = isGood ? GOOD_TARGETS : BAD_TARGETS;
      const selected =
        targetList[Math.floor(Math.random() * targetList.length)];

      const newTarget: Target = {
        id: nextId,
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
        type: isGood ? "good" : "bad",
        image: selected.image,
        value: selected.value,
        spawnTime: Date.now(),
      };

      setNextId((prev) => prev + 1);
      setTargets((prev) => [...prev, newTarget]);

      setTimeout(() => {
        setTargets((prev) => prev.filter((t) => t.id !== newTarget.id));
      }, 1500);
    }, 500);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver, countdown, nextId]);

  const handleTargetClick = (target: Target, event: React.MouseEvent) => {
    const reactionTime = Date.now() - target.spawnTime;
    let points = target.value;

    if (target.type === "good") {
      playSound("/assets/sounds/sfx/pop.mp3", 0.4);
      if (reactionTime < 300) points *= 2;

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      const comboMultiplier = Math.min(newCombo, 5);
      points *= comboMultiplier;
    } else {
      playSound("/assets/sounds/sfx/error.mp3", 0.5);
      setCombo(0);
    }

    // Create floating score
    const rect = event.currentTarget.getBoundingClientRect();
    const gameContainer = document
      .getElementById("game-arena")
      ?.getBoundingClientRect();
    if (gameContainer) {
      const floatingScore: FloatingScore = {
        id: nextScoreId,
        x: rect.left - gameContainer.left + rect.width / 2,
        y: rect.top - gameContainer.top + rect.height / 2,
        value: points,
        type: target.type,
      };
      setFloatingScores((prev) => [...prev, floatingScore]);
      setNextScoreId((prev) => prev + 1);
      setTimeout(() => {
        setFloatingScores((prev) =>
          prev.filter((s) => s.id !== floatingScore.id),
        );
      }, 1000);
    }

    setScore((prev) => Math.max(0, prev + points));
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
  };

  const handleStart = async () => {
    if (username.trim() && country) {
      // If we already have a playerId, just start the game
      if (playerId) {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(50);
        setCombo(0);
        setMaxCombo(0);
        setTargets([]);
        setFloatingScores([]);
        setCountdown(3); // NEW: Start countdown from 3
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

          setGameStarted(true);
          setGameOver(false);
          setScore(0);
          setTimeLeft(50);
          setCombo(0);
          setMaxCombo(0);
          setTargets([]);
          setFloatingScores([]);
          setCountdown(3); // NEW: Start countdown from 3
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
    const lastSaved = localStorage.getItem("last_saved_score_reflex");
    const now = Date.now();
    if (lastSaved && now - parseInt(lastSaved) < 5000) {
      return;
    }

    setIsSaving(true);
    localStorage.setItem("last_saved_score_reflex", now.toString());

    try {
      const response = await api.post("/api/scores", {
        username,
        country,
        gameType: "REFLEX_ARENA",
        score,
        maxCombo,
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
    "/assets/images/hero/Jinx_Render.webp",
    "/assets/images/hero/Yasuo_Render.webp",
    "/assets/images/hero/Lux_Render.webp",
    "/assets/images/hero/Ezreal_Render.webp",
    "/assets/images/hero/Jett_Artwork_Full.webp",
    "/assets/images/hero/Phoenix_Artwork_Full.webp",
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-orange-500/30 overflow-hidden">
        {/* Animated Background - VALORANT/LoL Tactical Style */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <Image
              src="/assets/images/backgrounds/lol.webp"
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
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Diagonal Scan Lines */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 3px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Animated Scan Line - Horizontal */}
          <m.div
            animate={{ y: ["0%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] opacity-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, #ff4655, #fd4556, transparent)",
            }}
          />

          {/* Animated Orbs - VALORANT Colors */}
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
            <div className="w-full h-full bg-gradient-to-br from-yellow-500/30 to-orange-600/20 rounded-full" />
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
            <div className="w-full h-full bg-gradient-to-br from-red-600/30 to-[#ff4655]/20 rounded-full" />
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
                className={`absolute ${
                  i === 0
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
              src="/assets/images/junie/junie-happy.png"
              alt="Junie Happy"
              fill
              sizes="128px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_20px_rgba(251,146,60,0.6)]"
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
              src="/assets/images/junie/junie-jump.png"
              alt="Junie Jump"
              fill
              sizes="112px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]"
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
              className="object-contain drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]"
            />
          </m.div>

          {/* Corner Decorative Elements - Tactical HUD Style */}
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
            <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#ff4655] to-transparent" />
            <div className="absolute top-4 left-4 h-20 w-[1px] bg-gradient-to-b from-[#ff4655] to-transparent" />
            <div className="absolute top-8 left-8 text-[8px] font-black text-[#ff4655]/50 uppercase tracking-[0.3em]">
              RFX//
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
            <div className="absolute top-4 right-4 w-20 h-[1px] bg-gradient-to-l from-[#fd4556] to-transparent" />
            <div className="absolute top-4 right-4 h-20 w-[1px] bg-gradient-to-b from-[#fd4556] to-transparent" />
            <div className="absolute top-8 right-8 text-[8px] font-black text-[#fd4556]/50 uppercase tracking-[0.3em]">
              //ARENA
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
                    background:
                      "linear-gradient(135deg, rgba(255, 70, 85, 0.1), transparent)",
                    clipPath:
                      "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  <span className="text-[#ff4655] text-xl font-black">←</span>
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
                      background:
                        "linear-gradient(135deg, rgba(255, 70, 85, 0.1), transparent)",
                      clipPath:
                        "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
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
                    <div className="w-1 h-1 rotate-45 bg-[#ff4655]" />
                    <div className="h-5 sm:h-6 w-px bg-white/20" />
                    <div className="w-1 h-1 rotate-45 bg-[#fd4556]" />
                  </div>
                  <div
                    className="relative p-1.5 sm:p-2"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(253, 69, 86, 0.1), transparent)",
                      clipPath:
                        "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
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
                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-black text-[#ff4655]/60 uppercase tracking-[0.2em]">
                    Sky's the Limit
                  </div>
                  <div className="text-[10px] font-bold text-white/80">
                    Hackathon 2026
                  </div>
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
                  background:
                    "linear-gradient(135deg, rgba(255, 70, 85, 0.1), rgba(255, 70, 85, 0.05))",
                  border: "1px solid rgba(255, 70, 85, 0.3)",
                  clipPath:
                    "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4655] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4655]"></span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4655]">
                  High-Intensity Combat
                </span>
                {/* Animated scan line */}
                <m.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#ff4655]/20 to-transparent"
                />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 tracking-tighter leading-none italic">
                <span
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-orange-500 to-yellow-500"
                  style={{ textShadow: "0 0 60px rgba(255, 70, 85, 0.5)" }}
                >
                  REFLEX ARENA
                </span>
              </h1>

              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-[#ff4655]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#ff4655]" />
                <div className="w-6 sm:w-8 h-[1px] bg-white/30" />
                <div className="w-1.5 h-1.5 rotate-45 bg-orange-500" />
                <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-orange-500" />
              </div>

              <p className="text-xs sm:text-sm text-slate-400 font-bold max-w-2xl mx-auto uppercase tracking-wide">
                <span className="text-white">Neutralize bugs,</span> avoid
                traps, and sync with the system.
                <span className="text-[#ff4655]">
                  {" "}
                  Every millisecond counts.
                </span>
              </p>
            </m.div>

            {/* Username Input Screen */}
            {!gameStarted && !gameOver && (
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto"
              >
                <div
                  className="relative bg-[#0a0e13]/90 backdrop-blur-xl p-8 sm:p-12 border border-[#ff4655]/20 shadow-2xl overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
                  }}
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff4655] via-orange-500 to-yellow-500" />

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#ff4655] to-transparent" />
                    <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#ff4655] to-transparent" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-orange-500 to-transparent" />
                    <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-orange-500 to-transparent" />
                  </div>

                  {/* Hexagonal pattern background */}
                  <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
                      backgroundSize: "40px 40px",
                    }}
                  />

                  <div className="relative z-10 text-center mb-8">
                    {/* Hexagonal logo frame */}
                    <div className="inline-block p-6 mb-6 relative">
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          clipPath:
                            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          background:
                            "linear-gradient(135deg, rgba(255, 70, 85, 0.4), rgba(255, 165, 0, 0.2))",
                        }}
                      />
                      <div className="w-20 h-20 relative">
                        <Image
                          src="/assets/images/logos/game_logo/reflex_arena.png"
                          alt="Reflex Arena"
                          fill
                          sizes="80px"
                          priority
                          fetchPriority="high"
                          quality={70}
                          className="object-contain filter drop-shadow-[0_0_20px_rgba(255,70,85,0.5)]"
                        />
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight italic">
                      Enter Combat Zone
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      Identify yourself before deployment
                    </p>
                  </div>

                  <div className="relative z-10 space-y-4 mb-6">
                    {hasPlayedThisSession && (
                      <div
                        className="p-4 text-center mb-4"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))",
                          border: "1px solid rgba(239, 68, 68, 0.5)",
                          clipPath:
                            "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                        }}
                      >
                        <p className="text-red-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                          ⚠️ This game has already been played in this session.
                        </p>
                      </div>
                    )}
                    <div className="relative group">
                      <input
                        id="reflex-username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Name"
                        disabled={!!playerId}
                        className="w-full px-6 py-4 text-lg text-center border-2 border-[#ff4655]/30 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/50 focus:border-[#ff4655]/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          clipPath:
                            "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                        }}
                        maxLength={20}
                        autoComplete="name"
                        autoFocus
                      />
                      {playerId && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ff4655] text-xs font-black uppercase tracking-widest pointer-events-none">
                          Locked
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={countryDropdownRef}>
                      <input
                        id="reflex-country"
                        name="country"
                        type="text"
                        value={countrySearch}
                        onChange={(e) => {
                          setCountrySearch(e.target.value);
                          setShowCountryDropdown(true);
                        }}
                        onFocus={() =>
                          !playerId && setShowCountryDropdown(true)
                        }
                        placeholder={country || "Search your country"}
                        disabled={!!playerId}
                        className="w-full px-6 py-4 text-lg text-center border-2 border-[#ff4655]/30 bg-white/5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/50 focus:border-[#ff4655]/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          clipPath:
                            "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                        }}
                        autoComplete="country-name"
                      />
                      {playerId && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ff4655] text-xs font-black uppercase tracking-widest pointer-events-none">
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
                          className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-[#0a0e13]/98 backdrop-blur-xl border border-[#ff4655]/30 shadow-2xl"
                          style={{
                            clipPath:
                              "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                          }}
                        >
                          {countries
                            .filter((c) =>
                              c.name
                                .toLowerCase()
                                .includes(countrySearch.toLowerCase()),
                            )
                            .slice(0, 50)
                            .map((c) => (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => {
                                  setCountry(c.name);
                                  setCountrySearch("");
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full px-6 py-3 text-left hover:bg-[#ff4655]/20 transition-colors text-white flex items-center gap-3 border-b border-white/5 last:border-0"
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
                              .includes(countrySearch.toLowerCase()),
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
                    className="relative z-10 w-full text-white font-black py-4 sm:py-5 px-8 text-lg sm:text-xl uppercase tracking-[0.1em] transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff4655, #fd4556, #f97316)",
                      clipPath:
                        "polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)",
                      boxShadow:
                        username.trim() && country && !hasPlayedThisSession
                          ? "0 0 30px rgba(255, 70, 85, 0.4)"
                          : "none",
                    }}
                  >
                    {/* Animated scan line */}
                    <m.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span>▶</span>
                      {hasPlayedThisSession
                        ? "Combat Complete"
                        : "Deploy to Arena"}
                    </span>
                  </m.button>
                </div>
              </m.div>
            )}

            {/* Game Screen */}
            {gameStarted && !gameOver && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Player Info Bar */}
                <div className="flex items-center justify-center gap-2 mb-3 max-w-6xl mx-auto">
                  <div
                    className="bg-white/5 backdrop-blur-xl px-4 py-2 border border-white/10 flex items-center gap-3"
                    style={{
                      clipPath:
                        "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
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

                {/* Stats Bar */}
                <div className="flex justify-between items-center gap-3 sm:gap-4 md:gap-6 mb-3 max-w-6xl mx-auto flex-shrink-0 px-4 w-full">
                  <div
                    className="flex-1 bg-white/5 backdrop-blur-xl p-4 sm:p-5 border border-white/10"
                    style={{
                      clipPath:
                        "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                    }}
                  >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Score
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white italic">
                      {score.toLocaleString()}
                    </div>
                  </div>

                  <div
                    className="flex-1 bg-white/5 backdrop-blur-xl p-4 sm:p-5 border border-white/10"
                    style={{
                      clipPath:
                        "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                    }}
                  >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Combo
                    </div>
                    <div className="flex items-center gap-1">
                      <m.div
                        key={combo}
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 1 }}
                        className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 italic"
                      >
                        {combo}x
                      </m.div>
                      {combo >= 5 && (
                        <m.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-lg"
                        >
                          🔥
                        </m.span>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex-1 bg-white/5 backdrop-blur-xl p-4 sm:p-5 border border-white/10"
                    style={{
                      clipPath:
                        "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                    }}
                  >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Time
                    </div>
                    <div
                      className={`text-2xl sm:text-3xl font-black transition-colors italic ${
                        timeLeft < 10
                          ? "text-red-400 animate-pulse"
                          : "text-white"
                      }`}
                    >
                      {timeLeft}s
                    </div>
                  </div>
                </div>

                {/* Game Arena */}
                <div
                  id="game-arena"
                  className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm h-[52vh] overflow-hidden border-2 border-white/10 shadow-2xl max-w-6xl mx-auto"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
                  }}
                >
                  {/* Grid Pattern Overlay */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                      backgroundSize: "50px 50px",
                    }}
                  />

                  {/* Targets */}
                  <AnimatePresence>
                    {targets.map((target) => (
                      <m.div
                        key={target.id}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                        }}
                        exit={{ scale: 0, rotate: 180, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="absolute cursor-pointer"
                        style={{
                          left: `${target.x}%`,
                          top: `${target.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={(e) => handleTargetClick(target, e)}
                      >
                        <m.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          className={`relative ${
                            target.type === "good"
                              ? "drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                              : "drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                          }`}
                        >
                          <Image
                            src={target.image}
                            alt="Target"
                            width={60}
                            height={60}
                            className="transition-all"
                          />
                          {target.type === "good" && (
                            <m.div
                              className="absolute inset-0 border-4 border-green-400 rounded-full"
                              initial={{ scale: 1, opacity: 0.8 }}
                              animate={{ scale: 1.5, opacity: 0 }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </m.div>
                      </m.div>
                    ))}
                  </AnimatePresence>

                  {/* Floating Scores */}
                  <AnimatePresence>
                    {floatingScores.map((floatingScore) => (
                      <m.div
                        key={floatingScore.id}
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -80, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute pointer-events-none font-black text-3xl"
                        style={{
                          left: floatingScore.x,
                          top: floatingScore.y,
                          color:
                            floatingScore.type === "good"
                              ? "#22c55e"
                              : "#ef4444",
                          textShadow: "0 0 20px currentColor",
                        }}
                      >
                        {floatingScore.value > 0 ? "+" : ""}
                        {floatingScore.value}
                      </m.div>
                    ))}
                  </AnimatePresence>

                  {/* NEW: Countdown Display (3-2-1-GO) */}
                  {countdown !== null && (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
                    >
                      <div className="text-center">
                        {/* Instructions */}
                        <m.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8"
                        >
                          <div className="bg-black/80 backdrop-blur-xl px-8 py-4 rounded-2xl border-2 border-white/20 inline-block">
                            <div className="text-xl font-bold text-white mb-1">
                              Click GOOD targets ⭐ 🏆 💎 🪙
                            </div>
                            <div className="text-lg text-red-400">
                              Avoid BAD targets 🐛 🦠 💣
                            </div>
                          </div>
                        </m.div>

                        {/* Countdown Number */}
                        <m.div
                          key={countdown}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                          className={`text-[150px] font-black leading-none ${
                            countdown === 0
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                          style={{
                            textShadow:
                              countdown === 0
                                ? "0 0 60px rgba(74, 222, 128, 0.8)"
                                : "0 0 60px rgba(250, 204, 21, 0.8)",
                          }}
                        >
                          {countdown === 0 ? "GO!" : countdown}
                        </m.div>
                      </div>
                    </m.div>
                  )}
                </div>
              </m.div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <GameOverCard
                username={username}
                country={country}
                score={score}
                gameType="REFLEX_ARENA"
                stats={[
                  {
                    label: "Final Score",
                    value: score.toLocaleString(),
                    color: "text-yellow-400",
                  },
                  {
                    label: "Max Combo",
                    value: `${maxCombo}x`,
                    color: "text-orange-400",
                  },
                  ...(score > 5000
                    ? [
                        {
                          label: "Achievement",
                          value: "🌟 Elite",
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
          gameName="Reflex Arena"
          gradient="from-yellow-400 via-orange-500 to-red-500"
          onClose={() => {
            clearSession();
            router.push("/");
          }}
        />
      </div>
    </LazyMotion>
  );
}
