"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FlagIcon from "@/app/components/FlagIcon";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  gameType: string;
  country?: string | null;
  totalPoints?: number;
  gamesPlayed?: number;
  maxCombo?: number | null;
  accuracy?: number | null;
  distance?: number | null;
  reflexRank?: number | null;
  jumpRank?: number | null;
  memoryRank?: number | null;
  reflexScore?: number | null;
  jumpScore?: number | null;
  memoryScore?: number | null;
}

type TabType = "overall" | "reflex" | "jump" | "memory";

const CYCLE_INTERVAL = 15000; // 15 seconds
const POLL_INTERVAL = 30000; // 30 seconds (reduced from 10s to avoid excessive refreshes)

export default function LiveLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overall");
  const [countries, setCountries] = useState<
    Array<{ name: string; flag: string; code: string }>
  >([]);
  const [cycleProgress, setCycleProgress] = useState(0);

  const tabs: { id: TabType; label: string; icon: string; color: string; gradient: string }[] = [
    { id: "overall", label: "Hall of Fame", icon: "🏆", color: "text-emerald-400", gradient: "from-emerald-500 to-cyan-500" },
    { id: "reflex", label: "Reflex Arena", icon: "⚡", color: "text-yellow-400", gradient: "from-yellow-500 to-orange-500" },
    { id: "jump", label: "Jump Master", icon: "🚀", color: "text-cyan-400", gradient: "from-cyan-500 to-blue-500" },
    { id: "memory", label: "Memory Match", icon: "🧠", color: "text-purple-400", gradient: "from-purple-500 to-pink-500" },
  ];

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
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/leaderboard?view=${activeTab}`);
      const data = await response.json();

      if (activeTab === "overall") {
        const transformedEntries = data.leaderboard
          .slice(0, 10)
          .map((player: any, index: number) => ({
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
          }));
        setEntries(transformedEntries);
      } else {
        const transformedEntries = data.leaderboard
          .slice(0, 10)
          .map((entry: any) => ({
            rank: entry.rank,
            username: entry.username,
            score: entry.score,
            gameType: data.gameType || activeTab.toUpperCase(),
            country: entry.country,
            maxCombo: entry.maxCombo,
            accuracy: entry.accuracy,
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
  }, [activeTab]);

  // Fetch leaderboard data with polling
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Auto-cycle through tabs
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex((t) => t.id === current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].id;
      });
    }, CYCLE_INTERVAL);

    return () => clearInterval(cycleInterval);
  }, []);

  // Progress bar animation
  useEffect(() => {
    setCycleProgress(0);
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / CYCLE_INTERVAL) * 100, 100);
      setCycleProgress(progress);
    }, 50);

    return () => clearInterval(progressInterval);
  }, [activeTab]);

  const getCountryCode = (countryName: string | null | undefined) => {
    if (!countryName) return null;
    if (countryName.length === 2) return countryName.toUpperCase();
    const country = countries.find((c) => c.name === countryName);
    return country?.code || null;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-r from-yellow-500/30 to-amber-500/20",
          border: "border-yellow-500/60",
          text: "text-yellow-400",
          medal: "🥇",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-slate-300/30 to-gray-400/20",
          border: "border-slate-300/60",
          text: "text-slate-200",
          medal: "🥈",
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-orange-500/30 to-amber-700/20",
          border: "border-orange-500/60",
          text: "text-orange-400",
          medal: "🥉",
        };
      default:
        return {
          bg: "bg-white/5",
          border: "border-white/10",
          text: "text-slate-400",
          medal: "",
        };
    }
  };

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0a1628] to-[#020617]" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-cyan-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[130px]"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col p-6 lg:p-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <Image
              src="/assets/images/logos/cloud9-logo.png"
              alt="Cloud9"
              width={80}
              height={28}
              className="brightness-110"
            />
            <div className="h-8 w-px bg-white/20" />
            <Image
              src="/assets/images/logos/jetbrains-logo.png"
              alt="JetBrains"
              width={80}
              height={28}
              className="opacity-90"
            />
          </div>

          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-[0.3em] text-white">
              Junie Arcade
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Live Tournament
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-black uppercase tracking-widest text-red-500">
              LIVE
            </span>
          </div>
        </header>

        {/* Current Tab Title */}
        <div className="text-center mb-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="inline-block"
          >
            <h2 className={`text-4xl lg:text-6xl font-black uppercase tracking-tight ${currentTab.color}`}>
              <span className="mr-4">{currentTab.icon}</span>
              {currentTab.label}
              <span className="ml-4">{currentTab.icon}</span>
            </h2>
          </motion.div>

          {/* Cycle Progress Bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${currentTab.gradient}`}
                style={{ width: `${cycleProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 lg:px-10 py-4 border-b border-white/10 bg-white/5">
              <div className="col-span-1 text-xs font-black uppercase tracking-widest text-white/40">
                #
              </div>
              <div className="col-span-7 text-xs font-black uppercase tracking-widest text-white/40">
                Player
              </div>
              <div className="col-span-4 text-right text-xs font-black uppercase tracking-widest text-white/40">
                Score
              </div>
            </div>

            {/* Entries */}
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="flex items-center justify-center py-32">
                  <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {entries.map((entry, index) => {
                    const style = getRankStyle(entry.rank);
                    return (
                      <motion.div
                        key={`${activeTab}-${entry.username}-${entry.rank}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className={`grid grid-cols-12 gap-4 items-center px-6 lg:px-10 py-5 lg:py-6 ${
                          entry.rank <= 3 ? style.bg : "hover:bg-white/5"
                        } transition-colors`}
                      >
                        {/* Rank */}
                        <div className="col-span-1">
                          <span
                            className={`text-3xl lg:text-4xl font-black italic ${style.text}`}
                          >
                            {entry.rank <= 3 ? style.medal : entry.rank.toString().padStart(2, "0")}
                          </span>
                        </div>

                        {/* Player Info */}
                        <div className="col-span-7 flex items-center gap-4 lg:gap-6">
                          {getCountryCode(entry.country) && (
                            <FlagIcon
                              code={getCountryCode(entry.country)!}
                              className="w-10 h-7 lg:w-12 lg:h-8 rounded shadow-lg"
                            />
                          )}
                          <div>
                            <div
                              className={`text-2xl lg:text-3xl font-black uppercase tracking-tight ${
                                entry.rank <= 3 ? "text-white" : "text-slate-200"
                              }`}
                            >
                              {entry.username}
                            </div>
                            {activeTab === "overall" && entry.gamesPlayed && (
                              <div className="text-xs text-white/40 font-bold uppercase tracking-wider mt-1">
                                {entry.gamesPlayed}/3 Games Completed
                              </div>
                            )}
                            {activeTab !== "overall" && (
                              <div className="flex items-center gap-4 text-xs text-white/40 font-bold uppercase tracking-wider mt-1">
                                {entry.maxCombo && (
                                  <span>Combo: {entry.maxCombo}</span>
                                )}
                                {entry.accuracy && (
                                  <span>Acc: {entry.accuracy}%</span>
                                )}
                                {entry.distance && (
                                  <span>Dist: {entry.distance}m</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="col-span-4 text-right">
                          <span
                            className={`text-3xl lg:text-4xl font-black tabular-nums ${
                              entry.rank <= 3 ? style.text : "text-white"
                            }`}
                          >
                            {entry.score.toLocaleString()}
                          </span>
                          <span className="text-lg lg:text-xl text-white/40 font-bold ml-2">
                            PTS
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}

              {!loading && entries.length === 0 && (
                <div className="py-32 text-center">
                  <div className="text-6xl mb-6 opacity-30">🎮</div>
                  <div className="text-white/30 font-black uppercase tracking-widest text-xl">
                    No Players Yet
                  </div>
                  <p className="text-white/20 text-sm mt-2">
                    Be the first to compete!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Indicators */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                activeTab === tab.id
                  ? "bg-white/10 border border-white/20"
                  : "opacity-40"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span
                className={`text-sm font-bold uppercase tracking-wider ${
                  activeTab === tab.id ? tab.color : "text-white/60"
                }`}
              >
                {tab.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/20">
            Cloud9 x JetBrains Hackathon 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
