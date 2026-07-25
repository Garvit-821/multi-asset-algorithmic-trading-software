import { useState, useEffect } from 'react';
import { Layers, TrendingUp, TrendingDown, AlertOctagon } from 'lucide-react';
import type { AssetType } from './TradingViewChart';

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  depthPct: number; // 0 - 100%
  isWall?: boolean;
}

interface OrderBookDOMProps {
  symbol: string;
  assetType: AssetType;
  currentPrice: number | null;
  onSelectPrice?: (price: number) => void;
}

export function OrderBookDOM({ symbol, assetType, currentPrice, onSelectPrice }: OrderBookDOMProps) {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [spread, setSpread] = useState<{ amount: number; percentage: number }>({ amount: 0, percentage: 0 });
  const [imbalancePct, setImbalancePct] = useState<number>(50); // 0 = 100% Sell, 100 = 100% Buy
  const [sellWall, setSellWall] = useState<OrderBookLevel | null>(null);
  const [buyWall, setBuyWall] = useState<OrderBookLevel | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    if (assetType === 'crypto') {
      const cleanSymbol = symbol.replace('/', '').toLowerCase();
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${cleanSymbol}@depth10@100ms`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.bids && data.asks) {
            processBinanceDepth(data.bids, data.asks);
          }
        } catch (err) {
          console.error('Error parsing Binance L2 depth frame:', err);
        }
      };

      ws.onerror = () => {
        setupSimulationFallback();
      };
    } else {
      setupSimulationFallback();
    }

    function setupSimulationFallback() {
      if (fallbackInterval) clearInterval(fallbackInterval);
      fallbackInterval = setInterval(() => {
        generateSimulatedDOM();
      }, 800);
      generateSimulatedDOM();
    }

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [symbol, assetType, currentPrice]);

  // Process Binance Depth Stream
  const processBinanceDepth = (rawBids: string[][], rawAsks: string[][]) => {
    const parsedBids = rawBids.slice(0, 10).map(([p, s]) => ({ price: parseFloat(p), size: parseFloat(s) }));
    const parsedAsks = rawAsks.slice(0, 10).map(([p, s]) => ({ price: parseFloat(p), size: parseFloat(s) }));

    computeOrderBookLevels(parsedBids, parsedAsks);
  };

  // Generate simulated DOM for non-crypto or fallback assets
  const generateSimulatedDOM = () => {
    const basePrice = currentPrice || 50000;
    const tick = basePrice * 0.0005;

    const parsedBids: { price: number; size: number }[] = [];
    const parsedAsks: { price: number; size: number }[] = [];

    for (let i = 1; i <= 10; i++) {
      const bidPrice = Number((basePrice - i * tick).toFixed(2));
      const askPrice = Number((basePrice + i * tick).toFixed(2));

      // Random sizes with occasional wall spikes
      const isBidSpike = i === 4;
      const isAskSpike = i === 6;

      const bidSize = isBidSpike ? Number((Math.random() * 8 + 15).toFixed(3)) : Number((Math.random() * 2 + 0.1).toFixed(3));
      const askSize = isAskSpike ? Number((Math.random() * 8 + 15).toFixed(3)) : Number((Math.random() * 2 + 0.1).toFixed(3));

      parsedBids.push({ price: bidPrice, size: bidSize });
      parsedAsks.push({ price: askPrice, size: askSize });
    }

    computeOrderBookLevels(parsedBids, parsedAsks);
  };

  // Compute cumulative depth, wall density, and liquidity imbalance
  const computeOrderBookLevels = (
    parsedBids: { price: number; size: number }[],
    parsedAsks: { price: number; size: number }[]
  ) => {
    let cumulativeBidTotal = 0;
    let maxBidSize = 0;
    let detectedBuyWall: OrderBookLevel | null = null;

    const calculatedBids: OrderBookLevel[] = parsedBids.map((b) => {
      cumulativeBidTotal += b.size;
      if (b.size > maxBidSize) maxBidSize = b.size;
      return {
        price: b.price,
        size: b.size,
        total: Number(cumulativeBidTotal.toFixed(4)),
        depthPct: 0,
      };
    });

    let cumulativeAskTotal = 0;
    let maxAskSize = 0;
    let detectedSellWall: OrderBookLevel | null = null;

    const calculatedAsks: OrderBookLevel[] = parsedAsks.map((a) => {
      cumulativeAskTotal += a.size;
      if (a.size > maxAskSize) maxAskSize = a.size;
      return {
        price: a.price,
        size: a.size,
        total: Number(cumulativeAskTotal.toFixed(4)),
        depthPct: 0,
      };
    });

    // Determine max cumulative for depth bars
    const maxTotal = Math.max(cumulativeBidTotal, cumulativeAskTotal) || 1;

    calculatedBids.forEach((b) => {
      b.depthPct = Math.min(100, Math.round((b.total / maxTotal) * 100));
      if (b.size >= maxBidSize * 0.8 && b.size > 2) {
        b.isWall = true;
        if (!detectedBuyWall || b.size > detectedBuyWall.size) detectedBuyWall = b;
      }
    });

    calculatedAsks.forEach((a) => {
      a.depthPct = Math.min(100, Math.round((a.total / maxTotal) * 100));
      if (a.size >= maxAskSize * 0.8 && a.size > 2) {
        a.isWall = true;
        if (!detectedSellWall || a.size > detectedSellWall.size) detectedSellWall = a;
      }
    });

    setBids(calculatedBids);
    setAsks(calculatedAsks);
    setBuyWall(detectedBuyWall);
    setSellWall(detectedSellWall);

    // Calculate spread
    if (calculatedAsks.length > 0 && calculatedBids.length > 0) {
      const bestAsk = calculatedAsks[0].price;
      const bestBid = calculatedBids[0].price;
      const spreadAmt = Math.max(0, bestAsk - bestBid);
      const spreadPct = (spreadAmt / bestAsk) * 100;
      setSpread({ amount: Number(spreadAmt.toFixed(4)), percentage: Number(spreadPct.toFixed(3)) });
    }

    // Order Imbalance calculation (% Bids vs Asks)
    const grandTotal = cumulativeBidTotal + cumulativeAskTotal;
    if (grandTotal > 0) {
      setImbalancePct(Math.round((cumulativeBidTotal / grandTotal) * 100));
    }
  };

  return (
    <div className="flex flex-col h-[480px] sm:h-[550px] lg:h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-lg font-mono text-[11px] sm:text-xs select-none">
      {/* Header */}
      <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-xs sm:text-sm text-slate-200">Depth of Market (DOM L2)</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px]">
          <span className="text-slate-400">Spread:</span>
          <span className="font-bold text-amber-400">${spread.amount} ({spread.percentage}%)</span>
        </div>
      </div>

      {/* Liquidity Imbalance Ratio Bar */}
      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 space-y-1">
        <div className="flex justify-between text-[10px] font-sans font-semibold">
          <span className="text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Bids {imbalancePct}%</span>
          </span>
          <span className="text-slate-400">Order Depth Imbalance</span>
          <span className="text-rose-400 flex items-center space-x-1">
            <span>Asks {100 - imbalancePct}%</span>
            <TrendingDown className="w-3 h-3" />
          </span>
        </div>

        <div className="w-full bg-rose-950/80 h-1.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${imbalancePct}%` }}
          />
        </div>
      </div>

      {/* Liquidity Wall Concentration Badges */}
      {(buyWall || sellWall) && (
        <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-1 text-[10px]">
          {buyWall && (
            <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              <AlertOctagon className="w-3 h-3 shrink-0" />
              <span>BUY WALL: {buyWall.size} @ ${buyWall.price}</span>
            </div>
          )}
          {sellWall && (
            <div className="flex items-center space-x-1 text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded ml-auto">
              <AlertOctagon className="w-3 h-3 shrink-0" />
              <span>SELL WALL: {sellWall.size} @ ${sellWall.price}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Order Book Table */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto">
        {/* ASKS (Sellers) - Rendered top down in reverse order */}
        <div className="flex-1 flex flex-col justify-end space-y-0.5 p-2 border-b border-slate-800">
          <div className="grid grid-cols-3 text-slate-500 font-sans text-[10px] pb-1 border-b border-slate-800/50">
            <span>Price ($)</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {asks.slice().reverse().map((ask) => (
            <div
              key={`ask-${ask.price}`}
              onClick={() => onSelectPrice && onSelectPrice(ask.price)}
              className={`relative grid grid-cols-3 py-1 px-1.5 rounded cursor-pointer hover:bg-slate-800/60 transition-colors group ${
                ask.isWall ? 'ring-1 ring-rose-500/40 bg-rose-950/20' : ''
              }`}
            >
              {/* Depth Visual Fill Bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none rounded-r transition-all"
                style={{ width: `${ask.depthPct}%` }}
              />

              <span className="text-rose-400 font-semibold relative z-10 group-hover:underline">
                ${ask.price.toFixed(2)}
              </span>
              <span className="text-right text-slate-200 relative z-10">{ask.size}</span>
              <span className="text-right text-slate-400 relative z-10">{ask.total}</span>
            </div>
          ))}
        </div>

        {/* Current Mid Price Divider */}
        <div className="bg-slate-950 py-2 px-3.5 border-y border-slate-800 flex items-center justify-between text-xs font-sans font-bold">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px]">Mid Price:</span>
            <span className="text-slate-100">${currentPrice ? currentPrice.toFixed(2) : '---'}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">LIVE L2 FEED</span>
        </div>

        {/* BIDS (Buyers) */}
        <div className="flex-1 flex flex-col space-y-0.5 p-2">
          {bids.map((bid) => (
            <div
              key={`bid-${bid.price}`}
              onClick={() => onSelectPrice && onSelectPrice(bid.price)}
              className={`relative grid grid-cols-3 py-1 px-1.5 rounded cursor-pointer hover:bg-slate-800/60 transition-colors group ${
                bid.isWall ? 'ring-1 ring-emerald-500/40 bg-emerald-950/20' : ''
              }`}
            >
              {/* Depth Visual Fill Bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none rounded-r transition-all"
                style={{ width: `${bid.depthPct}%` }}
              />

              <span className="text-emerald-400 font-semibold relative z-10 group-hover:underline">
                ${bid.price.toFixed(2)}
              </span>
              <span className="text-right text-slate-200 relative z-10">{bid.size}</span>
              <span className="text-right text-slate-400 relative z-10">{bid.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
