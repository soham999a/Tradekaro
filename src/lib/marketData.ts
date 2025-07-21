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

const INDIAN_STOCKS = {
  "RELIANCE": "Reliance Industries Ltd",
  "TCS": "Tata Consultancy Services",
  "INFY": "Infosys Limited",
  "HDFCBANK": "HDFC Bank Limited",
  "ICICIBANK": "ICICI Bank Limited",
  "HINDUNILVR": "Hindustan Unilever Ltd",
  "ITC": "ITC Limited",
  "SBIN": "State Bank of India",
  "BHARTIARTL": "Bharti Airtel Limited",
  "KOTAKBANK": "Kotak Mahindra Bank"
};

export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  // Simulate API call with realistic data
  const basePrice = Math.random() * 3000 + 500;
  const change = (Math.random() - 0.5) * 100;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name: INDIAN_STOCKS[symbol as keyof typeof INDIAN_STOCKS] || symbol,
    price: basePrice,
    change,
    changePercent,
    high: basePrice + Math.random() * 50,
    low: basePrice - Math.random() * 50,
    open: basePrice + (Math.random() - 0.5) * 20,
    previousClose: basePrice - change,
    volume: Math.floor(Math.random() * 1000000)
  };
};

export const getMultipleStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const promises = symbols.map(symbol => getStockQuote(symbol));
  const results = await Promise.all(promises);
  return results.filter(quote => quote !== null) as StockQuote[];
};

export const getMarketIndices = async (): Promise<MarketIndex[]> => {
  return [
    {
      name: "NIFTY 50",
      value: 24567.85 + (Math.random() - 0.5) * 100,
      change: 156.30 + (Math.random() - 0.5) * 50,
      changePercent: 0.64 + (Math.random() - 0.5) * 0.5
    },
    {
      name: "SENSEX",
      value: 80234.67 + (Math.random() - 0.5) * 200,
      change: 298.45 + (Math.random() - 0.5) * 100,
      changePercent: 0.37 + (Math.random() - 0.5) * 0.3
    },
    {
      name: "BANK NIFTY",
      value: 52345.90 + (Math.random() - 0.5) * 150,
      change: -89.23 + (Math.random() - 0.5) * 80,
      changePercent: -0.17 + (Math.random() - 0.5) * 0.4
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

export const isMarketOpen = (): boolean => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const day = istTime.getDay();
  
  if (day === 0 || day === 6) return false;
  
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;
  const currentTime = hours * 60 + minutes;
  
  return currentTime >= marketOpen && currentTime <= marketClose;
};
