# 🛠️ Issue Tracker & Definitions

This document serves as a repository for tracking platform bugs, layout glitches, and technical issues. It stores the title, description, reproduction steps, and eventual solutions.

---

## 🗂️ Active Issues Log

### 1. [ISSUE-001] GitHub Mobile App Markdown Render Crash
* **Status:** Open / Unresolved
* **Priority:** Low
* **Description:** The repository `README.md` fails to load, displays as a blank screen, or crashes on the native GitHub mobile application.
* **Root Cause:** The mobile app's Markdown parser does not support LaTeX/MathJax mathematical blocks (`$$` and `$`) and hangs when parsing complex formulas or nested equations.
* **Temporary Workaround:** Access the repository via a mobile web browser (Chrome/Safari) where MathJax is correctly initialized, or manually tap the `README.md` file rather than relying on the repository homepage auto-render.

### 2. [ISSUE-002] Implement Login Authentication
* **Status:** New
* **Priority:** High
* **Description:** Add a complete user signup, login, and session persistence authentication flow (e.g., via Supabase Auth) to secure custom strategy data and individual user workspaces.

### 3. [ISSUE-003] Extract Detailed Landing Page Documentation Sub-page
* **Status:** New
* **Priority:** Medium
* **Description:** Migrate comprehensive technical documentation and system guides from the root README into a dedicated standalone documentation view on the frontend, linked directly from the navigation bar.

### 4. [ISSUE-004] Support Email Notifications & Alerts
* **Status:** New
* **Priority:** Medium
* **Description:** Extend the background alert monitor daemon (`alertMonitor.ts`) to dispatch real-time price-crossing signals via email (e.g., using SendGrid, Resend, or SMTP) as an alternative to Telegram bot notifications.

### 5. [ISSUE-005] Native Android App & APK Build Integration (Capacitor)
* **Status:** New
* **Priority:** Medium
* **Description:** Package the React Vite application into a native Android app (`.apk` / `.aab`) using Ionic Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`). Includes setting up native Android WebView bridge, safe-area inset paddings, haptic feedback integration, native push notifications, and build scripts for compiling `.apk` files via Gradle.

### 6. [ISSUE-006] Email OTP Login & Forgot/Reset Password Support
* **Status:** New
* **Priority:** High
* **Description:** Implement one-time passwords (OTP) sent directly to users' email addresses for secure login, alongside a standard forgot password recovery email flow that sends password-reset tokens/links to set new credentials.

### 7. [ISSUE-007] Stripe & Web3 Subscription Payment Integration
* **Status:** New
* **Priority:** High
* **Labels:** `feature`, `payments`, `enhancement`
* **Description:** Implement automated backend payment processing for Stripe Checkout webhooks and Web3 crypto payment gateways (USDT/USDC on Solana & Polygon). Upon payment confirmation, the system updates user entitlement claims (`profiles.subscription_tier`) in Supabase to activate Pro or Enterprise features instantly.
* **Proposed Solution:**
  1. Create Supabase Edge Functions for Stripe `/create-checkout-session` and `/webhook` handlers.
  2. Implement Web3 wallet connection modal (Wagmi/RainbowKit or `@solana/wallet-adapter`) for crypto payments.
  3. Update `profiles` table schema to include `subscription_tier`, `subscription_status`, and `current_period_end`.

### 8. [ISSUE-008] Granular Feature Gating & Dynamic Tier Upgrade Modals
* **Status:** New
* **Priority:** High
* **Labels:** `ui`, `feature-gating`, `monetization`
* **Description:** Refine `LockedFeatureGuard.tsx` and `useFeatureGate.ts` to support granular per-feature lock overlays, monthly vs. annual pricing toggles, and interactive upgrade modal prompts when users attempt to access premium features (AI Copilot, 1,000-run Monte Carlo, TWAP/VWAP algo orders).
* **Proposed Solution:**
  1. Create a centralized `PricingModal.tsx` component with plan comparison tables.
  2. Add feature-specific preview modes (e.g. blur background with sample data for locked views).
  3. Implement free trial token grants (e.g., 3 free AI Copilot queries per day for Standard users).

### 9. [ISSUE-009] Vite Production Bundle Chunk Optimization & Code Splitting
* **Status:** New
* **Priority:** Medium
* **Labels:** `performance`, `build`, `optimization`
* **Description:** Configure `manualChunks` in `vite.config.ts` for heavy vendor libraries (`recharts`, `lightweight-charts`, `lucide-react`, `@supabase/supabase-js`) to eliminate large vendor chunk build warnings (>500 kB) and optimize browser load speeds.
* **Proposed Solution:**
  1. Update `vite.config.ts` with `build.rollupOptions.output.manualChunks` splitting core vendor libraries.
  2. Implement lazy loading (`React.lazy` & `Suspense`) for heavy sub-pages (e.g., `AdvancedBacktester.tsx`, `PortfolioOptimizer.tsx`, `DerivativesOptionsDashboard.tsx`).

### 10. [ISSUE-010] Real-Time Multi-Exchange WebSocket Streaming & Reconnection Resilience
* **Status:** New
* **Priority:** Medium
* **Labels:** `websocket`, `trading-engine`, `reliability`
* **Description:** Expand `exchangeConnector.ts` and `dataFeed.ts` to support native WebSocket Depth & Ticker streams for Coinbase Advanced Trade and Kraken, complete with exponential backoff reconnect logic and client-side message rate-limiting.
* **Proposed Solution:**
  1. Implement a unified WebSocket Manager class handling heartbeats, ping/pong frames, and automatic reconnect loops.
  2. Add client-side rate-limiting queues for high-frequency market depth streams under volatile trading conditions.

### 11. [ISSUE-011] Automated E2E & Unit Test Suite for Quantitative Engines
* **Status:** New
* **Priority:** Medium
* **Labels:** `testing`, `qa`, `typescript`
* **Description:** Establish automated unit testing via Vitest for quantitative calculators (`riskCalculators.ts`, `backtestEngine.ts`, `gridSearchOptimizer.ts`, `blackScholesEngine.ts`) and Playwright end-to-end (E2E) smoke tests for paper trading execution flows.
* **Proposed Solution:**
  1. Configure `vitest` test runner and write unit tests for Black-Scholes, Monte Carlo, Sharpe/Sortino ratios, and TWAP slicing logic.
  2. Set up GitHub Actions CI workflow to execute `npm run test` and `npm run typecheck` on pull requests.

### 12. [ISSUE-012] Full Dark/Light Theme Switcher & Accent Color Customizer
* **Status:** New
* **Priority:** Low
* **Labels:** `ui/ux`, `theme`, `design-system`
* **Description:** Expand the Coinbase-inspired styling system with a global React Theme Context allowing users to toggle between Dark Slate (`#0a0b0d`), Light Canvas (`#ffffff`), and custom accent themes across all trading views.
* **Proposed Solution:**
  1. Wrap application in `ThemeProvider` managing `theme` state stored in `localStorage`.
  2. Utilize Tailwind CSS custom variables for background, text, and border classes across all dashboard components.

---

## 📋 Issue Log Template

Copy this template to register new issues:

```markdown
### [ISSUE-XXX] Short Descriptive Title
* **Status:** [New / In Progress / Resolved]
* **Priority:** [High / Medium / Low]
* **Description:** Detailed description of the problem, including what part of the application is affected.
* **Reproduction Steps:**
  1. Go to '...'
  2. Click on '...'
  3. See error
* **Root Cause:** (Optional) Technical analysis of why the issue occurs.
* **Proposed Solution / Workaround:** (Optional) Proposed patch or workaround.
```
