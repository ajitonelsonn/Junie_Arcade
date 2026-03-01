"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { useEffect, useState } from "react";

const heroImages = [
  "/assets/images/hero/APA.png",
  "/assets/images/hero/Blaber.png",
  "/assets/images/hero/Thanatos.png",
  "/assets/images/hero/Xeppaa.png",
  "/assets/images/hero/Zellsis.png",
  "/assets/images/hero/Zven.png",
  "/assets/images/hero/penny.png",
  "/assets/images/hero/v1c.png",
  "/assets/images/hero/oxy.png",
  "/assets/images/hero/vulcan.png",
];

export default function AnimatedBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base Background Image */}
      <div className="absolute inset-0 opacity-15 mix-blend-overlay">
        <Image
          src="/assets/images/backgrounds/Gemini_Generated_Image_vx01sgvx01sgvx01.webp"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          quality={60}
          className="object-cover"
        />
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/30 via-[#020617]/70 to-[#020617]" />

      {/* Hexagonal Grid Pattern - VALORANT/LoL Style */}
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
        style={{ background: 'linear-gradient(90deg, transparent, #ff4655, #00eeff, transparent)' }}
      />

      {/* Animated Orbs - VALORANT/LoL Colors */}
      {!isMobile && (
        <>
          {/* Red/Orange Orb - VALORANT accent */}
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

          {/* Cyan/Blue Orb - Cloud9 accent */}
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
            <div className="w-full h-full bg-gradient-to-br from-[#00eeff]/40 to-blue-600/20 rounded-full" />
          </m.div>

          {/* Purple Orb - Memory Match accent */}
          <m.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, -40, 0],
              y: [0, -60, 0],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
            className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          >
            <div className="w-full h-full bg-gradient-to-br from-[#c284f9]/30 to-purple-600/20 rounded-full" />
          </m.div>
        </>
      )}

      {/* Single orb on mobile for performance */}
      {isMobile && (
        <m.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full blur-[100px]"
        >
          <div className="w-full h-full bg-gradient-to-br from-[#ff4655]/30 via-[#00eeff]/20 to-[#c284f9]/30 rounded-full" />
        </m.div>
      )}

      {/* Floating Hero Characters - Desktop only */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {heroImages.slice(0, 8).map((img, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.85, 1, 1.1],
                x: i % 2 === 0 ? [0, 40, 0] : [0, -40, 0],
                y: [0, -80, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                delay: i * 3,
                ease: "linear",
              }}
              style={{ willChange: "transform" }}
              className={`absolute ${
                [
                  "top-[8%] left-[3%]",
                  "top-[15%] right-[5%]",
                  "top-[35%] left-[8%]",
                  "top-[50%] right-[3%]",
                  "bottom-[20%] left-[5%]",
                  "bottom-[30%] right-[10%]",
                  "bottom-[10%] left-[12%]",
                  "top-[70%] right-[8%]",
                ][i]
                } w-56 h-[380px]`}
            >
              <Image
                src={img}
                alt="Hero"
                fill
                sizes="224px"
                loading="lazy"
                quality={50}
                className="object-contain filter brightness-90 contrast-110 grayscale-[30%]"
                style={{ filter: 'brightness(0.9) contrast(1.1) saturate(0.7)' }}
              />
            </m.div>
          ))}
        </div>
      )}

      {/* Corner Decorative Elements - Tactical HUD Style */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#ff4655] to-transparent" />
        <div className="absolute top-4 left-4 h-20 w-[1px] bg-gradient-to-b from-[#ff4655] to-transparent" />
        <div className="absolute top-8 left-8 text-[8px] font-black text-[#ff4655]/50 uppercase tracking-[0.3em]">
          SYS//
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute top-4 right-4 w-20 h-[1px] bg-gradient-to-l from-[#00eeff] to-transparent" />
        <div className="absolute top-4 right-4 h-20 w-[1px] bg-gradient-to-b from-[#00eeff] to-transparent" />
        <div className="absolute top-8 right-8 text-[8px] font-black text-[#00eeff]/50 uppercase tracking-[0.3em]">
          //LINK
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute bottom-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#c284f9] to-transparent" />
        <div className="absolute bottom-4 left-4 h-20 w-[1px] bg-gradient-to-t from-[#c284f9] to-transparent" />
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
        <div className="absolute bottom-4 right-4 w-20 h-[1px] bg-gradient-to-l from-white/50 to-transparent" />
        <div className="absolute bottom-4 right-4 h-20 w-[1px] bg-gradient-to-t from-white/50 to-transparent" />
        <div className="absolute bottom-8 right-8 flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[7px] font-black text-white/30 uppercase tracking-wider">Online</span>
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(2, 6, 23, 0.4) 100%)'
      }} />
    </div>
  );
}
