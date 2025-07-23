'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  UserIcon,
  TrophyIcon,
  FireIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface SocialPost {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    rank: string;
    followers: number;
    winRate: number;
  };
  type: 'trade' | 'analysis' | 'tip' | 'achievement';
  content: string;
  trade?: {
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    pnl?: number;
    pnlPercent?: number;
  };
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isFollowing: boolean;
  tags: string[];
}

interface TopTrader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  totalReturn: number;
  winRate: number;
  followers: number;
  isFollowing: boolean;
}

export default function SocialTradingFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([
    {
      id: '1',
      user: {
        name: 'Rakesh Sharma',
        username: '@rakesh_trader',
        avatar: '👨‍💼',
        verified: true,
        rank: 'Pro Trader',
        followers: 15420,
        winRate: 78.5
      },
      type: 'trade',
      content: 'Just bought RELIANCE at a great support level. Expecting a bounce to ₹2,650 levels. Risk-reward looks favorable! 📈',
      trade: {
        symbol: 'RELIANCE',
        action: 'BUY',
        quantity: 100,
        price: 2580,
        pnl: 2500,
        pnlPercent: 4.2
      },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      likes: 234,
      comments: 45,
      shares: 12,
      isLiked: false,
      isFollowing: true,
      tags: ['RELIANCE', 'BUY', 'Support']
    },
    {
      id: '2',
      user: {
        name: 'Priya Patel',
        username: '@priya_charts',
        avatar: '👩‍💻',
        verified: true,
        rank: 'Chart Master',
        followers: 8930,
        winRate: 82.1
      },
      type: 'analysis',
      content: 'NIFTY forming a beautiful ascending triangle pattern. Breakout above 19,800 could lead to 20,200+ targets. Keep watching! 🎯',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      likes: 189,
      comments: 67,
      shares: 23,
      isLiked: true,
      isFollowing: false,
      tags: ['NIFTY', 'Technical', 'Breakout']
    },
    {
      id: '3',
      user: {
        name: 'Amit Kumar',
        username: '@amit_profits',
        avatar: '🧑‍💼',
        verified: false,
        rank: 'Rising Star',
        followers: 2340,
        winRate: 71.3
      },
      type: 'achievement',
      content: 'Just hit 25% returns this month! 🎉 Consistency is key in trading. Focus on risk management over quick profits.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 156,
      comments: 28,
      shares: 8,
      isLiked: false,
      isFollowing: false,
      tags: ['Achievement', 'Returns', 'RiskManagement']
    },
    {
      id: '4',
      user: {
        name: 'Sneha Gupta',
        username: '@sneha_trades',
        avatar: '👩‍🎓',
        verified: true,
        rank: 'Options Expert',
        followers: 12100,
        winRate: 75.8
      },
      type: 'tip',
      content: 'Pro tip: Never risk more than 2% of your capital on a single trade. This simple rule has saved me countless times! 💡',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 445,
      comments: 89,
      shares: 67,
      isLiked: true,
      isFollowing: true,
      tags: ['ProTip', 'RiskManagement', 'Trading101']
    }
  ]);

  const [topTraders, setTopTraders] = useState<TopTrader[]>([
    {
      id: '1',
      name: 'Rakesh Sharma',
      username: '@rakesh_trader',
      avatar: '👨‍💼',
      rank: 1,
      totalReturn: 45.2,
      winRate: 78.5,
      followers: 15420,
      isFollowing: true
    },
    {
      id: '2',
      name: 'Priya Patel',
      username: '@priya_charts',
      avatar: '👩‍💻',
      rank: 2,
      totalReturn: 42.8,
      winRate: 82.1,
      followers: 8930,
      isFollowing: false
    },
    {
      id: '3',
      name: 'Sneha Gupta',
      username: '@sneha_trades',
      avatar: '👩‍🎓',
      rank: 3,
      totalReturn: 38.9,
      winRate: 75.8,
      followers: 12100,
      isFollowing: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleFollow = (username: string) => {
    setPosts(prev => prev.map(post => 
      post.user.username === username 
        ? { ...post, isFollowing: !post.isFollowing }
        : post
    ));
    
    setTopTraders(prev => prev.map(trader => 
      trader.username === username 
        ? { ...trader, isFollowing: !trader.isFollowing }
        : trader
    ));
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />;
      case 'analysis':
        return <EyeIcon className="h-5 w-5 text-purple-500" />;
      case 'achievement':
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 'tip':
        return <StarIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'feed'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Social Feed
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Top Traders
        </button>
      </div>

      {activeTab === 'feed' ? (
        /* Social Feed */
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-modern p-6"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{post.user.avatar}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{post.user.name}</h4>
                      {post.user.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full">
                        {post.user.rank}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{post.user.username}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.timestamp)}</span>
                      <span>•</span>
                      <span>{post.user.winRate}% win rate</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getPostIcon(post.type)}
                  <button
                    onClick={() => handleFollow(post.user.username)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      post.isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {post.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-900 dark:text-white mb-3">{post.content}</p>
                
                {/* Trade Details */}
                {post.trade && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.trade.action === 'BUY' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {post.trade.action}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {post.trade.symbol}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {post.trade.quantity} shares @ ₹{post.trade.price}
                          </div>
                        </div>
                      </div>
                      
                      {post.trade.pnl && (
                        <div className="text-right">
                          <div className={`font-semibold ${
                            post.trade.pnl > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {post.trade.pnl > 0 ? '+' : ''}₹{post.trade.pnl.toLocaleString()}
                          </div>
                          <div className={`text-sm ${
                            post.trade.pnlPercent! > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {post.trade.pnlPercent! > 0 ? '+' : ''}{post.trade.pnlPercent}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {post.isLiked ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                    <ShareIcon className="h-5 w-5" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  {post.user.followers.toLocaleString()} followers
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Top Traders Leaderboard */
        <div className="space-y-4">
          {topTraders.map((trader, index) => (
            <motion.div
              key={trader.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-modern p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold">
                    #{trader.rank}
                  </div>
                  <div className="text-3xl">{trader.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{trader.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{trader.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">+{trader.totalReturn}%</div>
                    <div className="text-xs text-gray-500">Total Return</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{trader.winRate}%</div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{trader.followers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <button
                    onClick={() => handleFollow(trader.username)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      trader.isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {trader.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
