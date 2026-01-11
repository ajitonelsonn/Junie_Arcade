# 🚀 Quick Start Guide

Get Junie's Arcade running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- A Neon.tech account (free tier)

## Steps

### 1. Set up Database (2 minutes)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click "Create Project"
3. Copy the connection string (looks like `postgresql://...`)

### 2. Configure Project (1 minute)

Create a `.env` file in the project root:

```bash
DATABASE_URL="your-connection-string-here"
```

### 3. Install and Run (2 minutes)

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start the app
npm run dev
```

### 4. Play! (∞ minutes)

Open [http://localhost:3000](http://localhost:3000)

## Troubleshooting

**Database connection error?**
- Check your `.env` file has the correct `DATABASE_URL`
- Make sure your Neon.tech project is active

**Phaser game not loading?**
- Clear browser cache
- Check browser console for errors
- Try a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

**Assets not showing?**
- Make sure the `/public/assets` folder exists
- Check that all image paths are correct

## What's Next?

- Test all three games
- Check the leaderboard
- Deploy to Vercel (see README.md)

Happy gaming! 🎮
