'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
  NewspaperIcon,
  MicrophoneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import aiChatService, { type ChatMessage, type MarketContext } from '../services/aiChatService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface AIChatbotProps {
  marketContext?: MarketContext;
  currentStock?: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  };
}

export default function AIChatbot({ marketContext, currentStock }: AIChatbotProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `🚀 **Welcome to TradeKaro AI!**

I'm your intelligent trading assistant for Indian stock markets. I can help you with:

📊 **Stock Analysis** - Technical & fundamental insights
📈 **Market Insights** - Current trends and opportunities  
💡 **Trading Tips** - Strategies and risk management
🎯 **Portfolio Advice** - Position sizing and diversification

What would you like to know about today's markets?`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await aiChatService.sendMessage(
        messageToSend,
        marketContext,
        currentStock
      );

      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      let response: ChatMessage;

      switch (action) {
        case 'analyze_stock':
          if (currentStock) {
            response = await aiChatService.analyzeStock(currentStock);
          } else {
            response = await aiChatService.sendMessage("Analyze the current market leaders in NIFTY 50");
          }
          break;
        case 'market_insights':
          response = await aiChatService.getMarketInsights(marketContext || {});
          break;
        case 'trading_tips':
          response = await aiChatService.getTradingTips('intermediate');
          break;
        default:
          response = await aiChatService.sendMessage(action);
      }

      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Quick action error:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'stock_analysis':
        return <ChartBarIcon className="h-4 w-4 text-blue-500" />;
      case 'market_insight':
        return <NewspaperIcon className="h-4 w-4 text-green-500" />;
      case 'trading_tip':
        return <LightBulbIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <SparklesIcon className="h-4 w-4 text-purple-500" />;
    }
  };

  const quickActions = [
    {
      id: 'analyze_stock',
      label: currentStock ? `Analyze ${currentStock.symbol}` : 'Market Analysis',
      icon: ChartBarIcon,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'market_insights',
      label: 'Market Insights',
      icon: NewspaperIcon,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'trading_tips',
      label: 'Trading Tips',
      icon: LightBulbIcon,
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const suggestedQuestions = aiChatService.getSuggestedQuestions();

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${isOpen ? 'hidden' : 'block'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative">
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">TradeKaro AI</h3>
                    <p className="text-xs opacity-90">Your Trading Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  } rounded-2xl px-4 py-3 shadow-sm`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-2">
                        {getMessageIcon(message.type)}
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          TradeKaro AI
                        </span>
                      </div>
                    )}
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Quick Actions:</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className={`flex items-center space-x-2 p-3 bg-gradient-to-r ${action.gradient} text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about stocks, trading, or markets..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 transform hover:scale-105"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
