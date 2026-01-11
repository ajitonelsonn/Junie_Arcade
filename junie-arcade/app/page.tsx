import GameCard from './components/GameCard'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/images/backgrounds/bg-space.jpg')] opacity-20 bg-cover bg-center" />

        <header className="relative z-10 p-8 text-center">
          <div className="flex justify-center items-center gap-8 mb-6">
            <Image
              src="/assets/images/logos/cloud9-logo.png"
              alt="Cloud9"
              width={120}
              height={40}
              className="object-contain"
            />
            <Image
              src="/assets/images/logos/jetbrains-logo.png"
              alt="JetBrains"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl">
            JUNIE'S ARCADE
          </h1>
          <p className="text-2xl text-white/90 font-medium mb-2">
            Three Games. One Champion. Are You Ready?
          </p>
          <p className="text-lg text-white/80">
            Powered by Cloud9 x JetBrains
          </p>
        </header>

        <main className="relative z-10 container mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <GameCard
              title="Reflex Arena"
              description="Click targets as fast as you can! Test your reaction speed."
              icon="⚡"
              href="/games/reflex"
              gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
            />
            <GameCard
              title="Jump Master"
              description="Endless runner! Jump over obstacles and collect coins."
              icon="🚀"
              href="/games/jump"
              gradient="bg-gradient-to-br from-green-400 to-cyan-500"
            />
            <GameCard
              title="Memory Match"
              description="Find the pairs! Classic memory card game with esports theme."
              icon="🧠"
              href="/games/memory"
              gradient="bg-gradient-to-br from-purple-400 to-pink-500"
            />
          </div>

          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-4xl font-bold text-white mb-6 text-center">
                🏆 Today's Top Players
              </h2>
              <div className="text-center text-white/80 text-lg">
                Play your first game to see the leaderboard!
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 text-center text-white/70 py-8">
          <p>Built with Next.js, TypeScript, Phaser 3, and Tailwind CSS</p>
          <p className="mt-2">For Cloud9 x JetBrains Hackathon - Category 4</p>
        </footer>
      </div>
    </div>
  )
}
