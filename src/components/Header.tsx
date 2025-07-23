'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, userData, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-lg px-3 py-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      TradeKaro
                    </h1>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Professional Trading
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {currentView === 'dashboard' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-25"></div>
                )}
                <span className="relative">📊 Dashboard</span>
              </button>
              <button
                onClick={() => onViewChange('trading')}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'trading'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {currentView === 'trading' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg blur opacity-25"></div>
                )}
                <span className="relative">⚡ Trade</span>
              </button>
              <button
                onClick={() => onViewChange('portfolio')}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'portfolio'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {currentView === 'portfolio' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg blur opacity-25"></div>
                )}
                <span className="relative">💼 Portfolio</span>
              </button>
              <button
                onClick={() => onViewChange('history')}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'history'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {currentView === 'history' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg blur opacity-25"></div>
                )}
                <span className="relative">📈 History</span>
              </button>
              <button
                onClick={() => onViewChange('analysis')}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'analysis'
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {currentView === 'analysis' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg blur opacity-25"></div>
                )}
                <span className="relative">📊 Market</span>
              </button>
            </nav>
          </div>

          {/* User Info and Balance */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            {userData && (
              <div className="hidden sm:flex items-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 py-2 rounded-xl border border-green-200/50 dark:border-green-700/50 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Available Balance</span>
                  <span className="text-sm font-bold text-green-800 dark:text-green-200">
                    ₹{userData.balance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 rounded-xl px-4 py-2 transition-all duration-200 border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md backdrop-blur-sm"
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                    {userData ? getInitials(userData.name) : 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Premium Trader
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-200/50 dark:border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-lg font-bold">
                        {userData ? getInitials(userData.name) : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {userData?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {userData?.email || 'user@example.com'}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        onViewChange('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-200/50 dark:border-slate-700/50 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2 space-y-1">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              currentView === 'dashboard'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('trading')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              currentView === 'trading'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Trade
          </button>
          <button
            onClick={() => onViewChange('portfolio')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              currentView === 'portfolio'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => onViewChange('history')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              currentView === 'history'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>
    </header>
  );
}
