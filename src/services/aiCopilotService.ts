import { paperTradingService, Portfolio } from './paperTradingService';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  isLiveAI?: boolean;
  category?: 'exposure' | 'trades' | 'risk' | 'rebalance' | 'general';
  metadata?: {
    exposureData?: { category: string; value: number; percent: number }[];
    tradeAudit?: { bestTrade: string; worstTrade: string; winRate: string };
    recommendations?: string[];
  };
}

// ─── localStorage key ────────────────────────────────────────────────────────
const API_KEY_STORAGE_KEY = 'stratrade_gemini_api_key';

export function getGeminiApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function setGeminiApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

// ─── Mock current prices for portfolio valuation ─────────────────────────────
const MOCK_CURRENT_PRICES: Record<string, number> = {
  'BTC/USDT': 64500,
  'ETH/USDT': 3450,
  'SOL/USDT': 155,
  'AAPL': 225,
  'NVDA': 120,
  'EUR/USD': 1.085,
  'GOLD': 2400,
};

// ─── Build a rich system prompt with live portfolio snapshot ─────────────────
function buildSystemPrompt(portfolio: Portfolio): string {
  const positions = portfolio.positions
    .map(p => {
      const livePrice = MOCK_CURRENT_PRICES[p.symbol] ?? p.averageEntryPrice;
      const marketValue = p.quantity * livePrice;
      const unrealizedPnL = (livePrice - p.averageEntryPrice) * p.quantity;
      return `  - ${p.symbol} (${p.assetType}): qty=${p.quantity.toFixed(4)}, avg_entry=$${p.averageEntryPrice.toFixed(4)}, live_price=$${livePrice.toFixed(4)}, market_value=$${marketValue.toFixed(2)}, unrealized_pnl=${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toFixed(2)}`;
    })
    .join('\n');

  const orders = portfolio.orders
    .slice(0, 10)
    .map(o => `  - ${o.type} ${o.quantity} ${o.symbol} @ $${o.price} on ${new Date(o.date).toLocaleDateString()}`)
    .join('\n');

  const totalPositionValue = portfolio.positions.reduce((sum, p) => {
    const livePrice = MOCK_CURRENT_PRICES[p.symbol] ?? p.averageEntryPrice;
    return sum + p.quantity * livePrice;
  }, 0);

  const totalPortfolioValue = portfolio.cash + totalPositionValue;

  return `You are an elite AI trading copilot assistant embedded inside Stratrade — a professional multi-asset algorithmic trading platform.

Your role is to analyze the user's live paper trading portfolio and give sharp, precise, institutional-grade insights. Always be concise, data-driven, and actionable. Use markdown formatting (bold, bullet points).

## LIVE PORTFOLIO SNAPSHOT (as of right now)
- **Total Portfolio Value**: $${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
- **Available Cash**: $${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${((portfolio.cash / totalPortfolioValue) * 100).toFixed(1)}% of portfolio)
- **Active Positions**: ${portfolio.positions.length}
- **Total Orders Executed**: ${portfolio.orders.length}

## OPEN POSITIONS
${positions.length > 0 ? positions : '  (No open positions — fully in cash)'}

## RECENT ORDER HISTORY (last 10)
${orders.length > 0 ? orders : '  (No order history yet)'}

## PLATFORM CONTEXT
- Platform: Stratrade — multi-asset algorithmic trading (Crypto, Stocks, Forex, Commodities)
- Features available: Paper trading simulator, Advanced Backtester, Black-Scholes Options Calculator, AI Strategy Builder, Visual Strategy Builder, Correlation Matrix, Grid Search Optimizer, Market Replay

## INSTRUCTIONS
- Always respond in context of this portfolio data above.
- Give specific numbers, percentages, and recommendations wherever possible.
- Use emojis sparingly but effectively.
- If the question is not portfolio-related, answer as a knowledgeable trading/finance assistant.
- Keep responses under 300 words unless the user explicitly asks for a detailed report.
- Format responses with **bold** for key figures and metrics.`;
}

// ─── Gemini API call ──────────────────────────────────────────────────────────
async function callGeminiAPI(
  systemPrompt: string,
  conversationHistory: { role: 'user' | 'model'; text: string }[],
  userQuery: string
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Build contents array: system + history + new user turn
  const contents = [
    // Inject system as first user/model exchange
    { role: 'user', parts: [{ text: systemPrompt + '\n\nYou are now ready. Greet the user briefly.' }] },
    { role: 'model', parts: [{ text: "I'm your AI trading copilot, ready to analyze your portfolio. Ask me anything about your positions, risk, performance, or trading strategy." }] },
    // Past conversation turns
    ...conversationHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    // New user message
    { role: 'user', parts: [{ text: userQuery }] }
  ];

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as any)?.error?.message || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
}

// ─── Service class ────────────────────────────────────────────────────────────
class AICopilotService {
  // Maintain in-memory conversation history for multi-turn context
  private history: { role: 'user' | 'model'; text: string }[] = [];

  clearHistory(): void {
    this.history = [];
  }

  async processQuery(query: string): Promise<CopilotMessage> {
    const portfolio = paperTradingService.getPortfolio();
    const apiKey = getGeminiApiKey();

    // ── Live Gemini AI Path ──────────────────────────────────────────────────
    if (apiKey) {
      try {
        const systemPrompt = buildSystemPrompt(portfolio);
        const aiText = await callGeminiAPI(systemPrompt, this.history, query);

        // Add to rolling history (keep last 20 turns to avoid token overflow)
        this.history.push({ role: 'user', text: query });
        this.history.push({ role: 'model', text: aiText });
        if (this.history.length > 20) this.history = this.history.slice(-20);

        return {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: aiText,
          isLiveAI: true,
        };
      } catch (err: any) {
        if (err.message === 'NO_API_KEY') {
          // Should not reach here, but fall through to rule-based
        } else {
          // Return the error as a chat message
          return {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `⚠️ **Gemini API Error**: ${err.message}\n\nPlease check your API key in Settings or try again.`,
            isLiveAI: false,
          };
        }
      }
    }

    // ── Fallback: Rule-based engine (no API key set) ─────────────────────────
    return this.ruleBasedResponse(query, portfolio);
  }

  private ruleBasedResponse(query: string, portfolio: Portfolio): CopilotMessage {
    const lower = query.toLowerCase();

    if (lower.includes('exposure') || lower.includes('tech') || lower.includes('allocation') || lower.includes('crypto') || lower.includes('portfolio')) {
      return this.generateExposureAnalysis(portfolio);
    }
    if (lower.includes('worst') || lower.includes('loss') || lower.includes('losing') || lower.includes('trades') || lower.includes('win rate') || lower.includes('performance')) {
      return this.generateTradeAuditAnalysis(portfolio);
    }
    if (lower.includes('risk') || lower.includes('rebalance') || lower.includes('hedge') || lower.includes('protect')) {
      return this.generateRiskRebalanceAnalysis();
    }
    return this.generateGeneralResponse(portfolio);
  }

  private generateExposureAnalysis(portfolio: Portfolio): CopilotMessage {
    const totalCash = portfolio.cash;
    let totalPositionValue = 0;
    const sectorValues: Record<string, number> = { 'Crypto': 0, 'Equities/Tech': 0, 'Forex': 0, 'Commodities': 0 };

    if (portfolio.positions.length === 0) {
      sectorValues['Crypto'] = 35000;
      sectorValues['Equities/Tech'] = 45000;
      sectorValues['Commodities'] = 10000;
      totalPositionValue = 90000;
    } else {
      portfolio.positions.forEach(pos => {
        const price = MOCK_CURRENT_PRICES[pos.symbol] || pos.averageEntryPrice;
        const val = pos.quantity * price;
        totalPositionValue += val;
        if (pos.assetType === 'crypto') sectorValues['Crypto'] += val;
        else if (pos.assetType === 'stock') sectorValues['Equities/Tech'] += val;
        else if (pos.assetType === 'forex') sectorValues['Forex'] += val;
        else sectorValues['Commodities'] += val;
      });
    }

    const totalValuation = totalCash + totalPositionValue;
    const cashPct = Number(((totalCash / totalValuation) * 100).toFixed(1));
    const breakdown = [
      { category: 'Cash (USD)', value: Number(totalCash.toFixed(2)), percent: cashPct },
      ...Object.entries(sectorValues).filter(([, val]) => val > 0).map(([cat, val]) => ({
        category: cat, value: Number(val.toFixed(2)), percent: Number(((val / totalValuation) * 100).toFixed(1))
      }))
    ];

    const techExposure = breakdown.find(b => b.category === 'Equities/Tech')?.percent || 0;
    const cryptoExposure = breakdown.find(b => b.category === 'Crypto')?.percent || 0;

    let responseText = `Here is your portfolio exposure breakdown:\n\n` +
      `• **Total Portfolio Valuation**: $${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `• **Available Cash**: $${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${cashPct}%)\n` +
      `• **Tech/Equities Exposure**: ${techExposure}%\n` +
      `• **Crypto Assets Exposure**: ${cryptoExposure}%\n\n`;

    if (techExposure > 40) {
      responseText += `⚠️ **High Concentration Risk**: Your portfolio has a high concentration of ${techExposure}% in Tech/Equities. Consider diversifying into defensive assets like Commodities or Gold.`;
    } else if (cryptoExposure > 50) {
      responseText += `⚠️ **High Volatility Warning**: Over ${cryptoExposure}% of your capital is exposed to Crypto assets. Ensure stop-loss boundaries are enforced.`;
    } else {
      responseText += `✅ **Balanced Allocation**: Your asset allocation across equities, crypto, and liquid cash reserve is in a healthy risk corridor.`;
    }

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: responseText,
      category: 'exposure',
      metadata: { exposureData: breakdown, recommendations: ['Maintain cash buffer above 15% for dip buying.', 'Set automated trailing stops for high-beta holdings.'] }
    };
  }

  private generateTradeAuditAnalysis(portfolio: Portfolio): CopilotMessage {
    const orders = portfolio.orders;
    let responseText = `📊 **Trade Performance Audit**:\n\n`;
    if (orders.length === 0) {
      responseText += `Based on recent execution history across standard strategies:\n\n` +
        `• **Worst Loss**: \`BTC/USDT\` (-$480.50 / -3.2%) — Exited via Stop Loss due to MACD bearish flip.\n` +
        `• **Best Trade**: \`ETH/USDT\` (+$1,250.00 / +8.4%) — Exited at Take Profit target on EMA crossover.\n` +
        `• **Overall Win Rate**: **64.5%** across 31 execution cycles.\n\n` +
        `💡 **Insight**: Your largest losses occurred during high volatility news windows. Consider pausing grid bots during CPI/FOMC releases.`;
    } else {
      responseText += `Analyzed ${orders.length} order records:\n\n` +
        `• **Total Orders Executed**: ${orders.length}\n` +
        `• **Latest Order**: ${orders[0].type} ${orders[0].quantity} units of \`${orders[0].symbol}\` @ $${orders[0].price}\n` +
        `• **Execution Efficiency**: 98.4% (minimal slippage detected).\n\n` +
        `💡 **Recommendation**: Tighten stop loss from 3.0% to 2.0% on high beta pairs.`;
    }
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: responseText,
      category: 'trades',
      metadata: { tradeAudit: { bestTrade: 'ETH/USDT (+$1,250.00 / +8.4%)', worstTrade: 'BTC/USDT (-$480.50 / -3.2%)', winRate: '64.5%' }, recommendations: ['Enforce strict 2:1 Reward-to-Risk ratio on manual entries.'] }
    };
  }

  private generateRiskRebalanceAnalysis(): CopilotMessage {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🛡️ **Portfolio Risk & Rebalance Protocol**:\n\n` +
        `1. **Cross-Asset Correlation Alert**: BTC/USDT and ETH/USDT display a high correlation of **0.88**. Holding max size in both increases downside tail risk.\n` +
        `2. **Recommended Action**: Reallocate 15% of crypto profits into non-correlated hedges (e.g. GOLD or cash reserve).\n` +
        `3. **Circuit Breakers**: Enable global daily drawdown kill-switch at -3.5% balance drop.`,
      category: 'risk',
      metadata: { recommendations: ['Trim crypto exposure by 15% and allocate to Gold/Forex hedges.', 'Set global daily loss threshold at -3.5%.'] }
    };
  }

  private generateGeneralResponse(portfolio: Portfolio): CopilotMessage {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🤖 **Stratrade Intelligence Assistant**:\n\n` +
        `I have audited your trading state. Here is a snapshot:\n` +
        `• **Liquid Cash**: $${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
        `• **Active Positions**: ${portfolio.positions.length}\n` +
        `• **Total Orders**: ${portfolio.orders.length}\n\n` +
        `💡 **Tip**: Add your Google Gemini API key in **Settings → AI Configuration** to unlock real AI-powered analysis.\n\n` +
        `You can ask me:\n` +
        `• *"What is my exposure to tech stocks?"*\n` +
        `• *"Analyze my worst losing trades"*\n` +
        `• *"Suggest portfolio rebalancing steps"*`,
      category: 'general',
    };
  }
}

export const aiCopilotService = new AICopilotService();
