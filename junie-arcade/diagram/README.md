# Junie's Arcade - System Diagrams

This document contains all architectural and flow diagrams for Junie's Arcade, built for the **Cloud9 x JetBrains "Sky's the Limit" Hackathon - Category 4: Event Mini-Game**.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [User Flow](#2-user-flow)
3. [Tournament Flow](#3-tournament-flow)
4. [Game Flow Diagrams](#4-game-flow-diagrams)
5. [Database Schema](#5-database-schema)
6. [API Architecture](#6-api-architecture)
7. [Component Architecture](#7-component-architecture)
8. [Champion Points Calculation](#8-champion-points-calculation)
9. [Achievement Card Flow](#9-achievement-card-flow)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. System Architecture

High-level overview of Junie's Arcade system components.

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI[React UI]
        Phaser[Phaser 3 Games]
        ThreeJS[Three.js 3D]
        FM[Framer Motion]
    end

    subgraph NextJS["Next.js 16 Server"]
        Pages[App Router Pages]
        API[API Routes]
        Lib[Game Logic & Utils]
    end

    subgraph Database["PostgreSQL"]
        Players[(Players)]
        Scores[(Scores)]
        Countries[(Countries)]
        Gallery[(Gallery Items)]
        Leaderboard[(Daily Leaderboard)]
    end

    subgraph Storage["AWS S3"]
        Cards[Achievement Cards]
    end

    UI --> Pages
    Phaser --> Pages
    ThreeJS --> Pages
    FM --> Pages
    Pages --> API
    API --> Lib
    Lib --> Database
    API --> Storage

    style Client fill:#1a1a2e,stroke:#00eeff,color:#fff
    style NextJS fill:#0d1b2a,stroke:#ff4655,color:#fff
    style Database fill:#1b263b,stroke:#c284f9,color:#fff
    style Storage fill:#415a77,stroke:#00eeff,color:#fff
```

---

## 2. User Flow

Complete user journey from landing to achievement card.

```mermaid
flowchart TD
    A[Landing Page] --> B{Select Game}
    B --> C[Jump Master]
    B --> D[Reflex Arena]
    B --> E[Memory Match]

    C --> F{First Time Playing?}
    D --> F
    E --> F

    F -->|Yes| G[Enter Name & Country]
    F -->|No - Has Session| H[Resume with Locked Info]

    G --> I[Generate Player ID]
    I --> J[Play Game]
    H --> J

    J --> K[Game Over Screen]
    K --> L[Achievement Card Auto-Generated]
    L --> M{Save/Share Options}
    M --> N[Take Photo of Screen]
    M --> O[Scan QR Code to Phone]
    M --> P[Download Card]

    N --> Q{More Games Available?}
    O --> Q
    P --> Q

    Q -->|Yes - Continue Button| R[Next Unplayed Game]
    R --> J
    Q -->|No - All 3 Done| S[Generate Overall Card Button]
    S --> T[Overall Achievement Card]
    T --> U[View Leaderboard]
    U --> V{New Session?}
    V -->|Yes| W[Clear Session]
    W --> A
    V -->|No| X[Exit]

    style A fill:#ff4655,stroke:#fff,color:#fff
    style B fill:#00eeff,stroke:#fff,color:#000
    style L fill:#c284f9,stroke:#fff,color:#fff
    style S fill:#ffd700,stroke:#fff,color:#000
    style R fill:#10b981,stroke:#fff,color:#fff
```

---

## 3. Tournament Flow

How a player progresses through the tournament. One Player ID is used for all games in a session - each game can only be played once per session.

```mermaid
sequenceDiagram
    participant P as Player
    participant Landing as Landing Page
    participant Game as Game Page
    participant API as API Server
    participant DB as Database

    P->>Landing: Visit juniearcade.fun
    P->>Landing: Select a Game (Jump/Reflex/Memory)
    Landing->>Game: Navigate to Game Page

    alt First Time (No Session)
        Game->>P: Show Name & Country Form
        P->>Game: Enter Name & Country
        Game->>API: POST /api/players
        API->>DB: Create Player
        DB-->>API: Player ID
        API-->>Game: Session Created
        Game->>Game: Save Player ID to LocalStorage
    else Has Existing Session (Same Player ID)
        Game->>Game: Load from LocalStorage
        Game->>P: Show Locked Name/Country (Cannot Change)
    end

    P->>Game: Click "Deploy/Start"
    Game->>Game: Countdown 3-2-1-GO!
    P->>Game: Play Game (50-100 seconds)
    Game->>Game: Calculate Score

    Game->>API: POST /api/scores (Auto-Save)
    API->>DB: Save Score with Player ID
    DB-->>API: Score + Rank

    Game->>P: Show Game Over Card (Auto-Generated)

    alt Save/Share Card
        P->>Game: Take Photo of Screen
        P->>Game: OR Scan QR Code to Phone
        P->>Game: OR Click Download Button
    end

    alt More Games Available (Continue Button Shows)
        P->>Game: Click "Continue to [Next Game]"
        Game->>Game: Navigate to Next Unplayed Game
        Note over Game: Player ID stays the same
        Note over Game: Each game only playable once
    else All 3 Games Completed (No Continue Button)
        P->>Game: Click "Generate Leaderboard Card"
        Game->>API: GET /api/leaderboard?view=overall
        API->>DB: Calculate Champion Points
        DB-->>API: Rankings + Total Points
        Game->>P: Show Overall Achievement Card
        Note over P,Game: Session Complete - Can Start New Session
    end
```

---

## 4. Game Flow Diagrams

### 4.1 Jump Master Game Flow

```mermaid
stateDiagram-v2
    [*] --> Loading: Start Game
    Loading --> Countdown: Assets Loaded
    Countdown --> Running: GO!

    Running --> Jumping: SPACE/CLICK
    Jumping --> Running: Land on Ground
    Jumping --> Jumping: Air Jump (3x max)

    Running --> Collecting: Hit Collectible
    Collecting --> Running: +Points

    Running --> GameOver: Hit Obstacle
    Running --> Victory: Time Up (50s)

    GameOver --> [*]: Show Score
    Victory --> [*]: Show Score

    note right of Running
        Speed increases every 10s
        Max speed: 700px/s
    end note

    note right of Jumping
        Triple jump available
        Gravity: 2000
    end note
```

### 4.2 Reflex Arena Game Flow

```mermaid
stateDiagram-v2
    [*] --> Spawning: Start Game

    Spawning --> TargetActive: Spawn Target
    TargetActive --> Clicked: Player Clicks
    TargetActive --> Missed: Target Expires

    Clicked --> GoodTarget: Is Good Target?
    Clicked --> BadTarget: Is Bad Target?

    GoodTarget --> ComboCheck: +Points
    BadTarget --> ComboReset: -20 Points

    ComboCheck --> ComboUp: Consecutive Hit
    ComboCheck --> Spawning: Continue
    ComboUp --> Spawning: Max 5x

    ComboReset --> Spawning: Reset to 0
    Missed --> ComboReset: Miss Penalty

    Spawning --> TimeUp: 50 seconds
    TimeUp --> [*]: Final Score

    note right of GoodTarget
        Star: 10pts
        Coin: 20pts
        Gem: 30pts
        Trophy: 50pts
    end note

    note right of Clicked
        < 250ms = 2x bonus
    end note
```

### 4.3 Memory Match Game Flow

```mermaid
stateDiagram-v2
    [*] --> Setup: Start Game
    Setup --> WaitFirst: Shuffle 16 Cards

    WaitFirst --> FirstFlip: Click Card 1
    FirstFlip --> WaitSecond: Show Card

    WaitSecond --> SecondFlip: Click Card 2
    SecondFlip --> CheckMatch: Compare Cards

    CheckMatch --> Match: Cards Match
    CheckMatch --> NoMatch: Cards Different

    Match --> ComboUp: +75 * Multiplier
    NoMatch --> ComboReset: Flip Back

    ComboUp --> CheckComplete: Update Combo
    ComboReset --> WaitFirst: Reset Combo

    CheckComplete --> Victory: All 8 Pairs
    CheckComplete --> WaitFirst: Continue

    WaitFirst --> TimeUp: 100 seconds
    TimeUp --> [*]: Calculate Bonuses
    Victory --> [*]: Full Bonuses

    note right of Match
        Combo: 1x to 5x
        75 * combo per match
    end note

    note right of Victory
        +500 completion
        +300 perfect (16 moves)
        +400 speed (60+ sec)
    end note
```

---

## 5. Database Schema

Entity Relationship Diagram for the database.

```mermaid
erDiagram
    Player ||--o{ Score : has
    Player {
        string id PK "CUID"
        string username
        string country
        datetime createdAt
    }

    Score {
        string id PK "CUID"
        string playerId FK
        enum gameType "REFLEX|JUMP|MEMORY|OVERALL"
        int score
        float accuracy
        float time
        int maxCombo
        float distance
        datetime createdAt
    }

    Country {
        string id PK "CUID"
        string name UK
        string code "ISO 3166-1"
        string flag "Emoji"
        datetime createdAt
    }

    GalleryItem {
        string id PK "CUID"
        string url "S3 URL"
        string username
        int score
        enum gameType
        string country
        datetime createdAt
    }

    DailyLeaderboard {
        string id PK "CUID"
        date date
        enum gameType
        json topScores
    }
```

---

## 6. API Architecture

REST API endpoint structure.

```mermaid
flowchart LR
    subgraph Public["Public Endpoints"]
        GET1[GET /api/countries]
        GET2[GET /api/scores]
        GET3[GET /api/leaderboard]
        GET4[GET /api/gallery]
    end

    subgraph Protected["Protected Endpoints (API Key)"]
        POST1[POST /api/players]
        POST2[POST /api/scores]
        POST3[POST /api/upload-card]
    end

    subgraph Middleware["Middleware"]
        Auth[API Key Validation]
        Rate[Rate Limiting]
        Valid[Input Validation]
    end

    subgraph Services["Services"]
        DB[(PostgreSQL)]
        S3[(AWS S3)]
    end

    Public --> DB
    Protected --> Auth
    Auth --> Rate
    Rate --> Valid
    Valid --> DB
    POST3 --> S3

    style Public fill:#00ff00,stroke:#fff,color:#000
    style Protected fill:#ff4655,stroke:#fff,color:#fff
    style Middleware fill:#00eeff,stroke:#fff,color:#000
```

### API Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant R as Route Handler
    participant P as Prisma
    participant DB as PostgreSQL

    C->>M: HTTP Request

    alt Protected Route
        M->>M: Check x-api-key Header
        alt Invalid Key
            M-->>C: 401/403 Unauthorized
        end
        M->>M: Rate Limit Check
        alt Rate Limited
            M-->>C: 429 Too Many Requests
        end
    end

    M->>R: Validated Request
    R->>R: Input Validation
    R->>P: Database Query
    P->>DB: SQL Query
    DB-->>P: Result
    P-->>R: Typed Data
    R-->>C: JSON Response
```

---

## 7. Component Architecture

React component hierarchy.

```mermaid
flowchart TD
    subgraph Layout["Root Layout"]
        HTML[HTML/Body]
        Providers[Context Providers]
    end

    subgraph Pages["App Pages"]
        Home[Home Page]
        Games[Game Pages]
        LB[Leaderboard Page]
        Gallery[Gallery Page]
        Merch[Merchandise Page]
    end

    subgraph GamePages["Game Pages"]
        Jump[Jump Master]
        Reflex[Reflex Arena]
        Memory[Memory Match]
    end

    subgraph Components["Shared Components"]
        Nav[Navigation]
        Hero[Hero Animations]
        Card[Achievement Card]
        Board[Leaderboard]
        Music[Music System]
    end

    subgraph GameComponents["Game Components"]
        PhaserGame[Phaser Game Container]
        GameUI[Game UI Overlay]
        GameOver[Game Over Screen]
        Entry[Game Entry Form]
    end

    HTML --> Providers
    Providers --> Pages

    Home --> Nav
    Home --> Hero

    Games --> GamePages
    GamePages --> GameComponents

    Jump --> PhaserGame
    Reflex --> PhaserGame
    Memory --> GameUI

    LB --> Board
    Gallery --> Card

    style Layout fill:#1a1a2e,stroke:#00eeff
    style Pages fill:#0d1b2a,stroke:#ff4655
    style Components fill:#1b263b,stroke:#c284f9
```

---

## 8. Champion Points Calculation

How Champion Points are calculated and ranked.

```mermaid
flowchart TD
    A[Player Completes Game] --> B[Get Raw Score]
    B --> C[Rank Against All Players]
    C --> D{What is Rank?}

    D -->|1st| E[100 Points]
    D -->|2nd| F[90 Points]
    D -->|3rd| G[80 Points]
    D -->|4-10th| H[75-50 Points]
    D -->|11-25th| I[48-20 Points]
    D -->|26-50th| J[19-1 Points]
    D -->|51+| K[Min 1 Point]

    E --> L[Add to Total]
    F --> L
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L

    L --> M{All 3 Games?}
    M -->|Yes| N[Priority Ranking]
    M -->|No| O[Secondary Ranking]

    N --> P[Sort by Total Points]
    O --> P

    P --> Q[Final Leaderboard Position]

    style E fill:#ffd700,stroke:#fff,color:#000
    style F fill:#c0c0c0,stroke:#fff,color:#000
    style G fill:#cd7f32,stroke:#fff,color:#000
```

### Points Formula

```mermaid
flowchart LR
    subgraph Formula["Champion Points Formula"]
        R1["Rank 1 → 100"]
        R2["Rank 2 → 90"]
        R3["Rank 3 → 80"]
        R4["Rank 4-10 → 100 - (rank × 5)"]
        R5["Rank 11-25 → 50 - ((rank-10) × 2)"]
        R6["Rank 26-50 → 20 - (rank-25)"]
        R7["Rank 51+ → max(1, 10 - floor(rank/10))"]
    end

    style Formula fill:#1a1a2e,stroke:#00eeff,color:#fff
```

---

## 9. Deployment Architecture

Production deployment setup.

```mermaid
flowchart TB
    subgraph Users["Users"]
        Browser[Web Browser]
    end

    subgraph CDN["Vercel Edge Network"]
        Edge[Edge Functions]
        Static[Static Assets]
        Cache[Response Cache]
    end

    subgraph Vercel["Vercel Platform"]
        NextJS[Next.js Server]
        API[API Routes]
    end

    subgraph External["External Services"]
        Postgres[(PostgreSQL)]
        S3[(AWS S3)]
    end

    Browser --> CDN
    Mobile --> CDN
    CDN --> Vercel
    Edge --> NextJS
    Static --> Cache
    NextJS --> API
    API --> Postgres
    API --> S3

    style Users fill:#00eeff,stroke:#fff,color:#000
    style CDN fill:#000,stroke:#00eeff,color:#fff
    style Vercel fill:#000,stroke:#ff4655,color:#fff
    style External fill:#1b263b,stroke:#c284f9,color:#fff
```

---

## Hackathon Context

This project is submitted for **Category 4: Event Mini-Game** of the Cloud9 x JetBrains "Sky's the Limit" Hackathon.

### Requirements Met

| Requirement               | Implementation            |
| ------------------------- | ------------------------- |
| Fast & Engaging (< 3 min) | 50-100 second games       |
| Intuitive Controls        | Mouse/click + SPACE only  |
| Thematic                  | VALORANT/LoL aesthetic    |
| Live Leaderboard          | Real-time Champion Points |
| High Replayability        | Session-based competition |

---

## Quick Links

- [Main README](../README.md)
- [API Documentation](../app/api/README.md)
- [Database Documentation](../prisma/README.md)
- [Gameplay Guide](../how_game_is_work.md)
- [Scoring System](../LEADERBOARD_SCORING.md)

---

Built with love for the Cloud9 x JetBrains Hackathon 2026
