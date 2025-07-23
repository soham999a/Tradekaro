'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import OptionsService, { type OptionContract } from '../services/optionsService';
import { getStockQuote } from '../lib/marketData';

interface OptionsChainProps {
  symbol: string;
  spotPrice: number;
  onOptionSelect?: (option: OptionContract, action: 'BUY' | 'SELL') => void;
}

export default function OptionsChain({ symbol, spotPrice, onOptionSelect }: OptionsChainProps) {
  const [optionChain, setOptionChain] = useState<OptionContract[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showGreeks, setShowGreeks] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'ITM' | 'ATM' | 'OTM'>('ALL');

  useEffect(() => {
    loadOptionChain();
  }, [symbol, spotPrice]);

  const loadOptionChain = async () => {
    setIsLoading(true);
    try {
      // Generate option chain using Black-Scholes model
      const volatility = 0.25; // 25% implied volatility
      const options = OptionsService.generateOptionChain(symbol, spotPrice, volatility);
      setOptionChain(options);
      
      // Set default expiry to nearest expiry
      const expiries = [...new Set(options.map(opt => opt.expiry))].sort();
      if (expiries.length > 0) {
        setSelectedExpiry(expiries[0]);
      }
    } catch (error) {
      console.error('Error loading option chain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredOptions = () => {
    let filtered = optionChain.filter(opt => opt.expiry === selectedExpiry);
    
    if (filterType !== 'ALL') {
      filtered = filtered.filter(opt => {
        const moneyness = getMoneyness(opt.strike, spotPrice, opt.type);
        return moneyness === filterType;
      });
    }
    
    return filtered;
  };

  const getMoneyness = (strike: number, spot: number, type: 'CE' | 'PE'): 'ITM' | 'ATM' | 'OTM' => {
    const diff = Math.abs(strike - spot);
    if (diff <= spot * 0.02) return 'ATM'; // Within 2% is ATM
    
    if (type === 'CE') {
      return strike < spot ? 'ITM' : 'OTM';
    } else {
      return strike > spot ? 'ITM' : 'OTM';
    }
  };

  const getIntrinsicValue = (strike: number, spot: number, type: 'CE' | 'PE'): number => {
    if (type === 'CE') {
      return Math.max(0, spot - strike);
    } else {
      return Math.max(0, strike - spot);
    }
  };

  const getTimeValue = (premium: number, intrinsicValue: number): number => {
    return Math.max(0, premium - intrinsicValue);
  };

  const expiries = [...new Set(optionChain.map(opt => opt.expiry))].sort();
  const filteredOptions = getFilteredOptions();
  
  // Group by strike price
  const optionsByStrike = filteredOptions.reduce((acc, option) => {
    if (!acc[option.strike]) {
      acc[option.strike] = { CE: null, PE: null };
    }
    acc[option.strike][option.type] = option;
    return acc;
  }, {} as Record<number, { CE: OptionContract | null; PE: OptionContract | null }>);

  const strikes = Object.keys(optionsByStrike)
    .map(Number)
    .sort((a, b) => a - b);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading option chain...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {symbol} Options Chain
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Spot Price: ₹{spotPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Expiry Selector */}
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {expiries.map(expiry => (
                <option key={expiry} value={expiry}>
                  {new Date(expiry).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </option>
              ))}
            </select>

            {/* Filter Buttons */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['ALL', 'ITM', 'ATM', 'OTM'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter as any)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    filterType === filter
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Greeks Toggle */}
            <button
              onClick={() => setShowGreeks(!showGreeks)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                showGreeks
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CalculatorIcon className="h-4 w-4 inline mr-1" />
              Greeks
            </button>
          </div>
        </div>
      </div>

      {/* Option Chain Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {/* Call Options Headers */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                OI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                IV
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                LTP
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bid/Ask
              </th>
              {showGreeks && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Delta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Theta
                  </th>
                </>
              )}
              
              {/* Strike Price */}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider bg-yellow-100 dark:bg-yellow-900/30">
                Strike
              </th>
              
              {/* Put Options Headers */}
              {showGreeks && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Delta
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Theta
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bid/Ask
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                LTP
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                IV
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                OI
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {strikes.map((strike, index) => {
              const callOption = optionsByStrike[strike].CE;
              const putOption = optionsByStrike[strike].PE;
              const isATM = Math.abs(strike - spotPrice) <= spotPrice * 0.02;

              return (
                <motion.tr
                  key={strike}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isATM ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                  }`}
                >
                  {/* Call Option Data */}
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {callOption?.openInterest.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {callOption?.volume.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {callOption?.impliedVolatility.toFixed(1) || '-'}%
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20">
                    <button
                      onClick={() => callOption && onOptionSelect?.(callOption, 'BUY')}
                      className="w-full text-left"
                    >
                      ₹{callOption?.premium.toFixed(2) || '-'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {callOption ? `${callOption.bid.toFixed(2)}/${callOption.ask.toFixed(2)}` : '-'}
                  </td>
                  {showGreeks && (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {callOption?.delta.toFixed(3) || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {callOption?.theta.toFixed(3) || '-'}
                      </td>
                    </>
                  )}

                  {/* Strike Price */}
                  <td className={`px-4 py-3 text-center text-sm font-bold ${
                    isATM 
                      ? 'text-yellow-800 dark:text-yellow-200 bg-yellow-200 dark:bg-yellow-800/30' 
                      : 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {strike}
                  </td>

                  {/* Put Option Data */}
                  {showGreeks && (
                    <>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {putOption?.delta.toFixed(3) || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {putOption?.theta.toFixed(3) || '-'}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-xs text-right text-gray-600 dark:text-gray-400">
                    {putOption ? `${putOption.bid.toFixed(2)}/${putOption.ask.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                    <button
                      onClick={() => putOption && onOptionSelect?.(putOption, 'BUY')}
                      className="w-full text-right"
                    >
                      ₹{putOption?.premium.toFixed(2) || '-'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {putOption?.impliedVolatility.toFixed(1) || '-'}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {putOption?.volume.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {putOption?.openInterest.toLocaleString() || '-'}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>OI: Open Interest</span>
            <span>IV: Implied Volatility</span>
            <span>LTP: Last Traded Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-800/30 rounded"></div>
            <span>At The Money (ATM)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
