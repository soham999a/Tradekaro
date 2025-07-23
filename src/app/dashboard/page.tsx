'use client';

import { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Dashboard from '../../components/Dashboard';
import TradingInterface from '../../components/TradingInterface';
import Portfolio from '../../components/Portfolio';
import MarketAnalysis from '../../components/MarketAnalysis';
import TransactionHistory from '../../components/TransactionHistory';
import Header from '../../components/Header';
import MarketTicker from '../../components/MarketTicker';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'trading':
        return <TradingInterface onBack={() => setCurrentView('dashboard')} />;
      case 'portfolio':
        return <Portfolio onBack={() => setCurrentView('dashboard')} />;
      case 'analysis':
        return <MarketAnalysis onBack={() => setCurrentView('dashboard')} />;
      case 'history':
        return <TransactionHistory onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <MarketTicker />
        {renderCurrentView()}
      </div>
    </ProtectedRoute>
  );
}
