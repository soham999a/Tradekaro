'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  EyeIcon,
  Cog6ToothIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getStockQuote, getIndexQuote, searchStocks, isMarketOpen, getMarketSession, getCurrentISTTime, type StockQuote } from '../lib/marketData';
import { TradingService } from '../services/tradingService';
import { useAuth } from '../context/AuthContext';
import webSocketService, { type MarketDataUpdate } from '../lib/websocketService';
import MarketDepth from './MarketDepth';
import AdvancedOrderPanel from './AdvancedOrderPanel';
import AdvancedTradingChart from './AdvancedTradingChart';
import AIChatbot from './AIChatbot';
import OptionsChain from './OptionsChain';
import OptionsTradingPanel from './OptionsTradingPanel';
import OptionsPositions from './OptionsPositions';
import OptionsStrategyBuilder from './OptionsStrategyBuilder';
import { type OptionContract, type OptionPosition } from '../services/optionsService';
import { NotificationService } from '../lib/notifications';

interface ProfessionalTradingProps {
  onBack: () => void;
}

interface OrderDetails {
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  orderType: 'BUY' | 'SELL';
  orderMode: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  triggerPrice?: number;
  validity: 'DAY' | 'IOC';
  product: 'CNC' | 'MIS' | 'NRML';
}

interface WatchlistStock extends StockQuote {
  isWatched: boolean;
}

interface StockWithPosition extends StockQuote {
  quantity?: number;
  averagePrice?: number;
  pnl?: number;
}

export default function ProfessionalTradingInterface({ onBack }: ProfessionalTradingProps) {
  const { user, userData, updateUserBalance } = useAuth();
  
  // Core States
  const [selectedStock, setSelectedStock] = useState<StockWithPosition | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'positions' | 'orders' | 'holdings'>('watchlist');
  
  // Order States
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    symbol: '',
    name: '',
    price: 0,
    quantity: 1,
    orderType: 'BUY',
    orderMode: 'MARKET',
    validity: 'DAY',
    product: 'CNC'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [marketSession, setMarketSession] = useState(getMarketSession());

  // Options trading state
  const [tradingMode, setTradingMode] = useState<'stocks' | 'options' | 'strategies'>('stocks');
  const [optionPositions, setOptionPositions] = useState<OptionPosition[]>([]);
  const [selectedOption, setSelectedOption] = useState<OptionContract | null>(null);
  const [optionAction, setOptionAction] = useState<'BUY' | 'SELL'>('BUY');
  const [showOptionPanel, setShowOptionPanel] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentISTTime());
  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAdvancedOrder, setShowAdvancedOrder] = useState(false);
  const [realtimePrices, setRealtimePrices] = useState<Map<string, MarketDataUpdate>>(new Map());

  // Initialize with popular Indian stocks
  useEffect(() => {
    const initializeWatchlist = async () => {
      // Popular indices
      const popularIndices = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SENSEX'];

      // Popular stocks
      const popularStocks = [
        'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC',
        'HINDUNILVR', 'KOTAKBANK', 'LT', 'HCLTECH', 'ASIANPAINT', 'AXISBANK', 'MARUTI',
        'SUNPHARMA', 'TITAN', 'ULTRACEMCO', 'WIPRO', 'NESTLEIND'
      ];

      // Get index data
      const indexData = await Promise.all(
        popularIndices.map(async (symbol) => {
          const quote = await getIndexQuote(symbol);
          return quote ? { ...quote, isWatched: true } : null;
        })
      );

      // Get stock data
      const stockData = await Promise.all(
        popularStocks.map(async (symbol) => {
          const quote = await getStockQuote(symbol);
          return quote ? { ...quote, isWatched: true } : null;
        })
      );

      // Combine indices and stocks, with indices first
      const allData = [...indexData, ...stockData].filter(Boolean) as WatchlistStock[];
      setWatchlist(allData);
    };

    initializeWatchlist();
    loadPositions();
    loadOrders();
    setMarketOpen(isMarketOpen());

    const interval = setInterval(() => {
      setMarketOpen(isMarketOpen());
      setMarketSession(getMarketSession());
      setCurrentTime(getCurrentISTTime());
      // Refresh positions and orders
      loadPositions();
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Separate useEffect for watchlist price updates
  useEffect(() => {
    if (watchlist.length === 0) return;

    const watchlistInterval = setInterval(() => {
      refreshWatchlistPrices();
    }, 10000); // Refresh watchlist every 10 seconds

    return () => clearInterval(watchlistInterval);
  }, [watchlist.length]); // Only depend on length to avoid infinite loops

  const refreshWatchlistPrices = async () => {
    // Only refresh if we have watchlist items
    if (watchlist.length === 0) return;

    try {
      // Get fresh quotes for all watchlist items (indices and stocks)
      const updatedStocks = await Promise.all(
        watchlist.map(async (stock) => {
          try {
            // Try index quote first, then stock quote
            let quote = await getIndexQuote(stock.symbol);
            if (!quote) {
              quote = await getStockQuote(stock.symbol);
            }
            return quote ? { ...quote, isWatched: true } : stock;
          } catch (error) {
            console.error(`Error refreshing ${stock.symbol}:`, error);
            return stock;
          }
        })
      );

      setWatchlist(updatedStocks as WatchlistStock[]);
    } catch (error) {
      console.error('Error refreshing watchlist:', error);
    }
  };

  const loadPositions = async () => {
    if (user) {
      const userPositions = await TradingService.getUserPositions(user.uid);
      setPositions(userPositions);
    }
  };

  const loadOrders = async () => {
    if (user) {
      const userOrders = await TradingService.getUserOrders(user.uid);
      setOrders(userOrders);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsLoading(true);
      try {
        const results = await searchStocks(query);
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

  const handleStockSelect = (stock: StockQuote) => {
    setSelectedStock(stock);
    setOrderDetails(prev => ({
      ...prev,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price
    }));
    setShowOrderPanel(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedStock) return;

    setIsLoading(true);
    try {
      // Validate lot size for indices
      if (selectedStock.isIndex && selectedStock.lotSize && orderDetails.quantity % selectedStock.lotSize !== 0) {
        NotificationService.indexLotSizeError(selectedStock.symbol, selectedStock.lotSize, orderDetails.quantity);
        setIsLoading(false);
        return;
      }

      const orderValue = orderDetails.quantity * (orderDetails.orderMode === 'MARKET' ? selectedStock.price : orderDetails.price);
      const requiredAmount = selectedStock.isIndex && selectedStock.marginRequired ?
        Math.ceil(orderDetails.quantity / (selectedStock.lotSize || 1)) * selectedStock.marginRequired :
        orderValue;

      // Validation for BUY orders
      if (orderDetails.orderType === 'BUY' && userData && userData.balance < requiredAmount) {
        NotificationService.insufficientBalance(requiredAmount, userData.balance, selectedStock.isIndex);
        setIsLoading(false);
        return;
      }

      // Validation for SELL orders
      if (orderDetails.orderType === 'SELL') {
        const position = positions.find(p => p.symbol === selectedStock.symbol && p.product === orderDetails.product);
        if (!position) {
          NotificationService.error(`No ${orderDetails.product} position found for ${selectedStock.symbol}. You need to buy shares first.`);
          return;
        }
        if (position.quantity < orderDetails.quantity) {
          NotificationService.error(`Insufficient quantity. Available: ${position.quantity}, Requested: ${orderDetails.quantity}`);
          return;
        }
      }

      const result = await TradingService.placeEnhancedOrder({
        symbol: orderDetails.symbol,
        type: orderDetails.orderType,
        quantity: orderDetails.quantity,
        price: orderDetails.orderMode === 'MARKET' ? selectedStock.price : orderDetails.price,
        orderMode: orderDetails.orderMode,
        product: orderDetails.product,
        validity: orderDetails.validity,
        triggerPrice: orderDetails.triggerPrice
      });

      if (result.success) {
        NotificationService.tradeSuccess(
          selectedStock.symbol,
          orderDetails.orderType,
          orderDetails.quantity,
          orderDetails.orderMode === 'MARKET' ? selectedStock.price : orderDetails.price,
          selectedStock.isIndex
        );
        
        // Update balance
        if (orderDetails.orderType === 'BUY') {
          await updateUserBalance(userData!.balance - orderValue);
        } else {
          await updateUserBalance(userData!.balance + orderValue);
        }
        
        setShowOrderPanel(false);
        setOrderDetails({
          symbol: '',
          name: '',
          price: 0,
          quantity: 1,
          orderType: 'BUY',
          orderMode: 'MARKET',
          validity: 'DAY',
          product: 'CNC'
        });

        // Refresh positions and orders
        loadPositions();
        loadOrders();
      } else {
        NotificationService.error('Order failed. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);
      NotificationService.error('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = (stock: StockQuote) => {
    const exists = watchlist.find(w => w.symbol === stock.symbol);
    if (!exists) {
      setWatchlist(prev => [...prev, { ...stock, isWatched: true }]);
      NotificationService.success(`${stock.symbol} added to watchlist`);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
    NotificationService.success(`${symbol} removed from watchlist`);
  };

  const handleClosePosition = async (position: any) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to close your entire position in ${position.symbol}?\n\n` +
        `Quantity: ${position.quantity} shares\n` +
        `Average Price: ₹${position.averagePrice.toFixed(2)}\n` +
        `Current Price: ₹${position.currentPrice.toFixed(2)}\n` +
        `Current P&L: ${position.pnl >= 0 ? '+' : ''}₹${position.pnl.toFixed(2)}\n\n` +
        `This will place a MARKET SELL order for all ${position.quantity} shares.`
      );

      if (!confirmed) return;

      setIsLoading(true);

      const result = await TradingService.closePosition(
        position.symbol,
        position.product,
        position.currentPrice
      );

      if (result.success) {
        NotificationService.success(`Position closed successfully!`);

        // Refresh data
        await Promise.all([
          loadPositions(),
          loadOrders()
        ]);
      } else {
        NotificationService.error(result.message);
      }
    } catch (error) {
      console.error('Error closing position:', error);
      NotificationService.error('Failed to close position');
    } finally {
      setIsLoading(false);
    }
  };

  // Options trading functions
  const handleOptionSelect = (option: OptionContract, action: 'BUY' | 'SELL') => {
    setSelectedOption(option);
    setOptionAction(action);
    setShowOptionPanel(true);
  };

  const handleOptionOrder = async (orderData: any) => {
    try {
      setIsLoading(true);

      // Simulate option order placement
      const orderId = `OPT${Date.now()}`;
      const newOrder = {
        id: orderId,
        symbol: orderData.symbol,
        type: 'OPTION',
        optionType: orderData.optionType,
        strike: orderData.strike,
        expiry: orderData.expiry,
        action: orderData.action,
        quantity: orderData.quantity,
        premium: orderData.premium,
        status: 'EXECUTED',
        timestamp: new Date(),
        margin: orderData.margin
      };

      setOrders(prev => [newOrder, ...prev]);

      // Create option position
      const newPosition: OptionPosition = {
        id: `POS${Date.now()}`,
        contractId: selectedOption?.id || '',
        symbol: orderData.symbol,
        strike: orderData.strike,
        expiry: orderData.expiry,
        type: orderData.optionType,
        action: orderData.action,
        quantity: orderData.quantity,
        entryPremium: orderData.premium,
        currentPremium: orderData.premium,
        lotSize: orderData.lotSize,
        pnl: 0,
        pnlPercent: 0,
        margin: orderData.margin,
        createdAt: new Date().toISOString(),
        status: 'OPEN'
      };

      setOptionPositions(prev => [...prev, newPosition]);

      NotificationService.success(`Option ${orderData.action} order executed successfully!`);
      setShowOptionPanel(false);
    } catch (error) {
      console.error('Option order error:', error);
      NotificationService.error('Failed to place option order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseOptionPosition = (positionId: string) => {
    setOptionPositions(prev => prev.filter(pos => pos.id !== positionId));
    NotificationService.success('Option position closed successfully!');
  };

  const handleSquareOffOption = (positionId: string) => {
    const position = optionPositions.find(pos => pos.id === positionId);
    if (position) {
      // Simulate square off by creating opposite order
      const oppositeAction = position.action === 'BUY' ? 'SELL' : 'BUY';
      NotificationService.success(`Option position squared off at market price`);
      handleCloseOptionPosition(positionId);
    }
  };

  const handleExecuteStrategy = (strategy: any) => {
    NotificationService.success(`Strategy "${strategy.name}" executed successfully!`);
    // In a real implementation, this would create multiple option positions
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trading</h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              marketSession.session.includes('Open')
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {marketSession.session}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                IST: {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{marketSession.timeToNext}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Available Balance</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{userData?.balance?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Sidebar - Watchlist & Search - Mobile: Full width, Desktop: Fixed width */}
        <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col lg:max-h-[calc(100vh-80px)]">
          {/* Search */}
          <div className="p-4 lg:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 lg:py-2 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base lg:text-sm"
              />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full lg:w-72 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl lg:rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock)}
                    className="w-full px-4 py-4 lg:py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 active:bg-gray-100 dark:active:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white text-base lg:text-sm">{stock.symbol}</div>
                          {stock.isIndex && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                              INDEX
                            </span>
                          )}
                        </div>
                        <div className="text-sm lg:text-xs text-gray-500 dark:text-gray-400 truncate">{stock.name}</div>
                        {stock.isIndex && stock.lotSize && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Lot Size: {stock.lotSize}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-medium text-gray-900 dark:text-white text-base lg:text-sm">₹{stock.price.toFixed(2)}</div>
                        <div className={`text-sm lg:text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { key: 'watchlist', label: 'Watchlist', icon: EyeIcon },
              { key: 'positions', label: 'Positions', icon: ChartBarIcon },
              { key: 'orders', label: 'Orders', icon: ClockIcon },
              { key: 'holdings', label: 'Holdings', icon: BanknotesIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mx-auto mb-1" />
                {label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'watchlist' && (
              <div className="p-2">
                {watchlist.map((stock) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    onClick={() => handleStockSelect(stock)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">₹{stock.price.toFixed(2)}</div>
                        <div className={`text-xs flex items-center ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? (
                            <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                          )}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'positions' && (
              <div className="p-2">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No positions yet</p>
                  </div>
                ) : (
                  positions.map((position) => (
                    <div
                      key={`${position.symbol}-${position.product}`}
                      className="p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{position.symbol}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {position.quantity} shares • Avg: ₹{position.averagePrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              ₹{(position.quantity * position.currentPrice).toFixed(2)}
                            </div>
                            <div className={`text-xs ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              // Convert position to StockQuote format
                              try {
                                const stockQuote = await getStockQuote(position.symbol);
                                if (stockQuote) {
                                  // Add position-specific properties to the stock quote
                                  const stockWithPosition: StockWithPosition = {
                                    ...stockQuote,
                                    quantity: position.quantity,
                                    averagePrice: position.averagePrice,
                                    pnl: position.pnl
                                  };
                                  setSelectedStock(stockWithPosition);
                                } else {
                                  // Fallback: create a minimal StockQuote from position data
                                  const fallbackStock: StockQuote = {
                                    symbol: position.symbol,
                                    name: position.symbol, // Use symbol as name fallback
                                    price: position.currentPrice,
                                    change: 0, // We don't have this data
                                    changePercent: 0, // We don't have this data
                                    high: position.currentPrice,
                                    low: position.currentPrice,
                                    open: position.currentPrice,
                                    previousClose: position.currentPrice,
                                    volume: 0, // We don't have this data
                                    source: 'MOCK'
                                  };
                                  const stockWithPosition: StockWithPosition = {
                                    ...fallbackStock,
                                    quantity: position.quantity,
                                    averagePrice: position.averagePrice,
                                    pnl: position.pnl
                                  };
                                  setSelectedStock(stockWithPosition);
                                }
                                setOrderDetails(prev => ({ ...prev, orderType: 'SELL' }));
                                setShowOrderPanel(true);
                              } catch (error) {
                                console.error('Error loading stock quote:', error);
                                NotificationService.error('Failed to load stock details');
                              }
                            }}
                            className="flex-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                          >
                            Sell
                          </button>
                          <button
                            onClick={() => handleClosePosition(position)}
                            className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            title={`Close entire position (${position.quantity} shares)`}
                          >
                            Close All
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="p-2">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No orders yet</p>
                  </div>
                ) : (
                  orders.slice(0, 10).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{order.symbol}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.type} • {order.quantity} shares • {order.orderMode}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded ${
                            order.status === 'EXECUTED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {order.status}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ₹{order.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'holdings' && (
              <div className="p-2">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BanknotesIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Holdings feature coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Trading Mode Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1 p-4">
              {[
                { id: 'stocks', label: 'Stocks', icon: '📈' },
                { id: 'options', label: 'Options', icon: '⚡' },
                { id: 'strategies', label: 'Strategies', icon: '🎯' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setTradingMode(mode.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    tradingMode === mode.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedStock ? (
            <div className="flex-1 p-6">
              {/* Stock Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStock.symbol}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹{selectedStock.price.toFixed(2)}
                    </div>
                    <div className={`text-lg flex items-center justify-end ${
                      selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedStock.change >= 0 ? (
                        <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                      )}
                      {selectedStock.change >= 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                
                {/* Stock Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Open</div>
                    <div className="font-medium text-gray-900 dark:text-white">₹{selectedStock.open.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">High</div>
                    <div className="font-medium text-gray-900 dark:text-white">₹{selectedStock.high.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Low</div>
                    <div className="font-medium text-gray-900 dark:text-white">₹{selectedStock.low.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Volume</div>
                    <div className="font-medium text-gray-900 dark:text-white">{selectedStock.volume.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => {
                    setOrderDetails(prev => ({ ...prev, orderType: 'BUY' }));
                    setShowOrderPanel(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  Quick BUY
                </button>
                <button
                  onClick={() => {
                    setOrderDetails(prev => ({ ...prev, orderType: 'SELL' }));
                    setShowOrderPanel(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  Quick SELL
                </button>
                <button
                  onClick={() => setShowAdvancedOrder(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  Advanced Order
                </button>
                <button
                  onClick={() => addToWatchlist(selectedStock)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  <StarIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Trading Mode Content */}
              {tradingMode === 'stocks' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Advanced Trading Chart */}
                  <div className="lg:col-span-2">
                    <AdvancedTradingChart symbol={selectedStock.symbol} />
                  </div>

                  {/* Market Depth */}
                  <div className="lg:col-span-1">
                    <MarketDepth symbol={selectedStock.symbol} />
                  </div>
                </div>
              )}

              {tradingMode === 'options' && (
                <div className="space-y-6">
                  {/* Options Chain */}
                  <OptionsChain
                    symbol={selectedStock.symbol}
                    spotPrice={selectedStock.price}
                    onOptionSelect={handleOptionSelect}
                  />

                  {/* Options Positions */}
                  {optionPositions.length > 0 && (
                    <OptionsPositions
                      positions={optionPositions}
                      onClosePosition={handleCloseOptionPosition}
                      onSquareOff={handleSquareOffOption}
                    />
                  )}
                </div>
              )}

              {tradingMode === 'strategies' && (
                <div className="space-y-6">
                  {/* Strategy Builder */}
                  <OptionsStrategyBuilder
                    symbol={selectedStock.symbol}
                    spotPrice={selectedStock.price}
                    onExecuteStrategy={handleExecuteStrategy}
                  />

                  {/* Options Positions */}
                  {optionPositions.length > 0 && (
                    <OptionsPositions
                      positions={optionPositions}
                      onClosePosition={handleCloseOptionPosition}
                      onSquareOff={handleSquareOffOption}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a stock to start trading</h3>
                <p>Search for stocks or select from your watchlist</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Panel Modal - Mobile Optimized */}
      <AnimatePresence>
        {showOrderPanel && selectedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 p-0 lg:p-4"
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-gray-800 rounded-t-3xl lg:rounded-2xl p-6 w-full max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Mobile Handle */}
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 lg:hidden"></div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl lg:text-lg font-bold text-gray-900 dark:text-white">
                    {orderDetails.orderType} {selectedStock.symbol}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Current Price: ₹{selectedStock.price.toFixed(2)}
                  </p>
                  {orderDetails.orderType === 'SELL' && selectedStock.quantity && (
                    <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        <strong>Available:</strong> {selectedStock.quantity} shares
                      </p>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        <strong>Avg Price:</strong> ₹{selectedStock.averagePrice?.toFixed(2)}
                      </p>
                      {selectedStock.pnl !== undefined && (
                        <p className={`text-sm ${selectedStock.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <strong>Current P&L:</strong> {selectedStock.pnl >= 0 ? '+' : ''}₹{selectedStock.pnl.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowOrderPanel(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Type */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setOrderDetails(prev => ({ ...prev, orderType: 'BUY' }))}
                    className={`flex-1 py-4 lg:py-3 px-4 rounded-xl lg:rounded-lg font-semibold text-base lg:text-sm transition-all duration-200 ${
                      orderDetails.orderType === 'BUY'
                        ? 'bg-green-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => setOrderDetails(prev => ({ ...prev, orderType: 'SELL' }))}
                    className={`flex-1 py-4 lg:py-3 px-4 rounded-xl lg:rounded-lg font-semibold text-base lg:text-sm transition-all duration-200 ${
                      orderDetails.orderType === 'SELL'
                        ? 'bg-red-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    SELL
                  </button>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-base lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        const lotSize = selectedStock?.lotSize || 1;
                        const newQuantity = Math.max(lotSize, orderDetails.quantity - lotSize);
                        setOrderDetails(prev => ({ ...prev, quantity: newQuantity }));
                      }}
                      className="p-3 lg:p-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
                    >
                      <MinusIcon className="h-5 w-5 lg:h-4 lg:w-4" />
                    </button>
                    <input
                      type="number"
                      min={selectedStock?.lotSize || 1}
                      step={selectedStock?.lotSize || 1}
                      value={orderDetails.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const lotSize = selectedStock?.lotSize || 1;
                        // Round to nearest lot size for indices
                        const adjustedValue = selectedStock?.isIndex ?
                          Math.max(lotSize, Math.round(value / lotSize) * lotSize) :
                          Math.max(1, value);
                        setOrderDetails(prev => ({ ...prev, quantity: adjustedValue }));
                      }}
                      className="flex-1 px-4 py-3 lg:py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg lg:text-base font-semibold"
                    />
                    <button
                      onClick={() => {
                        const lotSize = selectedStock?.lotSize || 1;
                        setOrderDetails(prev => ({ ...prev, quantity: prev.quantity + lotSize }));
                      }}
                      className="p-3 lg:p-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
                    >
                      <PlusIcon className="h-5 w-5 lg:h-4 lg:w-4" />
                    </button>
                  </div>

                  {/* Lot Size Info for Indices */}
                  {selectedStock?.isIndex && selectedStock.lotSize && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                      Index lot size: {selectedStock.lotSize} units
                      {orderDetails.quantity % selectedStock.lotSize !== 0 && (
                        <div className="text-red-500 mt-1">
                          Quantity must be in multiples of {selectedStock.lotSize}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Order Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Type
                  </label>
                  <select
                    value={orderDetails.orderMode}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, orderMode: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                    <option value="SL">Stop Loss</option>
                    <option value="SL-M">Stop Loss Market</option>
                  </select>
                </div>

                {/* Price (for limit orders) */}
                {orderDetails.orderMode === 'LIMIT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Limit Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={orderDetails.price}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product
                  </label>
                  <select
                    value={orderDetails.product}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, product: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CNC">CNC (Cash & Carry)</option>
                    <option value="MIS">MIS (Intraday)</option>
                    <option value="NRML">NRML (Normal)</option>
                  </select>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Order Value</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{(orderDetails.quantity * (orderDetails.orderMode === 'MARKET' ? selectedStock.price : orderDetails.price)).toLocaleString()}
                    </span>
                  </div>

                  {/* Show margin requirement for indices */}
                  {selectedStock?.isIndex && selectedStock.marginRequired && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Margin Required</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        ₹{(Math.ceil(orderDetails.quantity / (selectedStock.lotSize || 1)) * selectedStock.marginRequired).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Available Balance</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{userData?.balance?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className={`w-full py-4 lg:py-3 px-6 rounded-2xl lg:rounded-xl font-bold text-lg lg:text-base transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${
                    orderDetails.orderType === 'BUY'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    `${orderDetails.orderType} ${orderDetails.quantity} ${selectedStock?.isIndex ? 'units' : 'shares'}`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Order Panel */}
      <AnimatePresence>
        {showAdvancedOrder && selectedStock && (
          <AdvancedOrderPanel
            symbol={selectedStock.symbol}
            currentPrice={selectedStock.price}
            onClose={() => setShowAdvancedOrder(false)}
            onPlaceOrder={async (orderData) => {
              try {
                setIsLoading(true);
                const result = await TradingService.placeEnhancedOrder(orderData);

                if (result.success) {
                  NotificationService.success(result.message);
                  setShowAdvancedOrder(false);
                  loadPositions();
                  loadOrders();
                } else {
                  NotificationService.error('Advanced order failed. Please try again.');
                }
              } catch (error) {
                console.error('Advanced order error:', error);
                NotificationService.error('Failed to place advanced order');
              } finally {
                setIsLoading(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Options Trading Panel */}
      <AnimatePresence>
        {showOptionPanel && selectedOption && (
          <OptionsTradingPanel
            option={selectedOption}
            action={optionAction}
            spotPrice={selectedStock?.price || 0}
            onClose={() => setShowOptionPanel(false)}
            onPlaceOrder={handleOptionOrder}
          />
        )}
      </AnimatePresence>

      {/* AI Chatbot with Stock Context */}
      <AIChatbot
        marketContext={{
          marketSession: marketSession.session,
          userPortfolio: positions,
          watchlist: watchlist.map(stock => stock.symbol),
          recentTrades: orders.slice(0, 5)
        }}
        currentStock={selectedStock ? {
          symbol: selectedStock.symbol,
          price: selectedStock.price,
          change: selectedStock.change,
          changePercent: selectedStock.changePercent,
          volume: selectedStock.volume || 0
        } : undefined}
      />
    </div>
  );
}
