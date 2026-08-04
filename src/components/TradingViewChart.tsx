import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, Time } from 'lightweight-charts';
import { Loader2, BrainCircuit } from 'lucide-react';
import { getMLPriceForecast, MLForecastResult } from '../services/mlForecastingService';

export type AssetType = 'crypto' | 'forex' | 'stock' | 'commodity';

export interface TradingViewChartProps {
  symbol: string;
  assetType: AssetType;
  exchange?: string;
  height?: number;
  showMlForecast?: boolean;
  forecastHorizon?: number;
  onPriceUpdate?: (price: number) => void;
}

export function TradingViewChart({
  symbol,
  assetType,
  exchange,
  height = 500,
  showMlForecast = false,
  forecastHorizon = 20,
  onPriceUpdate,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // ML Series Refs
  const mlTrendSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const mlUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const mlLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlData, setMlData] = useState<MLForecastResult | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const getResponsiveHeight = () => {
      if (window.innerWidth < 640) return 300;
      if (window.innerWidth < 1024) return 400;
      return height;
    };

    const initialHeight = getResponsiveHeight();
    chartContainerRef.current.style.height = `${initialHeight}px`;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      width: chartContainerRef.current.clientWidth,
      height: initialHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2B2B43',
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Fetch initial data
    loadChartData();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const currentHeight = getResponsiveHeight();
        chartContainerRef.current.style.height = `${currentHeight}px`;
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: currentHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Real-time updates
    let ws: WebSocket | null = null;
    let updateInterval: NodeJS.Timeout | null = null;

    if (assetType === 'crypto') {
      const cleanSymbol = symbol.replace('/', '').toLowerCase();
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${cleanSymbol}@kline_1m`);

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.e === 'kline' && message.k) {
            const k = message.k;
            const latestCandle = {
              time: Math.floor(k.t / 1000) as Time,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };

            if (seriesRef.current) {
              seriesRef.current.update(latestCandle);
              if (onPriceUpdate) {
                onPriceUpdate(latestCandle.close);
              }
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('Binance WebSocket error:', err);
      };
    } else {
      updateInterval = setInterval(() => {
        updateChartData();
      }, 5000);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ws) {
        ws.close();
      }
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      chart.remove();
    };
  }, [symbol, assetType, exchange]);

  // Load and apply ML forecast whenever showMlForecast changes
  useEffect(() => {
    if (showMlForecast) {
      applyMlForecastOverlay();
    } else {
      removeMlForecastOverlay();
    }
  }, [showMlForecast, forecastHorizon, symbol]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { fetchChartData } = await import('../services/dataFeed');
      const data = await fetchChartData(symbol, assetType, exchange);

      if (seriesRef.current && data.length > 0) {
        seriesRef.current.setData(data);
        
        if (onPriceUpdate && data.length > 0) {
          const latestPrice = data[data.length - 1].close;
          onPriceUpdate(latestPrice);
        }

        if (showMlForecast) {
          applyMlForecastOverlay(data);
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load chart data');
      setLoading(false);
    }
  };

  const applyMlForecastOverlay = async (historicalData?: any[]) => {
    if (!chartRef.current) return;

    const { fetchChartData } = await import('../services/dataFeed');
    const data = historicalData || await fetchChartData(symbol, assetType, exchange);

    const fcResult = await getMLPriceForecast(symbol, data, forecastHorizon);
    setMlData(fcResult);

    removeMlForecastOverlay();

    if (fcResult.forecastPoints.length === 0) return;

    // Last historical candle point for seamless connecting line
    const lastHistorical = data[data.length - 1];
    const connectTime = lastHistorical.time as Time;
    const connectPrice = lastHistorical.close;

    // Forecast Mean Trend Line
    const trendLine = chartRef.current.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: 'ML Projected Trend',
    });

    const upperLine = chartRef.current.addLineSeries({
      color: '#10b981',
      lineWidth: 1,
      lineStyle: 3, // Dotted
      title: '95% Upper Corridor',
    });

    const lowerLine = chartRef.current.addLineSeries({
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 3, // Dotted
      title: '95% Lower Corridor',
    });

    const trendPoints = [
      { time: connectTime, value: connectPrice },
      ...fcResult.forecastPoints.map(p => ({ time: p.time as Time, value: p.predictedClose }))
    ];

    const upperPoints = [
      { time: connectTime, value: connectPrice },
      ...fcResult.forecastPoints.map(p => ({ time: p.time as Time, value: p.upper95 }))
    ];

    const lowerPoints = [
      { time: connectTime, value: connectPrice },
      ...fcResult.forecastPoints.map(p => ({ time: p.time as Time, value: p.lower95 }))
    ];

    trendLine.setData(trendPoints);
    upperLine.setData(upperPoints);
    lowerLine.setData(lowerPoints);

    mlTrendSeriesRef.current = trendLine;
    mlUpperSeriesRef.current = upperLine;
    mlLowerSeriesRef.current = lowerLine;
  };

  const removeMlForecastOverlay = () => {
    if (!chartRef.current) return;
    if (mlTrendSeriesRef.current) {
      chartRef.current.removeSeries(mlTrendSeriesRef.current);
      mlTrendSeriesRef.current = null;
    }
    if (mlUpperSeriesRef.current) {
      chartRef.current.removeSeries(mlUpperSeriesRef.current);
      mlUpperSeriesRef.current = null;
    }
    if (mlLowerSeriesRef.current) {
      chartRef.current.removeSeries(mlLowerSeriesRef.current);
      mlLowerSeriesRef.current = null;
    }
    setMlData(null);
  };

  const updateChartData = async () => {
    try {
      const { fetchLatestCandle } = await import('../services/dataFeed');
      const latestCandle = await fetchLatestCandle(symbol, assetType, exchange);

      if (seriesRef.current && latestCandle) {
        seriesRef.current.update(latestCandle);
        if (onPriceUpdate) {
          onPriceUpdate(latestCandle.close);
        }
      }
    } catch (err) {
      console.error('Failed to update chart:', err);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-red-400 p-4 rounded">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* ML Overlay Badge */}
      {showMlForecast && mlData && (
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-gray-950/90 border border-blue-500/40 text-white px-3 py-1.5 rounded-lg text-xs backdrop-blur-md shadow-md">
          <BrainCircuit className="w-4 h-4 text-blue-400 animate-pulse" />
          <div>
            <span className="font-bold text-blue-400">ML Forecast ({mlData.modelType})</span>
            <span className="text-gray-400 ml-2 font-mono">+{mlData.horizonBars} bars | {mlData.accuracyConfidencePct}% Confidence</span>
          </div>
        </div>
      )}

      <div ref={chartContainerRef} style={{ height: `${height}px` }} />
    </div>
  );
}
