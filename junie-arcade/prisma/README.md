# Junie's Arcade Database Documentation

Complete guide for managing the PostgreSQL database with Prisma ORM.

---

## 📋 Table of Contents

- [Database Overview](#-database-overview)
- [Schema Structure](#-schema-structure)
- [Prerequisites](#-prerequisites)
- [Initial Setup](#-initial-setup)
- [Common Commands](#-common-commands)
- [Migrations](#-migrations)
- [Seeding Data](#-seeding-data)
- [Database Management](#-database-management)
- [Troubleshooting](#-troubleshooting)

---

## 🗄️ Database Overview

**Database Type:** PostgreSQL
**ORM:** Prisma
**Location:** `schema.prisma`

The database stores all game data including players, scores, leaderboards, countries, and gallery items for the Junie's Arcade tournament system.

---

## 📊 Schema Structure

### **Models**

#### 1. **Player**

Stores player information and credentials.

```prisma
model Player {
  id        String   @id @default(cuid())
  username  String
  country   String?
  createdAt DateTime @default(now())
  scores    Score[]
}
```

**Fields:**

- `id`: Unique player identifier (auto-generated CUID)
- `username`: Player's display name
- `country`: Player's country (optional)
- `createdAt`: Timestamp of player creation
- `scores`: Relation to all scores for this player

---

#### 2. **Score**

Stores individual game scores for each player.

```prisma
model Score {
  id        String   @id @default(cuid())
  playerId  String
  player    Player   @relation(fields: [playerId], references: [id])
  gameType  GameType
  score     Int
  accuracy  Float?
  time      Float?
  maxCombo  Int?
  distance  Float?
  createdAt DateTime @default(now())

  @@index([gameType, score])
  @@index([createdAt])
}
```

**Fields:**

- `id`: Unique score identifier
- `playerId`: Foreign key to Player
- `gameType`: Type of game (REFLEX_ARENA, JUMP_MASTER, MEMORY_MATCH, OVERALL)
- `score`: Final score value
- `accuracy`: Accuracy percentage (Memory Match, Reflex Arena)
- `time`: Time taken in seconds (Memory Match)
- `maxCombo`: Maximum combo achieved (Reflex Arena, Memory Match)
- `distance`: Distance traveled in pixels (Jump Master)
- `createdAt`: Timestamp of score creation

**Indexes:**

- Composite index on `[gameType, score]` for fast leaderboard queries
- Index on `createdAt` for chronological sorting

---

#### 3. **DailyLeaderboard**

Caches daily leaderboard snapshots for performance.

```prisma
model DailyLeaderboard {
  id        String   @id @default(cuid())
  date      DateTime @default(now()) @db.Date
  gameType  GameType
  topScores Json

  @@unique([date, gameType])
}
```

**Fields:**

- `id`: Unique identifier
- `date`: Date of the leaderboard snapshot
- `gameType`: Game type for this snapshot
- `topScores`: JSON array of top scores

**Unique Constraint:** One snapshot per day per game type

---

#### 4. **Country**

Stores country data for player selection and filtering.

```prisma
model Country {
  id        String   @id @default(cuid())
  name      String   @unique
  code      String   @default("US")
  flag      String
  createdAt DateTime @default(now())

  @@index([name])
}
```

**Fields:**

- `id`: Unique identifier
- `name`: Full country name (e.g., "United States")
- `code`: ISO 3166-1 alpha-2 country code (e.g., "US")
- `flag`: Unicode flag emoji (e.g., "🇺🇸")
- `createdAt`: Timestamp of creation

**Total Countries:** 176 countries supported

---

#### 5. **GalleryItem**

Stores achievement card images uploaded by players.

```prisma
model GalleryItem {
  id        String   @id @default(cuid())
  url       String
  username  String
  score     Int
  gameType  GameType
  country   String?
  createdAt DateTime @default(now())

  @@index([createdAt])
}
```

**Fields:**

- `id`: Unique identifier
- `url`: Cloudinary URL of the achievement card image
- `username`: Player's username
- `score`: Score achieved in this game
- `gameType`: Game type for this achievement
- `country`: Player's country
- `createdAt`: Timestamp of upload

---

### **Enums**

#### GameType

```prisma
enum GameType {
  REFLEX_ARENA
  JUMP_MASTER
  MEMORY_MATCH
  OVERALL
}
```

**Values:**

- `REFLEX_ARENA`: Reflex Arena game
- `JUMP_MASTER`: Jump Master game
- `MEMORY_MATCH`: Memory Match game
- `OVERALL`: Overall leaderboard (aggregate)

---

## 🔧 Prerequisites

Before working with the database, ensure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database instance
3. **DATABASE_URL** environment variable set in `.env`

### Environment Variable

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Example:**

```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/junie_arcade?schema=public"
```

**Production Example (e.g., Supabase):**

```env
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

---

## 🚀 Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This installs Prisma and Prisma Client.

---

### 2. Generate Prisma Client

Generate the Prisma Client based on your schema:

```bash
npx prisma generate
```

**When to run:**

- After cloning the repository
- After modifying `schema.prisma`
- When Prisma Client types are missing

---

### 3. Create Database & Push Schema

Push the schema to your database without creating migrations:

```bash
npx prisma db push
```

**What it does:**

- Creates all tables, indexes, and constraints
- Syncs schema with database
- Does NOT create migration files
- Ideal for development and prototyping

**Alternative (with migrations):**

```bash
npx prisma migrate dev --name init
```

---

### 4. Seed Countries Data

Populate the Country table with 176 countries:

```bash
npx tsx prisma/seed-countries.ts
```

**Output:**

```
🌍 Starting country seeding...
✓ Added/Updated 🇦🇫 Afghanistan (AF)
✓ Added/Updated 🇦🇱 Albania (AL)
...
✨ Country seeding completed!
   Added/Updated: 176 countries
   Total: 176 countries
```

---

## 📝 Common Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Push Schema to Database

```bash
npx prisma db push
```

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

- Opens at `http://localhost:5555`
- Visual database browser and editor
- Perfect for debugging and data inspection

### Format Schema File

```bash
npx prisma format
```

### Validate Schema

```bash
npx prisma validate
```

### Reset Database (⚠️ DESTRUCTIVE)

```bash
npx prisma migrate reset
```

**WARNING:** This will:

- Drop the database
- Create a new database
- Apply all migrations
- Run seed scripts

---

## 🔄 Migrations

Migrations track database schema changes over time.

### Create a New Migration

When you modify `schema.prisma`:

```bash
npx prisma migrate dev --name <migration_name>
```

**Example:**

```bash
npx prisma migrate dev --name add_country_code_field
```

**What happens:**

1. Prisma detects schema changes
2. Creates SQL migration file in `prisma/migrations/`
3. Applies migration to database
4. Regenerates Prisma Client

---

### Apply Migrations (Production)

Apply pending migrations without prompts:

```bash
npx prisma migrate deploy
```

**Use this for:**

- Production deployments
- CI/CD pipelines
- Staging environments

---

### View Migration Status

```bash
npx prisma migrate status
```

Shows:

- Applied migrations
- Pending migrations
- Database connection status

---

### Resolve Migration Issues

If migrations fail or are out of sync:

```bash
npx prisma migrate resolve --applied <migration_name>
```

Or mark as rolled back:

```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 🌱 Seeding Data

### Seed Countries

Run the country seeding script:

```bash
npx tsx prisma/seed-countries.ts
```

**What it does:**

- Adds/updates 176 countries
- Includes country codes (ISO 3166-1 alpha-2)
- Includes flag emojis

**Script:** `prisma/seed-countries.ts`

---

### Update Country Codes

If you need to update only country codes:

```bash
npx tsx prisma/seed-countries-update.ts
```

**Script:** `prisma/seed-countries-update.ts`

---

### Custom Seeding

To add custom seed data, create a new seed file:

```typescript
// prisma/seed-custom.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Your seed logic here
  await prisma.player.create({
    data: {
      username: "TestPlayer",
      country: "United States",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Run it:

```bash
npx tsx prisma/seed-custom.ts
```

---

## 🛠️ Database Management

### Backup Database

**Using pg_dump (PostgreSQL):**

```bash
pg_dump -U <username> -d <database> -F c -b -v -f backup.dump
```

**Example:**

```bash
pg_dump -U postgres -d junie_arcade -F c -b -v -f junie_arcade_backup.dump
```

---

### Restore Database

```bash
pg_restore -U <username> -d <database> -v backup.dump
```

---

### Clear All Data (Keep Schema)

```bash
npx prisma db execute --stdin < clear_data.sql
```

**Create `clear_data.sql`:**

```sql
TRUNCATE TABLE "Score" CASCADE;
TRUNCATE TABLE "Player" CASCADE;
TRUNCATE TABLE "GalleryItem" CASCADE;
TRUNCATE TABLE "DailyLeaderboard" CASCADE;
-- Keep Country table populated
```

---

### Drop and Recreate Database

```bash
npx prisma migrate reset
```

---

## 🐛 Troubleshooting

### Issue: "Prisma Client not found"

**Solution:**

```bash
npx prisma generate
```

---

### Issue: "Can't reach database server"

**Checklist:**

1. Is PostgreSQL running?

   ```bash
   # Check if PostgreSQL is running
   psql --version
   ```

2. Is `DATABASE_URL` correct in `.env`?

   ```bash
   echo $DATABASE_URL
   ```

3. Can you connect manually?

   ```bash
   psql $DATABASE_URL
   ```

4. Check firewall/network settings

---

### Issue: "Migration failed"

**Solution:**

```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --rolled-back <migration_name>

# Try again
npx prisma migrate dev
```

---

### Issue: "Schema out of sync"

**Solution:**

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or push schema without migrations
npx prisma db push
```

---

### Issue: "Unique constraint violation"

**Cause:** Trying to insert duplicate data with unique fields

**Solution:**

- Use `upsert` instead of `create`:
  ```typescript
  await prisma.player.upsert({
    where: { id: "player_id" },
    update: { username: "NewName" },
    create: { username: "NewName", country: "US" },
  });
  ```

---

## 📚 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Prisma Schema Reference:** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Prisma Client API:** https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

---

## 🔗 Quick Reference

| Command                            | Description                   |
| ---------------------------------- | ----------------------------- |
| `npx prisma generate`              | Generate Prisma Client        |
| `npx prisma db push`               | Push schema to database       |
| `npx prisma studio`                | Open database GUI             |
| `npx prisma migrate dev`           | Create and apply migration    |
| `npx prisma migrate deploy`        | Apply migrations (production) |
| `npx tsx prisma/seed-countries.ts` | Seed countries data           |
| `npx prisma format`                | Format schema file            |
| `npx prisma validate`              | Validate schema               |
