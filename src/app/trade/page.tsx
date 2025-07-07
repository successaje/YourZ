"use client";
import * as React from "react";
import { tradeCoin, TradeParameters } from "@zoralabs/coins-sdk";
import { Address, parseEther } from "viem";
import { useAccount, useWalletClient, usePublicClient, useChainId } from "wagmi";
import { base } from "viem/chains";
import { useTheme } from 'next-themes';
import { usePostCoins, PostCoin } from '@/hooks/usePostCoins';
import Link from 'next/link';

// Base tokens (ETH, USDC, etc.)
const BASE_TOKENS = [
  {
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000", // Native ETH
    decimals: 18,
    name: "Ethereum",
  },
  {
    symbol: "USDC",
    address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // Replace with real USDC address
    decimals: 6,
    name: "USD Coin",
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
  selectedCoin?: PostCoin;
}

const EnhancedCandleChart: React.FC<EnhancedCandleChartProps> = ({ darkMode, selectedCoin }) => {
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

const SwapPanel = ({ coins, selectedCoin }: { coins: PostCoin[]; selectedCoin?: PostCoin }) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  // Combine base tokens with post coins
  const allTokens = [
    ...BASE_TOKENS,
    ...coins.map(coin => ({
      symbol: coin.symbol,
      address: coin.contract_address,
      decimals: 18,
      name: coin.name,
      isPostCoin: true,
      coin
    }))
  ];

  // Find the token that matches the selected coin
  const getInitialToken = () => {
    if (selectedCoin) {
      const matchingToken = allTokens.find(token => 
        token.address.toLowerCase() === selectedCoin.contract_address.toLowerCase()
      );
      if (matchingToken) return matchingToken;
    }
    return allTokens[2] || allTokens[0]; // Default to first post coin or first token
  };

  const [selectedToken, setSelectedToken] = React.useState(getInitialToken());
  const [direction, setDirection] = React.useState<"buy" | "sell">("buy");
  const [fromAmount, setFromAmount] = React.useState("");
  const [toAmount, setToAmount] = React.useState("");
  const [slippage, setSlippage] = React.useState(0.5);
  const [isTrading, setIsTrading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);

  const isBaseMainnet = chainId === base.id;

  // Update selected token when selectedCoin changes
  React.useEffect(() => {
    const newToken = getInitialToken();
    setSelectedToken(newToken);
  }, [selectedCoin, coins]);

  const handleTrade = async () => {
    if (!address || !walletClient || !publicClient || !selectedToken) {
      setError("Please connect your wallet and select a token");
      return;
    }

    if (!fromAmount || !toAmount) {
      setError("Please enter amounts");
      return;
    }

    setIsTrading(true);
    setError(null);
    setStatus("Preparing trade...");

    try {
      // This is a placeholder for actual trading logic
      // In a real implementation, you would integrate with the Zora Coins SDK
      setStatus("Trade executed successfully!");
      
      // Reset form
      setFromAmount("");
      setToAmount("");
    } catch (err) {
      console.error("Trade error:", err);
      setError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setIsTrading(false);
      setStatus(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col gap-4 w-full border border-gray-100 dark:border-gray-800">
      <h3 className="font-bold text-lg mb-2">Swap</h3>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setDirection("buy")} className={`px-4 py-1.5 rounded-t-lg font-semibold ${direction === "buy" ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>Buy</button>
        <button onClick={() => setDirection("sell")} className={`px-4 py-1.5 rounded-t-lg font-semibold ${direction === "sell" ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>Sell</button>
      </div>
      <div className="flex flex-col gap-2">
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder={direction === "buy" ? "ETH amount" : "Token amount"}
          value={fromAmount}
          onChange={e => setFromAmount(e.target.value)}
        />
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder={direction === "buy" ? "Token amount" : "ETH amount"}
          value={toAmount}
          onChange={e => setToAmount(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Token:</span>
          <select
            className="select select-bordered select-sm w-full"
            value={selectedToken.symbol}
            onChange={e => setSelectedToken(allTokens.find(t => t.symbol === e.target.value) || allTokens[0])}
          >
            {allTokens.map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol} {t.isPostCoin ? `(${t.coin.post?.title || 'Unknown Post'})` : ''}
              </option>
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

const LiquidityPanel = ({ selectedCoin }: { selectedCoin?: PostCoin }) => {
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
          <input type="number" className="input input-bordered w-full" placeholder={`${selectedCoin?.symbol || 'Post Coin'} amount`} />
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

const ActivityFeed = ({ coins }: { coins: PostCoin[] }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col gap-4 w-full border border-gray-100 dark:border-gray-800">
    <h3 className="font-bold text-lg mb-2">Available Coins</h3>
    <div className="space-y-3">
      {coins.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No coins available</p>
          <p className="text-xs mt-1">Create a post with a coin to start trading!</p>
        </div>
      ) : (
        coins.map((coin) => (
          <Link 
            key={coin.id} 
            href={`/post/${coin.post_id}`}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">{coin.symbol}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{coin.name}</span>
              </div>
              {coin.post && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Post: {coin.post.title}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {coin.total_supply.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Supply
              </div>
            </div>
          </Link>
        ))
      )}
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
  const { coins, isLoading, error } = usePostCoins();
  const [selectedCoin, setSelectedCoin] = React.useState<PostCoin | undefined>();

  // Get coin from URL params
  const [searchParams] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return {
        coinAddress: params.get('coin'),
        coinSymbol: params.get('symbol')
      };
    }
    return { coinAddress: null, coinSymbol: null };
  });

  // Set the selected coin based on URL params or default to first coin
  React.useEffect(() => {
    if (coins.length > 0) {
      let coinToSelect: PostCoin | undefined;
      
      // Try to find coin by contract address first
      if (searchParams.coinAddress) {
        coinToSelect = coins.find(coin => 
          coin.contract_address.toLowerCase() === searchParams.coinAddress?.toLowerCase()
        );
      }
      
      // If not found by address, try by symbol
      if (!coinToSelect && searchParams.coinSymbol) {
        coinToSelect = coins.find(coin => 
          coin.symbol.toLowerCase() === searchParams.coinSymbol?.toLowerCase()
        );
      }
      
      // If still not found, use first coin
      if (!coinToSelect) {
        coinToSelect = coins[0];
      }
      
      setSelectedCoin(coinToSelect);
    }
  }, [coins, searchParams.coinAddress, searchParams.coinSymbol]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 pl-2 pr-2 sm:pl-6 sm:pr-2 lg:pl-8 lg:pr-2">
        <div className="w-full max-w-[1600px] flex flex-col gap-10">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading coins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 pl-2 pr-2 sm:pl-6 sm:pr-2 lg:pl-8 lg:pr-2">
        <div className="w-full max-w-[1600px] flex flex-col gap-10">
          <div className="text-center py-20">
            <p className="text-red-500">Error loading coins: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 pl-2 pr-2 sm:pl-6 sm:pr-2 lg:pl-8 lg:pr-2">
      <div className="w-full max-w-[1600px] flex flex-col gap-10">
        {/* Price Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 items-start">
          {/* Chart + Stats */}
          <div className="flex flex-col gap-4 w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedCoin ? `${selectedCoin.symbol} / ETH` : 'Post Coin / ETH'}
            </h1>
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
                <EnhancedCandleChart darkMode={darkMode} selectedCoin={selectedCoin} />
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
            <SwapPanel coins={coins} selectedCoin={selectedCoin} />
            <LiquidityPanel selectedCoin={selectedCoin} />
          </div>
        </div>
        {/* Main Grid: Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          <div />
          <div className="flex flex-col gap-8 min-w-0 md:min-w-[320px]">
            <ActivityFeed coins={coins} />
          </div>
        </div>
      </div>
      <NotificationFeed />
    </div>
  );
} 