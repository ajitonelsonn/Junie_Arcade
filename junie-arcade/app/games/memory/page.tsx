"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import GameOverCard from "@/app/components/GameOverCard";
import FlagIcon from "@/app/components/FlagIcon";
import MobileWarningModal from "@/app/components/MobileWarningModal";
import { isMobilePhone } from "@/app/utils/deviceDetection";
import { useMusic } from "@/app/components/MusicProvider";
import { api } from "@/app/lib/api";

interface Card {
  id: number;
  imageUrl: string;
  matched: boolean;
}

const cardImages = [
  "/assets/images/cards/card-APA.png",
  "/assets/images/cards/card-Blaber.png",
  "/assets/images/cards/card-penny.png",
  "/assets/images/cards/card-Thanatos.png",
  "/assets/images/cards/card-v1c.png",
  "/assets/images/cards/card-Xeppaa.png",
  "/assets/images/cards/card-Zellsis.png",
  "/assets/images/cards/card-Zven.png",
];

export default function MemoryMatchPage() {
  const router = useRouter();
  const { playGameMusic, playVictoryMusic, stopAllMusic } = useMusic();
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState<
    Array<{ name: string; flag: string; code: string }>
  >([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hasPlayedThisSession, setHasPlayedThisSession] = useState(false);
  const [consecutiveMatches, setConsecutiveMatches] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

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
          if (data.currentPlayer && data.currentPlayer.memoryScore > 0) {
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
      document.body.classList.add('hide-custom-cursor');
    } else {
      document.body.classList.remove('hide-custom-cursor');
    }

    return () => {
      document.body.classList.remove('hide-custom-cursor');
    };
  }, [gameStarted, gameOver, playGameMusic]);

  // Play victory music when game ends
  useEffect(() => {
    if (gameOver) {
      stopAllMusic();
      playVictoryMusic();
    }
  }, [gameOver, playVictoryMusic]);

  // Audio helpers
  const playSound = (path: string, volume = 0.5) => {
    const audio = new Audio(path);
    audio.volume = volume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => console.error("Error playing sound:", e));
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Game ends - calculate final score
            calculateFinalScore();
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
    }
  }, [gameStarted, gameOver]);

  // Check for win condition
  useEffect(() => {
    if (matchedPairs === 8 && !gameOver) {
      // All pairs matched - calculate final score with completion bonus
      calculateFinalScore(true);
      setGameOver(true);
      playSound("/assets/sounds/sfx/success.mp3", 0.7);
    }
  }, [matchedPairs, gameOver]);

  const calculateFinalScore = (completed = false) => {
    // Base score from matches (already accumulated)
    let finalScore = score;

    // Time bonus (always awarded based on remaining time)
    const timeBonus = timeLeft * 15; // Increased multiplier
    finalScore += timeBonus;

    // Accuracy bonus (always awarded based on moves)
    const accuracyBonus = Math.floor((16 / Math.max(moves, 1)) * 150);
    finalScore += accuracyBonus;

    // Combo bonus (reward consecutive matches)
    const comboBonus = bestCombo * 25;
    finalScore += comboBonus;

    // Completion bonus (only if all pairs matched)
    if (completed) {
      const completionBonus = 500;
      finalScore += completionBonus;

      // Perfect game bonus (16 moves = perfect memory)
      if (moves === 16) {
        const perfectBonus = 300;
        finalScore += perfectBonus;
      }

      // Speed bonus (completed with lots of time remaining)
      if (timeLeft >= 60) {
        const speedBonus = 400;
        finalScore += speedBonus;
      } else if (timeLeft >= 40) {
        const speedBonus = 200;
        finalScore += speedBonus;
      }
    }

    setScore(finalScore);
  };

  const initializeGame = async () => {
    if (!username.trim() || !country) return;

    // If we already have a playerId, just start the game
    if (playerId) {
      const shuffled = [...cardImages, ...cardImages]
        .sort(() => Math.random() - 0.5)
        .map((img, index) => ({
          id: index,
          imageUrl: img,
          matched: false,
        }));
      setCards(shuffled);
      setFlippedIndices([]);
      setMatchedPairs(0);
      setMoves(0);
      setScore(0);
      setTimeLeft(100);
      setGameOver(false);
      setGameStarted(true);
      setConsecutiveMatches(0);
      setBestCombo(0);
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

        const shuffled = [...cardImages, ...cardImages]
          .sort(() => Math.random() - 0.5)
          .map((img, index) => ({
            id: index,
            imageUrl: img,
            matched: false,
          }));
        setCards(shuffled);
        setFlippedIndices([]);
        setMatchedPairs(0);
        setMoves(0);
        setScore(0);
        setTimeLeft(100);
        setGameOver(false);
        setGameStarted(true);
        setConsecutiveMatches(0);
        setBestCombo(0);
      }
    } catch (error) {
      console.error("Failed to create player session:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      cards[index].matched ||
      gameOver
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    playSound("/assets/sounds/sfx/click.mp3", 0.4);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;

      if (cards[first].imageUrl === cards[second].imageUrl) {
        // Match found!
        setTimeout(() => {
          playSound("/assets/sounds/sfx/success.mp3", 0.5);
          const newCards = [...cards];
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards(newCards);
          setMatchedPairs((prev) => prev + 1);

          // Update consecutive matches and combo
          const newConsecutive = consecutiveMatches + 1;
          setConsecutiveMatches(newConsecutive);
          if (newConsecutive > bestCombo) {
            setBestCombo(newConsecutive);
          }

          // Scoring: base points + combo multiplier
          const basePoints = 75; // Increased from 50
          const comboMultiplier = Math.min(newConsecutive, 5); // Max 5x combo
          const points = basePoints * comboMultiplier;

          setScore((prev) => prev + points);
          setFlippedIndices([]);
        }, 500);
      } else {
        // No match - reset combo
        setTimeout(() => {
          playSound("/assets/sounds/sfx/error.mp3", 0.4);
          setConsecutiveMatches(0);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleSaveScore = async () => {
    if (!username || !country || isSaving) return;

    const lastSaved = localStorage.getItem("last_saved_score_memory");
    const now = Date.now();
    if (lastSaved && now - parseInt(lastSaved) < 5000) {
      return;
    }

    setIsSaving(true);
    localStorage.setItem("last_saved_score_memory", now.toString());

    try {
      const response = await api.post("/api/scores", {
        username,
        country,
        gameType: "MEMORY_MATCH",
        score,
        time: 100 - timeLeft,
        playerId,
      });
      const data = await response.json();
      if (data.playerId) {
        setPlayerId(data.playerId);
        localStorage.setItem("junie_player_id", data.playerId);
        localStorage.setItem("junie_username", username);
        localStorage.setItem("junie_country", country);
      }
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
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-fuchsia-500/30 overflow-hidden">
        {/* Animated Background - VALORANT/LoL Tactical Style */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <Image
              src="/assets/images/backgrounds/c92.webp"
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
            style={{ background: 'linear-gradient(90deg, transparent, #c284f9, #c284f9, transparent)' }}
          />

          {/* Animated Orbs - Purple/Pink Colors */}
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
            <div className="w-full h-full bg-gradient-to-br from-[#c284f9]/40 to-fuchsia-600/20 rounded-full" />
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
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-600/20 rounded-full" />
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
            <div className="w-full h-full bg-gradient-to-br from-fuchsia-600/30 to-[#c284f9]/20 rounded-full" />
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
              src="/assets/images/junie/junie-happy.png"
              alt="Junie Happy"
              fill
              sizes="128px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_20px_rgba(194,132,249,0.6)]"
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
              src="/assets/images/junie/junie-idle.png"
              alt="Junie Idle"
              fill
              sizes="112px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]"
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
              src="/assets/images/junie/junie-jump.png"
              alt="Junie Jump"
              fill
              sizes="96px"
              loading="lazy"
              quality={70}
              className="object-contain drop-shadow-[0_0_15px_rgba(194,132,249,0.4)]"
            />
          </m.div>

          {/* Corner Decorative Elements - Tactical HUD Style */}
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
            <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#c284f9] to-transparent" />
            <div className="absolute top-4 left-4 h-20 w-[1px] bg-gradient-to-b from-[#c284f9] to-transparent" />
            <div className="absolute top-8 left-8 text-[8px] font-black text-[#c284f9]/50 uppercase tracking-[0.3em]">
              MEM//
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
            <div className="absolute top-4 right-4 w-20 h-[1px] bg-gradient-to-l from-[#c284f9] to-transparent" />
            <div className="absolute top-4 right-4 h-20 w-[1px] bg-gradient-to-b from-[#c284f9] to-transparent" />
            <div className="absolute top-8 right-8 text-[8px] font-black text-[#c284f9]/50 uppercase tracking-[0.3em]">
            //MATCH
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
                    background: 'linear-gradient(135deg, rgba(194, 132, 249, 0.1), transparent)',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  <span className="text-[#c284f9] text-xl font-black">←</span>
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
                      background: 'linear-gradient(135deg, rgba(194, 132, 249, 0.1), transparent)',
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
                    <div className="w-1 h-1 rotate-45 bg-[#c284f9]" />
                    <div className="h-5 sm:h-6 w-px bg-white/20" />
                    <div className="w-1 h-1 rotate-45 bg-[#c284f9]" />
                  </div>
                  <div
                    className="relative p-1.5 sm:p-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(194, 132, 249, 0.1), transparent)',
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
                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-black text-[#c284f9]/60 uppercase tracking-[0.2em]">
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
                  background: 'linear-gradient(135deg, rgba(194, 132, 249, 0.1), rgba(194, 132, 249, 0.05))',
                  border: '1px solid rgba(194, 132, 249, 0.3)',
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c284f9] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c284f9]"></span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#c284f9]">
                  Pattern Recognition
                </span>
                {/* Animated scan line */}
                <m.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#c284f9]/20 to-transparent"
                />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 tracking-tighter leading-none italic">
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600"
                  style={{ textShadow: '0 0 60px rgba(194, 132, 249, 0.5)' }}
                >
                  MEMORY MATCH
                </span>
              </h1>

              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-[#c284f9]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c284f9]" />
                <div className="w-6 sm:w-8 h-[1px] bg-white/30" />
                <div className="w-1.5 h-1.5 rotate-45 bg-fuchsia-500" />
                <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-fuchsia-500" />
              </div>

              <p className="text-xs sm:text-sm text-slate-400 font-bold max-w-2xl mx-auto uppercase tracking-wide">
                <span className="text-white">Link the identities</span> of champions across the multiverse.
                <span className="text-[#c284f9]">
                  {" "}
                  Pattern recognition at scale.
                </span>
              </p>
            </m.div>

            {/* Username Input Screen */}
            {!gameStarted && (
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto"
              >
                <div
                  className="relative bg-[#0a0e13]/90 backdrop-blur-xl p-8 sm:p-12 border border-[#c284f9]/20 shadow-2xl overflow-hidden"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                  }}
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600" />

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#c284f9] to-transparent" />
                    <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#c284f9] to-transparent" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-fuchsia-500 to-transparent" />
                    <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-fuchsia-500 to-transparent" />
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
                          background: 'linear-gradient(135deg, rgba(194, 132, 249, 0.4), rgba(217, 70, 239, 0.2))'
                        }}
                      />
                      <div className="w-20 h-20 relative">
                        <Image
                          src="/assets/images/logos/game_logo/memory_match.png"
                          alt="Memory Match"
                          fill
                          sizes="80px"
                          className="object-contain filter drop-shadow-[0_0_20px_rgba(194,132,249,0.5)]"
                        />
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight italic">
                      Sync Neural Network
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      Initialize memory matrix protocol
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
                        id="memory-username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Name"
                        disabled={!!playerId}
                        className="w-full px-6 py-4 text-lg text-left border-2 border-[#c284f9]/30 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#c284f9]/50 focus:border-[#c284f9]/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                        }}
                        maxLength={20}
                        autoComplete="name"
                        autoFocus
                      />
                      {playerId && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c284f9] text-xs font-black uppercase tracking-widest pointer-events-none">
                          Locked
                        </div>
                      )}
                    </div>

                    <div className="relative z-20" ref={countryDropdownRef}>
                      <input
                        id="memory-country"
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
                        className="w-full pl-14 pr-6 py-4 text-lg text-left border-2 border-[#c284f9]/30 bg-white/5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c284f9]/50 focus:border-[#c284f9]/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                        }}
                        autoComplete="country-name"
                      />
                      {playerId && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c284f9] text-xs font-black uppercase tracking-widest pointer-events-none">
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
                          className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-[#0a0e13] backdrop-blur-xl border border-[#c284f9]/30 shadow-2xl rounded-sm"
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
                                className="w-full px-6 py-3 text-left hover:bg-[#c284f9]/20 transition-colors text-white flex items-center gap-3 border-b border-white/5 last:border-0"
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
                    onClick={initializeGame}
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
                      background: 'linear-gradient(135deg, #a855f7, #d946ef, #ec4899)',
                      clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)',
                      boxShadow: username.trim() && country && !hasPlayedThisSession
                        ? '0 0 30px rgba(194, 132, 249, 0.4)'
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
                      {hasPlayedThisSession ? "Protocol Complete" : "Initialize Matrix"}
                    </span>
                  </m.button>
                </div>
              </m.div>
            )}

            {/* Game Screen */}
            {gameStarted && !gameOver && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                {/* Player Info Bar */}
                <div className="flex items-center justify-center gap-2 mb-3 max-w-7xl mx-auto">
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

                {/* Stats Bar */}
                <div className="flex justify-between items-center gap-3 sm:gap-4 md:gap-6 mb-3 max-w-7xl mx-auto flex-shrink-0 px-4 w-full">
                  <div
                    className="flex-1 bg-white/5 backdrop-blur-xl p-4 sm:p-5 border border-white/10"
                    style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
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
                    style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
                  >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Pairs
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 italic">
                      {matchedPairs}/8
                    </div>
                  </div>

                  <div
                    className="flex-1 bg-white/5 backdrop-blur-xl p-4 sm:p-5 border border-white/10"
                    style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
                  >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Moves
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white italic">
                      {moves}
                    </div>
                  </div>

                  <div
                    className="flex-1 bg-white/5 backdrop-blur-xl p-4 sm:p-5 border border-white/10"
                    style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
                  >
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Time
                    </div>
                    <div
                      className={`text-2xl sm:text-3xl font-black transition-colors italic ${timeLeft < 20
                          ? "text-red-400 animate-pulse"
                          : "text-white"
                        }`}
                    >
                      {timeLeft}s
                    </div>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 w-full max-w-7xl">
                    <AnimatePresence>
                      {cards.map((card, index) => (
                        <m.div
                          key={card.id}
                          initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                          transition={{
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                          whileHover={{ scale: card.matched ? 1 : 1.05 }}
                          whileTap={{ scale: card.matched ? 1 : 0.95 }}
                          className="cursor-pointer w-full"
                          style={{ aspectRatio: "3/4" }}
                          onClick={() => handleCardClick(index)}
                        >
                          <div className="relative w-full h-full perspective-1000">
                            <m.div
                              className="relative w-full h-full"
                              animate={{
                                rotateY:
                                  flippedIndices.includes(index) || card.matched
                                    ? 180
                                    : 0,
                              }}
                              transition={{
                                duration: 0.6,
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                              }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              {/* Card Back */}
                              <div className="absolute inset-0 backface-hidden">
                                <div
                                  className="relative w-full h-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-2 border-white/20 backdrop-blur-sm overflow-hidden"
                                  style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                                >
                                  <Image
                                    src="/assets/images/cards/card-back.png"
                                    alt="Card back"
                                    fill
                                    sizes="(max-width: 768px) 25vw, 200px"
                                    className="object-cover"
                                  />
                                </div>
                              </div>

                              {/* Card Front */}
                              <div
                                className="absolute inset-0 backface-hidden"
                                style={{ transform: "rotateY(180deg)" }}
                              >
                                <div
                                  className={`relative w-full h-full border-4 overflow-hidden transition-all ${card.matched
                                      ? "border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                                      : "border-white/30"
                                    }`}
                                  style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                                >
                                  <Image
                                    src={card.imageUrl}
                                    alt="Card"
                                    fill
                                    sizes="(max-width: 768px) 25vw, 200px"
                                    className="object-cover"
                                  />
                                  {card.matched && (
                                    <m.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute inset-0 bg-green-500/20 backdrop-blur-[1px] flex items-center justify-center"
                                    >
                                      <span className="text-4xl sm:text-6xl text-green-400">✓</span>
                                    </m.div>
                                  )}
                                </div>
                              </div>
                            </m.div>
                          </div>
                        </m.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </m.div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <GameOverCard
                username={username}
                country={country}
                score={score}
                gameType="MEMORY_MATCH"
                stats={[
                  {
                    label: "Final Score",
                    value: score.toLocaleString(),
                    color: "text-purple-400",
                  },
                  {
                    label: "Pairs Matched",
                    value: `${matchedPairs}/8`,
                    color: "text-fuchsia-400",
                  },
                  { label: "Moves", value: moves, color: "text-white" },
                  ...(matchedPairs === 8 && moves <= 20
                    ? [
                      {
                        label: "Achievement",
                        value: "🌟 Perfect",
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
          gameName="Memory Match"
          gradient="from-purple-400 via-fuchsia-500 to-pink-600"
          onClose={() => {
            clearSession();
            router.push("/");
          }}
        />
      </div>
    </LazyMotion>
  );
}
