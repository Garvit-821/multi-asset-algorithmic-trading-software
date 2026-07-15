import { useState, useEffect } from 'react';
import { Search, TrendingUp, Star, Bell, Plus, Minus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { TradingViewChart, AssetType } from './TradingViewChart';
import { searchSymbols } from '../services/dataFeed';
import { supabase } from '../lib/supabase';
import { paperTradingService } from '../services/paperTradingService';

export function MarketDashboard() {
  const [activeMarket, setActiveMarket] = useState<AssetType>('crypto');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [selectedExchange, setSelectedExchange] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; exchange?: string }>>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Paper Trading State
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQuantity, setTradeQuantity] = useState<number>(0.1);
  const [availableCash, setAvailableCash] = useState<number>(100000);
  const [tradeFeedback, setTradeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadWatchlist();
    // Set default symbol based on market
    const defaults: Record<AssetType, string> = {
      crypto: 'BTC/USDT',
      forex: 'EUR/USD',
      stock: 'RELIANCE',
      commodity: 'GOLD',
    };
    setSelectedSymbol(defaults[activeMarket]);
    
    const defaultsExchange: Record<AssetType, string | undefined> = {
      crypto: undefined,
      forex: undefined,
      stock: 'NSE',
      commodity: 'MCX',
    };
    setSelectedExchange(defaultsExchange[activeMarket]);

    // Set default quantities for paper trade panel
    const defaultQty: Record<AssetType, number> = {
      crypto: 0.1,
      forex: 1000,
      stock: 10,
      commodity: 1,
    };
    setTradeQuantity(defaultQty[activeMarket]);
    setTradeFeedback(null);
  }, [activeMarket]);

  useEffect(() => {
    // Sync cash on symbol changes
    const portfolio = paperTradingService.getPortfolio();
    setAvailableCash(portfolio.cash);
    setTradeFeedback(null);
  }, [selectedSymbol]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeMarket]);

  const loadWatchlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('watchlists')
      .select('symbol')
      .eq('user_id', user.id)
      .eq('asset_type', activeMarket);

    if (data) {
      setWatchlist((data as any[]).map((item: any) => item.symbol));
    }
  };

  const performSearch = async () => {
    const results = await searchSymbols(searchQuery, activeMarket);
    setSearchResults(results);
  };

  const handleSymbolSelect = (symbol: string, exchange?: string) => {
    setSelectedSymbol(symbol);
    setSelectedExchange(exchange);
    setShowSearch(false);
    setSearchQuery('');
  };

  const toggleWatchlist = async (symbol: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isInWatchlist = watchlist.includes(symbol);

    if (isInWatchlist) {
      await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .eq('asset_type', activeMarket)
        .eq('exchange', selectedExchange || 'default');
      
      setWatchlist(watchlist.filter((s) => s !== symbol));
    } else {
      await supabase.from('watchlists').insert({
        user_id: user.id,
        symbol,
        asset_type: activeMarket,
        exchange: selectedExchange || 'default',
      });
      
      setWatchlist([...watchlist, symbol]);
    }
  };

  // Handle placing a paper order
  const handlePlaceOrder = () => {
    if (currentPrice === null) return;
    setTradeFeedback(null);

    if (tradeType === 'BUY') {
      const res = paperTradingService.buyAsset(selectedSymbol, activeMarket, tradeQuantity, currentPrice);
      if (res.success) {
        setTradeFeedback({
          type: 'success',
          message: `Successfully executed BUY order for ${tradeQuantity} ${selectedSymbol} at $${currentPrice.toFixed(4)}`
        });
        setAvailableCash(paperTradingService.getPortfolio().cash);
      } else {
        setTradeFeedback({
          type: 'error',
          message: res.error || 'Failed to place buy order'
        });
      }
    } else {
      const res = paperTradingService.sellAsset(selectedSymbol, activeMarket, tradeQuantity, currentPrice);
      if (res.success) {
        setTradeFeedback({
          type: 'success',
          message: `Successfully executed SELL order for ${tradeQuantity} ${selectedSymbol} at $${currentPrice.toFixed(4)}`
        });
        setAvailableCash(paperTradingService.getPortfolio().cash);
      } else {
        setTradeFeedback({
          type: 'error',
          message: res.error || 'Failed to place sell order'
        });
      }
    }
  };

  // Adjust order quantities
  const adjustQuantity = (amount: number) => {
    setTradeQuantity(prev => {
      const newVal = prev + amount;
      return newVal > 0 ? Number(newVal.toFixed(4)) : prev;
    });
  };

  const markets: Array<{ type: AssetType; label: string }> = [
    { type: 'crypto', label: 'Crypto' },
    { type: 'forex', label: 'Forex' },
    { type: 'stock', label: 'Stocks (NSE)' },
    { type: 'commodity', label: 'Commodities (MCX)' },
  ];

  const estimatedTotal = currentPrice ? tradeQuantity * currentPrice : 0;

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      {/* Top Navigation */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 rounded-lg p-1">
            {markets.map((market) => (
              <button
                key={market.type}
                onClick={() => setActiveMarket(market.type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeMarket === market.type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {market.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:max-w-md z-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search symbol..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={`${result.symbol}-${result.exchange || 'default'}`}
                    onClick={() => handleSymbolSelect(result.symbol, result.exchange)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-gray-900 font-medium">{result.symbol}</div>
                      <div className="text-sm text-gray-600">{result.name}</div>
                      {result.exchange && (
                        <div className="text-xs text-gray-500 mt-1">{result.exchange}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Symbol Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedSymbol}</h2>
              {selectedExchange && (
                <span className="text-sm text-gray-500">{selectedExchange}</span>
              )}
            </div>
            {currentPrice !== null && (
              <div className="flex items-center space-x-2">
                <span className="text-xl font-mono text-gray-900">${currentPrice.toFixed(4)}</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleWatchlist(selectedSymbol)}
              className={`p-2 rounded-lg transition-colors ${
                watchlist.includes(selectedSymbol)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
              title={watchlist.includes(selectedSymbol) ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star className={`w-5 h-5 ${watchlist.includes(selectedSymbol) ? 'fill-current' : ''}`} />
            </button>
            <button
              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors"
              title="Create Alert"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Terminal Grid split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Chart Canvas */}
        <div className="flex-1 p-4 sm:p-6 lg:overflow-hidden min-h-[350px] sm:min-h-[450px] lg:min-h-0">
          <TradingViewChart
            symbol={selectedSymbol}
            assetType={activeMarket}
            exchange={selectedExchange}
            height={600}
            onPriceUpdate={setCurrentPrice}
          />
        </div>

        {/* Paper Trade Sidebar Panel */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 flex flex-col justify-between shadow-sm lg:overflow-y-auto shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Place Paper Order</h3>
              <p className="text-xs text-gray-500">Instant virtual trade simulator</p>
            </div>

            {/* Buy / Sell Tab Switches */}
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setTradeType('BUY')}
                className={`py-2 rounded-md font-semibold text-sm transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                className={`py-2 rounded-md font-semibold text-sm transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Quantity Input with increment buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => adjustQuantity(activeMarket === 'crypto' ? -0.01 : activeMarket === 'forex' ? -100 : -1)}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 text-gray-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(Math.max(0.0001, parseFloat(e.target.value) || 0))}
                  className="w-full text-center py-2 font-mono font-semibold text-gray-900 bg-white focus:outline-none"
                />
                <button
                  onClick={() => adjustQuantity(activeMarket === 'crypto' ? 0.01 : activeMarket === 'forex' ? 100 : 1)}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 text-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Asset Price</span>
                <span className="font-mono font-medium text-gray-900">
                  {currentPrice ? `$${currentPrice.toFixed(4)}` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Estimated Value</span>
                <span className="font-mono font-medium text-gray-900">${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Virtual Cash Available</span>
                <span className="font-mono font-semibold text-gray-900">${availableCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Feedback alert messages */}
            {tradeFeedback && (
              <div className={`p-4 rounded-lg flex items-start space-x-2 text-sm border ${
                tradeFeedback.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {tradeFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{tradeFeedback.message}</span>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={currentPrice === null}
            className={`w-full py-3 rounded-lg font-bold text-white text-base shadow transition-all flex items-center justify-center space-x-2 ${
              currentPrice === null
                ? 'bg-gray-400 cursor-not-allowed'
                : tradeType === 'BUY'
                ? 'bg-green-600 hover:bg-green-700 active:scale-98'
                : 'bg-red-600 hover:bg-red-700 active:scale-98'
            }`}
          >
            <span>Execute {tradeType}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
