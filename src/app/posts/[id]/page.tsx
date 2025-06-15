'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { PlaceholderAvatar } from '@/components/PlaceholderAvatar'
import Comments from '@/components/Comments'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Post {
  id: string
  title: string
  content: string
  metadata: any
  status: string
  is_nft: boolean
  created_at: string
  updated_at: string
  address: string
  author_name?: string
  likes_count?: number
  is_liked?: boolean
  is_bookmarked?: boolean
}

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserAddress, setCurrentUserAddress] = useState<string | undefined>()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // First, try to get the post with likes and bookmarks
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Transform the data to include likes count and other metadata
        const transformedPost = {
          ...data,
          likes_count: 0, // Default to 0
          is_liked: false,
          is_bookmarked: false
        }

        // Try to get likes count
        try {
          const { count } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', data.id)
          
          if (count !== null) {
            transformedPost.likes_count = count
          }
        } catch (err) {
          console.warn('Could not fetch likes count:', err)
        }

        setPost(transformedPost)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
        toast.error('Failed to load post')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const handleLike = async () => {
    if (!post) return

    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: post.id,
          user_address: post.address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setPost(prev => prev ? {
        ...prev,
        likes_count: (prev.likes_count || 0) + 1,
        is_liked: true
      } : null)

      toast.success('Post liked!')
    } catch (err) {
      console.error('Error liking post:', err)
      toast.error('Failed to like post')
    }
  }

  const handleBookmark = async () => {
    if (!post) return

    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .upsert({
          post_id: post.id,
          user_address: post.address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setPost(prev => prev ? {
        ...prev,
        is_bookmarked: true
      } : null)

      toast.success('Post bookmarked!')
    } catch (err) {
      console.error('Error bookmarking post:', err)
      toast.error('Failed to bookmark post')
    }
  }

  const handleShare = () => {
    if (!post) return

    const url = `${window.location.origin}/posts/${post.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Post</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Post not found'}</p>
            <Link href="/" className="text-primary hover:text-primary/90">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Post Header */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <Link href={`/profile?address=${post.address}`} className="flex items-center gap-3">
                <PlaceholderAvatar
                  address={post.address}
                  name={post.author_name}
                  size={40}
                  className="rounded-full"
                />
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {post.author_name || 'Anonymous'}
                  </p>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post.address.slice(0, 6)}...{post.address.slice(-4)}
                  </p>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </div>

            {/* Post Content */}
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Post Actions */}
            <div className="mt-8 pt-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                  {post.is_liked ? (
                    <FaHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <FaRegHeart className="w-5 h-5" />
                  )}
                  <span>{post.likes_count || 0}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
                >
                  {post.is_bookmarked ? (
                    <FaBookmark className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <FaRegBookmark className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  <FaShare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <Comments postId={post.id} currentUserAddress={currentUserAddress} />
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
} 