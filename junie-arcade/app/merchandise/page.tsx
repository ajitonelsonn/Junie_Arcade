"use client";

import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import Navigation from "../components/Navigation";


export default function MerchandisePage() {
  const merchandise = [
    {
      name: "Kelu Tais Timor-Leste",
      description:
        "A traditional handcrafted bracelet made from authentic Timor-Leste Tais, symbolizing strength and cultural identity.",
      image: "/assets/images/merchendise/kelu.webp",
      color: "from-amber-500 to-orange-600",
    },
    {
      name: "Selendang Tais Timor-Leste",
      description:
        "A beautiful, hand-woven traditional scarf representing the rich weaving heritage and hospitality of Timor-Leste.",
      image: "/assets/images/merchendise/Selendang.webp",
      color: "from-red-500 to-rose-700",
    },
  ];

  return (
    <LazyMotion features={domAnimation} strict>
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Navigation / Header Branding */}
      <div className="relative z-50">
        <Navigation />
      </div>
      
      {/* Animated Background - VALORANT/LoL Tactical Style */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <Image
            src="/assets/images/merchendise/tais_v_lol.webp"
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

        {/* Animated Orbs - Purple/Amber Colors */}
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
          <div className="w-full h-full bg-gradient-to-br from-[#c284f9]/40 to-amber-600/20 rounded-full" />
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
          <div className="w-full h-full bg-gradient-to-br from-amber-500/30 to-purple-600/20 rounded-full" />
        </m.div>

        {/* Corner Decorative Elements - Tactical HUD Style */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
          <div className="absolute top-4 left-4 w-20 h-[1px] bg-gradient-to-r from-[#c284f9] to-transparent" />
          <div className="absolute top-4 left-4 h-20 w-[1px] bg-gradient-to-b from-[#c284f9] to-transparent" />
          <div className="absolute top-8 left-8 text-[8px] font-black text-[#c284f9]/50 uppercase tracking-[0.3em]">
            MER//
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-30 hidden lg:block">
          <div className="absolute top-4 right-4 w-20 h-[1px] bg-gradient-to-l from-[#c284f9] to-transparent" />
          <div className="absolute top-4 right-4 h-20 w-[1px] bg-gradient-to-b from-[#c284f9] to-transparent" />
          <div className="absolute top-8 right-8 text-[8px] font-black text-[#c284f9]/50 uppercase tracking-[0.3em]">
            //CHANDISE
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <main className="container mx-auto px-8 py-10">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-24"
          >
            {/* Tactical Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 backdrop-blur-md relative overflow-hidden"
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c284f9]">
                Limited Supply
              </span>
              {/* Animated scan line */}
              <m.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#c284f9]/20 to-transparent"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-tighter italic leading-none">
              EXCLUSIVE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-[#c284f9]"
                style={{ textShadow: '0 0 60px rgba(194, 132, 249, 0.3)' }}
              >
                MERCHANDISE
              </span>
            </h1>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-[#c284f9]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#c284f9]" />
              <div className="w-8 h-[1px] bg-white/30" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
              <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-amber-500" />
            </div>

            <p className="text-slate-400 font-bold max-w-2xl mx-auto uppercase tracking-wide text-sm">
              <span className="text-white">A tribute to the rich heritage</span> of Timor-Leste. Exclusively
              available for our <span className="text-[#c284f9]">top competitors</span> at the VCT Event.
            </p>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-32">
            {merchandise.map((item, index) => (
              <m.div
                key={item.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`}
                />
                <div 
                  className="relative bg-[#0a0e13]/80 border border-white/10 overflow-hidden backdrop-blur-xl group-hover:border-[#c284f9]/50 transition-all duration-500 shadow-2xl"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
                  }}
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                    
                    {/* Corner accent */}
                    <div className="absolute top-6 left-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-px w-8 bg-[#c284f9]" />
                      <div className="text-[8px] font-black text-[#c284f9] tracking-widest uppercase">ITEM.ARCHIVE //</div>
                    </div>
                  </div>
                  <div className="p-10 relative">
                    <div className="absolute top-0 right-10 w-px h-10 bg-gradient-to-b from-[#c284f9] to-transparent" />
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight italic">
                      {item.name}
                    </h2>
                    <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-tight">
                      {item.description}
                    </p>
                  </div>

                  {/* Scan line effect on hover */}
                  <m.div
                    animate={{ y: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-[#c284f9]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100"
                  />
                </div>
              </m.div>
            ))}
          </div>

          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#0a0e13]/80 border-2 border-white/10 p-12 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl"
            style={{
              clipPath: 'polygon(0 40px, 40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)'
            }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="text-9xl font-black italic text-white">VCT</span>
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">
                HOW TO <span className="text-[#c284f9]">CLAIM</span>
              </h3>
              <div className="space-y-8 text-slate-400 max-w-2xl mx-auto font-bold uppercase tracking-tight">
                <p className="leading-relaxed">
                  To claim your merchandise,{" "}
                  <span className="text-white">
                    play the game directly at an LCS or VCT Event Booth
                  </span>
                  . If you finish in the{" "}
                  <span className="text-amber-400">TOP 3 OVERALL</span>,
                  you will receive one of these exclusive Timor-Leste treasures.
                </p>
                <div className="h-px w-24 bg-white/10 mx-auto" />
                <p className="text-sm">
                  Competition continues until all merchandise is claimed!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <div 
                    className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#c284f9]"
                    style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                  >
                    📍 LOCATION_TBD
                  </div>
                  <div 
                    className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#c284f9]"
                    style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                  >
                    📅 DATE_TBD
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#c284f9] to-transparent" />
              <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#c284f9] to-transparent" />
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-[#c284f9] to-transparent" />
              <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-[#c284f9] to-transparent" />
            </div>
          </m.div>

          {/* Photo at the Booth Section */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 backdrop-blur-md relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(194, 132, 249, 0.1), rgba(194, 132, 249, 0.05))',
                  border: '1px solid rgba(194, 132, 249, 0.3)',
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                }}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c284f9]">
                  📸 Event Booth
                </span>
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                CAPTURE YOUR{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-[#c284f9]">
                  MOMENT
                </span>
              </h3>
              <p className="text-slate-400 font-bold uppercase tracking-wide text-sm mt-4 max-w-2xl mx-auto">
                Capture your moment with the{" "}
                <span className="text-amber-400">Exclusive Merchandise from Timor-Leste</span>{" "}
                at the <span className="text-white">Cloud9 x JetBrains Event Booth</span>.
                Take a selfie, snap a photo, and share your experience with the community!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                {
                  src: "/assets/images/merchendise/selfie infront booth.webp",
                  alt: "Selfie in front of the event booth",
                  label: "SELFIE // BOOTH",
                },
                {
                  src: "/assets/images/merchendise/take a picture infront booth.webp",
                  alt: "Take a picture in front of the event booth",
                  label: "PHOTO // BOOTH",
                },
              ].map((photo, index) => (
                <m.div
                  key={photo.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group relative"
                >
                  <div
                    className="relative bg-[#0a0e13]/80 border border-white/10 overflow-hidden backdrop-blur-xl group-hover:border-[#c284f9]/50 transition-all duration-500 shadow-2xl"
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
                    }}
                  >
                    <div className="aspect-2/3 relative overflow-hidden">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-transparent opacity-40" />

                      {/* Corner accent */}
                      <div className="absolute top-6 left-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-px w-8 bg-[#c284f9]" />
                        <div className="text-[8px] font-black text-[#c284f9] tracking-widest uppercase">{photo.label}</div>
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        </main>

        <footer className="border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl py-12">
          <div className="container mx-auto px-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
            <p>
              © 2026 Cloud9 x JetBrains Hackathon // Timor-Leste Cultural
              Heritage Protocol
            </p>
          </div>
        </footer>
      </div>
    </div>
    </LazyMotion>
  );
}
