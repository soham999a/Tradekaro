'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStockQuote, getIndexQuote, searchStocks, isMarketOpen, type StockQuote } from '../lib/marketData';
import { EnhancedMarketDataService } from '../lib/enhancedMarketData';
import { TradingService } from '../services/tradingService';
import { useAuth } from '../context/AuthContext';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { NotificationService } from '../lib/notifications';

interface TradingInterfaceProps {
  onBack: () => void;
}

export default function TradingInterface({ onBack }: TradingInterfaceProps) {
  const { user, userData, updateUserBalance } = useAuth();
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
        const results = await EnhancedMarketDataService.searchStocks(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        NotificationService.error('Error searching stocks');
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
      const quote = await EnhancedMarketDataService.getStockQuote(symbol);
      if (quote) {
        setSelectedStock(quote);
        setLimitPrice(quote.price);
        setSearchResults([]);
        setSearchQuery('');
        NotificationService.success(`🎯 Selected ${quote.symbol} - ${quote.source} data`);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      NotificationService.error('Error fetching stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedStock || !user) return;

    const orderPrice = orderMode === 'MARKET' ? selectedStock.price : limitPrice;
    const totalValue = orderPrice * quantity;

    // Validation
    if (quantity <= 0) {
      NotificationService.error('Please enter a valid quantity');
      return;
    }

    // Validate lot size for indices
    if (selectedStock.isIndex && selectedStock.lotSize && quantity % selectedStock.lotSize !== 0) {
      NotificationService.indexLotSizeError(selectedStock.symbol, selectedStock.lotSize, quantity);
      return;
    }

    if (orderMode === 'LIMIT' && limitPrice <= 0) {
      NotificationService.error('Please enter a valid limit price');
      return;
    }

    setIsLoading(true);
    try {
      const result = await TradingService.executeTrade(
        user.uid,
        selectedStock.symbol,
        orderType,
        quantity,
        orderMode,
        orderMode === 'LIMIT' ? limitPrice : undefined
      );

      if (result.success) {
        NotificationService.tradeSuccess(
          selectedStock.symbol,
          orderType,
          quantity,
          orderMode === 'MARKET' ? selectedStock.price : limitPrice,
          selectedStock.isIndex
        );
        // Reset form
        setQuantity(1);
        setOrderMode('MARKET');
        setLimitPrice(0);
        // Refresh user balance (this will be handled by the auth context)
      } else {
        NotificationService.error(result.message);
      }
    } catch (error) {
      console.error('Order error:', error);
      NotificationService.error('Error placing order');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedStock) return 0;
    return orderMode === 'MARKET' 
      ? selectedStock.price * quantity 
      : limitPrice * quantity;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="mr-6 flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </motion.button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Trading Terminal
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Professional Trading Interface
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                marketOpen 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <span className="mr-1">🕒</span>
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
                🔍 Search Stocks
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for stocks (e.g., RELIANCE, TCS, INFY)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                />
              </div>

              {/* Search Results */}
              {isLoading && (
                <div className="mt-4 text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Searching...</p>
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white text-lg">
                              {stock.symbol}
                            </p>
                            {stock.isIndex && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                INDEX
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {stock.name}
                          </p>
                          {stock.isIndex && stock.lotSize && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Lot Size: {stock.lotSize}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white text-lg">
                            ₹{stock.price.toFixed(2)}
                          </p>
                          <p className={`text-sm flex items-center justify-end ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span className="mr-1">{stock.change >= 0 ? '📈' : '📉'}</span>
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
                  📊 Stock Details
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Symbol</p>
                    <p className="text-xl font-medium text-gray-900 dark:text-white">
                      {selectedStock.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                    <p className="text-xl font-medium text-gray-900 dark:text-white">
                      ₹{selectedStock.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Change</p>
                    <p className={`text-xl font-medium ${
                      selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedStock.change >= 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Change %</p>
                    <p className={`text-xl font-medium ${
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
                💰 Place Order
              </h3>

              {selectedStock ? (
                <div className="space-y-6">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOrderType('BUY')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                          orderType === 'BUY'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        🟢 BUY
                      </button>
                      <button
                        onClick={() => setOrderType('SELL')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                          orderType === 'SELL'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        🔴 SELL
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity {selectedStock?.isIndex && selectedStock.lotSize && `(Lot Size: ${selectedStock.lotSize})`}
                    </label>
                    <input
                      type="number"
                      min={selectedStock?.lotSize || 1}
                      step={selectedStock?.lotSize || 1}
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const lotSize = selectedStock?.lotSize || 1;
                        // Round to nearest lot size for indices
                        const adjustedValue = selectedStock?.isIndex ?
                          Math.max(lotSize, Math.round(value / lotSize) * lotSize) :
                          Math.max(1, value);
                        setQuantity(adjustedValue);
                      }}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                    />
                    {selectedStock?.isIndex && selectedStock.lotSize && quantity % selectedStock.lotSize !== 0 && (
                      <p className="text-red-500 text-sm mt-1">
                        Quantity must be in multiples of {selectedStock.lotSize}
                      </p>
                    )}
                  </div>

                  {/* Order Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOrderMode('MARKET')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                          orderMode === 'MARKET'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        📊 Market
                      </button>
                      <button
                        onClick={() => setOrderMode('LIMIT')}
                        className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                          orderMode === 'LIMIT'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        🎯 Limit
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
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                      />
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Value:</span>
                      <span className="font-medium text-gray-900 dark:text-white text-lg">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!marketOpen || isLoading}
                    className={`w-full py-4 px-4 rounded-lg font-medium transition-colors text-lg ${
                      marketOpen && !isLoading
                        ? orderType === 'BUY'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : marketOpen ? (
                      `🚀 Place ${orderType} Order`
                    ) : (
                      '🔒 Market Closed'
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">💰</span>
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
