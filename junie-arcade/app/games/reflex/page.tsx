"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GameOverCard from "@/app/components/GameOverCard";
import FlagIcon from "@/app/components/FlagIcon";
import MobileWarningModal from "@/app/components/MobileWarningModal";
import { isMobilePhone } from "@/app/utils/deviceDetection";
import { useMusic } from "@/app/components/MusicProvider";

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
  const { playGameMusic, playVictoryMusic } = useMusic();
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
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [nextId, setNextId] = useState(0);
  const [nextScoreId, setNextScoreId] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hasPlayedThisSession, setHasPlayedThisSession] = useState(false);

  // Load player ID from local storage if available
  useEffect(() => {
    const savedPlayerId = localStorage.getItem("junie_player_id");
    if (savedPlayerId) {
      setPlayerId(savedPlayerId);

      // Check if player has already played this game in this session
      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/leaderboard?view=overall&playerId=${savedPlayerId}`);
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
      playGameMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver]);

  // Play victory music when game ends
  useEffect(() => {
    if (gameOver) {
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

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

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
  }, [gameStarted, gameOver]);


  // Spawn targets
  useEffect(() => {
    if (!gameStarted || gameOver) return;

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
    }, 600);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver, nextId]);

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
          prev.filter((s) => s.id !== floatingScore.id)
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
        setTimeLeft(60);
        setCombo(0);
        setMaxCombo(0);
        setTargets([]);
        setFloatingScores([]);
        return;
      }

      setIsSaving(true);
      try {
        const response = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, country }),
        });
        const data = await response.json();
        if (data.playerId) {
          setPlayerId(data.playerId);
          localStorage.setItem("junie_player_id", data.playerId);
          localStorage.setItem("junie_username", username);
          localStorage.setItem("junie_country", country);

          setGameStarted(true);
          setGameOver(false);
          setScore(0);
          setTimeLeft(60);
          setCombo(0);
          setMaxCombo(0);
          setTargets([]);
          setFloatingScores([]);
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
      console.log("Score save debounced (client)");
      return;
    }
    
    setIsSaving(true);
    localStorage.setItem("last_saved_score_reflex", now.toString());

    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          country,
          gameType: "REFLEX_ARENA",
          score,
          maxCombo,
          playerId,
        }),
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
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-orange-500/30 overflow-hidden">
      {/* Animated Background - Matching Home Page Style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-tech.jpg')] opacity-30 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 120, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-orange-600/30 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-yellow-500/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px]"
        />

        {/* Floating Hero Characters - Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          {heroImages.map((img, i) => (
            <motion.div
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
                sizes="256px"
                className="object-contain filter brightness-110 contrast-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              />
            </motion.div>
          ))}
        </div>

        {/* Floating Junie Mascots */}
        <motion.div
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
            className="object-contain drop-shadow-[0_0_20px_rgba(251,146,60,0.6)]"
          />
        </motion.div>

        <motion.div
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
            className="object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]"
          />
        </motion.div>

        <motion.div
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
            className="object-contain drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]"
          />
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-3xl">←</span>
              <span className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                Back to Arena
              </span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/assets/images/logos/cloud9-logo.png"
                alt="Cloud9"
                width={70}
                height={24}
                style={{ width: "auto", height: "auto" }}
                className="brightness-110"
              />
              <div className="h-6 w-px bg-white/20" />
              <Image
                src="/assets/images/logos/jetbrains-logo.png"
                alt="JetBrains"
                width={70}
                height={24}
                style={{ width: "auto", height: "auto" }}
                className="opacity-90"
              />
            </div>
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Sky's the Limit
              </div>
              <div className="text-xs font-bold text-white">Hackathon 2026</div>
            </div>
          </motion.div>
        </nav>

        {/* Main Content */}
        <div className="px-8 pb-4 max-w-7xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                High-Intensity Combat
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter leading-none">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                REFLEX ARENA
              </span>
            </h1>

            <p className="text-sm text-slate-400 font-medium max-w-2xl mx-auto">
              <span className="text-white">Neutralize bugs,</span> avoid traps,
              and sync with the system.
              <span className="text-orange-400">
                {" "}
                Every millisecond counts.
              </span>
            </p>
          </motion.div>

          {/* Username Input Screen */}
          {!gameStarted && !gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-block p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl mb-6">
                    <div className="w-20 h-20 relative">
                      <Image
                        src="/assets/images/logos/game_logo/reflex_arena.png"
                        alt="Reflex Arena"
                        fill
                        className="object-contain filter drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]"
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">
                    Enter Combat Zone
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Identify yourself before deployment
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {hasPlayedThisSession && (
                    <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-center mb-4">
                      <p className="text-red-400 font-bold text-sm uppercase tracking-wider">
                        ⚠️ This game has already been played in this session.
                      </p>
                    </div>
                  )}
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Name"
                      disabled={!!playerId}
                      className="w-full px-6 py-4 rounded-2xl text-lg text-center border-2 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      maxLength={20}
                      autoFocus
                    />
                    {playerId && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 text-xs font-black uppercase tracking-widest pointer-events-none">
                        Locked
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={countryDropdownRef}>
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setShowCountryDropdown(true);
                      }}
                      onFocus={() => !playerId && setShowCountryDropdown(true)}
                      placeholder={country ? country : "Search your country"}
                      disabled={!!playerId}
                      className="w-full px-6 py-4 rounded-2xl text-lg text-center border-2 border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {playerId && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 text-xs font-black uppercase tracking-widest pointer-events-none">
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
                      <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-2 border-white/10 rounded-2xl shadow-2xl">
                        {countries
                          .filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(countrySearch.toLowerCase())
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
                              className="w-full px-6 py-3 text-left hover:bg-orange-500/20 transition-colors text-white flex items-center gap-3"
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

                <motion.button
                  onClick={handleStart}
                  disabled={!username.trim() || !country || hasPlayedThisSession}
                  whileHover={username.trim() && country && !hasPlayedThisSession ? { scale: 1.02 } : {}}
                  whileTap={username.trim() && country && !hasPlayedThisSession ? { scale: 0.98 } : {}}
                  className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black py-5 px-8 rounded-2xl text-xl uppercase tracking-wider hover:shadow-[0_0_30px_rgba(251,146,60,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {hasPlayedThisSession ? "Combat Complete" : "Deploy to Arena"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Game Screen */}
          {gameStarted && !gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Player Info Bar */}
              <div className="flex items-center justify-center gap-2 mb-2 max-w-5xl mx-auto">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Player
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{username}</span>
                    <span className="text-2xl">{countries.find(c => c.name === country)?.flag}</span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex justify-between items-center gap-2 mb-2 max-w-5xl mx-auto">
                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl p-2 border border-white/10">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                    Score
                  </div>
                  <div className="text-xl font-black text-white">
                    {score.toLocaleString()}
                  </div>
                </div>

                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl p-2 border border-white/10">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                    Combo
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.div
                      key={combo}
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                      className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
                    >
                      {combo}x
                    </motion.div>
                    {combo >= 5 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-sm"
                      >
                        🔥
                      </motion.span>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl p-2 border border-white/10">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                    Time
                  </div>
                  <div
                    className={`text-xl font-black transition-colors ${
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
                className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl h-[52vh] overflow-hidden border-2 border-white/10 shadow-2xl max-w-6xl mx-auto"
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
                    <motion.div
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
                      <motion.div
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
                          <motion.div
                            className="absolute inset-0 border-4 border-green-400 rounded-full"
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Floating Scores */}
                <AnimatePresence>
                  {floatingScores.map((floatingScore) => (
                    <motion.div
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
                          floatingScore.type === "good" ? "#22c55e" : "#ef4444",
                        textShadow: "0 0 20px currentColor",
                      }}
                    >
                      {floatingScore.value > 0 ? "+" : ""}
                      {floatingScore.value}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Center Instructions (First 3 seconds) */}
                {timeLeft > 57 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="bg-black/80 backdrop-blur-xl px-12 py-8 rounded-3xl border-2 border-white/20">
                      <div className="text-4xl font-black text-white mb-2 text-center">
                        READY!
                      </div>
                      <div className="text-lg text-slate-300 text-center">
                        Click the good targets 🎯
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
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
  );
}
