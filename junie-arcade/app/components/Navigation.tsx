'use client';

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useMusic } from "./MusicProvider";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMuted, toggleMute } = useMusic();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinks = [
    { href: "/", label: "Arena" },
    { href: "/gallery", label: "Gallery" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/merchandise", label: "Merchandise" },
  ];

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 transition-all duration-300 ${isScrolled ? 'py-2 sm:py-3' : 'py-4 sm:py-6'}`}>
      {/* Background blur bar */}
      <div className={`absolute inset-0 backdrop-blur-md border-b border-white/5 transition-all duration-300 ${isScrolled ? 'bg-[#020617]/85' : 'bg-[#020617]/60'}`} />

      <div className="relative z-10 flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo Section */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center transition-all duration-300 ${isScrolled ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-4'}`}
        >
          {/* Logo Container with angular frame */}
          <div
            className={`relative transition-all duration-300 ${isScrolled ? 'p-1 sm:p-1.5' : 'p-1.5 sm:p-2'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.1), transparent)',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}
          >
            <Image
              src="/assets/images/logos/cloud9-logo.png"
              alt="Cloud9"
              width={80}
              height={28}
              sizes="80px"
              quality={60}
              style={{ width: 'auto', height: 'auto' }}
              className={`brightness-110 transition-all duration-300 ${isScrolled ? 'w-12 sm:w-14 md:w-15' : 'w-16 sm:w-20 md:w-20'}`}
            />
          </div>

          {/* Divider */}
          <div className={`flex items-center gap-1.5 transition-all duration-300 ${isScrolled ? 'scale-75' : 'scale-100'}`}>
            <div className="w-1 h-1 rotate-45 bg-[#ff4655]" />
            <div className="h-5 sm:h-6 w-px bg-white/20" />
            <div className="w-1 h-1 rotate-45 bg-[#00eeff]" />
          </div>

          {/* JetBrains Logo */}
          <div
            className={`relative transition-all duration-300 ${isScrolled ? 'p-1 sm:p-1.5' : 'p-1.5 sm:p-2'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 238, 255, 0.1), transparent)',
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
            }}
          >
            <Image
              src="/assets/images/logos/jetbrains-logo.png"
              alt="JetBrains"
              width={80}
              height={28}
              sizes="80px"
              quality={60}
              style={{ width: 'auto', height: 'auto' }}
              className={`opacity-90 hover:opacity-100 transition-all duration-300 ${isScrolled ? 'w-12 sm:w-14 md:w-15' : 'w-16 sm:w-20 md:w-20'}`}
            />
          </div>
        </m.div>

        {/* Desktop Navigation */}
        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-1"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 group ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {/* Active/Hover Background */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(255, 70, 85, 0.15), rgba(0, 238, 255, 0.05))'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)',
                    clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)'
                  }}
                />
                {/* Active indicator */}
                {isActive && (
                  <m.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-[#ff4655] to-[#00eeff]"
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}

          {/* Tournament Link - Special styling */}
          <a
            href="https://cloud9.devpost.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative ml-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 group"
          >
            <div
              className="absolute inset-0 opacity-100"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.2), rgba(255, 70, 85, 0.05))',
                border: '1px solid rgba(255, 70, 85, 0.3)',
                clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)'
              }}
            />
            <span className="relative z-10 flex items-center gap-1.5 text-[#ff4655] group-hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4655] animate-pulse" />
              Tournament
            </span>
          </a>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            tabIndex={-1}
            className="relative ml-2 p-2 text-slate-400 hover:text-white transition-colors group"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'rgba(255,255,255,0.05)',
                clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)'
              }}
            />
            <span className="relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            </span>
          </button>

          {/* Speaker Button - Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="relative ml-2 p-2 text-slate-400 hover:text-white transition-colors group"
            title={isMuted ? "Unmute Music" : "Mute Music"}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'rgba(255,255,255,0.05)',
                clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)'
              }}
            />
            <span className="relative z-10">
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </span>
          </button>
        </m.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            tabIndex={-1}
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)'
            }}
          >
            <span className="relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            </span>
          </button>

          {/* Mobile Speaker Button */}
          <button
            onClick={toggleMute}
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? "Unmute Music" : "Mute Music"}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)'
            }}
          >
            <span className="relative z-10">
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative p-2"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)'
            }}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <m.div
                animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-[#ff4655]"
              />
              <m.div
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-white/60"
              />
              <m.div
                animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-[#00eeff]"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <m.div
        initial={false}
        animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden relative z-20"
      >
        <div className="pt-4 pb-2 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block relative px-4 py-3 text-sm font-black uppercase tracking-wider transition-all ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              >
                <div
                  className={`absolute inset-0 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    background: 'linear-gradient(90deg, rgba(255, 70, 85, 0.15), transparent)',
                    borderLeft: '2px solid #ff4655'
                  }}
                />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}

          {/* Tournament Link Mobile */}
          <a
            href="https://cloud9.devpost.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block relative px-4 py-3 text-sm font-black uppercase tracking-wider text-[#ff4655]"
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(255, 70, 85, 0.1), transparent)',
                borderLeft: '2px solid #ff4655'
              }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4655] animate-pulse" />
              Tournament
            </span>
          </a>
        </div>
      </m.div>
    </nav>
    {/* Spacer to push content below fixed nav */}
    <div className="h-16 sm:h-20" />
    </>
  );
}
