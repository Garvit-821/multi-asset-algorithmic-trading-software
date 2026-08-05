// Institutional Algorithmic Order Execution Engine (TWAP, VWAP, Iceberg)

import { exchangeConnector, ExchangeId } from './exchangeConnector';
import { paperTradingService } from './paperTradingService';

export type AlgoStrategyType = 'TWAP' | 'VWAP' | 'ICEBERG';

export type AlgoOrderStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface SliceLog {
  id: string;
  sliceIndex: number;
  timestamp: string;
  quantity: number;
  price: number;
  status: 'FILLED' | 'REJECTED';
  orderId?: string;
}

export interface AlgoOrderConfig {
  id: string;
  strategyType: AlgoStrategyType;
  symbol: string;
  side: 'BUY' | 'SELL';
  totalQuantity: number;
  filledQuantity: number;
  exchangeId: ExchangeId;
  status: AlgoOrderStatus;
  createdAt: string;

  // Strategy Specific Parameters
  durationMinutes?: number; // TWAP & VWAP
  sliceIntervalSeconds?: number; // TWAP
  randomizeVariancePercent?: number; // TWAP/VWAP slice variance (0-30%)
  displayQuantity?: number; // Iceberg visible size
  limitPrice?: number; // Optional limit price threshold
  
  sliceLogs: SliceLog[];
  timerId?: ReturnType<typeof setInterval>;
}

type Listener = (orders: AlgoOrderConfig[]) => void;

class AlgoExecutionService {
  private activeOrders: Map<string, AlgoOrderConfig> = new Map();
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.getOrders());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const orders = this.getOrders();
    this.listeners.forEach((l) => l(orders));
  }

  public getOrders(): AlgoOrderConfig[] {
    return Array.from(this.activeOrders.values());
  }

  // Create & Register a new Algorithmic Order
  public createAlgoOrder(params: Omit<AlgoOrderConfig, 'id' | 'filledQuantity' | 'status' | 'createdAt' | 'sliceLogs'>): AlgoOrderConfig {
    const id = `ALGO-${params.strategyType}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newOrder: AlgoOrderConfig = {
      ...params,
      id,
      filledQuantity: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      sliceLogs: [],
    };

    this.activeOrders.set(id, newOrder);
    this.notify();
    return newOrder;
  }

  // Start execution runner for an algo order
  public startOrder(orderId: string) {
    const order = this.activeOrders.get(orderId);
    if (!order || order.status === 'COMPLETED' || order.status === 'CANCELLED') return;

    order.status = 'RUNNING';
    this.notify();

    if (order.strategyType === 'TWAP') {
      this.runTWAP(order);
    } else if (order.strategyType === 'VWAP') {
      this.runVWAP(order);
    } else if (order.strategyType === 'ICEBERG') {
      this.runIceberg(order);
    }
  }

  // Pause a running order
  public pauseOrder(orderId: string) {
    const order = this.activeOrders.get(orderId);
    if (!order) return;

    if (order.timerId) {
      clearInterval(order.timerId);
      order.timerId = undefined;
    }
    order.status = 'PAUSED';
    this.notify();
  }

  // Cancel an order
  public cancelOrder(orderId: string) {
    const order = this.activeOrders.get(orderId);
    if (!order) return;

    if (order.timerId) {
      clearInterval(order.timerId);
      order.timerId = undefined;
    }
    order.status = 'CANCELLED';
    this.notify();
  }

  // TWAP Execution Strategy Runner
  private runTWAP(order: AlgoOrderConfig) {
    const durationSec = (order.durationMinutes || 5) * 60;
    const intervalSec = order.sliceIntervalSeconds || 10;
    const totalSlices = Math.max(1, Math.floor(durationSec / intervalSec));
    const baseSliceQty = order.totalQuantity / totalSlices;

    let sliceIndex = order.sliceLogs.length;

    const executeSlice = async () => {
      if (order.status !== 'RUNNING') return;

      const remainingQty = order.totalQuantity - order.filledQuantity;
      if (remainingQty <= 0.000001 || sliceIndex >= totalSlices) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
        this.notify();
        return;
      }

      // Calculate slice quantity with variance
      let currentSliceQty = baseSliceQty;
      if (order.randomizeVariancePercent && order.randomizeVariancePercent > 0) {
        const variance = (Math.random() * 2 - 1) * (order.randomizeVariancePercent / 100);
        currentSliceQty = Math.max(0.0001, baseSliceQty * (1 + variance));
      }

      currentSliceQty = Math.min(currentSliceQty, remainingQty);

      // Execute slice via connector or paper engine
      const executionResult = await this.executeSliceTrade(order, currentSliceQty);

      sliceIndex++;
      order.filledQuantity = Number((order.filledQuantity + currentSliceQty).toFixed(4));
      order.sliceLogs.push({
        id: `SLICE-${Date.now()}-${sliceIndex}`,
        sliceIndex,
        timestamp: new Date().toLocaleTimeString(),
        quantity: Number(currentSliceQty.toFixed(4)),
        price: executionResult.price,
        status: 'FILLED',
        orderId: executionResult.orderId,
      });

      if (order.filledQuantity >= order.totalQuantity) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
      }

      this.notify();
    };

    // Execute first slice immediately
    executeSlice();

    // Schedule remaining slices
    order.timerId = setInterval(executeSlice, intervalSec * 1000);
  }

  // VWAP Execution Strategy Runner (Volume Profile Weighted)
  private runVWAP(order: AlgoOrderConfig) {
    const intervalSec = order.sliceIntervalSeconds || 10;
    // Volume curve profile weights for intraday slices (U-shaped distribution)
    const volumeProfile = [0.25, 0.15, 0.10, 0.08, 0.07, 0.10, 0.25];
    const totalSlices = volumeProfile.length;
    let sliceIndex = order.sliceLogs.length;

    const executeSlice = async () => {
      if (order.status !== 'RUNNING') return;

      const remainingQty = order.totalQuantity - order.filledQuantity;
      if (remainingQty <= 0.000001 || sliceIndex >= totalSlices) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
        this.notify();
        return;
      }

      const weight = volumeProfile[sliceIndex % volumeProfile.length];
      let currentSliceQty = order.totalQuantity * weight;
      currentSliceQty = Math.min(currentSliceQty, remainingQty);

      const executionResult = await this.executeSliceTrade(order, currentSliceQty);

      sliceIndex++;
      order.filledQuantity = Number((order.filledQuantity + currentSliceQty).toFixed(4));
      order.sliceLogs.push({
        id: `VWAP-${Date.now()}-${sliceIndex}`,
        sliceIndex,
        timestamp: new Date().toLocaleTimeString(),
        quantity: Number(currentSliceQty.toFixed(4)),
        price: executionResult.price,
        status: 'FILLED',
        orderId: executionResult.orderId,
      });

      if (order.filledQuantity >= order.totalQuantity) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
      }

      this.notify();
    };

    executeSlice();
    order.timerId = setInterval(executeSlice, intervalSec * 1000);
  }

  // Iceberg Execution Strategy Runner
  private runIceberg(order: AlgoOrderConfig) {
    const displayQty = order.displayQuantity || Math.max(0.01, order.totalQuantity * 0.1);
    const intervalSec = 5;
    let sliceIndex = order.sliceLogs.length;

    const executeSlice = async () => {
      if (order.status !== 'RUNNING') return;

      const remainingQty = order.totalQuantity - order.filledQuantity;
      if (remainingQty <= 0.000001) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
        this.notify();
        return;
      }

      // Only show displayQty to market
      const currentSliceQty = Math.min(displayQty, remainingQty);

      const executionResult = await this.executeSliceTrade(order, currentSliceQty);

      sliceIndex++;
      order.filledQuantity = Number((order.filledQuantity + currentSliceQty).toFixed(4));
      order.sliceLogs.push({
        id: `ICEBERG-${Date.now()}-${sliceIndex}`,
        sliceIndex,
        timestamp: new Date().toLocaleTimeString(),
        quantity: Number(currentSliceQty.toFixed(4)),
        price: executionResult.price,
        status: 'FILLED',
        orderId: executionResult.orderId,
      });

      if (order.filledQuantity >= order.totalQuantity) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
      }

      this.notify();
    };

    executeSlice();
    order.timerId = setInterval(executeSlice, intervalSec * 1000);
  }

  // Helper method to execute a single slice trade
  private async executeSliceTrade(order: AlgoOrderConfig, sliceQty: number): Promise<{ price: number; orderId: string }> {
    // Check if live connectors have active credentials, else use paper service
    const creds = exchangeConnector.getCredentials()[order.exchangeId];

    if (creds && creds.apiKey) {
      const res = await exchangeConnector.executeOrder({
        exchangeId: order.exchangeId,
        symbol: order.symbol,
        side: order.side,
        orderType: 'MARKET',
        quantity: sliceQty,
      });
      return { price: res.price, orderId: res.orderId || `SLICE-${Date.now()}` };
    } else {
      // Paper Trading fallback execution
      const currentPrice = order.limitPrice || 50000;
      if (order.side === 'BUY') {
        paperTradingService.buyAsset(order.symbol, 'crypto', sliceQty, currentPrice);
      } else {
        paperTradingService.sellAsset(order.symbol, 'crypto', sliceQty, currentPrice);
      }
      return { price: currentPrice, orderId: `PAPER-SLICE-${Date.now()}` };
    }
  }
}

export const algoExecutionService = new AlgoExecutionService();
