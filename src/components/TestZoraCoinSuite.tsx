'use client'

import * as React from 'react';
import { parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { createCoin, DeployCurrency } from '@zoralabs/coins-sdk';
import { useAccount, useChainId, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Contract URI - points to the metadata
const CONTRACT_URI = 'ipfs://bafkreih2ac5yabo2daerkw5w5wcwdc7rveqejf4l645hx2sz26r6fxfn5u';

// Mint fee in ETH (0.000777 ETH)
const MINT_FEE = '0.000777';

// Mint fee recipient (your address)
const MINT_FEE_RECIPIENT = '0x60eF148485C2a5119fa52CA13c52E9fd98F28e87' as const;

// Zora Coin Factory addresses by chain ID
const ZORA_COIN_FACTORY_ADDRESSES: Record<number, `0x${string}`> = {
  // Base Sepolia - Zora Coin Factory
  84532: '0x2d2d4bB7285F4eB4b1C4FE111CDfB1836De0e6c6',
  // Add other chain IDs as needed
};

// Get the Zora contract address for the current chain
function useZoraContractAddress() {
  const chainId = useChainId();
  if (!chainId) return null;
  return ZORA_COIN_FACTORY_ADDRESSES[chainId] || null;
}

export default function TestZoraCoinSuite() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const zoraContractAddress = useZoraContractAddress();
  
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState('Ready to deploy');
  const [transactionHash, setTransactionHash] = React.useState<`0x${string}` | null>(null);
  const [deployedAddress, setDeployedAddress] = React.useState<`0x${string}` | null>(null);

  const deployCoin = async () => {
    if (!address || !walletClient || !publicClient || !zoraContractAddress) {
      setError('Wallet not connected or invalid network');
      return;
    }

    try {
      setIsDeploying(true);
      setError(null);
      setStatus('Preparing deployment...');

      // Prepare coin parameters
      const coinParams = {
        name: 'YourZ Test Coin',
        symbol: 'YOURZ',
        uri: CONTRACT_URI,
        payoutRecipient: address as `0x${string}`,
        platformReferrer: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        chainId: baseSepolia.id,
        currency: DeployCurrency.ETH,
        mintFee: MINT_FEE,
        mintFeeRecipient: MINT_FEE_RECIPIENT as `0x${string}`,
      };

      setStatus('Sending transaction...');
      
      // Create the coin using Zora SDK
      const result = await createCoin(coinParams, walletClient, publicClient);
      
      setTransactionHash(result.hash);
      setStatus('Transaction sent! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: result.hash,
        confirmations: 2,
      });
      
      if (receipt.status === 'success') {
        setStatus('Deployment successful!');
        if (receipt.contractAddress) {
          setDeployedAddress(receipt.contractAddress);
        }
        console.log('Deployment receipt:', receipt);
      } else {
        throw new Error('Transaction reverted');
      }
    } catch (err) {
      console.error('Error deploying coin:', err);
      setError(err instanceof Error ? err.message : 'Failed to deploy coin');
      setStatus('Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  // Log state changes for debugging
  React.useEffect(() => {
    console.log('State update:', {
      address,
      zoraContractAddress,
      isDeploying,
      error,
      status,
      transactionHash,
      deployedAddress
    });
  }, [address, zoraContractAddress, isDeploying, error, status, transactionHash, deployedAddress]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Zora Coin Deployment</h2>
      
      {!address ? (
        <div className="mb-4">
          <ConnectButton />
        </div>
      ) : (
        <>
          <div className="w-full max-w-md mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Network Status</h3>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${zoraContractAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{zoraContractAddress ? 'Connected to Base Sepolia' : 'Unsupported Network'}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Deployment Status</h3>
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-700">{status}</p>
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
              </div>
            </div>
          </div>

          <button
            onClick={deployCoin}
            disabled={isDeploying || !zoraContractAddress}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isDeploying || !zoraContractAddress
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Zora Coin'}
          </button>
        </>
      )}
    </div>
  );
}
