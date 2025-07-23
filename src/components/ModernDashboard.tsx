'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  BanknotesIcon,
  ClockIcon,
  PlusIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { TradingService } from '../services/tradingService';
import { getStockQuote } from '../lib/marketData';
import AdvancedPortfolioAnalytics from './AdvancedPortfolioAnalytics';
import RiskManagementDashboard from './RiskManagementDashboard';
import SocialTradingFeed from './SocialTradingFeed';

interface ModernDashboardProps {
  onViewChange: (view: string) => void;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  gradient: string;
}

interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function ModernDashboard({ onViewChange }: ModernDashboardProps) {
  const { user, userData } = useAuth();
  const [portfolioStats, setPortfolioStats] = useState<QuickStat[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'risk' | 'social'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load portfolio data
      const positions = await TradingService.getUserPositions(user.uid);
      const orders = await TradingService.getUserOrders(user.uid);
      
      // Calculate portfolio stats
      const totalValue = positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.quantity), 0);
      const totalInvested = positions.reduce((sum, pos) => sum + (pos.averagePrice * pos.quantity), 0);
      const totalPnL = totalValue - totalInvested;
      const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      const stats: QuickStat[] = [
        {
          label: 'Portfolio Value',
          value: formatCurrency(totalValue),
          change: `${totalPnLPercent >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%`,
          changeType: totalPnLPercent >= 0 ? 'positive' : 'negative',
          icon: ChartBarIcon,
          gradient: 'from-blue-500 to-cyan-500'
        },
        {
          label: 'Total P&L',
          value: formatCurrency(totalPnL),
          change: totalPnL >= 0 ? 'Profit' : 'Loss',
          changeType: totalPnL >= 0 ? 'positive' : 'negative',
          icon: totalPnL >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
          gradient: totalPnL >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'
        },
        {
          label: 'Holdings',
          value: positions.length.toString(),
          change: `${orders.length} orders`,
          changeType: 'neutral',
          icon: EyeIcon,
          gradient: 'from-purple-500 to-violet-500'
        },
        {
          label: 'Available Balance',
          value: formatCurrency(userData?.balance || 0),
          change: 'Ready to trade',
          changeType: 'positive',
          icon: BanknotesIcon,
          gradient: 'from-orange-500 to-amber-500'
        }
      ];

      setPortfolioStats(stats);

      // Load trending stocks
      const popularSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];
      const trendingData = await Promise.all(
        popularSymbols.map(async (symbol) => {
          const quote = await getStockQuote(symbol);
          return quote ? {
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent
          } : null;
        })
      );

      setTrendingStocks(trendingData.filter(Boolean) as TrendingStock[]);
      setRecentActivity(orders.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const quickActions = [
    {
      label: 'Start Trading',
      description: 'Buy & sell stocks',
      icon: BanknotesIcon,
      action: () => onViewChange('trading'),
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'View Portfolio',
      description: 'Check your holdings',
      icon: ChartBarIcon,
      action: () => onViewChange('portfolio'),
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Watchlist',
      description: 'Track favorites',
      icon: EyeIcon,
      action: () => onViewChange('watchlist'),
      gradient: 'from-purple-500 to-violet-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Trader'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your investments today
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-2 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
        >
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'analytics', label: 'Analytics', icon: TrophyIcon },
            { id: 'risk', label: 'Risk', icon: SparklesIcon },
            { id: 'social', label: 'Social', icon: FireIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Portfolio Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {portfolioStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-modern rounded-2xl lg:rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg neon-glow floating-animation`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' 
                      ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                      : stat.changeType === 'negative'
                      ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                      : 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-6">
            <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:shadow-lg transition-all duration-300 text-left group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Trending Stocks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-6">
              <FireIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trending Stocks</h2>
            </div>
            
            <div className="space-y-4">
              {trendingStocks.map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => onViewChange('trading')}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{stock.price.toFixed(2)}</p>
                    <div className={`text-sm flex items-center ${
                      stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.changePercent >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-6">
              <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'BUY' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <span className={`text-sm font-bold ${
                          activity.type === 'BUY' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.type === 'BUY' ? 'B' : 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{activity.symbol}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.quantity} shares • {activity.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">₹{activity.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Start trading to see your activity here</p>
              </div>
            )}
          </motion.div>
        </div>
        </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdvancedPortfolioAnalytics />
          </motion.div>
        )}

        {/* Risk Management Tab */}
        {activeTab === 'risk' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RiskManagementDashboard />
          </motion.div>
        )}

        {/* Social Trading Tab */}
        {activeTab === 'social' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SocialTradingFeed />
          </motion.div>
        )}

      </div>
    </div>
  );
}
