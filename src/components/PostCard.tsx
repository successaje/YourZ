import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare } from 'react-icons/fa'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { PlaceholderAvatar } from './PlaceholderAvatar'

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
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking like
    e.stopPropagation() // Prevent event bubbling

    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: post.id,
          user_address: post.wallet_address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Post liked!')
    } catch (err) {
      console.error('Error liking post:', err)
      toast.error('Failed to like post')
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking bookmark
    e.stopPropagation() // Prevent event bubbling

    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .upsert({
          post_id: post.id,
          user_address: post.wallet_address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Post bookmarked!')
    } catch (err) {
      console.error('Error bookmarking post:', err)
      toast.error('Failed to bookmark post')
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking share
    e.stopPropagation() // Prevent event bubbling

    const url = `${window.location.origin}/posts/${post.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Post Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {post.title}
          </h2>
          <div className="flex items-center gap-3">
            <Link 
              href={`/profile?address=${post.wallet_address || post.address}`}
              onClick={(e) => e.stopPropagation()} // Prevent post navigation
              className="flex items-center gap-2"
            >
              <PlaceholderAvatar
                address={post.wallet_address || post.address}
                name={post.author_name}
                size={32}
                className="rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {post.author_name || 'Anonymous'}
              </span>
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Post Content Preview */}
        <div className="p-4">
          <div 
            className="text-gray-600 dark:text-gray-300 line-clamp-3 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Post Actions */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            >
              {post.is_liked ? (
                <FaHeart className="w-4 h-4 text-red-500" />
              ) : (
                <FaRegHeart className="w-4 h-4" />
              )}
              <span className="text-sm">{post.likes_count || 0}</span>
            </button>

            <button
              onClick={handleBookmark}
              className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
            >
              {post.is_bookmarked ? (
                <FaBookmark className="w-4 h-4 text-yellow-500" />
              ) : (
                <FaRegBookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleShare}
              className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            >
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
} 