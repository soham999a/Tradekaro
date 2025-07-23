'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import TradingChart, { MarketAnalysis } from './TradingChart';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AnalyticsView() {
  const { user, userData } = useAuth();
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [timeframe, setTimeframe] = useState('1M');

  // Sample portfolio performance data
  const portfolioPerformance = [
    { date: '2024-01-01', value: 100000, benchmark: 100000 },
    { date: '2024-01-15', value: 102500, benchmark: 101200 },
    { date: '2024-02-01', value: 98000, benchmark: 99800 },
    { date: '2024-02-15', value: 105000, benchmark: 102500 },
    { date: '2024-03-01', value: 108500, benchmark: 104000 },
    { date: '2024-03-15', value: 112000, benchmark: 106500 },
    { date: '2024-04-01', value: 115500, benchmark: 108000 },
  ];

  // Sample sector allocation data
  const sectorAllocation = [
    { name: 'Technology', value: 35, color: '#3b82f6' },
    { name: 'Banking', value: 25, color: '#10b981' },
    { name: 'Healthcare', value: 15, color: '#f59e0b' },
    { name: 'Energy', value: 12, color: '#ef4444' },
    { name: 'Consumer', value: 8, color: '#8b5cf6' },
    { name: 'Others', value: 5, color: '#6b7280' },
  ];

  // Sample trading activity data
  const tradingActivity = [
    { month: 'Jan', trades: 45, profit: 12500 },
    { month: 'Feb', trades: 38, profit: -3200 },
    { month: 'Mar', trades: 52, profit: 18900 },
    { month: 'Apr', trades: 41, profit: 8700 },
    { month: 'May', trades: 47, profit: 15600 },
    { month: 'Jun', trades: 39, profit: 6800 },
  ];

  // Sample risk metrics
  const riskMetrics = [
    { metric: 'Portfolio Beta', value: '1.15', description: 'Higher volatility than market' },
    { metric: 'Sharpe Ratio', value: '1.42', description: 'Good risk-adjusted returns' },
    { metric: 'Max Drawdown', value: '-8.5%', description: 'Maximum loss from peak' },
    { metric: 'Value at Risk (95%)', value: '₹12,500', description: 'Potential daily loss' },
  ];

  const popularStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Market Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Advanced market analysis and portfolio insights
          </p>
        </div>

        {/* Stock Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {popularStocks.map((stock) => (
              <motion.button
                key={stock}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStock(stock)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedStock === stock
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50'
                }`}
              >
                {stock}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <TradingChart symbol={selectedStock} height={500} />
          </div>

          {/* Technical Analysis */}
          <div className="lg:col-span-1">
            <MarketAnalysis symbol={selectedStock} />
          </div>
        </div>

        {/* Portfolio Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Portfolio Performance vs Benchmark
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short' })}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#f1f5f9'
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Portfolio"
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6b7280" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6b7280', strokeWidth: 2, r: 3 }}
                  name="Benchmark"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sector Allocation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#f1f5f9'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Allocation']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Trading Activity & Risk Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Trading Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tradingActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#f1f5f9'
                  }}
                />
                <Bar dataKey="trades" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Metrics
            </h3>
            <div className="space-y-4">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="p-4 bg-gray-50/50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {metric.metric}
                    </h4>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {metric.value}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Market Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market Insights & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <h4 className="font-semibold text-green-800 dark:text-green-300">Strong Buy</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Technology sector showing strong momentum with AI and cloud adoption driving growth.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/50">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Hold</h4>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Banking sector facing headwinds but fundamentals remain strong for long-term investors.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">Diversify</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Consider adding healthcare and renewable energy stocks to balance portfolio risk.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
