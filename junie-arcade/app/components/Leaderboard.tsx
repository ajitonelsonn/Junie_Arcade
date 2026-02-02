"use client";

import { useEffect, useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import FlagIcon from "./FlagIcon";
import CelebrationEffect from "./CelebrationEffect";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  gameType: string;
  country?: string | null;
  countryCode?: string | null;
  totalPoints?: number;
  gamesPlayed?: number;
  maxCombo?: number | null;
  accuracy?: number | null;
  time?: number | null;
  distance?: number | null;
  reflexRank?: number | null;
  jumpRank?: number | null;
  memoryRank?: number | null;
  reflexScore?: number | null;
  jumpScore?: number | null;
  memoryScore?: number | null;
}

export interface NewChampionData {
  username: string;
  rank: number;
  score: number;
  country?: string | null;
  countryCode?: string | null;
}

export interface PlayerStats {
  username: string;
  country: string;
  totalPoints: number;
  gamesPlayed: number;
  reflexPoints?: number;
  jumpPoints?: number;
  memoryPoints?: number;
  rank?: number;
  reflexRank?: number;
  jumpRank?: number;
  memoryRank?: number;
}

interface LeaderboardProps {
  onNewChampion?: (champion: NewChampionData) => void;
  onPlayerStatsReady?: (stats: PlayerStats | null) => void;
  showOverallCardExternal?: boolean;
}

export default function Leaderboard({ onNewChampion, onPlayerStatsReady, showOverallCardExternal }: LeaderboardProps = {}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overall" | "reflex" | "jump" | "memory"
  >("overall");
  const [countries, setCountries] = useState<
    Array<{ name: string; flag: string; code: string }>
  >([]);
  const [currentPlayerStats, setCurrentPlayerStats] = useState<PlayerStats | null>(null);

  // State for tracking new top 3 entries (celebration effect)
  const [previousTop3, setPreviousTop3] = useState<string[]>([]);
  const [celebratingUsernames, setCelebratingUsernames] = useState<string[]>(
    [],
  );
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Check for showOverall query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("showOverall") === "true") {
      setActiveTab("overall");
    }
  }, []);

  // Notify parent when player stats are ready
  useEffect(() => {
    if (onPlayerStatsReady) {
      onPlayerStatsReady(currentPlayerStats);
    }
  }, [currentPlayerStats, onPlayerStatsReady]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        const data = await response.json();
        // Ensure we always set an array
        setCountries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);


  // Detect new top 3 entries and trigger celebration
  useEffect(() => {
    // Only check for celebrations on the overall tab
    // Add defensive check to ensure entries is a valid array
    if (
      activeTab !== "overall" ||
      !Array.isArray(entries) ||
      entries.length === 0
    )
      return;

    const currentTop3Entries = entries.filter((e) => e.rank <= 3);
    const currentTop3 = currentTop3Entries.map((e) => e.username);

    // Skip celebration on first load (no previous data to compare)
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      setPreviousTop3(currentTop3);
      return;
    }

    // Find users who are newly in top 3 (weren't in previous top 3)
    const newEntrants = currentTop3.filter(
      (username) => !previousTop3.includes(username),
    );

    // Always update previous top 3 for next comparison
    setPreviousTop3(currentTop3);

    if (newEntrants.length > 0) {
      setCelebratingUsernames(newEntrants);

      // Notify parent about the highest-ranked new champion
      if (onNewChampion) {
        // Find the entry with the best (lowest) rank among new entrants
        const bestNewChampion = currentTop3Entries
          .filter((e) => newEntrants.includes(e.username))
          .sort((a, b) => a.rank - b.rank)[0];

        if (bestNewChampion) {
          onNewChampion({
            username: bestNewChampion.username,
            rank: bestNewChampion.rank,
            score: bestNewChampion.score,
            country: bestNewChampion.country,
            countryCode: getCountryCode(bestNewChampion.country),
          });
        }
      }

      // Clear celebration after 3.5 seconds
      const timer = setTimeout(() => {
        setCelebratingUsernames([]);
      }, 3500);

      // Cleanup timeout on unmount or new celebration
      return () => clearTimeout(timer);
    }
  }, [entries, activeTab]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Use localStorage playerId as the trusted source of identity.
      // Fall back to URL playerId only for viewing the leaderboard (public data),
      // but the champion card (showOverall) will only render when localStorage matches.
      const urlParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const urlPlayerId = urlParams.get("playerId");
      const storagePlayerId =
        typeof window !== "undefined"
          ? localStorage.getItem("junie_player_id")
          : null;
      // Prefer localStorage; only use URL playerId if localStorage matches or is absent
      const playerId = storagePlayerId || urlPlayerId;

      const response = await fetch(
        `/api/leaderboard?view=${activeTab}${playerId ? `&playerId=${playerId}` : ""}`,
      );
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      const data = await response.json();

      // Check for API errors or missing data
      if (data.error || !data.leaderboard || !Array.isArray(data.leaderboard)) {
        console.error(
          "Leaderboard API error:",
          data.error || "Invalid response structure",
        );
        setEntries([]);
        setLoading(false);
        return;
      }

      // Transform data based on view type
      if (activeTab === "overall") {
        if (data.currentPlayer) {
          setCurrentPlayerStats(data.currentPlayer);
        }
        // Overall leaderboard with champion points
        const transformedEntries = data.leaderboard.map(
          (player: any, index: number) => ({
            rank: index + 1,
            username: player.username,
            score: player.totalPoints,
            gameType: "OVERALL",
            country: player.country,
            totalPoints: player.totalPoints,
            gamesPlayed: player.gamesPlayed,
            reflexRank: player.reflexRank,
            jumpRank: player.jumpRank,
            memoryRank: player.memoryRank,
            reflexScore: player.reflexScore,
            jumpScore: player.jumpScore,
            memoryScore: player.memoryScore,
          }),
        );
        setEntries(transformedEntries);
      } else {
        // Individual game leaderboard
        const transformedEntries = data.leaderboard.map((entry: any) => ({
          rank: entry.rank,
          username: entry.username,
          score: entry.score,
          gameType: data.gameType || activeTab.toUpperCase(),
          country: entry.country,
          maxCombo: entry.maxCombo,
          accuracy: entry.accuracy,
          time: entry.time,
          distance: entry.distance,
        }));
        setEntries(transformedEntries);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setEntries([]);
      setLoading(false);
    }
  };

  const getCountryCode = (countryName: string | null | undefined) => {
    if (!countryName) return null;
    // If it's already a 2-character code, return it
    if (countryName.length === 2) return countryName.toUpperCase();
    // Defensive check to ensure countries is an array before calling find
    if (!Array.isArray(countries)) return null;
    const country = countries.find((c) => c.name === countryName);
    return country?.code || null;
  };


  const getGameLogo = (gameType: string) => {
    switch (gameType) {
      case "REFLEX_ARENA":
        return "/assets/images/logos/game_logo/reflex_arena.png";
      case "JUMP_MASTER":
        return "/assets/images/logos/game_logo/jump_master.png";
      case "MEMORY_MATCH":
        return "/assets/images/logos/game_logo/memory_match.png";
      case "OVERALL":
        return null; // Will fallback to trophy
      default:
        return null;
    }
  };

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case "REFLEX_ARENA":
        return "text-yellow-400";
      case "JUMP_MASTER":
        return "text-cyan-400";
      case "MEMORY_MATCH":
        return "text-purple-400";
      case "OVERALL":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const getHeroForRank = (rank: number) => {
    const heroes = [
      "Jinx_Render.webp",
      "Yasuo_Render.webp",
      "Lux_Render.webp",
      "Ezreal_Render.webp",
      "Jett_Artwork_Full.webp",
    ];
    return `/assets/images/hero/${heroes[(rank - 1) % heroes.length]}`;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/10",
          border: "border-yellow-500/40",
          text: "text-yellow-400",
          glow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
          medal: "🥇",
          accent: "bg-yellow-500",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-slate-300/20 to-gray-400/10",
          border: "border-slate-300/40",
          text: "text-slate-200",
          glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)]",
          medal: "🥈",
          accent: "bg-slate-400",
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-orange-500/20 to-amber-700/10",
          border: "border-orange-500/40",
          text: "text-orange-400",
          glow: "shadow-[0_0_30px_rgba(249,115,22,0.2)]",
          medal: "🥉",
          accent: "bg-orange-600",
        };
      default:
        return {
          bg: "bg-white/[0.02]",
          border: "border-white/5",
          text: "text-slate-400",
          glow: "",
          medal: `#${rank}`,
          accent: "bg-slate-700",
        };
    }
  };

  const tabs = [
    {
      id: "overall" as const,
      label: "Hall of Fame",
      icon: "🏆",
      logo: null,
      color: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
    {
      id: "reflex" as const,
      label: "Reflex Arena",
      icon: "⚡",
      logo: "/assets/images/logos/game_logo/reflex_arena.png",
      color: "text-yellow-400",
      glow: "shadow-yellow-500/20",
    },
    {
      id: "jump" as const,
      label: "Jump Master",
      icon: "🚀",
      logo: "/assets/images/logos/game_logo/jump_master.png",
      color: "text-cyan-400",
      glow: "shadow-cyan-500/20",
    },
    {
      id: "memory" as const,
      label: "Memory Match",
      icon: "🧠",
      logo: "/assets/images/logos/game_logo/memory_match.png",
      color: "text-purple-400",
      glow: "shadow-purple-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Decorative Floating Mascot */}
      <div className="absolute -top-24 -right-12 w-32 h-32 pointer-events-none z-20 hidden lg:block">
        <m.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/assets/images/junie/junie-jump.png"
            alt="Junie Mascot"
            width={128}
            height={128}
            quality={50}
            className="object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          />
        </m.div>
      </div>

      <div className="absolute -bottom-12 -left-12 w-28 h-28 pointer-events-none z-20 hidden lg:block opacity-60">
        <m.div
          animate={{
            y: [0, 10, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/assets/images/junie/junie-idle.png"
            alt="Junie Mascot"
            width={112}
            height={112}
            quality={50}
            className="object-contain"
          />
        </m.div>
      </div>

      {/* Tab Navigation - Valorant Style */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 relative z-10">
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-8 py-4 transition-all duration-300 overflow-hidden ${
                activeTab === tab.id
                  ? "text-slate-900"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {/* Background Skew */}
              <div
                className={`absolute inset-0 skew-x-[-12deg] transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white opacity-100"
                    : "bg-white/5 group-hover:bg-white/10"
                } border border-white/10`}
              />

              <div className="relative flex items-center gap-3 font-black uppercase tracking-[0.2em] text-xs">
                {tab.logo ? (
                  <div
                    className={`w-5 h-5 relative transition-transform duration-300 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`}
                  >
                    <Image
                      src={tab.logo}
                      alt={tab.label}
                      fill
                      sizes="20px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className={activeTab === tab.id ? "" : "opacity-70"}>
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
              </div>

              {/* Bottom Active Indicator */}
              {activeTab === tab.id && (
                <m.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-6 h-1 bg-[#ff4655] skew-x-[-12deg]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-sm border border-white/10 bg-[#0f1923]/50 backdrop-blur-md">
        {/* Decorative background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] -rotate-45 translate-x-32 -translate-y-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.02] -rotate-45 -translate-x-32 translate-y-32 pointer-events-none" />

        <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/10 bg-white/[0.02]">
          <div className="col-span-1 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Rank
          </div>
          <div className="col-span-7 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Competitor
          </div>
          <div className="col-span-4 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Rating
          </div>
        </div>

        <div className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative w-16 h-16">
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-[#ff4655] rounded-full"
                />
                <m.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-2 border-b-2 border-cyan-400 rounded-full"
                />
              </div>
              <div className="text-white/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
                Establishing Secure Uplink...
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {entries.map((entry, index) => {
                  const style = getRankStyle(entry.rank);
                  return (
                    <m.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: celebratingUsernames.includes(entry.username)
                          ? [1, 1.02, 1]
                          : 1,
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        delay: index * 0.05,
                        scale: {
                          duration: 0.5,
                          repeat: celebratingUsernames.includes(entry.username)
                            ? 2
                            : 0,
                        },
                      }}
                      key={`${entry.username}-${entry.gameType}-${entry.rank}`}
                      className={`grid grid-cols-12 gap-4 items-center px-8 py-6 group transition-all duration-300 relative overflow-hidden ${entry.rank <= 3 ? style.bg : "hover:bg-white/[0.03]"}`}
                    >
                      {/* Celebration Effect for new top 3 entries */}
                      {entry.rank <= 3 && (
                        <CelebrationEffect
                          rank={entry.rank}
                          isActive={celebratingUsernames.includes(
                            entry.username,
                          )}
                        />
                      )}

                      {/* Hero Silhouette for Top 3 */}
                      {entry.rank <= 3 && (
                        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-[0.08] pointer-events-none group-hover:opacity-20 transition-opacity">
                          <Image
                            src={getHeroForRank(entry.rank)}
                            alt="Hero Background"
                            fill
                            sizes="128px"
                            quality={50}
                            className="object-contain object-right"
                          />
                        </div>
                      )}

                      {/* Hover/Active Accent Line */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 transition-transform duration-300 ${entry.rank <= 3 ? style.accent : "bg-white/20 scale-y-0 group-hover:scale-y-100"}`}
                      />

                      <div className="col-span-1 relative">
                        <span
                          className={`text-2xl font-black italic tracking-tighter ${style.text} drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                        >
                          {entry.rank.toString().padStart(2, "0")}
                        </span>
                      </div>

                      <div className="col-span-7 flex items-center gap-6">
                        <div
                          className={`w-12 h-12 skew-x-[-8deg] bg-slate-800 border ${entry.rank <= 3 ? style.border : "border-white/10"} flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-all duration-500 relative overflow-hidden group-hover:border-white/30`}
                        >
                          {getGameLogo(entry.gameType) ? (
                            <div className="relative w-7 h-7 skew-x-[8deg]">
                              <Image
                                src={getGameLogo(entry.gameType)!}
                                alt={entry.gameType}
                                fill
                                sizes="28px"
                                quality={50}
                                className="object-contain filter brightness-110"
                              />
                            </div>
                          ) : (
                            <span className="skew-x-[8deg]">🏆</span>
                          )}
                          {/* Animated inner glow on hover */}
                          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-3 mb-1">
                            {getCountryCode(entry.country) && (
                              <FlagIcon
                                code={getCountryCode(entry.country)!}
                                className="w-5 h-3.5"
                              />
                            )}
                            <div className="text-white font-black text-xl tracking-tight uppercase group-hover:text-[#ff4655] transition-colors duration-300 italic">
                              {entry.username}
                            </div>
                            {entry.rank === 1 && (
                              <span className="bg-[#ff4655] text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-tighter skew-x-[-10deg]">
                                <span className="inline-block skew-x-[10deg]">
                                  Champion
                                </span>
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[10px] font-black uppercase tracking-[0.2em] ${getGameColor(entry.gameType)} opacity-60 flex flex-wrap items-center gap-2 md:gap-4`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-pulse" />
                              {entry.gameType.replace("_", " ")}
                            </div>

                            {/* Extra Values */}
                            {entry.gameType !== "OVERALL" ? (
                              <div className="flex items-center gap-3 border-l border-white/10 pl-3 md:pl-4">
                                {entry.maxCombo !== null &&
                                  entry.maxCombo !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-white/30 tracking-normal">
                                        COMBO:
                                      </span>
                                      <span className="text-white/80">
                                        {entry.maxCombo}
                                      </span>
                                    </div>
                                  )}
                                {entry.accuracy !== null &&
                                  entry.accuracy !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-white/30 tracking-normal">
                                        ACC:
                                      </span>
                                      <span className="text-white/80">
                                        {entry.accuracy}%
                                      </span>
                                    </div>
                                  )}
                                {entry.distance !== null &&
                                  entry.distance !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-white/30 tracking-normal">
                                        DIST:
                                      </span>
                                      <span className="text-white/80">
                                        {entry.distance}m
                                      </span>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 border-l border-white/10 pl-3 md:pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-400/50 text-[8px] font-black uppercase tracking-tighter">
                                      RFX:
                                    </span>
                                    <span className="text-white/80 text-[10px]">
                                      #{entry.reflexRank || "--"} (
                                      {entry.reflexScore?.toLocaleString() ||
                                        "0"}
                                      )
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-cyan-400/50 text-[8px] font-black uppercase tracking-tighter">
                                      JMP:
                                    </span>
                                    <span className="text-white/80 text-[10px]">
                                      #{entry.jumpRank || "--"} (
                                      {entry.jumpScore?.toLocaleString() || "0"}
                                      )
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-purple-400/50 text-[8px] font-black uppercase tracking-tighter">
                                      MEM:
                                    </span>
                                    <span className="text-white/80 text-[10px]">
                                      #{entry.memoryRank || "--"} (
                                      {entry.memoryScore?.toLocaleString() ||
                                        "0"}
                                      )
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-4 text-right relative">
                        <div
                          className={`text-3xl font-black tabular-nums tracking-tighter italic ${entry.rank <= 3 ? style.text : "text-white"} group-hover:scale-105 transition-transform duration-300 flex items-baseline justify-end gap-2`}
                        >
                          {entry.gameType === "OVERALL"
                            ? `${entry.score}`
                            : entry.score.toLocaleString()}
                          <span className="text-sm opacity-40 not-italic font-bold uppercase tracking-widest">
                            {entry.gameType === "OVERALL" ? "PTS" : "PTS"}
                          </span>
                        </div>
                        {entry.gameType === "OVERALL" && entry.gamesPlayed && (
                          <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.1em] mt-1 italic">
                            {entry.gamesPlayed}/3 Mission Cycles
                          </div>
                        )}
                      </div>
                    </m.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div className="py-32 text-center">
              <div className="text-6xl mb-6 opacity-20">🌑</div>
              <div className="text-white/20 font-black uppercase tracking-[0.5em] text-sm">
                No Active Data Found
              </div>
              <p className="text-white/10 text-xs mt-2 font-bold uppercase tracking-widest">
                Initialize combat sequence to record first entry
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-between px-2 opacity-30">
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
            System: Stable
          </div>
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.5em] text-white">
          Elite Ranking Protocol
        </div>
      </div>
    </div>
  );
}
