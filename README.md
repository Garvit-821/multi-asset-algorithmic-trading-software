# CryptoAgent - Multi-Asset Algorithmic Trading Platform

**CryptoAgent** is a comprehensive, institutional-grade multi-asset algorithmic trading, paper simulation, and risk analysis terminal. Designed for quantitative traders and administrators, it supports live crypto price charting via sub-second WebSockets, client-side strategy backtesting, Monte Carlo risk of ruin simulations, and real-time conditional alert notifications dispatched directly to Telegram.

---

## 📑 Table of Contents

1. [Key Features](#key-features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
   - [1. Clone the Repository](#1-clone-the-repository)
   - [2. Install Dependencies](#2-install-dependencies)
   - [3. Environment Setup](#3-environment-setup)
   - [4. Database Migration Setup](#4-database-migration-setup)
   - [5. Start the Development Server](#5-start-the-development-server)
5. [Architecture Overview](#architecture-overview)
   - [Directory Structure](#directory-structure)
   - [Data Flow & Request Lifecycle](#data-flow--request-lifecycle)
   - [Key Components](#key-components)
   - [Database Schema](#database-schema)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Testing & Verification](#testing--verification)
9. [Deployment](#deployment)
   - [Vite Static Frontend (Vercel/Netlify)](#vite-static-frontend-vercelnetlify)
   - [Docker Deployment](#docker-deployment)
10. [Troubleshooting](#troubleshooting)
11. [License](#license)

---

## Key Features

- **Pristine Coinbase-Inspired Brand Theme**: A clean, white-canvas design system utilizing soft-gray elevations (`#f7f7f7`), deep dark hero canvases (`#0a0b0d`), card overlays (`#16181c`), scarce Coinbase Blue accents (`#0052ff`), and monospace fonts (`JetBrains Mono`) for all numeric tables.
- **Low-Latency WebSocket Charts**: Candlestick charting powered by TradingView's `lightweight-charts` connected directly to the Binance WebSocket stream (`wss://stream.binance.com:9443`) for real-time crypto price updates.
- **Client-Side Portfolio Sandbox**: Execute virtual buys/sells on a persistent $100,000 portfolio, complete with position sizing, leverage multipliers, and allocations visualization.
- **Institutional Risk Metrics Matrix**: Real-time calculators for Value at Risk (VaR) at 95% confidence, Sharpe Ratio, Sortino Ratio (measuring downside volatility), and Pearson correlation coefficients against key asset classes.
- **Monte Carlo Ruin Probability Simulator**: Generates 1,000+ stochastic price paths utilizing Geometric Brownian Motion (GBM) to forecast risk of ruin percentages.
- **AI Strategy Builder & Backtester**: Fetches historical OHLCV data, calculates technical indicators (EMA, RSI, MACD, Bollinger Bands) in TypeScript, executes backtests, and runs optimization loops over variables.
- **No-Code Visual Strategy Builder**: Compile custom multi-conditional logic paths (Indicators, Operators, Parameters, Actions) into executable TypeScript strategy backtests without code.
- **Modern Portfolio Optimizer**: Construct client-side Markowitz Efficient Frontiers and optimize asset allocations using mean-variance models and historical covariances.
- **Historical Market Crisis Replay**: Replays second-by-second historical liquidations (FTX collapse, COVID Crash, Terra depegging) for manual order placement under high-stress simulator environments.
- **Alternative Social Sentiment Stream**: Computes real-time keyword sentiment averages from Twitter and Reddit to trigger automated Telegram notifications.
- **Background Conditional Alerts Manager**: Configure price-above, price-below, or price-cross targets. A background service polls active alert rows and dispatches Telegram notifications to mobile.

---

## Tech Stack

- **Language**: TypeScript 5.0+ (100% strict type safety)
- **Frontend Core**: React 18+ initialized via Vite
- **Database Engine**: PostgreSQL 16 (hosted on Supabase)
- **Real-Time Data**: Binance WebSocket API (`wss://`)
- **Background Notification Routing**: Telegram Bot API HTTP Webhooks
- **Styling**: TailwindCSS utility framework with CSS custom base styles
- **Visualization**: `lightweight-charts` (TradingView) & `recharts` (financial curves)
- **State Persistence**: Browser `localStorage` for sandbox portfolio ledgers

---

## Prerequisites

Before setting up the project locally, ensure you have the following installed:
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (or pnpm/yarn)
- **Supabase Account**: An active Supabase PostgreSQL database project
- **Telegram Bot**: Access to a bot token generated from Telegram's `@BotFather`

---

## Getting Started

Follow these step-by-step instructions to initialize and run the terminal on your local environment.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/multi-asset-algorithmic-trading-software.git
cd multi-asset-algorithmic-trading-software
```

### 2. Install Dependencies

Install the node package dependencies using `npm`:

```bash
npm install
```

### 3. Environment Setup

Copy the example environment configuration into a new `.env` file at the root directory:

```bash
cp .env.example .env
```

Open the `.env` file and fill in your Supabase connection credentials and Telegram credentials:

```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ...
```

### 4. Database Migration Setup

Initialize the tables and RLS security parameters in your Supabase project database:
1. Log in to your **Supabase Dashboard**.
2. Open the **SQL Editor** tab.
3. Paste and run the contents of the local sql migration scripts in this exact order:
   - `create_price_alerts_table.sql` (Creates alerts schema, states, and chat configurations)
   - `supabase/migrations/20251027051145_create_crypto_trading_tables.sql` (Generates cache tables and backtest stores)
   - `fix_rls_issues.sql` (Applies row-level policies mapping permissions to user identifiers)

### 5. Start the Development Server

Execute the development server script:

```bash
npm run dev
```

The terminal will run locally at [http://localhost:5173](http://localhost:5173). 

> [!NOTE]
> To access administrator dashboards, enter the system as `crypto@crypto.com`.

---

## Architecture Overview

### Directory Structure

```text
multi-asset-algorithmic-trading-software/
├── src/
│   ├── components/                 # UI components
│   │   ├── AIStrategyBuilder.tsx   # Strategy backtester & parameter optimizer
│   │   ├── AlertsManager.tsx       # Create/edit price alerts
│   │   ├── Dashboard.tsx           # Portfolio indicators & metric highlights
│   │   ├── LandingPage.tsx         # Coinbase-style entrance page
│   │   ├── ManualTrades.tsx        # Publish trading signals to feed
│   │   ├── MarketDashboard.tsx     # Candle charts & order placement forms
│   │   ├── MarketReplay.tsx        # Historical simulator & replay dashboard (New!)
│   │   ├── PaperTrading.tsx        # Sandbox balances & Composed HWM chart
│   │   ├── PortfolioOptimizer.tsx  # Markowitz Efficient Frontier optimization (New!)
│   │   ├── SocialSentiment.tsx     # Social index feeds and sentiment rules (New!)
│   │   ├── StrategyAlerts.tsx      # Interactive alert notification stream
│   │   ├── TradingViewChart.tsx    # Live WebSocket lightweight-charts wrapper
│   │   ├── VisualStrategyBuilder.tsx # Visual strategy block sandbox (New!)
│   │   └── UserDashboard.tsx       # Central feed workspace
│   ├── lib/
│   │   └── supabase.ts             # Supabase client instantiation
│   ├── services/                   # Business logic and workers
│   │   ├── alertMonitor.ts         # Polling loop for active alerts
│   │   ├── dataFeed.ts             # Binance historical REST & Live Websocket data
│   │   ├── marketSimulation.ts     # Global rates cache services
│   │   ├── paperTradingService.ts  # Ledger database and balance store
│   │   └── telegramService.ts      # Push notification messenger
│   ├── utils/                      # Calculations
│   │   └── riskCalculators.ts      # Monte Carlo, Sharpe, Sortino, VaR, & correlation math
│   ├── App.tsx                     # Routing & responsive sidebar navigation drawer
│   ├── index.css                   # Global styling sheet & font configurations
│   └── main.tsx                    # React DOM bootstrapper
├── supabase/
│   └── migrations/                 # PostgreSQL schema migrations
├── tailwind.config.js              # Theme custom parameters override
├── tsconfig.json                   # TypeScript project rules
└── README.md                       # Platform documentation
```

### Data Flow & Request Lifecycle

The diagram below charts how price data, user orders, alerts, and backtesting streams route between services:

```text
                                  +-----------------------+
                                  |  Binance WebSocket    |
                                  |  (wss:// stream)      |
                                  +-----------+-----------+
                                              |
                                              | Live Tick Data (<150ms)
                                              v
+------------------+   Read Orders   +--------+--------+   Candle Feed   +-----------------------+
|  Browser Local   |<----------------|  Trading View   |<----------------|  Binance REST API     |
|   Storage DB     |                 |  Lightweight    |                 |  (api.binance.com)    |
+--------+---------+                 |  Charts Canvas  |                 +-----------+-----------+
         |                           +-----------------+                             |
         | Read/Write Ledger                                                         | Historical
         v                                                                           | Candle Data
+--------+---------+                 +-----------------+                             v
|  Paper Trading   |                 |  User / Admin   |                 +-----------+-----------+
|  Service Engine  |---------------->|   Components    |<----------------|  AI Strategy Builder  |
+------------------+                 +--------+--------+                 |  Backtesting Engine   |
                                              |                          +-----------------------+
                                              | Writes Alerts
                                              v
                                     +--------+--------+                 +-----------------------+
                                     |  Supabase PG    |<----------------|  alertMonitor.ts      |
                                     |  (price_alerts) |  Polls Active   |  Background Service   |
                                     +-----------------+                 +-----------+-----------+
                                                                                     |
                                                                                     | Dispatch triggers
                                                                                     v
                                                                         +-----------+-----------+
                                                                         |  Telegram Bot API     |
                                                                         |  (Push Alert Mobile)  |
                                                                         +-----------------------+
```

### Key Components

- **Stochastic Path Simulator**: Models future portfolio asset prices using Geometric Brownian Motion (GBM):
  $$S_t = S_{t-1} \exp\left(\left(\mu - \frac{1}{2}\sigma^2\right)\Delta t + \sigma Z \sqrt{\Delta t}\right)$$
  - Calculates daily returns from historical standard deviations ($\sigma$) and mean drifts ($\mu$).
  - Maps uniform coordinates to standard normal coordinates using the **Box-Muller Transform**:
    $$Z = \sqrt{-2\ln U_1} \cos(2\pi U_2) \quad \text{where } U_1, U_2 \sim \text{Uniform}(0,1)$$
  - Runs 1,000 path projections over customizable horizons (15-60 days).
- **Modern Portfolio Optimization Engine**: Runs client-side Markowitz Mean-Variance allocations:
  - Annualized portfolio return: $E(R_p) = \sum w_i E(R_i) \times 252$
  - Annualized portfolio volatility: $\sigma_p = \sqrt{W^T \Sigma W} \times \sqrt{252}$ where $\Sigma$ is the covariance matrix of daily return series.
  - Simulates 500 random portfolio vectors $W$ to solve:
    $$\max_{W} \frac{E(R_p) - R_f}{\sigma_p}$$
    plotting the resulting **Efficient Frontier** and identifying the Tangency and Global Minimum Variance (GMV) targets.
- **No-Code Strategy Block Compiler**: Takes structured JSON rule flows (e.g. `RSI crosses below 30`), parses them into executable logic conditionals, calculates indicators client-side (EMA, RSI), and processes historical series evaluations to generate equity curves.
- **Historical Crisis Simulator (Flight Mode)**: Uses actual, high-frequency price paths from systemic collapses (FTX bankruptcy, COVID crash, LUNA depeg) to feed an interactive mock trading desk, letting traders verify execution psychology.
- **Social Sentiment Index Streamer**: Accumulates mentions from Twitter and Reddit feeds, scores vocabulary polarity indexes (-1.0 to 1.0), and maps rolling sentiment averages to trigger automated Telegram notifications when indexes breach boundaries.
- **Institutional Statistics Matrix**: Computes key metrics on the fly:
  - **Sharpe Ratio**: Measures the portfolio excess return per unit of volatility:
    $$\text{Sharpe} = \frac{R_p - R_f}{\sigma_p} \times \sqrt{252}$$
  - **Sortino Ratio**: penalizes downside deviation ($\sigma_d$) rather than standard deviation:
    $$\text{Sortino} = \frac{R_p - R_f}{\sigma_d} \times \sqrt{252} \quad \text{where } \sigma_d = \sqrt{\frac{1}{N} \sum_{i=1}^{N} \left[\min\left(0, R_{i} - R_f\right)\right]^2}$$
  - **Value at Risk (VaR)**: Determines the maximum loss expected on the portfolio over a 1-day horizon with 95% confidence:
    $$\text{VaR}_{95\%} = \text{Portfolio Value} \times \left( 1.645 \times \sigma_p \right)$$
- **Alert Monitor Background Daemon**: Runs an active polling sequence querying Supabase for `'active'` alerts. When current prices cross target thresholds, it updates the alert state to `'triggered'` and calls the Telegram API.

### Database Schema

```text
1. auth.users (Supabase Managed Schema)
   ├── id (uuid, PK)
   └── email (text)

2. price_alerts
   ├── id (uuid, PK)
   ├── user_id (uuid, FK -> auth.users.id)
   ├── symbol (text)                    -- e.g. "BTC/USDT"
   ├── asset_type (text)                -- crypto, forex, stock, commodity
   ├── exchange (text)                  -- e.g. "Binance"
   ├── alert_type (text)                -- price_above, price_below, price_cross
   ├── target_price (numeric)           -- target value
   ├── message (text)                   -- custom notification payload
   ├── status (text)                    -- active, triggered, cancelled
   ├── telegram_enabled (boolean)       -- push notifications flag
   ├── telegram_chat_id (text)          -- target Telegram room ID
   └── created_at (timestamp)

3. manual_trades
   ├── id (uuid, PK)
   ├── coin_name (text)                 -- token symbol
   ├── entry_price (numeric)
   ├── stop_loss (numeric)
   ├── target_price (numeric)
   ├── message (text)
   └── created_at (timestamp)

4. ai_strategies
   ├── id (uuid, PK)
   ├── strategy_name (text)             -- unique identifier
   ├── accuracy (numeric)               -- backtested win-rate
   ├── drawdown (numeric)               -- max drawdown ratio
   ├── profit_ratio (numeric)           -- profit factor
   ├── trades_count (integer)
   └── updated_at (timestamp)
```

---

## Environment Variables

The application requires specific environment configurations. Below is the detailed reference:

| Variable | Required | Description | Default | How to Obtain |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | **Yes** | The base gateway endpoint URL of your Supabase project. | - | Found under Project Settings > API in your Supabase dashboard. |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | The public API gateway token key. | - | Found under Project Settings > API in your Supabase dashboard. |
| `VITE_TELEGRAM_BOT_TOKEN` | **Yes** | The authorization token for the Telegram Bot. | - | Send a message to `@BotFather` on Telegram to create a bot. |

---

## Available Scripts

Use the following scripts inside the root folder to execute builds, typechecks, or preview bundles:

| Script | Command | Description |
|---|---|---|
| **dev** | `npm run dev` | Spins up the Vite local server at `http://localhost:5173`. |
| **build** | `npm run build` | Compiles the assets, TypeScript files, and CSS into static production bundles. |
| **preview** | `npm run preview` | Runs the compiled build locally to simulate production environments. |
| **typecheck** | `npm run typecheck` | Executes a strict TypeScript compile check over all files without emitting code. |
| **lint** | `npm run lint` | Inspects the source code for styling warnings or formatting infractions. |

---

## Testing & Verification

The terminal enforces strict type checking and manual code execution verification before deployment.

### Running Typechecks

```bash
npm run typecheck
```

### Backtest Validation

The AI strategy simulation pipeline calculates strategy indicators inside `AIStrategyBuilder.tsx`. It runs validation checks over variables (e.g. RSI periods, EMA thresholds) comparing:
- Trade execution times vs. actual historical candle ranges.
- Maximum drawdown calculation accuracy.
- Win/loss counts.

---

## Deployment

### Vite Static Frontend (Vercel/Netlify)

Since Vite compiles the application into static HTML, CSS, and JS files (`dist/` directory), you can host the frontend on serverless platforms.

1. **Deploying on Vercel**:
   - Install the Vercel CLI: `npm install -g vercel`.
   - Run `vercel` in the project root.
   - Configure the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TELEGRAM_BOT_TOKEN`) inside the Vercel project dashboard.
2. **Deploying on Netlify**:
   - Link your GitHub repository to Netlify.
   - Set the Build Command to `npm run build`.
   - Set the Publish Directory to `dist`.
   - Add your environment variables in the site configuration menu.

### Docker Deployment

To build a standalone image running the compiled project behind an Nginx server, run:

```bash
# Build the Docker image
docker build -t cryptoagent-terminal:latest .

# Run the container
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e VITE_TELEGRAM_BOT_TOKEN=your_token \
  -d cryptoagent-terminal:latest
```

---

## Troubleshooting

### WebSocket Connections Terminating

**Issue**: The trading chart shows no updates, or console logs warn of connection drops.

**Solution**:
1. Check your internet connection. Binance WebSockets require a stable connection.
2. Ensure you have not hit the IP rate limit on Binance (max 5 incoming connections per second, max 300 connections per user).
3. The charting wrapper (`TradingViewChart.tsx`) handles reconnect loops. Refresh the workspace page if the socket is blocked.

### Telegram Notifications Not Delivered

**Issue**: Alerts trigger, but no messages arrive on Telegram.

**Solution**:
1. Open Telegram and search for your bot. Click **Start** to initiate a session. Bots cannot message users who have not started a conversation.
2. Ensure your Telegram Chat ID is entered correctly in the settings menu. Get your ID instantly from the `@userinfobot` assistant bot.
3. Validate that your bot token is pasted correctly inside the `.env` file without spaces.

### Supabase RLS Policy Access Denied

**Issue**: Creating or retrieving alerts results in a `403 Forbidden` response.

**Solution**:
1. Confirm you run the `fix_rls_issues.sql` script on Supabase.
2. Ensure the authenticated user matches the `user_id` on the target row (`auth.uid() = user_id`).
3. Make sure your local client has logged in (logged in users are mapped automatically).

---

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
