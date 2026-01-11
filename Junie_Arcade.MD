# 🎮 Junie's Arcade - Game

I want Combining all 3 games into one arcade platform for the event booth! This gives players variety and increases engagement time.

---

## 🎯 Project Overview

### **Project Name:** Junie's Arcade

### **Tagline:** "Three Games, One Arena. Pick Your Challenge!"

### **Tech Stack:**

```
Frontend:
├── Next.js 14 (App Router)
├── TypeScript
├── Phaser 3 (Game Engine)
├── Tailwind CSS (UI Styling)
└── Socket.io-client (Real-time updates)

Backend (API Routes in Next.js):
├── Next.js API Routes
├── Prisma ORM
├── PostgreSQL (Neon.tech)
└── Socket.io Server
```

---

## 🏗️ Application Structure

### **User Flow:**

```
┌─────────────────────────────────────────────────┐
│           JUNIE'S ARCADE - HOME                 │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │     Welcome to Junie's Arcade!          │   │
│  │     Pick Your Game Challenge            │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │  REFLEX   │  │   JUMP    │  │  MEMORY   │  │
│  │  ARENA    │  │   MASTER  │  │  MATCH    │  │
│  │           │  │           │  │           │  │
│  │  [PLAY]   │  │  [PLAY]   │  │  [PLAY]   │  │
│  └───────────┘  └───────────┘  └───────────┘  │
│                                                 │
│  🏆 LIVE LEADERBOARD (Real-time updates)        │
│  ┌─────────────────────────────────────────┐   │
│  │ 1. PlayerX    - Reflex   - 1,250 pts    │   │
│  │ 2. JumpKing   - Jump     - 980 pts      │   │
│  │ 3. MemoryPro  - Memory   - 850 pts      │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🎮 Game Details

### **Game 1: Reflex Arena**

**Description:** Click targets as fast as possible! Test your reaction speed.

**Gameplay:**

- Duration: 60 seconds
- Good targets (Cloud9, Junie) = +10 to +50 pts
- Bad targets (Bugs, Enemy logos) = -20 pts
- Targets appear faster over time
- Golden Junie (rare) = +100 pts

**Controls:** Mouse click only

**Scoring Formula:**

```typescript
baseScore = targetValue
timeBonus = (reactionTime < 0.3s) ? 2x : 1x
comboMultiplier = consecutive hits (max 5x)
finalScore = baseScore * timeBonus * comboMultiplier
```

---

### **Game 2: Jump Master**

**Description:** Endless runner! Jump over obstacles and collect coins.

**Gameplay:**

- Auto-run to the right
- Press SPACE or CLICK to jump
- Avoid bugs and obstacles
- Collect Cloud9 logos and stars
- Speed increases over time
- Game over on collision

**Controls:**

- Desktop: SPACEBAR
- Mobile: TAP screen

**Scoring:**

```typescript
Distance traveled = +1 pt per second
Cloud9 logo collected = +25 pts
Star collected = +10 pts
Perfect jump (no collision) = combo +5 pts
```

---

### **Game 3: Memory Match**

**Description:** Classic memory card game with esports theme!

**Gameplay:**

- 16 cards (8 pairs) face down
- Click to flip 2 cards
- Match = cards disappear, +points
- No match = cards flip back
- Complete all pairs to win
- Time limit: 120 seconds

**Controls:** Mouse click only

**Cards Theme:**

- Cloud9 players
- League champions
- VALORANT agents
- JetBrains products
- Junie poses

**Scoring:**

```typescript
Match found = +50 pts
Speed bonus:
  - <2s between flips = +30 pts
  - <5s = +15 pts
Time remaining bonus = remaining seconds * 10
Perfect game (no wrong pairs) = +200 pts
```

---

## 📊 Database Schema (PostgreSQL via Neon)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  player      Player   @relation(fields: [playerId], references: [id])
  gameType    GameType
  score       Int
  accuracy    Float?   // for Reflex Arena
  time        Float?   // completion time
  maxCombo    Int?     // for Reflex Arena
  distance    Float?   // for Jump Master
  createdAt   DateTime @default(now())

  @@index([gameType, score])
  @@index([createdAt])
}

model DailyLeaderboard {
  id        String   @id @default(cuid())
  date      DateTime @default(now()) @db.Date
  gameType  GameType
  topScores Json     // Store top 10 scores

  @@unique([date, gameType])
}
```

---

## 🗂️ Project Folder Structure

```
junie-arcade/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Home/Game Selection
│   │   ├── games/
│   │   │   ├── reflex/page.tsx      # Reflex Arena
│   │   │   ├── jump/page.tsx        # Jump Master
│   │   │   └── memory/page.tsx      # Memory Match
│   │   ├── leaderboard/page.tsx     # Full Leaderboard
│   │   └── api/
│   │       ├── socket/route.ts      # Socket.io endpoint
│   │       ├── scores/
│   │       │   ├── route.ts         # POST/GET scores
│   │       │   └── [gameType]/route.ts
│   │       └── leaderboard/
│   │           └── route.ts         # GET leaderboard
│   │
│   ├── components/
│   │   ├── GameCard.tsx             # Game selection card
│   │   ├── Leaderboard.tsx          # Real-time leaderboard
│   │   ├── PlayerInput.tsx          # Username input
│   │   └── ScoreDisplay.tsx         # Post-game score
│   │
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client
│   │   ├── socket.ts                # Socket.io setup
│   │   └── phaser/
│   │       ├── reflexGame.ts        # Reflex Arena logic
│   │       ├── jumpGame.ts          # Jump Master logic
│   │       └── memoryGame.ts        # Memory Match logic
│   │
│   └── hooks/
│       ├── useSocket.ts             # Socket.io hook
│       └── useLeaderboard.ts        # Leaderboard data
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   └── assets/
│       ├── images/
│       │   ├── junie/               # Junie sprites
│       │   ├── cloud9/              # Cloud9 logos
│       │   ├── targets/             # Game targets
│       │   └── cards/               # Memory cards
│       └── sounds/
│           ├── click.mp3
│           ├── success.mp3
│           └── gameover.mp3
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 Real-time Leaderboard (Socket.io)

### **How it works:**

```typescript
// src/lib/socket.ts
import { Server } from "socket.io";

export function initSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join leaderboard room
    socket.on("join-leaderboard", (gameType) => {
      socket.join(`leaderboard-${gameType}`);
    });

    // Broadcast new score
    socket.on("new-score", async (data) => {
      const { gameType, score, username } = data;

      // Save to database
      await saveScore(data);

      // Broadcast to all clients watching this game's leaderboard
      io.to(`leaderboard-${gameType}`).emit("leaderboard-update", {
        gameType,
        newEntry: { username, score },
      });
    });
  });

  return io;
}
```

### **Client-side (React Hook):**

```typescript
// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIo = io({
      path: "/api/socket",
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
}
```

### **Real-time Leaderboard Component:**

```typescript
// src/components/Leaderboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export function Leaderboard({ gameType }: { gameType: string }) {
  const [scores, setScores] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join leaderboard room
    socket.emit("join-leaderboard", gameType);

    // Listen for updates
    socket.on("leaderboard-update", (data) => {
      setScores((prev) =>
        [...prev, data.newEntry].sort((a, b) => b.score - a.score)
      );
    });

    // Fetch initial data
    fetch(`/api/scores/${gameType}`)
      .then((res) => res.json())
      .then(setScores);

    return () => {
      socket.off("leaderboard-update");
    };
  }, [socket, gameType]);

  return (
    <div className="leaderboard">
      <h2>🏆 Top Scores - {gameType}</h2>
      {scores.slice(0, 10).map((score, i) => (
        <div key={i} className="score-entry">
          <span>#{i + 1}</span>
          <span>{score.username}</span>
          <span>{score.score} pts</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 UI/UX Design

### **Color Scheme:**

```css
Primary (Cloud9 Blue): #0B66C3
Secondary (JetBrains): #000000
Accent (Success): #00E676
Accent (Warning): #FFC107
Background: #F5F5F5
```

### **Example Home Screen Design:**

```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header */}
      <header className="p-8 text-center">
        <h1 className="text-6xl font-bold text-white">JUNIE'S ARCADE</h1>
        <p className="text-xl text-white/80 mt-2">
          Three Games. One Champion. Are You Ready?
        </p>
      </header>

      {/* Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
        <GameCard
          title="Reflex Arena"
          description="Click targets fast!"
          icon="⚡"
          href="/games/reflex"
        />
        <GameCard
          title="Jump Master"
          description="Endless runner!"
          icon="🚀"
          href="/games/jump"
        />
        <GameCard
          title="Memory Match"
          description="Find the pairs!"
          icon="🧠"
          href="/games/memory"
        />
      </div>

      {/* Live Leaderboard */}
      <LiveLeaderboard />
    </div>
  );
}
```

---

## 📱 Responsive Design

**Desktop (Event Booth):**

- Large buttons for easy clicking
- Full-screen game mode
- Big leaderboard display

**Mobile:**

- Touch-optimized controls
- Portrait/landscape support
- Simplified UI

---

## 🚀 Deployment Steps

### **1. Setup Neon PostgreSQL:**

```bash
# Sign up at console.neon.tech
# Create new project
# Copy connection string to .env

DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/database?sslmode=require"
```

### **2. Initialize Prisma:**

```bash
npx prisma init
npx prisma generate
npx prisma db push
```

### **3. Deploy to Vercel:**

```bash
# Connect GitHub repo to Vercel
# Add environment variables:
# - DATABASE_URL
# - NEXT_PUBLIC_SOCKET_URL

vercel --prod
```

---

## 🎯 Features Summary

✅ **3 Games in 1 Platform**
✅ **Real-time Leaderboard** (Socket.io)
✅ **PostgreSQL Database** (Neon.tech free tier)
✅ **Responsive Design** (Desktop + Mobile)
✅ **Full TypeScript**
✅ **One-click Deploy** (Vercel)
✅ **No separate backend** (Next.js API routes)
✅ **Phaser 3 Games**
✅ **Cloud9 + JetBrains Themed**

---

## 📦 Package.json

```json
{
  "name": "junie-arcade",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "phaser": "^3.70.0",
    "socket.io": "^4.6.0",
    "socket.io-client": "^4.6.0",
    "@prisma/client": "^5.7.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "prisma": "^5.7.0"
  }
}
```

---

Above is the example explanation so you're turn is to make it with modern UI/UX and make it more best for the all design that need you can read this md Assets-Preparation.MD
