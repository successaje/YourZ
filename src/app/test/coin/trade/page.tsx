"use client";
import * as React from "react";
import { tradeCoin, TradeParameters } from "@zoralabs/coins-sdk";
import { Address, parseEther } from "viem";
import { useAccount, useWalletClient, usePublicClient, useChainId } from "wagmi";
import { base } from "viem/chains";

export default function TradeCoinTestPage() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const [coinAddress, setCoinAddress] = React.useState("");
  const [direction, setDirection] = React.useState<"buy" | "sell">("buy");
  const [amount, setAmount] = React.useState("");
  const [isTrading, setIsTrading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [transactionHash, setTransactionHash] = React.useState<string | null>(null);
  const [tradeEvent, setTradeEvent] = React.useState<any>(null);

  const isBaseMainnet = chainId === base.id;

  const handleTrade = async () => {
    setError(null);
    setStatus(null);
    setTransactionHash(null);
    setTradeEvent(null);
    if (!address || !walletClient || !publicClient) {
      setError("Wallet not connected");
      return;
    }
    if (!coinAddress || !amount) {
      setError("Please enter a coin address and amount");
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
            buy: { type: "erc20", address: coinAddress as Address },
            amountIn: parseEther(amount),
            slippage: 0.05,
            sender: address as Address,
          }
        : {
            sell: { type: "erc20", address: coinAddress as Address },
            buy: { type: "eth" },
            amountIn: parseEther(amount),
            slippage: 0.05,
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Zora Coin Trading Test (Base Mainnet Only)</h1>
      {!isBaseMainnet && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Base Mainnet Required</h3>
          <p className="text-sm text-yellow-700">
            Trading is only supported on Base mainnet (chainId 8453). Please switch your wallet network to Base mainnet to enable trading.
          </p>
        </div>
      )}
      <div className="mb-4 flex flex-col gap-2 max-w-md">
        <label className="font-medium">Coin Contract Address</label>
        <input
          className="border px-2 py-1 rounded"
          type="text"
          value={coinAddress}
          onChange={e => setCoinAddress(e.target.value)}
          placeholder="0x..."
        />
        <label className="font-medium mt-2">Direction</label>
        <select
          className="border px-2 py-1 rounded"
          value={direction}
          onChange={e => setDirection(e.target.value as "buy" | "sell")}
        >
          <option value="buy">Buy (ETH → Coin)</option>
          <option value="sell">Sell (Coin → ETH)</option>
        </select>
        <label className="font-medium mt-2">Amount {direction === "buy" ? "(ETH to spend)" : "(Coin to sell)"}</label>
        <input
          className="border px-2 py-1 rounded"
          type="number"
          min="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder={direction === "buy" ? "ETH amount" : "Coin amount"}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={isTrading || !address || !isBaseMainnet}
          onClick={handleTrade}
        >
          {isTrading ? (direction === "buy" ? "Buying..." : "Selling...") : (direction === "buy" ? "Buy Coin" : "Sell Coin")}
        </button>
      </div>
      <div className="mb-4">
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">{status || "Ready to trade"}</p>
          {error && <p className="text-sm text-red-500 mt-1">Error: {error}</p>}
          {transactionHash && (
            <p className="text-sm text-blue-500 mt-1">
              TX: {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
            </p>
          )}
          {tradeEvent && (
            <pre className="text-xs text-green-700 mt-2 bg-green-50 p-2 rounded overflow-x-auto">
              {JSON.stringify(tradeEvent, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
} 