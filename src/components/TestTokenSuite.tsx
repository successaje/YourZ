import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { deployZoraFT, deployZoraCoin } from '@/utils/zora';

export default function TestTokenSuite() {
  const { address, isConnected } = useAccount();
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
        initialSupply: parseEther('1000000'), // 1M tokens with 18 decimals
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
      const tokenAddress = await deployZoraCoin({
        name: 'YourZ Coin',
        symbol: 'YOURZ',
        initialSupply: parseEther('1000000'), // 1M tokens with 18 decimals
        description: 'Main utility token for YourZ platform',
        admin: address,
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
            Deploy a new Zora Coin (fixed supply token) on Zora Network.
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

        {/* Status */}
        {status && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
            <p className="font-medium">Status:</p>
            <p className="break-all">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
