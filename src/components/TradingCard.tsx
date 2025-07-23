'use client';

import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface TradingCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  icon?: React.ReactNode;
  gradient?: string;
  delay?: number;
}

export default function TradingCard({ 
  title, 
  value, 
  change, 
  changePercent, 
  icon, 
  gradient = 'from-blue-500 to-blue-600',
  delay = 0 
}: TradingCardProps) {
  const isPositive = change ? change >= 0 : true;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
      
      {/* Card content */}
      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}>
            {icon || (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
          </div>
          
          {change !== undefined && (
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
              isPositive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span>
                {isPositive ? '+' : ''}{change}
                {changePercent !== undefined && ` (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
        </div>
        
        {/* Animated background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 dark:opacity-10 overflow-hidden rounded-2xl">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
            <path d="M20,20 L80,20 L80,80 L20,80 Z" className="animate-pulse" />
            <path d="M30,30 L70,30 L70,70 L30,70 Z" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <path d="M40,40 L60,40 L60,60 L40,60 Z" className="animate-pulse" style={{ animationDelay: '1s' }} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// Specialized card variants
export function PortfolioCard({ totalValue, totalPnL, totalPnLPercent }: {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}) {
  return (
    <TradingCard
      title="Portfolio Value"
      value={`₹${totalValue.toLocaleString('en-IN')}`}
      change={totalPnL}
      changePercent={totalPnLPercent}
      gradient="from-purple-500 to-purple-600"
      icon={
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      }
    />
  );
}

export function BalanceCard({ balance }: { balance: number }) {
  return (
    <TradingCard
      title="Available Balance"
      value={`₹${balance.toLocaleString('en-IN')}`}
      gradient="from-green-500 to-green-600"
      delay={0.1}
      icon={
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    />
  );
}

export function DayChangeCard({ dayChange, dayChangePercent }: {
  dayChange: number;
  dayChangePercent: number;
}) {
  return (
    <TradingCard
      title="Today's Change"
      value={`₹${Math.abs(dayChange).toLocaleString('en-IN')}`}
      change={dayChange}
      changePercent={dayChangePercent}
      gradient={dayChange >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"}
      delay={0.2}
      icon={
        dayChange >= 0 ? (
          <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
        ) : (
          <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
        )
      }
    />
  );
}

export function TotalInvestedCard({ totalInvested }: { totalInvested: number }) {
  return (
    <TradingCard
      title="Total Invested"
      value={`₹${totalInvested.toLocaleString('en-IN')}`}
      gradient="from-indigo-500 to-indigo-600"
      delay={0.3}
      icon={
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
    />
  );
}
