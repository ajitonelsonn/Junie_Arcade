# Junie's Arcade

A multi-game tournament arcade platform built for the **Cloud9 x JetBrains "Sky's the Limit" Hackathon 2026**.

**Live Demo:** [https://www.juniearcade.fun](https://www.juniearcade.fun)

---

## Hackathon Submission

**Category 4: Event Mini-Game** - Develop a mini-game for fans at LCS or VCT Event Booths.

| Requirement               | Implementation                                       |
| ------------------------- | ---------------------------------------------------- |
| Fast & Engaging (< 3 min) | 50-100 second games with high replayability          |
| Intuitive Controls        | Mouse/click + SPACE only, no tutorial needed         |
| Thematic                  | VALORANT/LoL tactical aesthetic with Cloud9 branding |
| Live Leaderboard          | Real-time Champion Points ranking system             |

---

## Overview

Junie's Arcade is a **3-in-1 mini-game tournament experience** featuring fast-paced games designed for competitive play at Cloud9 and JetBrains events. Players compete for high scores, earn Champion Points, and climb the global leaderboard.

- **Perfect for:** Event booths, quick gaming sessions, competitive tournaments
- **Duration:** 2-5 minutes per tournament run
- **Platform:** Web-based (desktop recommended)

---

## Features

### Three Exciting Games

| Game             | Type           | Duration    | Description                                         |
| ---------------- | -------------- | ----------- | --------------------------------------------------- |
| **Jump Master**  | Endless Runner | 50 seconds  | Jump over obstacles, collect Cloud9 logos and coins |
| **Reflex Arena** | Reaction Game  | 50 seconds  | Click targets fast, build combos, avoid bad targets |
| **Memory Match** | Card Puzzle    | 100 seconds | Match champion pairs with combo multipliers         |

### Platform Features

- Global leaderboard with Champion Points system
- Achievement cards with social sharing
- Country-based filtering (176+ countries)
- Real-time score updates
- Mobile-friendly responsive design
- VALORANT/League of Legends tactical aesthetic

---

## Tech Stack

| Category        | Technologies                                  |
| --------------- | --------------------------------------------- |
| **Framework**   | Next.js 16, React 19, TypeScript              |
| **Game Engine** | Phaser 3                                      |
| **3D Graphics** | Three.js, React Three Fiber, React Three Drei |
| **Styling**     | Tailwind CSS 4                                |
| **Animations**  | Framer Motion                                 |
| **Database**    | PostgreSQL with Prisma ORM                    |
| **Storage**     | AWS S3 (achievement cards)                    |
| **Real-time**   | Socket.io                                     |

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI[React UI]
        Phaser[Phaser 3 Games]
        ThreeJS[Three.js 3D]
    end

    subgraph Server["Next.js Server"]
        Pages[App Router]
        API[API Routes]
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL)]
        S3[(AWS S3)]
    end

    Client --> Server
    Server --> Data
```

For detailed architecture diagrams, see [diagram/README.md](diagram/README.md).

---

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup Steps

1. **Clone and navigate to the project**

   ```bash
   cd junie-arcade
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

   # API Authentication
   API_SECRET_KEY="your-generated-key"
   NEXT_PUBLIC_API_KEY="your-generated-key"

   # AWS S3 (for achievement cards)
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   S3_BUCKET_NAME="junies-arcade"
   ```

   Generate an API key:

   ```bash
   openssl rand -hex 32
   ```

4. **Initialize the database**

   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed-countries.ts
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Game Guide

### Jump Master

**Controls:** SPACE or CLICK to jump (triple jump available in air)

**Scoring:**

- Cloud9 Logo: 50 points
- Coin: 20 points
- Distance: 1 point per 10 meters
- Milestone: +25 points every 100 meters

**Strategy:**

- Prioritize Cloud9 logos over coins
- Master triple jump for high collectibles
- Game speeds up progressively - stay focused!

---

### Reflex Arena

**Controls:** Click/tap on targets

**Good Targets:**

- Star: 10 points
- Coin: 20 points
- Gem: 30 points
- Trophy: 50 points

**Bad Targets (avoid!):**

- Bug, Virus, Bomb: -20 points + combo reset

**Multipliers:**

- Fast click (< 250ms): 2x bonus
- Combo: Up to 5x multiplier

**Strategy:**

- Build combo to 5x quickly
- At max combo, trophy = 500 points per click!

---

### Memory Match

**Goal:** Match all 8 pairs of champion cards

**Scoring:**

- Base match: 75 points
- Combo multiplier: 1x to 5x (consecutive matches)
- Time bonus: Remaining seconds x 15
- Completion bonus: +500 points
- Perfect game (16 moves): +300 points
- Speed bonus (60+ sec remaining): +400 points

**Strategy:**

- Spend first 30 seconds memorizing positions
- Build and maintain combos for max points
- Complete fast for speed bonus

---

## Champion Points System

Since each game has different scoring ranges, Champion Points normalize rankings:

| Rank      | Points |
| --------- | ------ |
| 1st       | 100    |
| 2nd       | 90     |
| 3rd       | 80     |
| 4th-10th  | 75-50  |
| 11th-25th | 48-20  |
| 26th-50th | 19-1   |

**Overall Ranking:** Players who complete all 3 games rank higher, sorted by total Champion Points.

---

## Project Structure

```
junie-arcade/
├── app/
│   ├── api/                 # API routes
│   │   ├── countries/       # Country list endpoint
│   │   ├── gallery/         # Achievement cards gallery
│   │   ├── leaderboard/     # Leaderboard with rankings
│   │   ├── players/         # Player creation
│   │   ├── scores/          # Score submission
│   │   └── upload-card/     # S3 upload endpoint
│   ├── components/          # React components
│   ├── games/               # Game pages
│   │   ├── jump/            # Jump Master
│   │   ├── memory/          # Memory Match
│   │   └── reflex/          # Reflex Arena
│   ├── gallery/             # Achievement gallery page
│   ├── leaderboard/         # Leaderboard page
│   ├── lib/                 # Utilities and game logic
│   │   └── phaser/          # Phaser game scenes
│   └── merchandise/         # Merchandise page
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed-countries.ts    # Country seeding script
├── public/
│   └── assets/              # Images, sounds, fonts
└── package.json
```

---

## Database Schema

### Models

**Player**

```prisma
model Player {
  id        String   @id @default(cuid())
  username  String
  country   String?
  createdAt DateTime @default(now())
  scores    Score[]
}
```

**Score**

```prisma
model Score {
  id        String   @id @default(cuid())
  playerId  String
  gameType  GameType
  score     Int
  accuracy  Float?
  time      Float?
  maxCombo  Int?
  distance  Float?
  createdAt DateTime @default(now())
}
```

**GameType Enum:** `REFLEX_ARENA`, `JUMP_MASTER`, `MEMORY_MATCH`, `OVERALL`

---

## API Endpoints

| Endpoint           | Method | Description             | Auth    |
| ------------------ | ------ | ----------------------- | ------- |
| `/api/countries`   | GET    | Get all countries       | Public  |
| `/api/players`     | POST   | Create new player       | API Key |
| `/api/scores`      | GET    | Get scores              | Public  |
| `/api/scores`      | POST   | Submit score            | API Key |
| `/api/leaderboard` | GET    | Get leaderboard         | Public  |
| `/api/gallery`     | GET    | Get achievement cards   | Public  |
| `/api/upload-card` | POST   | Upload achievement card | API Key |

### Leaderboard Query Parameters

- `view`: `overall` | `reflex` | `jump` | `memory`
- `country`: Filter by country name
- `playerId`: Include specific player stats

For detailed API documentation, see [app/api/README.md](app/api/README.md).

---

## Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open database GUI
npx tsx prisma/seed-countries.ts  # Seed countries

# Optimization
npm run analyze      # Analyze bundle size
npm run optimize:images  # Convert images to WebP
npm run optimize:audio   # Compress audio files
```

---

## Documentation

| Document                                         | Description                            |
| ------------------------------------------------ | -------------------------------------- |
| [how_game_is_work.md](how_game_is_work.md)       | Complete gameplay guide                |
| [LEADERBOARD_SCORING.md](LEADERBOARD_SCORING.md) | Detailed scoring mechanics             |
| [diagram/README.md](diagram/README.md)           | System architecture diagrams (Mermaid) |
| [prisma/README.md](prisma/README.md)             | Database documentation                 |
| [app/api/README.md](app/api/README.md)           | API reference                          |

---

## Credits

- **Developer:** Created with love from Timor-Leste
- **Hackathon:** Cloud9 x JetBrains "Sky's the Limit" 2026
- **Mascot:** Junie (JetBrains Junie AI)

---

Built with love for the Cloud9 x JetBrains Hackathon 2026
