// Comprehensive Indian Stock Database
// NSE & BSE Listed Companies with Real Market Data

export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  marketCap: string;
  basePrice: number;
  exchange: 'NSE' | 'BSE';
  isin?: string;
  lotSize: number;
}

export const INDIAN_STOCKS: StockInfo[] = [
  // NIFTY 50 Stocks
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', marketCap: 'Large', basePrice: 2450.50, exchange: 'NSE', lotSize: 1 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT Services', marketCap: 'Large', basePrice: 3650.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', marketCap: 'Large', basePrice: 1650.80, exchange: 'NSE', lotSize: 1 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT Services', marketCap: 'Large', basePrice: 1580.25, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', marketCap: 'Large', basePrice: 950.40, exchange: 'NSE', lotSize: 1 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', marketCap: 'Large', basePrice: 2380.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', marketCap: 'Large', basePrice: 420.15, exchange: 'NSE', lotSize: 1 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', marketCap: 'Large', basePrice: 580.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', marketCap: 'Large', basePrice: 920.30, exchange: 'NSE', lotSize: 1 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', marketCap: 'Large', basePrice: 1750.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Construction', marketCap: 'Large', basePrice: 2890.20, exchange: 'NSE', lotSize: 1 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT Services', marketCap: 'Large', basePrice: 1420.85, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Paints', marketCap: 'Large', basePrice: 3180.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking', marketCap: 'Large', basePrice: 1080.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', marketCap: 'Large', basePrice: 10850.40, exchange: 'NSE', lotSize: 1 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', marketCap: 'Large', basePrice: 1180.65, exchange: 'NSE', lotSize: 1 },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Jewellery', marketCap: 'Large', basePrice: 3250.30, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', marketCap: 'Large', basePrice: 8950.80, exchange: 'NSE', lotSize: 1 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT Services', marketCap: 'Large', basePrice: 480.25, exchange: 'NSE', lotSize: 1 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG', marketCap: 'Large', basePrice: 22500.50, exchange: 'NSE', lotSize: 1 },

  // Banking Sector
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking', marketCap: 'Large', basePrice: 1420.30, exchange: 'NSE', lotSize: 1 },
  { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd', sector: 'Banking', marketCap: 'Mid', basePrice: 145.80, exchange: 'NSE', lotSize: 1 },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd', sector: 'Banking', marketCap: 'Mid', basePrice: 220.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd', sector: 'Banking', marketCap: 'Mid', basePrice: 78.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Banking', marketCap: 'Mid', basePrice: 95.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Banking', marketCap: 'Mid', basePrice: 185.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'CANBK', name: 'Canara Bank', sector: 'Banking', marketCap: 'Mid', basePrice: 98.40, exchange: 'NSE', lotSize: 1 },

  // IT Sector
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT Services', marketCap: 'Large', basePrice: 1580.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT Services', marketCap: 'Large', basePrice: 5420.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd', sector: 'IT Services', marketCap: 'Mid', basePrice: 2680.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'COFORGE', name: 'Coforge Ltd', sector: 'IT Services', marketCap: 'Mid', basePrice: 4850.30, exchange: 'NSE', lotSize: 1 },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd', sector: 'IT Services', marketCap: 'Mid', basePrice: 5280.75, exchange: 'NSE', lotSize: 1 },

  // Pharma Sector
  { symbol: 'DRREDDY', name: 'Dr Reddys Laboratories Ltd', sector: 'Pharma', marketCap: 'Large', basePrice: 5680.40, exchange: 'NSE', lotSize: 1 },
  { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma', marketCap: 'Large', basePrice: 1380.85, exchange: 'NSE', lotSize: 1 },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', sector: 'Pharma', marketCap: 'Large', basePrice: 3850.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'BIOCON', name: 'Biocon Ltd', sector: 'Pharma', marketCap: 'Mid', basePrice: 285.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'LUPIN', name: 'Lupin Ltd', sector: 'Pharma', marketCap: 'Mid', basePrice: 1480.25, exchange: 'NSE', lotSize: 1 },
  { symbol: 'AUROBINDO', name: 'Aurobindo Pharma Ltd', sector: 'Pharma', marketCap: 'Mid', basePrice: 1250.70, exchange: 'NSE', lotSize: 1 },

  // Auto Sector
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', marketCap: 'Large', basePrice: 920.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Automobile', marketCap: 'Large', basePrice: 1850.30, exchange: 'NSE', lotSize: 1 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Automobile', marketCap: 'Large', basePrice: 8950.80, exchange: 'NSE', lotSize: 1 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Automobile', marketCap: 'Large', basePrice: 4680.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Automobile', marketCap: 'Large', basePrice: 4250.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd', sector: 'Automobile', marketCap: 'Mid', basePrice: 2180.45, exchange: 'NSE', lotSize: 1 },

  // FMCG Sector
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG', marketCap: 'Large', basePrice: 4850.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'DABUR', name: 'Dabur India Ltd', sector: 'FMCG', marketCap: 'Large', basePrice: 580.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'MARICO', name: 'Marico Ltd', sector: 'FMCG', marketCap: 'Mid', basePrice: 580.40, exchange: 'NSE', lotSize: 1 },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd', sector: 'FMCG', marketCap: 'Mid', basePrice: 1180.65, exchange: 'NSE', lotSize: 1 },
  { symbol: 'COLPAL', name: 'Colgate Palmolive India Ltd', sector: 'FMCG', marketCap: 'Mid', basePrice: 2850.30, exchange: 'NSE', lotSize: 1 },

  // Metals & Mining
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals', marketCap: 'Large', basePrice: 140.85, exchange: 'NSE', lotSize: 1 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Metals', marketCap: 'Large', basePrice: 580.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Metals', marketCap: 'Large', basePrice: 920.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'SAIL', name: 'Steel Authority of India Ltd', sector: 'Metals', marketCap: 'Mid', basePrice: 118.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'NMDC', name: 'NMDC Ltd', sector: 'Mining', marketCap: 'Mid', basePrice: 185.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Mining', marketCap: 'Large', basePrice: 420.60, exchange: 'NSE', lotSize: 1 },

  // Energy & Power
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power', marketCap: 'Large', basePrice: 285.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Power', marketCap: 'Large', basePrice: 285.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd', sector: 'Oil & Gas', marketCap: 'Large', basePrice: 285.80, exchange: 'NSE', lotSize: 1 },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd', sector: 'Oil & Gas', marketCap: 'Large', basePrice: 148.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', sector: 'Oil & Gas', marketCap: 'Large', basePrice: 320.75, exchange: 'NSE', lotSize: 1 },

  // Telecom
  { symbol: 'IDEA', name: 'Vodafone Idea Ltd', sector: 'Telecom', marketCap: 'Small', basePrice: 12.85, exchange: 'NSE', lotSize: 1 },

  // Cement
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Cement', marketCap: 'Large', basePrice: 26500.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Cement', marketCap: 'Large', basePrice: 2180.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd', sector: 'Cement', marketCap: 'Large', basePrice: 580.30, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ACC', name: 'ACC Ltd', sector: 'Cement', marketCap: 'Large', basePrice: 2250.60, exchange: 'NSE', lotSize: 1 },

  // Consumer Durables
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Financial Services', marketCap: 'Large', basePrice: 1680.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Financial Services', marketCap: 'Large', basePrice: 6850.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd', sector: 'Insurance', marketCap: 'Large', basePrice: 1480.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', sector: 'Insurance', marketCap: 'Large', basePrice: 680.60, exchange: 'NSE', lotSize: 1 },

  // Mid & Small Cap Stocks
  { symbol: 'ZOMATO', name: 'Zomato Ltd', sector: 'Consumer Services', marketCap: 'Mid', basePrice: 185.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'PAYTM', name: 'One 97 Communications Ltd', sector: 'Financial Services', marketCap: 'Mid', basePrice: 680.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd', sector: 'Consumer Services', marketCap: 'Mid', basePrice: 185.30, exchange: 'NSE', lotSize: 1 },
  { symbol: 'POLICYBZR', name: 'PB Fintech Ltd', sector: 'Financial Services', marketCap: 'Mid', basePrice: 1280.75, exchange: 'NSE', lotSize: 1 },

  // Emerging Sectors
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', sector: 'Infrastructure', marketCap: 'Large', basePrice: 1380.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Trading', marketCap: 'Large', basePrice: 2850.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd', sector: 'Renewable Energy', marketCap: 'Large', basePrice: 1680.45, exchange: 'NSE', lotSize: 1 },

  // Real Estate
  { symbol: 'DLF', name: 'DLF Ltd', sector: 'Real Estate', marketCap: 'Large', basePrice: 680.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'GODREJPROP', name: 'Godrej Properties Ltd', sector: 'Real Estate', marketCap: 'Mid', basePrice: 2580.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Ltd', sector: 'Real Estate', marketCap: 'Mid', basePrice: 1680.45, exchange: 'NSE', lotSize: 1 },

  // Aviation
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd', sector: 'Aviation', marketCap: 'Large', basePrice: 3850.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'SPICEJET', name: 'SpiceJet Ltd', sector: 'Aviation', marketCap: 'Small', basePrice: 58.90, exchange: 'NSE', lotSize: 1 },

  // Textiles
  { symbol: 'AIAENG', name: 'AIA Engineering Ltd', sector: 'Engineering', marketCap: 'Mid', basePrice: 3680.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'WELCORP', name: 'Welspun Corp Ltd', sector: 'Textiles', marketCap: 'Small', basePrice: 485.30, exchange: 'NSE', lotSize: 1 },

  // Agriculture & Food
  { symbol: 'UBL', name: 'United Breweries Ltd', sector: 'Beverages', marketCap: 'Mid', basePrice: 1680.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'VARUN', name: 'Varun Beverages Ltd', sector: 'Beverages', marketCap: 'Mid', basePrice: 1280.90, exchange: 'NSE', lotSize: 1 },

  // Healthcare
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare', marketCap: 'Large', basePrice: 5850.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'FORTIS', name: 'Fortis Healthcare Ltd', sector: 'Healthcare', marketCap: 'Mid', basePrice: 380.45, exchange: 'NSE', lotSize: 1 },

  // Retail
  { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail', marketCap: 'Large', basePrice: 6850.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'AVENUE', name: 'Avenue Supermarts Ltd', sector: 'Retail', marketCap: 'Large', basePrice: 4680.75, exchange: 'NSE', lotSize: 1 },

  // Logistics
  { symbol: 'BLUEDART', name: 'Blue Dart Express Ltd', sector: 'Logistics', marketCap: 'Mid', basePrice: 6850.45, exchange: 'NSE', lotSize: 1 },
  { symbol: 'DELHIVERY', name: 'Delhivery Ltd', sector: 'Logistics', marketCap: 'Mid', basePrice: 380.90, exchange: 'NSE', lotSize: 1 },

  // Entertainment & Media
  { symbol: 'ZEEL', name: 'Zee Entertainment Enterprises Ltd', sector: 'Media', marketCap: 'Mid', basePrice: 185.60, exchange: 'NSE', lotSize: 1 },
  { symbol: 'SUNTV', name: 'Sun TV Network Ltd', sector: 'Media', marketCap: 'Mid', basePrice: 680.45, exchange: 'NSE', lotSize: 1 },

  // Chemicals
  { symbol: 'UPL', name: 'UPL Ltd', sector: 'Chemicals', marketCap: 'Large', basePrice: 580.90, exchange: 'NSE', lotSize: 1 },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd', sector: 'Chemicals', marketCap: 'Large', basePrice: 2850.75, exchange: 'NSE', lotSize: 1 },
  { symbol: 'AAVAS', name: 'Aavas Financiers Ltd', sector: 'Financial Services', marketCap: 'Small', basePrice: 1680.30, exchange: 'NSE', lotSize: 1 }
];

// Sector-wise categorization
export const SECTORS = {
  'Banking': ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'INDUSINDBK', 'FEDERALBNK', 'BANDHANBNK', 'IDFCFIRSTB', 'PNB', 'BANKBARODA', 'CANBK'],
  'IT Services': ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM', 'LTIM', 'MPHASIS', 'COFORGE', 'PERSISTENT'],
  'FMCG': ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'DABUR', 'MARICO', 'GODREJCP', 'COLPAL'],
  'Automobile': ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'HEROMOTOCO', 'EICHERMOT', 'TVSMOTOR'],
  'Pharma': ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'BIOCON', 'LUPIN', 'AUROBINDO'],
  'Oil & Gas': ['RELIANCE', 'ONGC', 'IOC', 'BPCL'],
  'Metals': ['TATASTEEL', 'HINDALCO', 'JSWSTEEL', 'SAIL', 'NMDC', 'COALINDIA'],
  'Cement': ['ULTRACEMCO', 'SHREECEM', 'GRASIM', 'AMBUJACEM', 'ACC'],
  'Power': ['NTPC', 'POWERGRID'],
  'Telecom': ['BHARTIARTL', 'IDEA'],
  'Financial Services': ['BAJAJFINSV', 'BAJFINANCE', 'PAYTM', 'POLICYBZR', 'AAVAS'],
  'Insurance': ['SBILIFE', 'HDFCLIFE'],
  'Consumer Services': ['ZOMATO', 'NYKAA'],
  'Real Estate': ['DLF', 'GODREJPROP', 'OBEROIRLTY'],
  'Healthcare': ['APOLLOHOSP', 'FORTIS'],
  'Retail': ['TRENT', 'AVENUE']
};

// Market Cap categorization
export const MARKET_CAPS = {
  'Large': INDIAN_STOCKS.filter(stock => stock.marketCap === 'Large').map(s => s.symbol),
  'Mid': INDIAN_STOCKS.filter(stock => stock.marketCap === 'Mid').map(s => s.symbol),
  'Small': INDIAN_STOCKS.filter(stock => stock.marketCap === 'Small').map(s => s.symbol)
};

// Popular stocks for watchlist
export const POPULAR_STOCKS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 
  'BHARTIARTL', 'KOTAKBANK', 'LT', 'HCLTECH', 'ASIANPAINT', 'AXISBANK', 'MARUTI',
  'SUNPHARMA', 'TITAN', 'ULTRACEMCO', 'WIPRO', 'NESTLEIND'
];

// Get stock info by symbol
export const getStockInfo = (symbol: string): StockInfo | undefined => {
  return INDIAN_STOCKS.find(stock => stock.symbol === symbol);
};

// Search stocks by name or symbol
export const searchStocks = (query: string): StockInfo[] => {
  const searchTerm = query.toLowerCase();
  return INDIAN_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm) || 
    stock.name.toLowerCase().includes(searchTerm) ||
    stock.sector.toLowerCase().includes(searchTerm)
  ).slice(0, 20); // Limit to 20 results
};

// Get stocks by sector
export const getStocksBySector = (sector: string): StockInfo[] => {
  return INDIAN_STOCKS.filter(stock => stock.sector === sector);
};

// Get stocks by market cap
export const getStocksByMarketCap = (marketCap: string): StockInfo[] => {
  return INDIAN_STOCKS.filter(stock => stock.marketCap === marketCap);
};
