'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Clock, Flame, Star, Users, Zap, ArrowRight } from 'lucide-react'
import { PostTag, getPostTags } from './ui/post-tags'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

export default function PostsList() {
  const [activeTab, setActiveTab] = useState('featured')
  const [posts, setPosts] = useState<{
    featured: Post[]
    recent: Post[]
    trending: Post[]
    popular: Post[]
    recommended: Post[]
  }>({
    featured: [],
    recent: [],
    trending: [],
    popular: [],
    recommended: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch posts from Supabase
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      if (!posts || posts.length === 0) {
        setPosts({
          featured: [],
          recent: [],
          trending: [],
          popular: [],
          recommended: []
        })
        return
      }

      // Process posts to match our interface
      const processedPosts = posts.map(post => ({
        id: post.id,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        created_at: post.created_at || new Date().toISOString(),
        updated_at: post.updated_at || new Date().toISOString(),
        likes_count: post.likes_count || 0,
        views_count: post.views_count || 0,
        comments_count: post.comments_count || 0,
        is_liked: post.is_liked || false,
        is_bookmarked: post.is_bookmarked || false,
        author_name: post.author_name || 'Anonymous',
        wallet_address: post.wallet_address || '0x',
        is_featured: post.is_featured || false,
        is_nft: post.is_nft || false,
        image_url: post.image_url || `https://picsum.photos/seed/${Math.random()}/800/600`,
        metadata: post.metadata || {}
      }))

      // Categorize posts
      const featured = processedPosts.filter(p => p.is_featured)
      const recent = [...processedPosts].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const popular = [...processedPosts].sort((a, b) => b.views_count - a.views_count)
      const trending = [...processedPosts].sort((a, b) => b.likes_count - a.likes_count)
      const recommended = [...processedPosts].sort(() => 0.5 - Math.random())

      setPosts({
        featured: featured.slice(0, 5),
        recent: recent.slice(0, 5),
        trending: trending.slice(0, 5),
        popular: popular.slice(0, 5),
        recommended: recommended.slice(0, 5)
      })
      setError(null)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts. Please try again later.')
      
      // Fallback to empty state on error
      setPosts({
        featured: [],
        recent: [],
        trending: [],
        popular: [],
        recommended: []
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const getRandomPosts = useCallback((count: number) => {
    const allPosts = [
      ...posts.featured,
      ...posts.recent,
      ...posts.trending,
      ...posts.popular,
      ...posts.recommended
    ].filter(Boolean)
    
    if (allPosts.length === 0) return []
    
    // Remove duplicates by post id
    const uniquePosts = Array.from(new Map(allPosts.map(post => [post.id, post])).values())
    
    // Shuffle and take 'count' posts
    return [...uniquePosts].sort(() => 0.5 - Math.random()).slice(0, count)
  }, [posts])

  const tabPosts = useMemo(() => ({
    featured: getRandomPosts(5),
    latest: getRandomPosts(5),
    popular: getRandomPosts(5),
    following: getRandomPosts(5),
    recommended: getRandomPosts(5)
  }), [getRandomPosts])

  const featuredPost = useMemo(() => 
    posts.featured[0] || getRandomPosts(1)[0], 
    [posts.featured, getRandomPosts]
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
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

  return (
    <div className="space-y-8">
      {/* Featured Post */}
      {featuredPost && (
        <div className="relative rounded-xl overflow-hidden shadow-lg group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
          <img 
            src={featuredPost.image_url || `https://source.unsplash.com/random/1200x600/?blockchain`}
            alt={featuredPost.title}
            className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://via.placeholder.com/1200x600/1a1a2e/ffffff?text=${encodeURIComponent(featuredPost.title)}`
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
                Featured
              </span>
              {getPostTags(featuredPost).map((tag) => (
                <PostTag key={tag} type={tag} />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{featuredPost.title}</h2>
            <p className="text-gray-200 mb-4 line-clamp-2">
              {stripHtml(featuredPost.content)}
            </p>
            <Link 
              href={`/posts/${featuredPost.id}`}
              className="inline-flex items-center text-white font-medium hover:underline"
            >
              Read more
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'featured', label: 'Featured', icon: <Star className="h-4 w-4" /> },
            { id: 'latest', label: 'Latest', icon: <Clock className="h-4 w-4" /> },
            { id: 'popular', label: 'Popular', icon: <Flame className="h-4 w-4" /> },
            { id: 'following', label: 'Following', icon: <Users className="h-4 w-4" /> },
            { id: 'recommended', label: 'Recommended', icon: <Zap className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabPosts[activeTab as keyof typeof tabPosts]?.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <Link href={`/posts/${post.id}`} className="block">
              {post.image_url && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/400/1a1a2e/ffffff?text=${encodeURIComponent(post.title)}`
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getPostTags(post).map((tag) => (
                    <PostTag key={tag} type={tag} />
                  ))}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {stripHtml(post.content)}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{post.author_name || `user_${post.wallet_address?.slice(0, 6)}`}</span>
                  <div className="flex items-center space-x-2">
                    {post.likes_count > 0 && (
                      <span className="flex items-center">
                        <span className="text-red-500">♥</span>
                        <span className="ml-1">{post.likes_count}</span>
                      </span>
                    )}
                    {post.comments_count > 0 && (
                      <span className="flex items-center">
                        <span className="text-gray-500">💬</span>
                        <span className="ml-1">{post.comments_count}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tabPosts[activeTab as keyof typeof tabPosts]?.length === 0 && (
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
      )}
    </div>
  )
}