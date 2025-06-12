'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useZora } from '@/hooks/useZora'
import { uploadToIPFS } from '@/lib/ipfs'
import type { PostMetadata } from '@/types/post'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface PostEditorProps {
  initialData?: Partial<PostMetadata>
  onSave?: (data: PostMetadata) => Promise<void>
}

export default function PostEditor({ initialData, onSave }: PostEditorProps) {
  const router = useRouter()
  const { address } = useAccount()
  const { mintPost } = useZora()
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [price, setPrice] = useState('0.01')
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setIsPublishing(true)

      // Create post metadata
      const metadata: PostMetadata = {
        title,
        description: content.substring(0, 160),
        content,
        author: {
          address,
          name: 'Anonymous', // TODO: Get from user profile
        },
        createdAt: new Date(),
        tags: [], // TODO: Add tag support
      }

      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(metadata)

      // Mint NFT
      // TODO: Implement minting logic with Zora

      if (onSave) {
        await onSave(metadata)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error publishing post:', error)
      alert('Error publishing post. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full text-4xl font-bold border-none focus:ring-0 p-0 mb-4"
        />
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price in ETH"
            className="w-32 px-3 py-2 border rounded-lg"
            min="0"
            step="0.001"
          />
          <span className="text-gray-500">ETH</span>
        </div>
      </div>

      <div className="prose max-w-none">
        <ReactQuill
          value={content}
          onChange={setContent}
          placeholder="Write your post..."
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean'],
            ],
          }}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handlePublish}
          disabled={isPublishing || !title || !content}
          className="btn-primary"
        >
          {isPublishing ? 'Publishing...' : 'Publish as NFT'}
        </button>
      </div>
    </div>
  )
} 