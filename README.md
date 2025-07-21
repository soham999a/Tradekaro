# 🚀 TradeKaro - Indian Stock Trading Platform

A comprehensive, real-time Indian stock trading platform with virtual trading, portfolio management, and educational features.

![TradeKaro](https://img.shields.io/badge/TradeKaro-Indian%20Stock%20Trading-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- 📈 **Real-time Indian Market Data** - Live NSE/BSE stock prices
- 💼 **Portfolio Management** - Track investments and P&L
- 📊 **Advanced Charts** - Technical analysis with multiple indicators
- 🎓 **Educational Hub** - Learn trading strategies and market basics
- 🏆 **Leaderboard** - Compete with other traders
- 📱 **Mobile Responsive** - Trade on any device
- 🔒 **Secure Authentication** - Firebase-powered login system
- 💰 **Virtual Trading** - Practice with ₹10,00,000 virtual money

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.5 with App Router
- **Frontend**: React 18.2.0, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: TradingView Lightweight Charts
- **Market Data**: Finnhub API, Yahoo Finance
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project (free)
- Supabase project (free)
- Finnhub API key (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/soham999a/Tradekaro.git
cd Tradekaro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Environment Setup

Create a `.env.local` file with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Market Data
FINNHUB_API_KEY=your_finnhub_api_key
```

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy 🚀

## 📄 License

This project is licensed under the MIT License.

---

**⚠️ Disclaimer**: This is a virtual trading platform for educational purposes only. No real money is involved in trading activities.
