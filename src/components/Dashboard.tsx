'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity } from 'lucide-react';
import TradingInterface from './TradingInterface';
import Portfolio from './Portfolio';
import MarketAnalysis from './MarketAnalysis';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Portfolio {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  cash: number;
}

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'trading' | 'portfolio' | 'analysis'>('dashboard');
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 1000000,
    totalGain: 25000,
    totalGainPercent: 2.56,
    cash: 750000
  });

  const [watchlist, setWatchlist] = useState<Stock[]>([
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 45.30, changePercent: 1.88 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3678.90, change: -23.45, changePercent: -0.63 },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1534.20, change: 18.75, changePercent: 1.24 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1687.45, change: 12.30, changePercent: 0.73 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 987.60, change: -8.90, changePercent: -0.89 }
  ]);

  const [marketIndices, setMarketIndices] = useState([
    { name: 'NIFTY 50', value: 24567.85, change: 156.30, changePercent: 0.64 },
    { name: 'SENSEX', value: 80234.67, change: 298.45, changePercent: 0.37 },
    { name: 'BANK NIFTY', value: 52345.90, change: -89.23, changePercent: -0.17 }
  ]);

  // Show trading interface if selected
  if (currentView === 'trading') {
    return <TradingInterface onBack={() => setCurrentView('dashboard')} />;
  }

  // Show portfolio if selected
  if (currentView === 'portfolio') {
    return <Portfolio onBack={() => setCurrentView('dashboard')} />;
  }

  // Show market analysis if selected
  if (currentView === 'analysis') {
    return <MarketAnalysis onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                📈 TradeKaro
              </h1>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Trading Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio Value</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ₹{portfolio.totalValue.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setCurrentView('analysis')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Analysis
              </button>
              <button
                onClick={() => setCurrentView('portfolio')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Portfolio
              </button>
              <button
                onClick={() => setCurrentView('trading')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Trade
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ₹{portfolio.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Gain</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  +₹{portfolio.totalGain.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gain %</p>
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                  +{portfolio.totalGainPercent}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Cash</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ₹{portfolio.cash.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
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
                            onClick={() => setCurrentView('trading')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => setCurrentView('trading')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
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
