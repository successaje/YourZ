"use client";
import * as React from "react";
import { createCoin, getCoinCreateFromLogs } from "@zoralabs/coins-sdk";
import { Address } from "viem";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { baseSepolia } from "viem/chains";

const CONTRACT_URI = "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy";

export default function SimpleCreateCoinPage() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isDeploying, setIsDeploying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [transactionHash, setTransactionHash] = React.useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = React.useState<string | null>(null);
  const [coinLogAddress, setCoinLogAddress] = React.useState<string | null>(null);

  const handleCreateCoin = async () => {
    if (!address || !walletClient || !publicClient) {
      setError("Wallet not connected");
      return;
    }
    setIsDeploying(true);
    setError(null);
    setStatus("Preparing deployment...");
    setTransactionHash(null);
    setDeployedAddress(null);
    setCoinLogAddress(null);
    try {
      const coinParams = {
        name: "My Awesome Coin",
        symbol: "MAC",
        uri: CONTRACT_URI as any,
        payoutRecipient: address as Address,
        chainId: baseSepolia.id,
        currency: 2, // ETH
      };
      setStatus("Sending transaction...");
      const result = await createCoin(coinParams, walletClient, publicClient);
      setTransactionHash(result.hash);
      setStatus("Transaction sent! Waiting for confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash: result.hash, confirmations: 2 });
      if (receipt.status === "success") {
        setStatus("Deployment successful!");
        if (receipt.contractAddress) {
          setDeployedAddress(receipt.contractAddress);
        }
        // Extract deployed coin address from logs
        const coinDeployment = getCoinCreateFromLogs(receipt);
        if (coinDeployment?.coin) {
          setCoinLogAddress(coinDeployment.coin);
          console.log("Deployed coin address from logs:", coinDeployment.coin);
        }
      } else {
        throw new Error("Transaction reverted");
      }
    } catch (err: any) {
      setError(err.message || "Failed to deploy coin");
      setStatus("Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Simple Zora Coin Creation Test</h1>
      <div className="mb-4">
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">{status || "Ready to deploy"}</p>
          {error && <p className="text-sm text-red-500 mt-1">Error: {error}</p>}
          {transactionHash && (
            <p className="text-sm text-blue-500 mt-1">
              TX: {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
            </p>
          )}
          {deployedAddress && (
            <p className="text-sm text-green-600 mt-1">
              Contract: {deployedAddress.substring(0, 10)}...{deployedAddress.substring(deployedAddress.length - 8)}
            </p>
          )}
          {coinLogAddress && (
            <p className="text-sm text-green-700 mt-1">
              Coin Address (from logs): {coinLogAddress.substring(0, 10)}...{coinLogAddress.substring(coinLogAddress.length - 8)}
            </p>
          )}
        </div>
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={isDeploying || !address}
        onClick={handleCreateCoin}
      >
        {isDeploying ? "Creating..." : "Create Coin"}
      </button>
    </div>
  );
} 