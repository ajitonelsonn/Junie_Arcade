"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const heroImages = [
  "/assets/images/hero/Jinx_Render.webp",
  "/assets/images/hero/Yasuo_Render.webp",
  "/assets/images/hero/Lux_Render.webp",
  "/assets/images/hero/Ezreal_Render.webp",
  "/assets/images/hero/Jett_Artwork_Full.webp",
  "/assets/images/hero/Phoenix_Artwork_Full.webp",
  "/assets/images/hero/Reyna_Artwork_Full.webp",
  "/assets/images/hero/Sage_Artwork_Full.webp",
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
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 opacity-20 mix-blend-overlay">
        <Image
          src="/assets/images/backgrounds/lol_.webp"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          quality={60}
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />

      {/* Animated Orbs - reduced on mobile */}
      {!isMobile && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.4, 0.3],
              x: [0, -80, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
            className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"
          />
        </>
      )}

      {/* Single orb on mobile for performance */}
      {isMobile && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]"
        />
      )}

      {/* Floating Hero Characters - Decoration (Desktop only for performance) */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0.8, 1, 1.2],
                x: i % 2 === 0 ? [0, 60, 0] : [0, -60, 0],
                y: [0, -120, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                delay: i * 3,
                ease: "linear",
              }}
              style={{ willChange: "transform" }}
              className={`absolute ${
                i === 0
                  ? "top-[10%] left-[5%]"
                  : i === 1
                  ? "top-[20%] right-[10%]"
                  : i === 2
                  ? "top-[40%] left-[15%]"
                  : i === 3
                  ? "top-[60%] right-[5%]"
                  : i === 4
                  ? "bottom-[10%] left-[10%]"
                  : i === 5
                  ? "bottom-[20%] right-[20%]"
                  : i === 6
                  ? "bottom-[40%] left-[5%]"
                  : "bottom-[60%] right-[15%]"
              } w-72 h-[450px]`}
            >
              <Image
                src={img}
                alt="Hero"
                fill
                sizes="288px"
                loading="lazy"
                className="object-contain filter brightness-110 contrast-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
