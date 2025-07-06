'use client'

import { useState, useMemo } from 'react';
import { mintZora1155NFT } from '@/utils/zora1155-simple';
import { deployZora1155Contract, deployAnotherZora1155Contract } from '@/utils/zora1155-simple';
import { uploadToIPFS } from '@/lib/ipfs';
import { useAccount, useWriteContract, useWalletClient, usePublicClient, useConfig, useChainId } from 'wagmi';
import { parseEther, type Address, createWalletClient, createPublicClient } from 'viem';
import { toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { waitForTransactionReceipt } from "@wagmi/core";

type MintParams = {
  name: string;
  description: string;
  content: string;
  image: string;
  quantity: number;
  price: string;
  recipient: Address;
  contractAddress: Address;
  attributes: Array<{ trait_type: string; value: string }>;
};

interface TestNFTSuiteProps {
  initialTab?: 'deploy' | 'mint' | 'deployAndMint';
}

// Inner component that requires wallet connection
const ConnectedTestNFTSuite = ({ initialTab = 'deploy' }: TestNFTSuiteProps) => {
  // All hooks at the top level
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  // const { data: walletClient } = useWalletClient();
  const walletClient = useWalletClient();
  const config = useConfig();
  const { writeContractAsync } = useWriteContract();
  
  // Component state
  const [contractAddress, setContractAddress] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'deploy' | 'mint' | 'deployAndMint'>(initialTab);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: `YourZ Test Collection ${Math.floor(Math.random() * 1000)}`,
    description: 'Test collection for YourZ platform',
    content: 'This is a test NFT created on YourZ platform',
    image: 'ipfs://bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
    quantity: 1,
    price: '0.000777',
    royaltyBps: 100, // 1% in basis points
    contractAddress: '', // Added contract address field
    attributes: [] as Array<{ trait_type: string; value: string }>,
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'royaltyBps' ? Number(value) : value
    }));
  };

  const handleCreateContract = async () => {
    if (!address || !publicClient) {
      toast.error('Please connect your wallet and network');
      return;
    }
    setIsLoading(true);
    setStatus('Deploying contract...');
    try {
      const { parameters, contractAddress } = await deployAnotherZora1155Contract({
        name: formData.name,
        description: formData.description,
        image: formData.image,
        publicClient,
        account: address,
        uploadFileToIpfs: uploadToIPFS,
        uploadJsonToIpfs: uploadToIPFS,
      });

      console.log("Sending transaction with parameters:", parameters);
      
      // Use the writeContractAsync function from the hook
      const hash = await writeContractAsync(parameters);
      console.log("Transaction hash:", hash);
      
      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);
      console.log("Hash here: ", hash)

      // Transaction receipt
      // const receipt = await waitForTransactionReceipt(, { hash });
      // console.log('Transaction receipt:', receipt);
      // const explorerLink = `https://sepolia.basescan.org/tx/${receipt.transactionHash}`
      // console.log("Explorer link here: ", explorerLink);
      
      setContractAddress(contractAddress);
      setStatus('Contract deployed!');
      toast.success('Contract deployed!');
      console.log('Contract deployed at:', contractAddress, 'Param:', parameters);
    } catch (error) {
      console.error('Error deploying contract:', error);
      setStatus(`Error: ${error?.message || error}`);
      toast.error(error?.message || 'Failed to deploy contract');
    } finally {
      setIsLoading(false);
    }
  }

  const handleMintNFT = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!publicClient) {
      toast.error('Public client not available');
      return;
    }

    setIsLoading(true);
    setStatus('Preparing NFT metadata...');
    console.log('Starting NFT minting process...');

    try {
      // Create metadata for the NFT
      const metadata = {
        name: formData.name || `Test NFT ${Date.now()}`,
        description: formData.description || 'Test NFT minted from YourZ',
        image: formData.image || 'ipfs://bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
        attributes: [
          {
            trait_type: 'Created By',
            value: 'YourZ Platform'
          },
          {
            trait_type: 'Collection',
            value: formData.name || 'YourZ Collection'
          },
          ...(formData.attributes || [])
        ]
      };

      console.log('Uploading metadata to IPFS...', metadata);
      const metadataHash = await uploadToIPFS(metadata);
      
      console.log('Metadata uploaded to IPFS:', metadataHash);
      setStatus('Minting NFT on blockchain...');

      // Mint using pure utility
      const quantity = formData.quantity || 1;

      if (!contractAddress) {
        throw new Error('Please enter a contract address');
      }

      const { receipt, explorerLink } = await mintZora1155NFT({
        tokenId: BigInt(1),
        quantity,
        minterAccount: address as `0x${string}`,
        publicClient,
        chainId,
        config,
        contractAddress: contractAddress as `0x${string}`,
      });

      setTokenId(BigInt(1).toString());
      setStatus(`NFT minted! Transaction: ${receipt.transactionHash}`);
      toast.success('NFT minted successfully!');
      console.log('NFT minted successfully:', receipt);
      if (explorerLink) {
        setStatus((prev) => prev + ` | ` + explorerLink);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
      console.error('Error minting NFT:', error);
      setStatus('Error minting NFT');
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'deploy':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Address
              </label>
              <input
                type="text"
                name="contractAddress"
                value={formData.contractAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="0x..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Collection Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="My Awesome Collection"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Describe your collection..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Royalty Percentage (e.g., 1 for 1%)
              </label>
              <input
                type="number"
                name="royaltyBps"
                value={formData.royaltyBps / 100}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  royaltyBps: Number(e.target.value) * 100
                }))}
                min="0"
                max="10"
                step="0.1"
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.royaltyBps / 100}% royalty fee
              </p>
            </div>
            
            <button
              onClick={handleCreateContract}
              disabled={isDeploying}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isDeploying ? 'Deploying...' : 'Deploy Contract'}
            </button>
          </div>
        );
        
      case 'mint':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract Address
                </label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="Enter contract address (0x...)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  NFT Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter NFT content..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (ETH)
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleMintNFT}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
              >
                {isLoading ? 'Minting...' : 'Mint NFT'}
              </button>
              {contractAddress && (
                <a 
                  href={`https://sepolia.basescan.org/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  View Contract on Explorer
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        );
        
      case 'deployAndMint':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-700 dark:text-yellow-300">
                This will deploy a new contract and mint an NFT in one transaction.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Collection Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="My Awesome Collection"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Describe your collection..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                NFT Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter NFT content..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (ETH)
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.000777"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Royalty Percentage (e.g., 1 for 1%)
              </label>
              <input
                type="number"
                name="royaltyBps"
                value={formData.royaltyBps / 100}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  royaltyBps: Number(e.target.value) * 100
                }))}
                min="0"
                max="10"
                step="0.1"
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.royaltyBps / 100}% royalty fee
              </p>
            </div>
            
            <button
              disabled
              className="w-full px-4 py-2 bg-green-400 text-white rounded-md opacity-60 cursor-not-allowed"
              title="Combined Deploy & Mint is not implemented"
            >
              Deploy & Mint NFT (Not Available)
            </button>
            
            {contractAddress && tokenId && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md">
                <p className="font-medium">Successfully Deployed & Minted!</p>
                <p className="text-sm mt-1 font-mono break-all">Contract: {contractAddress}</p>
                <p className="text-sm font-mono break-all">Token ID: {tokenId}</p>
                <a 
                  href={`https://sepolia.basescan.org/token/${contractAddress}?a=${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-green-700 dark:text-green-400 hover:underline"
                >
                  View on Base Sepolia Explorer
                </a>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">NFT Contract & Minting Test</h2>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('deploy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deploy'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Deploy Contract
            </button>
            <button
              onClick={() => setActiveTab('mint')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mint'
                  ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Mint NFT
            </button>
            <button
              onClick={() => setActiveTab('deployAndMint')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deployAndMint'
                  ? 'border-green-500 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Deploy & Mint
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
          
          {/* Status */}
          {status && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md">
              <p className="font-medium">Status:</p>
              <p className="mt-1 whitespace-pre-wrap break-words">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component that handles wallet connection
const TestNFTSuite = ({ initialTab = 'deploy' }: TestNFTSuiteProps) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">Please connect your wallet to continue</p>
        <ConnectButton />
      </div>
    );
  }

  return <ConnectedTestNFTSuite initialTab={initialTab} />;
};

export default TestNFTSuite;
