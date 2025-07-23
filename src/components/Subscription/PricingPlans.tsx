'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  buttonText: string;
  color: string;
}

export default function PricingPlans() {
  const { user, userData } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free Trader',
      price: 0,
      period: 'Forever',
      description: 'Perfect for beginners to start learning',
      features: [
        '₹5,00,000 virtual money',
        '10 trades per day',
        'Basic portfolio tracking',
        'Educational content',
        'Community access',
        'Mobile app access'
      ],
      limitations: [
        'Limited to 10 stocks',
        'Basic charts only',
        'No real-time alerts',
        'Standard support'
      ],
      buttonText: 'Get Started Free',
      color: 'gray'
    },
    {
      id: 'premium',
      name: 'Premium Trader',
      price: 299,
      period: 'per month',
      description: 'For serious traders who want advanced features',
      features: [
        '₹10,00,000 virtual money',
        'Unlimited trades',
        'Advanced portfolio analytics',
        'Real-time market alerts',
        'Technical indicators',
        'Priority support',
        'Advanced charts',
        'Risk analysis tools',
        'Sector analysis',
        'Export reports'
      ],
      limitations: [
        'Limited to 100 watchlist items'
      ],
      popular: true,
      buttonText: 'Upgrade to Premium',
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Pro Trader',
      price: 999,
      period: 'per month',
      description: 'For professional traders and institutions',
      features: [
        '₹50,00,000 virtual money',
        'Unlimited everything',
        'Advanced AI insights',
        'Custom indicators',
        'API access',
        'White-label options',
        'Dedicated support',
        'Custom reports',
        'Team collaboration',
        'Advanced backtesting',
        'Options trading simulation',
        'Futures trading simulation'
      ],
      limitations: [],
      buttonText: 'Go Professional',
      color: 'purple'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, integrate with Razorpay/Stripe
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        // Update user subscription
        toast.success(`Successfully subscribed to ${plan.name}!`);
        
        // Redirect to dashboard or show success
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4"
          >
            Choose Your Trading Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            Start free and upgrade as you grow. All plans include access to Indian stock market simulation.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-gray-200/50 dark:border-slate-700/50'
              } overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-semibold text-gray-900 dark:text-white mt-6">
                        Limitations:
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start">
                            <XMarkIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-500 text-sm">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing && selectedPlan === plan.id}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : plan.color === 'purple'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                      : 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is this real money trading?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No, TradeKaro is a simulation platform using virtual money. Perfect for learning without financial risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, you can cancel your subscription anytime. No long-term commitments required.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We offer a 7-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is the market data real?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, we use real Indian stock market data from NSE and BSE for authentic trading experience.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Trusted by 50,000+ traders across India
          </p>
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🔒</span>
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">📱</span>
              <span className="text-sm">Mobile Ready</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">🇮🇳</span>
              <span className="text-sm">Made in India</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
