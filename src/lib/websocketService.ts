// Real-time WebSocket Service for Live Market Data
'use client';

interface MarketDataUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

interface OrderBookUpdate {
  symbol: string;
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  timestamp: number;
}

type MarketDataCallback = (data: MarketDataUpdate) => void;
type OrderBookCallback = (data: OrderBookUpdate) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions = new Set<string>();
  private marketDataCallbacks = new Map<string, MarketDataCallback[]>();
  private orderBookCallbacks = new Map<string, OrderBookCallback[]>();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // In production, this would connect to a real WebSocket endpoint
      // For demo, we'll simulate WebSocket behavior
      this.simulateWebSocket();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private simulateWebSocket() {
    // Simulate WebSocket connection for demo purposes
    this.isConnected = true;
    console.log('🔗 WebSocket connected (simulated)');
    
    // Simulate real-time price updates
    this.startPriceSimulation();
  }

  private startPriceSimulation() {
    const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC'];
    
    // Base prices for simulation
    const basePrices: { [key: string]: number } = {
      'RELIANCE': 2450.50,
      'TCS': 3650.75,
      'INFY': 1580.25,
      'HDFCBANK': 1650.80,
      'ICICIBANK': 950.40,
      'SBIN': 580.60,
      'BHARTIARTL': 920.30,
      'ITC': 420.15
    };

    // Simulate price updates every 1-3 seconds
    const updatePrice = (symbol: string) => {
      if (!this.subscriptions.has(symbol)) return;

      const basePrice = basePrices[symbol];
      const volatility = 0.002; // 0.2% volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = basePrice * (1 + randomChange);
      const change = newPrice - basePrice;
      const changePercent = (change / basePrice) * 100;

      const update: MarketDataUpdate = {
        symbol,
        price: Number(newPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 100000) + 10000,
        timestamp: Date.now()
      };

      // Update base price for next iteration
      basePrices[symbol] = newPrice;

      // Notify subscribers
      this.notifyMarketDataSubscribers(symbol, update);

      // Schedule next update
      setTimeout(() => updatePrice(symbol), Math.random() * 2000 + 1000);
    };

    // Start updates for all symbols
    symbols.forEach(symbol => {
      setTimeout(() => updatePrice(symbol), Math.random() * 1000);
    });
  }

  private notifyMarketDataSubscribers(symbol: string, data: MarketDataUpdate) {
    const callbacks = this.marketDataCallbacks.get(symbol);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in market data callback:', error);
        }
      });
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Subscribe to real-time market data for a symbol
  subscribeToMarketData(symbol: string, callback: MarketDataCallback) {
    if (!this.marketDataCallbacks.has(symbol)) {
      this.marketDataCallbacks.set(symbol, []);
    }
    
    this.marketDataCallbacks.get(symbol)!.push(callback);
    this.subscriptions.add(symbol);

    // Send subscription message (in real implementation)
    if (this.isConnected) {
      console.log(`📊 Subscribed to market data for ${symbol}`);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromMarketData(symbol, callback);
    };
  }

  // Unsubscribe from market data
  unsubscribeFromMarketData(symbol: string, callback: MarketDataCallback) {
    const callbacks = this.marketDataCallbacks.get(symbol);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0) {
        this.marketDataCallbacks.delete(symbol);
        this.subscriptions.delete(symbol);
        console.log(`📊 Unsubscribed from market data for ${symbol}`);
      }
    }
  }

  // Subscribe to order book updates
  subscribeToOrderBook(symbol: string, callback: OrderBookCallback) {
    if (!this.orderBookCallbacks.has(symbol)) {
      this.orderBookCallbacks.set(symbol, []);
    }
    
    this.orderBookCallbacks.get(symbol)!.push(callback);

    // Simulate order book data
    this.simulateOrderBook(symbol);

    return () => {
      this.unsubscribeFromOrderBook(symbol, callback);
    };
  }

  private simulateOrderBook(symbol: string) {
    const generateOrderBook = () => {
      const basePrice = 2450; // Example base price
      const spread = 0.5;
      
      const bids = Array.from({ length: 5 }, (_, i) => ({
        price: Number((basePrice - spread - i * 0.25).toFixed(2)),
        quantity: Math.floor(Math.random() * 1000) + 100
      }));

      const asks = Array.from({ length: 5 }, (_, i) => ({
        price: Number((basePrice + spread + i * 0.25).toFixed(2)),
        quantity: Math.floor(Math.random() * 1000) + 100
      }));

      const orderBookUpdate: OrderBookUpdate = {
        symbol,
        bids,
        asks,
        timestamp: Date.now()
      };

      const callbacks = this.orderBookCallbacks.get(symbol);
      if (callbacks) {
        callbacks.forEach(callback => callback(orderBookUpdate));
      }
    };

    // Update order book every 2-5 seconds
    const updateInterval = setInterval(() => {
      if (this.orderBookCallbacks.has(symbol)) {
        generateOrderBook();
      } else {
        clearInterval(updateInterval);
      }
    }, Math.random() * 3000 + 2000);

    // Initial update
    generateOrderBook();
  }

  unsubscribeFromOrderBook(symbol: string, callback: OrderBookCallback) {
    const callbacks = this.orderBookCallbacks.get(symbol);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0) {
        this.orderBookCallbacks.delete(symbol);
      }
    }
  }

  // Get connection status
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscriptions.clear();
    this.marketDataCallbacks.clear();
    this.orderBookCallbacks.clear();
    console.log('🔌 WebSocket disconnected');
  }
}

// Singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
export type { MarketDataUpdate, OrderBookUpdate };
