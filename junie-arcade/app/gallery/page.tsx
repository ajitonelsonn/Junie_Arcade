"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryItem {
  id: string;
  url: string;
  username: string;
  score: number;
  gameType: string;
  country: string | null;
  createdAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch("/api/gallery");
        const data = await response.json();
        if (Array.isArray(data)) {
          setImages(data);
        } else {
          console.error("Invalid gallery data received:", data);
          setImages([]);
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const filteredImages = Array.isArray(images) ? images.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.username.toLowerCase().includes(searchLower) ||
      (item.country || "").toLowerCase().includes(searchLower)
    );
  }) : [];

  // Group by username and country
  const groups: Record<string, GalleryItem[]> = {};
  filteredImages.forEach((item: GalleryItem) => {
    const groupKey = `${item.username}|${item.country || "Unknown"}`;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  });

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case "REFLEX_ARENA":
        return "text-[#ff4655]";
      case "JUMP_MASTER":
        return "text-[#00eeff]";
      case "MEMORY_MATCH":
        return "text-[#c284f9]";
      case "OVERALL":
        return "text-emerald-400";
      default:
        return "text-white";
    }
  };

  const getGameTitle = (gameType: string) => {
    switch (gameType) {
      case "REFLEX_ARENA":
        return "Reflex Arena";
      case "JUMP_MASTER":
        return "Jump Master";
      case "MEMORY_MATCH":
        return "Memory Match";
      case "OVERALL":
        return "Ultimate Champion";
      default:
        return "Game";
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Animated Background - VALORANT/LoL Tactical Style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <Image
            src="/assets/images/backgrounds/vlp_.webp"
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
        <motion.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[1px] opacity-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, #00eeff, #00eeff, transparent)' }}
        />

        {/* Animated Orbs - Cloud9/Cyan Colors */}
        <motion.div
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
        </motion.div>
        <motion.div
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
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
          className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-[#00eeff]/20 rounded-full" />
        </motion.div>

        {/* Corner Decorative Elements - Tactical HUD Style */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
          <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#00eeff] to-transparent" />
          <div className="absolute top-4 left-4 h-20 w-[1px] bg-gradient-to-b from-[#00eeff] to-transparent" />
          <div className="absolute top-8 left-8 text-[8px] font-black text-[#00eeff]/50 uppercase tracking-[0.3em]">
            GLY//
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
          <div className="absolute top-4 right-4 w-20 h-[1px] bg-gradient-to-l from-[#00eeff] to-transparent" />
          <div className="absolute top-4 right-4 h-20 w-[1px] bg-gradient-to-b from-[#00eeff] to-transparent" />
          <div className="absolute top-8 right-8 text-[8px] font-black text-[#00eeff]/50 uppercase tracking-[0.3em]">
            //HALO
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation - Tactical Style */}
        <nav className="relative px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
          {/* Background blur bar */}
          <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md border-b border-white/5" />

          <div className="relative z-10 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link href="/" className="flex items-center gap-4">
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
                    width={80}
                    height={30}
                    style={{ width: "auto", height: "auto" }}
                    className="brightness-110"
                  />
                </div>
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
                    width={80}
                    height={30}
                    style={{ width: "auto", height: "auto" }}
                    className="opacity-90"
                  />
                </div>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Link href="/" className="hover:text-[#00eeff] transition-colors relative group">
                Arena
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#00eeff] transition-all group-hover:w-full" />
              </Link>
              <span className="text-[#00eeff] relative">
                Gallery
                <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#00eeff]" />
              </span>
              <Link href="/leaderboard" className="hover:text-[#00eeff] transition-colors relative group">
                Leaderboard
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#00eeff] transition-all group-hover:w-full" />
              </Link>
              <Link href="/merchandise" className="hover:text-[#00eeff] transition-colors relative group">
                Merchandise
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#00eeff] transition-all group-hover:w-full" />
              </Link>
              <a
                href="https://cloud9.devpost.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-white"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00eeff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00eeff]"></span>
                </span>
                TOURNAMENT
              </a>
            </div>
          </div>
        </nav>

        <header className="px-8 pt-16 pb-12 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Tactical Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 backdrop-blur-md relative overflow-hidden"
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00eeff]">
                Historical Archive
              </span>
              {/* Animated scan line */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#00eeff]/20 to-transparent"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic leading-none">
              HALL OF{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00eeff] via-blue-500 to-indigo-600"
                style={{ textShadow: '0 0 60px rgba(0, 238, 255, 0.5)' }}
              >
                VICTORY
              </span>
            </h1>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-[#00eeff]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#00eeff]" />
              <div className="w-8 h-[1px] bg-white/30" />
              <div className="w-1.5 h-1.5 rotate-45 bg-blue-500" />
              <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-blue-500" />
            </div>

            <p className="text-slate-400 font-bold max-w-2xl mx-auto mb-10 uppercase tracking-wide text-sm">
              <span className="text-white">Immortalized moments</span> from the arena. The legacy of champions,
              captured in <span className="text-[#00eeff]">high-definition protocol.</span>
            </p>

            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="SEARCH BY NAME OR COUNTRY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border-2 border-[#00eeff]/20 px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00eeff]/50 transition-all font-bold tracking-wider"
                style={{
                  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)'
                }}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00eeff]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </header>

        <main className="container mx-auto px-8 pb-32">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#00eeff]/20 border-t-[#00eeff] rounded-full animate-spin mb-6" />
              <p className="text-[#00eeff] font-black uppercase tracking-[0.3em] animate-pulse italic">
                Synchronizing Archive...
              </p>
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div
              className="text-center py-20 bg-[#0a0e13]/80 border border-[#00eeff]/20 backdrop-blur-md relative overflow-hidden"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
              }}
            >
              <p className="text-3xl font-black text-slate-600 uppercase italic mb-4">
                Archive Empty
              </p>
              <p className="text-slate-500 font-bold uppercase tracking-widest max-w-md mx-auto mb-10">
                Try a different search protocol or win a game to establish your legacy.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#00eeff] to-blue-600 text-white font-black uppercase tracking-[0.2em] transition-all hover:scale-105"
                style={{
                  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)'
                }}
              >
                <span>▶</span>
                Enter the Arena
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {!selectedFolder ? (
                /* Folder View */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                  {Object.entries(groups).map(
                    ([groupKey, userImages], index) => {
                      const [username, country] = groupKey.split("|");
                      return (
                        <motion.div
                          key={groupKey}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -5 }}
                          onClick={() => setSelectedFolder(groupKey)}
                          className="group cursor-pointer flex flex-col items-center"
                        >
                          <div className="relative w-full aspect-square mb-4">
                            <div
                              className="absolute inset-0 bg-gradient-to-br from-[#00eeff]/10 to-transparent border border-[#00eeff]/20 opacity-80 group-hover:opacity-100 transition-all"
                              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)' }}
                            />
                            <Image
                              src="/assets/images/backgrounds/folder_logo.webp"
                              alt="Folder"
                              fill
                              className="object-contain opacity-40 group-hover:opacity-80 transition-opacity p-6"
                            />
                            <div className="absolute top-2 right-4 flex items-center gap-1">
                              <span className="text-[10px] font-black text-[#00eeff]/60 group-hover:text-[#00eeff]">
                                {userImages.length}
                              </span>
                              <div className="w-1 h-1 rotate-45 bg-[#00eeff]" />
                            </div>
                            {/* Corner accent */}
                            <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none">
                              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#00eeff] to-transparent" />
                              <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-[#00eeff] to-transparent" />
                            </div>
                          </div>
                          <div className="text-center w-full px-2">
                            <h3 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-[#00eeff] transition-colors truncate">
                              {username}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-px w-4 bg-[#00eeff]/20" />
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                                {country}
                              </p>
                              <div className="h-px w-4 bg-[#00eeff]/20" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </div>
              ) : (
                /* Images in Folder View */
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-[#00eeff]/20 pb-6">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setSelectedFolder(null)}
                        className="group flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-[#00eeff]/10 border border-white/10 hover:border-[#00eeff]/50 transition-all"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                      >
                        <span className="text-xl group-hover:text-[#00eeff] group-hover:-translate-x-1 transition-all">←</span>
                      </button>
                      <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                          {selectedFolder.split("|")[0]}
                          <span className="text-[#00eeff] text-xs ml-3 font-black tracking-[0.2em] not-italic opacity-60 uppercase">
                            // {groups[selectedFolder]?.length || 0} ARCHIVES FOUND
                          </span>
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 rotate-45 bg-[#00eeff]" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00eeff]">
                            {selectedFolder.split("|")[1]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                      {groups[selectedFolder]?.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -5 }}
                          onClick={() => setSelectedImage(item)}
                          className="group relative aspect-[4/5] bg-[#0a0e13] border-2 border-white/10 hover:border-[#00eeff]/50 overflow-hidden cursor-pointer transition-all duration-300 shadow-2xl"
                          style={{
                            clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                          }}
                        >
                          <Image
                            src={item.url}
                            alt={`${item.username}'s card`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          {/* Tactical Overlays */}
                          <div className="absolute top-4 left-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="h-px w-8 bg-[#00eeff]" />
                            <div className="text-[8px] font-black text-[#00eeff] tracking-widest uppercase">SYS.REC //</div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                                {getGameTitle(item.gameType)}
                              </span>
                              <div className="h-px flex-1 mx-3 bg-white/10" />
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${getGameColor(
                                  item.gameType,
                                )}`}
                              >
                                {item.score.toLocaleString()} PTS
                              </span>
                            </div>
                            <div className="text-2xl font-black text-white uppercase tracking-tighter truncate italic">
                              {item.username}
                            </div>
                          </div>

                          {/* Scan line effect on hover */}
                          <motion.div
                            animate={{ y: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-[#00eeff]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100"
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Lightbox - Tactical Redesign */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/95 p-4 md:p-8 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl aspect-[4/5] shadow-[0_0_80px_rgba(0,238,255,0.2)] border-2 border-[#00eeff]/30"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
              }}
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.username}
                fill
                className="object-contain"
              />

              {/* HUD Elements */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="w-2 h-2 rotate-45 bg-[#00eeff]" />
                <div className="text-[10px] font-black text-[#00eeff] uppercase tracking-[0.3em]">
                  ENCRYPTED // {selectedImage.id.slice(0, 8)}
                </div>
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-10 group"
              >
                <span className="text-[#00eeff] font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-white transition-colors">
                  TERMINATE VIEW [ESC]
                </span>
                <div className="h-[2px] w-full bg-[#00eeff] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
              </button>

              <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <div className="text-white text-3xl font-black uppercase italic tracking-tighter">
                    {selectedImage.username}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rotate-45 bg-[#00eeff]" />
                    <div className="text-[#00eeff] text-[10px] font-black uppercase tracking-[0.2em]">
                      {getGameTitle(selectedImage.gameType)} // RANK RECORDED
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                    DATE_LOG
                  </div>
                  <div className="text-white font-bold text-sm">
                    {new Date(selectedImage.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00eeff] to-transparent" />
                <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#00eeff] to-transparent" />
              </div>
              <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-[#00eeff] to-transparent" />
                <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-[#00eeff] to-transparent" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
