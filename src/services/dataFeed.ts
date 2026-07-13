import { Time } from 'lightweight-charts';
import { supabase } from '../lib/supabase';
import type { AssetType } from '../components/TradingViewChart';
import axios from 'axios';

export interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const CACHE_DURATION = 60; // seconds
const cache = new Map<string, { data: CandleData[]; timestamp: number }>();

// TradingView symbol format helpers
export function formatSymbol(symbol: string, assetType: AssetType, exchange?: string): string {
  if (assetType === 'crypto') {
    return symbol.replace('/', ''); // BTC/USDT -> BTCUSDT
  } else if (assetType === 'stock' || assetType === 'commodity') {
    if (exchange) {
      return `${symbol}.${exchange}`; // RELIANCE.NSE, GOLD.MCX
    }
    return symbol;
  } else if (assetType === 'forex') {
    return symbol.replace('/', ''); // EUR/USD -> EURUSD
  }
  return symbol;
}

// Normalize symbol for cache key
function getCacheKey(symbol: string, assetType: AssetType, exchange?: string): string {
  return `${assetType}:${exchange || 'default'}:${symbol}`;
}

// Fetch real candlestick data from Binance API
async function fetchBinanceCandles(
  symbol: string,
  interval: string = '1m',
  limit: number = 200
): Promise<CandleData[]> {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: symbol,
        interval: interval,
        limit: limit,
      },
      timeout: 10000,
    });

    const candles: CandleData[] = (response.data as (string | number)[][]).map((kline) => ({
      time: Math.floor(Number(kline[0]) / 1000) as Time,
      open: Number(kline[1]),
      high: Number(kline[2]),
      low: Number(kline[3]),
      close: Number(kline[4]),
      volume: Number(kline[5]),
    }));

    return candles;
  } catch (error) {
    console.error(`Error fetching Binance data for ${symbol}:`, error);
    throw error;
  }
}

// Fetch real candlestick data from alternative sources for non-crypto assets
async function fetchAlternativeCandles(
  _symbol: string,
  _assetType: AssetType,
  _count: number
): Promise<CandleData[]> {
  // For now, return empty array for non-crypto
  // These would require specific APIs (e.g., forex.com for forex, etc.)
  return [];
}

// Convert symbol format for Binance API (e.g., "BTC/USDT" -> "BTCUSDT")
function convertToBinanceSymbol(symbol: string): string | null {
  if (symbol.includes('/')) {
    return symbol.replace('/', '');
  }
  return symbol;
}

// Fetch real-time price from Binance
export async function fetchRealtimePrice(
  symbol: string,
  assetType: AssetType
): Promise<number | null> {
  if (assetType !== 'crypto') {
    return null;
  }

  try {
    const binanceSymbol = convertToBinanceSymbol(symbol);
    if (!binanceSymbol) {
      return null;
    }

    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: {
        symbol: binanceSymbol,
      },
      timeout: 5000,
    });

    return Number(response.data.price);
  } catch (error) {
    console.error('Error fetching real-time price:', error);
    return null;
  }
}

// Check cache first, then fetch
export async function fetchChartData(
  symbol: string,
  assetType: AssetType,
  exchange?: string
): Promise<CandleData[]> {
  const cacheKey = getCacheKey(symbol, assetType, exchange);
  const cached = cache.get(cacheKey);

  // Check in-memory cache
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 1000) {
    return cached.data;
  }

  // Check Supabase cache
  const { data: dbCache } = await supabase
    .from('market_data_cache')
    .select('data, expires_at')
    .eq('symbol', symbol)
    .eq('asset_type', assetType)
    .eq('exchange', exchange || 'default')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (dbCache?.data) {
    const candles = dbCache.data as CandleData[];
    cache.set(cacheKey, { data: candles, timestamp: Date.now() });
    return candles;
  }

  // Fetch fresh data from real APIs
  let candles: CandleData[] = [];

  try {
    if (assetType === 'crypto') {
      // Use Binance API for crypto
      const binanceSymbol = convertToBinanceSymbol(symbol);
      if (binanceSymbol) {
        candles = await fetchBinanceCandles(binanceSymbol, '1m', 200);
      } else {
        throw new Error(`Invalid crypto symbol: ${symbol}`);
      }
    } else {
      // For non-crypto assets, use alternative APIs (implement as needed)
      candles = await fetchAlternativeCandles(symbol, assetType, 200);
      // If no alternative API available, generate minimal mock data as fallback
      if (candles.length === 0) {
        console.warn(`No API available for ${assetType}, using fallback`);
        // Generate basic mock data for non-crypto assets
        const now = Math.floor(Date.now() / 1000);
        const basePrice = assetType === 'forex' ? 1.0 : 100;
        for (let i = 200; i > 0; i--) {
          const time = (now - i * 60) as Time;
          const change = (Math.random() - 0.5) * 0.01;
          const open = basePrice * (1 + change);
          const high = open * 1.005;
          const low = open * 0.995;
          const close = open * (1 + change * 0.5);
          candles.push({
            time,
            open: Number(open.toFixed(4)),
            high: Number(high.toFixed(4)),
            low: Number(low.toFixed(4)),
            close: Number(close.toFixed(4)),
            volume: Number((Math.random() * 1000000).toFixed(2)),
          });
        }
      }
    }

    if (candles.length > 0) {
      // Store in Supabase cache
      await supabase.from('market_data_cache').upsert({
        symbol,
        asset_type: assetType,
        exchange: exchange || 'default',
        data: candles,
        expires_at: new Date(Date.now() + CACHE_DURATION * 1000).toISOString(),
      });

      // Store in memory cache
      cache.set(cacheKey, { data: candles, timestamp: Date.now() });
    }
  } catch (error) {
    console.error('Error fetching fresh chart data:', error);
    // Return cached data if available, or empty array
    return cached?.data || [];
  }

  return candles;
}

// Fetch latest candle for real-time updates
export async function fetchLatestCandle(
  symbol: string,
  assetType: AssetType,
  _exchange?: string
): Promise<CandleData | null> {
  try {
    if (assetType === 'crypto') {
      // Fetch the latest candle from Binance
      const binanceSymbol = convertToBinanceSymbol(symbol);
      if (binanceSymbol) {
        const candles = await fetchBinanceCandles(binanceSymbol, '1m', 1);
        if (candles.length > 0) {
          return candles[candles.length - 1];
        }
      }
    }
    
    // Fallback: return null if unable to fetch
    return null;
  } catch (error) {
    console.error('Error fetching latest candle:', error);
    return null;
  }
}

// Search symbols with TradingView-compatible format
export async function searchSymbols(
  query: string,
  assetType: AssetType
): Promise<Array<{ symbol: string; name: string; exchange?: string }>> {
  // Mock symbol search (replace with TradingView Symbol Search API or broker API)
  const symbols: Record<AssetType, Array<{ symbol: string; name: string; exchange?: string }>> = {
    crypto: [
      { symbol: 'BTC/USDT', name: 'Bitcoin' },
      { symbol: 'ETH/USDT', name: 'Ethereum' },
      { symbol: 'BNB/USDT', name: 'Binance Coin' },
      { symbol: 'SOL/USDT', name: 'Solana' },
      { symbol: 'XRP/USDT', name: 'Ripple' },
      { symbol: 'ADA/USDT', name: 'Cardano' },
      { symbol: 'DOGE/USDT', name: 'Dogecoin' },
    ],
    forex: [
      { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
      { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
      { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
      { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee' },
      { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
      { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
    ],
    stock: [
      { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE' },
      { symbol: 'INFY', name: 'Infosys', exchange: 'NSE' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE' },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE' },
      { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
    ],
    commodity: [
      { symbol: 'GOLD', name: 'Gold', exchange: 'MCX' },
      { symbol: 'SILVER', name: 'Silver', exchange: 'MCX' },
      { symbol: 'CRUDE', name: 'Crude Oil', exchange: 'MCX' },
      { symbol: 'NATURALGAS', name: 'Natural Gas', exchange: 'MCX' },
      { symbol: 'COPPER', name: 'Copper', exchange: 'MCX' },
    ],
  };

  const assetSymbols = symbols[assetType] || [];
  const queryLower = query.toLowerCase();

  return assetSymbols.filter(
    (s) =>
      s.symbol.toLowerCase().includes(queryLower) ||
      s.name.toLowerCase().includes(queryLower)
  );
}

