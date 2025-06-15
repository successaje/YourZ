import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { PlaceholderAvatar } from './PlaceholderAvatar'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Comment {
  id: string
  content: string
  created_at: string
  user_address: string
  author_name?: string
}

interface CommentsProps {
  postId: string
  currentUserAddress?: string
}

export default function Comments({ postId, currentUserAddress }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch author names for each comment
      const commentsWithAuthors = await Promise.all(
        data.map(async (comment) => {
          const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('address', comment.user_address)
            .single()

          return {
            ...comment,
            author_name: userData?.name
          }
        })
      )

      setComments(commentsWithAuthors)
    } catch (err) {
      console.error('Error fetching comments:', err)
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUserAddress) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_address: currentUserAddress,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      toast.success('Comment added!')
      fetchComments() // Refresh comments
    } catch (err) {
      console.error('Error adding comment:', err)
      toast.error('Failed to add comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserAddress) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_address', currentUserAddress)

      if (error) throw error

      toast.success('Comment deleted!')
      fetchComments() // Refresh comments
    } catch (err) {
      console.error('Error deleting comment:', err)
      toast.error('Failed to delete comment')
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Comments
      </h2>

      {/* Comment Form */}
      {currentUserAddress && (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4">
            <PlaceholderAvatar
              address={currentUserAddress}
              size={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Link href={`/profile?address=${comment.user_address}`}>
              <PlaceholderAvatar
                address={comment.user_address}
                name={comment.author_name}
                size={40}
                className="rounded-full"
              />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/profile?address=${comment.user_address}`}
                  className="font-medium text-gray-900 dark:text-white hover:underline"
                >
                  {comment.author_name || 'Anonymous'}
                </Link>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              {currentUserAddress === comment.user_address && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="mt-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 