/**
 * Subscription & Payment Service (Demo Workflow)
 * Controls user plan tiers, feature gating, persistence, and mock card checkout processing.
 */

export type PlanId = 'free' | 'pro' | 'institutional';
export type BillingInterval = 'monthly' | 'annual';

export interface PlanDetails {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // monthly equivalent price when billed annually
  features: string[];
  badge: string;
  popular?: boolean;
}

export interface SubscriptionState {
  planId: PlanId;
  planName: string;
  billingInterval: BillingInterval;
  amountPaid: number;
  status: 'active' | 'trialing' | 'canceled';
  paymentDate: string;
  nextBillingDate: string;
  transactionId: string;
  cardLast4: string;
  cardBrand: string;
  cardHolder: string;
}

export interface PaymentRequest {
  planId: PlanId;
  billingInterval: BillingInterval;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  zipCode: string;
}

export interface PaymentReceipt {
  success: boolean;
  transactionId: string;
  timestamp: string;
  planId: PlanId;
  planName: string;
  amountPaid: number;
  billingInterval: BillingInterval;
  cardLast4: string;
  cardBrand: string;
  cardHolder: string;
  nextBillingDate: string;
  unlockedFeatures: string[];
  error?: string;
}

export const PLANS: Record<PlanId, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Developer Sandbox',
    tagline: 'Ideal for individual traders learning quantitative concepts.',
    monthlyPrice: 0,
    annualPrice: 0,
    badge: 'FREE TIER',
    features: [
      '$100,000 Virtual Paper Account',
      'Real-Time Binance Crypto WebSockets',
      'Black-Scholes Call/Put Fair Values',
      'Standard Technical Indicators (RSI, MACD, EMA)',
      'Local Browser Storage & Data Privacy',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Quant Pass',
    tagline: 'Full analytical power for active algorithmic & derivatives traders.',
    monthlyPrice: 49,
    annualPrice: 39,
    badge: 'MOST POPULAR',
    popular: true,
    features: [
      'Everything in Free Sandbox',
      'Full Option Greeks Sensitivity Matrix (Δ, Γ, Θ, ν, ρ)',
      'Google Gemini 2.0 AI Market Intelligence & Copilot',
      'Historical Strategy Backtester & Replay Engine',
      'No-Code Visual Strategy Graph Builder',
      'Social Market Sentiment & Pulse Monitor',
      'Telegram Signal & Price Crossing Alert Bot',
    ],
  },
  institutional: {
    id: 'institutional',
    name: 'Institutional Alpha',
    tagline: 'For quantitative funds, prop desks, and risk managers.',
    monthlyPrice: 199,
    annualPrice: 159,
    badge: 'FUNDS & DESKS',
    features: [
      'Everything in Pro Quant Pass',
      'Markowitz Efficient Frontier Portfolio Allocation',
      'Stochastic Monte Carlo Simulation Engine (1,000+ paths)',
      'Parametric Value at Risk (VaR 95% & 99%)',
      'Multi-Asset Extended Catalog Index',
      'Custom REST API Webhook Dispatcher',
      'Dedicated Quant Support & Strategy Reviews',
    ],
  },
};

/**
 * Feature view mapping to required subscription tier.
 */
export const VIEW_PLAN_REQUIREMENTS: Record<string, PlanId> = {
  landing: 'free',
  userfeed: 'free',
  trading: 'free',
  paper: 'free',
  dashboard: 'free',
  settings: 'free',

  // Pro Tier Locked Views
  intelligence: 'pro',
  derivatives: 'pro',
  backtest: 'pro',
  visualbuilder: 'pro',
  replay: 'pro',
  sentiment: 'pro',
  alerts: 'pro',
  manual: 'pro',
  ai: 'pro',

  // Institutional Tier Locked Views
  optimizer: 'institutional',
};

const STORAGE_KEY = 'stratrade_user_subscription';

const DEFAULT_FREE_SUBSCRIPTION: SubscriptionState = {
  planId: 'free',
  planName: 'Developer Sandbox',
  billingInterval: 'monthly',
  amountPaid: 0,
  status: 'active',
  paymentDate: new Date().toISOString(),
  nextBillingDate: 'Lifetime Free',
  transactionId: 'TXN-FREE-000000',
  cardLast4: '0000',
  cardBrand: 'Sandbox Free',
  cardHolder: 'Demo Quantitative Trader',
};

export const subscriptionService = {
  /**
   * Retrieves the current user subscription state from localStorage.
   */
  getSubscription(): SubscriptionState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as SubscriptionState;
      }
    } catch (e) {
      console.warn('Failed to read subscription from localStorage:', e);
    }
    return DEFAULT_FREE_SUBSCRIPTION;
  },

  /**
   * Saves subscription state to localStorage.
   */
  saveSubscription(sub: SubscriptionState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
    } catch (e) {
      console.error('Failed to save subscription to localStorage:', e);
    }
  },

  /**
   * Resets user subscription back to the Free Sandbox tier.
   */
  resetToFree(): SubscriptionState {
    const freeState: SubscriptionState = {
      ...DEFAULT_FREE_SUBSCRIPTION,
      paymentDate: new Date().toISOString(),
    };
    this.saveSubscription(freeState);
    return freeState;
  },

  /**
   * Determines if a specific view / feature is unlocked for the current plan.
   */
  isFeatureUnlocked(viewName: string, currentPlanId: PlanId): boolean {
    const requiredPlan = VIEW_PLAN_REQUIREMENTS[viewName] || 'free';
    if (requiredPlan === 'free') return true;
    if (requiredPlan === 'pro') return currentPlanId === 'pro' || currentPlanId === 'institutional';
    if (requiredPlan === 'institutional') return currentPlanId === 'institutional';
    return false;
  },

  /**
   * Returns the minimum plan tier required for a view.
   */
  getRequiredPlan(viewName: string): PlanId {
    return VIEW_PLAN_REQUIREMENTS[viewName] || 'free';
  },

  /**
   * Detects Card Brand from Card Number
   */
  detectCardBrand(cardNumber: string): string {
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (/^4/.test(cleanNum)) return 'Visa';
    if (/^5[1-5]/.test(cleanNum) || /^2[2-7]/.test(cleanNum)) return 'Mastercard';
    if (/^3[47]/.test(cleanNum)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNum)) return 'Discover';
    return 'Credit Card';
  },

  /**
   * Processes a demo card payment asynchronously.
   */
  async processMockPayment(req: PaymentRequest): Promise<PaymentReceipt> {
    // Artificial payment gateway network latency simulation (1.2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const cleanCard = req.cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 13) {
      return {
        success: false,
        transactionId: '',
        timestamp: new Date().toISOString(),
        planId: req.planId,
        planName: PLANS[req.planId].name,
        amountPaid: 0,
        billingInterval: req.billingInterval,
        cardLast4: '',
        cardBrand: '',
        cardHolder: req.cardHolder,
        nextBillingDate: '',
        unlockedFeatures: [],
        error: 'Invalid card number. Please provide a valid card number for demo testing.',
      };
    }

    const plan = PLANS[req.planId];
    const isAnnual = req.billingInterval === 'annual';
    const monthlyRate = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const totalAmount = isAnnual ? monthlyRate * 12 : monthlyRate;

    const brand = this.detectCardBrand(req.cardNumber);
    const last4 = cleanCard.slice(-4) || '4242';

    const randomTxnId = 'TXN-STR-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const nextBill = new Date(now);
    if (isAnnual) {
      nextBill.setFullYear(nextBill.getFullYear() + 1);
    } else {
      nextBill.setMonth(nextBill.getMonth() + 1);
    }

    const nextBillingDateStr = nextBill.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const newSubState: SubscriptionState = {
      planId: req.planId,
      planName: plan.name,
      billingInterval: req.billingInterval,
      amountPaid: totalAmount,
      status: 'active',
      paymentDate: now.toISOString(),
      nextBillingDate: nextBillingDateStr,
      transactionId: randomTxnId,
      cardLast4: last4,
      cardBrand: brand,
      cardHolder: req.cardHolder || 'Quantitative Trader',
    };

    // Save to persistent storage
    this.saveSubscription(newSubState);

    const unlockedFeatures = plan.features.filter((f) => !f.startsWith('Everything in'));

    return {
      success: true,
      transactionId: randomTxnId,
      timestamp: now.toLocaleString(),
      planId: req.planId,
      planName: plan.name,
      amountPaid: totalAmount,
      billingInterval: req.billingInterval,
      cardLast4: last4,
      cardBrand: brand,
      cardHolder: req.cardHolder || 'Quantitative Trader',
      nextBillingDate: nextBillingDateStr,
      unlockedFeatures,
    };
  },
};
