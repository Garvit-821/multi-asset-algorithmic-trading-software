import axios from 'axios';

const CRYPTO_PAIRS = [
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
  'DOGE/USDT', 'SOL/USDT', 'DOT/USDT', 'MATIC/USDT', 'LTC/USDT',
  'AVAX/USDT', 'LINK/USDT', 'UNI/USDT', 'ATOM/USDT', 'XLM/USDT',
  'ALGO/USDT', 'VET/USDT', 'FIL/USDT', 'TRX/USDT', 'ETC/USDT',
  'NEAR/USDT', 'AAVE/USDT', 'SAND/USDT', 'MANA/USDT', 'AXS/USDT',
  'FTM/USDT', 'HBAR/USDT', 'EGLD/USDT', 'XTZ/USDT', 'THETA/USDT',
  'ICP/USDT', 'EOS/USDT', 'FLOW/USDT', 'APE/USDT', 'CHZ/USDT',
  'CAKE/USDT', 'GRT/USDT', 'ENJ/USDT', 'QNT/USDT', 'KSM/USDT',
  'ZEC/USDT', 'RUNE/USDT', 'MKR/USDT', 'SNX/USDT', 'COMP/USDT',
  'CRV/USDT', 'SUSHI/USDT', 'YFI/USDT', '1INCH/USDT', 'BAT/USDT'
];

// Map trading pairs to CoinGecko coin IDs
const COINGECKO_IDS: Record<string, string> = {
  'BTC/USDT': 'bitcoin',
  'ETH/USDT': 'ethereum',
  'BNB/USDT': 'binancecoin',
  'XRP/USDT': 'ripple',
  'ADA/USDT': 'cardano',
  'DOGE/USDT': 'dogecoin',
  'SOL/USDT': 'solana',
  'DOT/USDT': 'polkadot',
  'MATIC/USDT': 'matic-network',
  'LTC/USDT': 'litecoin',
  'AVAX/USDT': 'avalanche-2',
  'LINK/USDT': 'chainlink',
  'UNI/USDT': 'uniswap',
  'ATOM/USDT': 'cosmos',
  'XLM/USDT': 'stellar',
  'ALGO/USDT': 'algorand',
  'VET/USDT': 'vechain',
  'FIL/USDT': 'filecoin',
  'TRX/USDT': 'tron',
  'ETC/USDT': 'ethereum-classic',
  'NEAR/USDT': 'near',
  'AAVE/USDT': 'aave',
  'SAND/USDT': 'the-sandbox',
  'MANA/USDT': 'decentraland',
  'AXS/USDT': 'axie-infinity',
  'FTM/USDT': 'fantom',
  'HBAR/USDT': 'hedera-hashgraph',
  'EGLD/USDT': 'elrond-erd-2',
  'XTZ/USDT': 'tezos',
  'THETA/USDT': 'theta-token',
  'ICP/USDT': 'internet-computer',
  'EOS/USDT': 'eos',
  'FLOW/USDT': 'flow',
  'APE/USDT': 'apecoin',
  'CHZ/USDT': 'chiliz',
  'CAKE/USDT': 'pancakeswap-token',
  'GRT/USDT': 'the-graph',
  'ENJ/USDT': 'enjincoin',
  'QNT/USDT': 'quant-network',
  'KSM/USDT': 'kusama',
  'ZEC/USDT': 'zcash',
  'RUNE/USDT': 'thorchain',
  'MKR/USDT': 'maker',
  'SNX/USDT': 'havven',
  'COMP/USDT': 'compound-governance-token',
  'CRV/USDT': 'curve-dao-token',
  'SUSHI/USDT': 'sushi',
  'YFI/USDT': 'yearn-finance',
  '1INCH/USDT': '1inch',
  'BAT/USDT': 'basic-attention-token'
};

const CONDITION_TYPES = [
  { type: 'EMA Crossover', message: 'EMA crossover detected' },
  { type: 'RSI Oversold', message: 'RSI < 30 — Oversold signal' },
  { type: 'RSI Overbought', message: 'RSI > 70 — Overbought signal' },
  { type: 'MACD Signal', message: 'MACD bullish crossover' },
  { type: 'Bollinger Bounce', message: 'Price hit lower Bollinger Band' },
  { type: 'Volume Spike', message: 'Unusual volume detected' },
  { type: 'Support Break', message: 'Key support level broken' },
  { type: 'Resistance Break', message: 'Key resistance level broken' }
];

export interface MarketData {
  coin: string;
  price: number;
  change24h: number;
  volume: number;
  lastUpdate: Date;
}

export interface AlertTrigger {
  coin_name: string;
  condition_type: string;
  condition_message: string;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  status?: string;
}

export class MarketSimulator {
  private marketData: Map<string, MarketData> = new Map();
  private isUpdating = false;

  constructor() {
    this.initializeMarketData();
  }

  private async initializeMarketData() {
    // Initialize with empty data first, then fetch real data
    CRYPTO_PAIRS.forEach(coin => {
      this.marketData.set(coin, {
        coin,
        price: 0,
        change24h: 0,
        volume: 0,
        lastUpdate: new Date()
      });
    });
    // Fetch real data immediately
    await this.fetchRealMarketData();
  }

  private async fetchRealMarketData() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      // Get all CoinGecko IDs
      const coinIds = CRYPTO_PAIRS.map(pair => COINGECKO_IDS[pair]).filter(Boolean);
      
      // Fetch data from CoinGecko API
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const data = response.data;

      // Update market data with real prices
      CRYPTO_PAIRS.forEach(pair => {
        const coinId = COINGECKO_IDS[pair];
        if (coinId && data[coinId]) {
          const coinData = data[coinId];
          this.marketData.set(pair, {
            coin: pair,
            price: coinData.usd || 0,
            change24h: coinData.usd_24h_change || 0,
            volume: coinData.usd_24h_vol || 0,
            lastUpdate: new Date()
          });
        }
      });
    } catch (error) {
      console.error('Error fetching market data from CoinGecko:', error);
      // If API fails, keep existing data or set defaults
    } finally {
      this.isUpdating = false;
    }
  }

  async updateMarketData() {
    await this.fetchRealMarketData();
  }

  getMarketData(coin: string): MarketData | undefined {
    return this.marketData.get(coin);
  }

  getAllMarketData(): MarketData[] {
    return Array.from(this.marketData.values());
  }

  generateRandomAlert(): AlertTrigger | null {
    if (Math.random() > 0.15) return null;

    const coin = CRYPTO_PAIRS[Math.floor(Math.random() * CRYPTO_PAIRS.length)];
    const condition = CONDITION_TYPES[Math.floor(Math.random() * CONDITION_TYPES.length)];
    const marketData = this.marketData.get(coin);

    if (!marketData || marketData.price === 0) return null;

    const entryPrice = marketData.price;
    const stopLossPercent = 0.02 + Math.random() * 0.03;
    const targetPercent = 0.03 + Math.random() * 0.07;

    return {
      coin_name: coin,
      condition_type: condition.type,
      condition_message: condition.message,
      entry_price: Number(entryPrice.toFixed(4)),
      stop_loss: Number((entryPrice * (1 - stopLossPercent)).toFixed(4)),
      target_price: Number((entryPrice * (1 + targetPercent)).toFixed(4))
    };
  }
}

export const marketSimulator = new MarketSimulator();
