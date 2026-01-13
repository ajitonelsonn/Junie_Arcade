'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import Navigation from "../components/Navigation";
import AnimatedBackground from "../components/AnimatedBackground";

export default function MerchandisePage() {
  const merchandise = [
    {
      name: "Kelu Tais Timor",
      description: "A traditional handcrafted bracelet made from authentic Timor-Leste Tais, symbolizing strength and cultural identity.",
      image: "/assets/images/merchendise/kelu.webp",
      color: "from-amber-500 to-orange-600"
    },
    {
      name: "Selendang Tais Timor Leste",
      description: "A beautiful, hand-woven traditional scarf representing the rich weaving heritage and hospitality of Timor-Leste.",
      image: "/assets/images/merchendise/Selendang.webp",
      color: "from-red-500 to-rose-700"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />

        <main className="container mx-auto px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h1 className="text-6xl font-black text-white mb-6 uppercase tracking-tighter italic">
              Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Merchandise</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium">
              A tribute to the rich heritage of <span className="text-white">Timor-Leste</span>. 
              Exclusively available for our top competitors at the GDC Event.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-24">
            {merchandise.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-2xl`} />
                <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm group-hover:border-white/20 transition-all duration-500">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-8">
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight italic">{item.name}</h2>
                    <p className="text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-[3rem] p-12 text-center max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="text-9xl font-black italic">GDC</span>
            </div>


            <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter italic">How to Claim</h3>
            <div className="space-y-6 text-lg text-slate-300 max-w-2xl mx-auto">
              <p>
                To claim your merchandise, <span className="text-white font-bold italic">play the game directly at an LCS or VCT Event Booth</span>.
                If you finish in the <span className="text-amber-400 font-bold">TOP 3 OVERALL</span>, you will receive one of these exclusive Timor-Leste treasures.
              </p>
              <p className="text-base text-slate-400">
                Competition continues until all merchandise is claimed!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold uppercase tracking-widest text-white/60">
                  📍 TDB
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold uppercase tracking-widest text-white/60">
                  📅 TDB
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        <footer className="border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl py-16">
          <div className="container mx-auto px-8 text-center text-slate-600 text-xs">
            <p>© 2026 Cloud9 x JetBrains Hackathon // Timor-Leste Cultural Heritage</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
