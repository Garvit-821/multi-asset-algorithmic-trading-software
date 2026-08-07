/**
 * Black-Scholes Options Pricing & Greeks Engine
 */

export interface BlackScholesInput {
  spotPrice: number;       // Current price of underlying asset (S)
  strikePrice: number;     // Option strike price (K)
  timeToMaturityYears: number; // Time to expiration in years (tau = DTE / 365)
  volatilityPct: number;   // Implied volatility in percent (e.g. 45 for 45%)
  riskFreeRatePct: number; // Risk-free interest rate in percent (e.g. 4 for 4%)
}

export interface OptionsGreeks {
  delta: number; // Rate of change of option price w.r.t underlying price
  gamma: number; // Rate of change of Delta w.r.t underlying price
  theta: number; // Rate of change of option price w.r.t time decay (per day)
  vega: number;  // Rate of change of option price w.r.t 1% volatility change
  rho: number;   // Rate of change of option price w.r.t 1% interest rate change
}

export interface OptionPriceResult {
  callPrice: number;
  putPrice: number;
  callGreeks: OptionsGreeks;
  putGreeks: OptionsGreeks;
  d1: number;
  d2: number;
  intrinsicValueCall: number;
  timeValueCall: number;
  intrinsicValuePut: number;
  timeValuePut: number;
}

export interface OptionChainItem {
  strike: number;
  callBid: number;
  callAsk: number;
  callPrice: number;
  callIvPct: number;
  callGreeks: OptionsGreeks;
  putBid: number;
  putAsk: number;
  putPrice: number;
  putIvPct: number;
  putGreeks: OptionsGreeks;
  inTheMoneyCall: boolean;
  inTheMoneyPut: boolean;
}

export interface OptionPayoffPoint {
  underlyingPrice: number;
  payoffNet: number;
  payoffCallOnly?: number;
  payoffPutOnly?: number;
}

export interface VolatilitySurfacePoint {
  strike: number;
  dte: number;
  ivPct: number;
}

export type OptionStrategy = 'long_call' | 'long_put' | 'bull_call_spread' | 'bear_put_spread' | 'straddle' | 'iron_condor';

/**
 * Standard Normal Probability Density Function phi(x)
 */
export function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Cumulative Standard Normal Distribution Function Phi(x)
 * Polynomial approximation with max error < 7.5e-8 (Abramowitz & Stegun formula 26.2.17)
 */
export function normalCdf(x: number): number {
  if (x < -6.0) return 0.0;
  if (x > 6.0) return 1.0;

  const a1 = 0.319381530;
  const a2 = -0.356563782;
  const a3 = 1.781477937;
  const a4 = -1.821255978;
  const a5 = 1.330274429;
  const p = 0.2316419;

  const k = 1.0 / (1.0 + p * Math.abs(x));
  const poly = k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5))));
  const cdf = 1.0 - normalPdf(x) * poly;

  return x >= 0 ? cdf : 1.0 - cdf;
}

/**
 * Calculate Black-Scholes Call and Put Prices and Greeks
 */
export function calculateBlackScholes(input: BlackScholesInput): OptionPriceResult {
  const S = Math.max(0.0001, input.spotPrice);
  const K = Math.max(0.0001, input.strikePrice);
  const T = Math.max(0.0001, input.timeToMaturityYears);
  const sigma = Math.max(0.0001, input.volatilityPct / 100);
  const r = input.riskFreeRatePct / 100;

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const nD1 = normalCdf(d1);
  const nD2 = normalCdf(d2);
  const nNegD1 = normalCdf(-d1);
  const nNegD2 = normalCdf(-d2);
  const pdfD1 = normalPdf(d1);

  const expNegRT = Math.exp(-r * T);

  // Prices
  const callPrice = Math.max(0, S * nD1 - K * expNegRT * nD2);
  const putPrice = Math.max(0, K * expNegRT * nNegD2 - S * nNegD1);

  // Shared Greeks
  const gamma = pdfD1 / (S * sigma * sqrtT);
  const vega = (S * pdfD1 * sqrtT) / 100; // Per 1% change in volatility

  // Call Specific Greeks
  const callDelta = nD1;
  const callTheta = (- (S * pdfD1 * sigma) / (2 * sqrtT) - r * K * expNegRT * nD2) / 365;
  const callRho = (K * T * expNegRT * nD2) / 100; // Per 1% change in rate

  // Put Specific Greeks
  const putDelta = nD1 - 1;
  const putTheta = (- (S * pdfD1 * sigma) / (2 * sqrtT) + r * K * expNegRT * nNegD2) / 365;
  const putRho = (- K * T * expNegRT * nNegD2) / 100;

  // Intrinsic and Time Values
  const intrinsicValueCall = Math.max(0, S - K);
  const timeValueCall = Math.max(0, callPrice - intrinsicValueCall);
  const intrinsicValuePut = Math.max(0, K - S);
  const timeValuePut = Math.max(0, putPrice - intrinsicValuePut);

  return {
    callPrice: Number(callPrice.toFixed(4)),
    putPrice: Number(putPrice.toFixed(4)),
    callGreeks: {
      delta: Number(callDelta.toFixed(4)),
      gamma: Number(gamma.toFixed(6)),
      theta: Number(callTheta.toFixed(4)),
      vega: Number(vega.toFixed(4)),
      rho: Number(callRho.toFixed(4)),
    },
    putGreeks: {
      delta: Number(putDelta.toFixed(4)),
      gamma: Number(gamma.toFixed(6)),
      theta: Number(putTheta.toFixed(4)),
      vega: Number(vega.toFixed(4)),
      rho: Number(putRho.toFixed(4)),
    },
    d1: Number(d1.toFixed(4)),
    d2: Number(d2.toFixed(4)),
    intrinsicValueCall: Number(intrinsicValueCall.toFixed(4)),
    timeValueCall: Number(timeValueCall.toFixed(4)),
    intrinsicValuePut: Number(intrinsicValuePut.toFixed(4)),
    timeValuePut: Number(timeValuePut.toFixed(4)),
  };
}

/**
 * Newton-Raphson Numerical Implied Volatility (IV) Solver
 */
export function calculateImpliedVolatility(
  targetPrice: number,
  isCall: boolean,
  spotPrice: number,
  strikePrice: number,
  timeToMaturityYears: number,
  riskFreeRatePct = 4
): number {
  let sigma = 0.30; // Initial guess 30%
  const maxIterations = 100;
  const precision = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    const res = calculateBlackScholes({
      spotPrice,
      strikePrice,
      timeToMaturityYears,
      volatilityPct: sigma * 100,
      riskFreeRatePct,
    });

    const price = isCall ? res.callPrice : res.putPrice;
    const vega = (isCall ? res.callGreeks.vega : res.putGreeks.vega) * 100; // Unscaled Vega

    const diff = price - targetPrice;
    if (Math.abs(diff) < precision) {
      return Number((sigma * 100).toFixed(2));
    }

    if (Math.abs(vega) < 1e-6) break;
    sigma = sigma - diff / vega;

    if (sigma <= 0.001) sigma = 0.001;
    if (sigma > 5.0) sigma = 5.0;
  }

  return Number((sigma * 100).toFixed(2));
}

/**
 * Generate Complete Option Chain Matrix
 */
export function generateOptionChain(
  spotPrice: number,
  dte = 30,
  baseIvPct = 45,
  riskFreeRatePct = 4,
  strikeCount = 11
): OptionChainItem[] {
  const chain: OptionChainItem[] = [];
  const tYears = Math.max(1, dte) / 365;

  // Determine realistic strike step size
  let step = 10;
  if (spotPrice > 10000) step = 1000;
  else if (spotPrice > 1000) step = 100;
  else if (spotPrice > 100) step = 5;
  else step = 1;

  const atmStrike = Math.round(spotPrice / step) * step;
  const half = Math.floor(strikeCount / 2);
  const minStrike = Math.max(step, atmStrike - half * step);

  for (let i = 0; i < strikeCount; i++) {
    const strike = minStrike + i * step;

    // Simulate volatility skew (Smile curve)
    const moneyness = Math.log(strike / spotPrice);
    const skewFactor = 0.25 * Math.pow(moneyness, 2) - 0.1 * moneyness;
    const strikeIv = Math.max(10, baseIvPct * (1 + skewFactor));

    const bs = calculateBlackScholes({
      spotPrice,
      strikePrice: strike,
      timeToMaturityYears: tYears,
      volatilityPct: strikeIv,
      riskFreeRatePct,
    });

    const spread = Math.max(0.1, bs.callPrice * 0.015);
    const callBid = Math.max(0.01, bs.callPrice - spread);
    const callAsk = bs.callPrice + spread;

    const putSpread = Math.max(0.1, bs.putPrice * 0.015);
    const putBid = Math.max(0.01, bs.putPrice - putSpread);
    const putAsk = bs.putPrice + putSpread;

    chain.push({
      strike,
      callBid: Number(callBid.toFixed(2)),
      callAsk: Number(callAsk.toFixed(2)),
      callPrice: bs.callPrice,
      callIvPct: Number(strikeIv.toFixed(1)),
      callGreeks: bs.callGreeks,
      putBid: Number(putBid.toFixed(2)),
      putAsk: Number(putAsk.toFixed(2)),
      putPrice: bs.putPrice,
      putIvPct: Number(strikeIv.toFixed(1)),
      putGreeks: bs.putGreeks,
      inTheMoneyCall: spotPrice > strike,
      inTheMoneyPut: spotPrice < strike,
    });
  }

  return chain;
}

/**
 * Generate Multi-Leg Option Strategy Payoff Points
 */
export function generateStrategyPayoff(
  strategyType: OptionStrategy,
  spotPrice: number,
  baseIvPct = 45,
  dte = 30
): { points: OptionPayoffPoint[]; maxProfit: string; maxLoss: string; breakEven: string } {
  const points: OptionPayoffPoint[] = [];
  const tYears = Math.max(1, dte) / 365;

  let step = 10;
  if (spotPrice > 10000) step = 1000;
  else if (spotPrice > 100) step = 10;
  else step = 1;

  const atmStrike = Math.round(spotPrice / step) * step;

  const kLower = Math.max(step, atmStrike - 2 * step);
  const kUpper = atmStrike + 2 * step;

  // Compute option premiums for components
  const bsAtm = calculateBlackScholes({ spotPrice, strikePrice: atmStrike, timeToMaturityYears: tYears, volatilityPct: baseIvPct, riskFreeRatePct: 4 });
  const bsLower = calculateBlackScholes({ spotPrice, strikePrice: kLower, timeToMaturityYears: tYears, volatilityPct: baseIvPct, riskFreeRatePct: 4 });
  const bsUpper = calculateBlackScholes({ spotPrice, strikePrice: kUpper, timeToMaturityYears: tYears, volatilityPct: baseIvPct, riskFreeRatePct: 4 });

  const rangeMin = Math.max(1, Math.round(spotPrice * 0.7));
  const rangeMax = Math.round(spotPrice * 1.3);
  const priceStep = (rangeMax - rangeMin) / 50;

  let maxProfit = '';
  let maxLoss = '';
  let breakEven = '';

  switch (strategyType) {
    case 'long_call': {
      const premium = bsAtm.callPrice;
      maxProfit = 'Unlimited';
      maxLoss = `-$${premium.toFixed(2)}`;
      breakEven = `$${(atmStrike + premium).toFixed(2)}`;

      for (let s = rangeMin; s <= rangeMax; s += priceStep) {
        const payoff = Math.max(0, s - atmStrike) - premium;
        points.push({ underlyingPrice: Number(s.toFixed(2)), payoffNet: Number(payoff.toFixed(2)) });
      }
      break;
    }
    case 'long_put': {
      const premium = bsAtm.putPrice;
      maxProfit = `$${(atmStrike - premium).toFixed(2)}`;
      maxLoss = `-$${premium.toFixed(2)}`;
      breakEven = `$${(atmStrike - premium).toFixed(2)}`;

      for (let s = rangeMin; s <= rangeMax; s += priceStep) {
        const payoff = Math.max(0, atmStrike - s) - premium;
        points.push({ underlyingPrice: Number(s.toFixed(2)), payoffNet: Number(payoff.toFixed(2)) });
      }
      break;
    }
    case 'bull_call_spread': {
      const netDebit = bsLower.callPrice - bsUpper.callPrice;
      const maxGain = (kUpper - kLower) - netDebit;
      maxProfit = `+$${maxGain.toFixed(2)}`;
      maxLoss = `-$${netDebit.toFixed(2)}`;
      breakEven = `$${(kLower + netDebit).toFixed(2)}`;

      for (let s = rangeMin; s <= rangeMax; s += priceStep) {
        const longPayoff = Math.max(0, s - kLower);
        const shortPayoff = Math.max(0, s - kUpper);
        const payoff = (longPayoff - shortPayoff) - netDebit;
        points.push({ underlyingPrice: Number(s.toFixed(2)), payoffNet: Number(payoff.toFixed(2)) });
      }
      break;
    }
    case 'bear_put_spread': {
      const netDebit = bsUpper.putPrice - bsLower.putPrice;
      const maxGain = (kUpper - kLower) - netDebit;
      maxProfit = `+$${maxGain.toFixed(2)}`;
      maxLoss = `-$${netDebit.toFixed(2)}`;
      breakEven = `$${(kUpper - netDebit).toFixed(2)}`;

      for (let s = rangeMin; s <= rangeMax; s += priceStep) {
        const longPayoff = Math.max(0, kUpper - s);
        const shortPayoff = Math.max(0, kLower - s);
        const payoff = (longPayoff - shortPayoff) - netDebit;
        points.push({ underlyingPrice: Number(s.toFixed(2)), payoffNet: Number(payoff.toFixed(2)) });
      }
      break;
    }
    case 'straddle': {
      const totalDebit = bsAtm.callPrice + bsAtm.putPrice;
      maxProfit = 'Unlimited';
      maxLoss = `-$${totalDebit.toFixed(2)}`;
      breakEven = `$${(atmStrike - totalDebit).toFixed(2)} & $${(atmStrike + totalDebit).toFixed(2)}`;

      for (let s = rangeMin; s <= rangeMax; s += priceStep) {
        const callPayoff = Math.max(0, s - atmStrike);
        const putPayoff = Math.max(0, atmStrike - s);
        const payoff = (callPayoff + putPayoff) - totalDebit;
        points.push({ underlyingPrice: Number(s.toFixed(2)), payoffNet: Number(payoff.toFixed(2)) });
      }
      break;
    }
    case 'iron_condor': {
      const k0 = Math.max(step, atmStrike - 3 * step); // Long Put
      const k1 = Math.max(step, atmStrike - 1 * step); // Short Put
      const k2 = atmStrike + 1 * step;                 // Short Call
      const k3 = atmStrike + 3 * step;                 // Long Call

      const bsK0 = calculateBlackScholes({ spotPrice, strikePrice: k0, timeToMaturityYears: tYears, volatilityPct: baseIvPct, riskFreeRatePct: 4 });
      const bsK1 = calculateBlackScholes({ spotPrice, strikePrice: k1, timeToMaturityYears: tYears, volatilityPct: baseIvPct, riskFreeRatePct: 4 });
      const bsK2 = calculateBlackScholes({ spotPrice, strikePrice: k2, timeToMaturityYears: tYears, volatilityPct: baseIvPct, riskFreeRatePct: 4 });
      const bsK3 = calculateBlackScholes({ spotPrice, strikePrice: k3, timeToMaturityYears: tYears, volatilityPct: baseIvPct, riskFreeRatePct: 4 });

      const netCredit = (bsK1.putPrice + bsK2.callPrice) - (bsK0.putPrice + bsK3.callPrice);
      const width = k1 - k0;
      const maxRisk = width - netCredit;

      maxProfit = `+$${netCredit.toFixed(2)}`;
      maxLoss = `-$${maxRisk.toFixed(2)}`;
      breakEven = `$${(k1 - netCredit).toFixed(2)} & $${(k2 + netCredit).toFixed(2)}`;

      for (let s = rangeMin; s <= rangeMax; s += priceStep) {
        const p0 = Math.max(0, k0 - s);
        const p1 = Math.max(0, k1 - s);
        const c2 = Math.max(0, s - k2);
        const c3 = Math.max(0, s - k3);
        const payoff = netCredit + p0 - p1 - c2 + c3;
        points.push({ underlyingPrice: Number(s.toFixed(2)), payoffNet: Number(payoff.toFixed(2)) });
      }
      break;
    }
  }

  return { points, maxProfit, maxLoss, breakEven };
}

/**
 * Generate 2D Implied Volatility Surface Data Grid (Strikes vs DTE)
 */
export function generateVolatilitySurface(spotPrice: number, baseIvPct = 45): VolatilitySurfacePoint[] {
  const surface: VolatilitySurfacePoint[] = [];
  const dteList = [7, 14, 30, 60, 90, 180, 365];
  const strikeRatios = [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2];

  dteList.forEach(dte => {
    strikeRatios.forEach(ratio => {
      const strike = Math.round(spotPrice * ratio);
      const moneyness = Math.log(ratio);

      // Volatility Skew & Term Structure formulation
      const skew = 0.3 * Math.pow(moneyness, 2) - 0.12 * moneyness;
      const termStructure = 0.05 * Math.log(dte / 30);
      const iv = Math.max(10, baseIvPct * (1 + skew + termStructure));

      surface.push({
        strike,
        dte,
        ivPct: Number(iv.toFixed(1)),
      });
    });
  });

  return surface;
}
