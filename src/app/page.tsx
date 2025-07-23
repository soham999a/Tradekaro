'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductLanding from '../components/ProductLanding';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../components/Dashboard';
import TradingInterface from '../components/TradingInterface';
import ProfessionalTradingInterface from '../components/ProfessionalTradingInterface';
import Portfolio from '../components/Portfolio';
import MarketAnalysis from '../components/MarketAnalysis';
import TransactionHistory from '../components/TransactionHistory';
import Header from '../components/Header';
import ResponsiveHeader from '../components/ResponsiveHeader';
import ModernDashboard from '../components/ModernDashboard';
import MarketTicker from '../components/MarketTicker';
import UserOnboarding from '../components/Onboarding/UserOnboarding';
import AIChatbot from '../components/AIChatbot';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Debug logging
    console.log('Home component state:', {
      user: !!user,
      userData: !!userData,
      loading,
      showOnboarding,
      onboardingCompleted: userData?.onboardingCompleted
    });

    // Show onboarding for new users
    if (user && userData && !userData.onboardingCompleted && !showOnboarding) {
      console.log('Showing onboarding for user:', userData);
      setShowOnboarding(true);
    }
  }, [user, userData, loading]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading TradeKaro...</h2>
          <p className="text-gray-600">Setting up your trading platform</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <ProductLanding />;
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <div>
        {/* Debug button - remove in production */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="fixed top-4 right-4 z-50 bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Reset Demo
        </button>
        <UserOnboarding
          onComplete={() => {
            console.log('Onboarding completed, hiding onboarding screen');
            setShowOnboarding(false);
          }}
        />
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user && userData && userData.onboardingCompleted) {
    const renderCurrentView = () => {
      switch (currentView) {
        case 'trading':
          return <ProfessionalTradingInterface onBack={() => setCurrentView('dashboard')} />;
        case 'portfolio':
          return <Portfolio onBack={() => setCurrentView('dashboard')} />;
        case 'analysis':
          return <MarketAnalysis onBack={() => setCurrentView('dashboard')} />;
        case 'history':
          return <TransactionHistory onBack={() => setCurrentView('dashboard')} />;
        default:
          return <ModernDashboard onViewChange={setCurrentView} />;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Debug info - remove in production */}
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded text-sm">
          Onboarding: {userData.onboardingCompleted ? 'Complete' : 'Incomplete'}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="ml-2 bg-red-500 px-2 py-1 rounded text-xs"
          >
            Reset
          </button>
        </div>
        <ResponsiveHeader currentView={currentView} onViewChange={setCurrentView} />
        <MarketTicker />
        {renderCurrentView()}

        {/* AI Chatbot - Available on all pages */}
        <AIChatbot
          marketContext={{
            marketSession: 'Market Open', // You can make this dynamic
            userPortfolio: [], // Pass actual portfolio data
            watchlist: [] // Pass actual watchlist
          }}
        />
      </div>
    );
  }

  // Fallback: Show loading if userData is not yet loaded
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Setting up your account...</p>
      </div>
    </div>
  );
}
