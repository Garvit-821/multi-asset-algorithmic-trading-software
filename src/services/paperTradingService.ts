export interface Position {
  symbol: string;
  assetType: 'crypto' | 'forex' | 'stock' | 'commodity';
  quantity: number;
  averageEntryPrice: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: string;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  orders: Order[];
}

const DEFAULT_PORTFOLIO: Portfolio = {
  cash: 100000, // $100,000 USD Starting Cash
  positions: [],
  orders: [],
};

class PaperTradingService {
  private storageKey = 'cryptoagent_paper_portfolio';

  constructor() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_PORTFOLIO));
    }
  }

  getPortfolio(): Portfolio {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : DEFAULT_PORTFOLIO;
    } catch (e) {
      console.error('Error loading portfolio:', e);
      return DEFAULT_PORTFOLIO;
    }
  }

  private savePortfolio(portfolio: Portfolio) {
    localStorage.setItem(this.storageKey, JSON.stringify(portfolio));
  }

  buyAsset(
    symbol: string,
    assetType: 'crypto' | 'forex' | 'stock' | 'commodity',
    quantity: number,
    price: number
  ): { success: boolean; error?: string } {
    if (quantity <= 0 || price <= 0) {
      return { success: false, error: 'Quantity and price must be greater than zero' };
    }

    const portfolio = this.getPortfolio();
    const cost = quantity * price;

    if (portfolio.cash < cost) {
      return { success: false, error: `Insufficient funds. Needed $${cost.toFixed(2)}, available $${portfolio.cash.toFixed(2)}` };
    }

    // Deduct cash
    portfolio.cash -= cost;

    // Update position
    const existingPositionIdx = portfolio.positions.findIndex(
      (p) => p.symbol === symbol && p.assetType === assetType
    );

    if (existingPositionIdx >= 0) {
      const pos = portfolio.positions[existingPositionIdx];
      const newQty = pos.quantity + quantity;
      const newAvgPrice = (pos.averageEntryPrice * pos.quantity + price * quantity) / newQty;
      
      portfolio.positions[existingPositionIdx] = {
        ...pos,
        quantity: newQty,
        averageEntryPrice: Number(newAvgPrice.toFixed(4)),
      };
    } else {
      portfolio.positions.push({
        symbol,
        assetType,
        quantity,
        averageEntryPrice: price,
      });
    }

    // Add order log
    portfolio.orders.unshift({
      id: Math.random().toString(36).substring(2, 11),
      symbol,
      type: 'BUY',
      quantity,
      price,
      date: new Date().toISOString(),
    });

    this.savePortfolio(portfolio);
    return { success: true };
  }

  sellAsset(
    symbol: string,
    assetType: 'crypto' | 'forex' | 'stock' | 'commodity',
    quantity: number,
    price: number
  ): { success: boolean; error?: string } {
    if (quantity <= 0 || price <= 0) {
      return { success: false, error: 'Quantity and price must be greater than zero' };
    }

    const portfolio = this.getPortfolio();
    const existingPositionIdx = portfolio.positions.findIndex(
      (p) => p.symbol === symbol && p.assetType === assetType
    );

    if (existingPositionIdx < 0) {
      return { success: false, error: `No active position for ${symbol}` };
    }

    const pos = portfolio.positions[existingPositionIdx];
    if (pos.quantity < quantity) {
      return {
        success: false,
        error: `Insufficient asset quantity. Available: ${pos.quantity}, requested: ${quantity}`,
      };
    }

    // Add cash
    const revenue = quantity * price;
    portfolio.cash += revenue;

    // Deduct quantity
    const remainingQty = pos.quantity - quantity;
    if (remainingQty <= 0) {
      portfolio.positions.splice(existingPositionIdx, 1);
    } else {
      portfolio.positions[existingPositionIdx] = {
        ...pos,
        quantity: remainingQty,
      };
    }

    // Add order log
    portfolio.orders.unshift({
      id: Math.random().toString(36).substring(2, 11),
      symbol,
      type: 'SELL',
      quantity,
      price,
      date: new Date().toISOString(),
    });

    this.savePortfolio(portfolio);
    return { success: true };
  }

  resetPortfolio() {
    this.savePortfolio(DEFAULT_PORTFOLIO);
  }
}

export const paperTradingService = new PaperTradingService();
