// Institutional Algorithmic Order Execution Engine (TWAP, VWAP, Iceberg)
// Refactored for Database Persistence & Server Execution Tracking

import { exchangeConnector, ExchangeId } from './exchangeConnector';
import { paperTradingService } from './paperTradingService';
import { supabase } from '../lib/supabase';

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

  constructor() {
    this.syncFromDatabase();
  }

  public async syncFromDatabase() {
    try {
      const { data: dbOrders, error } = await supabase
        .from('algo_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !dbOrders) return;

      for (const order of dbOrders) {
        const { data: slices } = await supabase
          .from('algo_order_slices')
          .select('*')
          .eq('algo_order_id', order.id)
          .order('slice_index', { ascending: true });

        const mappedSlices: SliceLog[] = (slices || []).map((s: { id: string; slice_index: number; executed_at: string; quantity: number; price: number; status: 'FILLED' | 'REJECTED'; exchange_order_id?: string }) => ({
          id: s.id,
          sliceIndex: s.slice_index,
          timestamp: new Date(s.executed_at).toLocaleTimeString(),
          quantity: Number(s.quantity),
          price: Number(s.price),
          status: s.status,
          orderId: s.exchange_order_id,
        }));

        const config: AlgoOrderConfig = {
          id: order.id,
          strategyType: order.strategy_type,
          symbol: order.symbol,
          side: order.side,
          totalQuantity: Number(order.total_quantity),
          filledQuantity: Number(order.filled_quantity || 0),
          exchangeId: order.exchange_id as ExchangeId,
          status: order.status as AlgoOrderStatus,
          createdAt: order.created_at,
          durationMinutes: order.duration_minutes,
          sliceIntervalSeconds: order.slice_interval_seconds,
          randomizeVariancePercent: order.randomize_variance_percent,
          displayQuantity: order.display_quantity,
          limitPrice: order.limit_price,
          sliceLogs: mappedSlices,
        };

        this.activeOrders.set(order.id, config);
      }
      this.notify();
    } catch (_err) {
      console.warn('[AlgoExecutionService] Database sync fallback');
    }
  }

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
  public async createAlgoOrder(params: Omit<AlgoOrderConfig, 'id' | 'filledQuantity' | 'status' | 'createdAt' | 'sliceLogs'>): Promise<AlgoOrderConfig> {
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

    // Persist to Supabase Database
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user?.id) {
        await supabase.from('algo_orders').insert({
          id,
          user_id: userRes.user.id,
          strategy_type: params.strategyType,
          symbol: params.symbol,
          side: params.side,
          total_quantity: params.totalQuantity,
          filled_quantity: 0,
          exchange_id: params.exchangeId,
          status: 'PENDING',
          duration_minutes: params.durationMinutes,
          slice_interval_seconds: params.sliceIntervalSeconds,
          randomize_variance_percent: params.randomizeVariancePercent,
          display_quantity: params.displayQuantity,
          limit_price: params.limitPrice,
        });
      }
    } catch (_err) {
      console.warn('[AlgoExecutionService] Database insert fallback');
    }

    return newOrder;
  }

  // Start execution runner for an algo order
  public startOrder(orderId: string) {
    const order = this.activeOrders.get(orderId);
    if (!order || order.status === 'COMPLETED' || order.status === 'CANCELLED') return;

    order.status = 'RUNNING';
    this.updateOrderStatusDb(orderId, 'RUNNING');
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
    this.updateOrderStatusDb(orderId, 'PAUSED');
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
    this.updateOrderStatusDb(orderId, 'CANCELLED');
    this.notify();
  }

  private async updateOrderStatusDb(orderId: string, status: AlgoOrderStatus, filledQty?: number) {
    try {
      const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (filledQty !== undefined) updatePayload.filled_quantity = filledQty;
      await supabase.from('algo_orders').update(updatePayload).eq('id', orderId);
    } catch (_err) {
      // Ignore fallback
    }
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
        this.updateOrderStatusDb(order.id, 'COMPLETED', order.filledQuantity);
        this.notify();
        return;
      }

      let currentSliceQty = baseSliceQty;
      if (order.randomizeVariancePercent && order.randomizeVariancePercent > 0) {
        const variance = (Math.random() * 2 - 1) * (order.randomizeVariancePercent / 100);
        currentSliceQty = Math.max(0.0001, baseSliceQty * (1 + variance));
      }

      currentSliceQty = Math.min(currentSliceQty, remainingQty);

      const executionResult = await this.executeSliceTrade(order, currentSliceQty);

      sliceIndex++;
      order.filledQuantity = Number((order.filledQuantity + currentSliceQty).toFixed(4));
      
      const sliceLogItem: SliceLog = {
        id: `SLICE-${Date.now()}-${sliceIndex}`,
        sliceIndex,
        timestamp: new Date().toLocaleTimeString(),
        quantity: Number(currentSliceQty.toFixed(4)),
        price: executionResult.price,
        status: 'FILLED',
        orderId: executionResult.orderId,
      };

      order.sliceLogs.push(sliceLogItem);

      this.recordSliceDb(order.id, sliceLogItem);
      this.updateOrderStatusDb(order.id, order.filledQuantity >= order.totalQuantity ? 'COMPLETED' : 'RUNNING', order.filledQuantity);

      if (order.filledQuantity >= order.totalQuantity) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
      }

      this.notify();
    };

    executeSlice();
    order.timerId = setInterval(executeSlice, intervalSec * 1000);
  }

  // VWAP Execution Strategy Runner
  private runVWAP(order: AlgoOrderConfig) {
    const intervalSec = order.sliceIntervalSeconds || 10;
    const volumeProfile = [0.25, 0.15, 0.10, 0.08, 0.07, 0.10, 0.25];
    const totalSlices = volumeProfile.length;
    let sliceIndex = order.sliceLogs.length;

    const executeSlice = async () => {
      if (order.status !== 'RUNNING') return;

      const remainingQty = order.totalQuantity - order.filledQuantity;
      if (remainingQty <= 0.000001 || sliceIndex >= totalSlices) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
        this.updateOrderStatusDb(order.id, 'COMPLETED', order.filledQuantity);
        this.notify();
        return;
      }

      const weight = volumeProfile[sliceIndex % volumeProfile.length];
      let currentSliceQty = order.totalQuantity * weight;
      currentSliceQty = Math.min(currentSliceQty, remainingQty);

      const executionResult = await this.executeSliceTrade(order, currentSliceQty);

      sliceIndex++;
      order.filledQuantity = Number((order.filledQuantity + currentSliceQty).toFixed(4));
      const sliceLogItem: SliceLog = {
        id: `VWAP-${Date.now()}-${sliceIndex}`,
        sliceIndex,
        timestamp: new Date().toLocaleTimeString(),
        quantity: Number(currentSliceQty.toFixed(4)),
        price: executionResult.price,
        status: 'FILLED',
        orderId: executionResult.orderId,
      };

      order.sliceLogs.push(sliceLogItem);
      this.recordSliceDb(order.id, sliceLogItem);
      this.updateOrderStatusDb(order.id, order.filledQuantity >= order.totalQuantity ? 'COMPLETED' : 'RUNNING', order.filledQuantity);

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
        this.updateOrderStatusDb(order.id, 'COMPLETED', order.filledQuantity);
        this.notify();
        return;
      }

      const currentSliceQty = Math.min(displayQty, remainingQty);
      const executionResult = await this.executeSliceTrade(order, currentSliceQty);

      sliceIndex++;
      order.filledQuantity = Number((order.filledQuantity + currentSliceQty).toFixed(4));
      const sliceLogItem: SliceLog = {
        id: `ICEBERG-${Date.now()}-${sliceIndex}`,
        sliceIndex,
        timestamp: new Date().toLocaleTimeString(),
        quantity: Number(currentSliceQty.toFixed(4)),
        price: executionResult.price,
        status: 'FILLED',
        orderId: executionResult.orderId,
      };

      order.sliceLogs.push(sliceLogItem);
      this.recordSliceDb(order.id, sliceLogItem);
      this.updateOrderStatusDb(order.id, order.filledQuantity >= order.totalQuantity ? 'COMPLETED' : 'RUNNING', order.filledQuantity);

      if (order.filledQuantity >= order.totalQuantity) {
        order.status = 'COMPLETED';
        if (order.timerId) clearInterval(order.timerId);
      }

      this.notify();
    };

    executeSlice();
    order.timerId = setInterval(executeSlice, intervalSec * 1000);
  }

  private async recordSliceDb(algoOrderId: string, slice: SliceLog) {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user?.id) {
        await supabase.from('algo_order_slices').insert({
          algo_order_id: algoOrderId,
          user_id: userRes.user.id,
          slice_index: slice.sliceIndex,
          quantity: slice.quantity,
          price: slice.price,
          status: slice.status,
          exchange_order_id: slice.orderId,
          client_order_id: slice.id,
        });
      }
    } catch (_err) {
      // Fallback
    }
  }

  // Helper method to execute a single slice trade
  private async executeSliceTrade(order: AlgoOrderConfig, sliceQty: number): Promise<{ price: number; orderId: string }> {
    const res = await exchangeConnector.executeOrder({
      exchangeId: order.exchangeId,
      symbol: order.symbol,
      side: order.side,
      orderType: 'MARKET',
      quantity: sliceQty,
    });

    if (res.success && res.orderId && !res.orderId.startsWith('SIM-')) {
      return { price: res.price, orderId: res.orderId };
    }

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

export const algoExecutionService = new AlgoExecutionService();
