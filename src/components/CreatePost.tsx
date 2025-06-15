import { useState } from 'react'
import { motion } from 'framer-motion'
import { createCreatorClient } from "@zoralabs/protocol-sdk"
import { useAccount, usePublicClient } from 'wagmi'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs'
import { useUserProfile } from '@/hooks/useUserProfile'

interface CreatePostProps {
  onSuccess?: () => void
}

export default function CreatePost({ onSuccess }: CreatePostProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mintPrice, setMintPrice] = useState('0.01')
  const [royaltyBps, setRoyaltyBps] = useState('1000') // 10%
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { profile } = useUserProfile(address)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setCoverImage(acceptedFiles[0])
    }
  })

  const handleCreatePost = async () => {
    if (!address || !publicClient || !title || !content) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      console.log('Starting post creation process...')
      
      // 1. Upload content to IPFS
      console.log('Uploading content to IPFS...')
      const contentData = {
        content,
        metadata: {
          title,
          author: {
            name: profile?.name || 'Anonymous',
            avatar: profile?.avatar_url,
            wallet: address
          },
          createdAt: new Date().toISOString()
        }
      }
      
      const contentHash = await uploadToIPFS(contentData)
      console.log('Content uploaded to IPFS:', contentHash)

      // 2. Upload cover image to IPFS if exists
      let imageHash = ''
      if (coverImage) {
        console.log('Uploading cover image to IPFS...')
        imageHash = await uploadFileToIPFS(coverImage)
        console.log('Cover image uploaded to IPFS:', imageHash)
      }

      // 3. Create NFT metadata
      const metadata = {
        name: title,
        description: content.substring(0, 200) + '...',
        image: imageHash ? `ipfs://${imageHash}` : undefined,
        content: `ipfs://${contentHash}`,
        attributes: [
          {
            trait_type: "Type",
            value: "Post"
          }
        ]
      }

      // 4. Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...')
      const metadataHash = await uploadToIPFS(metadata)
      console.log('Metadata uploaded to IPFS:', metadataHash)

      // 5. Create NFT using Zora
      console.log('Creating NFT with Zora...')
      const creatorClient = createCreatorClient({ 
        chainId: publicClient.chain.id, 
        publicClient 
      })

      const { parameters } = await creatorClient.create1155({
        name: title,
        symbol: "POST",
        royaltyBps: parseInt(royaltyBps),
        royaltyRecipient: address,
        tokenURI: `ipfs://${metadataHash}`,
        mintPrice: parseEther(mintPrice),
      })

      console.log('NFT creation parameters:', parameters)

      // 6. Save post to Supabase
      console.log('Saving post to Supabase...')
      const postData = {
        title,
        content,
        metadata: {
          ...metadata,
          ipfsHash: contentHash,
          ipfsUrl: `https://gateway.pinata.cloud/ipfs/${contentHash}`,
          nftMetadata: {
            hash: metadataHash,
            url: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
            parameters
          }
        },
        author_id: profile?.id,
        author_name: profile?.name || 'Anonymous',
        author_avatar: profile?.avatar_url,
        wallet_address: address,
        status: 'published',
        is_nft: true
      }

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()

      if (postError) {
        console.error('Error creating post in Supabase:', postError)
        throw new Error(`Failed to create post: ${postError.message}`)
      }

      if (!post) {
        throw new Error('Post was not created successfully')
      }

      console.log('Post created successfully:', post)
      toast.success('Post created successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Enter post title"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Write your post content..."
        />
      </div>

      <div>
        <label htmlFor="mintPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mint Price (ETH)
        </label>
        <input
          type="number"
          id="mintPrice"
          value={mintPrice}
          onChange={(e) => setMintPrice(e.target.value)}
          step="0.001"
          min="0"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="royaltyBps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Royalty Percentage
        </label>
        <input
          type="number"
          id="royaltyBps"
          value={parseInt(royaltyBps) / 100}
          onChange={(e) => setRoyaltyBps((parseFloat(e.target.value) * 100).toString())}
          step="1"
          min="0"
          max="100"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cover Image
        </label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...getInputProps()} />
          {coverImage ? (
            <div className="space-y-2">
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Cover"
                className="mx-auto max-h-48 rounded-lg"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {coverImage.name}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCreatePost}
        disabled={isLoading}
        className="w-full px-6 py-3 text-black dark:text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Post...' : 'Create Post'}
      </motion.button>
    </div>
  )
} 