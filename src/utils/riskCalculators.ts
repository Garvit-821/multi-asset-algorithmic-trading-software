// Quantitative Finance Risk Calculators

/**
 * Calculates the standard deviation (volatility) of periodic returns.
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (returns.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates the Sharpe and Sortino ratios for a series of periodic returns.
 * Assumes a risk-free rate of 0 for simplicity or customizable.
 */
export function calculateSharpeSortino(
  returns: number[],
  riskFreeRatePeriod: number = 0.0001 // ~3% annualized expressed daily
): { sharpe: number; sortino: number } {
  if (returns.length < 2) return { sharpe: 0, sortino: 0 };

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const excessReturn = meanReturn - riskFreeRatePeriod;

  // Standard Deviation (for Sharpe)
  const stdDev = calculateVolatility(returns);

  // Downside Deviation (for Sortino - only penalize negative returns)
  const downsideReturns = returns.map(r => Math.min(0, r - riskFreeRatePeriod));
  const downsideSumSquares = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0);
  const downsideDev = Math.sqrt(downsideSumSquares / Math.max(1, returns.length));

  const sharpe = stdDev > 0 ? excessReturn / stdDev : 0;
  const sortino = downsideDev > 0 ? excessReturn / downsideDev : 0;

  // Annualize ratios (assuming daily returns, ~252 trading days)
  const annualizationFactor = Math.sqrt(252);
  return {
    sharpe: Number((sharpe * annualizationFactor).toFixed(2)),
    sortino: Number((sortino * annualizationFactor).toFixed(2))
  };
}

/**
 * Calculates the Value at Risk (VaR) using the parametric (Variance-Covariance) method.
 * Returns the maximum expected loss in absolute dollar terms.
 */
export function calculateVaR(
  portfolioValue: number,
  volatility: number,
  confidence: 0.95 | 0.99 = 0.95,
  days: number = 1
): number {
  // Z-scores for standard normal distribution
  const zScore = confidence === 0.95 ? 1.645 : 2.326;
  const timeAdjustedVol = volatility * Math.sqrt(days);
  const varPct = zScore * timeAdjustedVol;
  return Number((portfolioValue * varPct).toFixed(2));
}

/**
 * Calculates the Pearson correlation coefficient between two variables.
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  if (denX === 0 || denY === 0) return 0;
  return Number((num / Math.sqrt(denX * denY)).toFixed(4));
}

/**
 * Runs a Monte Carlo simulation using Geometric Brownian Motion (GBM).
 * Runs 1000+ simulated paths to predict portfolio outcomes.
 */
export interface MonteCarloResult {
  paths: number[][]; // Array of simulated paths (for graphing, e.g., first 10 paths)
  percentiles: {
    p5: number[];
    p50: number[]; // Median path
    p95: number[];
  };
  riskOfRuin: number; // Probability of portfolio dropping below threshold
  medianEndingValue: number;
}

export function runMonteCarloSimulation(
  startValue: number,
  volatility: number, // Daily volatility
  drift: number,      // Expected daily return (drift)
  horizonDays: number = 30,
  numberOfPaths: number = 1000,
  ruinThreshold: number = 50000 // default $50,000 (50% drawdown from $100k)
): MonteCarloResult {
  const paths: number[][] = [];
  const allEndings: number[] = [];
  
  // Standard Normal Generator (Box-Muller transform)
  const randomNormal = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  let ruinCount = 0;
  const pathValuesByDay: number[][] = Array.from({ length: horizonDays + 1 }, () => []);

  for (let p = 0; p < numberOfPaths; p++) {
    const currentPath: number[] = [startValue];
    pathValuesByDay[0].push(startValue);
    
    let isRuined = false;
    let currentValue = startValue;

    for (let d = 1; d <= horizonDays; d++) {
      const epsilon = randomNormal();
      // GBM formula: S_t = S_{t-1} * exp((drift - 0.5 * vol^2) + vol * epsilon)
      const exponent = (drift - 0.5 * Math.pow(volatility, 2)) + volatility * epsilon;
      currentValue = currentValue * Math.exp(exponent);
      
      if (currentValue < ruinThreshold) {
        isRuined = true;
      }
      
      currentPath.push(currentValue);
      pathValuesByDay[d].push(currentValue);
    }

    if (isRuined) {
      ruinCount++;
    }

    allEndings.push(currentValue);
    
    // Save the first 10 paths for visualization
    if (p < 10) {
      paths.push(currentPath);
    }
  }

  // Calculate percentiles day-by-day
  const p5: number[] = [];
  const p50: number[] = [];
  const p95: number[] = [];

  for (let d = 0; d <= horizonDays; d++) {
    const sorted = [...pathValuesByDay[d]].sort((a, b) => a - b);
    p5.push(sorted[Math.floor(sorted.length * 0.05)]);
    p50.push(sorted[Math.floor(sorted.length * 0.50)]);
    p95.push(sorted[Math.floor(sorted.length * 0.95)]);
  }

  allEndings.sort((a, b) => a - b);
  const medianEndingValue = allEndings[Math.floor(allEndings.length * 0.5)];
  const riskOfRuin = (ruinCount / numberOfPaths) * 100;

  return {
    paths,
    percentiles: { p5, p50, p95 },
    riskOfRuin: Number(riskOfRuin.toFixed(1)),
    medianEndingValue: Math.round(medianEndingValue)
  };
}
