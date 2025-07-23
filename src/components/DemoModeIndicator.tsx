'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function DemoModeIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const isDemo = !apiKey || 
                   apiKey === 'AIzaSyBvXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX' ||
                   apiKey.includes('XxXxXx');
    
    setIsDemoMode(isDemo);
    
    if (isDemo) {
      // Show indicator after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isDemoMode) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg border border-white/20 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold text-sm">DEMO MODE</span>
              </div>
              
              <div className="text-sm">
                All features available • No setup required • ₹5,00,000 virtual money
              </div>
              
              <button
                onClick={() => setIsVisible(false)}
                className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
