# Sky's the Limit - Junie's Arcade

A **3-in-1 mini-game tournament arcade** built for the **Cloud9 x JetBrains "Sky's the Limit" Hackathon 2026**, submitted under **Category 4: Event Mini-Game**.

**Live Demo:** [https://www.juniearcade.fun](https://www.juniearcade.fun)

---

## Hackathon Submission

**Category 4** - Develop a mini-game for fans at LCS or VCT Event Booths.

| Requirement               | Implementation                                       |
| ------------------------- | ---------------------------------------------------- |
| Fast & Engaging (< 3 min) | 50-100 second games with high replayability          |
| Intuitive Controls        | Mouse/click + SPACE only, no tutorial needed         |
| Thematic                  | VALORANT/LoL tactical aesthetic with Cloud9 branding |
| Live Leaderboard          | Real-time Champion Points ranking system             |

---

## About the Project

Junie's Arcade features three fast-paced mini-games designed for competitive play at Cloud9 and JetBrains event booths. Players compete for high scores, earn Champion Points across all three games, and climb a global leaderboard. Top 3 players at GDC events win authentic Timor-Leste merchandise prizes.

- **Duration:** 2-5 minutes per full tournament run
- **Platform:** Web-based (desktop recommended)
- **Games:** Jump Master (platformer), Reflex Arena (reaction), Memory Match (puzzle)

---

## The Three Games

| Game             | Type           | Duration    | Goal                                              |
| ---------------- | -------------- | ----------- | ------------------------------------------------- |
| **Jump Master**  | Endless Runner | 50 seconds  | Jump obstacles, collect Cloud9 logos and coins     |
| **Reflex Arena** | Reaction Game  | 50 seconds  | Click good targets, avoid bad ones, build combos  |
| **Memory Match** | Card Puzzle    | 100 seconds | Match 8 pairs of champion cards with combo system |

Each game features progressive difficulty, combo multipliers, and achievement cards generated after completion.

---

## Champion Points System

Since each game has different scoring ranges, Champion Points normalize rankings across games:

| Rank      | Points |
| --------- | ------ |
| 1st       | 100    |
| 2nd       | 90     |
| 3rd       | 80     |
| 4th-10th  | 75-50  |
| 11th-25th | 48-20  |
| 26th+     | 19-1   |

Players who complete all 3 games are ranked higher. Total Champion Points determine the overall leaderboard position.

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
| **Deployment**  | Vercel                                        |

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI[React UI]
        Phaser[Phaser 3 Games]
        ThreeJS[Three.js 3D]
        FM[Framer Motion]
    end

    subgraph Server["Next.js 16 Server"]
        Pages[App Router Pages]
        API[API Routes]
        Lib[Game Logic & Utils]
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL)]
        S3[(AWS S3)]
    end

    Client --> Server
    Server --> Data
```

---

## Development Approach

This project was developed using **JetBrains WebStorm** with **Junie** (JetBrains AI Coding Agent) to improve the code and accelerate game development. The initial ideas and task planning are documented in the [Idea_and_task_and_hackathon/](Idea_and_task_and_hackathon/) folder.

Development screenshots from WebStorm with Junie:

| Screenshot | Description |
| ---------- | ----------- |
| ![Junie in WebStorm](ss/Screenshot_2026-01-12%20at%2015.35.51.png) | Early development with Junie AI assistant in WebStorm |
| ![Game documentation](ss/Screenshot_2026-01-22%20at%2009.10.19.png) | Writing game documentation and gameplay guide with AI assistance |

---

## Documentation

This project includes detailed documentation for every aspect of the system:

| Document | Description |
| -------- | ----------- |
| [how_game_is_work.md](junie-arcade/how_game_is_work.md) | Complete gameplay guide with strategies and tips |
| [LEADERBOARD_SCORING.md](junie-arcade/LEADERBOARD_SCORING.md) | Detailed scoring mechanics and Champion Points formulas |
| [diagram/README.md](junie-arcade/diagram/README.md) | System architecture diagrams (Mermaid) |
| [prisma/README.md](junie-arcade/prisma/README.md) | Database schema and Prisma ORM documentation |
| [app/api/README.md](junie-arcade/app/api/README.md) | Complete API reference with examples |
| [junie-arcade/README.md](junie-arcade/README.md) | Main application README with setup instructions |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

### Setup

```bash
cd junie-arcade
npm install
```

Configure `.env` (see [junie-arcade/README.md](junie-arcade/README.md) for full details):

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
API_SECRET_KEY="your-generated-key"
NEXT_PUBLIC_API_KEY="your-generated-key"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="junies-arcade"
```

Initialize database and run:

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed-countries.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
Sky_the_Limit/
├── junie-arcade/              # Main application
│   ├── app/
│   │   ├── api/               # REST API endpoints
│   │   ├── components/        # React components
│   │   ├── games/             # Game pages (jump, reflex, memory)
│   │   ├── gallery/           # Achievement card gallery
│   │   ├── leaderboard/       # Leaderboard page
│   │   ├── lib/               # Utilities and Phaser game scenes
│   │   └── merchandise/       # Merchandise page
│   ├── prisma/                # Database schema and seeds
│   ├── public/                # Static assets (images, sounds, fonts)
│   ├── diagram/               # Architecture diagrams
│   └── package.json
├── Idea_and_task_and_hackathon/  # Planning docs and hackathon info
├── ss/                        # Development screenshots
└── README.md                  # This file
```

---

## Credits

- **Developer:** Ajito Nelson Lucio da Costa, from Timor-Leste
- **Hackathon:** Cloud9 x JetBrains "Sky's the Limit" 2026
- **IDE:** JetBrains WebStorm with Junie AI
- **Mascot:** Junie (JetBrains Junie AI Agent)

---

## License

See [LICENSE](LICENSE) for details.
