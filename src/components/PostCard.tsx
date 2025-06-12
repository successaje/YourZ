import Link from 'next/link'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/post/${post.id}`} className="block">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6 hover:shadow-md transition-shadow duration-200">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {post.author.name}
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.likes} likes
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.comments} comments
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
} 