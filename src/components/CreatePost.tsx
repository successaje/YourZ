import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount, usePublicClient } from 'wagmi';
import { deployZora1155Contract } from '@/utils/zora1155-simple';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs';
import { useUserProfile } from '@/hooks/useUserProfile';
import { parseEther } from 'viem';

interface CreatePostProps {
  onSuccess?: () => void;
}

export default function CreatePost({ onSuccess }: CreatePostProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mintPrice, setMintPrice] = useState('0.01');
  const [royaltyBps, setRoyaltyBps] = useState('1000'); // 10%
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isNFT, setIsNFT] = useState<boolean>(false);
  const [createCoin, setCreateCoin] = useState<boolean>(false);
  const [coinSymbol, setCoinSymbol] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(null);
  const [mintFee, setMintFee] = useState('0.000777');
  const [mintFeeRecipient, setMintFeeRecipient] = useState<string>('');

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { profile: profileData } = useUserProfile(address);
  const profile = profileData || null;
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setCoverImage(acceptedFiles[0]);
    }
  });

  const handleNFTCreation = async () => {
    if (!coverImage || !publicClient || !address) return null;
    
    try {
      console.log('Creating NFT...');
      // Upload cover image to IPFS
      const imageHash = await uploadFileToIPFS(coverImage);
      
      // Deploy Zora 1155 contract
      const { contractAddress } = await deployZora1155Contract({
        name: title,
        description: content.substring(0, 200) + '...',
        image: coverImage,
        publicClient,
        account: address,
        uploadFileToIpfs: async (file: File | string) => {
          if (typeof file === 'string') return file;
          return uploadFileToIPFS(file);
        },
        mintPrice: parseEther(mintPrice),
        royaltyBps: parseInt(royaltyBps),
      });

      console.log('NFT contract deployed at:', contractAddress);
      return contractAddress;
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT');
      return null;
    }
  };

  const createPostCoin = async (postId: string): Promise<`0x${string}` | null> => {
    if (!address || !coinSymbol) return null;
    
    try {
      console.log('Creating post coin...');
      const coinName = `${title} (${postId.substring(0, 6)})`;
      
      // Dynamically import to avoid SSR issues
      const { createCoin, DeployCurrency } = await import('@zoralabs/coins-sdk');
      const { baseSepolia } = await import('viem/chains');
      
      // Upload cover image to IPFS if exists
      let imageUri = '';
      if (coverImage) {
        imageUri = await uploadFileToIPFS(coverImage);
      }
      
      // Prepare metadata
      const metadata = {
        name: coinName,
        description: `Community token for post: ${title}`,
        image: imageUri || undefined,
        external_url: `${window.location.origin}/post/${postId}`
      };
      
      // Upload metadata to IPFS
      const metadataUri = await uploadToIPFS(metadata);
      const contractUri = `ipfs://${metadataUri}`;
      
      // Prepare coin parameters matching the TestZoraCoinSuite pattern
      const coinParams = {
        name: coinName,
        symbol: coinSymbol.toUpperCase(),
        uri: contractUri,
        payoutRecipient: address as `0x${string}`,
        platformReferrer: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        chainId: baseSepolia.id,
        currency: DeployCurrency.ETH,
        mintFee: mintFee,
        mintFeeRecipient: (mintFeeRecipient && mintFeeRecipient.length > 0 ? mintFeeRecipient : address) as `0x${string}`,
      };

      console.log('Deploying coin with params:', coinParams);
      
      // Get the wallet client
      const { createWalletClient, custom } = await import('viem');
      
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum!)
      });
      
      // Get the public client
      const publicClient = (await import('@/utils/zora')).createBaseSepoliaClient();
      
      // Create the coin
      const result = await createCoin(coinParams, walletClient, publicClient);
      
      setTransactionHash(result.hash);
      console.log('Transaction sent, waiting for confirmation...', result.hash);
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: result.hash,
        confirmations: 2,
      });
      
      if (receipt.status === 'success') {
        console.log('Coin deployed successfully!', receipt);
        
        if (!receipt.contractAddress) {
          throw new Error('No contract address in receipt');
        }
        
        const coinContractAddress = receipt.contractAddress;
        console.log('Coin deployed at:', coinContractAddress);
        
        try {
          // Save coin to post_coins table
          const { error } = await supabase.from('post_coins').insert({
            post_id: postId,
            contract_address: coinContractAddress,
            name: coinName,
            symbol: coinSymbol.toUpperCase(),
            creator_address: address,
            transaction_hash: result.hash,
            metadata_uri: metadataUri,
            created_at: new Date().toISOString()
          });
          
          if (error) {
            console.error('Error saving coin to database:', error);
            throw error;
          }
          
          return coinContractAddress;
          
        } catch (dbError) {
          console.error('Database error:', dbError);
          toast.error('Coin deployed but failed to save to database');
          return coinContractAddress; // Still return the address even if DB save fails
        }
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error creating coin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create coin');
      return null;
    }
  };

  const handleCreatePost = async () => {
    if (!address || !publicClient || !title || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (createCoin && !coinSymbol) {
      toast.error('Please enter a coin symbol');
      return;
    }

    if (createCoin && coinSymbol.length < 2) {
      toast.error('Coin symbol must be at least 2 characters');
      return;
    }

    if (isNFT && !coverImage) {
      toast.error('Please upload a cover image for your NFT');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting post creation process...');
      
      // Upload content to IPFS
      console.log('Uploading content to IPFS...');
      const contentData = {
        content,
        metadata: {
          title,
          author: {
            name: profile?.username || 'Anonymous',
            avatar: profile?.ipfs_hash,
            wallet: address
          },
          createdAt: new Date().toISOString()
        }
      };
      
      const contentHash = await uploadToIPFS(contentData);
      console.log('Content uploaded to IPFS:', contentHash);

      // Upload cover image to IPFS if exists
      let imageHash = '';
      if (coverImage) {
        console.log('Uploading cover image to IPFS...');
        imageHash = await uploadFileToIPFS(coverImage);
        console.log('Cover image uploaded to IPFS:', imageHash);
      }

      // Save post to Supabase
      console.log('Saving post to Supabase...');
      const postData: any = {
        title,
        content: contentHash,
        author_id: address,
        ipfs_hash: imageHash || null,
        is_nft: isNFT,
        has_coin: createCoin
      };

      // Handle NFT creation if enabled
      if (isNFT) {
        const contractAddress = await handleNFTCreation();
        if (contractAddress) {
          postData.nft_contract_address = contractAddress;
          postData.mint_price = parseEther(mintPrice).toString();
          postData.royalty_bps = parseInt(royaltyBps);
        } else {
          throw new Error('Failed to create NFT');
        }
      }

      // Save post to database
      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      console.log('Post created:', post);

      // Create coin if enabled
      if (createCoin && post?.id) {
        await createPostCoin(post.id);
      }

      toast.success('Post created successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter post title"
            disabled={isLoading}
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[200px]"
            placeholder="Write your post content here..."
            disabled={isLoading}
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image {isNFT && '*'}
          </label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
          >
            <input {...getInputProps()} />
            {coverImage ? (
              <p className="text-sm text-gray-600">
                {coverImage.name} (click to change)
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Drag & drop an image here, or click to select
                {isNFT && ' (required for NFT)'}
              </p>
            )}
          </div>
        </div>

        {/* Post Options */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium">Post Options</h3>
          
          {/* NFT Toggle */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNFT}
                onChange={(e) => setIsNFT(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
                disabled={isLoading}
              />
              <span className="text-gray-700">Create as NFT</span>
            </label>
          </div>
          
          {/* NFT Options */}
          {isNFT && (
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mint Price (ETH)
                </label>
                <input
                  type="number"
                  value={mintPrice}
                  onChange={(e) => setMintPrice(e.target.value)}
                  step="0.000000000000000001"
                  min="0"
                  className="w-32 p-2 border rounded-md"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Royalty Percentage
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={royaltyBps}
                    onChange={(e) => setRoyaltyBps(e.target.value)}
                    className="w-32"
                    disabled={isLoading}
                  />
                  <span className="text-sm">{(parseInt(royaltyBps) / 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Coin Toggle */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createCoin}
                onChange={(e) => setCreateCoin(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
                disabled={isLoading}
              />
              <span className="text-gray-700">Create YourPost Coin</span>
            </label>
          </div>
          
          {/* Coin Options */}
          {createCoin && (
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coin Symbol
                </label>
                <input
                  type="text"
                  value={coinSymbol}
                  onChange={(e) => setCoinSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. POST"
                  maxLength={5}
                  className="w-32 p-2 border rounded-md"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  2-5 uppercase letters/numbers only
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mint Fee (ETH)
                </label>
                <input
                  type="number"
                  value={mintFee}
                  onChange={(e) => setMintFee(e.target.value)}
                  placeholder="0.000777"
                  min="0"
                  step="0.000001"
                  className="w-32 p-2 border rounded-md"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fee charged per mint (default: 0.000777 ETH)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mint Fee Recipient (optional)
                </label>
                <input
                  type="text"
                  value={mintFeeRecipient}
                  onChange={(e) => setMintFeeRecipient(e.target.value)}
                  placeholder={address || '0x...'}
                  className="w-full p-2 border rounded-md"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Defaults to your address if left blank
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>• 1,000,000 tokens will be created</p>
                <p>• You will be the admin of this token</p>
                <p>• Tokens can be used for community engagement</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleCreatePost}
            disabled={isLoading}
            className={`px-6 py-2 rounded-md text-white ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
