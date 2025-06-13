import { useState } from 'react'
import { motion } from 'framer-motion'
import { createCreatorClient } from "@zoralabs/protocol-sdk"
import { useAccount, usePublicClient } from 'wagmi'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'

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
      // 1. Upload content to IPFS
      const contentBlob = new Blob([content], { type: 'text/markdown' })
      const contentFormData = new FormData()
      contentFormData.append('file', contentBlob, 'content.md')

      const contentResponse = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: contentFormData
      })
      const { hash: contentHash } = await contentResponse.json()

      // 2. Upload cover image to IPFS if exists
      let imageHash = ''
      if (coverImage) {
        const imageFormData = new FormData()
        imageFormData.append('file', coverImage)
        const imageResponse = await fetch('/api/ipfs/upload', {
          method: 'POST',
          body: imageFormData
        })
        const { hash } = await imageResponse.json()
        imageHash = hash
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
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      const metadataFormData = new FormData()
      metadataFormData.append('file', metadataBlob, 'metadata.json')
      const metadataResponse = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: metadataFormData
      })
      const { hash: metadataHash } = await metadataResponse.json()

      // 5. Create NFT using Zora
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

      // TODO: Handle the transaction
      console.log('Create post parameters:', parameters)

      toast.success('Post created successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
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