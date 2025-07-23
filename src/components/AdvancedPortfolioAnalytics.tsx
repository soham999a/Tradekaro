'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { TradingService } from '../services/tradingService';

interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  alpha: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: string;
}

export default function AdvancedPortfolioAnalytics() {
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    winRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    volatility: 0,
    beta: 0,
    alpha: 0
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_trade',
      title: 'First Steps',
      description: 'Complete your first trade',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: '₹100 Bonus'
    },
    {
      id: 'profit_master',
      title: 'Profit Master',
      description: 'Achieve ₹10,000 in total profits',
      icon: '💰',
      unlocked: false,
      progress: 0,
      maxProgress: 10000,
      reward: 'Premium Features'
    },
    {
      id: 'streak_warrior',
      title: 'Streak Warrior',
      description: 'Win 5 trades in a row',
      icon: '🔥',
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      reward: 'Special Badge'
    },
    {
      id: 'risk_manager',
      title: 'Risk Manager',
      description: 'Keep max drawdown under 5%',
      icon: '🛡️',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: 'Risk Tools'
    }
  ]);

  const [riskLevel, setRiskLevel] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [portfolioScore, setPortfolioScore] = useState(0);

  useEffect(() => {
    loadPortfolioMetrics();
    calculatePortfolioScore();
    checkAchievements();
  }, []);

  const loadPortfolioMetrics = async () => {
    try {
      // Get positions and calculate metrics
      const positions = await TradingService.getUserPositions('demo');
      const closedPositions = await TradingService.getClosedPositions('demo');
      const realizedPnL = await TradingService.getTotalRealizedPnL('demo');

      let totalValue = 0;
      let totalInvested = 0;
      let totalPnL = 0;

      positions.forEach(position => {
        const invested = position.quantity * position.averagePrice;
        const currentValue = position.quantity * position.currentPrice;
        totalInvested += invested;
        totalValue += currentValue;
        totalPnL += (currentValue - invested);
      });

      // Add realized P&L
      totalPnL += realizedPnL.totalPnL;

      const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      // Calculate advanced metrics
      const winRate = realizedPnL.winRate;
      const sharpeRatio = calculateSharpeRatio(positions, closedPositions);
      const maxDrawdown = calculateMaxDrawdown(closedPositions);
      const volatility = calculateVolatility(positions);
      const beta = calculateBeta(positions);
      const alpha = calculateAlpha(totalPnLPercent, beta);

      setMetrics({
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercent,
        dayChange: Math.random() * 1000 - 500, // Simulated
        dayChangePercent: Math.random() * 4 - 2, // Simulated
        winRate,
        sharpeRatio,
        maxDrawdown,
        volatility,
        beta,
        alpha
      });

      // Determine risk level
      if (volatility < 15) setRiskLevel('Conservative');
      else if (volatility < 25) setRiskLevel('Moderate');
      else setRiskLevel('Aggressive');

    } catch (error) {
      console.error('Error loading portfolio metrics:', error);
    }
  };

  const calculateSharpeRatio = (positions: any[], closedPositions: any[]): number => {
    // Simplified Sharpe ratio calculation
    const returns = closedPositions.map(p => (p.realizedPnL || 0) / (p.quantity * p.averagePrice));
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
  };

  const calculateMaxDrawdown = (closedPositions: any[]): number => {
    if (closedPositions.length === 0) return 0;
    
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;

    closedPositions.forEach(position => {
      runningTotal += position.realizedPnL || 0;
      if (runningTotal > peak) peak = runningTotal;
      const drawdown = (peak - runningTotal) / Math.max(peak, 1) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    return maxDrawdown;
  };

  const calculateVolatility = (positions: any[]): number => {
    if (positions.length === 0) return 0;
    const pnlPercentages = positions.map(p => p.pnlPercent || 0);
    const avg = pnlPercentages.reduce((a, b) => a + b, 0) / pnlPercentages.length;
    const variance = pnlPercentages.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / pnlPercentages.length;
    return Math.sqrt(variance);
  };

  const calculateBeta = (positions: any[]): number => {
    // Simplified beta calculation (correlation with market)
    return 0.8 + Math.random() * 0.4; // Simulated between 0.8-1.2
  };

  const calculateAlpha = (portfolioReturn: number, beta: number): number => {
    const marketReturn = 12; // Assumed market return of 12%
    const riskFreeRate = 6; // Assumed risk-free rate of 6%
    return portfolioReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
  };

  const calculatePortfolioScore = () => {
    // Calculate a score out of 100 based on various factors
    let score = 50; // Base score
    
    if (metrics.totalPnLPercent > 0) score += 20;
    if (metrics.winRate > 60) score += 15;
    if (metrics.sharpeRatio > 1) score += 10;
    if (metrics.maxDrawdown < 10) score += 5;
    
    setPortfolioScore(Math.min(100, Math.max(0, score)));
  };

  const checkAchievements = async () => {
    try {
      const positions = await TradingService.getUserPositions('demo');
      const orders = await TradingService.getUserOrders('demo');
      const realizedPnL = await TradingService.getTotalRealizedPnL('demo');

      setAchievements(prev => prev.map(achievement => {
        let progress = achievement.progress;
        let unlocked = achievement.unlocked;

        switch (achievement.id) {
          case 'first_trade':
            progress = orders.length > 0 ? 1 : 0;
            unlocked = progress >= achievement.maxProgress;
            break;
          case 'profit_master':
            progress = Math.max(0, realizedPnL.totalPnL);
            unlocked = progress >= achievement.maxProgress;
            break;
          case 'risk_manager':
            progress = metrics.maxDrawdown < 5 ? 1 : 0;
            unlocked = progress >= achievement.maxProgress;
            break;
        }

        return { ...achievement, progress, unlocked };
      }));
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Conservative': return 'text-green-600 bg-green-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Aggressive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Score & Risk Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-modern p-6 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreColor(portfolioScore)} bg-gradient-to-br from-blue-500 to-purple-600 text-white`}>
              <span className="text-2xl font-bold">{portfolioScore}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Portfolio Score</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {portfolioScore >= 80 ? 'Excellent!' : portfolioScore >= 60 ? 'Good' : 'Needs Improvement'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-modern p-6 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <ShieldCheckIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Risk Level</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskLevel)}`}>
            {riskLevel}
          </span>
        </motion.div>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', value: `${metrics.winRate.toFixed(1)}%`, icon: TrophyIcon, color: 'text-green-600' },
          { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), icon: ChartBarIcon, color: 'text-blue-600' },
          { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(1)}%`, icon: ArrowTrendingDownIcon, color: 'text-red-600' },
          { label: 'Volatility', value: `${metrics.volatility.toFixed(1)}%`, icon: BoltIcon, color: 'text-yellow-600' },
          { label: 'Beta', value: metrics.beta.toFixed(2), icon: ArrowTrendingUpIcon, color: 'text-purple-600' },
          { label: 'Alpha', value: `${metrics.alpha.toFixed(1)}%`, icon: StarIcon, color: 'text-indigo-600' }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="card-modern p-4 text-center hover:shadow-lg transition-all duration-300"
            >
              <Icon className={`h-8 w-8 mx-auto mb-2 ${metric.color}`} />
              <div className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-modern p-6"
      >
        <div className="flex items-center mb-6">
          <SparklesIcon className="h-6 w-6 text-yellow-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                achievement.unlocked
                  ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div>
                    <h4 className={`font-semibold ${achievement.unlocked ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </div>
                {achievement.unlocked && (
                  <div className="text-yellow-500">
                    <StarIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      achievement.unlocked ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Reward: {achievement.reward}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
