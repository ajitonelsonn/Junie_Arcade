"use client";

import { m } from "framer-motion";
import { useCountryStats } from "../hooks/useCountryStats";
import { useState, useEffect } from "react";
import FlagIcon from "./FlagIcon";
import { getCountryCode } from "../utils/countryUtils";

export default function CountryStatsSlider() {
    const { countryStats, loading, error } = useCountryStats();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(countryStats.length / itemsPerSlide);

    // Auto-slide functionality
    useEffect(() => {
        if (!isAutoPlaying || countryStats.length === 0 || totalSlides <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalSlides);
        }, 4000);

        return () => clearInterval(interval);
    }, [countryStats.length, isAutoPlaying, totalSlides]);

    if (error || countryStats.length === 0) {
        return null; // Silently fail to not break the page
    }

    const nextSlide = () => {
        if (totalSlides > 1) {
            setCurrentIndex((prev) => (prev + 1) % totalSlides);
            setIsAutoPlaying(false);
        }
    };

    const prevSlide = () => {
        if (totalSlides > 1) {
            setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
            setIsAutoPlaying(false);
        }
    };

    // Get current slide items
    const getCurrentSlideItems = () => {
        const startIndex = currentIndex * itemsPerSlide;
        return countryStats.slice(startIndex, startIndex + itemsPerSlide);
    };

    const currentSlideItems = getCurrentSlideItems();

    return (
        <m.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 sm:mb-20"
        >
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#c284f9]/50" />
                    <div className="w-2 h-2 rotate-45 bg-[#c284f9]/50" />
                    <div className="w-8 h-px bg-white/20" />
                    <div className="w-2 h-2 rotate-45 bg-[#ff4655]/50" />
                    <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#ff4655]/50" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mb-2">
                    Global Leaderboard
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-[0.15em]">
                    Players by Country
                </p>
            </div>

            {/* Slider Container */}
            <div className="relative max-w-4xl mx-auto">
                {/* Navigation Buttons - Only show if more than 1 slide */}
                {totalSlides > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 group"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.1), rgba(255, 70, 85, 0.05))',
                                border: '1px solid rgba(255, 70, 85, 0.3)',
                                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                            }}
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4655] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 group"
                            style={{
                                background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), rgba(0, 238, 255, 0.05))',
                                border: '1px solid rgba(0, 238, 255, 0.3)',
                                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                            }}
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00eeff] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Current Slide Content */}
                <div className={`${totalSlides > 1 ? 'px-12 sm:px-16' : ''}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {currentSlideItems.map((country, itemIndex) => {
                            const globalRank = currentIndex * itemsPerSlide + itemIndex + 1;

                            return (
                                <m.div
                                    key={`${country.country}-${currentIndex}-${itemIndex}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                                    className="group relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(200, 132, 249, 0.1), rgba(200, 132, 249, 0.05))',
                                        border: '1px solid rgba(200, 132, 249, 0.2)',
                                        clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                                    }}
                                >
                                    {/* Animated scan line */}
                                    <m.div
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: itemIndex * 0.5 }}
                                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#c284f9]/10 to-transparent pointer-events-none"
                                    />

                                    <div className="relative z-10 p-4 sm:p-6 text-center">
                                        {/* Country Flag and Name */}
                                        <div className="flex items-center justify-center gap-3 mb-3">
                                            <div className="w-8 h-6 sm:w-10 sm:h-8 rounded overflow-hidden border border-white/20">
                                                <FlagIcon code={getCountryCode(country.country)} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
                                                {country.country}
                                            </span>
                                        </div>

                                        {/* Player Count */}
                                        <div className="text-xl sm:text-3xl font-black text-white mb-1">
                                            {loading ? (
                                                <div className="animate-pulse bg-white/20 h-6 sm:h-8 rounded w-12 mx-auto" />
                                            ) : (
                                                <m.span
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#c284f9] to-[#d8b4fe]"
                                                >
                                                    {country.playerCount.toLocaleString()}
                                                </m.span>
                                            )}
                                        </div>

                                        <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-wider">
                                            {country.playerCount === 1 ? 'Player' : 'Players'}
                                        </p>

                                        {/* Rank Badge */}
                                        <div className="absolute top-2 right-2">
                                            <div
                                                className="px-2 py-1 text-[8px] font-black text-[#c284f9] uppercase tracking-wider"
                                                style={{
                                                    background: 'rgba(200, 132, 249, 0.1)',
                                                    border: '1px solid rgba(200, 132, 249, 0.3)',
                                                    clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)'
                                                }}
                                            >
                                                #{globalRank}
                                            </div>
                                        </div>
                                    </div>
                                </m.div>
                            );
                        })}
                    </div>
                </div>

                {/* Slide Indicators - Only show if more than 1 slide */}
                {totalSlides > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsAutoPlaying(false);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? 'bg-[#c284f9] w-6'
                                        : 'bg-white/20 hover:bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Auto-play indicator - Only show if more than 1 slide */}
                {totalSlides > 1 && (
                    <div className="text-center mt-4">
                        <button
                            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            {isAutoPlaying ? 'Auto-sliding' : 'Manual'}
                        </button>
                    </div>
                )}

                {/* Stats Info */}
                <div className="text-center mt-6">
                    <p className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                        Showing {currentSlideItems.length} of {countryStats.length} countries
                        {totalSlides > 1 && ` • Slide ${currentIndex + 1} of ${totalSlides}`}
                    </p>
                </div>
            </div>
        </m.section>
    );
}