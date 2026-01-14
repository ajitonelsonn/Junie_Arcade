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
**Score Range:** 0 - 6000+ points (with perfect combos and reaction times)

#### Scoring Mechanics

**Good Targets (Click these!):**

- ⭐ **Star:** 10 points base
- 🪙 **Coin:** 20 points base
- 💎 **Gem:** 30 points base
- 🏆 **Trophy:** 50 points base

**Bad Targets (Avoid these!):**

- 🐛 **Bug:** -25 points
- 🦠 **Virus:** -25 points
- 💣 **Bomb:** -25 points
- Clicking bad targets **resets your combo to 0** and triggers screen shake

**Missed Targets:**

- Missing good targets (letting them disappear) **resets combo to 0**
- Forces aggressive gameplay - you can't ignore targets!

#### Bonus Multipliers

**1. Reaction Time Bonus:**

- Click within **250ms** of target spawn: **×2 points** + "FAST!" indicator
- Click after 250ms: normal points
- Stricter timing rewards lightning-fast reflexes

**2. Combo System:**

- Each consecutive good target increases your combo
- Combo multiplier: **×1 to ×5** (maxes at 5x)
- Missing targets OR clicking bad targets resets combo to 0
- High combos (3+) trigger camera flash effects
- Exponentially increases score potential

**3. Target Spawn Mechanics:**

- **Starting:** Targets spawn every 0.9 seconds, last 1.8 seconds
- **Bad target chance:** Starts at 35%, increases to 50%
- Targets are slightly smaller (0.45 scale) for precision challenge
- Pulsing animation adds visual pressure

#### Progressive Difficulty (Every 10 seconds)

The game gets dramatically harder as time progresses:

**⏱️ 0-10s (Warmup Phase):**

- Spawn delay: 900ms
- Target lifetime: 1800ms
- Bad target chance: 35%

**⏱️ 10-20s (Acceleration):**

- Spawn delay: 800ms
- Target lifetime: 1650ms
- Bad target chance: 38%

**⏱️ 20-30s (Intense):**

- Spawn delay: 700ms
- Target lifetime: 1500ms
- Bad target chance: 41%

**⏱️ 30-40s (Expert):**

- Spawn delay: 600ms
- Target lifetime: 1350ms
- Bad target chance: 44%

**⏱️ 40-50s (Master):**

- Spawn delay: 500ms
- Target lifetime: 1200ms
- Bad target chance: 47%

**⏱️ 50-60s (INSANE):**

- Spawn delay: 400ms (MAXIMUM SPEED)
- Target lifetime: 1000ms
- Bad target chance: 50%
- "SPEED UP!" warnings
- Screen shake effects

#### Final Score Calculation

```typescript
// For each target clicked:
points = baseValue × reactionBonus × comboMultiplier

// Where:
// baseValue = target's base points (10, 20, 30, 50, or -25)
// reactionBonus = 2 if clicked within 250ms, otherwise 1
// comboMultiplier = current combo count (capped at 5)

// Example: Trophy clicked in 240ms with 5x combo
points = 50 × 2 × 5 = 500 points per click!

// Penalties:
// - Clicking bad target: -25 points + combo reset
// - Missing good target: 0 points + combo reset

finalScore = sum of all points from clicked targets
```

#### Strategy Tips

🎯 **Early Game (0-30s):**

- Focus on building combo to 5x quickly
- Prioritize accuracy over speed
- Learn target patterns and positions

⚡ **Mid Game (30-45s):**

- Maintain 5x combo at all costs
- Start pushing for sub-250ms clicks
- Be extra careful with bad targets - combo is valuable

🔥 **End Game (45-60s):**

- Maximum chaos: 400ms spawn rate, 1 second lifetimes
- Screen will be crowded with targets
- Every click counts - one mistake resets everything
- Trophy with max combo + fast reaction = 500 points!

💡 **Advanced Tips:**

- **Peripheral vision:** Don't focus on one spot, scan the whole screen
- **Predictive clicking:** Anticipate spawn positions
- **Risk management:** At 5x combo, slow down slightly to avoid bad targets
- **Trophy priority:** With max combo, trophies are worth 10x their base value
- **Miss penalty awareness:** Don't get tunnel vision - clear all good targets

#### Difficulty Rating by Time

- **Minutes 0:00-0:30:** ⭐⭐ Moderate - Building momentum
- **Minutes 0:30-0:45:** ⭐⭐⭐⭐ Hard - Speed intensifies
- **Minutes 0:45-1:00:** ⭐⭐⭐⭐⭐ EXTREME - Maximum chaos

**Target Density:** Up to 5+ targets on screen simultaneously in final 10 seconds!

---

### 2. Jump Master 🚀

**Game Type:** `JUMP_MASTER`
**Duration:** Until collision
**Score Range:** Variable (collectible-based with distance tracking)

#### Scoring Mechanics

- **Collectibles:** Primary score source
  - **Cloud9 Logo:** 35 points each
  - **Coin:** 15 points each
  - Collectibles spawn every 1.8 seconds at random heights
  - 50/50 chance for each collectible type
- **Distance:** Tracked separately (displayed but doesn't add to score)
  - Distance affects game difficulty progression
  - Used for milestone celebrations
- **Obstacle Avoidance:** Survival requires precise timing and double jump mastery
- **Game ends** when player collides with bug obstacle

#### Gameplay Mechanics

- **Double Jump:** Press SPACE or CLICK twice to perform a mid-air jump
  - Essential for reaching high collectibles and avoiding obstacles
  - Resets when landing on ground
- **Progressive Difficulty:**
  - Starting speed: 450 pixels/second
  - Speed increases by +30 every 50 meters
  - Obstacle spawn rate increases (starts at 2.5s, decreases to 1.2s minimum)
  - 30% chance for double obstacles after 100m
  - Gravity: 2000 (faster falling for challenging gameplay)
- **Milestone Celebrations:** "AWESOME!" message every 200 meters
- **Controls:**
  - Desktop: SPACEBAR to jump
  - Mobile/Touch: TAP screen to jump

#### Final Score Calculation

```typescript
finalScore = (cloud9Collected × 35) + (coinsCollected × 15)
distance = totalDistanceTraveled // Tracked separately for difficulty scaling
```

#### Difficulty Progression

- **0-100m:** Learning phase - standard speed and single obstacles
- **100-300m:** Moderate - double obstacles start appearing (30% chance)
- **300m+:** Expert - maximum speed, dense obstacle patterns, precise timing required

---

### 3. Memory Match 🧠

**Game Type:** `MEMORY_MATCH`
**Duration:** 120 seconds (2 minutes)
**Score Range:** 800 - 4500+ points

#### Scoring Mechanics

**Progressive Match Points (Combo System):**

- **Base points per match:** 75 points
- **Combo multiplier:** Builds with consecutive matches (1x → 2x → 3x → 4x → 5x max)
- **Combo progression:**
  - 1st match: 75 × 1 = 75 points
  - 2nd consecutive: 75 × 2 = 150 points
  - 3rd consecutive: 75 × 3 = 225 points
  - 4th consecutive: 75 × 4 = 300 points
  - 5th+ consecutive: 75 × 5 = 375 points (max)
- **Combo reset:** Missing a match (wrong pair) resets combo to 1x

**Always-Applied Bonuses (Even if incomplete):**

- **Time Bonus:** Remaining time × 15
- **Accuracy Bonus:** (16 / Total Moves) × 150
- **Combo Bonus:** Best combo achieved × 25

**Completion-Only Bonuses (All 8 pairs matched):**

- **Completion Bonus:** +500 points
- **Perfect Game Bonus:** +300 points (exactly 16 moves)
- **Speed Bonus:**
  - 60+ seconds remaining: +400 points
  - 40-59 seconds remaining: +200 points

#### Final Score Calculation

```typescript
// During gameplay (accumulates with combo multiplier):
matchPoints = 75 × currentComboMultiplier (max 5x)

// At game end (always applied):
timeBonus = timeRemaining × 15
accuracyBonus = Math.floor((16 / totalMoves) × 150)
comboBonus = bestComboAchieved × 25

// Completion bonuses (only if all 8 pairs matched):
completionBonus = allPairsMatched ? 500 : 0
perfectBonus = (allPairsMatched && moves === 16) ? 300 : 0
speedBonus = allPairsMatched ?
  (timeRemaining >= 60 ? 400 : timeRemaining >= 40 ? 200 : 0) : 0

finalScore = matchPoints + timeBonus + accuracyBonus +
             comboBonus + completionBonus + perfectBonus + speedBonus
```

#### Scoring Examples

**Example 1: Perfect Game (Best Case)**

- 8 pairs matched in exactly 16 moves (perfect memory!)
- 80 seconds remaining
- 5x combo maintained throughout (8 consecutive matches)

```
Match points = 75+150+225+300+375+375+375+375 = 2,250
Time bonus = 80 × 15 = 1,200
Accuracy bonus = Math.floor((16 / 16) × 150) = 150
Combo bonus = 5 × 25 = 125
Completion bonus = 500
Perfect bonus = 300
Speed bonus = 400

Final score = 2,250 + 1,200 + 150 + 125 + 500 + 300 + 400 = 4,925 points 🏆
```

**Example 2: Fast Completion**

- 8 pairs matched in 22 moves
- 55 seconds remaining
- Best combo: 4x (one mistake broke the streak)

```
Match points = ~1,800 (with combo breaks)
Time bonus = 55 × 15 = 825
Accuracy bonus = Math.floor((16 / 22) × 150) = 109
Combo bonus = 4 × 25 = 100
Completion bonus = 500
Perfect bonus = 0 (not 16 moves)
Speed bonus = 200 (40-59 seconds)

Final score = 1,800 + 825 + 109 + 100 + 500 + 0 + 200 = 3,534 points
```

**Example 3: Good Completion**

- 8 pairs matched in 30 moves
- 35 seconds remaining
- Best combo: 3x

```
Match points = ~1,500
Time bonus = 35 × 15 = 525
Accuracy bonus = Math.floor((16 / 30) × 150) = 80
Combo bonus = 3 × 25 = 75
Completion bonus = 500
Perfect bonus = 0
Speed bonus = 0 (less than 40s)

Final score = 1,500 + 525 + 80 + 75 + 500 + 0 + 0 = 2,680 points
```

**Example 4: Time Expired (Incomplete)**

- 5 pairs matched in 28 moves
- 0 seconds remaining
- Best combo: 3x

```
Match points = ~900 (5 matches with varying combos)
Time bonus = 0 × 15 = 0
Accuracy bonus = Math.floor((16 / 28) × 150) = 85
Combo bonus = 3 × 25 = 75
Completion bonus = 0 (not completed)
Perfect bonus = 0
Speed bonus = 0

Final score = 900 + 0 + 85 + 75 + 0 + 0 + 0 = 1,060 points
```

#### Gameplay Mechanics

**Card Grid:**

- 8 rows × 2 columns = 16 cards total
- 8 unique champion cards (from League of Legends & Valorant) × 2 = 8 pairs
- Cards shuffle randomly each game
- 3D flip animations with perspective

**Matching Rules:**

- Click first card → flips face-up
- Click second card → flips face-up
- If match: Cards stay revealed, add points with combo multiplier
- If no match: Cards flip back after 1 second, combo resets
- Each pair of flips = 1 move

**Visual Feedback:**

- ✓ Green border, glow, and checkmark for matched pairs
- 3D card flip animations
- Sound effects: click, success (match), error (miss)
- Pulsing red timer when < 20 seconds
- Real-time score updates

#### Strategy Tips

🎯 **Maximize Your Score:**

1. **Build and maintain combos** - Each consecutive match multiplies your points

   - Try to match pairs in succession without mistakes
   - 5x combo gives 375 points per pair vs 75 points at 1x!

2. **Memorize efficiently** - Spend first 30-40 seconds learning positions

   - Use spatial memory (top-left, middle-right, etc.)
   - Group similar champions mentally
   - Focus on one column/section at a time

3. **Speed matters for bonuses** - Finish fast for extra points

   - 60+ seconds = 400 bonus (huge!)
   - 40-59 seconds = 200 bonus
   - Every second = 15 points in time bonus

4. **Minimize moves for accuracy** - Aim for under 20 moves

   - Perfect game (16 moves) = 300 bonus + 150 accuracy
   - More moves = lower accuracy bonus

5. **Don't panic on time** - You still earn points even if incomplete
   - Match as many as possible before time runs out
   - Time/accuracy/combo bonuses always apply

#### Achievement Thresholds

- **🌟 Perfect Memory (16 moves):** Elite achievement + 300 bonus
- **⚡ Speed Runner (60+ sec, completed):** 400 speed bonus
- **🔥 Combo Master (5x combo):** Maximum points per match (375)
- **🎯 High Scorer (20 moves, completed):** Achievement unlocked
- **💪 Never Give Up (incomplete):** Still earn meaningful points!

#### Difficulty Level

⭐⭐⭐ **Medium-Hard**

- Requires strong short-term memory
- Combo system rewards consistency
- Time pressure increases stress
- 16 cards = many possible combinations
- Strategic memorization crucial for high scores

---

## Champion Points System

Since each game has different scoring ranges, we use a **Champion Points** system to fairly rank players across all games.

### How It Works

1. **Individual Game Rankings:**

   - Players are ranked separately in each game based on their **best score**
   - Each game produces its own leaderboard (1st, 2nd, 3rd, etc.)

2. **Champion Points Award:**
   Points are awarded based on rank position:

   | Rank  | Points                      |
   | ----- | --------------------------- |
   | 1st   | 100                         |
   | 2nd   | 90                          |
   | 3rd   | 80                          |
   | 4th   | 80                          |
   | 5th   | 75                          |
   | 6th   | 70                          |
   | 7th   | 65                          |
   | 8th   | 60                          |
   | 9th   | 55                          |
   | 10th  | 50                          |
   | 11-25 | 50 - 20 (decreasing by 2)   |
   | 26-50 | 20 - 1 (decreasing by 1)    |
   | 50+   | Max(1, 10 - floor(rank/10)) |

### Champion Points Formula

```typescript
function calculatePoints(rank: number): number {
  if (rank === 1) return 100;
  if (rank === 2) return 90;
  if (rank === 3) return 80;
  if (rank <= 10) return 100 - rank * 5;
  if (rank <= 25) return 50 - (rank - 10) * 2;
  if (rank <= 50) return 20 - (rank - 25);
  return Math.max(1, 10 - Math.floor(rank / 10));
}
```

### Example Calculation

**Player: "ProGamer"**

| Game         | Best Score | Rank | Champion Points |
| ------------ | ---------- | ---- | --------------- |
| Reflex Arena | 2,450      | 3rd  | 80              |
| Jump Master  | 8,200      | 1st  | 100             |
| Memory Match | 1,680      | 5th  | 75              |
| **TOTAL**    | -          | -    | **255 pts**     |

---

## Overall Leaderboard Ranking

### Sorting Logic

Players are sorted by:

1. **Priority 1:** Players who completed all 3 games rank higher
2. **Priority 2:** Total Champion Points (sum from all games)

```typescript
sortedLeaderboard = players.sort((a, b) => {
  // Players who played all games get priority
  if (a.hasPlayedAll && !b.hasPlayedAll) return -1;
  if (!a.hasPlayedAll && b.hasPlayedAll) return 1;

  // Then sort by total champion points
  return b.totalPoints - a.totalPoints;
});
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

| Parameter | Type   | Default   | Description                                             |
| --------- | ------ | --------- | ------------------------------------------------------- |
| `view`    | string | `overall` | Leaderboard type: `overall`, `reflex`, `jump`, `memory` |
| `country` | string | -         | Filter by country name (optional)                       |

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

| Field      | Reflex Arena | Jump Master | Memory Match |
| ---------- | ------------ | ----------- | ------------ |
| `score`    | ✅ Required  | ✅ Required | ✅ Required  |
| `accuracy` | ✅ Used      | ❌ Not used | ✅ Used      |
| `time`     | ✅ Used      | ❌ Not used | ✅ Used      |
| `maxCombo` | ✅ Used      | ❌ Not used | ❌ Not used  |
| `distance` | ❌ Not used  | ✅ Used     | ❌ Not used  |

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
- **Repeat Play:** If a user enters the same name and country again (e.g., "Ajito" from "Timor-Leste"), the system generates a _new_ unique ID. This ensures that each tournament attempt is tracked independently.
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
