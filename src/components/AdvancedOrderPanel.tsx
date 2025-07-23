'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface AdvancedOrderPanelProps {
  symbol: string;
  currentPrice: number;
  onClose: () => void;
  onPlaceOrder: (orderData: any) => void;
}

type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M' | 'BRACKET' | 'COVER' | 'GTT';
type ProductType = 'CNC' | 'MIS' | 'NRML';
type ValidityType = 'DAY' | 'IOC' | 'GTT';

export default function AdvancedOrderPanel({ 
  symbol, 
  currentPrice, 
  onClose, 
  onPlaceOrder 
}: AdvancedOrderPanelProps) {
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderMode, setOrderMode] = useState<OrderType>('MARKET');
  const [product, setProduct] = useState<ProductType>('CNC');
  const [validity, setValidity] = useState<ValidityType>('DAY');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(currentPrice);
  const [triggerPrice, setTriggerPrice] = useState(0);
  
  // Advanced order parameters
  const [targetPrice, setTargetPrice] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [trailingStopLoss, setTrailingStopLoss] = useState(0);
  const [gttDays, setGttDays] = useState(1);

  const orderTypes = [
    { 
      id: 'MARKET', 
      label: 'Market', 
      description: 'Execute immediately at best available price',
      icon: '⚡'
    },
    { 
      id: 'LIMIT', 
      label: 'Limit', 
      description: 'Execute only at specified price or better',
      icon: '🎯'
    },
    { 
      id: 'SL', 
      label: 'Stop Loss', 
      description: 'Limit order triggered when price hits trigger',
      icon: '🛡️'
    },
    { 
      id: 'SL-M', 
      label: 'Stop Loss Market', 
      description: 'Market order triggered when price hits trigger',
      icon: '🚨'
    },
    { 
      id: 'BRACKET', 
      label: 'Bracket Order', 
      description: 'Order with automatic target and stop loss',
      icon: '📊'
    },
    { 
      id: 'COVER', 
      label: 'Cover Order', 
      description: 'Intraday order with compulsory stop loss',
      icon: '🔒'
    },
    { 
      id: 'GTT', 
      label: 'GTT', 
      description: 'Good Till Triggered - valid for multiple days',
      icon: '⏰'
    }
  ];

  const calculateOrderValue = () => {
    const orderPrice = orderMode === 'MARKET' ? currentPrice : price;
    return quantity * orderPrice;
  };

  const calculateMargin = () => {
    if (product === 'MIS') {
      return calculateOrderValue() * 0.2; // 20% margin for intraday
    } else if (product === 'NRML') {
      return calculateOrderValue() * 0.5; // 50% margin for F&O
    }
    return calculateOrderValue(); // 100% for CNC
  };

  const handlePlaceOrder = () => {
    const orderData = {
      symbol,
      type: orderType,
      orderMode,
      product,
      validity,
      quantity,
      price: orderMode === 'MARKET' ? currentPrice : price,
      triggerPrice,
      targetPrice: orderMode === 'BRACKET' ? targetPrice : undefined,
      stopLoss: ['BRACKET', 'COVER'].includes(orderMode) ? stopLoss : undefined,
      trailingStopLoss: orderMode === 'BRACKET' ? trailingStopLoss : undefined,
      gttDays: validity === 'GTT' ? gttDays : undefined
    };

    onPlaceOrder(orderData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Order</h2>
            <p className="text-gray-600 dark:text-gray-400">{symbol} • ₹{currentPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setOrderType('BUY')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              orderType === 'BUY'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setOrderType('SELL')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              orderType === 'SELL'
                ? 'bg-red-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Order Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Type</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {orderTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setOrderMode(type.id as OrderType)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  orderMode === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{type.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{type.label}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Order Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Price (for non-market orders) */}
          {orderMode !== 'MARKET' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Trigger Price (for SL orders) */}
          {['SL', 'SL-M'].includes(orderMode) && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trigger Price
              </label>
              <input
                type="number"
                step="0.01"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Target Price (for Bracket orders) */}
          {orderMode === 'BRACKET' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Price
              </label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Stop Loss (for Bracket/Cover orders) */}
          {['BRACKET', 'COVER'].includes(orderMode) && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.01"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Product & Validity */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Product
            </label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductType)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="CNC">CNC (Cash & Carry)</option>
              <option value="MIS">MIS (Intraday)</option>
              <option value="NRML">NRML (Normal)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Validity
            </label>
            <select
              value={validity}
              onChange={(e) => setValidity(e.target.value as ValidityType)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="DAY">DAY</option>
              <option value="IOC">IOC (Immediate or Cancel)</option>
              <option value="GTT">GTT (Good Till Triggered)</option>
            </select>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Order Value</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{calculateOrderValue().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Required Margin</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{calculateMargin().toLocaleString()}
              </span>
            </div>
            {orderMode === 'BRACKET' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Potential Profit</span>
                  <span className="font-medium text-green-600">
                    ₹{((targetPrice - price) * quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Loss</span>
                  <span className="font-medium text-red-600">
                    ₹{((price - stopLoss) * quantity).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 ${
            orderType === 'BUY'
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
          }`}
        >
          Place {orderType} Order
        </button>

        {/* Risk Disclaimer */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Risk Warning:</strong> Trading in securities involves risk. Advanced order types may not guarantee execution. 
              Please ensure you understand the risks before placing orders.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
