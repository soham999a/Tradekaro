'use client';

// Professional Options Trading Service with Black-Scholes calculations
export interface OptionContract {
  id: string;
  symbol: string; // Underlying stock symbol
  strike: number;
  expiry: string; // YYYY-MM-DD format
  type: 'CE' | 'PE'; // Call or Put
  lotSize: number;
  premium: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  // Greeks
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionPosition {
  id: string;
  contractId: string;
  symbol: string;
  strike: number;
  expiry: string;
  type: 'CE' | 'PE';
  action: 'BUY' | 'SELL';
  quantity: number; // Number of lots
  entryPremium: number;
  currentPremium: number;
  lotSize: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
  createdAt: string;
  status: 'OPEN' | 'CLOSED' | 'EXPIRED';
}

export interface OptionStrategy {
  id: string;
  name: string;
  description: string;
  legs: OptionLeg[];
  maxProfit: number;
  maxLoss: number;
  breakeven: number[];
  margin: number;
  riskReward: number;
}

export interface OptionLeg {
  action: 'BUY' | 'SELL';
  type: 'CE' | 'PE';
  strike: number;
  quantity: number;
  premium: number;
}

class OptionsService {
  private static readonly RISK_FREE_RATE = 0.06; // 6% risk-free rate
  private static readonly TRADING_DAYS_PER_YEAR = 252;

  // Black-Scholes Option Pricing Model
  static calculateOptionPrice(
    spotPrice: number,
    strike: number,
    timeToExpiry: number, // in years
    volatility: number,
    riskFreeRate: number = this.RISK_FREE_RATE,
    optionType: 'CE' | 'PE' = 'CE'
  ): number {
    const d1 = (Math.log(spotPrice / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
               (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    if (optionType === 'CE') {
      // Call option
      return spotPrice * this.normalCDF(d1) - strike * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(d2);
    } else {
      // Put option
      return strike * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(-d2) - spotPrice * this.normalCDF(-d1);
    }
  }

  // Calculate Greeks
  static calculateGreeks(
    spotPrice: number,
    strike: number,
    timeToExpiry: number,
    volatility: number,
    riskFreeRate: number = this.RISK_FREE_RATE,
    optionType: 'CE' | 'PE' = 'CE'
  ) {
    const d1 = (Math.log(spotPrice / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
               (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    // Delta
    const delta = optionType === 'CE' 
      ? this.normalCDF(d1)
      : this.normalCDF(d1) - 1;

    // Gamma (same for calls and puts)
    const gamma = this.normalPDF(d1) / (spotPrice * volatility * Math.sqrt(timeToExpiry));

    // Theta
    const theta = optionType === 'CE'
      ? (-spotPrice * this.normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiry)) - 
         riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(d2)) / 365
      : (-spotPrice * this.normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiry)) + 
         riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(-d2)) / 365;

    // Vega (same for calls and puts)
    const vega = spotPrice * this.normalPDF(d1) * Math.sqrt(timeToExpiry) / 100;

    // Rho
    const rho = optionType === 'CE'
      ? strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(d2) / 100
      : -strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * this.normalCDF(-d2) / 100;

    return { delta, gamma, theta, vega, rho };
  }

  // Generate option chain for a stock
  static generateOptionChain(
    symbol: string,
    spotPrice: number,
    volatility: number = 0.25
  ): OptionContract[] {
    const options: OptionContract[] = [];
    const expiryDates = this.getNextExpiryDates();
    
    expiryDates.forEach(expiry => {
      const timeToExpiry = this.getTimeToExpiry(expiry);
      const strikes = this.generateStrikes(spotPrice);
      
      strikes.forEach(strike => {
        // Call option
        const callPrice = this.calculateOptionPrice(spotPrice, strike, timeToExpiry, volatility, this.RISK_FREE_RATE, 'CE');
        const callGreeks = this.calculateGreeks(spotPrice, strike, timeToExpiry, volatility, this.RISK_FREE_RATE, 'CE');
        
        const callOption: OptionContract = {
          id: `${symbol}_${strike}_${expiry}_CE`,
          symbol,
          strike,
          expiry,
          type: 'CE',
          lotSize: this.getLotSize(symbol),
          premium: Number(callPrice.toFixed(2)),
          bid: Number((callPrice * 0.995).toFixed(2)),
          ask: Number((callPrice * 1.005).toFixed(2)),
          volume: Math.floor(Math.random() * 10000) + 1000,
          openInterest: Math.floor(Math.random() * 50000) + 5000,
          impliedVolatility: Number((volatility * 100).toFixed(2)),
          delta: Number(callGreeks.delta.toFixed(4)),
          gamma: Number(callGreeks.gamma.toFixed(4)),
          theta: Number(callGreeks.theta.toFixed(4)),
          vega: Number(callGreeks.vega.toFixed(4)),
          rho: Number(callGreeks.rho.toFixed(4))
        };

        // Put option
        const putPrice = this.calculateOptionPrice(spotPrice, strike, timeToExpiry, volatility, this.RISK_FREE_RATE, 'PE');
        const putGreeks = this.calculateGreeks(spotPrice, strike, timeToExpiry, volatility, this.RISK_FREE_RATE, 'PE');
        
        const putOption: OptionContract = {
          id: `${symbol}_${strike}_${expiry}_PE`,
          symbol,
          strike,
          expiry,
          type: 'PE',
          lotSize: this.getLotSize(symbol),
          premium: Number(putPrice.toFixed(2)),
          bid: Number((putPrice * 0.995).toFixed(2)),
          ask: Number((putPrice * 1.005).toFixed(2)),
          volume: Math.floor(Math.random() * 10000) + 1000,
          openInterest: Math.floor(Math.random() * 50000) + 5000,
          impliedVolatility: Number((volatility * 100).toFixed(2)),
          delta: Number(putGreeks.delta.toFixed(4)),
          gamma: Number(putGreeks.gamma.toFixed(4)),
          theta: Number(putGreeks.theta.toFixed(4)),
          vega: Number(putGreeks.vega.toFixed(4)),
          rho: Number(putGreeks.rho.toFixed(4))
        };

        options.push(callOption, putOption);
      });
    });

    return options;
  }

  // Calculate margin for options
  static calculateMargin(
    action: 'BUY' | 'SELL',
    optionType: 'CE' | 'PE',
    premium: number,
    spotPrice: number,
    strike: number,
    quantity: number,
    lotSize: number
  ): number {
    const totalQuantity = quantity * lotSize;
    
    if (action === 'BUY') {
      // For buying options, margin is just the premium
      return premium * totalQuantity;
    } else {
      // For selling options, use SPAN margin calculation (simplified)
      const intrinsicValue = optionType === 'CE' 
        ? Math.max(0, spotPrice - strike)
        : Math.max(0, strike - spotPrice);
      
      const spanMargin = Math.max(
        premium + Math.max(0.2 * spotPrice - Math.max(0, strike - spotPrice), 0.1 * spotPrice),
        premium + Math.max(0.2 * spotPrice - Math.max(0, spotPrice - strike), 0.1 * strike)
      );
      
      return spanMargin * totalQuantity;
    }
  }

  // Get predefined option strategies
  static getOptionStrategies(): OptionStrategy[] {
    return [
      {
        id: 'long_call',
        name: 'Long Call',
        description: 'Bullish strategy - Buy call option',
        legs: [{ action: 'BUY', type: 'CE', strike: 0, quantity: 1, premium: 0 }],
        maxProfit: Infinity,
        maxLoss: 0,
        breakeven: [0],
        margin: 0,
        riskReward: Infinity
      },
      {
        id: 'long_put',
        name: 'Long Put',
        description: 'Bearish strategy - Buy put option',
        legs: [{ action: 'BUY', type: 'PE', strike: 0, quantity: 1, premium: 0 }],
        maxProfit: 0,
        maxLoss: 0,
        breakeven: [0],
        margin: 0,
        riskReward: 0
      },
      {
        id: 'covered_call',
        name: 'Covered Call',
        description: 'Hold stock + Sell call option',
        legs: [{ action: 'SELL', type: 'CE', strike: 0, quantity: 1, premium: 0 }],
        maxProfit: 0,
        maxLoss: 0,
        breakeven: [0],
        margin: 0,
        riskReward: 0
      },
      {
        id: 'bull_call_spread',
        name: 'Bull Call Spread',
        description: 'Buy lower strike call + Sell higher strike call',
        legs: [
          { action: 'BUY', type: 'CE', strike: 0, quantity: 1, premium: 0 },
          { action: 'SELL', type: 'CE', strike: 0, quantity: 1, premium: 0 }
        ],
        maxProfit: 0,
        maxLoss: 0,
        breakeven: [0],
        margin: 0,
        riskReward: 0
      },
      {
        id: 'iron_condor',
        name: 'Iron Condor',
        description: 'Sell call spread + Sell put spread',
        legs: [
          { action: 'SELL', type: 'CE', strike: 0, quantity: 1, premium: 0 },
          { action: 'BUY', type: 'CE', strike: 0, quantity: 1, premium: 0 },
          { action: 'SELL', type: 'PE', strike: 0, quantity: 1, premium: 0 },
          { action: 'BUY', type: 'PE', strike: 0, quantity: 1, premium: 0 }
        ],
        maxProfit: 0,
        maxLoss: 0,
        breakeven: [0, 0],
        margin: 0,
        riskReward: 0
      }
    ];
  }

  // Helper functions
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private static normalPDF(x: number): number {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  private static erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private static getNextExpiryDates(): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    // Get next 3 monthly expiries (last Thursday of month)
    for (let i = 0; i < 3; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
      const lastThursday = this.getLastThursday(month);
      dates.push(lastThursday.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  private static getLastThursday(date: Date): Date {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const day = lastDay.getDay();
    const diff = day >= 4 ? day - 4 : day + 3;
    return new Date(lastDay.getTime() - diff * 24 * 60 * 60 * 1000);
  }

  private static generateStrikes(spotPrice: number): number[] {
    const strikes: number[] = [];
    const baseStrike = Math.round(spotPrice / 50) * 50; // Round to nearest 50
    
    // Generate strikes from -20% to +20% of spot price
    for (let i = -10; i <= 10; i++) {
      strikes.push(baseStrike + (i * 50));
    }
    
    return strikes.filter(strike => strike > 0);
  }

  private static getTimeToExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0.001, diffDays / 365); // Minimum 0.001 years to avoid division by zero
  }

  private static getLotSize(symbol: string): number {
    // Standard lot sizes for major Indian stocks
    const lotSizes: { [key: string]: number } = {
      'RELIANCE': 250,
      'TCS': 150,
      'INFY': 300,
      'HDFCBANK': 550,
      'ICICIBANK': 1375,
      'SBIN': 3000,
      'BHARTIARTL': 1800,
      'ITC': 3200,
      'HINDUNILVR': 300,
      'KOTAKBANK': 400,
      'LT': 700,
      'HCLTECH': 700,
      'ASIANPAINT': 150,
      'AXISBANK': 1200,
      'MARUTI': 100
    };
    
    return lotSizes[symbol] || 1000; // Default lot size
  }
}

export default OptionsService;
