import { Star, Clock, Flame, TrendingUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define tag types and their configurations
export type PostTagType = 'featured' | 'new' | 'trending' | 'popular' | 'recommended'

const tagConfig: Record<PostTagType, {
  icon: React.ReactNode
  text: string
  bg: string
  textClass: string
  iconClass: string
}> = {
  featured: {
    icon: <Star className="w-3 h-3" />,
    text: 'Featured',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-800 dark:text-yellow-200',
    iconClass: 'text-yellow-600 dark:text-yellow-300',
  },
  new: {
    icon: <Clock className="w-3 h-3" />,
    text: 'New',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-800 dark:text-blue-200',
    iconClass: 'text-blue-600 dark:text-blue-300',
  },
  trending: {
    icon: <Flame className="w-3 h-3" />,
    text: 'Trending',
    bg: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-800 dark:text-red-200',
    iconClass: 'text-red-600 dark:text-red-300',
  },
  popular: {
    icon: <TrendingUp className="w-3 h-3" />,
    text: 'Popular',
    bg: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-800 dark:text-green-200',
    iconClass: 'text-green-600 dark:text-green-300',
  },
  recommended: {
    icon: <Zap className="w-3 h-3" />,
    text: 'Recommended',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-800 dark:text-purple-200',
    iconClass: 'text-purple-600 dark:text-purple-300',
  },
}

export function PostTag({
  type,
  className = '',
}: {
  type: PostTagType
  className?: string
}) {
  const config = tagConfig[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
        config.bg,
        config.textClass,
        className
      )}
    >
      <span className={config.iconClass}>{config.icon}</span>
      {config.text}
    </span>
  )
}

// Helper to determine post tags based on post data
export const getPostTags = (post: {
  created_at: string
  likes_count: number
  views_count: number
  is_nft?: boolean
  is_featured?: boolean
}): PostTagType[] => {
  const tags: PostTagType[] = []
  const now = new Date()
  const postDate = new Date(post.created_at)
  const daysOld = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))

  // Add featured tag if explicitly marked as featured
  if (post.is_featured) {
    tags.push('featured')
  }

  // Add new tag if post is less than 3 days old
  if (daysOld <= 3) {
    tags.push('new')
  }

  // Add trending tag if post has high views in last week
  if (post.views_count > 100 && daysOld <= 7) {
    tags.push('trending')
  }

  // Add popular tag if post has many likes
  if (post.likes_count > 50) {
    tags.push('popular')
  }

  // Add recommended tag if it's an NFT
  if (post.is_nft) {
    tags.push('recommended')
  }

  return tags
}
