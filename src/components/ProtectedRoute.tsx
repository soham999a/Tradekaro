'use client';

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import LoginForm from './Auth/LoginForm';
import SignUpForm from './Auth/SignUpForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading TradeKaro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
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
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuth(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuth(true);
                    }}
                    className="px-6 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Master Indian Stock Trading 🇮🇳📈
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Practice trading with real Indian market data. Build your portfolio, learn strategies,
                and compete with other traders - all with ₹10,00,000 virtual money.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuth(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Trading Now
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuth(true);
                  }}
                  className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors font-semibold"
                >
                  Already a Member?
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
                  Built with Next.js, Firebase, and Tailwind CSS
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* Auth Modals */}
        {showAuth && authMode === 'login' && (
          <LoginForm
            onToggleMode={() => setAuthMode('signup')}
            onClose={() => setShowAuth(false)}
          />
        )}
        {showAuth && authMode === 'signup' && (
          <SignUpForm
            onToggleMode={() => setAuthMode('login')}
            onClose={() => setShowAuth(false)}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}
