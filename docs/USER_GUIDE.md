# Stratrade - Complete Platform & Feature User Guide

Welcome to the definitive user guide for **Stratrade** — the institutional-grade multi-asset algorithmic trading, backtesting, and AI intelligence platform.

---

## Table of Contents

1. [Platform Overview & Landing Page](#1-platform-overview--landing-page)
2. [Getting Started & Authentication](#2-getting-started--authentication)
3. [Multi-Asset Trading Terminal](#3-multi-asset-trading-terminal)
4. [Institutional Algorithmic Order Execution Engine](#4-institutional-algorithmic-order-execution-engine)
5. [AI Market Intelligence & Copilot](#5-ai-market-intelligence--copilot)
6. [AI & Visual Strategy Builders](#6-ai--visual-strategy-builders)
7. [Advanced Quantitative Backtester](#7-advanced-quantitative-backtester)
8. [Market Replay Simulator](#8-market-replay-simulator)
9. [Portfolio Optimizer & Risk Analytics](#9-portfolio-optimizer--risk-analytics)
10. [Derivatives & Options Dashboard](#10-derivatives--options-dashboard)
11. [High-Fidelity Paper Trading Sandbox](#11-high-fidelity-paper-trading-sandbox)
12. [Multi-Channel Alerts & Telegram Integration](#12-multi-channel-alerts--telegram-integration)
13. [Server-Side Multi-Exchange API Vault & Security](#13-server-side-multi-exchange-api-vault--security)
14. [Command Palette & Hotkeys](#14-command-palette--hotkeys)

---

## 1. Platform Overview & Landing Page

The Stratrade Landing Page serves as your portal into the platform, showcasing live market telemetry and key system capabilities:

- **Hero Telemetry Banner**: Displays real-time live ticker pricing across Crypto (BTC, ETH, SOL), Forex (EUR/USD, GBP/USD), Stocks (AAPL, NVDA), and Commodities (Gold, Crude Oil).
- **Interactive AI Strategy Preview**: Try natural language prompts directly on the home page to see how the AI engine formulates quantitative trading strategies.
- **Institutional Feature Grid**: Highlighting execution speed, multi-exchange routing, zero-knowledge API security, and Monte Carlo risk analytics.
- **Tier & Access Plans**: Overview of Free Sandbox, Quant Pro, and Institutional Enterprise tiers.
- **Quick Navigation**: Instant links to launch the Live Workspace, Sandbox Paper Trading, or Security Settings.

---

## 2. Getting Started & Authentication

1. **Accessing the Workspace**: Click **"Launch Platform"** or **"Start Sandbox Trading"** on the landing page.
2. **Session Authentication**: Sign in using your email credentials. Stratrade uses session-aware Supabase authentication to protect your private orders, backtest records, and exchange vaults.
3. **Paper Sandbox Mode**: New users automatically start with a **$100,000 USD virtual portfolio** to test strategies safely without risking real capital.

---

## 3. Multi-Asset Trading Terminal

The main trading dashboard combines real-time charting, order book depth, and instant order placement:

- **Multi-Asset Interactive Charting (`TradingViewChart`)**:
  - Supports Crypto, Forex, Equities, and Commodities with configurable timeframes (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`).
  - **Technical Indicators**: Toggle RSI (Relative Strength Index), MACD, Moving Averages (EMA 9, 21, 50, 200), and Bollinger Bands directly on the chart.
- **Level 2 Order Book & Depth Visualizer (`OrderBookDOM`)**:
  - Displays real-time bid/ask depth, spread, order volume imbalance, and cumulative market depth curves.
- **Quick Execution Modal (`QuickTradeModal`)**:
  - Execute Market or Limit orders instantly with automated Stop-Loss (SL) and Take-Profit (TP) bracket parameters.

---

## 4. Institutional Algorithmic Order Execution Engine

Submit large-volume orders without moving market prices or exposing trade intent using our advanced order-slicing algorithms:

1. **TWAP (Time-Weighted Average Price)**:
   - Divides large orders into smaller slices executed evenly across a specified time duration (e.g., 100 BTC over 60 minutes).
   - **Random Variance (0% - 30%)**: Randomizes slice sizes to prevent HFT algorithms from detecting TWAP patterns.
2. **VWAP (Volume-Weighted Average Price)**:
   - Slices orders proportionally based on intraday volume profiles (U-shaped distribution weighting more volume during market open/close).
3. **Iceberg Orders**:
   - Displays only a small "visible quantity" in the public order book (e.g., 0.1 BTC) while keeping the remainder hidden in reserve until filled.
4. **Server Proxy Execution**:
   - Slice orders are routed server-side via Supabase Edge Functions (`execute-exchange-order`) to Binance, Coinbase, or Kraken for maximum security and execution speed.

---

## 5. AI Market Intelligence & Copilot

Leverage DeepSeek and OpenAI-powered quantitative intelligence across the workspace:

- **Real-Time Market Signals**: Scans technical indicators and market structure to identify bullish/bearish setups, support/resistance levels, and recommended entry/SL/TP points.
- **Social & News Sentiment (`SocialSentiment`)**: Aggregates sentiment scores across Twitter/X, Reddit, and crypto news channels to assess market sentiment.
- **Floating AI Copilot Drawer**: Click the floating AI button (or press `Ctrl+K`) anytime to ask the AI Copilot questions about your portfolio, strategy performance, or market conditions.

---

## 6. AI & Visual Strategy Builders

Build complex algorithmic trading strategies without writing code:

- **AI Strategy Generator (`AIStrategyBuilder`)**:
  - Input natural language prompts like *"Create a breakout strategy for BTC when RSI is below 30 and volume spikes 200%"*.
  - Generates full rule logic, risk parameters, and code instantly.
- **Drag-and-Drop Node Builder (`VisualStrategyBuilder`)**:
  - Connect Condition Nodes (Price, RSI, EMA Crossover), Logical Operators (AND/OR), and Action Nodes (Buy Market, Sell Limit, Send Telegram Alert) visually.

---

## 7. Advanced Quantitative Backtester

Validate trading strategies against years of historical market data before deploying capital:

- **Performance Metrics**: CAGR, Net Profit, Win Rate, Profit Factor, Max Drawdown, Sharpe Ratio, and Sortino Ratio.
- **Monte Carlo Simulations**: Runs 1,000+ randomized trade sequence permutations to stress-test your strategy against extreme market tail risks.
- **Equity Curve & Benchmark Comparison**: Compares your strategy's equity growth against Buy-and-Hold BTC/SPY benchmarks.
- **Trade List Inspection**: Filter and review every simulated trade entry, exit, duration, and slippage impact.

---

## 8. Market Replay Simulator

Practice manual trading discipline with bar-by-bar historical replay:

- Select any asset and historical date range.
- Control playback speed (`1x`, `5x`, `10x`, `60x` speed or step-by-step frame forward).
- Place practice buy/sell orders in real-time as historical candles build, tracking your live PnL.

---

## 9. Portfolio Optimizer & Risk Analytics

Optimize multi-asset portfolio allocations using institutional quantitative finance models:

- **Markowitz Efficient Frontier**: Computes the optimal asset weighting for maximum return at your chosen volatility tolerance.
- **Value at Risk (VaR)**: Calculates maximum expected loss over a 1-day or 10-day period at 95% and 99% confidence levels.
- **Sharpe & Sortino Optimization**: Rebalances allocations to maximize risk-adjusted returns.

---

## 10. Derivatives & Options Dashboard

Analyze options chains and manage derivative exposure:

- **Options Chain Matrix**: Live calls/puts pricing across strike prices and expiry dates.
- **Greeks Calculator**: Live computation of Delta, Gamma, Theta, Vega, and Rho for calls/puts.
- **Payoff Diagram Visualizer**: Interactive profit/loss graphs at expiration for complex multi-leg options strategies (Straddles, Iron Condors, Bull Spreads).

---

## 11. High-Fidelity Paper Trading Sandbox

Master your trading skills risk-free:

- Starting balance of **$100,000 USD virtual cash**.
- Real-time mark-to-market position updates, average entry price calculations, and unrealized/realized PnL tracking.
- One-click **"Reset Sandbox Portfolio"** button to start fresh anytime.

---

## 12. Multi-Channel Alerts & Telegram Integration

Never miss a critical market setup:

- **Alert Conditions**: Price Above, Price Below, Price Cross, or Technical Indicator Crossovers.
- **Telegram Bot Dispatch**: Receive instant push notifications directly on your mobile device via the integrated Telegram Edge Function (`send-telegram-alert`).
- **In-App Toast Alerts**: Audio and visual alerts triggered inside the browser workspace.

---

## 13. Server-Side Multi-Exchange API Vault & Security

Connect your live exchange accounts with institutional-grade security:

- **Supported Exchanges**: Binance (Live & Testnet), Coinbase Advanced Trade, and Kraken.
- **AES-GCM 256-Bit Server Vault**: Your API keys and secrets are encrypted server-side (`user_exchange_keys` table) using a dedicated server secret.
- **Zero-Knowledge Client Architecture**: API keys are never stored in browser `localStorage` or exposed to client-side JavaScript. All order signatures are computed server-side in isolated Deno Edge Functions.

---

## 14. Command Palette & Hotkeys

Navigate the platform instantly using keyboard shortcuts:

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` or `Cmd + K` | Open Universal Command Palette |
| `B` | Open Quick Buy Order Modal |
| `S` | Open Quick Sell Order Modal |
| `Space` | Toggle Chart Play/Pause in Replay Mode |
| `Esc` | Close Active Modal / Drawer |

---

*Stratrade — Institutional Algorithmic Trading Made Accessible.*
