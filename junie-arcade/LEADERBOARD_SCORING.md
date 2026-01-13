# Leaderboard & Scoring System

This document explains how Junie's Arcade calculates scores and rankings across all three games.

## Table of Contents
- [Game Scoring Systems](#game-scoring-systems)
- [Champion Points System](#champion-points-system)
- [Overall Leaderboard Ranking](#overall-leaderboard-ranking)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)

---

## Game Scoring Systems

### 1. Reflex Arena ⚡
**Game Type:** `REFLEX_ARENA`
**Duration:** 60 seconds
**Score Range:** 0 - 3000+ points

#### Scoring Mechanics
- **Good Targets:** +10 to +50 points per click
  - Star: +10 points
  - Coin: +20 points
  - Gem: +30 points
  - Trophy: +50 points
- **Bad Targets:** -20 points per click
  - Bug: -20 points
  - Virus: -20 points
  - Bomb: -20 points
- **Combo System:** Consecutive good targets increase score multiplier
  - Combo multiplier affects final score calculation

#### Final Score Calculation
```typescript
finalScore = baseScore + comboBonus
```

---

### 2. Jump Master 🚀
**Game Type:** `JUMP_MASTER`
**Duration:** Until collision
**Score Range:** Variable (distance-based)

#### Scoring Mechanics
- **Distance:** Primary score metric
  - Score increases based on distance traveled
  - Each unit of distance = points
- **Obstacle Avoidance:** Survive longer = higher score
- **Game ends** when player collides with obstacle

#### Final Score Calculation
```typescript
finalScore = distanceTraveled
```

---

### 3. Memory Match 🧠
**Game Type:** `MEMORY_MATCH`
**Duration:** 120 seconds (2 minutes)
**Score Range:** ~1400 - 2000+ points

#### Scoring Mechanics
- **Base Match Points:** +100 points per pair matched
- **Time Bonus:** Remaining time × 10
- **Accuracy Bonus:** (Total Pairs / Moves Made) × 100
- **Completion Bonus:** +200 points for completing all pairs

#### Final Score Calculation
```typescript
baseScore = matchedPairs * 100
timeBonus = timeRemaining * 10
accuracyBonus = Math.floor((totalPairs / movesMade) * 100)
completionBonus = allPairsMatched ? 200 : 0

finalScore = baseScore + timeBonus + accuracyBonus + completionBonus
```

**Example:**
- 8 pairs matched (16 cards)
- 45 seconds remaining
- 20 moves made
- All pairs completed

```
baseScore = 8 × 100 = 800
timeBonus = 45 × 10 = 450
accuracyBonus = Math.floor((16 / 20) × 100) = 80
completionBonus = 200

finalScore = 800 + 450 + 80 + 200 = 1530 points
```

---

## Champion Points System

Since each game has different scoring ranges, we use a **Champion Points** system to fairly rank players across all games.

### How It Works

1. **Individual Game Rankings:**
   - Players are ranked separately in each game based on their **best score**
   - Each game produces its own leaderboard (1st, 2nd, 3rd, etc.)

2. **Champion Points Award:**
   Points are awarded based on rank position:

   | Rank | Points |
   |------|--------|
   | 1st  | 100    |
   | 2nd  | 90     |
   | 3rd  | 80     |
   | 4th  | 80     |
   | 5th  | 75     |
   | 6th  | 70     |
   | 7th  | 65     |
   | 8th  | 60     |
   | 9th  | 55     |
   | 10th | 50     |
   | 11-25| 50 - 20 (decreasing by 2) |
   | 26-50| 20 - 1 (decreasing by 1) |
   | 50+  | Max(1, 10 - floor(rank/10)) |

### Champion Points Formula

```typescript
function calculatePoints(rank: number): number {
  if (rank === 1) return 100
  if (rank === 2) return 90
  if (rank === 3) return 80
  if (rank <= 10) return 100 - (rank * 5)
  if (rank <= 25) return 50 - ((rank - 10) * 2)
  if (rank <= 50) return 20 - (rank - 25)
  return Math.max(1, 10 - Math.floor(rank / 10))
}
```

### Example Calculation

**Player: "ProGamer"**

| Game | Best Score | Rank | Champion Points |
|------|-----------|------|-----------------|
| Reflex Arena | 2,450 | 3rd | 80 |
| Jump Master | 8,200 | 1st | 100 |
| Memory Match | 1,680 | 5th | 75 |
| **TOTAL** | - | - | **255 pts** |

---

## Overall Leaderboard Ranking

### Sorting Logic

Players are sorted by:

1. **Priority 1:** Players who completed all 3 games rank higher
2. **Priority 2:** Total Champion Points (sum from all games)

```typescript
sortedLeaderboard = players.sort((a, b) => {
  // Players who played all games get priority
  if (a.hasPlayedAll && !b.hasPlayedAll) return -1
  if (!a.hasPlayedAll && b.hasPlayedAll) return 1

  // Then sort by total champion points
  return b.totalPoints - a.totalPoints
})
```

### Why This System?

✅ **Fair Competition:** Normalizes different scoring systems
✅ **Encourages Variety:** Players must play all games to maximize points
✅ **Skill Recognition:** Rewards both specialization and versatility
✅ **Accessible:** Everyone can earn at least 1 point per game

---

## API Endpoints

### GET `/api/leaderboard`

Fetch leaderboard data with optional filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `view` | string | `overall` | Leaderboard type: `overall`, `reflex`, `jump`, `memory` |
| `country` | string | - | Filter by country name (optional) |

#### Examples

```bash
# Overall leaderboard (top 5)
GET /api/leaderboard?view=overall

# Reflex Arena leaderboard (top 10)
GET /api/leaderboard?view=reflex

# Jump Master leaderboard for USA
GET /api/leaderboard?view=jump&country=United%20States

# Memory Match overall
GET /api/leaderboard?view=memory
```

#### Response Format

**Overall Leaderboard:**
```json
{
  "type": "overall",
  "leaderboard": [
    {
      "playerId": "clx123...",
      "username": "ProGamer",
      "country": "United States",
      "reflexScore": 2450,
      "jumpScore": 8200,
      "memoryScore": 1680,
      "reflexRank": 3,
      "jumpRank": 1,
      "memoryRank": 5,
      "reflexPoints": 80,
      "jumpPoints": 100,
      "memoryPoints": 75,
      "totalPoints": 255,
      "gamesPlayed": 3,
      "hasPlayedAll": true
    }
  ]
}
```

**Individual Game Leaderboard:**
```json
{
  "type": "reflex",
  "gameType": "REFLEX_ARENA",
  "leaderboard": [
    {
      "rank": 1,
      "username": "SpeedKing",
      "country": "Japan",
      "score": 2890,
      "maxCombo": 15,
      "accuracy": 95.5,
      "createdAt": "2026-01-12T10:30:00Z"
    }
  ]
}
```

---

### POST `/api/scores`

Submit a new game score.

#### Request Body

```json
{
  "username": "PlayerName",
  "country": "United States",
  "gameType": "REFLEX_ARENA",
  "score": 2450,
  "accuracy": 92.5,
  "time": 60,
  "maxCombo": 12,
  "distance": null
}
```

#### Field Usage by Game

| Field | Reflex Arena | Jump Master | Memory Match |
|-------|--------------|-------------|--------------|
| `score` | ✅ Required | ✅ Required | ✅ Required |
| `accuracy` | ✅ Used | ❌ Not used | ✅ Used |
| `time` | ✅ Used | ❌ Not used | ✅ Used |
| `maxCombo` | ✅ Used | ❌ Not used | ❌ Not used |
| `distance` | ❌ Not used | ✅ Used | ❌ Not used |

---

## Database Schema

### Player Model
```prisma
model Player {
  id        String   @id @default(cuid())
  username  String
  country   String?
  createdAt DateTime @default(now())
  scores    Score[]
}
```

### Score Model
```prisma
model Score {
  id          String   @id @default(cuid())
  playerId    String
  player      Player   @relation(fields: [playerId], references: [id])
  gameType    GameType
  score       Int
  maxCombo    Int?
  accuracy    Float?
  time        Int?
  distance    Float?
  createdAt   DateTime @default(now())
}
```

### GameType Enum
```prisma
enum GameType {
  REFLEX_ARENA
  JUMP_MASTER
  MEMORY_MATCH
  OVERALL
}
```

---

## Implementation Notes

### Player Identification & Session System

- **Unique Session IDs:** Every time a player starts a new tournament from the main arena, a unique Player ID is generated in the database.
- **Repeat Play:** If a user enters the same name and country again (e.g., "Ajito" from "Timor-Leste"), the system generates a *new* unique ID. This ensures that each tournament attempt is tracked independently.
- **Identity Locking:** Once a session starts, the Name and Country are locked and cannot be changed until the session ends.
- **Session Lifecycle:**
  - The ID is maintained as the player moves between different games (Jump Master, Reflex Arena, Memory Match).
  - The session is reset and the ID is cleared when the player returns to the Main Menu or completes the tournament.

### Best Score Logic

- Rankings are calculated based on the scores associated with each unique Player ID.
- Since every new attempt creates a new ID, each "session" competes on the leaderboard as a separate entry.

### Tournament Flow

- Players can start with any game.
- After finishing a game, the system identifies which games are still unplayed in the current session and guides the player to them via the "Continue" button.
- A player must complete all 3 games to maximize their Champion Points and reach the top of the Overall Leaderboard.
- Completing all 3 games allows the player to generate a final "Overall Leaderboard Card".

### Country Support
- 250+ countries with flag emojis
- Fetched from `/api/countries`
- Displayed in leaderboard with flag + name

### Update Frequency
- Leaderboard auto-refreshes every 10 seconds
- Real-time updates for active players

---

## Future Enhancements

Potential improvements to consider:

- **Daily/Weekly Leaderboards:** Time-based competitions
- **Seasonal Rankings:** Reset champion points per season
- **Achievements:** Badges for milestones
- **ELO Rating System:** More sophisticated ranking algorithm
- **Regional Leaderboards:** Continental rankings
- **Friend Leaderboards:** Compare with friends only

---

## Questions?

For implementation details, see:
- [/app/api/leaderboard/route.ts](app/api/leaderboard/route.ts) - Leaderboard calculation logic
- [/app/api/scores/route.ts](app/api/scores/route.ts) - Score submission
- [/app/components/Leaderboard.tsx](app/components/Leaderboard.tsx) - Frontend display
- [/prisma/schema.prisma](prisma/schema.prisma) - Database schema
