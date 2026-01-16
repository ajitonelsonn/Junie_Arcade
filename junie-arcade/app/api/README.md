# Junie's Arcade API Documentation

Complete API reference for the Junie's Arcade backend endpoints.

---

## 📋 Table of Contents

- [API Overview](#-api-overview)
- [Authentication](#-authentication)
- [Endpoints](#-endpoints)
  - [Countries API](#1-countries-api)
  - [Players API](#2-players-api)
  - [Scores API](#3-scores-api)
  - [Leaderboard API](#4-leaderboard-api)
  - [Gallery API](#5-gallery-api)
  - [Upload Card API](#6-upload-card-api)
- [Error Handling](#-error-handling)
- [Rate Limiting & Caching](#-rate-limiting--caching)
- [Data Validation](#-data-validation)

---

## 🌐 API Overview

**Base URL:** `http://localhost:3000/api` (development)
**Production URL:** `https://your-domain.com/api`

**Technology Stack:**

- Framework: Next.js 14 App Router
- ORM: Prisma
- Database: PostgreSQL
- Storage: AWS S3
- Runtime: Edge (Vercel Edge Functions)

**Response Format:** JSON

---

## 🔐 Authentication

The API uses **API Key authentication** for protected endpoints.

### API Key Setup

1. **Generate a secure API key:**

   ```bash
   openssl rand -hex 32
   ```

2. **Add to `.env` file:**

   ```env
   # Server-side API key (validates incoming requests)
   API_SECRET_KEY="your-generated-key-here"

   # Frontend API key (included in requests)
   NEXT_PUBLIC_API_KEY="your-generated-key-here"
   ```

3. **Include in requests:**
   ```typescript
   const response = await fetch("/api/scores", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
     },
     body: JSON.stringify(data),
   });
   ```

### Protected Endpoints

| Endpoint                | Protection Level    |
| ----------------------- | ------------------- |
| `POST /api/players`     | 🔒 API Key Required |
| `POST /api/scores`      | 🔒 API Key Required |
| `POST /api/upload-card` | 🔒 API Key Required |
| `GET /api/countries`    | 🌐 Public           |
| `GET /api/scores`       | 🌐 Public           |
| `GET /api/leaderboard`  | 🌐 Public           |
| `GET /api/gallery`      | 🌐 Public           |

### Error Responses

**Missing API Key (401):**

```json
{
  "error": "API key required. Include x-api-key header."
}
```

**Invalid API Key (403):**

```json
{
  "error": "Invalid API key"
}
```

### Development Mode

If `API_SECRET_KEY` is not configured, the API runs in **open mode** (no authentication required). A warning is logged:

```
⚠️ API_SECRET_KEY not configured. API is running in open mode.
```

### Using the API Helper

The frontend includes a pre-configured API helper that automatically includes the API key:

```typescript
import { api } from "@/app/lib/api";

// POST requests
const response = await api.post("/api/players", { username, country });

// GET requests
const response = await api.get("/api/leaderboard?view=overall");
```

### Player Sessions

In addition to API key authentication, player sessions are managed via:

- **Player ID** (CUID) generated on first play
- **Username + Country** for session identification
- **LocalStorage** on the client side

---

## 📡 Endpoints

### 1. Countries API

Get list of all available countries for player selection.

#### **GET** `/api/countries`

**Description:** Fetch all countries with flags and codes.

**Query Parameters:** None

**Response:**

```json
[
  {
    "name": "Afghanistan",
    "code": "AF",
    "flag": "🇦🇫"
  },
  {
    "name": "United States",
    "code": "US",
    "flag": "🇺🇸"
  },
  ...
]
```

**Response Fields:**

- `name` (string): Full country name
- `code` (string): ISO 3166-1 alpha-2 country code
- `flag` (string): Unicode flag emoji

**Example Usage:**

```typescript
const response = await fetch("/api/countries");
const countries = await response.json();
```

**Status Codes:**

- `200 OK`: Success
- `500 Internal Server Error`: Database error

**Performance:**

- Returns ~176 countries
- Cached on client side
- Fast query (~10ms)

---

### 2. Players API

Create new player accounts.

#### **POST** `/api/players`

**Description:** Create a new player with username and country.

**Request Body:**

```json
{
  "username": "ProGamer123",
  "country": "United States"
}
```

**Request Fields:**

- `username` (string, required): Player's display name
- `country` (string, required): Player's country (full name)

**Response:**

```json
{
  "success": true,
  "playerId": "clx123abc456def789",
  "username": "ProGamer123",
  "country": "United States"
}
```

**Response Fields:**

- `success` (boolean): Operation status
- `playerId` (string): Unique player identifier (CUID)
- `username` (string): Confirmed username
- `country` (string): Confirmed country

**Example Usage:**

```typescript
const response = await fetch("/api/players", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "ProGamer123",
    country: "United States",
  }),
});
const data = await response.json();
console.log(data.playerId); // Store this for future requests
```

**Status Codes:**

- `200 OK`: Player created successfully
- `400 Bad Request`: Missing username or country
- `500 Internal Server Error`: Database error

**Validation:**

- Username: Must be non-empty string
- Country: Must be non-empty string

---

### 3. Scores API

Submit and retrieve game scores.

#### **POST** `/api/scores`

**Description:** Submit a new score for a player.

**Request Body:**

```json
{
  "playerId": "clx123abc456def789",
  "username": "ProGamer123",
  "country": "United States",
  "gameType": "REFLEX_ARENA",
  "score": 2450,
  "accuracy": 92.5,
  "time": 48.3,
  "maxCombo": 15,
  "distance": 350.5
}
```

**Request Fields:**

- `playerId` (string, optional): Player's unique ID
- `username` (string, required if no playerId): Player's username
- `country` (string, required if no playerId): Player's country
- `gameType` (string, required): Game type enum
  - `REFLEX_ARENA`
  - `JUMP_MASTER`
  - `MEMORY_MATCH`
  - `OVERALL`
- `score` (number, required): Final score value
- `accuracy` (number, optional): Accuracy percentage (0-100)
- `time` (number, optional): Time taken in seconds
- `maxCombo` (number, optional): Maximum combo achieved
- `distance` (number, optional): Distance traveled (Jump Master)

**Response:**

```json
{
  "success": true,
  "score": {
    "id": "clx987xyz123abc456",
    "playerId": "clx123abc456def789",
    "gameType": "REFLEX_ARENA",
    "score": 2450,
    "accuracy": 92.5,
    "time": 48.3,
    "maxCombo": 15,
    "distance": null,
    "createdAt": "2026-01-16T12:34:56.789Z"
  },
  "playerId": "clx123abc456def789"
}
```

**Duplicate Prevention:**

- Scores within 10 seconds with same player, gameType, and score value are considered duplicates
- Duplicate submissions return existing score with `alreadyExists: true`

**Example Usage:**

```typescript
const response = await fetch("/api/scores", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    playerId: localStorage.getItem("junie_player_id"),
    gameType: "REFLEX_ARENA",
    score: 2450,
    accuracy: 92.5,
    maxCombo: 15,
  }),
});
const data = await response.json();
```

**Status Codes:**

- `200 OK`: Score saved successfully
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Database error

---

#### **GET** `/api/scores`

**Description:** Fetch scores with optional filtering.

**Query Parameters:**

- `gameType` (string, optional): Filter by game type
  - `REFLEX_ARENA`
  - `JUMP_MASTER`
  - `MEMORY_MATCH`

**Response:**

```json
[
  {
    "id": "clx987xyz123abc456",
    "playerId": "clx123abc456def789",
    "gameType": "REFLEX_ARENA",
    "score": 2450,
    "accuracy": 92.5,
    "time": 48.3,
    "maxCombo": 15,
    "distance": null,
    "createdAt": "2026-01-16T12:34:56.789Z",
    "player": {
      "id": "clx123abc456def789",
      "username": "ProGamer123",
      "country": "United States",
      "createdAt": "2026-01-16T10:00:00.000Z"
    }
  },
  ...
]
```

**Example Usage:**

```typescript
// Get all scores
const response = await fetch("/api/scores");

// Get only Reflex Arena scores
const response = await fetch("/api/scores?gameType=REFLEX_ARENA");
```

**Limits:**

- Returns top 50 scores by default
- Ordered by score (descending)

**Status Codes:**

- `200 OK`: Success
- `500 Internal Server Error`: Database error

---

### 4. Leaderboard API

Get ranked leaderboards with Champion Points calculation.

#### **GET** `/api/leaderboard`

**Description:** Fetch leaderboard with rankings and Champion Points.

**Query Parameters:**

- `view` (string, optional): Leaderboard type
  - `overall` (default): Overall leaderboard with Champion Points
  - `reflex`: Reflex Arena leaderboard
  - `jump`: Jump Master leaderboard
  - `memory`: Memory Match leaderboard
- `country` (string, optional): Filter by country name
- `playerId` (string, optional): Include specific player stats

**Response (Overall View):**

```json
{
  "type": "overall",
  "leaderboard": [
    {
      "playerId": "clx123abc456def789",
      "username": "ProGamer123",
      "country": "United States",
      "reflexScore": 2450,
      "jumpScore": 820,
      "memoryScore": 1680,
      "gamesPlayed": 3,
      "hasPlayedAll": true,
      "reflexRank": 3,
      "jumpRank": 1,
      "memoryRank": 5,
      "reflexPoints": 80,
      "jumpPoints": 100,
      "memoryPoints": 75,
      "totalPoints": 255
    },
    ...
  ],
  "currentPlayer": {
    // Same structure as leaderboard entry
  }
}
```

**Response (Individual Game View):**

```json
{
  "type": "reflex",
  "gameType": "REFLEX_ARENA",
  "leaderboard": [
    {
      "rank": 1,
      "username": "TopPlayer",
      "country": "South Korea",
      "score": 3200,
      "maxCombo": 25,
      "accuracy": 98.5,
      "time": null,
      "distance": null,
      "createdAt": "2026-01-16T12:00:00.000Z"
    },
    ...
  ]
}
```

**Champion Points Formula:**

```
Rank 1:      100 points
Rank 2:      90 points
Rank 3:      80 points
Rank 4-10:   100 - (rank × 5)
Rank 11-25:  50 - ((rank - 10) × 2)
Rank 26-50:  20 - (rank - 25)
Rank 51+:    Max(1, 10 - ⌊rank/10⌋)
```

**Example Usage:**

```typescript
// Get overall leaderboard
const response = await fetch("/api/leaderboard?view=overall");

// Get USA-only overall leaderboard
const response = await fetch(
  "/api/leaderboard?view=overall&country=United States"
);

// Get Reflex Arena leaderboard
const response = await fetch("/api/leaderboard?view=reflex");

// Get current player's stats
const playerId = localStorage.getItem("junie_player_id");
const response = await fetch(
  `/api/leaderboard?view=overall&playerId=${playerId}`
);
```

**Limits:**

- Returns top 100 players
- Fetches top 200 scores for individual games (filters to 100 best players)

**Caching:**

```
Cache-Control: public, s-maxage=10, stale-while-revalidate=30
```

- Cached for 10 seconds
- Stale content served for 30 seconds while revalidating

**Status Codes:**

- `200 OK`: Success
- `500 Internal Server Error`: Database error

---

### 5. Gallery API

Retrieve achievement card images.

#### **GET** `/api/gallery`

**Description:** Fetch all uploaded achievement card images.

**Query Parameters:** None

**Response:**

```json
[
  {
    "id": "clx789xyz123abc456",
    "url": "https://junies-arcade.s3.us-east-1.amazonaws.com/cards/card-1705420800000.png",
    "username": "ProGamer123",
    "score": 2450,
    "gameType": "REFLEX_ARENA",
    "country": "United States",
    "createdAt": "2026-01-16T12:00:00.000Z"
  },
  ...
]
```

**Response Fields:**

- `id` (string): Gallery item ID
- `url` (string): S3 URL of the achievement card image
- `username` (string): Player's username
- `score` (number): Score achieved
- `gameType` (string): Game type
- `country` (string): Player's country
- `createdAt` (string): Upload timestamp

**Example Usage:**

```typescript
const response = await fetch("/api/gallery");
const images = await response.json();
```

**Limits:**

- Returns 100 most recent images
- Ordered by `createdAt` (descending)

**Status Codes:**

- `200 OK`: Success
- `500 Internal Server Error`: Database error

**Performance:**

- Fast query (~20ms)
- Images loaded lazily on client

---

### 6. Upload Card API

Upload achievement card images to S3 and save to gallery.

#### **POST** `/api/upload-card`

**Description:** Upload a base64-encoded achievement card image to AWS S3.

**Request Body:**

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "achievement-card-1705420800000.png",
  "username": "ProGamer123",
  "score": 2450,
  "gameType": "REFLEX_ARENA",
  "country": "United States",
  "playerId": "clx123abc456def789"
}
```

**Request Fields:**

- `image` (string, required): Base64-encoded image data with MIME type prefix
- `filename` (string, optional): Custom filename (auto-generated if not provided)
- `username` (string, optional): Player's username (for gallery metadata)
- `score` (number, optional): Score value (for gallery metadata)
- `gameType` (string, optional): Game type (for gallery metadata)
- `country` (string, optional): Player's country (for gallery metadata)
- `playerId` (string, optional): Player ID (for linking to correct player)

**Response:**

```json
{
  "url": "https://junies-arcade.s3.us-east-1.amazonaws.com/cards/achievement-card-1705420800000.png"
}
```

**Response Fields:**

- `url` (string): Public URL of the uploaded image

**Example Usage:**

```typescript
// Convert canvas to base64
const canvas = document.getElementById("achievement-card");
const imageData = canvas.toDataURL("image/png");

// Upload to S3
const response = await fetch("/api/upload-card", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image: imageData,
    filename: `card-${Date.now()}.png`,
    username: "ProGamer123",
    score: 2450,
    gameType: "REFLEX_ARENA",
    country: "United States",
  }),
});
const data = await response.json();
console.log(data.url); // S3 URL
```

**AWS S3 Configuration:**

```typescript
{
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
}
```

**Environment Variables Required:**

- `AWS_REGION`: S3 bucket region (e.g., "us-east-1")
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `S3_BUCKET_NAME`: S3 bucket name (default: "junies-arcade")

**Image Processing:**

1. Remove `data:image/(png|jpeg|webp);base64,` prefix
2. Decode base64 to buffer
3. Upload to S3 with appropriate Content-Type
4. Generate public URL
5. Save metadata to database (if provided)

**Supported Formats:**

- PNG (default)
- JPEG/JPG
- WebP

**Storage Path:**

```
s3://junies-arcade/cards/{filename}
```

**Status Codes:**

- `200 OK`: Upload successful
- `400 Bad Request`: No image data provided
- `500 Internal Server Error`: S3 or database error

**Limits:**

- Max file size: ~5MB (base64 encoded)
- Recommended dimensions: 800x1000px

---

## ⚠️ Error Handling

All API endpoints follow consistent error response format:

**Error Response:**

```json
{
  "error": "Error message description"
}
```

**Common Error Messages:**

- `"Username and country are required"` (400)
- `"Player ID or username/country required"` (400)
- `"No image data provided"` (400)
- `"Failed to create player"` (500)
- `"Failed to save score"` (500)
- `"Failed to fetch leaderboard"` (500)
- `"Failed to fetch gallery images"` (500)

**Error Handling Best Practices:**

```typescript
try {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scoreData),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("API Error:", error.error);
    // Handle error (show user message, retry, etc.)
    return;
  }

  const data = await response.json();
  // Process successful response
} catch (error) {
  console.error("Network Error:", error);
  // Handle network/connection errors
}
```

---

## 🔒 Rate Limiting & Caching

### Rate Limiting

Rate limiting is implemented using an in-memory store to prevent API abuse.

**Current Limits:**

| Endpoint                | Limit       | Window            |
| ----------------------- | ----------- | ----------------- |
| `POST /api/players`     | 10 requests | per minute per IP |
| `POST /api/scores`      | 30 requests | per minute per IP |
| `POST /api/upload-card` | 20 requests | per minute per IP |

**Rate Limit Response (429):**

```json
{
  "error": "Too many requests. Please try again later."
}
```

**Response Headers:**

```
Retry-After: <seconds until reset>
```

**Implementation:**

```typescript
// Located in: app/lib/auth.ts
import { rateLimit, getClientIp } from "@/app/lib/auth";

// In your API route:
const clientIp = getClientIp(request);
const rateLimitResult = rateLimit(`scores:${clientIp}`, 30, 60000);
if (!rateLimitResult.allowed) {
  return rateLimitResult.error;
}
```

### Caching Strategy

**Leaderboard API:**

```
Cache-Control: public, s-maxage=10, stale-while-revalidate=30
```

- Cached on CDN for 10 seconds
- Stale content served for up to 30 seconds during revalidation
- Reduces database load during high traffic

**Other Endpoints:**

- No explicit caching headers
- Can be cached on client side as needed

### Production Rate Limiting (Optional)

For production environments with multiple instances, consider using Redis-based rate limiting:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "1 m"),
});
```

---

## ✅ Data Validation

### Input Sanitization

All string inputs are automatically sanitized using the `sanitizeString` helper:

```typescript
import { sanitizeString } from "@/app/lib/auth";

// Sanitizes and limits string length
const sanitizedUsername = sanitizeString(username, 50); // max 50 chars
const sanitizedCountry = sanitizeString(country, 100); // max 100 chars
```

### Score Submission Validation

**Required Fields:**

- `gameType`: Must be one of `REFLEX_ARENA`, `JUMP_MASTER`, `MEMORY_MATCH`, `OVERALL`
- `score`: Must be an integer between 0 and 1,000,000

**Validation Functions:**

```typescript
import { isValidGameType, isValidScore } from "@/app/lib/auth";

isValidGameType("REFLEX_ARENA"); // true
isValidGameType("INVALID"); // false

isValidScore(2450); // true
isValidScore(-100); // false
isValidScore(1.5); // false (must be integer)
```

**Duplicate Prevention:**

- Prevents duplicate scores within 10 seconds
- Checks: same playerId + gameType + score + recent timestamp
- Returns existing score with `alreadyExists: true`

**Data Integrity:**

- All optional fields default to `null` if not provided
- Numeric fields validated (score must be integer)
- Game type validated against enum

### Player Creation Validation

**Required Fields:**

- `username`: Non-empty string (max 50 characters)
- `country`: Non-empty string (max 100 characters)

**Username Rules:**

- Maximum 50 characters (sanitized)
- Special characters allowed
- Case-sensitive
- Trimmed of leading/trailing whitespace

### Upload Validation

**Input Validation:**

- `gameType`: Validated if provided
- `score`: Validated if provided (0-1,000,000 integer)
- `username` and `country`: Sanitized

**Image Validation:**

- Must be base64 encoded
- Must include MIME type prefix
- Supported formats: PNG, JPEG, WebP

---

## 🧪 Testing with Postman

### Initial Setup

1. **Start your development server:**

   ```bash
   npm run dev
   ```

   Server runs at: `http://localhost:3000`

2. **Open Postman** or download from: https://www.postman.com/downloads/

### Postman Collection Setup

#### Method 1: Import Collection (Recommended)

Create a file `junie-arcade-api.postman_collection.json`:

```json
{
  "info": {
    "name": "Junie's Arcade API",
    "description": "Complete API collection for Junie's Arcade",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api",
      "type": "string"
    },
    {
      "key": "playerId",
      "value": "",
      "type": "string"
    },
    {
      "key": "apiKey",
      "value": "your-api-key-here",
      "type": "string"
    }
  ],
  "item": []
}
```

Then import this file in Postman: **File → Import → Upload Files**

#### Method 2: Manual Setup

1. Create a new Collection named "Junie's Arcade API"
2. Add environment variables:
   - `baseUrl` = `http://localhost:3000/api`
   - `apiKey` = `your-api-key-here` (from your `.env` file)

---

### Test Each Endpoint

#### 1. **GET Countries** ✅

**Request:**

- Method: `GET`
- URL: `{{baseUrl}}/countries`
- Headers: None needed

**Postman Steps:**

1. Click "New" → "HTTP Request"
2. Set method to `GET`
3. Enter URL: `http://localhost:3000/api/countries`
4. Click "Send"

**Expected Response (200 OK):**

```json
[
  {
    "name": "Afghanistan",
    "code": "AF",
    "flag": "🇦🇫"
  },
  {
    "name": "Albania",
    "code": "AL",
    "flag": "🇦🇱"
  }
  // ... 174 more countries
]
```

---

#### 2. **POST Create Player** 👤 🔒

**Request:**

- Method: `POST`
- URL: `{{baseUrl}}/players`
- Headers:
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}` ⚠️ Required for authentication
- Body (raw JSON):
  ```json
  {
    "username": "TestPlayer123",
    "country": "United States"
  }
  ```

**Postman Steps:**

1. Create new request
2. Set method to `POST`
3. Enter URL: `http://localhost:3000/api/players`
4. Go to "Headers" tab:
   - Add: `Content-Type` = `application/json`
   - Add: `x-api-key` = `{{apiKey}}` (or your actual API key)
5. Go to "Body" tab:
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the JSON body
6. Click "Send"

**Expected Response (200 OK):**

```json
{
  "success": true,
  "playerId": "clx123abc456def789",
  "username": "TestPlayer123",
  "country": "United States"
}
```

**⚠️ IMPORTANT:** Copy the `playerId` from response! You'll need it for score submission.

**Save playerId as Variable:**

1. In Response, click "Tests" tab (in the request)
2. Add this script:
   ```javascript
   pm.test("Save playerId", function () {
     var jsonData = pm.response.json();
     pm.environment.set("playerId", jsonData.playerId);
   });
   ```

---

#### 3. **POST Submit Score** 🎮 🔒

**Request:**

- Method: `POST`
- URL: `{{baseUrl}}/scores`
- Headers:
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}` ⚠️ Required for authentication
- Body (raw JSON):
  ```json
  {
    "playerId": "{{playerId}}",
    "gameType": "REFLEX_ARENA",
    "score": 2450,
    "accuracy": 92.5,
    "maxCombo": 15
  }
  ```

**Game Types:**

- `REFLEX_ARENA`
- `JUMP_MASTER`
- `MEMORY_MATCH`
- `OVERALL`

**Optional Fields by Game:**

- **Reflex Arena**: `accuracy`, `maxCombo`
- **Jump Master**: `distance`
- **Memory Match**: `accuracy`, `time`, `maxCombo`

**Example for Jump Master:**

```json
{
  "playerId": "{{playerId}}",
  "gameType": "JUMP_MASTER",
  "score": 820,
  "distance": 350.5
}
```

**Example for Memory Match:**

```json
{
  "playerId": "{{playerId}}",
  "gameType": "MEMORY_MATCH",
  "score": 1680,
  "accuracy": 88.0,
  "time": 45.2,
  "maxCombo": 5
}
```

**Expected Response (200 OK):**

```json
{
  "success": true,
  "score": {
    "id": "clx987xyz123abc456",
    "playerId": "clx123abc456def789",
    "gameType": "REFLEX_ARENA",
    "score": 2450,
    "accuracy": 92.5,
    "time": null,
    "maxCombo": 15,
    "distance": null,
    "createdAt": "2026-01-16T12:34:56.789Z"
  },
  "playerId": "clx123abc456def789"
}
```

---

#### 4. **GET Scores** 📊

**Request:**

- Method: `GET`
- URL: `{{baseUrl}}/scores`
- Query Params (optional):
  - `gameType`: `REFLEX_ARENA` | `JUMP_MASTER` | `MEMORY_MATCH`

**Postman Steps:**

1. Create new GET request
2. Enter URL: `http://localhost:3000/api/scores`
3. Go to "Params" tab:
   - Add Key: `gameType`, Value: `REFLEX_ARENA`
4. Click "Send"

**Examples:**

- All scores: `GET /api/scores`
- Reflex only: `GET /api/scores?gameType=REFLEX_ARENA`
- Jump only: `GET /api/scores?gameType=JUMP_MASTER`

**Expected Response (200 OK):**

```json
[
  {
    "id": "clx987xyz123abc456",
    "playerId": "clx123abc456def789",
    "gameType": "REFLEX_ARENA",
    "score": 2450,
    "accuracy": 92.5,
    "maxCombo": 15,
    "createdAt": "2026-01-16T12:34:56.789Z",
    "player": {
      "id": "clx123abc456def789",
      "username": "TestPlayer123",
      "country": "United States",
      "createdAt": "2026-01-16T10:00:00.000Z"
    }
  }
  // ... up to 50 scores
]
```

---

#### 5. **GET Leaderboard** 🏆

**Request:**

- Method: `GET`
- URL: `{{baseUrl}}/leaderboard`
- Query Params:
  - `view` (optional): `overall` | `reflex` | `jump` | `memory` (default: `overall`)
  - `country` (optional): Country name (e.g., `United States`)
  - `playerId` (optional): Your player ID

**Postman Steps:**

1. Create new GET request
2. Enter URL: `http://localhost:3000/api/leaderboard`
3. Go to "Params" tab and add parameters

**Examples:**

**Overall Leaderboard:**

```
GET /api/leaderboard?view=overall
```

**USA-Only Overall:**

```
GET /api/leaderboard?view=overall&country=United States
```

**Reflex Arena Leaderboard:**

```
GET /api/leaderboard?view=reflex
```

**With Current Player Stats:**

```
GET /api/leaderboard?view=overall&playerId={{playerId}}
```

**Expected Response - Overall (200 OK):**

```json
{
  "type": "overall",
  "leaderboard": [
    {
      "playerId": "clx123abc456def789",
      "username": "TestPlayer123",
      "country": "United States",
      "reflexScore": 2450,
      "jumpScore": 820,
      "memoryScore": 1680,
      "gamesPlayed": 3,
      "hasPlayedAll": true,
      "reflexRank": 3,
      "jumpRank": 1,
      "memoryRank": 5,
      "reflexPoints": 80,
      "jumpPoints": 100,
      "memoryPoints": 75,
      "totalPoints": 255
    }
  ],
  "currentPlayer": null
}
```

**Expected Response - Individual Game (200 OK):**

```json
{
  "type": "reflex",
  "gameType": "REFLEX_ARENA",
  "leaderboard": [
    {
      "rank": 1,
      "username": "TestPlayer123",
      "country": "United States",
      "score": 2450,
      "maxCombo": 15,
      "accuracy": 92.5,
      "time": null,
      "distance": null,
      "createdAt": "2026-01-16T12:34:56.789Z"
    }
  ]
}
```

---

#### 6. **GET Gallery** 🖼️

**Request:**

- Method: `GET`
- URL: `{{baseUrl}}/gallery`
- Headers: None needed

**Postman Steps:**

1. Create new GET request
2. Enter URL: `http://localhost:3000/api/gallery`
3. Click "Send"

**Expected Response (200 OK):**

```json
[
  {
    "id": "clx789xyz123abc456",
    "url": "https://junies-arcade.s3.us-east-1.amazonaws.com/cards/card-1705420800000.png",
    "username": "TestPlayer123",
    "score": 2450,
    "gameType": "REFLEX_ARENA",
    "country": "United States",
    "createdAt": "2026-01-16T12:00:00.000Z"
  }
  // ... up to 100 images
]
```

---

#### 7. **POST Upload Card** 📤 🔒

**Request:**

- Method: `POST`
- URL: `{{baseUrl}}/upload-card`
- Headers:
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}` ⚠️ Required for authentication
- Body (raw JSON):
  ```json
  {
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "filename": "test-card.png",
    "username": "TestPlayer123",
    "score": 2450,
    "gameType": "REFLEX_ARENA",
    "country": "United States",
    "playerId": "{{playerId}}"
  }
  ```

**⚠️ Note:** You need a real base64 image. For testing, use this small test image:

**Minimal Test Body:**

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "filename": "test.png"
}
```

**Expected Response (200 OK):**

```json
{
  "url": "https://junies-arcade.s3.us-east-1.amazonaws.com/cards/test.png"
}
```

**⚠️ AWS Credentials Required:**

- Make sure `.env` has `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- Otherwise you'll get a 500 error

---

### Common Postman Features

#### Environment Variables

1. Click gear icon (⚙️) → "Manage Environments"
2. Add "Junie Arcade Local"
3. Add variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `playerId`: `clx123abc456def789` (your player ID)

Use in requests: `{{baseUrl}}`, `{{playerId}}`

#### Auto-Save playerId Script

Add to "Tests" tab of POST /players request:

```javascript
var jsonData = pm.response.json();
if (jsonData.success && jsonData.playerId) {
  pm.environment.set("playerId", jsonData.playerId);
  console.log("Saved playerId: " + jsonData.playerId);
}
```

#### Validate Responses

Add to "Tests" tab:

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has correct structure", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success");
});
```

---

### Testing Workflow Example

Complete flow to test the entire system:

1. **GET Countries** → Verify 176 countries returned
2. **POST Create Player** → Save `playerId`
3. **POST Submit Score (Reflex)** → Submit Reflex Arena score
4. **POST Submit Score (Jump)** → Submit Jump Master score
5. **POST Submit Score (Memory)** → Submit Memory Match score
6. **GET Leaderboard (Overall)** → See your Champion Points
7. **GET Leaderboard (Reflex)** → See your Reflex rank
8. **GET Gallery** → Check if any cards uploaded
9. **POST Upload Card** → Upload achievement card
10. **GET Gallery** → Verify card appears

---

### Troubleshooting

#### Error: "API key required" (401)

**Solution:**

- Add `x-api-key` header to your request
- In Postman Headers tab: `x-api-key` = `your-api-key`
- Make sure `API_SECRET_KEY` is set in your `.env` file

#### Error: "Invalid API key" (403)

**Solution:**

- Verify your API key matches `API_SECRET_KEY` in `.env`
- Check for extra spaces or quotes in your header value
- Regenerate key: `openssl rand -hex 32`

#### Error: "Too many requests" (429)

**Solution:**

- Wait for the rate limit window to reset (1 minute)
- Check the `Retry-After` header for exact seconds
- Rate limits: 10/min for players, 30/min for scores, 20/min for uploads

#### Error: "Cannot connect to localhost:3000"

**Solution:**

- Make sure dev server is running: `npm run dev`
- Check if port 3000 is in use

#### Error: "Username and country are required" (400)

**Solution:**

- Check Headers include `Content-Type: application/json`
- Verify Body format is JSON (not form-data)

#### Error: "Failed to save score" (500)

**Solution:**

- Check database connection in `.env`
- Run `npx prisma db push` to ensure schema is synced

#### Error: "Prisma Client not found"

**Solution:**

```bash
npx prisma generate
npm run dev
```

#### Error: S3 Upload fails (500)

**Solution:**

- Verify AWS credentials in `.env`:
  ```env
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=your_key
  AWS_SECRET_ACCESS_KEY=your_secret
  S3_BUCKET_NAME=junies-arcade
  ```

---

### Postman Tips

✅ **Save Requests to Collection** for reusability
✅ **Use Environment Variables** instead of hardcoding
✅ **Add Tests** to validate responses automatically
✅ **Use Pre-request Scripts** to generate dynamic data
✅ **Export Collection** to share with team

---

## 📚 Additional Resources

- **Postman Docs:** https://learning.postman.com/docs/getting-started/introduction/
- **Prisma Client Reference:** https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- **Next.js Route Handlers:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **AWS S3 SDK:** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/

---

## 🔗 Quick Reference

| Endpoint                        | Method | Purpose                      |
| ------------------------------- | ------ | ---------------------------- |
| `/api/countries`                | GET    | Get all countries            |
| `/api/players`                  | POST   | Create new player            |
| `/api/scores`                   | POST   | Submit score                 |
| `/api/scores?gameType=X`        | GET    | Get scores by game type      |
| `/api/leaderboard?view=overall` | GET    | Get overall leaderboard      |
| `/api/leaderboard?view=reflex`  | GET    | Get Reflex Arena leaderboard |
| `/api/leaderboard?view=jump`    | GET    | Get Jump Master leaderboard  |
| `/api/leaderboard?view=memory`  | GET    | Get Memory Match leaderboard |
| `/api/gallery`                  | GET    | Get achievement cards        |
| `/api/upload-card`              | POST   | Upload achievement card      |

---

**Junie's Arcade API**🇹🇱
