import { useState, useEffect } from 'react';
import { Search, TrendingUp, Star, Bell } from 'lucide-react';
import { TradingViewChart, AssetType } from './TradingViewChart';
import { searchSymbols } from '../services/dataFeed';
import { supabase } from '../lib/supabase';

export function MarketDashboard() {
  const [activeMarket, setActiveMarket] = useState<AssetType>('crypto');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [selectedExchange, setSelectedExchange] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; exchange?: string }>>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

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
  }, [activeMarket]);

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

  const markets: Array<{ type: AssetType; label: string }> = [
    { type: 'crypto', label: 'Crypto' },
    { type: 'forex', label: 'Forex' },
    { type: 'stock', label: 'Stocks (NSE)' },
    { type: 'commodity', label: 'Commodities (MCX)' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      {/* Top Navigation */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
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
          <div className="relative flex-1 max-w-md mx-4">
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

      {/* Chart */}
      <div className="flex-1 p-6 overflow-hidden">
        <TradingViewChart
          symbol={selectedSymbol}
          assetType={activeMarket}
          exchange={selectedExchange}
          height={600}
          onPriceUpdate={setCurrentPrice}
        />
      </div>
    </div>
  );
}

