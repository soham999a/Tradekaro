import axios from 'axios';

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Indian stock symbols mapping
const INDIAN_STOCKS = {
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'INFY': 'INFY.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'HINDUNILVR': 'HINDUNILVR.NS',
  'ITC': 'ITC.NS',
  'SBIN': 'SBIN.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'KOTAKBANK': 'KOTAKBANK.NS'
};

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

// Get stock quote
export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    const mappedSymbol = INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS] || symbol;
    
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: mappedSymbol,
        token: FINNHUB_API_KEY
      }
    });

    const data = response.data;
    
    if (!data.c) return null;

    return {
      symbol,
      name: getStockName(symbol),
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      volume: 0 // Finnhub doesn't provide volume for Indian stocks
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};

// Get multiple stock quotes
export const getMultipleStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const promises = symbols.map(symbol => getStockQuote(symbol));
  const results = await Promise.all(promises);
  return results.filter(quote => quote !== null) as StockQuote[];
};

// Get market indices (simulated data for Indian markets)
export const getMarketIndices = async (): Promise<MarketIndex[]> => {
  // Since Finnhub doesn't provide Indian indices directly, we'll simulate the data
  // In a real app, you'd use NSE/BSE APIs or other Indian market data providers
  
  return [
    {
      name: 'NIFTY 50',
      value: 24567.85 + (Math.random() - 0.5) * 100,
      change: 156.30 + (Math.random() - 0.5) * 50,
      changePercent: 0.64 + (Math.random() - 0.5) * 0.5
    },
    {
      name: 'SENSEX',
      value: 80234.67 + (Math.random() - 0.5) * 200,
      change: 298.45 + (Math.random() - 0.5) * 100,
      changePercent: 0.37 + (Math.random() - 0.5) * 0.3
    },
    {
      name: 'BANK NIFTY',
      value: 52345.90 + (Math.random() - 0.5) * 150,
      change: -89.23 + (Math.random() - 0.5) * 80,
      changePercent: -0.17 + (Math.random() - 0.5) * 0.4
    }
  ];
};

// Get stock name from symbol
const getStockName = (symbol: string): string => {
  const stockNames: { [key: string]: string } = {
    'RELIANCE': 'Reliance Industries Ltd',
    'TCS': 'Tata Consultancy Services',
    'INFY': 'Infosys Limited',
    'HDFCBANK': 'HDFC Bank Limited',
    'ICICIBANK': 'ICICI Bank Limited',
    'HINDUNILVR': 'Hindustan Unilever Ltd',
    'ITC': 'ITC Limited',
    'SBIN': 'State Bank of India',
    'BHARTIARTL': 'Bharti Airtel Limited',
    'KOTAKBANK': 'Kotak Mahindra Bank'
  };
  
  return stockNames[symbol] || symbol;
};

// Search stocks
export const searchStocks = async (query: string): Promise<StockQuote[]> => {
  const allSymbols = Object.keys(INDIAN_STOCKS);
  const filteredSymbols = allSymbols.filter(symbol => 
    symbol.toLowerCase().includes(query.toLowerCase()) ||
    getStockName(symbol).toLowerCase().includes(query.toLowerCase())
  );
  
  return getMultipleStockQuotes(filteredSymbols.slice(0, 10));
};

// Get trending stocks
export const getTrendingStocks = async (): Promise<StockQuote[]> => {
  const trendingSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];
  return getMultipleStockQuotes(trendingSymbols);
};

// Real-time price updates (WebSocket simulation)
export const subscribeToRealTimeUpdates = (symbols: string[], callback: (data: StockQuote) => void) => {
  const interval = setInterval(async () => {
    for (const symbol of symbols) {
      const quote = await getStockQuote(symbol);
      if (quote) {
        // Add some random variation to simulate real-time updates
        quote.price += (Math.random() - 0.5) * 2;
        quote.change += (Math.random() - 0.5) * 1;
        quote.changePercent = (quote.change / quote.previousClose) * 100;
        callback(quote);
      }
    }
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
};

// Check if market is open (Indian market hours)
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
