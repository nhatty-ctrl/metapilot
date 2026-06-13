import React, { useState } from 'react';
import { 
  TrendingUp,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  ShieldCheck,
  Percent,
  X,
  ChevronRight,
  Plus,
  Trash2,
  Trash,
  HelpCircle
} from 'lucide-react';
import { 
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { TransactionRecord, BalanceState, PriceAlert } from '../types';
import { DeFiYieldDashboard } from './DeFiYieldDashboard';

interface SpeculosEmulatorProps {
  txLog: TransactionRecord[];
  selectedToken: "WBTC" | "ETH" | "ARB";
  setSelectedToken: (token: "WBTC" | "ETH" | "ARB") => void;
  balances: BalanceState;
  alerts: PriceAlert[];
  onAddAlert: (token: "ETH" | "WBTC" | "ARB", targetPrice: number, condition: "above" | "below") => void;
  onDeleteAlert: (id: string) => void;
  prices: { ETH: number; WBTC: number; ARB: number };
  onSimulatePriceTick: () => void;
  onOpenReceiptDetails: (tx: TransactionRecord) => void;
  activeTab?: "charts" | "yields" | "receipts";
  onActiveTabChange?: (tab: "charts" | "yields" | "receipts") => void;
}

const CRYPTO_DATA = {
  WBTC: {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    price: 64920.00,
    change24h: 3.42,
    sparkline: [62100, 62800, 62450, 63100, 63900, 64200, 64920],
    volume24h: "$28.4B",
    marketCap: "$1.28T",
    high24h: 65150.00,
    low24h: 62050.00,
    history: {
      "1D": [
        { time: "00:00", price: 62050, open: 61950, close: 62100, high: 62200, low: 61800 },
        { time: "04:00", price: 62400, open: 62100, close: 62500, high: 62650, low: 62000 },
        { time: "08:00", price: 62800, open: 62500, close: 62750, high: 62900, low: 62400 },
        { time: "12:00", price: 63500, open: 62750, close: 63600, high: 63800, low: 62700 },
        { time: "16:00", price: 63200, open: 63600, close: 63150, high: 63750, low: 63000 },
        { time: "20:00", price: 64600, open: 63150, close: 64500, high: 64700, low: 63100 },
        { time: "23:59", price: 64920, open: 64500, close: 64920, high: 65150, low: 64400 }
      ],
      "1W": [
        { time: "Mon", price: 61800, open: 61500, close: 61900, high: 62100, low: 61400 },
        { time: "Tue", price: 62450, open: 61900, close: 62500, high: 62700, low: 61800 },
        { time: "Wed", price: 63100, open: 62500, close: 63200, high: 63400, low: 62400 },
        { time: "Thu", price: 62900, open: 63200, close: 62800, high: 63450, low: 62650 },
        { time: "Fri", price: 64200, open: 62800, close: 64300, high: 64500, low: 62700 },
        { time: "Sat", price: 64500, open: 64300, close: 64450, high: 64700, low: 64150 },
        { time: "Sun", price: 64920, open: 64450, close: 64920, high: 65150, low: 64300 }
      ],
      "1M": [
        { time: "W1", price: 58905, open: 58500, close: 59100, high: 59400, low: 58200 },
        { time: "W2", price: 61200, open: 59100, close: 61400, high: 61800, low: 58900 },
        { time: "W3", price: 63100, open: 61400, close: 63300, high: 63600, low: 61100 },
        { time: "W4", price: 64920, open: 63300, close: 64920, high: 65150, low: 63000 }
      ]
    }
  },
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    price: 3082.50,
    change24h: -1.24,
    sparkline: [3150, 3120, 3180, 3140, 3100, 3070, 3082.5],
    volume24h: "$14.1B",
    marketCap: "$374.2B",
    high24h: 3192.00,
    low24h: 3054.00,
    history: {
      "1D": [
        { time: "00:00", price: 3190, open: 3200, close: 3175, high: 3210, low: 3165 },
        { time: "04:00", price: 3150, open: 3175, close: 3145, high: 3185, low: 3130 },
        { time: "08:00", price: 3175, open: 3145, close: 3180, high: 3190, low: 3135 },
        { time: "12:00", price: 3110, open: 3180, close: 3105, high: 3185, low: 3100 },
        { time: "16:00", price: 3060, open: 3105, close: 3055, high: 3110, low: 3045 },
        { time: "20:00", price: 3075, open: 3055, close: 3080, high: 3090, low: 3050 },
        { time: "23:59", price: 3082.50, open: 3080, close: 3082.5, high: 3105, low: 3075 }
      ],
      "1W": [
        { time: "Mon", price: 3250, open: 3280, close: 3240, high: 3290, low: 3210 },
        { time: "Tue", price: 3180, open: 3240, close: 3170, high: 3255, low: 3150 },
        { time: "Wed", price: 3200, open: 3170, close: 3210, high: 3230, low: 3160 },
        { time: "Thu", price: 3120, open: 3210, close: 3115, high: 3220, low: 3100 },
        { time: "Fri", price: 3090, open: 3115, close: 3085, high: 3125, low: 3060 },
        { time: "Sat", price: 3075, open: 3085, close: 3070, high: 3095, low: 3055 },
        { time: "Sun", price: 3082.50, open: 3070, close: 3082.5, high: 3105, low: 3060 }
      ],
      "1M": [
        { time: "W1", price: 3450, open: 3500, close: 3420, high: 3520, low: 3380 },
        { time: "W2", price: 3300, open: 3420, close: 3280, high: 3440, low: 3250 },
        { time: "W3", price: 3150, open: 3280, close: 3160, high: 3310, low: 3120 },
        { time: "W4", price: 3082.5, open: 3160, close: 3082.5, high: 3192, low: 3054 }
      ]
    }
  },
  ARB: {
    name: "Arbitrum",
    symbol: "ARB",
    price: 0.95,
    change24h: 5.67,
    sparkline: [0.88, 0.90, 0.89, 0.91, 0.93, 0.92, 0.95],
    volume24h: "$168M",
    marketCap: "$1.21B",
    high24h: 0.98,
    low24h: 0.87,
    history: {
      "1D": [
        { time: "00:00", price: 0.87, open: 0.86, close: 0.87, high: 0.88, low: 0.85 },
        { time: "04:00", price: 0.89, open: 0.87, close: 0.89, high: 0.91, low: 0.86 },
        { time: "08:00", price: 0.91, open: 0.89, close: 0.91, high: 0.92, low: 0.88 },
        { time: "12:00", price: 0.90, open: 0.91, close: 0.90, high: 0.93, low: 0.89 },
        { time: "16:00", price: 0.93, open: 0.90, close: 0.93, high: 0.94, low: 0.89 },
        { time: "20:00", price: 0.92, open: 0.93, close: 0.92, high: 0.95, low: 0.91 },
        { time: "23:59", price: 0.95, open: 0.92, close: 0.95, high: 0.98, low: 0.91 }
      ],
      "1W": [
        { time: "Mon", price: 0.85, open: 0.83, close: 0.85, high: 0.86, low: 0.82 },
        { time: "Tue", price: 0.88, open: 0.85, close: 0.88, high: 0.90, low: 0.84 },
        { time: "Wed", price: 0.89, open: 0.88, close: 0.89, high: 0.91, low: 0.87 },
        { time: "Thu", price: 0.87, open: 0.89, close: 0.86, high: 0.90, low: 0.85 },
        { time: "Fri", price: 0.91, open: 0.86, close: 0.91, high: 0.93, low: 0.85 },
        { time: "Sat", price: 0.93, open: 0.91, close: 0.93, high: 0.94, low: 0.90 },
        { time: "Sun", price: 0.95, open: 0.93, close: 0.95, high: 0.98, low: 0.92 }
      ],
      "1M": [
        { time: "W1", price: 0.82, open: 0.79, close: 0.82, high: 0.84, low: 0.78 },
        { time: "W2", price: 0.86, open: 0.82, close: 0.87, high: 0.89, low: 0.81 },
        { time: "W3", open: 0.87, close: 0.90, high: 0.92, low: 0.85, price: 0.90 },
        { time: "W4", open: 0.90, close: 0.95, high: 0.98, low: 0.87, price: 0.95 }
      ]
    }
  }
};

// Premium live yields data matching Arbitrum pools
const PREMIUM_YIELDS = [
  {
    protocol: "Aave V3",
    pool: "USDC Token Pool",
    token: "USDC",
    apy: "12.42%",
    tvl: "$142.5M",
    risk: "Low" as const,
    type: "Lending",
    safetyScore: "A+"
  },
  {
    protocol: "Camelot CL",
    pool: "ARB / ETH Liquidity",
    token: "ARB",
    apy: "24.60%",
    tvl: "$42.8M",
    risk: "Medium" as const,
    type: "Auto-LP",
    safetyScore: "B+"
  },
  {
    protocol: "GMX GLP Index",
    pool: "GMX Multi-Asset Index",
    token: "USDC/ETH/WBTC",
    apy: "18.25%",
    tvl: "$89.5M",
    risk: "Medium" as const,
    type: "index",
    safetyScore: "A-"
  },
  {
    protocol: "Lido Staking",
    pool: "Liquid wstETH Hold",
    token: "ETH",
    apy: "3.85%",
    tvl: "$210.4M",
    risk: "Low" as const,
    type: "Staking",
    safetyScore: "AA"
  },
  {
    protocol: "Balancer Multi",
    pool: "WBTC / ETH Stable Pool",
    token: "WBTC",
    apy: "9.40%",
    tvl: "$61.2M",
    risk: "Low" as const,
    type: "Stable Pool",
    safetyScore: "B+"
  }
];

function getSparklinePath(prices: number[], width: number, height: number): string {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const p = prices.map((price, i) => {
    const x = (width * i) / (prices.length - 1);
    const y = height - ((height - 6) * (price - min)) / range - 3;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return p.join(' ');
}

// Custom Candlestick Component for Recharts
const CandlestickBar = (props: any) => {
  const { x, y, width, open, close, high, low, yScale } = props;
  if (x === undefined || y === undefined || open === undefined || yScale === undefined) return null;

  const yOpen = yScale(open);
  const yClose = yScale(close);
  const yHigh = yScale(high);
  const yLow = yScale(low);

  const cx = x + width / 2;
  const isUp = close >= open;
  const strokeColor = isUp ? '#5DCAA5' : '#f43f5e';
  const fillColor = isUp ? 'rgba(93, 202, 165, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  return (
    <g>
      {/* Wick line representing high-low boundary */}
      <line 
        x1={cx} 
        y1={yHigh} 
        x2={cx} 
        y2={yLow} 
        stroke={strokeColor} 
        strokeWidth={1.5} 
      />
      {/* Body rect representing open-close boundary */}
      <rect 
        x={x} 
        y={Math.min(yOpen, yClose)} 
        width={width} 
        height={Math.max(Math.abs(yOpen - yClose), 2)} 
        fill={fillColor} 
        stroke={strokeColor} 
        strokeWidth={1.5} 
        rx={1}
      />
    </g>
  );
};

export const SpeculosEmulator: React.FC<SpeculosEmulatorProps> = ({
  txLog,
  selectedToken,
  setSelectedToken,
  balances,
  alerts,
  onAddAlert,
  onDeleteAlert,
  prices,
  onSimulatePriceTick,
  onOpenReceiptDetails,
  activeTab: activeTabProp,
  onActiveTabChange
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<"charts" | "yields" | "receipts">("charts");
  const activeTab = activeTabProp !== undefined ? activeTabProp : localActiveTab;
  const setActiveTab = onActiveTabChange !== undefined ? onActiveTabChange : setLocalActiveTab;

  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M">("1D");

  // Local state for alert setup inputs
  const [alertTargetToken, setAlertTargetToken] = useState<"ETH" | "WBTC" | "ARB">("ETH");
  const [alertPriceInput, setAlertPriceInput] = useState<string>("");
  const [alertCondition, setAlertCondition] = useState<"above" | "below">("above");

  const featured = CRYPTO_DATA[selectedToken] || CRYPTO_DATA.ETH;
  const rawPoints = featured.history[timeframe];
  
  // Dynamic spot price matching simulation state
  const spotPrice = prices[selectedToken] || featured.price;

  // Let's modify the last point of history to dynamically stretch based on simulated pricing tick
  const chartPoints = rawPoints.map((p, idx) => {
    if (idx === rawPoints.length - 1) {
      const updated = { ...p };
      updated.close = spotPrice;
      updated.price = spotPrice;
      if (spotPrice > updated.open) {
        updated.high = Math.max(updated.open * 1.01, spotPrice * 1.002);
        updated.low = Math.min(updated.open * 0.99, updated.open * 0.995);
      } else {
        updated.high = Math.max(updated.open * 1.01, updated.open * 1.005);
        updated.low = Math.min(updated.open * 0.99, spotPrice * 0.998);
      }
      return updated;
    }
    return p;
  });

  const handleCreateAlert = () => {
    const numPrice = parseFloat(alertPriceInput);
    if (!numPrice || isNaN(numPrice) || numPrice <= 0) {
      alert("Please specify a valid alert floor target price.");
      return;
    }
    onAddAlert(alertTargetToken, numPrice, alertCondition);
    setAlertPriceInput("");
  };

  // Recharts Candlestick Custom Tooltip
  const CustomCandleTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isUp = data.close >= data.open;
      return (
        <div className="bg-[#0c0c12]/95 border border-white/10 p-3 rounded-xl text-[10px] font-mono shadow-2xl space-y-1 select-none pointer-events-none">
          <p className="font-extrabold text-white uppercase border-b border-white/5 pb-1 flex justify-between items-center gap-6">
            <span>Interval: {data.time}</span>
            <span className={isUp ? "text-emerald-400" : "text-rose-400"}>
              {isUp ? "🐂 bullish" : "🐻 bearish"}
            </span>
          </p>
          <div className="space-y-0.5 text-zinc-350">
            <p className="flex justify-between gap-4">
              <span className="text-zinc-550">OPEN:</span> 
              <span className="font-bold text-zinc-150">${data.open.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-zinc-550">CLOSE:</span> 
              <span className="font-bold text-zinc-100">${data.close.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-zinc-550">HIGH:</span> 
              <span className="font-bold text-emerald-400">${data.high.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-zinc-550">LOW:</span> 
              <span className="font-bold text-rose-450">${data.low.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Recharts Balance Pie Chart calculations
  const ethUSD = balances.ETH * prices.ETH;
  const wbtcUSD = balances.BTC * prices.WBTC;
  const arbUSD = (balances.ARB || 0) * prices.ARB;
  const totalUSDIndexed = ethUSD + wbtcUSD + arbUSD;

  const pieData = [
    { name: 'ETH', value: ethUSD, color: '#38bdf8' }, // light blue
    { name: 'WBTC', value: wbtcUSD, color: '#f59e0b' }, // gold
    { name: 'ARB', value: arbUSD, color: '#5DCAA5' }   // mint
  ];

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalUSDIndexed > 0 ? ((data.value / totalUSDIndexed) * 100).toFixed(1) : "0.0";
      return (
        <div className="bg-[#0a0a0f]/95 border border-white/10 px-3 py-2 rounded-xl text-[10px] font-mono shadow-2xl space-y-0.5 pointer-events-none">
          <p className="font-bold text-white flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name} Allocation
          </p>
          <p className="text-zinc-350 font-bold">${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[#5DCAA5] font-extrabold">{pct}% portfolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <aside className="w-100 flex flex-col shrink-0 glass border-l border-white/5 bg-ink-950/70 overflow-hidden select-none">
      
      {/* Segmented Controller Tab Selector - Three active tabs */}
      <div className="p-3 border-b border-white/5 bg-zinc-950/30 flex gap-1 select-none shrink-0">
        <button
          onClick={() => setActiveTab("charts")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
            activeTab === "charts"
              ? "bg-zinc-900 border border-zinc-800 text-white shadow-md font-extrabold"
              : "border border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Crypto Charts</span>
        </button>
        <button
          onClick={() => setActiveTab("yields")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
            activeTab === "yields"
              ? "bg-zinc-900 border border-zinc-800 text-white shadow-md font-extrabold"
              : "border border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-[#5DCAA5]" />
          <span>L2 Yields</span>
        </button>
        <button
          onClick={() => setActiveTab("receipts")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer relative ${
            activeTab === "receipts"
              ? "bg-zinc-900 border border-zinc-800 text-white shadow-md font-extrabold"
              : "border border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-zinc-400" />
          <span>Receipts ({txLog.length})</span>
        </button>
      </div>

      {activeTab === "charts" ? (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Token Selector Cards */}
          <div className="p-4 grid grid-cols-3 gap-2 border-b border-white/5 bg-zinc-950/20 shrink-0">
            {Object.keys(CRYPTO_DATA).map((sym) => {
              const item = CRYPTO_DATA[sym as keyof typeof CRYPTO_DATA];
              const isSelected = selectedToken === sym;
              const curPrice = prices[sym as "ETH" | "WBTC" | "ARB"] || item.price;
              const isUp = item.change24h >= 0;
              return (
                <button
                  key={sym}
                  onClick={() => {
                    setSelectedToken(sym as any);
                    // Update alert inputs placeholder preview token too
                    setAlertTargetToken(sym as any);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-700 ring-1 ring-zinc-800 text-white shadow-lg"
                      : "bg-transparent border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/[0.01]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold font-sans uppercase text-zinc-100 tracking-tight">{item.name.split(' ')[0]}</span>
                    <span className="text-[8px] font-mono font-medium opacity-50">{sym}</span>
                  </div>

                  <div className="my-2 h-4 overflow-hidden w-full pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 80 16">
                      <path
                        d={getSparklinePath(item.sparkline, 80, 16)}
                        stroke={isUp ? "#5DCAA5" : "#f43f5e"}
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-extrabold text-zinc-200">
                      ${curPrice < 50 ? curPrice.toFixed(2) : Math.round(curPrice).toLocaleString()}
                    </span>
                    <span className={`text-[8px] font-mono font-semibold flex items-center ${
                      isUp ? "text-[#5DCAA5]" : "text-rose-455"
                    }`}>
                      {isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                      <span>{Math.abs(item.change24h)}%</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Core Chart Body */}
          <div className="p-4 flex-1 flex flex-col min-h-0 select-none">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-zinc-455" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-300 uppercase">
                  {featured.name} Candle Trend
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold flex items-center gap-0.5 ${
                  featured.change24h >= 0 ? "bg-emerald-950/40 text-emerald-400 border border-emerald-950" : "bg-rose-950/40 text-rose-400 border border-rose-950/50"
                }`}>
                  {featured.change24h >= 0 ? "+" : ""}{featured.change24h}%
                </span>
              </div>

              <div className="bg-zinc-900 border border-white/5 rounded-lg p-0.5 flex">
                {(["1D", "1W", "1M"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 text-[9px] font-mono rounded-md font-bold transition-all cursor-pointer ${
                      timeframe === tf
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Price reference statistics */}
            <div className="mb-4 bg-zinc-900/30 border border-white/5 p-3 rounded-2xl flex items-center justify-between shrink-0">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest">
                  Oracle Spot Price
                </span>
                <p className="text-base font-mono font-extrabold text-white tracking-tight leading-none mt-1">
                  ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest">Redundant Oracles</span>
                <p className="text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full led inline-block animate-ping" />
                  Chainlink L2
                </p>
              </div>
            </div>

            {/* Recharts Interactive Candlestick Chart Area */}
            <div className="relative border border-white/5 rounded-2xl bg-zinc-950/60 p-1 flex-1 min-h-[160px] flex flex-col justify-between shrink-0">
              <div className="absolute inset-0 pointer-events-none opacity-[0.01] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:100%_12px]" />
              
              <div className="w-full h-full flex-1 min-h-[140px] px-1 pt-2">
                <ResponsiveContainer width="99%" height="100%">
                  <ComposedChart data={chartPoints} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#4b5563" 
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: '8px', fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="#4b5563"
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: '8px', fontFamily: 'monospace' }} 
                    />
                    <RechartsTooltip content={<CustomCandleTooltip />} />
                    <Bar 
                      dataKey="close" 
                      // Custom candlestick renderer
                      shape={<CandlestickBar />}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Pie Chart of Wallet Balance Portfolio */}
            <div id="wallet-distribution-section" className="mt-4 bg-zinc-900/30 border border-white/5 p-4 rounded-2xl space-y-3 shrink-0">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-300 uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#5DCAA5]" />
                  Wallet Balance Distribution
                </span>
                <span className="text-[8.5px] font-mono text-zinc-550 lowercase">
                  distribution weight breakdown
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Pie Chart display frame */}
                <div className="w-20 h-20 shrink-0 bg-zinc-900/40 rounded-full border border-white/[0.02] flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={34}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text */}
                  <div className="absolute text-center select-none pointer-events-none">
                    <p className="text-[7.5px] font-mono text-zinc-500 uppercase leading-none">Net</p>
                    <p className="text-[9.5px] font-sans font-black text-white mt-0.5 leading-none">Value</p>
                  </div>
                </div>

                {/* Pie Chart items legend detail table */}
                <div className="flex-1 space-y-1.5 text-[9.5px] font-mono">
                  {pieData.map((item, idx) => {
                    const percent = totalUSDIndexed > 0 ? ((item.value / totalUSDIndexed) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={idx} className="flex justify-between items-center bg-zinc-950/20 px-2 py-1 rounded-lg border border-white/[0.02] hover:border-white/5 transition-all">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-zinc-200 uppercase">{item.name}</span>
                        </div>
                        <span className="text-zinc-400 font-extrabold">${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({percent}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price Alert Sentinel Card */}
            <div id="price-sentinel-section" className="mt-4 bg-zinc-900/30 border border-white/5 p-4 rounded-2xl space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#5DCAA5] uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-[#5DCAA5]" />
                  Price Alert Sentinel
                </span>
                <button 
                  onClick={onSimulatePriceTick}
                  className="text-[9px] font-mono font-bold bg-[#5DCAA5]/10 hover:bg-[#5DCAA5]/20 border border-[#5DCAA5]/25 text-[#5DCAA5] rounded-full px-2.5 py-0.5 transition-all cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <span>Simulate Tick</span>
                </button>
              </div>

              <p className="text-[9.5px] font-mono text-zinc-500 leading-relaxed">
                Track custom token thresholds. Simulating prices perturb values randomly and evaluates active alert triggers.
              </p>

              {/* In-app inputs */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <label className="text-[8px] font-mono text-zinc-500 uppercase font-bold block mb-1">Alert Asset</label>
                  <select 
                    value={alertTargetToken}
                    onChange={(e) => setAlertTargetToken(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2 font-mono text-white outline-none focus:border-[#5DCAA5] cursor-pointer"
                  >
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="WBTC">WBTC (Bitcoin)</option>
                    <option value="ARB">ARB (Arbitrum)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-mono text-zinc-500 uppercase font-bold block mb-1">Target price (USD)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={alertPriceInput}
                    onChange={(e) => setAlertPriceInput(e.target.value)}
                    placeholder={alertTargetToken === 'WBTC' ? '65000' : alertTargetToken === 'ETH' ? '3100' : '0.90'}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2 font-mono text-white outline-none focus:border-[#5DCAA5]"
                  />
                </div>
              </div>

              <div className="flex gap-2 text-[9.5px] font-mono">
                <button
                  onClick={() => setAlertCondition('above')}
                  className={`flex-1 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                    alertCondition === 'above' 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                      : 'bg-zinc-900 border-white/5 text-zinc-500'
                  }`}
                >
                  CROSS ABOVE
                </button>
                <button
                  onClick={() => setAlertCondition('below')}
                  className={`flex-1 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                    alertCondition === 'below' 
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-450' 
                      : 'bg-zinc-900 border-white/5 text-zinc-500'
                  }`}
                >
                  CROSS BELOW
                </button>
              </div>

              <button
                onClick={handleCreateAlert}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold border border-zinc-750 hover:border-[#5DCAA5]/25 text-zinc-200 hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Activate Trigger Guard</span>
              </button>

              {/* List of active Price Alerts */}
              {alerts && alerts.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/[0.03]">
                  <h5 className="text-[8px] font-mono font-black uppercase tracking-widest text-zinc-550 px-0.5">Active Sentinels</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5 scrollbar-thin">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={`flex justify-between items-center p-2 rounded-xl border text-[9px] font-mono transition-all ${
                          alert.triggered 
                            ? 'bg-zinc-900/10 border-white/[0.02] opacity-40 text-zinc-550' 
                            : 'bg-zinc-950/60 border-white/5 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${alert.triggered ? 'bg-zinc-550' : 'bg-[#5DCAA5] animate-ping'}`} />
                          <span className="font-bold text-zinc-100">{alert.token}</span>
                          <span className="text-zinc-500 uppercase text-[8px]">
                            {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[7.5px] font-semibold px-1.5 py-0.5 rounded leading-none border ${
                            alert.triggered 
                              ? 'bg-zinc-900 text-zinc-500 border-white/[0.02]' 
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-950/4s'
                          }`}>
                            {alert.triggered ? 'TRIGGERED' : 'ARMED'}
                          </span>
                          <button 
                            onClick={() => onDeleteAlert(alert.id)}
                            className="text-zinc-550 hover:text-rose-450 p-0.5 rounded cursor-pointer transition-colors"
                            title="Delete Alert"
                          >
                            <Trash className="w-3 h-3 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-zinc-900/10 border border-white/5 rounded-xl text-[9.5px] font-mono text-zinc-500 leading-relaxed text-center shrink-0">
              Interactive sandbox price alerts and Recharts layout synchronized under decentralized Arbitrum oracle streams.
            </div>
          </div>
        </div>
      ) : activeTab === "yields" ? (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          <div className="shrink-0 space-y-1">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-[#5DCAA5] uppercase select-none">Live Yield Discovery</h3>
            <p className="text-[9.5px] font-mono text-zinc-500 select-none font-medium text-left">
              Query pool APYs parsed directly from the DeFi Llama API stream on Arbitrum.
            </p>
          </div>

          {/* Historical APY Performance comparative chart */}
          <DeFiYieldDashboard className="shrink-0" />

          <div className="space-y-1 shrink-0 pt-2 border-t border-white/[0.03]">
            <h4 className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-zinc-400">Active Pools</h4>
          </div>

          <div className="space-y-2.5 flex-1 pr-1 overflow-y-auto scrollbar-thin">
            {PREMIUM_YIELDS.map((item, idx) => {
              const rColor = item.risk === "Low" ? "text-emerald-400 border-emerald-900/30 bg-emerald-950/10" : "text-amber-400 border-amber-900/30 bg-amber-950/10";
              return (
                <div 
                  key={idx}
                  className="bg-zinc-950/40 border border-white/5 hover:border-white/10 p-3.5 rounded-2xl flex flex-col gap-3 transition-all hover:bg-zinc-950/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center font-mono font-black text-[9px] text-[#5DCAA5]">
                        {item.token.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-200 font-sans tracking-tight">{item.protocol}</h4>
                        <span className="text-[9px] font-mono text-zinc-500">{item.pool}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-[#5DCAA5]">{item.apy}</span>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest leading-none mt-0.5">EST. APY</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono pt-2 border-t border-white/[0.03] text-zinc-500 select-none">
                    <div className="flex items-center gap-1">
                      <span>TVL:</span>
                      <span className="text-zinc-300 font-bold">{item.tvl}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-sans font-bold">
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] ${rColor}`}>
                        {item.risk} Risk
                      </span>
                      <span className="px-1.5 py-0.5 bg-zinc-900 rounded text-[8px] border border-white/5 text-zinc-400">
                        {item.safetyScore} Audit
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secure Sentinel Stats */}
          <div className="bg-zinc-950/20 border border-white/5 p-3 rounded-2xl space-y-2 shrink-0 select-none">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5DCAA5]" />
              <span>Yield Audit Guard</span>
            </div>
            <p className="text-[9.5px] font-mono text-zinc-505 leading-relaxed text-left">
              MetaPilot actively checks token contracts, lock-up timers, and liquid pools depth on Arbitrum. Swaps use 0.5% max slippage guarantees.
            </p>
          </div>
        </div>
      ) : (
        /* Receipts proof log tab */
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          <div className="shrink-0 space-y-1">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-[#5DCAA5] uppercase">Receipt Proofs Ledger</h3>
            <p className="text-[9.5px] font-mono text-zinc-500 text-left">
              Double-click or tap any transactional receipt block to unpack and reveal full smart contract calldatas, emitting event logs, and gas estimators.
            </p>
          </div>

          <div className="space-y-2.1 flex-1 pr-1 overflow-y-auto scrollbar-thin">
            {!txLog || txLog.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-white/5 bg-zinc-950/20 my-auto flex flex-col items-center justify-center gap-2 py-16">
                <Activity className="w-5 h-5 text-zinc-650" />
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed max-w-[15rem]">
                  No receipts matching current block sessions. Execute a yield strategy or transfer to mint an immutable block record.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {txLog.map((tx) => {
                  const isDeposit = tx.type === 'deposit';
                  const isSwap = tx.type === 'swap';
                  const iconColor = isDeposit ? 'text-emerald-400' : isSwap ? 'text-indigo-400' : 'text-amber-400';
                  return (
                    <button
                      key={tx.id}
                      onClick={() => onOpenReceiptDetails(tx)}
                      className="w-full text-left bg-zinc-950/40 border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer hover:bg-zinc-950/65 group active:scale-98"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                          <Activity className={`w-3.5 h-3.5 ${iconColor}`} />
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <h4 className="text-[10.5px] font-bold text-zinc-200 truncate pr-1 group-hover:text-white transition-colors">
                            {tx.detail}
                          </h4>
                          <p className="text-[8.5px] font-mono text-zinc-500 flex items-center gap-1.5">
                            <span>{tx.timestamp}</span>
                            <span className="text-zinc-700">•</span>
                            <span className="text-zinc-500 font-medium">{tx.hash.slice(0, 10)}...{tx.hash.slice(-4)}</span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-[#5DCAA5] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-zinc-950/20 border border-white/5 p-3 rounded-2xl space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5DCAA5]" />
              <span>Pre-Audited Rollups</span>
            </div>
            <p className="text-[9.5px] font-mono text-zinc-500 leading-relaxed text-left">
              MetaPilot processes receipts using securely signed transaction envelopes that are logged permanently. Click any item above to analyze.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
