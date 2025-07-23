import { INDIAN_STOCKS, getStockInfo, searchStocks as searchStockDatabase } from '../data/indianStocks';
// Fixed import conflict - using imported INDIAN_STOCKS array

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  dividend?: number;
  lastUpdated?: Date;
  source?: 'ALPHA_VANTAGE' | 'TWELVE_DATA' | 'MOCK';
  // Index trading specific fields
  lotSize?: number;
  tickSize?: number;
  marginRequired?: number;
  isIndex?: boolean;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  lastUpdated?: Date;
  source?: 'ALPHA_VANTAGE' | 'TWELVE_DATA' | 'MOCK';
  // Index trading specific fields
  tradeable?: boolean;
  lotSize?: number;
  tickSize?: number;
  marginRequired?: number;
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  availableBalance: number;
}

export interface Holding {
  symbol: string;
  stockName: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}



// Base prices for realistic simulation
const BASE_PRICES: { [key: string]: number } = {
  'RELIANCE': 2450,
  'TCS': 3650,
  'INFY': 1520,
  'HDFCBANK': 1680,
  'ICICIBANK': 980,
  'HINDUNILVR': 2650,
  'ITC': 420,
  'SBIN': 780,
  'BHARTIARTL': 1180,
  'KOTAKBANK': 1750,
  'LT': 3420,
  'WIPRO': 580,
  'MARUTI': 11200,
  'BAJFINANCE': 6800,
  'HCLTECH': 1680
};

// Cache for stock prices to maintain consistency during session
const priceCache: { [symbol: string]: { price: number; timestamp: number } } = {};
const CACHE_DURATION = 30000; // 30 seconds

export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    // Check cache first
    const cached = priceCache[symbol];
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      // Use cached price with small random variation
      const variation = (Math.random() - 0.5) * 0.002; // ±0.2% variation
      const currentPrice = cached.price * (1 + variation);
      const basePrice = BASE_PRICES[symbol] || cached.price;
      const change = currentPrice - basePrice;

      return {
        symbol,
        name: INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS] || `${symbol} Ltd`,
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round((change / basePrice) * 10000) / 100,
        high: Math.round(currentPrice * 1.015 * 100) / 100,
        low: Math.round(currentPrice * 0.985 * 100) / 100,
        open: Math.round(basePrice * 100) / 100,
        previousClose: Math.round(basePrice * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        lastUpdated: new Date(),
        source: 'MOCK'
      };
    }

    // Generate new price if not in cache or expired
    const basePrice = BASE_PRICES[symbol] || (Math.random() * 3000 + 500);
    const marketHours = isMarketOpen();
    const variation = marketHours
      ? (Math.random() - 0.5) * 0.03  // ±3% during market hours
      : (Math.random() - 0.5) * 0.01; // ±1% after hours

    const currentPrice = basePrice * (1 + variation);
    const change = currentPrice - basePrice;

    // Cache the price
    priceCache[symbol] = { price: currentPrice, timestamp: now };

    return {
      symbol,
      name: INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS] || `${symbol} Ltd`,
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      high: Math.round(currentPrice * 1.02 * 100) / 100,
      low: Math.round(currentPrice * 0.98 * 100) / 100,
      open: Math.round(basePrice * 100) / 100,
      previousClose: Math.round(basePrice * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      marketCap: Math.floor(currentPrice * (Math.random() * 1000000000 + 100000000)),
      pe: Math.round((Math.random() * 30 + 10) * 100) / 100,
      dividend: Math.round((Math.random() * 5) * 100) / 100,
      lastUpdated: new Date(),
      source: 'MOCK'
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};

// Helper function to check if market is open - fixed
export const isMarketOpen = (): boolean => {
  // Get current time in IST
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentTime = hours * 60 + minutes;
  const dayOfWeek = istTime.getDay();

  // Check if it's a weekday (Monday = 1, Sunday = 0)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  // Market is closed on weekends
  if (!isWeekday) return false;

  // Pre-market session: 9:00 AM to 9:15 AM
  const preMarketOpen = 9 * 60; // 9:00 AM
  const preMarketClose = 9 * 60 + 15; // 9:15 AM

  // Regular market session: 9:15 AM to 3:30 PM
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM

  // After-market session: 3:40 PM to 4:00 PM
  const afterMarketOpen = 15 * 60 + 40; // 3:40 PM
  const afterMarketClose = 16 * 60; // 4:00 PM

  // Market is open during regular hours
  return currentTime >= marketOpen && currentTime <= marketClose;
};

// Get current IST time
export const getCurrentISTTime = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
};

// Get market session info
export const getMarketSession = (): { session: string; nextSession: string; timeToNext: string } => {
  const istTime = getCurrentISTTime();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentTime = hours * 60 + minutes;
  const dayOfWeek = istTime.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  if (!isWeekday) {
    const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    return {
      session: 'Market Closed - Weekend',
      nextSession: 'Pre-market opens Monday at 9:00 AM',
      timeToNext: `${daysToMonday} day${daysToMonday > 1 ? 's' : ''} to go`
    };
  }

  const preMarketOpen = 9 * 60; // 9:00 AM
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  const afterMarketOpen = 15 * 60 + 40; // 3:40 PM
  const afterMarketClose = 16 * 60; // 4:00 PM

  if (currentTime < preMarketOpen) {
    const timeToOpen = preMarketOpen - currentTime;
    const hoursToOpen = Math.floor(timeToOpen / 60);
    const minutesToOpen = timeToOpen % 60;
    return {
      session: 'Market Closed',
      nextSession: 'Pre-market opens at 9:00 AM',
      timeToNext: `${hoursToOpen}h ${minutesToOpen}m`
    };
  } else if (currentTime >= preMarketOpen && currentTime < marketOpen) {
    return {
      session: 'Pre-market Session',
      nextSession: 'Regular market opens at 9:15 AM',
      timeToNext: `${marketOpen - currentTime}m`
    };
  } else if (currentTime >= marketOpen && currentTime <= marketClose) {
    const timeToClose = marketClose - currentTime;
    const hoursToClose = Math.floor(timeToClose / 60);
    const minutesToClose = timeToClose % 60;
    return {
      session: 'Market Open',
      nextSession: 'Market closes at 3:30 PM',
      timeToNext: `${hoursToClose}h ${minutesToClose}m remaining`
    };
  } else if (currentTime > marketClose && currentTime < afterMarketOpen) {
    return {
      session: 'Market Closed',
      nextSession: 'After-market opens at 3:40 PM',
      timeToNext: `${afterMarketOpen - currentTime}m`
    };
  } else if (currentTime >= afterMarketOpen && currentTime <= afterMarketClose) {
    return {
      session: 'After-market Session',
      nextSession: 'Market opens tomorrow at 9:15 AM',
      timeToNext: `${afterMarketClose - currentTime}m remaining`
    };
  } else {
    return {
      session: 'Market Closed',
      nextSession: 'Market opens tomorrow at 9:15 AM',
      timeToNext: 'Opens tomorrow'
    };
  }
};

export const getMultipleStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const promises = symbols.map(symbol => getStockQuote(symbol));
  const results = await Promise.all(promises);
  return results.filter(quote => quote !== null) as StockQuote[];
};

// Index base prices and trading parameters
const INDEX_DATA = {
  'NIFTY': {
    name: 'NIFTY 50',
    basePrice: 24567.85,
    lotSize: 25,
    tickSize: 0.05,
    marginRequired: 150000,
    tradeable: true
  },
  'BANKNIFTY': {
    name: 'BANK NIFTY',
    basePrice: 52345.90,
    lotSize: 15,
    tickSize: 0.05,
    marginRequired: 200000,
    tradeable: true
  },
  'FINNIFTY': {
    name: 'NIFTY FINANCIAL SERVICES',
    basePrice: 21234.50,
    lotSize: 25,
    tickSize: 0.05,
    marginRequired: 120000,
    tradeable: true
  },
  'MIDCPNIFTY': {
    name: 'NIFTY MIDCAP SELECT',
    basePrice: 12456.75,
    lotSize: 50,
    tickSize: 0.05,
    marginRequired: 80000,
    tradeable: true
  },
  'SENSEX': {
    name: 'SENSEX',
    basePrice: 80234.67,
    lotSize: 10,
    tickSize: 0.05,
    marginRequired: 180000,
    tradeable: true
  },
  'BANKEX': {
    name: 'BSE BANKEX',
    basePrice: 56789.12,
    lotSize: 15,
    tickSize: 0.05,
    marginRequired: 160000,
    tradeable: true
  }
};

export const getMarketIndices = async (): Promise<MarketIndex[]> => {
  const marketHours = isMarketOpen();

  return Object.entries(INDEX_DATA).map(([symbol, data]) => {
    // Generate realistic price movements
    const volatility = marketHours ? 0.015 : 0.005; // Higher volatility during market hours
    const priceChange = (Math.random() - 0.5) * data.basePrice * volatility;
    const currentValue = data.basePrice + priceChange;
    const change = priceChange;
    const changePercent = (change / data.basePrice) * 100;

    // Generate high/low for the day
    const dayRange = data.basePrice * 0.02; // 2% daily range
    const high = data.basePrice + Math.random() * dayRange;
    const low = data.basePrice - Math.random() * dayRange;

    return {
      name: data.name,
      symbol,
      value: Math.round(currentValue * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      lastUpdated: new Date(),
      source: 'MOCK' as const,
      tradeable: data.tradeable,
      lotSize: data.lotSize,
      tickSize: data.tickSize,
      marginRequired: data.marginRequired
    };
  });
};

// Get individual index quote (for trading)
export const getIndexQuote = async (symbol: string): Promise<StockQuote | null> => {
  const indexData = INDEX_DATA[symbol as keyof typeof INDEX_DATA];
  if (!indexData) return null;

  const marketHours = isMarketOpen();
  const volatility = marketHours ? 0.015 : 0.005;
  const priceChange = (Math.random() - 0.5) * indexData.basePrice * volatility;
  const currentPrice = indexData.basePrice + priceChange;
  const change = priceChange;
  const changePercent = (change / indexData.basePrice) * 100;

  // Generate high/low for the day
  const dayRange = indexData.basePrice * 0.02;
  const high = indexData.basePrice + Math.random() * dayRange;
  const low = indexData.basePrice - Math.random() * dayRange;

  return {
    symbol,
    name: indexData.name,
    price: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    open: Math.round((indexData.basePrice + (Math.random() - 0.5) * indexData.basePrice * 0.005) * 100) / 100,
    previousClose: indexData.basePrice,
    volume: Math.floor(Math.random() * 1000000) + 500000,
    lastUpdated: new Date(),
    source: 'MOCK',
    // Index-specific trading info
    lotSize: indexData.lotSize,
    tickSize: indexData.tickSize,
    marginRequired: indexData.marginRequired,
    isIndex: true
  };
};

export const searchStocks = async (query: string): Promise<StockQuote[]> => {
  const results: StockQuote[] = [];

  // Search indices first if query matches
  const indexMatches = Object.entries(INDEX_DATA).filter(([symbol, data]) =>
    symbol.toLowerCase().includes(query.toLowerCase()) ||
    data.name.toLowerCase().includes(query.toLowerCase())
  );

  // Add matching indices to results
  for (const [symbol] of indexMatches) {
    const indexQuote = await getIndexQuote(symbol);
    if (indexQuote) {
      results.push(indexQuote);
    }
  }

  // Then search stocks
  const searchResults = searchStockDatabase(query);
  const stockResults = await Promise.all(
    searchResults.slice(0, 15 - results.length).map(async (stockInfo) => {
      try {
        // Generate realistic quote data based on stock info
        const basePrice = stockInfo.basePrice;
        const volatility = 0.02;
        const randomChange = (Math.random() - 0.5) * volatility;
        const currentPrice = basePrice * (1 + randomChange);
        const change = currentPrice - basePrice;
        const changePercent = (change / basePrice) * 100;

        return {
          symbol: stockInfo.symbol,
          name: stockInfo.name,
          price: Number(currentPrice.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          high: Number((currentPrice * 1.02).toFixed(2)),
          low: Number((currentPrice * 0.98).toFixed(2)),
          open: Number((basePrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
          previousClose: basePrice,
          volume: Math.floor(Math.random() * 1000000) + 10000,
          source: 'MOCK' as const
        };
      } catch (error) {
        console.error(`Error generating quote for ${stockInfo.symbol}:`, error);
        return null;
      }
    })
  );

  // Combine indices and stocks
  results.push(...stockResults.filter((quote): quote is StockQuote => quote !== null));

  return results;
};

export const getTrendingStocks = async (): Promise<StockQuote[]> => {
  const trendingSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];
  return getMultipleStockQuotes(trendingSymbols);
};

export const getTopGainers = async (): Promise<StockQuote[]> => {
  const symbols = INDIAN_STOCKS.map(stock => stock.symbol);
  const stocks = await getMultipleStockQuotes(symbols);
  return stocks.sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
};

export const getTopLosers = async (): Promise<StockQuote[]> => {
  const symbols = INDIAN_STOCKS.map(stock => stock.symbol);
  const stocks = await getMultipleStockQuotes(symbols);
  return stocks.sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
};

export const getMostActive = async (): Promise<StockQuote[]> => {
  const symbols = INDIAN_STOCKS.map(stock => stock.symbol);
  const stocks = await getMultipleStockQuotes(symbols);
  return stocks.sort((a, b) => b.volume - a.volume).slice(0, 5);
};

export const getPortfolioData = async (): Promise<{ portfolio: Portfolio; holdings: Holding[] }> => {
  // Simulate user holdings
  const mockHoldings = [
    { symbol: 'RELIANCE', quantity: 10, avgPrice: 2400 },
    { symbol: 'TCS', quantity: 5, avgPrice: 3600 },
    { symbol: 'INFY', quantity: 15, avgPrice: 1500 },
    { symbol: 'HDFCBANK', quantity: 8, avgPrice: 1650 },
    { symbol: 'ICICIBANK', quantity: 12, avgPrice: 950 }
  ];

  const symbols = mockHoldings.map(h => h.symbol);
  const quotes = await getMultipleStockQuotes(symbols);
  
  const holdings = mockHoldings.map(holding => {
    const quote = quotes.find(q => q.symbol === holding.symbol);
    const currentPrice = quote?.price || holding.avgPrice;
    const totalValue = currentPrice * holding.quantity;
    const totalCost = holding.avgPrice * holding.quantity;
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;

    return {
      symbol: holding.symbol,
      name: quote?.name || holding.symbol,
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      currentPrice,
      totalValue,
      gainLoss,
      gainLossPercent
    };
  });

  // Calculate portfolio totals
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;

  const portfolio = {
    totalValue,
    totalGain,
    totalGainPercent,
    cash: 750000 // Available cash
  };

  return { portfolio, holdings };
};

export const placeOrder = async (orderData: {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderMode: 'MARKET' | 'LIMIT';
}): Promise<{ success: boolean; message: string }> => {
  // Simulate order placement
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { symbol, type, quantity, price, orderMode } = orderData;
  const totalValue = price * quantity;
  
  return {
    success: true,
    message: `${type} order placed successfully!\n${quantity} shares of ${symbol}\nPrice: ₹${price.toFixed(2)}\nTotal: ₹${totalValue.toLocaleString()}`
  };
};
