'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useZora } from '@/hooks/useZora'
import { useIPFS } from '@/utils/ipfs'
import PostEditor from '@/components/PostEditor'

export default function WritePage() {
  const router = useRouter()
  const { address } = useAccount()
  const { createPost } = useZora()
  const { uploadToIPFS } = useIPFS()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: {
    title: string
    content: string
    price: string
  }) => {
    if (!address) return

    try {
      setIsSubmitting(true)

      // Upload content to IPFS
      const content = {
        title: data.title,
        content: data.content,
        author: address,
        timestamp: new Date().toISOString(),
      }
      const uri = await uploadToIPFS(content)

      // Create coin for the post
      const contractCallParams = await createPost({
        title: data.title,
        content: data.content,
        price: data.price,
        uri,
      })

      // Execute the transaction
      const tx = await contractCallParams.write()
      await tx.wait()

      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Connect your wallet to write
            </h2>
            <p className="text-gray-600 mb-8">
              You need to connect your wallet to create and publish posts.
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Write a Post</h1>
        <PostEditor onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
} 