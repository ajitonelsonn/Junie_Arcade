"use client";

import { m } from "framer-motion";
import { useStats } from "../hooks/useStats";
import CountryStatsSlider from "./CountryStatsSlider";

export default function StatsSection() {
    const { stats, loading, error } = useStats();

    if (error) {
        return null; // Silently fail to not break the page
    }

    return (
        <>
            <m.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16 sm:mb-20"
            >
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#ff4655]/50" />
                        <div className="w-2 h-2 rotate-45 bg-[#ff4655]/50" />
                        <div className="w-8 h-px bg-white/20" />
                        <div className="w-2 h-2 rotate-45 bg-[#00eeff]/50" />
                        <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#00eeff]/50" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mb-2">
                        Global Arena Stats
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-[0.15em]">
                        Live Player Statistics
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
                    {/* Total Players */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="group relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.1), rgba(255, 70, 85, 0.05))',
                            border: '1px solid rgba(255, 70, 85, 0.2)',
                            clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)'
                        }}
                    >
                        {/* Animated scan line */}
                        <m.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#ff4655]/10 to-transparent pointer-events-none"
                        />

                        <div className="relative z-10 p-4 sm:p-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-[#ff4655] rounded-full animate-pulse" />
                                <span className="text-[9px] sm:text-[10px] font-black text-[#ff4655] uppercase tracking-[0.2em]">
                                    Players
                                </span>
                            </div>

                            <div className="text-2xl sm:text-4xl font-black text-white mb-1">
                                {loading ? (
                                    <div className="animate-pulse bg-white/20 h-8 sm:h-12 rounded w-16 mx-auto" />
                                ) : (
                                    <m.span
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] to-[#ff6b7a]"
                                    >
                                        {stats?.totalPlayers?.toLocaleString() || '0'}
                                    </m.span>
                                )}
                            </div>

                            <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-wider">
                                Total Registered
                            </p>
                        </div>
                    </m.div>

                    {/* Total Countries */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), rgba(0, 238, 255, 0.05))',
                            border: '1px solid rgba(0, 238, 255, 0.2)',
                            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                        }}
                    >
                        {/* Animated scan line */}
                        <m.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#00eeff]/10 to-transparent pointer-events-none"
                        />

                        <div className="relative z-10 p-4 sm:p-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-[#00eeff] rounded-full animate-pulse" />
                                <span className="text-[9px] sm:text-[10px] font-black text-[#00eeff] uppercase tracking-[0.2em]">
                                    Countries
                                </span>
                            </div>

                            <div className="text-2xl sm:text-4xl font-black text-white mb-1">
                                {loading ? (
                                    <div className="animate-pulse bg-white/20 h-8 sm:h-12 rounded w-16 mx-auto" />
                                ) : (
                                    <m.span
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-[#00eeff] to-[#4dd0e1]"
                                    >
                                        {stats?.totalCountries?.toLocaleString() || '0'}
                                    </m.span>
                                )}
                            </div>

                            <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-wider">
                                Global Reach
                            </p>
                        </div>
                    </m.div>
                </div>

                {/* Protocol Badge */}
                <m.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6"
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                        }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                            Real-time Statistics // Live Data
                        </span>
                    </div>
                </m.div>
            </m.section>

            {/* Country Statistics Slider */}
            <CountryStatsSlider />
        </>
    );
}