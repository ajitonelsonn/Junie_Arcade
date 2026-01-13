'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navigation() {
  return (
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <Image
          src="/assets/images/logos/cloud9-logo.png"
          alt="Cloud9"
          width={100}
          height={35}
          sizes="100px"
          className="brightness-110"
        />
        <div className="h-6 w-px bg-white/20" />
        <Image
          src="/assets/images/logos/jetbrains-logo.png"
          alt="JetBrains"
          width={100}
          height={35}
          sizes="100px"
          className="opacity-90 hover:opacity-100 transition-opacity"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400"
      >
        <Link
          href="/"
          className="text-white hover:text-white transition-colors"
        >
          Arena
        </Link>
        <Link
          href="/gallery"
          className="hover:text-white cursor-pointer transition-colors"
        >
          Gallery
        </Link>
        <Link
          href="/leaderboard"
          className="hover:text-white cursor-pointer transition-colors"
        >
          Leaderboard
        </Link>
        <a
          href="https://cloud9.devpost.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white cursor-pointer transition-colors"
        >
          Tournament
        </a>
      </motion.div>
    </nav>
  );
}
