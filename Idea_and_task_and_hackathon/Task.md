# 🚀 Task Roadmap: Junie's Arcade

This document outlines the development plan for **Junie's Arcade**, a 3-in-1 mini-game platform for the Cloud9 x JetBrains Hackathon (Category 4).

## 🛠️ Phase 1: Environment Setup & Infrastructure

- [ ] **Initialize Next.js Project**: Set up Next.js 14 with TypeScript, App Router, and Tailwind CSS.
- [ ] **Configure Database**:
  - [ ] Set up Neon.tech PostgreSQL.
  - [ ] Initialize Prisma and define the `Player`, `Score`, and `DailyLeaderboard` models.
  - [ ] Run `npx prisma db push` to sync schema.
- [ ] **Set up Phaser 3**: Integrate Phaser 3 into the Next.js project structure.
- [ ] **Socket.io Setup**: Configure Socket.io server (API routes) and client-side hooks for real-time leaderboard updates.

## 🎨 Phase 2: Asset Management & Integration

- [ ] **Import Graphics**: Move all assets from `public/assets/images/` to the project's public folder.
  - [ ] Logos (Cloud9, JetBrains, IDEs).
  - [ ] Junie Sprites (Idle, Happy, Sad, Jump, Run).
  - [ ] Targets (Star, Trophy, Gem, Bug, etc.).
  - [ ] Memory Cards (LoL Champions, VALORANT Agents).
  - [ ] Backgrounds & UI Elements.
- [ ] **Import Audio**: Set up SFX and Music folders in `public/assets/sounds/`.
- [ ] **Sprite Sheet Creation**: (Optional) Optimize Junie's running animation into a sprite sheet.

## 🎮 Phase 3: Core Game Development (Phaser 3)

### 1. Reflex Arena

- [ ] Implement random target spawning logic.
- [ ] Add score calculation with time-based bonuses and combos.
- [ ] Integrate Junie's "Happy" and "Sad" sprites for hits/misses.

### 2. Jump Master

- [ ] Create the endless scrolling background.
- [ ] Implement player physics (Jump) and collision detection with obstacles.
- [ ] Add collectible items (C9 logos, Stars).
- [ ] Implement progressive difficulty (speed increase).

### 3. Memory Match

- [ ] Build the 4x4 card grid logic.
- [ ] Implement flip animations and matching verification.
- [ ] Add time limit and "Perfect Game" bonus logic.

## 🖥️ Phase 4: UI/UX & Platform Integration

- [ ] **Home Page**: Create a modern landing page with game selection cards.
- [ ] **Game Shell**: Build a reusable Next.js component to wrap Phaser game instances.
- [ ] **User Onboarding**: Simple modal for "Enter Username" before playing.
- [ ] **Leaderboard Component**: Build a real-time sidebar/tab showing the top scores for the selected game.
- [ ] **Responsive Design**: Ensure the arcade works on both large Event Booth screens and mobile devices.

## ⚡ Phase 5: Backend & Real-time Features

- [ ] **API Routes**:
  - [ ] `POST /api/scores`: Save player scores after a game session.
  - [ ] `GET /api/leaderboard`: Fetch top scores.
- [ ] **Socket.io Logic**:
  - [ ] Broadcast new high scores to all connected clients.
  - [ ] Implement room-based updates (one room per game type).

## 🚀 Phase 6: Testing, Optimization & Deployment

- [ ] **Performance Audit**: Optimize Phaser 3 rendering and asset loading.
- [ ] **Sound Balancing**: Add volume controls and ensure music/SFX don't clash.
- [ ] **Deployment**:
  - [ ] Deploy to Vercel.
  - [ ] Configure environment variables (DATABASE_URL, etc.).
- [ ] **Final Polish**: Add screen transitions, hover effects, and Cloud9/JetBrains branding consistent with the Hackathon guide.

---

Read the hackathon in here Cloud9_JetBrains_Hackathon_Guide.md and the project is in here Junie_Arcade.MD and also asset in here Assets-Preparation.MD
