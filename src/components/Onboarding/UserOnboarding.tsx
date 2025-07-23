'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { TradingService } from '../../services/tradingService';
import toast from 'react-hot-toast';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function UserOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    experience: '',
    riskTolerance: '',
    investmentGoals: '',
    monthlyIncome: '',
    tradingBudget: '',
    preferredSectors: [] as string[],
  });
  const { user, updateUserData } = useAuth();

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to TradeKaro! 🎉",
      description: "Let's set up your trading profile to personalize your experience",
      component: <WelcomeStep />
    },
    {
      id: 2,
      title: "Trading Experience",
      description: "Help us understand your trading background",
      component: <ExperienceStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 3,
      title: "Risk Profile",
      description: "Let's assess your risk tolerance",
      component: <RiskProfileStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 4,
      title: "Investment Goals",
      description: "What are you looking to achieve?",
      component: <GoalsStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 5,
      title: "Financial Profile",
      description: "Help us recommend appropriate strategies",
      component: <FinancialStep userData={userData} setUserData={setUserData} />
    },
    {
      id: 6,
      title: "Sector Preferences",
      description: "Which sectors interest you most?",
      component: <SectorStep userData={userData} setUserData={setUserData} />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      console.log('Starting onboarding completion...');

      // Save user profile data
      if (user) {
        console.log('Updating user profile...');

        // Update user data in context immediately
        updateUserData({
          ...userData,
          onboardingCompleted: true,
          completedAt: new Date(),
        });

        // Also save to backend/localStorage
        await TradingService.updateUserProfile(user.uid, {
          ...userData,
          onboardingCompleted: true,
          completedAt: new Date(),
        });

        console.log('Initializing user portfolio...');
        // Initialize user's portfolio with starting balance
        await TradingService.initializeUserPortfolio(user.uid, {
          startingBalance: parseInt(process.env.NEXT_PUBLIC_STARTING_BALANCE || '500000'),
          riskProfile: userData.riskTolerance,
          investmentGoals: userData.investmentGoals,
        });

        console.log('Onboarding completed successfully!');
      }

      toast.success('Welcome to TradeKaro! Your account is ready.');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>

            {steps[currentStep].component}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Individual Step Components
function WelcomeStep() {
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🚀</span>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        You're about to join thousands of traders who are mastering the Indian stock market with TradeKaro.
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-sm font-medium">Real Market Data</div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-sm font-medium">Virtual Trading</div>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-sm font-medium">Learn & Earn</div>
        </div>
      </div>
    </div>
  );
}

function ExperienceStep({ userData, setUserData }: any) {
  const experiences = [
    { value: 'beginner', label: 'Beginner', desc: 'New to stock trading' },
    { value: 'intermediate', label: 'Intermediate', desc: '1-3 years experience' },
    { value: 'advanced', label: 'Advanced', desc: '3+ years experience' },
    { value: 'expert', label: 'Expert', desc: 'Professional trader' }
  ];

  return (
    <div className="space-y-4">
      {experiences.map((exp) => (
        <motion.button
          key={exp.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUserData({ ...userData, experience: exp.value })}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            userData.experience === exp.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="font-semibold text-gray-900 dark:text-white">{exp.label}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{exp.desc}</div>
        </motion.button>
      ))}
    </div>
  );
}

function RiskProfileStep({ userData, setUserData }: any) {
  const riskLevels = [
    { value: 'conservative', label: 'Conservative', desc: 'Prefer stable, low-risk investments' },
    { value: 'moderate', label: 'Moderate', desc: 'Balanced approach to risk and reward' },
    { value: 'aggressive', label: 'Aggressive', desc: 'Comfortable with high-risk, high-reward' }
  ];

  return (
    <div className="space-y-4">
      {riskLevels.map((risk) => (
        <motion.button
          key={risk.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUserData({ ...userData, riskTolerance: risk.value })}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            userData.riskTolerance === risk.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="font-semibold text-gray-900 dark:text-white">{risk.label}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{risk.desc}</div>
        </motion.button>
      ))}
    </div>
  );
}

function GoalsStep({ userData, setUserData }: any) {
  const goals = [
    { value: 'wealth_building', label: 'Wealth Building', desc: 'Long-term wealth accumulation' },
    { value: 'income_generation', label: 'Income Generation', desc: 'Regular dividend income' },
    { value: 'capital_appreciation', label: 'Capital Appreciation', desc: 'Growth-focused investing' },
    { value: 'learning', label: 'Learning', desc: 'Educational and skill development' }
  ];

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <motion.button
          key={goal.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUserData({ ...userData, investmentGoals: goal.value })}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            userData.investmentGoals === goal.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="font-semibold text-gray-900 dark:text-white">{goal.label}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{goal.desc}</div>
        </motion.button>
      ))}
    </div>
  );
}

function FinancialStep({ userData, setUserData }: any) {
  const incomeRanges = [
    { value: '0-25000', label: '₹0 - ₹25,000', desc: 'Student/Entry level' },
    { value: '25000-50000', label: '₹25,000 - ₹50,000', desc: 'Early career' },
    { value: '50000-100000', label: '₹50,000 - ₹1,00,000', desc: 'Mid career' },
    { value: '100000+', label: '₹1,00,000+', desc: 'Senior professional' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Monthly Income Range</h3>
        <div className="space-y-3">
          {incomeRanges.map((income) => (
            <motion.button
              key={income.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserData({ ...userData, monthlyIncome: income.value })}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                userData.monthlyIncome === income.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">{income.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{income.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectorStep({ userData, setUserData }: any) {
  const sectors = [
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'banking', label: 'Banking & Finance', icon: '🏦' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'energy', label: 'Energy & Power', icon: '⚡' },
    { value: 'consumer', label: 'Consumer Goods', icon: '🛍️' },
    { value: 'automotive', label: 'Automotive', icon: '🚗' },
    { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
    { value: 'telecom', label: 'Telecommunications', icon: '📱' }
  ];

  const toggleSector = (sector: string) => {
    const current = userData.preferredSectors || [];
    const updated = current.includes(sector)
      ? current.filter((s: string) => s !== sector)
      : [...current, sector];
    setUserData({ ...userData, preferredSectors: updated });
  };

  return (
    <div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select the sectors you're most interested in (choose multiple):
      </p>
      <div className="grid grid-cols-2 gap-3">
        {sectors.map((sector) => (
          <motion.button
            key={sector.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSector(sector.value)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              userData.preferredSectors?.includes(sector.value)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{sector.icon}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {sector.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
