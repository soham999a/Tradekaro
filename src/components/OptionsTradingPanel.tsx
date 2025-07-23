'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  CalculatorIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import OptionsService, { type OptionContract } from '../services/optionsService';
import toast from 'react-hot-toast';

interface OptionsTradingPanelProps {
  option: OptionContract | null;
  action: 'BUY' | 'SELL';
  spotPrice: number;
  onClose: () => void;
  onPlaceOrder: (orderData: any) => void;
}

interface OrderDetails {
  quantity: number; // Number of lots
  orderType: 'MARKET' | 'LIMIT';
  limitPrice?: number;
  stopLoss?: number;
  target?: number;
}

export default function OptionsTradingPanel({ 
  option, 
  action, 
  spotPrice, 
  onClose, 
  onPlaceOrder 
}: OptionsTradingPanelProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    quantity: 1,
    orderType: 'MARKET',
    limitPrice: option?.premium,
    stopLoss: undefined,
    target: undefined
  });

  const [calculations, setCalculations] = useState({
    totalPremium: 0,
    margin: 0,
    maxProfit: 0,
    maxLoss: 0,
    breakeven: 0,
    intrinsicValue: 0,
    timeValue: 0
  });

  useEffect(() => {
    if (option) {
      calculateOrderMetrics();
    }
  }, [option, orderDetails, spotPrice]);

  const calculateOrderMetrics = () => {
    if (!option) return;

    const premium = orderDetails.orderType === 'MARKET' ? option.premium : (orderDetails.limitPrice || option.premium);
    const totalQuantity = orderDetails.quantity * option.lotSize;
    const totalPremium = premium * totalQuantity;

    // Calculate margin
    const margin = OptionsService.calculateMargin(
      action,
      option.type,
      premium,
      spotPrice,
      option.strike,
      orderDetails.quantity,
      option.lotSize
    );

    // Calculate intrinsic and time value
    const intrinsicValue = option.type === 'CE' 
      ? Math.max(0, spotPrice - option.strike)
      : Math.max(0, option.strike - spotPrice);
    const timeValue = Math.max(0, premium - intrinsicValue);

    // Calculate P&L scenarios
    let maxProfit = 0;
    let maxLoss = 0;
    let breakeven = 0;

    if (action === 'BUY') {
      if (option.type === 'CE') {
        maxProfit = Infinity; // Unlimited upside for long calls
        maxLoss = totalPremium;
        breakeven = option.strike + premium;
      } else {
        maxProfit = (option.strike - premium) * totalQuantity;
        maxLoss = totalPremium;
        breakeven = option.strike - premium;
      }
    } else {
      if (option.type === 'CE') {
        maxProfit = totalPremium;
        maxLoss = Infinity; // Unlimited risk for short calls
        breakeven = option.strike + premium;
      } else {
        maxProfit = totalPremium;
        maxLoss = (option.strike - premium) * totalQuantity;
        breakeven = option.strike - premium;
      }
    }

    setCalculations({
      totalPremium,
      margin,
      maxProfit,
      maxLoss,
      breakeven,
      intrinsicValue,
      timeValue
    });
  };

  const handlePlaceOrder = () => {
    if (!option) return;

    // Validation
    if (orderDetails.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (orderDetails.orderType === 'LIMIT' && (!orderDetails.limitPrice || orderDetails.limitPrice <= 0)) {
      toast.error('Please enter a valid limit price');
      return;
    }

    const orderData = {
      type: 'OPTION',
      symbol: option.symbol,
      optionType: option.type,
      strike: option.strike,
      expiry: option.expiry,
      action,
      quantity: orderDetails.quantity,
      lotSize: option.lotSize,
      orderType: orderDetails.orderType,
      premium: orderDetails.orderType === 'MARKET' ? option.premium : orderDetails.limitPrice,
      stopLoss: orderDetails.stopLoss,
      target: orderDetails.target,
      margin: calculations.margin,
      totalPremium: calculations.totalPremium
    };

    onPlaceOrder(orderData);
    onClose();
  };

  const getDaysToExpiry = () => {
    if (!option) return 0;
    const expiry = new Date(option.expiry);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getMoneyness = () => {
    if (!option) return '';
    const diff = Math.abs(option.strike - spotPrice);
    if (diff <= spotPrice * 0.02) return 'ATM';
    
    if (option.type === 'CE') {
      return option.strike < spotPrice ? 'ITM' : 'OTM';
    } else {
      return option.strike > spotPrice ? 'ITM' : 'OTM';
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

  if (!option) return null;

  const moneyness = getMoneyness();
  const daysToExpiry = getDaysToExpiry();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {action} {option.symbol} {option.strike} {option.type}
              </h3>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoneynessBadgeColor(moneyness)}`}>
                  {moneyness}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Expires in {daysToExpiry} days
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Lot Size: {option.lotSize}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Option Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">LTP</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">₹{option.premium.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">IV</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{option.impliedVolatility}%</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Delta</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{option.delta.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Theta</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{option.theta.toFixed(3)}</div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Order Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity (Lots)
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderDetails.quantity}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total Shares: {orderDetails.quantity * option.lotSize}
                </div>
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Type
                </label>
                <select
                  value={orderDetails.orderType}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, orderType: e.target.value as 'MARKET' | 'LIMIT' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>

              {/* Limit Price */}
              {orderDetails.orderType === 'LIMIT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Limit Price
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={orderDetails.limitPrice}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, limitPrice: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Stop Loss */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss (Optional)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={orderDetails.stopLoss || ''}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, stopLoss: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter SL price"
                />
              </div>
            </div>
          </div>

          {/* Calculations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CalculatorIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Order Calculations</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Premium</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{calculations.totalPremium.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Margin Required</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{calculations.margin.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Breakeven</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{calculations.breakeven.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Max Profit</div>
                <div className="text-lg font-bold text-green-600">
                  {calculations.maxProfit === Infinity ? 'Unlimited' : `₹${calculations.maxProfit.toLocaleString()}`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Max Loss</div>
                <div className="text-lg font-bold text-red-600">
                  {calculations.maxLoss === Infinity ? 'Unlimited' : `₹${calculations.maxLoss.toLocaleString()}`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Time Value</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{calculations.timeValue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          {action === 'SELL' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Risk Warning</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Selling options involves unlimited risk potential. Ensure you have adequate margin and risk management in place.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                action === 'BUY'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {action} Option
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
