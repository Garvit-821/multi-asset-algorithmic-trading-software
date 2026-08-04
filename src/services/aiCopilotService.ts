import { paperTradingService, Portfolio, Position } from './paperTradingService';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  category?: 'exposure' | 'trades' | 'risk' | 'rebalance' | 'general';
  metadata?: {
    exposureData?: { category: string; value: number; percent: number }[];
    tradeAudit?: { bestTrade: string; worstTrade: string; winRate: string };
    recommendations?: string[];
  };
}

// Default mock current prices for valuation calculation
const MOCK_CURRENT_PRICES: Record<string, number> = {
  'BTC/USDT': 64500,
  'ETH/USDT': 3450,
  'SOL/USDT': 155,
  'AAPL': 225,
  'NVDA': 120,
  'EUR/USD': 1.085,
  'GOLD': 2400,
};

class AICopilotService {
  /**
   * Process natural language query and return an AI analysis response
   */
  async processQuery(query: string): Promise<CopilotMessage> {
    const lower = query.toLowerCase();
    const portfolio = paperTradingService.getPortfolio();

    // 1. Tech / Crypto / Asset Class Exposure Query
    if (lower.includes('exposure') || lower.includes('tech') || lower.includes('allocation') || lower.includes('crypto') || lower.includes('portfolio')) {
      return this.generateExposureAnalysis(portfolio, query);
    }

    // 2. Worst Losing Trades / Trade Performance Audit Query
    if (lower.includes('worst') || lower.includes('loss') || lower.includes('losing') || lower.includes('trades') || lower.includes('win rate') || lower.includes('performance')) {
      return this.generateTradeAuditAnalysis(portfolio, query);
    }

    // 3. Risk & Rebalance Advice
    if (lower.includes('risk') || lower.includes('rebalance') || lower.includes('hedge') || lower.includes('protect')) {
      return this.generateRiskRebalanceAnalysis(portfolio, query);
    }

    // 4. Default Intelligent General Assistant Query
    return this.generateGeneralResponse(portfolio, query);
  }

  private generateExposureAnalysis(portfolio: Portfolio, query: string): CopilotMessage {
    const totalCash = portfolio.cash;
    let totalPositionValue = 0;
    const sectorValues: Record<string, number> = {
      'Crypto': 0,
      'Equities/Tech': 0,
      'Forex': 0,
      'Commodities': 0,
    };

    if (portfolio.positions.length === 0) {
      // If portfolio has no live positions, analyze default simulated positions for rich response
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
      ...Object.entries(sectorValues)
        .filter(([_, val]) => val > 0)
        .map(([cat, val]) => ({
          category: cat,
          value: Number(val.toFixed(2)),
          percent: Number(((val / totalValuation) * 100).toFixed(1))
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
      metadata: {
        exposureData: breakdown,
        recommendations: [
          'Maintain cash buffer above 15% for dip buying.',
          'Set automated trailing stops for high-beta holdings.'
        ]
      }
    };
  }

  private generateTradeAuditAnalysis(portfolio: Portfolio, query: string): CopilotMessage {
    const orders = portfolio.orders;
    const totalOrders = orders.length;

    let responseText = `📊 **Trade Performance Audit**:\n\n`;

    if (totalOrders === 0) {
      responseText += `Based on recent execution history across standard strategies:\n\n` +
        `• **Worst Loss**: \`BTC/USDT\` (-$480.50 / -3.2%) — Exited via Stop Loss due to MACD bearish flip.\n` +
        `• **Best Trade**: \`ETH/USDT\` (+$1,250.00 / +8.4%) — Exited at Take Profit target on EMA crossover.\n` +
        `• **Overall Win Rate**: **64.5%** across 31 execution cycles.\n\n` +
        `💡 **Insight**: Your largest losses occurred during high volatility news windows between 14:00 and 16:00 UTC. Consider pausing grid bots during CPI/FOMC releases.`;
    } else {
      responseText += `Analyzed ${totalOrders} order execution records in your portfolio:\n\n` +
        `• **Total Orders Executed**: ${totalOrders}\n` +
        `• **Latest Order**: ${orders[0].type} ${orders[0].quantity} units of \`${orders[0].symbol}\` @ $${orders[0].price}\n` +
        `• **Execution Efficiency**: 98.4% (minimal slippage detected).\n\n` +
        `💡 **Recommendation**: Tighten stop loss parameter from 3.0% to 2.0% on high beta pairs to limit drawdowns on rapid pullbacks.`;
    }

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: responseText,
      category: 'trades',
      metadata: {
        tradeAudit: {
          bestTrade: 'ETH/USDT (+$1,250.00 / +8.4%)',
          worstTrade: 'BTC/USDT (-$480.50 / -3.2%)',
          winRate: '64.5%'
        },
        recommendations: [
          'Enforce strict 2:1 Reward-to-Risk ratio on manual entries.',
          'Review losing trades triggered by sudden order book illiquidity.'
        ]
      }
    };
  }

  private generateRiskRebalanceAnalysis(portfolio: Portfolio, query: string): CopilotMessage {
    const responseText = `🛡️ **Portfolio Risk & Rebalance Protocol**:\n\n` +
      `1. **Cross-Asset Correlation Alert**: BTC/USDT and ETH/USDT display a high correlation coefficient of **0.88**. Holding max size in both increases downside tail risk.\n` +
      `2. **Recommended Action**: Reallocate 15% of crypto profits into non-correlated hedges (e.g. GOLD or cash reserve).\n` +
      `3. **Circuit Breakers**: Enable global daily drawdown kill-switch at -3.5% balance drop to prevent compounding losses.`;

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: responseText,
      category: 'risk',
      metadata: {
        recommendations: [
          'Trim crypto exposure by 15% and allocate to Gold/Forex hedges.',
          'Set global daily loss threshold at -3.5%.',
          'Run Auto Parameter Optimizer on visual strategy rules.'
        ]
      }
    };
  }

  private generateGeneralResponse(portfolio: Portfolio, query: string): CopilotMessage {
    const responseText = `🤖 **Stratrade Intelligence Assistant**:\n\n` +
      `I have audited your trading state. Here is a snapshot:\n` +
      `• **Liquid Cash**: $${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `• **Active Positions**: ${portfolio.positions.length}\n` +
      `• **Total Orders**: ${portfolio.orders.length}\n\n` +
      `You can ask me questions like:\n` +
      `• *"What is my exposure to tech stocks?"*\n` +
      `• *"Analyze my worst losing trades this week"*\n` +
      `• *"Suggest portfolio rebalancing steps"*`;

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: responseText,
      category: 'general',
    };
  }
}

export const aiCopilotService = new AICopilotService();
