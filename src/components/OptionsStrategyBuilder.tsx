'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MinusIcon,
  ChartBarIcon,
  CalculatorIcon,
  LightBulbIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import OptionsService, { type OptionStrategy, type OptionLeg } from '../services/optionsService';

interface OptionsStrategyBuilderProps {
  symbol: string;
  spotPrice: number;
  onExecuteStrategy: (strategy: OptionStrategy) => void;
}

export default function OptionsStrategyBuilder({ 
  symbol, 
  spotPrice, 
  onExecuteStrategy 
}: OptionsStrategyBuilderProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [customLegs, setCustomLegs] = useState<OptionLeg[]>([]);
  const [strategyAnalysis, setStrategyAnalysis] = useState<any>(null);
  const [showPayoffChart, setShowPayoffChart] = useState(false);

  const predefinedStrategies = OptionsService.getOptionStrategies();

  useEffect(() => {
    if (selectedStrategy || customLegs.length > 0) {
      analyzeStrategy();
    }
  }, [selectedStrategy, customLegs, spotPrice]);

  const analyzeStrategy = () => {
    let legs: OptionLeg[] = [];
    
    if (selectedStrategy) {
      const strategy = predefinedStrategies.find(s => s.id === selectedStrategy);
      if (strategy) {
        legs = strategy.legs.map(leg => ({
          ...leg,
          strike: leg.strike || getDefaultStrike(leg.type),
          premium: calculatePremium(leg.strike || getDefaultStrike(leg.type), leg.type)
        }));
      }
    } else {
      legs = customLegs;
    }

    // Calculate strategy metrics
    const analysis = calculateStrategyMetrics(legs);
    setStrategyAnalysis(analysis);
  };

  const getDefaultStrike = (type: 'CE' | 'PE'): number => {
    // Default to ATM strikes
    return Math.round(spotPrice / 50) * 50;
  };

  const calculatePremium = (strike: number, type: 'CE' | 'PE'): number => {
    // Simplified premium calculation
    const timeToExpiry = 30 / 365; // 30 days
    const volatility = 0.25;
    return OptionsService.calculateOptionPrice(spotPrice, strike, timeToExpiry, volatility, 0.06, type);
  };

  const calculateStrategyMetrics = (legs: OptionLeg[]) => {
    let totalCost = 0;
    let totalCredit = 0;
    let maxProfit = 0;
    let maxLoss = 0;
    let breakevens: number[] = [];

    legs.forEach(leg => {
      const cost = leg.premium * leg.quantity;
      if (leg.action === 'BUY') {
        totalCost += cost;
      } else {
        totalCredit += cost;
      }
    });

    const netDebit = totalCost - totalCredit;
    
    // Simplified P&L calculation for common strategies
    if (legs.length === 1) {
      const leg = legs[0];
      if (leg.action === 'BUY') {
        maxLoss = leg.premium * leg.quantity;
        maxProfit = leg.type === 'CE' ? Infinity : (leg.strike - leg.premium) * leg.quantity;
        breakevens = [leg.type === 'CE' ? leg.strike + leg.premium : leg.strike - leg.premium];
      } else {
        maxProfit = leg.premium * leg.quantity;
        maxLoss = leg.type === 'CE' ? Infinity : (leg.strike - leg.premium) * leg.quantity;
        breakevens = [leg.type === 'CE' ? leg.strike + leg.premium : leg.strike - leg.premium];
      }
    }

    return {
      netDebit,
      maxProfit,
      maxLoss,
      breakevens,
      riskReward: maxLoss > 0 ? maxProfit / maxLoss : Infinity,
      probabilityOfProfit: calculateProbabilityOfProfit(legs, spotPrice)
    };
  };

  const calculateProbabilityOfProfit = (legs: OptionLeg[], spot: number): number => {
    // Simplified probability calculation
    // In reality, this would use more complex statistical models
    return Math.random() * 100; // Placeholder
  };

  const addCustomLeg = () => {
    const newLeg: OptionLeg = {
      action: 'BUY',
      type: 'CE',
      strike: getDefaultStrike('CE'),
      quantity: 1,
      premium: calculatePremium(getDefaultStrike('CE'), 'CE')
    };
    setCustomLegs([...customLegs, newLeg]);
  };

  const updateCustomLeg = (index: number, updates: Partial<OptionLeg>) => {
    const updatedLegs = [...customLegs];
    updatedLegs[index] = { ...updatedLegs[index], ...updates };
    
    // Recalculate premium if strike or type changed
    if (updates.strike || updates.type) {
      updatedLegs[index].premium = calculatePremium(
        updatedLegs[index].strike, 
        updatedLegs[index].type
      );
    }
    
    setCustomLegs(updatedLegs);
  };

  const removeCustomLeg = (index: number) => {
    setCustomLegs(customLegs.filter((_, i) => i !== index));
  };

  const executeStrategy = () => {
    if (!strategyAnalysis) return;

    const strategy: OptionStrategy = {
      id: selectedStrategy || 'custom',
      name: selectedStrategy ? predefinedStrategies.find(s => s.id === selectedStrategy)?.name || 'Custom Strategy' : 'Custom Strategy',
      description: 'User created strategy',
      legs: selectedStrategy ? 
        predefinedStrategies.find(s => s.id === selectedStrategy)?.legs || [] : 
        customLegs,
      maxProfit: strategyAnalysis.maxProfit,
      maxLoss: strategyAnalysis.maxLoss,
      breakeven: strategyAnalysis.breakevens,
      margin: Math.abs(strategyAnalysis.netDebit),
      riskReward: strategyAnalysis.riskReward
    };

    onExecuteStrategy(strategy);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LightBulbIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Options Strategy Builder
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {symbol} • Spot: ₹{spotPrice.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPayoffChart(!showPayoffChart)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <ChartBarIcon className="h-4 w-4 inline mr-1" />
            {showPayoffChart ? 'Hide' : 'Show'} Chart
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Strategy Selection */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose Strategy Type
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Predefined Strategies
              </label>
              <select
                value={selectedStrategy}
                onChange={(e) => {
                  setSelectedStrategy(e.target.value);
                  setCustomLegs([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a strategy...</option>
                {predefinedStrategies.map(strategy => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedStrategy('');
                  setCustomLegs([]);
                  addCustomLeg();
                }}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Build Custom Strategy
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Description */}
        {selectedStrategy && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-800 dark:text-blue-200">
                  {predefinedStrategies.find(s => s.id === selectedStrategy)?.name}
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {predefinedStrategies.find(s => s.id === selectedStrategy)?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Strategy Builder */}
        {!selectedStrategy && customLegs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Strategy Legs
              </h4>
              <button
                onClick={addCustomLeg}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Leg
              </button>
            </div>

            <div className="space-y-3">
              {customLegs.map((leg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <select
                    value={leg.action}
                    onChange={(e) => updateCustomLeg(index, { action: e.target.value as 'BUY' | 'SELL' })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>

                  <select
                    value={leg.type}
                    onChange={(e) => updateCustomLeg(index, { type: e.target.value as 'CE' | 'PE' })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="CE">CALL</option>
                    <option value="PE">PUT</option>
                  </select>

                  <input
                    type="number"
                    value={leg.strike}
                    onChange={(e) => updateCustomLeg(index, { strike: parseFloat(e.target.value) })}
                    placeholder="Strike"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
                  />

                  <input
                    type="number"
                    value={leg.quantity}
                    onChange={(e) => updateCustomLeg(index, { quantity: parseInt(e.target.value) })}
                    placeholder="Qty"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
                  />

                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    ₹{leg.premium.toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeCustomLeg(index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Strategy Analysis */}
        {strategyAnalysis && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CalculatorIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Strategy Analysis
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Net Debit/Credit</div>
                <div className={`text-lg font-bold ${
                  strategyAnalysis.netDebit >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {strategyAnalysis.netDebit >= 0 ? '-' : '+'}₹{Math.abs(strategyAnalysis.netDebit).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Max Profit</div>
                <div className="text-lg font-bold text-green-600">
                  {strategyAnalysis.maxProfit === Infinity ? 'Unlimited' : `₹${strategyAnalysis.maxProfit.toLocaleString()}`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Max Loss</div>
                <div className="text-lg font-bold text-red-600">
                  {strategyAnalysis.maxLoss === Infinity ? 'Unlimited' : `₹${strategyAnalysis.maxLoss.toLocaleString()}`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Risk:Reward</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {strategyAnalysis.riskReward === Infinity ? '∞' : `1:${strategyAnalysis.riskReward.toFixed(2)}`}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Breakeven Points</div>
              <div className="flex flex-wrap gap-2">
                {strategyAnalysis.breakevens.map((be: number, index: number) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-sm">
                    ₹{be.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Execute Button */}
        {strategyAnalysis && (
          <div className="flex justify-end">
            <button
              onClick={executeStrategy}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Execute Strategy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
