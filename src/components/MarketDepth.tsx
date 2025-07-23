'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  SignalIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import webSocketService, { type OrderBookUpdate } from '../lib/websocketService';

interface MarketDepthProps {
  symbol: string;
  className?: string;
}

interface OrderBookLevel {
  price: number;
  quantity: number;
  total?: number;
}

export default function MarketDepth({ symbol, className = '' }: MarketDepthProps) {
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    timestamp: number;
  }>({
    bids: [],
    asks: [],
    timestamp: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    setIsConnected(webSocketService.isWebSocketConnected());

    const unsubscribe = webSocketService.subscribeToOrderBook(symbol, (data: OrderBookUpdate) => {
      // Calculate cumulative quantities
      let bidTotal = 0;
      let askTotal = 0;

      const bidsWithTotal = data.bids.map(bid => {
        bidTotal += bid.quantity;
        return { ...bid, total: bidTotal };
      });

      const asksWithTotal = data.asks.map(ask => {
        askTotal += ask.quantity;
        return { ...ask, total: askTotal };
      });

      setOrderBook({
        bids: bidsWithTotal,
        asks: asksWithTotal,
        timestamp: data.timestamp
      });
      setLastUpdate(Date.now());
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  const formatQuantity = (qty: number) => {
    if (qty >= 1000000) return `${(qty / 1000000).toFixed(1)}M`;
    if (qty >= 1000) return `${(qty / 1000).toFixed(1)}K`;
    return qty.toString();
  };

  const getSpread = () => {
    if (orderBook.asks.length > 0 && orderBook.bids.length > 0) {
      return orderBook.asks[0].price - orderBook.bids[0].price;
    }
    return 0;
  };

  const getSpreadPercent = () => {
    if (orderBook.asks.length > 0 && orderBook.bids.length > 0) {
      const midPrice = (orderBook.asks[0].price + orderBook.bids[0].price) / 2;
      return ((getSpread() / midPrice) * 100);
    }
    return 0;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SignalIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Depth</h3>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{symbol}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 text-xs ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <WifiIcon className="h-4 w-4" />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            {lastUpdate > 0 && (
              <motion.div
                key={lastUpdate}
                initial={{ scale: 1.2, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
            )}
          </div>
        </div>

        {/* Spread Info */}
        {orderBook.bids.length > 0 && orderBook.asks.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              Spread: ₹{getSpread().toFixed(2)} ({getSpreadPercent().toFixed(3)}%)
            </div>
            <div className="text-gray-500 dark:text-gray-500 text-xs">
              Last updated: {new Date(orderBook.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Order Book */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          
          {/* Bids (Buy Orders) */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-semibold text-green-600">Bids (Buy)</h4>
            </div>
            
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 pb-1 border-b border-gray-200 dark:border-gray-700">
                <div>Price</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Total</div>
              </div>
              
              {/* Bid Levels */}
              <AnimatePresence>
                {orderBook.bids.map((bid, index) => (
                  <motion.div
                    key={`bid-${bid.price}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative grid grid-cols-3 gap-2 text-xs py-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  >
                    {/* Background bar showing relative quantity */}
                    <div 
                      className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded"
                      style={{ 
                        width: `${(bid.quantity / Math.max(...orderBook.bids.map(b => b.quantity))) * 100}%`,
                        opacity: 0.3
                      }}
                    />
                    
                    <div className="relative font-medium text-green-700 dark:text-green-400">
                      ₹{bid.price.toFixed(2)}
                    </div>
                    <div className="relative text-right text-gray-900 dark:text-white">
                      {formatQuantity(bid.quantity)}
                    </div>
                    <div className="relative text-right text-gray-600 dark:text-gray-400">
                      {formatQuantity(bid.total || 0)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-semibold text-red-600">Asks (Sell)</h4>
            </div>
            
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 pb-1 border-b border-gray-200 dark:border-gray-700">
                <div>Price</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Total</div>
              </div>
              
              {/* Ask Levels */}
              <AnimatePresence>
                {orderBook.asks.map((ask, index) => (
                  <motion.div
                    key={`ask-${ask.price}-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative grid grid-cols-3 gap-2 text-xs py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    {/* Background bar showing relative quantity */}
                    <div 
                      className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded"
                      style={{ 
                        width: `${(ask.quantity / Math.max(...orderBook.asks.map(a => a.quantity))) * 100}%`,
                        opacity: 0.3
                      }}
                    />
                    
                    <div className="relative font-medium text-red-700 dark:text-red-400">
                      ₹{ask.price.toFixed(2)}
                    </div>
                    <div className="relative text-right text-gray-900 dark:text-white">
                      {formatQuantity(ask.quantity)}
                    </div>
                    <div className="relative text-right text-gray-600 dark:text-gray-400">
                      {formatQuantity(ask.total || 0)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* No Data State */}
        {orderBook.bids.length === 0 && orderBook.asks.length === 0 && (
          <div className="text-center py-8">
            <SignalIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Loading market depth...</p>
            <div className="mt-2 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
