'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getMarketIndices } from '../lib/marketData';
import type { MarketIndex } from '../lib/marketData';

export default function ProductLanding() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<MarketIndex[]>([]);
  const [userCount, setUserCount] = useState(47832);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const data = await getMarketIndices();
        setMarketData(data);
      } catch (error) {
        console.error('Error loading market data:', error);
      }
    };

    loadMarketData();
    
    // Simulate growing user count
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Real Indian Market Data",
      description: "Live NSE & BSE data with real-time price updates",
      icon: "📈"
    },
    {
      title: "Virtual Trading",
      description: "Practice with ₹5,00,000 virtual money - no risk",
      icon: "💰"
    },
    {
      title: "Professional Tools",
      description: "Advanced charts, technical indicators, and analytics",
      icon: "🛠️"
    },
    {
      title: "Mobile Ready",
      description: "Trade on-the-go with our responsive platform",
      icon: "📱"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Software Engineer, Bangalore",
      content: "TradeKaro helped me learn stock trading without losing real money. Now I'm confident to start real trading!",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "MBA Student, Mumbai",
      content: "The best platform to understand Indian stock market. Real data, virtual money - perfect combination!",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Business Owner, Ahmedabad",
      content: "I've tried many trading simulators, but TradeKaro's Indian market focus makes it the best choice.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {userCount.toLocaleString('en-IN')}+ Active Traders
              </div>

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                Master Indian Stock Trading
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Learn, practice, and perfect your trading skills with real NSE & BSE market data. 
                Start with ₹5,00,000 virtual money and trade like a pro - completely risk-free.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/auth/register')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                >
                  Start Trading Free
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all duration-200 flex items-center justify-center"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Watch Demo
                </motion.button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                  No Credit Card Required
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                  100% Free to Start
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                  Real Market Data
                </div>
              </div>
            </motion.div>

            {/* Right Column - Market Data */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-200/50 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Live Indian Market
                </h3>
                
                <div className="space-y-4">
                  {marketData.map((index, idx) => (
                    <motion.div
                      key={index.symbol}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                    >
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {index.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {index.symbol}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm flex items-center ${
                          index.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span className="mr-1">
                            {index.change >= 0 ? '↗' : '↘'}
                          </span>
                          {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Real-time data from NSE & BSE
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Learn Trading
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Professional-grade tools and real market data to help you become a successful trader
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Traders Across India
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of successful traders who started with TradeKaro
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join {userCount.toLocaleString('en-IN')}+ traders who are already learning with TradeKaro
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register')}
              className="px-12 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Free Today
            </motion.button>
            <p className="text-blue-100 mt-4 text-sm">
              No credit card required • Start with ₹5,00,000 virtual money
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
