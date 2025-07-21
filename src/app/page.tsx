'use client';

import { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [currentView, setCurrentView] = useState('landing');
  const [marketData, setMarketData] = useState({
    nifty: { price: 0, change: 0 },
    sensex: { price: 0, change: 0 }
  });

  useEffect(() => {
    // Simulate market data - replace with actual API calls
    setMarketData({
      nifty: { price: 24500.75, change: 125.30 },
      sensex: { price: 80250.45, change: 245.80 }
    });
  }, []);

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleSignUp = () => {
    setCurrentView('dashboard');
  };

  const handleStartTrading = () => {
    setCurrentView('dashboard');
  };

  const handleWatchDemo = () => {
    alert('Demo video coming soon! 🎥');
  };

  // Show dashboard if user is logged in
  if (currentView === 'dashboard') {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                📈 TradeKaro
              </h1>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Indian Stock Trading Platform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={handleSignUp}
                className="px-6 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Market Overview */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                NIFTY 50
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{marketData.nifty.price.toLocaleString()}
                </span>
                <span className={`text-lg font-semibold ${marketData.nifty.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketData.nifty.change >= 0 ? '+' : ''}₹{marketData.nifty.change}
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                SENSEX
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{marketData.sensex.price.toLocaleString()}
                </span>
                <span className={`text-lg font-semibold ${marketData.sensex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketData.sensex.change >= 0 ? '+' : ''}₹{marketData.sensex.change}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Master Indian Stock Trading
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Practice trading with real Indian market data. Build your portfolio, learn strategies,
            and compete with other traders - all with virtual money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleStartTrading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              Start Trading Now
            </button>
            <button
              onClick={handleWatchDemo}
              className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose TradeKaro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Real Market Data
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Live NSE/BSE stock prices and market information
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Virtual Trading
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Practice with ₹10,00,000 virtual money - no risk!
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Learn & Compete
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Educational content and leaderboards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">TradeKaro</h3>
            <p className="text-gray-400 mb-4">
              Indian Stock Trading Platform - Learn, Practice, Excel
            </p>
            <p className="text-sm text-gray-500">
              Built with Next.js, Firebase, and Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
