import { 
  createPublicClient, 
  http, 
  getContractAddress, 
  parseEther,
  parseGwei,
  type Address, 
  type PublicClient as ViemPublicClient, 
  type WalletClient, 
  createWalletClient, 
  custom, 
  Chain,
  Hex 
} from 'viem';
import { waitForTransactionReceipt, writeContract} from "@wagmi/core"
import { create1155, createCreatorClient, createNew1155Token } from '@zoralabs/protocol-sdk';
import { createCoinCall, DeployCurrency } from "@zoralabs/coins-sdk";
import { createCoin } from '@zoralabs/coins-sdk';
import { base } from "viem/chains";
import { uploadToIPFS } from './ipfs';

// Base Sepolia chain configuration
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Base Sepolia chain configuration
export const baseSepoliaConfig = {
  id: BASE_SEPOLIA_CHAIN_ID,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
      webSocket: ['wss://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
      webSocket: ['wss://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
  // Add EIP-3085 and EIP-3326 for better wallet compatibility
  rpcUrl: 'https://sepolia.base.org',
  chainId: BASE_SEPOLIA_CHAIN_ID,
};

// Use the enhanced configuration
const baseSepoliaChain = baseSepoliaConfig;

// Define an extended ABI for the Zora 1155 contract
const ZORA_1155_ABI = [
  // Mint function
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // Contract metadata
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Token metadata
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  'function balanceOf(address, uint256) view returns (uint256)',
  'function safeTransferFrom(address, address, uint256, uint256, bytes calldata)',
  'function isApprovedForAll(address, address) view returns (bool)',
  'function setApprovalForAll(address, bool)',
] as const;

// Define types for Zora contract creation
export interface ZoraCreateContractParams {
  name: string;
  symbol: string;
  defaultAdmin: Address;
  contractURI: string;
  defaultRoyaltyRecipient: Address;
  defaultRoyaltyBps: bigint;
  createReferral: Address;
}

export interface Create1155ContractParams {
  name: string; // Contract name
  description?: string; // Contract description
  symbol?: string; // Contract symbol
  royaltyBps?: number; // Royalty basis points (e.g., 100 = 1%)
  royaltyRecipient?: `0x${string}`; // Royalty recipient address
}

export interface MintResult {
  success: boolean;
  transactionHash?: string;
  tokenId?: string;
  contractAddress?: string;
  tokenMetadataURI?: string;
  error?: string;
  details?: any;
  receipt?: any; // Transaction receipt from the blockchain
}

export interface MintNFTParams {
  name: string; // NFT name
  description: string; // NFT description
  content: string; // Main content of the NFT
  image?: string; // Optional image URL
  quantity?: number; // Number of tokens to mint (default: 1)
  price?: string; // Price per token in ETH (default: 0.000777 ETH)
  recipient?: `0x${string}`; // Optional recipient address (defaults to connected wallet)
  contractAddress?: `0x${string}`; // Optional contract address (uses deployed contract if not provided)
  attributes?: Array<{ trait_type: string; value: string }>; // Optional NFT attributes
  tokenURI?: string; // Optional token URI (if metadata is already uploaded)
}

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Cache for the deployed contract addresses
let deployedContractAddress: `0x${string}` | null = null;
let deployedFTAddress: `0x${string}` | null = null;
let deployedCoinAddress: `0x${string}` | null = null;

// Types for Zora FT and Coin
export interface TokenBaseParams {
  name: string;
  symbol: string;
  initialSupply?: bigint;
  owner?: `0x${string}`;
  description?: string;
}

export interface CreateFTParams extends TokenBaseParams {
  initialSupply: bigint;
  decimals?: number;
  minter?: `0x${string}`;
}

export interface CreateZoraCoinParams extends TokenBaseParams {
  initialSupply: bigint;
  decimals?: number;
  admin?: `0x${string}`;
}

// Type definition for the token cache
export interface TokenCache {
  [contractAddress: string]: {
    [tokenId: string]: {
      tokenId: string;
      tokenURI: string;
      metadata: {
        name: string;
        description: string;
        image: string;
      };
    };
  };
}

// Initialize cache object
const cache: TokenCache = {};

/**
 * Get the token cache for debugging purposes
 * @returns The token cache object
 */
export const getTokenCache = () => cache;

// Export the Base Sepolia config
export const baseSepolia = baseSepoliaConfig;

interface Create1155Options {
  name: string;
  symbol: string;
  contractURI: string;
  tokenMetadataURI: string;
  royaltyBps: number;
  royaltyRecipient: `0x${string}`;
  account: `0x${string}`;
  publicClient: ViemPublicClient;
  walletClient: WalletClient;
}

interface Create1155Result {
  contractAddress: `0x${string}`;
  prepareMint: (params: {
    quantityToMint: bigint;
    minterAccount: `0x${string}`;
  }) => Promise<{ parameters: any }>;
}

async function create1155WithSDK({
  name,
  symbol,
  contractURI,
  tokenMetadataURI,
  royaltyBps,
  royaltyRecipient,
  account,
  publicClient,
  walletClient,
}: Create1155Options): Promise<Create1155Result> {
  try {
    // 1. Create a properly formatted chain configuration for Zora SDK
    const zoraChainConfig = {
      id: baseSepoliaConfig.id,
      name: baseSepoliaConfig.network,
      network: baseSepoliaConfig.network,
      nativeCurrency: baseSepoliaConfig.nativeCurrency,
      rpcUrls: {
        default: baseSepoliaConfig.rpcUrls.default,
        public: baseSepoliaConfig.rpcUrls.public,
      },
      blockExplorers: baseSepoliaConfig.blockExplorers,
      testnet: true,
    };

    // 2. Create creator client with proper typing
    const creatorClient = createCreatorClient({
      chain: zoraChainConfig as any,
      publicClient: publicClient as any,
    });

    // 3. Create the contract and get the transaction parameters with prepareMint
    const { parameters, contractAddress, prepareMint } = await creatorClient.create1155({
      contract: {
        name,
        uri: contractURI,
      },
      token: {
        tokenMetadataURI,
        createReferral: '0x0000000000000000000000000000000000000000',
      },
      account,
    });

    // 4. Extract the transaction parameters with type assertions
    const txParams = {
      to: (parameters as any).to as `0x${string}`,
      data: (parameters as any).data as `0x${string}`,
      value: BigInt((parameters as any).value?.toString() || '0'),
      gas: BigInt((parameters as any).gas?.toString() || '3000000'),
      account,
      chain: baseSepoliaConfig,
      type: 'eip1559' as const,
    };

    // 5. Log the transaction details (without sensitive data)
    console.log('Preparing transaction with parameters:', {
      to: txParams.to,
      value: txParams.value.toString(),
      gas: txParams.gas.toString(),
      data: txParams.data ? `${txParams.data.substring(0, 50)}...` : null,
      type: txParams.type,
    });

    try {
      // 6. Send the transaction
      const hash = await walletClient.sendTransaction(txParams);
      console.log('Transaction sent successfully with hash:', hash);
      
      // 7. Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      // 8. Verify the contract was deployed
      if (!receipt.contractAddress) {
        throw new Error('No contract address in transaction receipt');
      }
      
      console.log('Contract deployed at:', receipt.contractAddress);
      
      // Return both contract address and prepareMint function
      return {
        contractAddress: receipt.contractAddress,
        prepareMint
      };
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in create1155WithSDK:', {
      error,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      code: error?.code,
      data: error?.data,
      reason: error?.reason,
    });
    
    // Create a more descriptive error
    const errorMessage = error?.message || 'Unknown error occurred during contract creation';
    const enhancedError = new Error(`Failed to create 1155 contract: ${errorMessage}`);
    enhancedError.name = 'ContractCreationError';
    if (error?.stack) {
      enhancedError.stack = error.stack;
    }
    throw enhancedError;
  }
}

/**
 * Creates a new ERC1155 contract using Zora's SDK with enhanced error handling and type safety
 * @param params Contract creation parameters
 * @returns The deployed contract address
 */
export async function create1155Contract({
  name,
  description = 'YourZ NFT Collection',
  symbol = 'YOURZ',
  royaltyBps = 100, // 1% royalty
  royaltyRecipient,
}: Create1155ContractParams): Promise<`0x${string}`> {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called from the browser');
  }

  try {
    // 1. Request account access if needed
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!account) {
      throw new Error('No account found');
    }

    // 2. Create clients
    const walletClient = createWalletClient({
      chain: baseSepoliaConfig,
      transport: custom(window.ethereum)
    });

    const publicClient = createPublicClient({
      chain: baseSepoliaConfig,
      transport: http(baseSepoliaConfig.rpcUrls.default.http[0])
    });

    // 3. Prepare contract metadata
    const contractMetadata = {
      name,
      description,
      image: 'ipfs://bafybeifq2fpoq6z7q4f7j4y6w5y5z5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y',
      external_link: 'https://yourz.xyz',
      seller_fee_basis_points: royaltyBps,
      fee_recipient: royaltyRecipient || account,
    };

    // 4. Upload metadata to IPFS
    const [contractMetadataURI, tokenMetadataURI] = await Promise.all([
      uploadToIPFS(JSON.stringify(contractMetadata)),
      // In a real app, you might want different metadata for the token
      uploadToIPFS(JSON.stringify({
        name,
        description,
        image: 'ipfs://bafybeifq2fpoq6z7q4f7j4y6w5y5z5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y',
        attributes: []
      }))
    ]);

    console.log('Contract metadata uploaded to:', contractMetadataURI);
    console.log('Token metadata uploaded to:', tokenMetadataURI);

    // 5. Deploy contract with the SDK
    const { contractAddress } = await create1155WithSDK({
      name,
      symbol,
      contractURI: contractMetadataURI,
      tokenMetadataURI,
      royaltyBps,
      royaltyRecipient: royaltyRecipient || (account as `0x${string}`),
      account: account as `0x${string}`,
      publicClient,
      walletClient,
    });

    // 6. Cache the deployed contract address
    deployedContractAddress = contractAddress;
    return contractAddress;
  } catch (error) {
    console.error('Error in create1155Contract:', error);

    // Create a more detailed error message
    const errorMessage = error instanceof Error 
      ? `Failed to create 1155 contract: ${error.message}`
      : 'Failed to create 1155 contract: Unknown error';

    // Create enhanced error with more context
    const enhancedError = new Error(errorMessage);
    enhancedError.name = 'ContractCreationError';

    if (error instanceof Error && error.stack) {
      enhancedError.stack = `${enhancedError.name}: ${enhancedError.message}\n${error.stack}`;
    }

    // If there's a cause, add it to the error
    if (error && typeof error === 'object' && 'cause' in error) {
      (enhancedError as any).cause = (error as any).cause;
    }

    throw enhancedError;
  }
}

/**
 * Deploys a Zora Fungible Token (FT) contract
 * @param params Token parameters
 * @returns The deployed contract address
 */
export async function deployZoraFT({
  name,
  symbol,
  initialSupply,
  decimals = 18,
  minter,
  owner,
  description = 'YourZ Fungible Token'
}: CreateFTParams): Promise<`0x${string}`> {

  // 1. Prepare and upload metadata to IPFS
  const metadata = {
    name,
    description,
    symbol,
    decimals,
    image: '', // You can add an image URL here if needed
    attributes: [
      {
        trait_type: 'Initial Supply',
        value: initialSupply.toString()
      },
      {
        trait_type: 'Decimals',
        value: decimals.toString()
      }
    ]
  };

  // Upload metadata to IPFS
  console.log('Uploading metadata to IPFS...');
  const tokenURI = await uploadToIPFS(JSON.stringify(metadata));
  console.log('Metadata uploaded to IPFS:', tokenURI);

  // 2. Format the poolConfig parameter according to the SDK requirements
  const poolConfig = {
    // Fixed point multiplier for the curve (1 = 1e18)
    // Using 1.0 as a default value (1e18 in wei)
    fixedPrice: 1000000000000000000n,
    // Minimum price in wei
    minPrice: 0n,
    // Maximum price in wei (set to a very high number for no maximum)
    maxPrice: 115792089237316195423570985008687907853269984665640564039457584007913129639935n,
    // Minimum order size in wei
    minOrderSize: 1000000000000000n, // 0.001 ETH
    // Maximum order size in wei (set to a very high number for no maximum)
    maxOrderSize: 115792089237316195423570985008687907853269984665640564039457584007913129639935n
  };

  interface CoinParams {
    name: string;
    symbol: string;
    uri: string;
    payoutRecipient: `0x${string}`;
    platformReferrer: `0x${string}`;
    chainId: number;
    owners: `0x${string}`[];
    currency: DeployCurrency;
    poolConfig: {
      fixedPrice: bigint;
      minPrice: bigint;
      maxPrice: bigint;
      minOrderSize: bigint;
      maxOrderSize: bigint;
    };
    royaltyBPS: number;
    royaltyRecipient: `0x${string}`;
  }

  const coinParams: CoinParams = {
    name: name.substring(0, 32), // Max 32 chars
    symbol: symbol.substring(0, 10), // Max 10 chars
    uri: tokenURI,
    payoutRecipient: owner as `0x${string}`,
    platformReferrer: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chainId: baseSepoliaConfig.id,
    owners: [owner as `0x${string}`],
    currency: DeployCurrency.ETH,
    poolConfig,
    royaltyBPS: 0, // 0% royalty by default
    royaltyRecipient: '0x0000000000000000000000000000000000000000' as `0x${string}`
  };
  
  try {
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    // 1. Define the chain configuration explicitly
    const chainConfig = {
      id: baseSepoliaConfig.id,
      name: baseSepoliaConfig.name,
      network: 'base-sepolia',
      nativeCurrency: baseSepoliaConfig.nativeCurrency,
      rpcUrls: {
        default: { http: [baseSepoliaConfig.rpcUrls.default.http[0]] },
        public: { http: [baseSepoliaConfig.rpcUrls.default.http[0]] },
      },
      blockExplorers: baseSepoliaConfig.blockExplorers
    };

    // 2. Set up the wallet client with explicit chainId
    const walletClient = createWalletClient({
      chain: {
        id: baseSepoliaConfig.id,
        name: baseSepoliaConfig.name,
        network: 'base-sepolia',
        nativeCurrency: baseSepoliaConfig.nativeCurrency,
        rpcUrls: baseSepoliaConfig.rpcUrls
      },
      transport: custom(window.ethereum)
    });

    // 3. Get the account
    const [account] = await walletClient.getAddresses();
    if (!account) {
      throw new Error('No accounts found');
    }
    
    // Set the account in the wallet client
    walletClient.account = account;

    // 4. Add Base Sepolia to the wallet if not already added
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${baseSepoliaConfig.id.toString(16)}`,
          chainName: baseSepoliaConfig.name,
          nativeCurrency: baseSepoliaConfig.nativeCurrency,
          rpcUrls: [baseSepoliaConfig.rpcUrls.default.http[0]],
          blockExplorerUrls: baseSepoliaConfig.blockExplorers ? [baseSepoliaConfig.blockExplorers.default.url] : []
        }]
      });
    } catch (error) {
      console.warn('Failed to add chain to wallet, continuing anyway:', error);
    }

    // 5. Create public client with explicit chain configuration
    const publicClient = createPublicClient({
      chain: {
        id: baseSepoliaConfig.id,
        name: baseSepoliaConfig.name,
        network: 'base-sepolia',
        nativeCurrency: baseSepoliaConfig.nativeCurrency,
        rpcUrls: baseSepoliaConfig.rpcUrls
      },
      transport: http(baseSepoliaConfig.rpcUrls.default.http[0])
    });

    // 4. Prepare and upload metadata to IPFS
    const metadata = {
      name,
      description,
      symbol,
      decimals,
      initialSupply: initialSupply.toString(),
      image: 'ipfs://bafybeifq2fpoq6z7q4f7j4y6w5y5z5y5z5y5z5y5z5y5z5y5z5y5z5y5z5y5z5y5z', // Placeholder image
      external_url: 'https://yourz.app',
      image_data: '', // Optional: Raw SVG/PNG data if not using image
      background_color: 'ffffff', // White background
      attributes: [
        {
          trait_type: 'Token Type',
          value: 'Fungible Token'
        },
        {
          trait_type: 'Supply',
          value: initialSupply.toString()
        },
        {
          trait_type: 'Decimals',
          value: decimals.toString()
        }
      ]
    };

    console.log('Uploading metadata to IPFS:', metadata);
    const ipfsHash = await uploadToIPFS(metadata);
    const tokenURI = `ipfs://${ipfsHash}`;
    console.log('Metadata uploaded to IPFS:', tokenURI);

    // 6. Check account balance before proceeding
    const balance = await publicClient.getBalance({
      address: account
    });
    console.log(`Account ${account} balance: ${balance.toString()} wei`);
    
    if (balance < parseEther('0.01')) {
      throw new Error('Insufficient balance for deployment. Need at least 0.01 ETH for gas');
    }

    // 7. Prepare coin parameters according to Zora Coins SDK requirements
    const coinParams = {
      name: name.substring(0, 32), // Ensure name is not too long
      symbol: symbol.substring(0, 10), // Ensure symbol is not too long
      uri: tokenURI,
      payoutRecipient: (owner || account) as `0x${string}`,
      platformReferrer: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      chainId: baseSepoliaConfig.id,
      owners: [account],
      currency: 2, // 2 for ETH, 1 for ZORA
      // Add explicit gas parameters
      maxFeePerGas: parseGwei('0.1'), // Reasonable default for Base Sepolia
      maxPriorityFeePerGas: parseGwei('0.005'),
    };
    
    // Helper function to safely stringify objects with BigInt
    const safeStringify = (obj: any, indent = 2) => {
      const replacer = (key: string, value: any) => 
        typeof value === 'bigint' ? value.toString() : value;
      return JSON.stringify(obj, replacer, indent);
    };
    
    console.log('Coin parameters:', safeStringify(coinParams));

    // 8. Set a reasonable gas limit for the deployment
    // Zora deployments typically require around 2-3M gas
    const gasLimit = 3_000_000n;

    // 9. Deploy the coin with simulation first
    try {
      console.log('Simulating deployment...');
      
      // Try with explicit gas settings
      const simulation = await createCoin(
        coinParams,
        walletClient,
        publicClient,
        {
          gas: gasLimit,
          maxFeePerGas: parseGwei('0.1'),
          maxPriorityFeePerGas: parseGwei('0.005'),
          value: 0n,
        }
      );
      
      console.log('Simulation successful:', safeStringify(simulation));
      
      // 10. Proceed with actual deployment
      console.log('Starting actual deployment...');
      const result = await createCoin(
        coinParams,
        walletClient,
        publicClient,
        {
          gas: gasLimit,
          maxFeePerGas: parseGwei('0.1'),
          maxPriorityFeePerGas: parseGwei('0.005'),
          value: 0n,
        }
      );
      
      console.log('Deployment transaction submitted:', safeStringify(result));
    
      // 11. Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: result.hash,
        confirmations: 2,
        timeout: 300_000, // 5 minute timeout
      });

      if (!receipt.contractAddress) {
        throw new Error('No contract address in receipt');
      }

      // 12. Cache the deployed contract address
      deployedFTAddress = receipt.contractAddress as `0x${string}`;
      console.log('Zora FT successfully deployed at:', deployedFTAddress);
      
      return deployedFTAddress;
    } catch (deployError) {
      console.error('Deployment failed:', deployError);
      const errorMessage = deployError?.shortMessage || deployError.message || 'Unknown error';
      const errorDetails = deployError?.details || 'No additional details';
      throw new Error(`Deployment failed: ${errorMessage}. Details: ${errorDetails}`);
    }
  } catch (error) {
    console.error('Error deploying Zora FT:', error);
    throw new Error(`Failed to deploy Zora FT: ${error.message}`);
  }
}

/**
 * Deploys a Zora Coin contract using the tested approach from TestZoraCoinSuite.
 * @param {Object} params - Coin deployment parameters
 * @param {string} params.name - Coin name
 * @param {string} params.symbol - Coin symbol
 * @param {string} params.uri - IPFS URI for metadata
 * @param {string} params.payoutRecipient - Address to receive payouts
 * @param {string} params.platformReferrer - Platform referrer address
 * @param {number} params.chainId - Chain ID (default: Base Sepolia)
 * @param {number} params.currency - Currency enum (DeployCurrency.ETH or ZORA)
 * @param {string} params.mintFee - Mint fee in ETH (as string)
 * @param {string} params.mintFeeRecipient - Address to receive mint fees
 * @returns {Promise<`0x${string}`>} The deployed contract address
 */
// Utility function to ensure we're on the correct network
async function ensureBaseSepoliaNetwork() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId !== '0x14a34') { // Base Sepolia chain ID in hex
      console.log('Switching to Base Sepolia network...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }],
      });
    }
  } catch (switchError: any) {
    // If the network doesn't exist in the wallet, add it
    if (switchError.code === 4902) {
      console.log('Adding Base Sepolia network to wallet...');
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x14a34',
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org'],
        }],
      });
    } else {
      throw new Error(`Failed to switch to Base Sepolia network: ${switchError.message}`);
    }
  }

  // Small delay to ensure network switch is processed
  await new Promise(resolve => setTimeout(resolve, 1000));
}

export async function deployZoraCoin({
  name,
  symbol,
  uri,
  payoutRecipient,
  platformReferrer = '0x0000000000000000000000000000000000000000',
  chainId,
  currency,
  mintFee = '0.000777',
  mintFeeRecipient,
  walletClient,
  publicClient,
  account,
}: {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient?: `0x${string}`;
  platformReferrer?: `0x${string}`;
  chainId?: number;
  currency?: number;
  mintFee?: string;
  mintFeeRecipient?: `0x${string}`;
  walletClient?: any;
  publicClient?: any;
  account?: `0x${string}`;
}): Promise<`0x${string}`> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. This function must be called from the browser.');
  }
    try {
    // Import dependencies
    const { createWalletClient, custom } = await import('viem');
    const { baseSepolia } = await import('viem/chains');
    const { createCoin, DeployCurrency } = await import('@zoralabs/coins-sdk');
    const { createPublicClient, http } = await import('viem');

    // Ensure we're on the correct network
    await ensureBaseSepoliaNetwork();

    // Use provided clients or create new ones
    const finalWalletClient = walletClient || createWalletClient({
      chain: baseSepolia,
      transport: custom(window.ethereum),
      account: account
    });
    const finalPublicClient = publicClient || createPublicClient({
      chain: baseSepolia,
      transport: http()
    });

    // Verify we have a connected account
    if (!finalWalletClient) {
      throw new Error('Wallet client not available. Please connect your wallet.');
    }

    if (!account) {
      throw new Error('Account not provided. Please provide a valid account address.');
    }

    // Use provided or default values
    const _chainId = chainId || baseSepolia.id;
    const _currency = currency || DeployCurrency.ETH;
    const _platformReferrer = platformReferrer || '0x0000000000000000000000000000000000000000';
    const _mintFee = mintFee || '0.000777';
    const _mintFeeRecipient = mintFeeRecipient || payoutRecipient || '0x0000000000000000000000000000000000000000';
    const _payoutRecipient = payoutRecipient || '0x0000000000000000000000000000000000000000';
    let _uri = uri || '';
    if (!_uri.startsWith('ipfs://')) {
      throw new Error('Coin metadata URI must start with ipfs://');
    }

    // Prepare coin parameters
    const coinParams = {
      name,
      symbol,
      uri: _uri,
      payoutRecipient: _payoutRecipient,
      platformReferrer: _platformReferrer,
      chainId: _chainId,
      currency: _currency,
      mintFee: _mintFee,
      mintFeeRecipient: _mintFeeRecipient,
      version: "v4",
    };

    // Deploy the coin - use the exact same pattern as TestZoraCoinSuite
    console.log('Deploying coin with params:', coinParams);
    console.log('Wallet client:', finalWalletClient);
    console.log('Public client:', finalPublicClient);

    
    
    const result = await createCoin(coinParams, finalWalletClient, finalPublicClient);
    if (!result?.hash) throw new Error('No transaction hash returned from createCoin');

    // Wait for transaction confirmation
    const receipt = await finalPublicClient.waitForTransactionReceipt({
      hash: result.hash,
      confirmations: 2,
    });
    
    console.log('Transaction receipt:', receipt);
    console.log("Coin version: ", receipt.version)
    
    if (receipt.status !== 'success') {
      throw new Error('Coin deployment transaction failed');
    }
    
    // Prefer the address returned by the SDK result
    let contractAddress = result.address || receipt.contractAddress;
    
    if (!contractAddress) {
      // As a fallback, try to get the contract address from the transaction
      try {
        const tx = await finalPublicClient.getTransaction({ hash: result.hash });
        console.log('Transaction details:', tx);
        
        if (tx.to === null) {
          const sender = receipt.from;
          const nonce = await finalPublicClient.getTransactionCount({ address: sender as `0x${string}` });
          console.log('Contract creation transaction detected, sender:', sender, 'nonce:', nonce);
        }
      } catch (txError) {
        console.error('Error getting transaction details:', txError);
      }
      throw new Error('Could not determine contract address from transaction receipt or result');
    }
    
    return contractAddress;
  } catch (error) {
    console.error('Error deploying Zora Coin:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to deploy Zora Coin');
  }
}

/**
 * DEPRECATED: This function uses the old shared contract approach. 
 * Using individual contracts per post now via createNFTDirectly in write/page.tsx
 * @param params Minting parameters
 * @returns The minting transaction receipt and token ID
 */
// export async function mintNFT({
//   name,
//   description,
//   content,
//   image,
//   quantity = 1,
//   price = '0.000777',
//   recipient,
//   contractAddress,
//   attributes = [],
//   tokenURI, // Optional: Allow passing tokenURI directly
// }: MintNFTParams): Promise<MintResult> {
      // DEPRECATED: Entire function body commented out - using individual contracts per post now
    // try {
    //   // ... entire function body commented out ...
    // } catch (error) {
    //   const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
    //   console.error('Error in mintNFT:', errorMessage);
    //   return {
    //     success: false,
    //     error: errorMessage,
    //     details: error instanceof Error ? error.stack : undefined,
    //   };
    // }
  // }

/**
 * DEPRECATED: This function uses the old mintNFT approach. 
 * Using individual contracts per post now via createNFTDirectly in write/page.tsx
 * @param params Parameters for contract deployment and NFT minting
 * @returns The minting result including contract address and transaction details
 */
// export async function deployContractAndMint({
//   // Contract deployment params
//   name,
//   description = 'YourZ NFT Collection',
//   symbol = 'YOURZ',
//   royaltyBps = 100,
//   royaltyRecipient,
//   
//   // NFT minting params
//   content,
//   image,
//   quantity = 1,
//   price = '0.000777',
//   recipient,
//   attributes = [],
// }: Omit<Create1155ContractParams & Omit<MintNFTParams, 'contractAddress' | 'recipient'>, 'name'> & { 
//   name: string;
//   recipient?: `0x${string}`;
// }): Promise<MintResult & { contractDeployed: boolean }> {
      // DEPRECATED: Entire function body commented out - using individual contracts per post now
    // try {
    //   // ... entire function body commented out ...
    // } catch (error) {
    //   console.error('Error in deployContractAndMint:', error);
    //   return {
    //     success: false,
    //     contractDeployed: false,
    //     error: error instanceof Error ? error.message : 'Failed to deploy contract and mint NFT',
    //     details: error instanceof Error ? error.stack : undefined,
    //   };
    // }
  // }

interface ContractDetails {
  name: string;
  symbol: string;
  contractURI: string;
  tokenURI?: string;
  owner?: string;
  totalSupply?: bigint;
}

/**
* Get details about a deployed Zora 1155 contract
* @param contractAddress The address of the deployed contract
* @returns Contract details including name, symbol, and metadata URIs
*/
// Import PublicClient type from viem
import type { PublicClient } from 'viem';

// Define a more compatible type for the public client
type CustomPublicClient = PublicClient & {
  // We can add custom methods or overrides here if needed
  // The main purpose is to ensure type compatibility with Viem's PublicClient
  chain: {
    id: number;
    name: string;
    network: string;
    nativeCurrency: {
      decimals: number;
      name: string;
      symbol: string;
    };
    rpcUrls: {
      [key: string]: { http: string[] };
      default: { http: string[] };
    };
    blockExplorers?: {
      [key: string]: { url: string; name: string };
      default: { url: string; name: string };
    };
    testnet?: boolean;
  };
};

// Create a public client for Base Sepolia
export function createBaseSepoliaClient() {
  try {
    const client = createPublicClient({
      chain: baseSepoliaConfig,
      transport: http(baseSepoliaConfig.rpcUrls.default.http[0], {
        retryCount: 3,
        retryDelay: 1000,
        timeout: 30000
      })
    });
    
    console.log('Base Sepolia client created successfully');
    return client;
  } catch (error) {
    console.error('Failed to create Base Sepolia client:', error);
    throw new Error(`Failed to initialize Base Sepolia client: ${error.message}`);
  }
};

export async function getContractDetails(contractAddress: `0x${string}`): Promise<ContractDetails> {
  try {
    const publicClient = createBaseSepoliaClient();

    // Helper function to read contract data
    const readContract = async <T>(functionName: string, args: any[] = []): Promise<T> => {
      try {
        return await publicClient.readContract({
          address: contractAddress,
          abi: ZORA_1155_ABI,
          functionName,
          args
        }) as T;
      } catch (error) {
        console.warn(`Error calling ${functionName}:`, error);
        return undefined as any;
      }
    };

    // Fetch contract details in parallel
    const [
      name,
      symbol,
      contractURI,
      owner,
      totalSupply
    ] = await Promise.all([
      readContract<string>('name'),
      readContract<string>('symbol'),
      readContract<string>('contractURI'),
      readContract<`0x${string}`>('owner').catch(() => undefined),
      readContract<bigint>('totalSupply', [0]).catch(() => undefined)
    ]);

    // Extract token URI if possible (for single token contracts)
    let tokenURI: string | undefined;
    try {
      tokenURI = await readContract<string>('uri', [0]);
    } catch {
      // Not all contracts implement uri(0) or might revert
    }

    return {
      name: name || 'Unknown',
      symbol: symbol || 'UNK',
      contractURI: contractURI || '',
      tokenURI,
      owner,
      totalSupply,
    };
  } catch (error) {
    console.error('Error fetching contract details:', error);
    throw new Error(`Failed to fetch contract details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

