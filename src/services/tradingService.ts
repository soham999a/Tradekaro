import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getStockQuote, getIndexQuote } from '../lib/marketData';
import toast from 'react-hot-toast';

// Demo mode data storage (in-memory for demo)
let demoHoldings: { [uid: string]: Holding[] } = {};
let demoTransactions: { [uid: string]: Transaction[] } = {};
const demoUsers: { [uid: string]: { balance: number } } = {};
let demoUserBalances: { [uid: string]: number } = {};

export interface Transaction {
  id?: string;
  uid: string;
  symbol: string;
  stockName: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalValue: number;
  brokerage: number;
  netAmount: number;
  timestamp: Date | any; // Allow both Date and Timestamp
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  // Index trading specific fields
  isIndex?: boolean;
  lotSize?: number;
  marginUsed?: number;
}

export interface Holding {
  id?: string;
  uid: string;
  symbol: string;
  stockName: string;
  quantity: number;
  avgPrice: number;
  totalInvested: number;
  currentPrice?: number;
  currentValue?: number;
  pnl?: number;
  pnlPercent?: number;
  // Index trading specific fields
  isIndex?: boolean;
  lotSize?: number;
  marginUsed?: number;
}

interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  availableBalance: number;
  totalPortfolioValue: number;
  holdingsCount: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  availableBalance: number;
  dayChange: number;
  dayChangePercent: number;
}

const BROKERAGE_RATE = 0.005; // 0.5%

// Enhanced Order Types
interface EnhancedOrder {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderMode: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  product: 'CNC' | 'MIS' | 'NRML';
  validity: 'DAY' | 'IOC';
  triggerPrice?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
  timestamp: Date;
  executedPrice?: number;
  executedQuantity?: number;
}

interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  product: 'CNC' | 'MIS' | 'NRML';
}

export class TradingService {

  // User Profile Management
  static async updateUserProfile(uid: string, profileData: any) {
    try {
      // Check if Firestore is available
      if (!db) {
        console.log('Demo mode: User profile updated locally');
        // In demo mode, just store in memory or localStorage
        const demoProfile = {
          uid,
          ...profileData,
          onboardingCompleted: true,
          updatedAt: new Date()
        };
        localStorage.setItem(`user_profile_${uid}`, JSON.stringify(demoProfile));
        return true;
      }

      // Real Firebase mode
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async initializeUserPortfolio(uid: string, config: any) {
    try {
      // Check if Firestore is available
      if (!db) {
        console.log('Demo mode: Portfolio initialized locally');
        // In demo mode, store in localStorage
        const portfolioData = {
          uid,
          balance: config.startingBalance || 500000,
          totalInvested: 0,
          totalValue: config.startingBalance || 500000,
          totalPnL: 0,
          totalPnLPercent: 0,
          riskProfile: config.riskProfile,
          investmentGoals: config.investmentGoals,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        localStorage.setItem(`portfolio_${uid}`, JSON.stringify(portfolioData));
        return true;
      }

      // Real Firebase mode
      const portfolioRef = doc(db, 'portfolios', uid);
      await setDoc(portfolioRef, {
        uid,
        balance: config.startingBalance || 500000,
        totalInvested: 0,
        totalValue: config.startingBalance || 500000,
        totalPnL: 0,
        totalPnLPercent: 0,
        riskProfile: config.riskProfile,
        investmentGoals: config.investmentGoals,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error initializing portfolio:', error);
      throw error;
    }
  }
  // Check if we're in demo mode (Firebase not configured)
  private static isDemoMode(): boolean {
    return !db;
  }

  static async executeTrade(
    uid: string,
    symbol: string,
    action: 'BUY' | 'SELL',
    quantity: number,
    orderType: 'MARKET' | 'LIMIT' = 'MARKET',
    limitPrice?: number
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    try {
      // Input validation
      if (!uid || !symbol || !action || quantity <= 0) {
        return { success: false, message: 'Invalid trade parameters' };
      }

      // Get current price (try index first, then stock)
      let quote = await getIndexQuote(symbol);
      if (!quote) {
        quote = await getStockQuote(symbol);
      }

      if (!quote) {
        return { success: false, message: 'Unable to fetch current price' };
      }

      const isIndex = quote.isIndex || false;
      const price = orderType === 'MARKET' ? quote.price : (limitPrice || quote.price);

      // For indices, validate lot size
      if (isIndex && quote.lotSize && quantity % quote.lotSize !== 0) {
        return {
          success: false,
          message: `Index trading requires multiples of lot size (${quote.lotSize})`
        };
      }

      const tradeValue = Math.round(quantity * price * 100) / 100;
      const brokerageRate = parseFloat(process.env.NEXT_PUBLIC_BROKERAGE_RATE || '0.0025');
      const brokerage = Math.round(tradeValue * brokerageRate * 100) / 100;
      const netAmount = action === 'BUY' ? tradeValue + brokerage : tradeValue - brokerage;

      // For index trading, check margin requirements
      const marginRequired = isIndex && quote.marginRequired ?
        Math.round((quantity / (quote.lotSize || 1)) * quote.marginRequired) : 0;

      // Demo mode handling
      if (this.isDemoMode()) {
        return await this.executeDemoTrade(
          uid, symbol, quote.name, action, quantity, price, tradeValue, brokerage, netAmount,
          isIndex, quote.lotSize, marginRequired
        );
      }

      // Real Firebase mode
      return await this.executeRealTrade(
        uid, symbol, quote.name, action, quantity, price, tradeValue, brokerage, netAmount,
        isIndex, quote.lotSize, marginRequired
      );
    } catch (error) {
      console.error('Trade execution error:', error);
      return { success: false, message: 'Trade execution failed. Please try again.' };
    }
  }

  private static async executeDemoTrade(
    uid: string,
    symbol: string,
    stockName: string,
    action: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    tradeValue: number,
    brokerage: number,
    netAmount: number,
    isIndex: boolean = false,
    lotSize?: number,
    marginRequired: number = 0
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    // Initialize demo data if needed
    if (!demoUsers[uid]) {
      demoUsers[uid] = { balance: 500000 };
    }
    if (!demoHoldings[uid]) {
      demoHoldings[uid] = [];
    }
    if (!demoTransactions[uid]) {
      demoTransactions[uid] = [];
    }

    const currentBalance = demoUsers[uid].balance;

    if (action === 'BUY') {
      // For index trading, check margin requirements instead of full amount
      const requiredAmount = isIndex ? marginRequired : netAmount;

      if (currentBalance < requiredAmount) {
        const amountType = isIndex ? 'margin' : 'balance';
        return {
          success: false,
          message: `Insufficient ${amountType}. Required: ₹${requiredAmount.toLocaleString('en-IN')}, Available: ₹${currentBalance.toLocaleString('en-IN')}`
        };
      }

      // Update balance (deduct margin for indices, full amount for stocks)
      const deductAmount = isIndex ? marginRequired : netAmount;
      demoUsers[uid].balance -= deductAmount;

      // Update holdings
      const existingHolding = demoHoldings[uid].find(h => h.symbol === symbol);
      if (existingHolding) {
        const newQuantity = existingHolding.quantity + quantity;
        const newTotalInvested = existingHolding.totalInvested + tradeValue;
        existingHolding.quantity = newQuantity;
        existingHolding.avgPrice = newTotalInvested / newQuantity;
        existingHolding.totalInvested = newTotalInvested;
        if (isIndex) {
          existingHolding.marginUsed = (existingHolding.marginUsed || 0) + marginRequired;
        }
      } else {
        demoHoldings[uid].push({
          id: `demo-${Date.now()}`,
          uid,
          symbol,
          stockName,
          quantity,
          avgPrice: price,
          totalInvested: tradeValue,
          currentPrice: price,
          currentValue: tradeValue,
          pnl: 0,
          pnlPercent: 0,
          isIndex,
          lotSize,
          marginUsed: isIndex ? marginRequired : undefined
        });
      }
    } else {
      // SELL operation
      const holding = demoHoldings[uid].find(h => h.symbol === symbol);
      if (!holding || holding.quantity < quantity) {
        return { success: false, message: `Insufficient shares. Available: ${holding?.quantity || 0}, Required: ${quantity}` };
      }

      // Update balance
      demoUsers[uid].balance += netAmount;

      // Update holdings
      holding.quantity -= quantity;
      if (holding.quantity === 0) {
        demoHoldings[uid] = demoHoldings[uid].filter(h => h.symbol !== symbol);
      } else {
        const soldValue = (holding.totalInvested / (holding.quantity + quantity)) * quantity;
        holding.totalInvested -= soldValue;
      }
    }

    // Record transaction
    const transaction = {
      id: `demo-${Date.now()}`,
      uid,
      symbol,
      stockName,
      action,
      quantity,
      price,
      totalValue: tradeValue,
      brokerage,
      netAmount,
      timestamp: new Date(),
      status: 'COMPLETED' as const,
      isIndex,
      lotSize,
      marginUsed: isIndex ? marginRequired : undefined
    };

    demoTransactions[uid].unshift(transaction);

    const unit = isIndex ? 'units' : 'shares';
    const marginInfo = isIndex ? ` (Margin: ₹${marginRequired.toLocaleString('en-IN')})` : '';

    return {
      success: true,
      message: `${action} order executed successfully! ${quantity} ${unit} of ${symbol} at ₹${price.toFixed(2)}${marginInfo}`,
      transactionId: transaction.id
    };
  }

  private static async executeRealTrade(
    uid: string,
    symbol: string,
    stockName: string,
    action: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    tradeValue: number,
    brokerage: number,
    netAmount: number,
    isIndex: boolean = false,
    lotSize?: number,
    marginRequired: number = 0
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { success: false, message: 'User account not found' };
    }

    const userData = userDoc.data();
    const currentBalance = userData.balance || 0;

    if (action === 'BUY') {
      if (currentBalance < netAmount) {
        return { success: false, message: `Insufficient balance. Required: ₹${netAmount.toLocaleString('en-IN')}, Available: ₹${currentBalance.toLocaleString('en-IN')}` };
      }

      // Update user balance
      await updateDoc(doc(db, 'users', uid), {
        balance: currentBalance - netAmount,
        updatedAt: Timestamp.now()
      });

      // Update holdings
      await this.updateHolding(uid, symbol, stockName, action, quantity, price);
    } else {
      // SELL operation
      const holding = await this.getHolding(uid, symbol);
      if (!holding || holding.quantity < quantity) {
        return { success: false, message: `Insufficient shares. Available: ${holding?.quantity || 0}, Required: ${quantity}` };
      }

      // Update user balance
      await updateDoc(doc(db, 'users', uid), {
        balance: currentBalance + netAmount,
        updatedAt: Timestamp.now()
      });

      // Update holdings
      await this.updateHolding(uid, symbol, stockName, action, quantity, price);
    }

    // Record transaction
    const transaction: Omit<Transaction, 'id'> = {
      uid,
      symbol,
      stockName,
      action,
      quantity,
      price,
      totalValue: tradeValue,
      brokerage,
      netAmount,
      timestamp: Timestamp.now(),
      status: 'COMPLETED'
    };

    const transactionRef = await addDoc(collection(db, 'transactions'), transaction);

    return {
      success: true,
      message: `${action} order executed successfully! ${quantity} shares of ${symbol} at ₹${price.toFixed(2)}`,
      transactionId: transactionRef.id
    };
  }

  private static async updateHolding(
    uid: string,
    symbol: string,
    stockName: string,
    action: 'BUY' | 'SELL',
    quantity: number,
    price: number
  ) {
    const holdingsRef = collection(db, 'holdings');
    const q = query(holdingsRef, where('uid', '==', uid), where('symbol', '==', symbol));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty && action === 'BUY') {
      // Create new holding
      const newHolding: Omit<Holding, 'id'> = {
        uid,
        symbol,
        stockName,
        quantity,
        avgPrice: price,
        totalInvested: price * quantity
      };
      await addDoc(holdingsRef, newHolding);
    } else if (!querySnapshot.empty) {
      // Update existing holding
      const holdingDoc = querySnapshot.docs[0];
      const currentHolding = holdingDoc.data() as Holding;

      if (action === 'BUY') {
        const newQuantity = currentHolding.quantity + quantity;
        const newTotalInvested = currentHolding.totalInvested + (price * quantity);
        const newAvgPrice = newTotalInvested / newQuantity;

        await updateDoc(holdingDoc.ref, {
          quantity: newQuantity,
          avgPrice: newAvgPrice,
          totalInvested: newTotalInvested
        });
      } else {
        // SELL
        const newQuantity = currentHolding.quantity - quantity;
        if (newQuantity === 0) {
          // Delete holding if all shares sold
          await deleteDoc(holdingDoc.ref);
        } else {
          const soldValue = (currentHolding.totalInvested / currentHolding.quantity) * quantity;
          await updateDoc(holdingDoc.ref, {
            quantity: newQuantity,
            totalInvested: currentHolding.totalInvested - soldValue
          });
        }
      }
    }
  }

  private static async getHolding(uid: string, symbol: string): Promise<Holding | null> {
    const holdingsRef = collection(db, 'holdings');
    const q = query(holdingsRef, where('uid', '==', uid), where('symbol', '==', symbol));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Holding;
  }

  // Portfolio Calculation Functions
  static calculateHoldingMetrics(holding: Partial<Holding>, currentPrice: number): Holding {
    const quantity = holding.quantity || 0;
    const avgPrice = holding.avgPrice || 0;
    const totalInvested = holding.totalInvested || (avgPrice * quantity);
    const currentValue = currentPrice * quantity;
    const pnl = currentValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

    return {
      ...holding,
      quantity,
      avgPrice,
      totalInvested,
      currentPrice,
      currentValue,
      pnl,
      pnlPercent
    } as Holding;
  }

  static calculatePortfolioSummary(holdings: Holding[], availableBalance: number): PortfolioSummary {
    const totalInvested = holdings.reduce((sum, holding) => sum + holding.totalInvested, 0);
    const totalCurrentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const totalPortfolioValue = totalCurrentValue + availableBalance;

    return {
      totalInvested,
      totalCurrentValue,
      totalPnL,
      totalPnLPercent,
      availableBalance,
      totalPortfolioValue,
      holdingsCount: holdings.length
    };
  }

  static async getUserHoldings(uid: string): Promise<Holding[]> {
    try {
      // Demo mode: return mock holdings with real calculations
      if (this.isDemoMode()) {
        if (!demoHoldings[uid]) {
          // Get current market prices for demo holdings
          const reliancePrice = 2450 + (Math.random() - 0.5) * 100; // Simulate price movement
          const tcsPrice = 3650 + (Math.random() - 0.5) * 150;

          const rawHoldings = [
            {
              id: 'demo-1',
              uid,
              symbol: 'RELIANCE',
              stockName: 'Reliance Industries Ltd',
              quantity: 10,
              avgPrice: 2400,
              totalInvested: 24000
            },
            {
              id: 'demo-2',
              uid,
              symbol: 'TCS',
              stockName: 'Tata Consultancy Services',
              quantity: 5,
              avgPrice: 3600,
              totalInvested: 18000
            }
          ];

          // Calculate metrics for each holding
          demoHoldings[uid] = [
            this.calculateHoldingMetrics(rawHoldings[0], reliancePrice),
            this.calculateHoldingMetrics(rawHoldings[1], tcsPrice)
          ];
        }
        return demoHoldings[uid];
      }

      const holdingsRef = collection(db, 'holdings');
      const q = query(holdingsRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);

      const holdings: Holding[] = [];
      for (const doc of querySnapshot.docs) {
        const rawHolding = { id: doc.id, ...doc.data() } as Partial<Holding>;

        // Get current price
        const stockQuote = await getStockQuote(rawHolding.symbol || '');
        const currentPrice = stockQuote?.price || rawHolding.avgPrice || 0;

        // Calculate all metrics using the calculation function
        const calculatedHolding = this.calculateHoldingMetrics(rawHolding, currentPrice);
        holdings.push(calculatedHolding);
      }

      return holdings;
    } catch (error) {
      console.error('Error fetching holdings:', error);
      return [];
    }
  }

  static async getPortfolioSummary(uid: string): Promise<PortfolioSummary> {
    try {
      const holdings = await this.getUserHoldings(uid);
      const userData = await this.getUserData(uid);
      const availableBalance = userData?.balance || 500000; // Default starting balance

      return this.calculatePortfolioSummary(holdings, availableBalance);
    } catch (error) {
      console.error('Error calculating portfolio summary:', error);
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        availableBalance: 500000,
        totalPortfolioValue: 500000,
        holdingsCount: 0
      };
    }
  }

  static async getUserData(uid: string): Promise<any> {
    try {
      if (this.isDemoMode()) {
        return {
          uid,
          balance: 500000,
          name: 'Demo User',
          email: 'demo@tradekaro.com'
        };
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  static async getUserTransactions(uid: string, limitCount: number = 50): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as Transaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  static async getPortfolioSummary(uid: string): Promise<PortfolioSummary> {
    try {
      const holdings = await this.getUserHoldings(uid);

      let availableBalance = 100000; // Default demo balance

      // Demo mode: use demo balance
      if (this.isDemoMode()) {
        if (!demoUserBalances[uid]) {
          demoUserBalances[uid] = 100000; // ₹1,00,000 starting balance
        }
        availableBalance = demoUserBalances[uid];
      } else {
        const userDoc = await getDoc(doc(db, 'users', uid));
        const userData = userDoc.data();
        availableBalance = userData?.balance || 0;
      }

      const totalValue = holdings.reduce((sum, holding) => sum + (holding.currentValue || 0), 0);
      const totalInvested = holdings.reduce((sum, holding) => sum + holding.totalInvested, 0);
      const totalPnL = totalValue - totalInvested;
      const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      return {
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercent,
        availableBalance,
        dayChange: 0, // TODO: Calculate day change
        dayChangePercent: 0 // TODO: Calculate day change percent
      };
    } catch (error) {
      console.error('Error calculating portfolio summary:', error);
      return {
        totalValue: 0,
        totalInvested: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        availableBalance: 0,
        dayChange: 0,
        dayChangePercent: 0
      };
    }
  }

  // Check if user has sufficient position for selling
  static async checkPositionForSell(symbol: string, quantity: number, product: string): Promise<{ success: boolean; message: string; availableQuantity?: number }> {
    try {
      const existingPositions = JSON.parse(localStorage.getItem('trading_positions') || '[]');
      const position = existingPositions.find((p: any) => p.symbol === symbol && p.product === product);

      if (!position) {
        return {
          success: false,
          message: `No ${product} position found for ${symbol}. You need to buy shares first.`,
          availableQuantity: 0
        };
      }

      if (position.quantity < quantity) {
        return {
          success: false,
          message: `Insufficient quantity. Available: ${position.quantity}, Requested: ${quantity}`,
          availableQuantity: position.quantity
        };
      }

      return {
        success: true,
        message: 'Sufficient position available',
        availableQuantity: position.quantity
      };
    } catch (error) {
      console.error('Error checking position:', error);
      return {
        success: false,
        message: 'Error checking position. Please try again.'
      };
    }
  }

  // Enhanced Order Placement
  static async placeEnhancedOrder(orderData: {
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    orderMode: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
    product: 'CNC' | 'MIS' | 'NRML';
    validity: 'DAY' | 'IOC';
    triggerPrice?: number;
  }): Promise<{ success: boolean; message: string; orderId?: string }> {
    try {
      const { symbol, type, quantity, price, orderMode, product } = orderData;

      // For SELL orders, check if user has sufficient position
      if (type === 'SELL') {
        const positionCheck = await this.checkPositionForSell(symbol, quantity, product);
        if (!positionCheck.success) {
          return {
            success: false,
            message: positionCheck.message
          };
        }
      }

      // Simulate realistic order processing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

      const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      // Calculate brokerage and taxes (realistic Indian market rates)
      const orderValue = price * quantity;
      const brokerage = Math.min(orderValue * 0.0003, 20); // 0.03% or ₹20, whichever is lower
      const stt = orderValue * (type === 'SELL' ? 0.00025 : 0.00001); // STT rates
      const exchangeCharges = orderValue * 0.0000345;
      const gst = (brokerage + exchangeCharges) * 0.18;
      const sebiCharges = orderValue * 0.000001;
      const stampDuty = orderValue * 0.00003;

      const totalCharges = brokerage + stt + exchangeCharges + gst + sebiCharges + stampDuty;
      const netAmount = type === 'BUY' ? orderValue + totalCharges : orderValue - totalCharges;

      // Store order in localStorage for demo mode
      const existingOrders = JSON.parse(localStorage.getItem('trading_orders') || '[]');
      const newOrder = {
        id: orderId,
        symbol,
        type,
        quantity,
        price,
        orderMode,
        product: orderData.product,
        validity: orderData.validity,
        triggerPrice: orderData.triggerPrice,
        status: orderMode === 'MARKET' ? 'EXECUTED' : 'PENDING',
        timestamp: new Date(),
        executedPrice: orderMode === 'MARKET' ? price : undefined,
        executedQuantity: orderMode === 'MARKET' ? quantity : undefined
      };

      existingOrders.push(newOrder);
      localStorage.setItem('trading_orders', JSON.stringify(existingOrders));

      // Update positions if order is executed
      if (newOrder.status === 'EXECUTED') {
        await this.updatePosition(symbol, type, quantity, price, product);
      }

      return {
        success: true,
        message: `${type} order placed successfully!\nOrder ID: ${orderId}\n${quantity} shares of ${symbol}\nPrice: ₹${price.toFixed(2)}\nTotal Charges: ₹${totalCharges.toFixed(2)}\nNet Amount: ₹${netAmount.toFixed(2)}`,
        orderId
      };
    } catch (error) {
      console.error('Enhanced order placement error:', error);
      return {
        success: false,
        message: 'Order placement failed. Please try again.'
      };
    }
  }

  // Legacy method for backward compatibility
  static async placeOrder(orderData: {
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    orderMode: 'MARKET' | 'LIMIT';
  }): Promise<{ success: boolean; message: string }> {
    const result = await this.placeEnhancedOrder({
      ...orderData,
      orderMode: orderData.orderMode as any,
      product: 'CNC',
      validity: 'DAY'
    });

    return {
      success: result.success,
      message: result.message
    };
  }

  // Update Position with enhanced P&L tracking
  static async updatePosition(symbol: string, type: 'BUY' | 'SELL', quantity: number, price: number, product: string) {
    try {
      const existingPositions = JSON.parse(localStorage.getItem('trading_positions') || '[]');
      const positionIndex = existingPositions.findIndex((p: any) => p.symbol === symbol && p.product === product);

      if (positionIndex >= 0) {
        const position = existingPositions[positionIndex];

        if (type === 'BUY') {
          // Calculate new average price for additional buy
          const totalQuantity = position.quantity + quantity;
          const totalValue = (position.quantity * position.averagePrice) + (quantity * price);
          position.averagePrice = totalValue / totalQuantity;
          position.quantity = totalQuantity;
          position.lastBuyPrice = price;
          position.lastBuyDate = new Date().toISOString();
        } else {
          // Handle SELL order with P&L calculation
          const sellValue = quantity * price;
          const costValue = quantity * position.averagePrice;
          const realizedPnL = sellValue - costValue;

          // Update position quantity
          position.quantity -= quantity;
          position.lastSellPrice = price;
          position.lastSellDate = new Date().toISOString();

          // Track realized P&L
          position.realizedPnL = (position.realizedPnL || 0) + realizedPnL;
          position.totalSellValue = (position.totalSellValue || 0) + sellValue;

          // If position is completely sold, mark it as closed
          if (position.quantity <= 0) {
            position.status = 'CLOSED';
            position.closedDate = new Date().toISOString();
            position.finalPnL = position.realizedPnL;

            // Store in closed positions for history
            const closedPositions = JSON.parse(localStorage.getItem('closed_positions') || '[]');
            closedPositions.push({
              ...position,
              closedAt: new Date().toISOString(),
              finalRealizedPnL: realizedPnL
            });
            localStorage.setItem('closed_positions', JSON.stringify(closedPositions));

            // Remove from active positions
            existingPositions.splice(positionIndex, 1);
          }
        }
      } else if (type === 'BUY') {
        // Create new position
        existingPositions.push({
          symbol,
          quantity,
          averagePrice: price,
          currentPrice: price,
          pnl: 0,
          pnlPercent: 0,
          product,
          realizedPnL: 0,
          totalSellValue: 0,
          lastBuyPrice: price,
          lastBuyDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          status: 'OPEN'
        });
      }

      localStorage.setItem('trading_positions', JSON.stringify(existingPositions));

      console.log(`Position updated: ${type} ${quantity} shares of ${symbol} at ₹${price}`);
    } catch (error) {
      console.error('Position update error:', error);
    }
  }

  // Get User Orders
  static async getUserOrders(uid: string): Promise<any[]> {
    try {
      const orders = JSON.parse(localStorage.getItem('trading_orders') || '[]');
      return orders.map((order: any) => ({
        ...order,
        timestamp: new Date(order.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Get User Positions
  static async getUserPositions(uid: string): Promise<any[]> {
    try {
      const positions = JSON.parse(localStorage.getItem('trading_positions') || '[]');

      // Update current prices and P&L
      const updatedPositions = await Promise.all(
        positions.map(async (position: any) => {
          try {
            const { getStockQuote } = await import('../lib/marketData');
            const quote = await getStockQuote(position.symbol);
            if (quote) {
              const currentPrice = quote.price;
              const pnl = (currentPrice - position.averagePrice) * position.quantity;
              const pnlPercent = ((currentPrice - position.averagePrice) / position.averagePrice) * 100;

              return {
                ...position,
                currentPrice,
                pnl,
                pnlPercent
              };
            }
            return position;
          } catch (error) {
            return position;
          }
        })
      );

      return updatedPositions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  // Get Closed Positions (for P&L history)
  static async getClosedPositions(uid: string): Promise<any[]> {
    try {
      const closedPositions = JSON.parse(localStorage.getItem('closed_positions') || '[]');
      return closedPositions.sort((a: any, b: any) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime());
    } catch (error) {
      console.error('Error fetching closed positions:', error);
      return [];
    }
  }

  // Get Total Realized P&L
  static async getTotalRealizedPnL(uid: string): Promise<{ totalPnL: number; totalProfit: number; totalLoss: number; winRate: number }> {
    try {
      const closedPositions = await this.getClosedPositions(uid);

      let totalPnL = 0;
      let totalProfit = 0;
      let totalLoss = 0;
      let winningTrades = 0;

      closedPositions.forEach((position: any) => {
        const pnl = position.finalRealizedPnL || position.realizedPnL || 0;
        totalPnL += pnl;

        if (pnl > 0) {
          totalProfit += pnl;
          winningTrades++;
        } else {
          totalLoss += Math.abs(pnl);
        }
      });

      const winRate = closedPositions.length > 0 ? (winningTrades / closedPositions.length) * 100 : 0;

      return {
        totalPnL,
        totalProfit,
        totalLoss,
        winRate
      };
    } catch (error) {
      console.error('Error calculating realized P&L:', error);
      return { totalPnL: 0, totalProfit: 0, totalLoss: 0, winRate: 0 };
    }
  }

  // Close entire position (sell all shares)
  static async closePosition(symbol: string, product: string, currentPrice: number): Promise<{ success: boolean; message: string }> {
    try {
      const existingPositions = JSON.parse(localStorage.getItem('trading_positions') || '[]');
      const position = existingPositions.find((p: any) => p.symbol === symbol && p.product === product);

      if (!position) {
        return {
          success: false,
          message: `No ${product} position found for ${symbol}`
        };
      }

      // Place sell order for entire quantity
      const result = await this.placeEnhancedOrder({
        symbol,
        type: 'SELL',
        quantity: position.quantity,
        price: currentPrice,
        orderMode: 'MARKET',
        product: product as any,
        validity: 'DAY'
      });

      return result;
    } catch (error) {
      console.error('Error closing position:', error);
      return {
        success: false,
        message: 'Error closing position. Please try again.'
      };
    }
  }
}
