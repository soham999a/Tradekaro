'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Clock, ArrowLeft } from 'lucide-react';
import { getStockQuote, searchStocks, isMarketOpen, type StockQuote } from '../lib/marketData';
import toast, { Toaster } from 'react-hot-toast';

interface TradingInterfaceProps {
  onBack: () => void;
}

export default function TradingInterface({ onBack }: TradingInterfaceProps) {
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState(1);
  const [orderMode, setOrderMode] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    setMarketOpen(isMarketOpen());
    const interval = setInterval(() => {
      setMarketOpen(isMarketOpen());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsLoading(true);
      try {
        const results = await searchStocks(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Error searching stocks');
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleStockSelect = async (symbol: string) => {
    setIsLoading(true);
    try {
      const quote = await getStockQuote(symbol);
      if (quote) {
        setSelectedStock(quote);
        setLimitPrice(quote.price);
        setSearchResults([]);
        setSearchQuery('');
        toast.success(`Selected ${quote.symbol}`);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Error fetching stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedStock) return;

    const orderValue = orderMode === 'MARKET' 
      ? selectedStock.price * quantity 
      : limitPrice * quantity;

    const orderData = {
      stock: selectedStock,
      type: orderType,
      quantity,
      price: orderMode === 'MARKET' ? selectedStock.price : limitPrice,
      orderMode,
      totalValue: orderValue
    };

    // Simulate order placement
    toast.success(
      `${orderType} order placed!\n${quantity} shares of ${selectedStock.symbol}\nTotal: ₹${orderValue.toLocaleString()}`,
      { duration: 4000 }
    );

    // Reset form
    setQuantity(1);
    setOrderMode('MARKET');
  };

  const calculateTotal = () => {
    if (!selectedStock) return 0;
    return orderMode === 'MARKET' 
      ? selectedStock.price * quantity 
      : limitPrice * quantity;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                📈 TradeKaro
              </h1>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Trading Interface
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                marketOpen 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <Clock className="h-4 w-4 mr-1" />
                {marketOpen ? 'Market Open' : 'Market Closed'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock Search */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Search Stocks
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for stocks (e.g., RELIANCE, TCS, INFY)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Search Results */}
              {isLoading && (
                <div className="mt-4 text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock.symbol)}
                      className="p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {stock.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            ₹{stock.price.toFixed(2)}
                          </p>
                          <p className={`text-sm flex items-center ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Stock Details */}
            {selectedStock && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Stock Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Symbol</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedStock.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      ₹{selectedStock.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Change</p>
                    <p className={`text-lg font-medium ${
                      selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedStock.change >= 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Change %</p>
                    <p className={`text-lg font-medium ${
                      selectedStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      ₹{selectedStock.high.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      ₹{selectedStock.low.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Place Order
              </h3>

              {selectedStock ? (
                <div className="space-y-4">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOrderType('BUY')}
                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                          orderType === 'BUY'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => setOrderType('SELL')}
                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                          orderType === 'SELL'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Order Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOrderMode('MARKET')}
                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                          orderMode === 'MARKET'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Market
                      </button>
                      <button
                        onClick={() => setOrderMode('LIMIT')}
                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                          orderMode === 'LIMIT'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Limit
                      </button>
                    </div>
                  </div>

                  {/* Limit Price */}
                  {orderMode === 'LIMIT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Limit Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Value:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!marketOpen}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      marketOpen
                        ? orderType === 'BUY'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {marketOpen ? `Place ${orderType} Order` : 'Market Closed'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Search and select a stock to start trading
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
