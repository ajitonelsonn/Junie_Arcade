'use client';

import { m } from "framer-motion";
import GameCard from "./GameCard";

export default function GamesGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-32">
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GameCard
          title="Reflex Arena"
          description="High-intensity reaction test. Neutralize bugs, avoid traps, and sync with the system."
          icon=""
          href="/games/reflex"
          gradient="from-yellow-400 via-orange-500 to-red-500"
          brandIcon="/assets/images/logos/webstorm-logo.png"
          gameLogo="/assets/images/logos/game_logo/reflex_arena.png"
        />
      </m.div>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GameCard
          title="Jump Master"
          description="Traverse the digital void. Master momentum as you navigate the endless cloud pipeline."
          icon=""
          href="/games/jump"
          gradient="from-cyan-400 via-blue-500 to-indigo-600"
          brandIcon="/assets/images/logos/intellij-logo.png"
          gameLogo="/assets/images/logos/game_logo/jump_master.png"
        />
      </m.div>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GameCard
          title="Memory Match"
          description="Pattern recognition at scale. Link the identities of champions across the multiverse."
          icon=""
          href="/games/memory"
          gradient="from-purple-400 via-fuchsia-500 to-pink-600"
          brandIcon="/assets/images/logos/pycharm-logo.png"
          gameLogo="/assets/images/logos/game_logo/memory_match.png"
        />
      </m.div>
    </div>
  );
}
