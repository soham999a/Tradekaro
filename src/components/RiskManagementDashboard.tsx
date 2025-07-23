'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  ScaleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface RiskMetrics {
  portfolioValue: number;
  maxRiskPerTrade: number;
  currentRisk: number;
  riskUtilization: number;
  stopLossCompliance: number;
  positionSizing: number;
  diversification: number;
  overallRiskScore: number;
}

interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  action?: string;
  timestamp: Date;
}

interface RiskRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  value: number;
  unit: string;
  status: 'compliant' | 'warning' | 'violation';
}

export default function RiskManagementDashboard() {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    portfolioValue: 500000,
    maxRiskPerTrade: 10000, // 2% of portfolio
    currentRisk: 7500,
    riskUtilization: 75,
    stopLossCompliance: 85,
    positionSizing: 90,
    diversification: 70,
    overallRiskScore: 78
  });

  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Concentration Risk',
      message: 'RELIANCE position exceeds 15% of portfolio. Consider reducing exposure.',
      action: 'Reduce Position',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'danger',
      title: 'Missing Stop Loss',
      message: 'TCS position has no stop loss set. This violates your risk rules.',
      action: 'Set Stop Loss',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '3',
      type: 'info',
      title: 'Good Diversification',
      message: 'Portfolio is well diversified across 8 sectors.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    }
  ]);

  const [riskRules, setRiskRules] = useState<RiskRule[]>([
    {
      id: 'max_position_size',
      name: 'Maximum Position Size',
      description: 'No single position should exceed this percentage of portfolio',
      enabled: true,
      value: 15,
      unit: '%',
      status: 'warning'
    },
    {
      id: 'max_sector_exposure',
      name: 'Maximum Sector Exposure',
      description: 'Total exposure to any single sector',
      enabled: true,
      value: 25,
      unit: '%',
      status: 'compliant'
    },
    {
      id: 'mandatory_stop_loss',
      name: 'Mandatory Stop Loss',
      description: 'All positions must have stop loss orders',
      enabled: true,
      value: 100,
      unit: '%',
      status: 'violation'
    },
    {
      id: 'max_daily_loss',
      name: 'Maximum Daily Loss',
      description: 'Maximum loss allowed in a single day',
      enabled: true,
      value: 5,
      unit: '%',
      status: 'compliant'
    },
    {
      id: 'correlation_limit',
      name: 'Correlation Limit',
      description: 'Maximum correlation between positions',
      enabled: false,
      value: 70,
      unit: '%',
      status: 'compliant'
    }
  ]);

  const [showRiskSettings, setShowRiskSettings] = useState(false);

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'violation':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const updateRiskRule = (ruleId: string, updates: Partial<RiskRule>) => {
    setRiskRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-modern p-6 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRiskScoreColor(riskMetrics.overallRiskScore)}`}>
              <span className="text-xl font-bold">{riskMetrics.overallRiskScore}</span>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Risk Score</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {riskMetrics.overallRiskScore >= 80 ? 'Low Risk' : riskMetrics.overallRiskScore >= 60 ? 'Medium Risk' : 'High Risk'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <CurrencyRupeeIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xs text-gray-500">Current Risk</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ₹{riskMetrics.currentRisk.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            of ₹{riskMetrics.maxRiskPerTrade.toLocaleString()} max
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${riskMetrics.riskUtilization}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <ShieldExclamationIcon className="h-8 w-8 text-green-600" />
            <span className="text-xs text-gray-500">Stop Loss</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {riskMetrics.stopLossCompliance}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Compliance</div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${riskMetrics.stopLossCompliance}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <ScaleIcon className="h-8 w-8 text-purple-600" />
            <span className="text-xs text-gray-500">Diversification</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {riskMetrics.diversification}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${riskMetrics.diversification}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* Risk Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-modern p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Risk Alerts</h3>
          <span className="text-sm text-gray-500">{riskAlerts.length} active</span>
        </div>

        <div className="space-y-4">
          {riskAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 rounded-xl border-l-4 ${
                alert.type === 'danger'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : alert.type === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                {alert.action && (
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                    {alert.action}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Risk Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-modern p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Risk Rules</h3>
          <button
            onClick={() => setShowRiskSettings(!showRiskSettings)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            {showRiskSettings ? 'Hide Settings' : 'Manage Rules'}
          </button>
        </div>

        <div className="space-y-4">
          {riskRules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(rule.status)}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {rule.value}{rule.unit}
                  </div>
                  <div className={`text-xs ${
                    rule.status === 'compliant' ? 'text-green-600' :
                    rule.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => updateRiskRule(rule.id, { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
