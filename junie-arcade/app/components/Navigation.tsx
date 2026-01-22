'use client';

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Arena" },
    { href: "/gallery", label: "Gallery" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/merchandise", label: "Merchandise" },
  ];

  return (
    <nav className="relative z-50 px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
      {/* Background blur bar */}
      <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md border-b border-white/5" />

      <div className="relative z-10 flex justify-between items-center">
        {/* Logo Section */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 sm:gap-4"
        >
          {/* Logo Container with angular frame */}
          <div
            className="relative p-1.5 sm:p-2"
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
              style={{ width: 'auto', height: 'auto' }}
              className="brightness-110 w-16 sm:w-20 md:w-[80px]"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rotate-45 bg-[#ff4655]" />
            <div className="h-5 sm:h-6 w-px bg-white/20" />
            <div className="w-1 h-1 rotate-45 bg-[#00eeff]" />
          </div>

          {/* JetBrains Logo */}
          <div
            className="relative p-1.5 sm:p-2"
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
              style={{ width: 'auto', height: 'auto' }}
              className="opacity-90 hover:opacity-100 transition-opacity w-16 sm:w-20 md:w-[80px]"
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
        </m.div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative p-2"
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
  );
}
