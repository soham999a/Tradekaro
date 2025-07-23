'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { type OptionPosition } from '../services/optionsService';

interface OptionsPositionsProps {
  positions: OptionPosition[];
  onClosePosition: (positionId: string) => void;
  onSquareOff: (positionId: string) => void;
}

export default function OptionsPositions({ 
  positions, 
  onClosePosition, 
  onSquareOff 
}: OptionsPositionsProps) {
  const [sortBy, setSortBy] = useState<'pnl' | 'expiry' | 'symbol'>('pnl');
  const [filterBy, setFilterBy] = useState<'ALL' | 'PROFIT' | 'LOSS' | 'EXPIRING'>('ALL');

  const getFilteredAndSortedPositions = () => {
    let filtered = [...positions];

    // Apply filters
    switch (filterBy) {
      case 'PROFIT':
        filtered = filtered.filter(pos => pos.pnl > 0);
        break;
      case 'LOSS':
        filtered = filtered.filter(pos => pos.pnl < 0);
        break;
      case 'EXPIRING':
        filtered = filtered.filter(pos => {
          const daysToExpiry = getDaysToExpiry(pos.expiry);
          return daysToExpiry <= 7;
        });
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return b.pnl - a.pnl;
        case 'expiry':
          return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getDaysToExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getMoneyness = (strike: number, spotPrice: number, type: 'CE' | 'PE'): string => {
    const diff = Math.abs(strike - spotPrice);
    if (diff <= spotPrice * 0.02) return 'ATM';
    
    if (type === 'CE') {
      return strike < spotPrice ? 'ITM' : 'OTM';
    } else {
      return strike > spotPrice ? 'ITM' : 'OTM';
    }
  };

  const getMoneynessBadgeColor = (moneyness: string) => {
    switch (moneyness) {
      case 'ITM': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ATM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'OTM': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTotalPnL = () => {
    return positions.reduce((total, pos) => total + pos.pnl, 0);
  };

  const getTotalMargin = () => {
    return positions.reduce((total, pos) => total + pos.margin, 0);
  };

  const filteredPositions = getFilteredAndSortedPositions();
  const totalPnL = getTotalPnL();
  const totalMargin = getTotalMargin();

  if (positions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Option Positions</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start trading options to see your positions here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Options Positions</h3>
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total P&L: <span className={`font-semibold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Margin: <span className="font-semibold">₹{totalMargin.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Positions</option>
              <option value="PROFIT">Profitable</option>
              <option value="LOSS">Loss Making</option>
              <option value="EXPIRING">Expiring Soon</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pnl">Sort by P&L</option>
              <option value="expiry">Sort by Expiry</option>
              <option value="symbol">Sort by Symbol</option>
            </select>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredPositions.map((position, index) => {
          const daysToExpiry = getDaysToExpiry(position.expiry);
          const isExpiringSoon = daysToExpiry <= 7;
          const spotPrice = 2500; // This should come from real data
          const moneyness = getMoneyness(position.strike, spotPrice, position.type);

          return (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                {/* Position Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {position.symbol} {position.strike} {position.type}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      position.action === 'BUY' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {position.action}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoneynessBadgeColor(moneyness)}`}>
                      {moneyness}
                    </span>
                    {isExpiringSoon && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-xs font-medium flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {daysToExpiry}d
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {position.quantity} lots ({position.quantity * position.lotSize} shares)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Entry:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        ₹{position.entryPremium.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">LTP:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        ₹{position.currentPremium.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Expiry:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {new Date(position.expiry).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* P&L and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toLocaleString()}
                    </div>
                    <div className={`text-sm ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Margin: ₹{position.margin.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => onSquareOff(position.id)}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors"
                    >
                      Square Off
                    </button>
                    <button
                      onClick={() => onClosePosition(position.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              {/* Risk Warnings */}
              {isExpiringSoon && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-medium text-orange-800 dark:text-orange-200">
                        Expiring Soon:
                      </span>
                      <span className="text-orange-700 dark:text-orange-300 ml-1">
                        This position expires in {daysToExpiry} day{daysToExpiry !== 1 ? 's' : ''}. 
                        Consider squaring off to avoid physical settlement.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredPositions.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No positions match the selected filter
          </p>
        </div>
      )}
    </div>
  );
}
