# Sky's the Limit - Cloud9 x JetBrains Hackathon

## 🎮 Overview

**Reimagine the future. Make it happen. With code.**

Cloud9 is bringing its competitive spirit from the arena to the dev world with a global hackathon built to ignite creativity, sharpen skills, and bring bold ideas to life. This is your chance to level up alongside one of the most storied organizations in esports.

---

## 🏆 Prize Pool: $25,000

### Category Winners ($6,000 each for Categories 1-3)

- **$6,000 USD Cash**
- $100 Cloud9 Store Gift Card
- JetBrains All Product Pack (1-year subscription)
- GDC Festival Pass
- All-Expense Paid Trip to GDC (Flight & Hotel)

### Category 4 Winner ($4,000)

- **$4,000 USD Cash**
- $100 Cloud9 Store Gift Card
- JetBrains All Product Pack (1-year subscription)
- GDC Festival Pass
- All-Expense Paid Trip to GDC (Flight & Hotel)

### Special Awards ($1,000 each)

- **Best Video Submission**
- **Most Valuable JetBrains/Junie Feedback**
- **Best Written Blog Post**

---

## 🚀 Getting Started

1. **Review Submission Requirements** below
2. **Apply for GRID Data Access** - [Application Link](https://grid.gg)
3. **Download JetBrains IDE** - [Get Started](https://www.jetbrains.com)
4. **Learn About Junie** - JetBrains AI Coding Agent

---

## 📋 Competition Categories

### Category 1: Comprehensive Assistant Coach

**Prize: $6,000 + Benefits**

#### Your Mission

Build a "Moneyball" inspired AI assistant that analyzes esports performance data and provides actionable strategic insights for coaches and players.

#### Core Requirements

Your application should:

1. **Provide Personalized Player/Team Insights**

   - Analyze individual player data and/or team data
   - Identify recurring mistakes and suboptimal patterns
   - Surface statistical outliers
   - Present low-level insights with areas for improvement
   - Generate strategic recommendations

2. **Generate Automated Macro Game Reviews**

   - Use historical match data from recently concluded matches
   - Automatically generate review agendas
   - Highlight critical macro-level decision points
   - Identify team-wide errors
   - Flag significant strategic moments

3. **BONUS: Predict Hypothetical Outcomes**
   - Model "what if" scenarios using historical data
   - Allow coaches to query past in-game decisions
   - Provide predictive analysis
   - **Key success factor: Accuracy**

#### Example Outputs

**VALORANT - Personalized Insight:**

```
Data: C9 loses 78% of rounds when OXY dies without KAST
Insight: OXY's opening duel success heavily impacts team performance.
Recommend reviewing opening pathing and strategy to ensure he's always
positioned for KAST (Kill/Assist/Survival/Trade).

Data: C9 loses both pistol rounds 70% of the time with 1-3-1 on Split
Insight: Review starting composition or pistol round strategies on Split.
```

**League of Legends - Personalized Insight:**

```
Data: Jungler ganks top pre-6 minutes: 22% success rate
      Jungler ganks bot pre-6 minutes: 68% success rate
Insight: Early topside pathing frequently counter-jungled or results in
low-impact ganks. Prioritize botside for early drake control.
```

**VALORANT - Macro Review Agenda:**

```
Match: BO1 | Opponent: Team X | Map: Corrode | Comp: 1-3-1

Key Points:
• Pistol Rounds: Lost both pistols
• Eco Management: Unsuccessful force-buy Round 2 → bonus loss Round 3
• Mid-Round Calls: 4/10 attacking rounds saw late A-main push (<20s), 3 losses
• Ultimate Economy: Only 7 orbs picked up vs 11 by enemy
```

**What If Prediction:**

```
Query: "Round 22 (10-11) on Haven - attempted 3v5 retake on C-site.
Should we have saved weapons?"

Analysis: 3v5 retake had 15% success probability. Saving 3 rifles would
have given 60% chance to win following gun round vs 35% on broken buy.
Saving was superior strategic choice.
```

---

### Category 2: Automated Scouting Report Generator

**Prize: $6,000 + Benefits**

#### Your Mission

Build an application that automatically generates pre-game scouting reports for any opponent using GRID historical match data.

#### Core Requirements

Your application should:

1. **Identify Common Team-wide Strategies**

   - Analyze recent matches for macro-level patterns
   - Determine aggressive vs defensive tendencies
   - Track objective contest rates
   - Identify default strategies (e.g., pistol round setups in VALORANT)

2. **Highlight Key Player Tendencies**

   - Pinpoint individual player habits
   - Track champion/agent pools
   - Identify statistical outliers
   - Find player-specific weaknesses

3. **Summarize Compositions & Setups**

   - Show most-played team compositions
   - Preferred builds (League of Legends)
   - Common defensive site setups (VALORANT)

4. **BONUS: Generate "How to Win" Insights**
   - Suggest data-backed counter-strategies
   - Identify exploitable weaknesses
   - Provide actionable recommendations

#### Example Outputs

**VALORANT Scouting Report:**

```
TEAM X - Last 10 Matches Analysis

Common Strategies:
• Attack: 70% pistol rounds are 5-man fast-hit B-Site (Ascent)
• Defense: Default 1-3-1 setup, Sentinel rotates to mid

Player Tendencies:
• "Jett" has 75% first-duel rate with Operator on A-main defense

Recent Compositions:
• Most-played (68% on Split): Jett, Raze, Brimstone, Skye, Cypher
```

**League of Legends Scouting Report:**

```
TEAM Y - Last 15 Matches Analysis

Common Strategies:
• Prioritizes first Drake (82% contest rate)
• 4-man group for first tower push, typically bot lane ~13 mins

Player Tendencies:
• Top: 90% pick/ban rate on Renekton
• Mid: KDA 2.1 on control mages vs 8.5 on assassins (clear weakness)

Recent Compositions:
• Most-played (60%): Ornn (Top), Viego (Jng), Azir (Mid), Zeri (Bot), Lulu (Sup)
• Style: Late-game, team-fight "protect the carry" composition

Actionable Insight:
Win condition is bot lane. Jungler paths bot 75% of time pre-10 mins.
Recommend: Aggressive counter-jungling top side + early ganks on mid-laner
to shut down secondary carry.
```

---

### Category 3: Drafting Assistant/Predictor (League of Legends Only)

**Prize: $6,000 + Benefits**

#### Your Mission

Build a real-time application that simulates and predicts League of Legends draft picks/bans, serving as a practice tool for players and coaches.

#### Core Requirements

Your application should:

1. **Recommend Optimal Picks and Bans**

   - Analyze opponent champion pools
   - Track recent match success rates
   - Evaluate team synergies
   - Identify counter-matchups
   - Calculate champion-specific win rates
   - Assess current draft strength

2. **BONUS: Turn-by-Turn Predictions**

   - Provide recommendations as draft progresses
   - Present probability distributions for opponent's next picks
   - Enable proactive banning and counter-picking
   - Account for draft order importance

3. **BONUS: Show Win Rate Impact**
   - Display real-time predicted win-rate percentage
   - Show how different picks/bans affect odds
   - Visualize draft strength changes

#### Example Output

**Mid-Draft Recommendation:**

```
DRAFT STATE:
Blue (Enemy): Banned Galio | Picked Jinx (B1), Rell (B2), Viego (B3)
Red (Us): Banned Corki, Nautilus | Picked Ashe (R1), Braum (R2)

RECOMMENDED R3 PICKS:

1. Sejuani → 60% Predicted Win Rate
   • High synergy (CC chain) with Ashe/Braum passives
   • Strong frontline vs Viego
   • Provides needed AP damage

2. Maokai → 58% Predicted Win Rate
   • Excellent gank setup for bot lane
   • Strong teamfight counter-engage vs Rell/Viego

3. Ryze → 58% Predicted Win Rate
   • Galio ban suggests possible Ryze pick
   • Steal Ryze to deny enemy

4. Jarvan IV → 53% Predicted Win Rate
   • High gank pressure to snowball bot lane
   • "Cataclysm" locks down Jinx in fights

⚠️ WARNINGS:
• Bad draft situation due to top lane constraints
• Team needs AP damage
• Consider Ziggs R1 bot lane in future drafts
```

---

### Category 4: Event Mini-Game

**Prize: $4,000 + Benefits**

#### Your Mission

Create a fun, engaging mini-game for fans at LCS or VCT events. **The winning project will be integrated into a future Cloud9 & JetBrains Event Booth.**

#### Core Requirements

Your game should be:

1. **Fast & Engaging**

   - Single play session under 3 minutes
   - High replayability
   - Instant gratification

2. **Intuitive & Accessible**

   - Simple controls (mouse-only, arrow keys, or single-button)
   - No tutorial needed
   - Anyone can understand instantly

3. **Thematic**

   - Related to Cloud9 brand OR JetBrains brand
   - Optionally based on League of Legends or VALORANT
   - (Not required to be esports-themed)

4. **BONUS: Live Leaderboard**
   - Dynamic high score list
   - Displayable on event booth screen
   - Drives competition among fans

#### Example Concept

**"Junie's Site Retake" (VALORANT Theme)**

```
Concept: 2D mouse-only game
• Control JetBrains "Junie" mascot
• Enemy utility appears on site (Viper Orb, Killjoy grenade, etc.)
• Click to "debug" (remove) enemy utility
• Avoid clicking friendly C9 player abilities
• Score based on speed and accuracy
• Game over after 2 minutes or 3 mistakes
```

---

## 📤 Submission Requirements

### What to Build

- Build or update a working application using JetBrains IDEs
- Optional: Use AI Coding Agent Junie to accelerate workflow
- Choose ONE category to submit to

### What to Submit

1. **Code Repository (REQUIRED)**

   - Public repository with all source code and assets
   - Include setup/installation instructions
   - Must have approved OSI Open Source License
   - Repository must be functional and testable

2. **Demo Video (REQUIRED)**

   - Approximately 3 minutes long
   - Upload to YouTube, Vimeo, or Facebook Video (public)
   - Demonstrate full functionality
   - Show key features and use cases

3. **Category Selection (REQUIRED)**

   - Clearly identify which category you're submitting to

4. **Completed Devpost Form (REQUIRED)**
   - Fill out all required fields
   - Provide accurate project information

---

## 🎯 Judging Criteria

### Technological Implementation

- Quality of software development
- Effective use of JetBrains IDEs or Junie
- Code quality and architecture
- Technical innovation

### Design

- User experience quality
- Interface design
- Usability and accessibility
- Visual polish

### Potential Impact

- Value to target community
- Scalability of solution
- Real-world applicability
- Problem-solving effectiveness

### Quality of the Idea

- Creativity and originality
- Innovation in approach
- Uniqueness of concept
- Execution of vision

---

## 🛠️ Resources

### Official Esports Data

- **GRID Data Access**: Apply to get League of Legends and VALORANT official esports data
- Includes match statistics, player performance, team compositions

### Development Tools

- **JetBrains IDEs**: Full suite of professional development environments
- **Junie AI Coding Agent**: Accelerate your workflow with AI assistance
- **Official Documentation**: Comprehensive guides and tutorials

### Support

- Expert guidance available throughout hackathon
- Cloud9 and JetBrains community support
- Technical resources and best practices

---

## 📝 Important Notes

### For All Categories (1-3):

- Use official GRID esports data for League of Legends and/or VALORANT
- Example outputs are **inspirational only** - not required to replicate
- Judged on overall functionality and value, not specific example matching
- Provide data/reasoning behind all insights
- Creative freedom encouraged - let your ideas flow!

### Data Requirements:

- **Categories 1-3**: Must use GRID data
- **Category 4**: Data integration optional

### Creativity is Key:

- Examples show possibilities, not limitations
- Innovation and unique approaches are valued
- Think beyond the examples provided
- Make it your own!

---

## 🎮 Why Join?

- **Experiment** with cutting-edge AI tools (JetBrains + Junie)
- **Access** official esports data from GRID
- **Compete** for $25,000 in prizes + exclusive perks
- **Build** something meaningful for the esports community
- **Connect** with Cloud9 and JetBrains ecosystems
- **Showcase** your skills to industry leaders

---

**Good luck, and may the best builds win! 🚀**

_For official rules and additional details, visit the hackathon page on Devpost._
