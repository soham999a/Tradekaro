'use client';

import { useState, useEffect } from 'react';
import { EnhancedMarketDataService } from '../lib/enhancedMarketData';
import { type MarketIndex, type StockQuote } from '../lib/marketData';

export default function MarketTicker() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [topStocks, setTopStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMarketData = async () => {
    try {
      const [marketIndices, stocks] = await Promise.all([
        EnhancedMarketDataService.getMarketIndices(),
        Promise.all([
          'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'HINDUNILVR'
        ].map(symbol => EnhancedMarketDataService.getStockQuote(symbol)))
      ]);

      setIndices(marketIndices);
      setTopStocks(stocks.filter(Boolean) as StockQuote[]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading market data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadDataSafely = async () => {
      if (isMounted) {
        await loadMarketData();
      }
    };

    loadDataSafely();

    // Update every 30 seconds for real-time feel
    const interval = setInterval(() => {
      if (isMounted) {
        loadDataSafely();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatValue = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else {
      return `₹${value.toLocaleString()}`;
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? '📈' : '📉';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-sm">Loading market data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
          {/* Market Status */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>

          {/* Market Indices */}
          {indices.map((index) => (
            <div key={index.symbol} className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-sm font-semibold">{index.name}</span>
              <span className="text-sm font-bold">{formatValue(index.value)}</span>
              <span className={`text-xs font-medium ${getChangeColor(index.change)}`}>
                {getChangeIcon(index.change)} {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} 
                ({index.changePercent.toFixed(2)}%)
              </span>
              {index.source && (
                <span className="text-xs opacity-75 bg-white/20 px-1 rounded">
                  {index.source === 'ALPHA_VANTAGE' ? 'AV' : index.source === 'TWELVE_DATA' ? 'TD' : 'MOCK'}
                </span>
              )}
            </div>
          ))}

          {/* Separator */}
          <div className="w-px h-6 bg-white/30 flex-shrink-0"></div>

          {/* Top Stocks */}
          {topStocks.map((stock) => (
            <div key={stock.symbol} className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-sm font-semibold">{stock.symbol}</span>
              <span className="text-sm font-bold">₹{stock.price.toFixed(2)}</span>
              <span className={`text-xs font-medium ${getChangeColor(stock.change)}`}>
                {getChangeIcon(stock.change)} {stock.changePercent.toFixed(2)}%
              </span>
              {stock.source && (
                <span className="text-xs opacity-75 bg-white/20 px-1 rounded">
                  {stock.source === 'ALPHA_VANTAGE' ? 'AV' : stock.source === 'TWELVE_DATA' ? 'TD' : 'MOCK'}
                </span>
              )}
            </div>
          ))}

          {/* Market Status Info */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs opacity-75">
              Last updated: {new Date().toLocaleTimeString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                hour12: true,
                hour: '2-digit',
                minute: '2-digit'
              })} IST
            </span>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
