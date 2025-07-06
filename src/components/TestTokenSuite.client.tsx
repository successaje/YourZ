'use client';

import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { deployZoraFT, deployZoraCoin } from '@/utils/zora';

export default function TestTokenSuiteClient() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [ftAddress, setFtAddress] = useState<string | null>(null);
  const [coinAddress, setCoinAddress] = useState<string | null>(null);

  const handleDeployFT = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setStatus('Deploying Zora FT...');
    
    try {
      const tokenAddress = await deployZoraFT({
        name: 'YourZ Test Token',
        symbol: 'YOURZ-TEST',
        initialSupply: parseEther('1000000'),
        description: 'Test fungible token for YourZ platform',
        owner: address,
      });
      
      setFtAddress(tokenAddress);
      setStatus('Zora FT deployed successfully!');
      alert(`Zora FT deployed at: ${tokenAddress}`);
    } catch (error) {
      console.error('Error deploying Zora FT:', error);
      setStatus(`Error: ${error.message}`);
      alert(`Failed to deploy Zora FT: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployCoin = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setStatus('Deploying Zora Coin...');
    
    try {
      // Prepare metadata and upload to IPFS
      const metadata = {
        name: 'YourZ Coin',
        description: 'Main utility token for YourZ platform',
        external_url: typeof window !== 'undefined' ? window.location.origin : '',
        image: 'ipfs://bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q', // Default placeholder image for test
      };
      const { uploadToIPFS } = await import('@/lib/ipfs');
      const metadataHash = await uploadToIPFS(metadata);
      const uri = `ipfs://${metadataHash}`;

      // Deploy the Zora coin with new signature
      const tokenAddress = await deployZoraCoin({
        name: metadata.name,
        symbol: 'YOURZ',
        uri,
        payoutRecipient: address,
        mintFeeRecipient: address,
        walletClient,
        publicClient,
        account: address,
        // Optionally: platformReferrer, chainId, currency, mintFee
      });
      
      setCoinAddress(tokenAddress);
      setStatus('Zora Coin deployed successfully!');
      alert(`Zora Coin deployed at: ${tokenAddress}`);
    } catch (error) {
      console.error('Error deploying Zora Coin:', error);
      setStatus(`Error: ${error.message}`);
      alert(`Failed to deploy Zora Coin: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Zora Token Deployment</h2>
      
      <div className="space-y-6">
        {/* Zora FT Section */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Zora Fungible Token (FT)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Deploy a new ERC20-compatible fungible token on Zora Network.
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleDeployFT}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deploying...' : 'Deploy Zora FT'}
            </button>
            {ftAddress && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                <p className="font-medium">FT Deployed:</p>
                <p className="font-mono break-all text-xs">{ftAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Zora Coin Section */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Zora Coin</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Deploy a new Zora Coin (ERC20 with additional Zora-specific features).
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleDeployCoin}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deploying...' : 'Deploy Zora Coin'}
            </button>
            {coinAddress && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                <p className="font-medium">Coin Deployed:</p>
                <p className="font-mono break-all text-xs">{coinAddress}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {status && (
        <div className="mt-4 p-3 text-sm rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
          {status}
        </div>
      )}
    </div>
  );
}
