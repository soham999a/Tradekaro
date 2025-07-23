'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface AdvancedTradingChartProps {
  symbol: string;
  className?: string;
}

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicator {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  values: number[];
}

export default function AdvancedTradingChart({ symbol, className = '' }: AdvancedTradingChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('5m');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRealtime, setIsRealtime] = useState(true);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([
    { id: 'sma20', name: 'SMA (20)', enabled: false, color: '#3B82F6', values: [] },
    { id: 'sma50', name: 'SMA (50)', enabled: false, color: '#EF4444', values: [] },
    { id: 'ema12', name: 'EMA (12)', enabled: false, color: '#10B981', values: [] },
    { id: 'rsi', name: 'RSI (14)', enabled: false, color: '#8B5CF6', values: [] },
    { id: 'macd', name: 'MACD', enabled: false, color: '#F59E0B', values: [] }
  ]);
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);

  useEffect(() => {
    generateChartData();
    if (isRealtime) {
      const interval = setInterval(updateRealTimeData, 2000);
      return () => clearInterval(interval);
    }
  }, [symbol, timeframe, isRealtime]);

  useEffect(() => {
    drawChart();
  }, [chartData, chartType, indicators]);

  const generateChartData = () => {
    const data: CandlestickData[] = [];
    const now = new Date();
    const intervals = getIntervalsForTimeframe(timeframe);
    let basePrice = 2450; // Starting price

    for (let i = intervals; i >= 0; i--) {
      const time = new Date(now.getTime() - i * getMillisecondsForTimeframe(timeframe));
      
      // Generate realistic OHLC data
      const volatility = 0.02;
      const trend = Math.sin(i / 10) * 0.001;
      const randomChange = (Math.random() - 0.5) * volatility + trend;
      
      const open = basePrice;
      const close = open * (1 + randomChange);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 100000) + 10000;

      data.push({
        time: time.toISOString(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });

      basePrice = close;
    }

    setChartData(data);
    calculateIndicators(data);
  };

  const updateRealTimeData = () => {
    if (chartData.length === 0) return;

    setChartData(prevData => {
      const newData = [...prevData];
      const lastCandle = newData[newData.length - 1];
      
      // Update the last candle or add a new one
      const now = new Date();
      const lastTime = new Date(lastCandle.time);
      const timeDiff = now.getTime() - lastTime.getTime();
      const intervalMs = getMillisecondsForTimeframe(timeframe);

      if (timeDiff >= intervalMs) {
        // Create new candle
        const volatility = 0.005;
        const randomChange = (Math.random() - 0.5) * volatility;
        const newPrice = lastCandle.close * (1 + randomChange);
        
        newData.push({
          time: now.toISOString(),
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newPrice),
          low: Math.min(lastCandle.close, newPrice),
          close: Number(newPrice.toFixed(2)),
          volume: Math.floor(Math.random() * 50000) + 5000
        });

        // Keep only last 100 candles for performance
        if (newData.length > 100) {
          newData.shift();
        }
      } else {
        // Update current candle
        const volatility = 0.002;
        const randomChange = (Math.random() - 0.5) * volatility;
        const newPrice = lastCandle.close * (1 + randomChange);
        
        newData[newData.length - 1] = {
          ...lastCandle,
          high: Math.max(lastCandle.high, newPrice),
          low: Math.min(lastCandle.low, newPrice),
          close: Number(newPrice.toFixed(2)),
          volume: lastCandle.volume + Math.floor(Math.random() * 1000)
        };
      }

      return newData;
    });
  };

  const calculateIndicators = (data: CandlestickData[]) => {
    const closes = data.map(d => d.close);
    
    setIndicators(prev => prev.map(indicator => {
      let values: number[] = [];
      
      switch (indicator.id) {
        case 'sma20':
          values = calculateSMA(closes, 20);
          break;
        case 'sma50':
          values = calculateSMA(closes, 50);
          break;
        case 'ema12':
          values = calculateEMA(closes, 12);
          break;
        case 'rsi':
          values = calculateRSI(closes, 14);
          break;
        case 'macd':
          values = calculateMACD(closes);
          break;
      }
      
      return { ...indicator, values };
    }));
  };

  const calculateSMA = (prices: number[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  };

  const calculateEMA = (prices: number[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < prices.length; i++) {
      if (i === 0) {
        ema.push(prices[i]);
      } else {
        ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
      }
    }
    return ema;
  };

  const calculateRSI = (prices: number[], period: number): number[] => {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = 0; i < gains.length; i++) {
      if (i < period - 1) {
        rsi.push(NaN);
      } else {
        const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return [NaN, ...rsi]; // Add NaN for first price point
  };

  const calculateMACD = (prices: number[]): number[] => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    return ema12.map((val, i) => val - ema26[i]);
  };

  const getIntervalsForTimeframe = (tf: string): number => {
    switch (tf) {
      case '1m': return 60;
      case '5m': return 100;
      case '15m': return 96;
      case '1h': return 100;
      case '1d': return 100;
      default: return 100;
    }
  };

  const getMillisecondsForTimeframe = (tf: string): number => {
    switch (tf) {
      case '1m': return 60 * 1000;
      case '5m': return 5 * 60 * 1000;
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
      default: return 5 * 60 * 1000;
    }
  };

  const drawChart = () => {
    const canvas = chartRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate price range
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // Chart dimensions
    const chartWidth = rect.width - 80;
    const chartHeight = rect.height - 60;
    const chartLeft = 40;
    const chartTop = 20;

    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = chartTop + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartLeft + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const timeStep = Math.max(1, Math.floor(chartData.length / 10));
    for (let i = 0; i < chartData.length; i += timeStep) {
      const x = chartLeft + (chartWidth / (chartData.length - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, chartTop);
      ctx.lineTo(x, chartTop + chartHeight);
      ctx.stroke();
    }

    // Draw candlesticks or line chart
    if (chartType === 'candlestick') {
      drawCandlesticks(ctx, chartLeft, chartTop, chartWidth, chartHeight, minPrice - padding, maxPrice + padding);
    } else {
      drawLineChart(ctx, chartLeft, chartTop, chartWidth, chartHeight, minPrice - padding, maxPrice + padding);
    }

    // Draw indicators
    indicators.filter(ind => ind.enabled).forEach(indicator => {
      drawIndicator(ctx, indicator, chartLeft, chartTop, chartWidth, chartHeight, minPrice - padding, maxPrice + padding);
    });

    // Draw price labels
    drawPriceLabels(ctx, chartLeft + chartWidth + 5, chartTop, chartHeight, minPrice - padding, maxPrice + padding);
  };

  const drawCandlesticks = (ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, minPrice: number, maxPrice: number) => {
    const candleWidth = Math.max(2, width / chartData.length * 0.8);

    chartData.forEach((candle, index) => {
      const x = left + (width / (chartData.length - 1)) * index;
      const openY = top + height - ((candle.open - minPrice) / (maxPrice - minPrice)) * height;
      const closeY = top + height - ((candle.close - minPrice) / (maxPrice - minPrice)) * height;
      const highY = top + height - ((candle.high - minPrice) / (maxPrice - minPrice)) * height;
      const lowY = top + height - ((candle.low - minPrice) / (maxPrice - minPrice)) * height;

      const isGreen = candle.close > candle.open;

      // Draw wick
      ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = isGreen ? '#10B981' : '#EF4444';
      const bodyHeight = Math.abs(closeY - openY);
      const bodyTop = Math.min(openY, closeY);

      if (bodyHeight < 1) {
        // Doji - draw line
        ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - candleWidth / 2, openY);
        ctx.lineTo(x + candleWidth / 2, openY);
        ctx.stroke();
      } else {
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }
    });
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, minPrice: number, maxPrice: number) => {
    if (chartData.length < 2) return;

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((candle, index) => {
      const x = left + (width / (chartData.length - 1)) * index;
      const y = top + height - ((candle.close - minPrice) / (maxPrice - minPrice)) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area for area chart
    if (chartType === 'area') {
      ctx.lineTo(left + width, top + height);
      ctx.lineTo(left, top + height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, top, 0, top + height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  };

  const drawIndicator = (ctx: CanvasRenderingContext2D, indicator: TechnicalIndicator, left: number, top: number, width: number, height: number, minPrice: number, maxPrice: number) => {
    if (indicator.values.length === 0) return;

    ctx.strokeStyle = indicator.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    let started = false;
    indicator.values.forEach((value, index) => {
      if (isNaN(value)) return;

      const x = left + (width / (chartData.length - 1)) * index;
      let y: number;

      if (indicator.id === 'rsi') {
        // RSI uses 0-100 scale
        y = top + height - (value / 100) * height;
      } else {
        // Price-based indicators
        y = top + height - ((value - minPrice) / (maxPrice - minPrice)) * height;
      }

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  };

  const drawPriceLabels = (ctx: CanvasRenderingContext2D, x: number, top: number, height: number, minPrice: number, maxPrice: number) => {
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';

    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - ((maxPrice - minPrice) / 5) * i;
      const y = top + (height / 5) * i;
      ctx.fillText(`₹${price.toFixed(2)}`, x, y + 4);
    }
  };

  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '1d', label: '1d' }
  ];

  const chartTypes = [
    { value: 'candlestick', label: 'Candles', icon: '📊' },
    { value: 'line', label: 'Line', icon: '📈' },
    { value: 'area', label: 'Area', icon: '🏔️' }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Chart Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{symbol}</h3>
            <div className="flex items-center space-x-2">
              {chartData.length > 0 && (
                <div className={`text-sm font-medium ${
                  chartData[chartData.length - 1].close > chartData[chartData.length - 1].open
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  ₹{chartData[chartData.length - 1]?.close.toFixed(2)}
                </div>
              )}
              <div className={`w-2 h-2 rounded-full ${isRealtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value as any)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    timeframe === tf.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {chartTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value as any)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    chartType === type.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={type.label}
                >
                  {type.icon}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsRealtime(!isRealtime)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isRealtime ? 'Pause real-time' : 'Start real-time'}
              >
                {isRealtime ? (
                  <PauseIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <PlayIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <button
                onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Technical Indicators"
              >
                <Cog6ToothIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ArrowsPointingOutIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Indicators Panel */}
        {showIndicatorPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Technical Indicators</h4>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {indicators.map((indicator) => (
                <button
                  key={indicator.id}
                  onClick={() => setIndicators(prev =>
                    prev.map(ind =>
                      ind.id === indicator.id
                        ? { ...ind, enabled: !ind.enabled }
                        : ind
                    )
                  )}
                  className={`flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors ${
                    indicator.enabled
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500'
                  }`}
                >
                  {indicator.enabled ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                  <span className="font-medium">{indicator.name}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: indicator.color }}
                  ></div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        <canvas
          ref={chartRef}
          className="w-full h-64 lg:h-96"
          style={{ height: isFullscreen ? 'calc(100vh - 200px)' : undefined }}
        />

        {chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
