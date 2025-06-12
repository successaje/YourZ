'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useZora } from '@/hooks/useZora'
import { useIPFS } from '@/utils/ipfs'
import type { Post } from '@/types'

export default function PostPage() {
  const params = useParams()
  const { address } = useAccount()
  const { collectPost, resellPost } = useZora()
  const { getFromIPFS } = useIPFS()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollecting, setIsCollecting] = useState(false)
  const [isReselling, setIsReselling] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // In a real app, you would fetch the coin details from the blockchain
        // and then get the content from IPFS using the coin's URI
        const mockPost: Post = {
          id: params.id as string,
          title: 'Sample Post',
          content: 'This is a sample post content.',
          author: '0x123...',
          price: '0.1',
          timestamp: new Date().toISOString(),
        }
        setPost(mockPost)
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const handleCollect = async () => {
    if (!address || !post) return

    try {
      setIsCollecting(true)
      const contractCallParams = await collectPost(
        post.id as `0x${string}`,
        post.price
      )
      const tx = await contractCallParams.write()
      await tx.wait()
      alert('Successfully collected the post!')
    } catch (error) {
      console.error('Error collecting post:', error)
      alert('Failed to collect post. Please try again.')
    } finally {
      setIsCollecting(false)
    }
  }

  const handleResell = async () => {
    if (!address || !post) return

    try {
      setIsReselling(true)
      const contractCallParams = await resellPost(
        post.id as `0x${string}`,
        post.price
      )
      const tx = await contractCallParams.write()
      await tx.wait()
      alert('Successfully listed the post for resale!')
    } catch (error) {
      console.error('Error reselling post:', error)
      alert('Failed to resell post. Please try again.')
    } finally {
      setIsReselling(false)
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Connect your wallet to view posts
            </h2>
            <p className="text-gray-600 mb-8">
              You need to connect your wallet to collect and resell posts.
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Post not found
            </h2>
            <p className="text-gray-600">
              The post you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <article className="bg-white shadow rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-500 mb-8">
            <span>By {post.author}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="prose max-w-none mb-8">
            <p>{post.content}</p>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-8">
            <div className="text-2xl font-bold text-gray-900">
              {post.price} ETH
            </div>
            <div className="space-x-4">
              <button
                onClick={handleCollect}
                disabled={isCollecting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCollecting ? 'Collecting...' : 'Collect'}
              </button>
              <button
                onClick={handleResell}
                disabled={isReselling}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {isReselling ? 'Reselling...' : 'Resell'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
} 