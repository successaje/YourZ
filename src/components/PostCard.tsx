import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useState } from 'react'

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
  wallet_address?: string
  likes_count?: number
  is_liked?: boolean
  is_bookmarked?: boolean
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  // Safely handle potentially undefined post or its properties
  const [isLiked, setIsLiked] = useState(post?.is_liked ?? false)
  const [isBookmarked, setIsBookmarked] = useState(post?.is_bookmarked ?? false)
  const [likeCount, setLikeCount] = useState(post?.likes_count ?? 0)
  
  // If post is not defined, return null or a loading state
  if (!post) {
    return <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse h-48" />
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: post.id,
          user_address: post.wallet_address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      const newLikeState = !isLiked
      setIsLiked(newLikeState)
      setLikeCount(prev => newLikeState ? prev + 1 : Math.max(0, prev - 1))
      
      toast.success(newLikeState ? 'Post liked!' : 'Like removed')
    } catch (err) {
      console.error('Error toggling like:', err)
      toast.error('Failed to update like')
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .upsert({
          post_id: post.id,
          user_address: post.wallet_address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      const newBookmarkState = !isBookmarked
      setIsBookmarked(newBookmarkState)
      toast.success(newBookmarkState ? 'Post bookmarked!' : 'Bookmark removed')
    } catch (err) {
      console.error('Error toggling bookmark:', err)
      toast.error('Failed to update bookmark')
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/posts/${post.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  // Generate a gradient based on post ID for consistent colors
  const gradientColors = [
    'from-blue-500 to-purple-600',
    'from-pink-500 to-rose-500',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-500',
    'from-violet-500 to-fuchsia-600'
  ]
  const gradient = gradientColors[parseInt(post.id) % gradientColors.length]

  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-transparent">
        {/* Cover Image */}
        <div className={`h-48 bg-gradient-to-r ${gradient} dark:opacity-90 flex items-center justify-center`}>
          <span className="text-white text-5xl font-bold opacity-80">{post.title.charAt(0).toUpperCase()}</span>
        </div>
        
        {/* Post Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Link 
              href={`/profile?address=${post.wallet_address || post.address}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold`}>
                {post.author_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                by {post.author_name || 'Anonymous'}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {post.content}
          </p>
          
          {/* Tags */}
          {post.metadata?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.metadata.tags.slice(0, 3).map((tag: string) => (
                <span 
                  key={tag}
                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1.5 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {isLiked ? (
                  <FaHeart className="w-4 h-4" />
                ) : (
                  <FaRegHeart className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              <button 
                onClick={handleBookmark}
                className={`p-1.5 rounded-full ${isBookmarked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
              >
                {isBookmarked ? (
                  <FaBookmark className="w-4 h-4" />
                ) : (
                  <FaRegBookmark className="w-4 h-4" />
                )}
              </button>
            </div>
            <button 
              onClick={handleShare}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Share post"
            >
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}