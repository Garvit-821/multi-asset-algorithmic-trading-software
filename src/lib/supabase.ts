import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface StrategyAlert {
  id: string;
  coin_name: string;
  condition_type: string;
  condition_message: string;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  status: string;
  created_at: string;
}

export interface ManualTrade {
  id: string;
  coin_name: string;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  message: string;
  created_at: string;
  side?: 'LONG' | 'SHORT';
  status?: 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'CLOSED';
}

export interface AIStrategy {
  id: string;
  strategy_name: string;
  accuracy: number;
  drawdown: number;
  profit_ratio: number;
  trades_count: number;
  win_rate: number;
  updated_at: string;
}

// Check if a real Supabase configuration is supplied
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key';

class MockSupabaseQueryBuilder {
  private tableName: string;
  private filters: Array<(item: Record<string, unknown>) => boolean> = [];
  private orderField?: string;
  private orderAscending = true;
  private limitCount?: number;
  private isSingle = false;
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private operationValues: unknown = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getData(): Array<Record<string, unknown>> {
    const defaultData: Record<string, Array<Record<string, unknown>>> = {
      strategy_alerts: [
        {
          id: '1',
          coin_name: 'BTC/USDT',
          condition_type: 'RSI Oversold (1m)',
          condition_message: 'RSI crossed below 30. Potential trend reversal.',
          entry_price: 62450.50,
          stop_loss: 61900.00,
          target_price: 63500.00,
          status: 'active',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: '2',
          coin_name: 'ETH/USDT',
          condition_type: 'EMA Crossover (5m)',
          condition_message: 'EMA 9 crossed above EMA 21. Bullish breakout.',
          entry_price: 3420.25,
          stop_loss: 3380.00,
          target_price: 3510.00,
          status: 'active',
          created_at: new Date(Date.now() - 25 * 60000).toISOString(),
        },
        {
          id: '3',
          coin_name: 'SOL/USDT',
          condition_type: 'MACD Bullish Cross',
          condition_message: 'MACD line crossed above signal line on 15m chart.',
          entry_price: 139.10,
          stop_loss: 135.50,
          target_price: 147.00,
          status: 'active',
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
        }
      ],
      manual_trades: [
        {
          id: '1',
          coin_name: 'BTC/USDT',
          side: 'LONG',
          entry_price: 62500.00,
          stop_loss: 61500.00,
          target_price: 64500.00,
          message: 'VIP Signal: Strong bullish divergence on daily support.',
          status: 'ACTIVE',
          created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: '2',
          coin_name: 'SOL/USDT',
          side: 'LONG',
          entry_price: 138.50,
          stop_loss: 132.00,
          target_price: 150.00,
          message: 'Solana breaks out of descending channel. Target 150.',
          status: 'TP_HIT',
          created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
        }
      ],
      price_alerts: [
        {
          id: '1',
          user_id: 'mock-admin-id',
          symbol: 'BTC/USDT',
          asset_type: 'crypto',
          alert_type: 'price_above',
          target_price: 65000,
          message: 'BTC broke through 65,000!',
          status: 'triggered',
          telegram_enabled: false,
          triggered_at: new Date(Date.now() - 10 * 60000).toISOString(),
          created_at: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
          id: '2',
          user_id: 'mock-admin-id',
          symbol: 'ETH/USDT',
          asset_type: 'crypto',
          alert_type: 'price_below',
          target_price: 3400,
          message: 'ETH dropped below 3400 support.',
          status: 'active',
          telegram_enabled: false,
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
        }
      ],
      market_data_cache: []
    };

    const key = `mock_supabase_${this.tableName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultData[this.tableName] || [];
      }
    }
    const defaultList = defaultData[this.tableName] || [];
    localStorage.setItem(key, JSON.stringify(defaultList));
    return defaultList;
  }

  private saveData(data: Array<Record<string, unknown>>) {
    localStorage.setItem(`mock_supabase_${this.tableName}`, JSON.stringify(data));
  }

  select(_columns?: string) {
    this.operation = 'select';
    return this;
  }

  eq(column: string, value: unknown) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[column] === value);
    }
    return this;
  }

  neq(column: string, value: unknown) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[column] !== value);
    }
    return this;
  }

  gt(column: string, value: unknown) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => itemVal(item[column]) > itemVal(value));
    }
    return this;
  }

  gte(column: string, value: unknown) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => itemVal(item[column]) >= itemVal(value));
    }
    return this;
  }

  lte(column: string, value: unknown) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => itemVal(item[column]) <= itemVal(value));
    }
    return this;
  }

  in(column: string, values: unknown[]) {
    if (Array.isArray(values)) {
      this.filters.push((item) => values.includes(item[column]));
    }
    return this;
  }

  order(column: string, options?: { ascending: boolean }) {
    this.orderField = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  // Handle standard promise chaining `.then`
  async then(resolve: (result: { data: unknown; error: unknown }) => void) {
    try {
      let data = this.getData();

      if (this.operation === 'insert') {
        const newItems = Array.isArray(this.operationValues) ? this.operationValues : [this.operationValues];
        const createdItems = newItems.map((item: Record<string, unknown>) => ({
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          ...item,
        }));
        data = [...createdItems, ...data];
        this.saveData(data);
        const resultData = this.isSingle ? (createdItems[0] || null) : createdItems;
        return resolve({ data: resultData, error: null });
      }

      if (this.operation === 'update') {
        const updatedItems: Array<Record<string, unknown>> = [];
        const updatedData = data.map((item) => {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(item)) {
              matches = false;
              break;
            }
          }
          if (matches) {
            const updated = { ...item, ...(this.operationValues as Record<string, unknown>) };
            updatedItems.push(updated);
            return updated;
          }
          return item;
        });
        this.saveData(updatedData);
        const resultData = this.isSingle ? (updatedItems[0] || null) : updatedItems;
        return resolve({ data: resultData, error: null });
      }

      if (this.operation === 'delete') {
        const deletedItems: Array<Record<string, unknown>> = [];
        const remainingData = data.filter((item) => {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(item)) {
              matches = false;
              break;
            }
          }
          if (matches) {
            deletedItems.push(item);
          }
          return !matches;
        });
        this.saveData(remainingData);
        const resultData = this.isSingle ? (deletedItems[0] || null) : deletedItems;
        return resolve({ data: resultData, error: null });
      }

      if (this.operation === 'upsert') {
        const items = Array.isArray(this.operationValues) ? this.operationValues : [this.operationValues];
        const updatedData = [...data];
        const upsertedItems: Array<Record<string, unknown>> = [];

        for (const item of items) {
          const index = updatedData.findIndex(
            (existing) => 
              (item.id && existing.id === item.id) || 
              (item.symbol && existing.symbol === item.symbol && item.asset_type === existing.asset_type)
          );

          if (index > -1) {
            const updated = { ...updatedData[index], ...item };
            updatedData[index] = updated;
            upsertedItems.push(updated);
          } else {
            const created = {
              id: Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              ...item
            };
            updatedData.push(created);
            upsertedItems.push(created);
          }
        }
        this.saveData(updatedData);
        const resultData = this.isSingle ? (upsertedItems[0] || null) : upsertedItems;
        return resolve({ data: resultData, error: null });
      }

      // Apply filters
      for (const filter of this.filters) {
        data = data.filter(filter);
      }

      // Apply sorting
      if (this.orderField) {
        const field = this.orderField;
        const asc = this.orderAscending;
        data.sort((a, b) => {
          const valA = itemVal(a[field]);
          const valB = itemVal(b[field]);
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }

      // Apply limit
      if (this.limitCount !== undefined) {
        data = data.slice(0, this.limitCount);
      }

      const resultData = this.isSingle ? (data[0] || null) : data;
      resolve({ data: resultData, error: null });
    } catch (err: unknown) {
      resolve({ data: null, error: err });
    }
  }

  insert(values: unknown) {
    this.operation = 'insert';
    this.operationValues = values;
    return this;
  }

  update(values: unknown) {
    this.operation = 'update';
    this.operationValues = values;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert(values: unknown) {
    this.operation = 'upsert';
    this.operationValues = values;
    return this;
  }
}

function itemVal(val: unknown): number | string {
  if (typeof val === 'number' || typeof val === 'string') return val;
  return String(val ?? '');
}

class MockSupabaseClient {
  auth = {
    async getSession() {
      const storedUser = localStorage.getItem('stratrade_mock_user');
      const user = storedUser ? JSON.parse(storedUser) : { email: 'trader@stratrade.io', id: 'sandbox-user-id' };
      return { data: { session: { user } } };
    },
    async getUser() {
      const storedUser = localStorage.getItem('stratrade_mock_user');
      const user = storedUser ? JSON.parse(storedUser) : { email: 'trader@stratrade.io', id: 'sandbox-user-id' };
      return { data: { user } };
    },
    onAuthStateChange(callback: (event: string, session: { user: { email: string; id: string } } | null) => void) {
      const storedUser = localStorage.getItem('stratrade_mock_user');
      const user = storedUser ? JSON.parse(storedUser) : { email: 'trader@stratrade.io', id: 'sandbox-user-id' };
      callback('SIGNED_IN', { user });
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    async signOut() {
      localStorage.removeItem('stratrade_mock_user');
      return { error: null };
    },
    async signInWithPassword({ email }: { email?: string } = {}) {
      const user = { email: email || 'trader@stratrade.io', id: 'sandbox-user-id' };
      localStorage.setItem('stratrade_mock_user', JSON.stringify(user));
      return { data: { user }, error: null };
    },
    async signUp({ email }: { email?: string } = {}) {
      const user = { email: email || 'trader@stratrade.io', id: 'sandbox-user-id' };
      localStorage.setItem('stratrade_mock_user', JSON.stringify(user));
      return { data: { user }, error: null };
    }
  };

  from(table: string) {
    return new MockSupabaseQueryBuilder(table);
  }

  channel(_name: string) {
    return {
      on(_event: string, _filter: unknown, _callback: unknown) {
        return this;
      },
      subscribe() {
        return this;
      }
    };
  }

  removeChannel(_channel: unknown) {
    return;
  }
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new MockSupabaseClient() as unknown as ReturnType<typeof createClient>);
