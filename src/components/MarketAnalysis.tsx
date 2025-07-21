'use client';

import { useState, useEffect } from 'react';
import { getMarketIndices, getTopGainers, getTopLosers, getMostActive, type MarketIndex, type StockQuote } from '../lib/marketData';

interface MarketAnalysisProps {
  onBack: () => void;
}

export default function MarketAnalysis({ onBack }: MarketAnalysisProps) {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<StockQuote[]>([]);
  const [topLosers, setTopLosers] = useState<StockQuote[]>([]);
  const [mostActive, setMostActive] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setIsLoading(true);
    
    try {
      const [indices, gainers, losers, active] = await Promise.all([
        getMarketIndices(),
        getTopGainers(),
        getTopLosers(),
        getMostActive()
      ]);

      setMarketIndices(indices);
      setTopGainers(gainers);
      setTopLosers(losers);
      setMostActive(active);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading market analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
              >
                <span className="mr-1">←</span>
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                📈 TradeKaro
              </h1>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Market Analysis
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Indices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Market Indices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketIndices.map((index) => (
              <div key={index.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{index.name}</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {index.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center ${
                      index.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span className="mr-1">{index.change >= 0 ? '📈' : '📉'}</span>
                      <span className="font-medium">
                        {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Gainers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-xl mr-2">📈</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Gainers</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topGainers.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">₹{stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-medium">+{stock.changePercent.toFixed(2)}%</p>
                      <p className="text-sm text-green-600">+₹{stock.change.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-xl mr-2">📉</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Losers</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topLosers.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">₹{stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-medium">{stock.changePercent.toFixed(2)}%</p>
                      <p className="text-sm text-red-600">₹{stock.change.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Most Active */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚡</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Active</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mostActive.map((stock, index) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">₹{stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vol: {(stock.volume / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Market Summary */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <span className="text-xl mr-2">📊</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600 mb-2">{topGainers.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Advancing Stocks</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-3xl font-bold text-red-600 mb-2">{topLosers.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Declining Stocks</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 mb-2">{mostActive.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Stocks</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(marketIndices.reduce((sum, index) => sum + index.value, 0) / 1000)}K
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Index Avg</p>
            </div>
          </div>
        </div>

        {/* Market News Placeholder */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <span className="text-xl mr-2">📰</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market News</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                📈 Indian Markets Show Strong Performance
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                NIFTY and SENSEX continue their upward trajectory with strong buying interest in IT and banking sectors.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">2 hours ago</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                💰 FII Inflows Boost Market Sentiment
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Foreign institutional investors continue to show confidence in Indian equities with sustained inflows.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">4 hours ago</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                🏭 Manufacturing Sector Outlook Positive
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manufacturing PMI data suggests continued expansion in the sector, boosting related stocks.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
