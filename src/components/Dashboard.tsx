'use client';

import { useState, useEffect } from 'react';
import { getMarketIndices, type MarketIndex } from '../lib/marketData';
import { EnhancedMarketDataService } from '../lib/enhancedMarketData';
import { TradingService, type PortfolioSummary } from '../services/tradingService';
import { useAuth } from '../context/AuthContext';
import { PortfolioCard, BalanceCard, DayChangeCard, TotalInvestedCard } from './TradingCard';

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [indices, portfolioSummary] = await Promise.all([
        EnhancedMarketDataService.getMarketIndices(),
        TradingService.getPortfolioSummary(user.uid)
      ]);

      setMarketIndices(indices);
      setPortfolio(portfolioSummary);

      // Load sample watchlist
      const sampleWatchlist = await Promise.all([
        'RELIANCE', 'TCS', 'INFY', 'HDFCBANK'
      ].map(symbol => EnhancedMarketDataService.getStockQuote(symbol)));

      setWatchlist(sampleWatchlist.filter(Boolean));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadDataSafely = async () => {
      if (isMounted) {
        await loadData();
      }
    };

    loadDataSafely();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        loadDataSafely();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-20 animate-pulse"></div>
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading TradeKaro</h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">Preparing your trading dashboard...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Message */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Welcome back, {userData?.name || 'Trader'}!
                <span className="inline-block animate-bounce ml-2">👋</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Here&apos;s your trading dashboard overview
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Market Open</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata'
                  })} IST
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PortfolioCard
            totalValue={portfolio?.totalValue || 0}
            totalPnL={portfolio?.totalPnL || 0}
            totalPnLPercent={portfolio?.totalPnLPercent || 0}
          />

          <BalanceCard balance={userData?.balance || 100000} />

          <DayChangeCard
            dayChange={portfolio?.dayChange || 0}
            dayChangePercent={portfolio?.dayChangePercent || 0}
          />

          <TotalInvestedCard totalInvested={portfolio?.totalInvested || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Indices */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Indices</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {marketIndices.map((index) => (
                    <div key={index.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{index.name}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {index.value.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          index.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {index.change >= 0 ? '+' : ''}{index.change}
                        </p>
                        <p className={`text-sm ${
                          index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {index.changePercent >= 0 ? '+' : ''}{index.changePercent}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Watchlist */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Watchlist</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {watchlist.map((stock) => (
                      <tr key={stock.symbol}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {stock.symbol}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {stock.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{stock.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? '+' : ''}₹{stock.change} ({stock.changePercent}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => console.log('Buy', stock.symbol)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 mr-4 transition-colors px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg font-medium"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => console.log('Sell', stock.symbol)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 transition-colors px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg font-medium"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
