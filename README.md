# CryptoAgent - Multi-Asset Algorithmic Trading Platform

![CryptoAgent Overview](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-06B6D4)

**CryptoAgent** is a comprehensive multi-asset algorithmic trading software designed to track, analyze, and manage real-time market data across various asset classes, including Cryptocurrencies, Forex, Stocks, and Commodities. Built with React and Supabase, it provides role-based access, automated alerting systems, and an AI strategy builder.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Application Flow](#-application-flow)
- [Setup & Installation](#-setup--installation)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🚀 Key Features

*   **Multi-Asset Support**: Track and trade Cryptocurrencies, Forex, Stocks, and Commodities from a single interface.
*   **Real-time Market Data Feeds**: Integration with Binance and CoinGecko for up-to-the-minute price and volume data.
*   **Role-Based Access Control (RBAC)**: Distinct views and capabilities for regular users (trading feed) and administrators (AI Strategy Builder, Manual Trades, and Alerts Manager).
*   **Advanced Price Alerts**: Set dynamic conditional alerts (`price_above`, `price_below`, `price_cross`) with real-time push and Telegram notifications.
*   **Interactive Trading Charts**: High-performance, interactive candlestick charts using Lightweight Charts and Recharts.
*   **AI Strategy Builder**: Define custom algorithmic trading strategies using multiple technical indicators (EMA, RSI, MACD).

---

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, TypeScript
*   **Styling**: TailwindCSS, Lucide React (Icons)
*   **Charting**: Lightweight Charts (TradingView), Recharts
*   **Backend / Database**: Supabase (PostgreSQL, Row Level Security)
*   **APIs**: Binance API, CoinGecko API, Telegram Bot API

---

## 🏗 System Architecture

The application adopts a modern serverless backend architecture connected to a reactive frontend.

```mermaid
graph TD
    %% Define styles
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef external fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff

    subgraph Frontend [React Frontend Client]
        UI[User Interface]
        Charts[Interactive Charts]
        Services[Background Services / Polishers]
    end

    subgraph Backend [Supabase Backend]
        DB[(PostgreSQL Database)]
        Auth[Auth / RLS]
        Cache[Market Data Cache]
    end

    subgraph External [External Services]
        Binance(Binance API)
        CoinGecko(CoinGecko API)
        Telegram(Telegram Bot API)
    end

    %% Connections
    UI --> Auth
    UI --> Charts
    UI --> Services
    Services --> |Fetch Prices| Binance
    Services --> |Fetch Market Data| CoinGecko
    Services <--> |Cache / Retrieve| Cache
    Services --> |Check Alerts| DB
    Services --> |Send Notification| Telegram
    Auth --> DB

    class UI,Charts,Services frontend;
    class DB,Auth,Cache backend;
    class Binance,CoinGecko,Telegram external;
```

---

## 🗄 Database Schema

The core backend relies on a PostgreSQL database managed by Supabase. Here is the Entity-Relationship (ER) diagram for the main operational tables.

```mermaid
erDiagram
    USERS ||--o{ PRICE_ALERTS : creates
    USERS ||--o{ MARKET_DATA_CACHE : queries

    USERS {
        uuid id PK
        string email
        timestamptz created_at
    }

    PRICE_ALERTS {
        uuid id PK
        uuid user_id FK
        string symbol "e.g., BTC/USDT"
        string asset_type "crypto, forex, stock, commodity"
        string exchange
        string alert_type "price_above, price_below, price_cross, manual"
        numeric target_price
        numeric condition_value
        string message
        string status "active, triggered, cancelled"
        boolean telegram_enabled
        string telegram_chat_id
        timestamptz triggered_at
        timestamptz created_at
    }

    MARKET_DATA_CACHE {
        uuid id PK
        string symbol
        string asset_type
        string exchange
        jsonb data
        timestamptz expires_at
    }
```

---

## 🔄 Application Flow

The system continuously monitors market data and checks active user alerts. When a condition is met, notifications are dispatched.

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant F as Frontend App
    participant DB as Supabase DB
    participant API as Binance/CoinGecko
    participant TG as Telegram Service

    U->>F: Create Price Alert (e.g. BTC > 100k)
    F->>DB: Insert Alert into `price_alerts` table
    DB-->>F: Success
    
    loop Every 30 seconds (Alert Monitor)
        F->>DB: Fetch Active Alerts
        DB-->>F: Return Alerts List
        F->>API: Fetch Latest Candles / Realtime Price
        API-->>F: Return Latest Price Data
        
        opt If Price Meets Condition
            F->>DB: Update Alert Status to 'triggered'
            F->>TG: Dispatch message to `telegram_chat_id`
            TG-->>U: Push Notification Received
        end
    end
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase Account and Project
- (Optional) Telegram Bot Token

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/multi-asset-algorithmic-trading-software.git
cd multi-asset-algorithmic-trading-software
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Execute the SQL migrations found in the `supabase/migrations/` and the root `.sql` files directly in your Supabase SQL Editor to set up the necessary tables (e.g., `price_alerts`) and Row Level Security (RLS) policies.
- Run `create_price_alerts_table.sql`
- Run `fix_rls_issues.sql`

### 5. Start the Development Server
```bash
npm run dev
```
The application will be running at `http://localhost:5173`.

---

## 📁 Project Structure

```text
multi-asset-algorithmic-trading-software/
├── src/
│   ├── components/       # Reusable React components & Views
│   │   ├── Auth/         # Login & Signup flows
│   │   ├── AIStrategyBuilder.tsx
│   │   ├── AlertsManager.tsx
│   │   ├── TradingViewChart.tsx
│   │   └── ...
│   ├── lib/              # Library configurations (e.g., Supabase client)
│   ├── services/         # Core business logic
│   │   ├── alertMonitor.ts       # Polling and processing alerts
│   │   ├── dataFeed.ts           # Interacting with Binance/CoinGecko APIs
│   │   ├── marketSimulation.ts   # Market simulation utilities
│   │   └── telegramService.ts    # Telegram bot integration
│   ├── utils/            # Helper functions
│   ├── App.tsx           # Main application routing and RBAC handling
│   ├── index.css         # Tailwind directives
│   └── main.tsx          # Application entry point
├── supabase/
│   └── migrations/       # Database migration scripts
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── vite.config.ts        # Vite configuration
└── README.md             # This documentation
```

---

## 📄 License
This project is licensed under the MIT License.
