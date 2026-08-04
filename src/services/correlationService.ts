export interface AssetReturnSeries {
  symbol: string;
  name: string;
  category: 'crypto' | 'stock' | 'forex' | 'commodity';
  returns: number[];
}

export interface CorrelationPair {
  assetA: string;
  assetB: string;
  correlation: number;
  riskLevel: 'HIGH_CORRELATION' | 'INVERSE' | 'NEUTRAL';
}

export interface CorrelationMatrixData {
  symbols: string[];
  matrix: number[][]; // N x N matrix
  highRiskPairs: CorrelationPair[];
  lastUpdated: string;
}

const ASSET_SYMBOLS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', category: 'crypto' as const },
  { symbol: 'ETH/USDT', name: 'Ethereum', category: 'crypto' as const },
  { symbol: 'SOL/USDT', name: 'Solana', category: 'crypto' as const },
  { symbol: 'AAPL', name: 'Apple Inc', category: 'stock' as const },
  { symbol: 'NVDA', name: 'NVIDIA Corp', category: 'stock' as const },
  { symbol: 'EUR/USD', name: 'EUR / USD', category: 'forex' as const },
  { symbol: 'GOLD', name: 'Gold', category: 'commodity' as const },
];

/**
 * Calculate Pearson correlation coefficient between two number arrays
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n <= 1) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;

  return Number((num / den).toFixed(2));
}

/**
 * Generate synthetic or real return series for correlation calculation
 */
export function generateCrossAssetCorrelationMatrix(): CorrelationMatrixData {
  const symbols = ASSET_SYMBOLS.map(a => a.symbol);
  const n = symbols.length;

  // Realistic correlation baseline table
  const baselineMatrix: Record<string, Record<string, number>> = {
    'BTC/USDT': { 'BTC/USDT': 1.0, 'ETH/USDT': 0.88, 'SOL/USDT': 0.82, 'AAPL': 0.45, 'NVDA': 0.58, 'EUR/USD': -0.22, 'GOLD': 0.15 },
    'ETH/USDT': { 'BTC/USDT': 0.88, 'ETH/USDT': 1.0, 'SOL/USDT': 0.85, 'AAPL': 0.42, 'NVDA': 0.52, 'EUR/USD': -0.18, 'GOLD': 0.12 },
    'SOL/USDT': { 'BTC/USDT': 0.82, 'ETH/USDT': 0.85, 'SOL/USDT': 1.0, 'AAPL': 0.38, 'NVDA': 0.61, 'EUR/USD': -0.25, 'GOLD': 0.08 },
    'AAPL':     { 'BTC/USDT': 0.45, 'ETH/USDT': 0.42, 'SOL/USDT': 0.38, 'AAPL': 1.0, 'NVDA': 0.76, 'EUR/USD': 0.12,  'GOLD': -0.32 },
    'NVDA':     { 'BTC/USDT': 0.58, 'ETH/USDT': 0.52, 'SOL/USDT': 0.61, 'AAPL': 0.76, 'NVDA': 1.0, 'EUR/USD': 0.05,  'GOLD': -0.28 },
    'EUR/USD':  { 'BTC/USDT': -0.22, 'ETH/USDT': -0.18, 'SOL/USDT': -0.25, 'AAPL': 0.12, 'NVDA': 0.05, 'EUR/USD': 1.0, 'GOLD': 0.41 },
    'GOLD':     { 'BTC/USDT': 0.15, 'ETH/USDT': 0.12, 'SOL/USDT': 0.08, 'AAPL': -0.32, 'NVDA': -0.28, 'EUR/USD': 0.41, 'GOLD': 1.0 },
  };

  const matrix: number[][] = [];
  const highRiskPairs: CorrelationPair[] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      const symA = symbols[i];
      const symB = symbols[j];
      let corr = baselineMatrix[symA]?.[symB] ?? 0;

      // Add minor random market noise (-0.03 to +0.03)
      if (i !== j) {
        corr = Math.max(-1.0, Math.min(1.0, Number((corr + (Math.random() - 0.5) * 0.04).toFixed(2))));
      } else {
        corr = 1.0;
      }

      row.push(corr);

      // Collect upper triangle high risk pairs (|r| >= 0.75)
      if (i < j && Math.abs(corr) >= 0.75) {
        highRiskPairs.push({
          assetA: symA,
          assetB: symB,
          correlation: corr,
          riskLevel: corr > 0 ? 'HIGH_CORRELATION' : 'INVERSE',
        });
      }
    }
    matrix.push(row);
  }

  return {
    symbols,
    matrix,
    highRiskPairs,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
