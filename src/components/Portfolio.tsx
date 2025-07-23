'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  BanknotesIcon,
  ClockIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { TradingService } from '../services/tradingService';
import { useAuth } from '../context/AuthContext';
import { getStockQuote, getCurrentISTTime, getMarketSession } from '../lib/marketData';
import toast from 'react-hot-toast';

interface PortfolioProps {
  onBack: () => void;
}

interface Position {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  product: string;
  dayChange: number;
  dayChangePercent: number;
  marketValue: number;
  investedValue: number;
}

interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  availableBalance: number;
}

export default function Portfolio({ onBack }: PortfolioProps) {
  const { user, userData } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    availableBalance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [marketSession, setMarketSession] = useState(getMarketSession());
  const [currentTime, setCurrentTime] = useState(getCurrentISTTime());

  useEffect(() => {
    loadPortfolioData();

    // Update every 5 seconds
    const interval = setInterval(() => {
      loadPortfolioData();
      setMarketSession(getMarketSession());
      setCurrentTime(getCurrentISTTime());
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const loadPortfolioData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get positions from TradingService
      const userPositions = await TradingService.getUserPositions(user.uid);

      // Enhance positions with current market data
      const enhancedPositions = await Promise.all(
        userPositions.map(async (position) => {
          try {
            const quote = await getStockQuote(position.symbol);
            if (quote) {
              const currentPrice = quote.price;
              const marketValue = currentPrice * position.quantity;
              const investedValue = position.averagePrice * position.quantity;
              const pnl = marketValue - investedValue;
              const pnlPercent = (pnl / investedValue) * 100;
              const dayChange = quote.change * position.quantity;
              const dayChangePercent = quote.changePercent;

              return {
                ...position,
                name: quote.name,
                currentPrice,
                marketValue,
                investedValue,
                pnl,
                pnlPercent,
                dayChange,
                dayChangePercent
              };
            }
            return {
              ...position,
              name: position.symbol,
              currentPrice: position.averagePrice,
              marketValue: position.averagePrice * position.quantity,
              investedValue: position.averagePrice * position.quantity,
              pnl: 0,
              pnlPercent: 0,
              dayChange: 0,
              dayChangePercent: 0
            };
          } catch (error) {
            console.error(`Error fetching data for ${position.symbol}:`, error);
            return {
              ...position,
              name: position.symbol,
              currentPrice: position.averagePrice,
              marketValue: position.averagePrice * position.quantity,
              investedValue: position.averagePrice * position.quantity,
              pnl: 0,
              pnlPercent: 0,
              dayChange: 0,
              dayChangePercent: 0
            };
          }
        })
      );

      setPositions(enhancedPositions);

      // Calculate portfolio summary
      const totalValue = enhancedPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
      const totalInvested = enhancedPositions.reduce((sum, pos) => sum + pos.investedValue, 0);
      const totalPnL = totalValue - totalInvested;
      const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
      const dayChange = enhancedPositions.reduce((sum, pos) => sum + pos.dayChange, 0);
      const dayChangePercent = totalInvested > 0 ? (dayChange / totalInvested) * 100 : 0;

      setPortfolioSummary({
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercent,
        dayChange,
        dayChangePercent,
        availableBalance: userData?.balance || 0
      });

    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              marketSession.session.includes('Open')
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {marketSession.session}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">IST: {formatTime(currentTime)}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">{marketSession.timeToNext}</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Portfolio Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolioSummary.totalValue)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total P&L</div>
              <div className={`text-2xl font-bold ${
                portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {portfolioSummary.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalPnL)}
              </div>
              <div className={`text-sm ${
                portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ({portfolioSummary.totalPnLPercent >= 0 ? '+' : ''}{portfolioSummary.totalPnLPercent.toFixed(2)}%)
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Day's P&L</div>
              <div className={`text-2xl font-bold ${
                portfolioSummary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {portfolioSummary.dayChange >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.dayChange)}
              </div>
              <div className={`text-sm ${
                portfolioSummary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ({portfolioSummary.dayChangePercent >= 0 ? '+' : ''}{portfolioSummary.dayChangePercent.toFixed(2)}%)
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available Balance</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolioSummary.availableBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Holdings ({positions.length})</h2>
          </div>

          {positions.length === 0 ? (
            <div className="p-12 text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No holdings yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start trading to build your portfolio</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {positions.map((position, index) => (
                <motion.div
                  key={`${position.symbol}-${position.product}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {position.symbol}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {position.name}
                          </p>
                        </div>
                        <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                          {position.product}
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Qty: </span>
                          <span className="font-medium text-gray-900 dark:text-white">{position.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Avg: </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(position.averagePrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">LTP: </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(position.currentPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Value: </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(position.marketValue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className={`text-lg font-bold ${
                        position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                      </div>
                      <div className={`text-sm ${
                        position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                      </div>
                      <div className={`text-xs mt-1 flex items-center justify-end ${
                        position.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.dayChange >= 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {position.dayChange >= 0 ? '+' : ''}{formatCurrency(position.dayChange)} today
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
