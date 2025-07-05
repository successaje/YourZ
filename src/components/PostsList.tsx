'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Clock, Flame, Star, Users, Zap, ArrowRight, Heart, MessageCircle, Eye } from 'lucide-react'
import { PostTag, getPostTags } from './ui/post-tags'
import { supabase } from '@/lib/supabase'

const stripHtml = (html: string, maxLength = 100) => {
  if (typeof window === 'undefined') return html
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  likes_count: number
  views_count: number
  comments_count: number
  is_liked: boolean
  is_bookmarked: boolean
  author_name: string
  wallet_address: string
  is_featured?: boolean
  is_nft?: boolean
  image_url?: string
  metadata?: {
    image?: string
    description?: string
    [key: string]: any
  }
}

interface PostsListProps {
  showFeatured?: boolean
  limit?: number
  category?: 'featured' | 'latest' | 'trending' | 'popular'
}

const MediumStylePostCard = ({ post }: { post: Post }) => {
  const tags = getPostTags(post)
  const postDate = new Date(post.created_at)
  const formattedDate = postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <article className="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 last:border-b-0">
      <div className="flex gap-6">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {post.author_name || 'Anonymous'}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formattedDate}
            </span>
            {tags.length > 0 && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {tags[0]}
                </span>
              </>
            )}
          </div>
          
          <Link href={`/posts/${post.id}`} className="block group">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {post.title || 'Untitled Post'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
              {stripHtml(post.content, 150) || 'No content available'}
            </p>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                <Heart className="h-4 w-4" />
                <span>{post.likes_count.toLocaleString()}</span>
              </button>
              {post.comments_count > 0 && (
                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count.toLocaleString()}</span>
                </button>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views_count.toLocaleString()}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  {tag}
                </span>
              ))}
              {post.is_nft && (
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  NFT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://via.placeholder.com/128/1a1a2e/ffffff?text=${post.title[0]}`
              }}
            />
          </div>
        )}
      </div>
    </article>
  )
}

const CompactPostCard = ({ post }: { post: Post }) => {
  const tags = getPostTags(post)
  const isNew = tags.includes('new')
  const postDate = new Date(post.created_at)
  const formattedDate = postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
        {post.image_url && (
          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://via.placeholder.com/80/1a1a2e/ffffff?text=${post.title[0]}`
              }}
            />
            {isNew && (
              <div className="absolute top-1 right-1 z-10">
                <PostTag type="new" />
              </div>
            )}
          </div>
        )}
        <div className="ml-4 flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
            {post.title || 'Untitled Post'}
          </h3>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {tags.map((tag) => (
              <PostTag key={tag} type={tag} />
            ))}
            {post.is_nft && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                NFT
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {stripHtml(post.content) || 'No content available'}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3" />
                {post.likes_count.toLocaleString()}
              </span>
              {post.comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {post.comments_count.toLocaleString()}
                </span>
              )}
              <span className="hidden sm:inline">{formattedDate}</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              by {post.author_name || 'Anonymous'}
            </span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

export default function PostsList({ showFeatured = true, limit = 10, category = 'latest' }: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Ensure minimum of 15 posts
      const effectiveLimit = Math.max(limit, 15)
      
      let query = supabase
        .from('posts')
        .select('*')
        .limit(effectiveLimit * 3) // Fetch more posts to randomize from and ensure minimum

      // Apply category-specific ordering
      switch (category) {
        case 'featured':
          // For featured, we'll randomize from all posts instead of filtering by is_featured
          query = query.order('created_at', { ascending: false })
          break
        case 'trending':
          query = query.order('likes_count', { ascending: false })
          break
        case 'popular':
          query = query.order('views_count', { ascending: false })
          break
        case 'latest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data: posts, error } = await query

      if (error) throw error

      if (!posts || posts.length === 0) {
        setPosts([])
        return
      }

      // Process posts to match our interface
      const processedPosts = posts.map(post => ({
        id: post.id,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        created_at: post.created_at || new Date().toISOString(),
        updated_at: post.updated_at || new Date().toISOString(),
        likes_count: post.likes_count || Math.floor(Math.random() * 100), // Random likes if not set
        views_count: post.views_count || Math.floor(Math.random() * 500), // Random views if not set
        comments_count: post.comments_count || Math.floor(Math.random() * 20), // Random comments if not set
        is_liked: post.is_liked || false,
        is_bookmarked: post.is_bookmarked || false,
        author_name: post.author_name || `user_${post.address?.slice(0, 6) || 'anon'}`,
        wallet_address: post.address || '0x',
        is_featured: post.is_featured || false,
        is_nft: post.is_nft || false,
        image_url: post.image_url || `https://picsum.photos/seed/${post.id || Math.random()}/800/600`,
        metadata: post.metadata || {}
      }))

      // Randomize the posts for better variety
      const shuffledPosts = [...processedPosts].sort(() => 0.5 - Math.random())
      
      // Take the effective limit (minimum 15)
      const finalPosts = shuffledPosts.slice(0, effectiveLimit)

      setPosts(finalPosts)
      setError(null)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts. Please try again later.')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [limit, category])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-8">
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="w-32 h-32 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
        {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg
            className="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No posts found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          There are no posts available in this category.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <MediumStylePostCard key={post.id} post={post} />
      ))}
    </div>
  )
}