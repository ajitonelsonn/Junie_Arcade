# 🎮 Junie's Arcade

A 3-in-1 mini-game arcade platform built for the **Cloud9 x JetBrains Hackathon (Category 4)**.

## 🚀 Features

### Three Exciting Games:

1. **⚡ Reflex Arena** - Click targets as fast as you can! Test your reaction speed with time bonuses and combo multipliers.

2. **🚀 Jump Master** - Endless runner where you jump over obstacles and collect coins. Progressive difficulty!

3. **🧠 Memory Match** - Classic memory card game featuring League of Legends champions and VALORANT agents.

### Additional Features:
- 🏆 Real-time leaderboard system
- 💾 PostgreSQL database for score persistence
- 🎨 Modern, responsive UI with Tailwind CSS
- 🎯 Smooth animations with Framer Motion
- 🎮 Phaser 3 game engine integration
- 📱 Mobile-friendly design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Game Engine**: Phaser 3
- **Database**: PostgreSQL (Neon.tech recommended)
- **ORM**: Prisma
- **Animations**: Framer Motion
- **Deployment**: Vercel-ready

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon.tech free tier works great!)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd junie-arcade
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

   For Neon.tech:
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string
   - Paste it as the `DATABASE_URL` value

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [https://www.juniearcade.fun](https://www.juniearcade.fun)

## 🎯 How to Play

### Reflex Arena
- Click on good targets (stars, trophies, gems, coins) to score points
- Avoid bad targets (bugs, viruses, bombs) or lose points
- Quick reactions earn time bonuses
- Build combos for multiplier bonuses
- 60 seconds to get the highest score!

### Jump Master
- Press SPACE or CLICK to jump
- Avoid obstacles (bugs)
- Collect Cloud9 logos (+25 points) and coins (+10 points)
- Game speeds up as you progress
- Survive as long as possible!

### Memory Match
- Click to flip two cards
- Match pairs of champions and agents
- Complete all 8 pairs within 120 seconds
- Speed bonuses for quick matches
- Perfect game bonus if no mistakes!

## 📁 Project Structure

```
junie-arcade/
├── app/
│   ├── api/
│   │   ├── leaderboard/route.ts    # Leaderboard API
│   │   └── scores/route.ts         # Score saving API
│   ├── components/
│   │   ├── GameCard.tsx            # Game selection cards
│   │   ├── Leaderboard.tsx         # Leaderboard component
│   │   └── PhaserGame.tsx          # Phaser wrapper
│   ├── games/
│   │   ├── reflex/page.tsx         # Reflex Arena page
│   │   ├── jump/page.tsx           # Jump Master page
│   │   └── memory/page.tsx         # Memory Match page
│   ├── lib/
│   │   ├── phaser/
│   │   │   ├── ReflexArenaScene.ts # Reflex game logic
│   │   │   └── JumpMasterScene.ts  # Jump game logic
│   │   ├── prisma.ts               # Prisma client
│   │   └── types.ts                # TypeScript types
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── prisma/
│   └── schema.prisma               # Database schema
├── public/
│   └── assets/                     # Game assets
│       ├── images/
│       └── sounds/
└── package.json
```

## 🗄️ Database Schema

```prisma
enum GameType {
  REFLEX_ARENA
  JUMP_MASTER
  MEMORY_MATCH
}

model Player {
  id        String   @id @default(cuid())
  username  String
  createdAt DateTime @default(now())
  scores    Score[]
}

model Score {
  id          String   @id @default(cuid())
  playerId    String
  gameType    GameType
  score       Int
  accuracy    Float?
  time        Float?
  maxCombo    Int?
  distance    Float?
  createdAt   DateTime @default(now())
}
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `DATABASE_URL`
   - Deploy!

### Environment Variables for Production
- `DATABASE_URL` - Your PostgreSQL connection string

## 🎨 Assets

All game assets are included in the `/public/assets` folder:
- **Logos**: Cloud9, JetBrains, IDE icons
- **Characters**: Junie sprites (idle, happy, sad, jump, run)
- **Targets**: Stars, trophies, gems, coins, bugs, viruses, bombs
- **Cards**: League of Legends champions, VALORANT agents
- **Backgrounds**: Space, arena, tech themes

## 🏆 Hackathon Details

**Category**: 4 - Event Mini-Game
**Prize**: $4,000 + Benefits
**Theme**: Cloud9 x JetBrains
**Target**: Event booth engagement at LCS/VCT events

### Key Requirements Met:
✅ Fast & engaging (< 3 minutes per game)
✅ Intuitive controls (mouse-only, space bar)
✅ Cloud9 & JetBrains themed
✅ Live leaderboard for competition
✅ High replayability
✅ Instant gratification

## 📝 Development Notes

### Adding New Games
1. Create a new scene in `app/lib/phaser/`
2. Create a new page in `app/games/`
3. Add game card to home page
4. Update database schema if needed

### Customizing Styles
- Tailwind config: `tailwind.config.ts`
- Global styles: `app/globals.css`

### Database Management
- View data: `npx prisma studio`
- Reset database: `npx prisma db push --force-reset`
- Migrations: `npx prisma migrate dev`

## 🤝 Contributing

This project was built for the Cloud9 x JetBrains Hackathon. Feel free to fork and improve!

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

- **Cloud9** - Esports organization and branding
- **JetBrains** - IDE tools and Junie mascot
- **Phaser 3** - Game engine
- **Next.js** - React framework
- **Vercel** - Hosting platform
- **Neon.tech** - PostgreSQL database

---

Built with ❤️ for the Cloud9 x JetBrains Hackathon 2024

**Good luck, and may the best score win! 🚀**
