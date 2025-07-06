"use client";
import * as React from "react";
import { tradeCoin, TradeParameters } from "@zoralabs/coins-sdk";
import { Address, parseEther } from "viem";
import { useAccount, useWalletClient, usePublicClient, useChainId } from "wagmi";
import { base } from "viem/chains";
import { useTheme } from 'next-themes';

// Mock token list (replace with real data if available)
const TOKENS = [
  {
    symbol: "ZORA",
    address: "0x0000000000000000000000000000000000000000", // Replace with real ZORA address
    decimals: 18,
    name: "Zora Token",
  },
  {
    symbol: "USDC",
    address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // Replace with real USDC address
    decimals: 6,
    name: "USD Coin",
  },
  {
    symbol: "YOURZ",
    address: "0x1234567890abcdef1234567890abcdef12345678", // Example creator coin
    decimals: 18,
    name: "YourZ Creator Coin",
  },
];

// --- Enhanced Mock Candlestick Chart with Scroll ---
const ENHANCED_MOCK_CANDLES = Array.from({ length: 40 }, (_, i) => {
  // Simulate price movement
  const base = 1.2 + 0.01 * i + Math.sin(i / 3) * 0.05;
  const open = +(base + (Math.random() - 0.5) * 0.04).toFixed(3);
  const close = +(open + (Math.random() - 0.5) * 0.06).toFixed(3);
  const high = +(Math.max(open, close) + Math.random() * 0.03).toFixed(3);
  const low = +(Math.min(open, close) - Math.random() * 0.03).toFixed(3);
  return { open, close, high, low };
});

interface EnhancedCandleChartProps {
  darkMode: boolean;
}

const EnhancedCandleChart: React.FC<EnhancedCandleChartProps> = ({ darkMode }) => {
  // Chart dimensions
  const visibleCandles = 28;
  const candleWidth = 20;
  const gap = 12;
  const chartHeight = 540;
  const chartWidth = visibleCandles * (candleWidth + gap) + 56;
  const padding = 44;
  const [scroll, setScroll] = React.useState(0); // index of first visible candle
  const max = Math.max(...ENHANCED_MOCK_CANDLES.map(c => c.high));
  const min = Math.min(...ENHANCED_MOCK_CANDLES.map(c => c.low));
  const y = (val: number) => padding + ((max - val) / (max - min)) * (chartHeight - 2 * padding);

  // Use bg-inherit and fill='inherit' for SVG background
  const grid = darkMode ? '#27272a' : '#e5e7eb';
  const axis = darkMode ? '#a1a1aa' : '#6b7280';

  // Handle scroll (left/right)
  const canScrollLeft = scroll > 0;
  const canScrollRight = scroll + visibleCandles < ENHANCED_MOCK_CANDLES.length;
  const handleScroll = (dir: 'left' | 'right') => {
    setScroll(s => {
      if (dir === 'left') return Math.max(0, s - 6);
      if (dir === 'right') return Math.min(ENHANCED_MOCK_CANDLES.length - visibleCandles, s + 6);
      return s;
    });
  };

  return (
    <div
      className="relative w-full rounded-xl shadow-inner border overflow-x-auto transition-colors duration-300 bg-gray-50 dark:bg-[#18181b] bg-inherit"
      style={{ borderColor: grid }}
    >
      {/* Scroll buttons */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-1 shadow transition disabled:opacity-30"
        onClick={() => handleScroll('left')}
        disabled={!canScrollLeft}
        style={{ display: canScrollLeft ? 'block' : 'none' }}
        aria-label="Scroll left"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 16l-5-6 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-1 shadow transition disabled:opacity-30"
        onClick={() => handleScroll('right')}
        disabled={!canScrollRight}
        style={{ display: canScrollRight ? 'block' : 'none' }}
        aria-label="Scroll right"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M7 4l5 6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 bg-inherit">
        <svg width={chartWidth} height={chartHeight} className="block select-none bg-inherit">
          {/* Chart background */}
          <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="inherit" />
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line
                x1={padding}
                x2={chartWidth - padding}
                y1={padding + t * (chartHeight - 2 * padding)}
                y2={padding + t * (chartHeight - 2 * padding)}
                stroke={grid}
                strokeDasharray="4 2"
              />
              <text
                x={10}
                y={padding + t * (chartHeight - 2 * padding) + 4}
                fontSize={15}
                fill={axis}
              >
                {(max - t * (max - min)).toFixed(2)}
              </text>
            </g>
          ))}
          {/* Candles */}
          {ENHANCED_MOCK_CANDLES.slice(scroll, scroll + visibleCandles).map((c, i) => {
            const x = padding + i * (candleWidth + gap);
            const color = c.close >= c.open ? '#22c55e' : '#ef4444';
            const shadowColor = c.close >= c.open ? '#14532d' : '#7f1d1d';
            return (
              <g key={i} className="group cursor-pointer">
                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  x2={x + candleWidth / 2}
                  y1={y(c.high)}
                  y2={y(c.low)}
                  stroke={shadowColor}
                  strokeWidth={3}
                  opacity={0.5}
                />
                <line
                  x1={x + candleWidth / 2}
                  x2={x + candleWidth / 2}
                  y1={y(c.high)}
                  y2={y(c.low)}
                  stroke={color}
                  strokeWidth={2}
                />
                {/* Body */}
                <rect
                  x={x}
                  y={y(Math.max(c.open, c.close))}
                  width={candleWidth}
                  height={Math.max(4, Math.abs(y(c.open) - y(c.close)))}
                  fill={color}
                  rx={3}
                  className="transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-black/30"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}
                />
              </g>
            );
          })}
          {/* X-axis labels (every 4th candle) */}
          {ENHANCED_MOCK_CANDLES.slice(scroll, scroll + visibleCandles).map((_, i) => (
            i % 4 === 0 ? (
              <text
                key={i}
                x={padding + i * (candleWidth + gap) + candleWidth / 2}
                y={chartHeight - padding + 22}
                fontSize={14}
                fill={axis}
                textAnchor="middle"
              >
                {`T-${ENHANCED_MOCK_CANDLES.length - (scroll + i)}`}
              </text>
            ) : null
          ))}
        </svg>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3 min-w-[90px] border border-gray-100 dark:border-gray-800 shadow-sm">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
  </div>
);

const SwapPanel = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const [selectedToken, setSelectedToken] = React.useState(TOKENS[2]); // Default to YOURZ
  const [direction, setDirection] = React.useState<"buy" | "sell">("buy");
  const [fromAmount, setFromAmount] = React.useState("");
  const [toAmount, setToAmount] = React.useState("");
  const [slippage, setSlippage] = React.useState(0.5);
  const [isTrading, setIsTrading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [transactionHash, setTransactionHash] = React.useState<string | null>(null);
  const [tradeEvent, setTradeEvent] = React.useState<any>(null);

  const isBaseMainnet = chainId === base.id;

  // TODO: Fetch real balances if available
  const mockBalance = selectedToken.symbol === "USDC" ? "1000" : "5";

  // For demo, auto-calculate toAmount as 1:1 (replace with real quote logic)
  React.useEffect(() => {
    setToAmount(fromAmount);
  }, [fromAmount]);

  const handleTrade = async () => {
    setError(null);
    setStatus(null);
    setTransactionHash(null);
    setTradeEvent(null);
    if (!address || !walletClient || !publicClient) {
      setError("Wallet not connected");
      return;
    }
    if (!fromAmount) {
      setError("Please enter an amount");
      return;
    }
    if (!isBaseMainnet) {
      setError("You must be connected to Base mainnet to trade.");
      return;
    }
    setIsTrading(true);
    try {
      setStatus("Preparing trade transaction...");
      const isBuy = direction === "buy";
      const tradeParameters: TradeParameters = isBuy
        ? {
            sell: { type: "eth" },
            buy: { type: "erc20", address: selectedToken.address as Address },
            amountIn: parseEther(fromAmount),
            slippage: slippage / 100,
            sender: address as Address,
          }
        : {
            sell: { type: "erc20", address: selectedToken.address as Address },
            buy: { type: "eth" },
            amountIn: parseEther(fromAmount),
            slippage: slippage / 100,
            sender: address as Address,
          };
      setStatus("Sending trade transaction...");
      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account: address as Address,
        publicClient,
      });
      setTransactionHash(receipt.hash);
      setStatus("Transaction sent! Waiting for confirmation...");
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: receipt.hash, confirmations: 2 });
      if (txReceipt.status === "success") {
        setStatus("Trade successful!");
        setTradeEvent({ txReceipt, direction });
      } else {
        throw new Error("Transaction reverted");
      }
    } catch (err: any) {
      setError(err.message || "Failed to trade coin");
      setStatus("Trade failed");
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto flex flex-col gap-5 border border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-bold mb-2 text-center">Swap</h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 w-16">From</label>
          <input
            type="number"
            value={fromAmount}
            onChange={e => setFromAmount(e.target.value)}
            className="input input-bordered w-full"
            placeholder="0.0"
          />
          <span className="ml-2 text-xs text-gray-500">ETH</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 w-16">To</label>
          <input
            type="number"
            value={toAmount}
            disabled
            className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            placeholder="0.0"
          />
          <select
            className="ml-2 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
            value={selectedToken.symbol}
            onChange={e => setSelectedToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[2])}
          >
            {TOKENS.map(t => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span className="text-xs text-gray-500">Slippage:</span>
        {[0.5, 1, 3].map(val => (
          <button
            key={val}
            className={`px-2 py-1 rounded border ${slippage === val ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700'}`}
            onClick={() => setSlippage(val)}
            type="button"
          >
            {val}%
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span>Price Impact:</span>
        <span className="text-orange-500">-0.12%</span>
      </div>
      {error && <div className="text-red-500 text-xs text-center">{error}</div>}
      {status && <div className="text-xs text-center text-gray-500 dark:text-gray-400">{status}</div>}
      <button
        className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition"
        disabled={isTrading || !address || !isBaseMainnet}
        onClick={handleTrade}
      >
        {isTrading ? "Swapping..." : "Swap (Est. 0.002 ETH gas)"}
      </button>
    </div>
  );
};

const LiquidityPanel = () => {
  const [tab, setTab] = React.useState<'add' | 'remove'>('add');
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col gap-4 w-full border border-gray-100 dark:border-gray-800">
      <div className="flex gap-2 mb-2">
        <button onClick={() => setTab('add')} className={`px-4 py-1.5 rounded-t-lg font-semibold ${tab === 'add' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>Add Liquidity</button>
        <button onClick={() => setTab('remove')} className={`px-4 py-1.5 rounded-t-lg font-semibold ${tab === 'remove' ? 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>Remove Liquidity</button>
      </div>
      {tab === 'add' ? (
        <div className="flex flex-col gap-2">
          <input type="number" className="input input-bordered w-full" placeholder="ETH amount" />
          <input type="number" className="input input-bordered w-full" placeholder="Post Coin amount" />
          <button className="mt-2 w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg">Add Liquidity</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input type="number" className="input input-bordered w-full" placeholder="LP tokens to remove" />
          <button className="mt-2 w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg">Remove Liquidity</button>
        </div>
      )}
      <div className="flex items-center justify-between mt-4 text-xs">
        <span>LP Balance: <span className="font-bold text-gray-900 dark:text-white">123.45</span></span>
        <span>Earned Fees: <span className="font-bold text-green-600 dark:text-green-400">0.012 ETH</span></span>
      </div>
    </div>
  );
};

const ActivityFeed = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col gap-4 w-full border border-gray-100 dark:border-gray-800">
    <h3 className="font-bold text-lg mb-2">Activity Feed</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Trade</span>
        <span>+100 Post Coin</span>
        <span className="text-green-600">0.01 ETH</span>
        <span className="text-gray-400">2m ago</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Liquidity Add</span>
        <span>+50 LP</span>
        <span className="text-blue-600">0.005 ETH</span>
        <span className="text-gray-400">10m ago</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Trade</span>
        <span>-20 Post Coin</span>
        <span className="text-red-600">-0.002 ETH</span>
        <span className="text-gray-400">1h ago</span>
      </div>
    </div>
  </div>
);

// --- NotificationFeed ---
const MOCK_USERS = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];
const MOCK_ACTIONS = [
  (user: string, amt: number) => `${user} bought ${amt} Post Coin`,
  (user: string, amt: number) => `${user} sold ${amt} Post Coin`,
  (user: string, amt: number) => `${user} added ${amt} LP tokens`,
  (user: string, amt: number) => `${user} removed ${amt} LP tokens`,
];

function getRandomNotification() {
  const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
  const amt = Math.floor(Math.random() * 100) + 1;
  const action = MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)];
  return action(user, amt);
}

const NotificationFeed: React.FC = () => {
  const [notifications, setNotifications] = React.useState<string[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => {
        const next = [...prev, getRandomNotification()];
        // Only keep the last 3
        return next.slice(-3);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Remove notification after 3.5s
  React.useEffect(() => {
    if (notifications.length === 0) return;
    const timeout = setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 3500);
    return () => clearTimeout(timeout);
  }, [notifications]);

  return (
    <div className="fixed z-50 bottom-4 right-4 flex flex-col gap-2 items-end sm:right-4 sm:bottom-4 w-full sm:w-auto px-2 sm:px-0 pointer-events-none">
      {notifications.map((msg, i) => (
        <div
          key={msg + i}
          className="animate-fadeIn bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 mb-1 pointer-events-auto transition-all duration-300"
          style={{
            opacity: 1 - (notifications.length - 1 - i) * 0.3,
            transform: `translateY(-${(notifications.length - 1 - i) * 10}px)`
          }}
        >
          {msg}
        </div>
      ))}
    </div>
  );
};

export default function TradePage() {
  // Use next-themes for reliable theme detection
  const { resolvedTheme } = useTheme();
  const darkMode = resolvedTheme === 'dark';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 pl-2 pr-2 sm:pl-6 sm:pr-2 lg:pl-8 lg:pr-2">
      <div className="w-full max-w-[1600px] flex flex-col gap-10">
        {/* Price Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 items-start">
          {/* Chart + Stats */}
          <div className="flex flex-col gap-4 w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Coin / ETH</h1>
            <div
              className="rounded-2xl shadow-lg p-4 md:p-6 flex flex-col transition-colors duration-300 w-full min-h-[560px] bg-gray-50 dark:bg-[#18181b]"
              style={{
                border: `1.5px solid ${darkMode ? '#27272a' : '#e5e7eb'}`,
                boxShadow: darkMode
                  ? '0 4px 32px 0 rgba(0,0,0,0.45), 0 1.5px 0 0 #27272a'
                  : '0 4px 32px 0 rgba(0,0,0,0.08), 0 1.5px 0 0 #e5e7eb',
              }}
            >
              <div className="flex-1 flex w-full">
                <EnhancedCandleChart darkMode={darkMode} />
              </div>
              <div className="flex flex-row gap-2 md:gap-4 items-center justify-center md:justify-start flex-wrap mt-4">
                <StatCard label="24h Volume" value="12.3 ETH" />
                <StatCard label="Liquidity" value="45.6 ETH" />
                <StatCard label="Holders" value="123" />
                <StatCard label="Royalty" value="2%" />
              </div>
            </div>
          </div>
          {/* Swap Panel */}
          <div className="flex flex-col gap-8">
            <SwapPanel />
            <LiquidityPanel />
          </div>
        </div>
        {/* Main Grid: Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          <div />
          <div className="flex flex-col gap-8 min-w-0 md:min-w-[320px]">
            <ActivityFeed />
          </div>
        </div>
      </div>
      <NotificationFeed />
    </div>
  );
} 