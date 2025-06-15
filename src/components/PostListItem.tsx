import { FaShare } from 'react-icons/fa'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
}

interface PostListItemProps {
  post: Post
}

export default function PostListItem({ post }: PostListItemProps) {
  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = post.content.split(/\s+/).length
  const readTime = Math.ceil(wordCount / 200)

  // Generate a simple gradient background based on the post ID
  const gradientColors = [
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-pink-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-blue-500'
  ]
  const colorIndex = parseInt(post.id.slice(0, 8), 16) % gradientColors.length
  const gradientClass = gradientColors[colorIndex]

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/posts/${post.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
        {/* Generated Image */}
        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-xl`}>
          YZ
        </div>

        {/* Post Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {readTime} min read
            </span>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
        >
          <FaShare className="w-5 h-5" />
        </button>
      </div>
    </Link>
  )
} 