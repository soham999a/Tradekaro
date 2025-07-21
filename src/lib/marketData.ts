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
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface Portfolio {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  cash: number;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

const INDIAN_STOCKS = {
  'RELIANCE': 'Reliance Industries Ltd',
  'TCS': 'Tata Consultancy Services',
  'INFY': 'Infosys Limited',
  'HDFCBANK': 'HDFC Bank Limited',
  'ICICIBANK': 'ICICI Bank Limited',
  'HINDUNILVR': 'Hindustan Unilever Ltd',
  'ITC': 'ITC Limited',
  'SBIN': 'State Bank of India',
  'BHARTIARTL': 'Bharti Airtel Limited',
  'KOTAKBANK': 'Kotak Mahindra Bank',
  'LT': 'Larsen & Toubro',
  'WIPRO': 'Wipro Limited',
  'MARUTI': 'Maruti Suzuki India',
  'BAJFINANCE': 'Bajaj Finance',
  'HCLTECH': 'HCL Technologies'
};

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

export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  // Simulate API call with realistic data
  const basePrice = BASE_PRICES[symbol] || (Math.random() * 3000 + 500);
  const variation = (Math.random() - 0.5) * 0.05; // ±5% variation
  const currentPrice = basePrice * (1 + variation);
  const change = currentPrice - basePrice;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name: INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS] || symbol,
    price: currentPrice,
    change,
    changePercent,
    high: currentPrice + Math.random() * 50,
    low: currentPrice - Math.random() * 50,
    open: basePrice + (Math.random() - 0.5) * 20,
    previousClose: basePrice,
    volume: Math.floor(Math.random() * 1000000) + 100000
  };
};

export const getMultipleStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const promises = symbols.map(symbol => getStockQuote(symbol));
  const results = await Promise.all(promises);
  return results.filter(quote => quote !== null) as StockQuote[];
};

export const getMarketIndices = async (): Promise<MarketIndex[]> => {
  const baseNifty = 24567.85;
  const baseSensex = 80234.67;
  const baseBankNifty = 52345.90;
  
  return [
    {
      name: 'NIFTY 50',
      value: baseNifty + (Math.random() - 0.5) * 200,
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 1
    },
    {
      name: 'SENSEX',
      value: baseSensex + (Math.random() - 0.5) * 400,
      change: (Math.random() - 0.5) * 200,
      changePercent: (Math.random() - 0.5) * 0.8
    },
    {
      name: 'BANK NIFTY',
      value: baseBankNifty + (Math.random() - 0.5) * 300,
      change: (Math.random() - 0.5) * 150,
      changePercent: (Math.random() - 0.5) * 0.6
    }
  ];
};

export const searchStocks = async (query: string): Promise<StockQuote[]> => {
  const allSymbols = Object.keys(INDIAN_STOCKS);
  const filteredSymbols = allSymbols.filter(symbol => 
    symbol.toLowerCase().includes(query.toLowerCase()) ||
    INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS].toLowerCase().includes(query.toLowerCase())
  );
  
  return getMultipleStockQuotes(filteredSymbols.slice(0, 10));
};

export const getTrendingStocks = async (): Promise<StockQuote[]> => {
  const trendingSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];
  return getMultipleStockQuotes(trendingSymbols);
};

export const getTopGainers = async (): Promise<StockQuote[]> => {
  const symbols = Object.keys(INDIAN_STOCKS);
  const stocks = await getMultipleStockQuotes(symbols);
  return stocks.sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
};

export const getTopLosers = async (): Promise<StockQuote[]> => {
  const symbols = Object.keys(INDIAN_STOCKS);
  const stocks = await getMultipleStockQuotes(symbols);
  return stocks.sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
};

export const getMostActive = async (): Promise<StockQuote[]> => {
  const symbols = Object.keys(INDIAN_STOCKS);
  const stocks = await getMultipleStockQuotes(symbols);
  return stocks.sort((a, b) => b.volume - a.volume).slice(0, 5);
};

export const isMarketOpen = (): boolean => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const day = istTime.getDay();
  
  // Market is closed on weekends
  if (day === 0 || day === 6) return false;
  
  // Market hours: 9:15 AM to 3:30 PM IST
  const marketOpen = 9 * 60 + 15; // 9:15 AM in minutes
  const marketClose = 15 * 60 + 30; // 3:30 PM in minutes
  const currentTime = hours * 60 + minutes;
  
  return currentTime >= marketOpen && currentTime <= marketClose;
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
