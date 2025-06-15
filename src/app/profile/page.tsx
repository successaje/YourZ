'use client'

import { useAccount } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PlaceholderAvatar } from '@/components/PlaceholderAvatar'
import { FaTwitter, FaGithub, FaDiscord, FaMedium, FaLink, FaTelegram, FaInstagram, FaNewspaper, FaEdit, FaHeart, FaUsers, FaBookmark, FaShare, FaClock } from 'react-icons/fa'
import { SiMirror } from 'react-icons/si'
import { toast } from 'react-hot-toast'
import EditProfileModal from '@/components/EditProfileModal'
import ZoraIntegration from '@/components/ZoraIntegration'
import CreatePost from '@/components/CreatePost'
import { Toaster } from 'react-hot-toast'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import PostListItem from '@/components/PostListItem'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  id: string
  address: string
  username: string
  ipfs_hash: string
  created_at: string
  bio: string | null
  level: number
  social_links: Record<string, string>
  email: string
  updated_at: string
  user_stats: any[]
  posts: any[]
}

interface Post {
  id: string
  title: string
  content: string
  created_at: string
}

export default function ProfilePage() {
  const { address: connectedAddress, isConnected } = useAccount()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get address from URL parameters
  const address = searchParams.get('address')
  
  // Debug logs
  console.log('URL address:', address)
  console.log('Connected address:', connectedAddress)
  console.log('User data:', user)

  const isOwnProfile = connectedAddress?.toLowerCase() === address?.toLowerCase()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!connectedAddress || !user || isOwnProfile) return
      try {
        const response = await fetch(`/api/users/follow/status?followerAddress=${connectedAddress}&followedAddress=${user.address}`)
        if (response.ok) {
          const data = await response.json()
          setIsFollowing(data.isFollowing)
        }
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }
    checkFollowStatus()
  }, [connectedAddress, user, isOwnProfile])

  const handleFollow = async () => {
    if (!connectedAddress || !user || isOwnProfile) return
    setIsFollowLoading(true)
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerAddress: connectedAddress, followedAddress: user.address })
      })
      if (response.ok) {
        setIsFollowing(!isFollowing)
      }
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleSaveProfile = async (data: any) => {
    if (!connectedAddress) return
    try {
      console.log('Sending profile update request:', { address: connectedAddress, data })
      const response = await fetch('/api/users/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: connectedAddress, ...data })
      })

      const responseData = await response.json()
      console.log('Profile update response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Failed to update profile')
      }

      setUser(responseData)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
      throw error
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) {
        setError('No address provided')
        setIsLoading(false)
        return
      }

      try {
        // Fetch user data with stats and posts
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            *,
            user_stats!user_stats_address_fkey (
              id,
              posts_count,
              collections_count,
              nfts_count,
              total_likes
            ),
            posts:posts!posts_address_fkey (
              id,
              title,
              content,
              metadata,
              status,
              is_nft,
              created_at,
              updated_at
            )
          `)
          .eq('address', address.toLowerCase())
          .single()

        if (userError) {
          console.error('Error fetching user:', userError)
          throw userError
        }

        if (!userData) {
          console.log('No user data found for address:', address)
          setError('User not found')
          setIsLoading(false)
          return
        }

        console.log('User data found:', userData)
        setUser(userData)
        setPosts(userData.posts || [])
      } catch (err) {
        console.error('Error in fetchUserData:', err)
        setError('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [address])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">The requested profile could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Banner Section */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <PlaceholderAvatar
                address={user.address}
                name={user.username}
                size={80}
                className="rounded-full ring-4 ring-white dark:ring-gray-800"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.username}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </p>
                {user.bio && (
                  <p className="text-gray-600 dark:text-gray-300 mt-4">
                    {user.bio}
                  </p>
                )}
                {/* Followers and Following */}
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <FaUsers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">0</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">0</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {/* User Stats */}
          {user.user_stats && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.user_stats.posts_count || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.user_stats.collections_count || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Collections</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.user_stats.nfts_count || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">NFTs</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.user_stats.total_likes || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
              </div>
            </div>
          )}

          {/* Social Links */}
          {user.social_links && Object.keys(user.social_links).length > 0 && (
            <div className="mt-6 flex gap-4">
              {user.social_links.twitter && (
                <a
                  href={user.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <FaTwitter className="w-5 h-5" />
                </a>
              )}
              {user.social_links.github && (
                <a
                  href={user.social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
              )}
              {/* Add other social links similarly */}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`${
                    activeTab === 'posts'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`${
                    activeTab === 'collections'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Collections
                </button>
              </nav>
              {isOwnProfile && activeTab === 'posts' && (
                <Link href="/write">
                  <button
                    className="inline-flex items-center px-4 py-2 text-sm font-bold text-gray-900 dark:text-white bg-primary hover:bg-primary/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm [text-shadow:_0_1px_1px_rgba(255,255,255,0.8)] dark:[text-shadow:_0_1px_1px_rgba(0,0,0,0.4)]"
                  >
                    <FaNewspaper className="w-4 h-4 mr-2" />
                    Create Post
                  </button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {!user.posts || user.posts.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile
                        ? "You haven't created any posts yet. Start sharing your thoughts!"
                        : "This user hasn't created any posts yet."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {user.posts.map((post: any) => (
                      <div 
                        key={post.id}
                        className="py-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <Link href={`/posts/${post.id}`} className="block">
                          <div className="px-4">
                            {/* Header with profile and metadata */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <PlaceholderAvatar
                                  address={user.address}
                                  name={user.username}
                                  size={40}
                                  className="rounded-full"
                                />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {user.username}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(post.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {post.is_nft && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                    <FaBookmark className="w-4 h-4 mr-1" />
                                    NFT
                                  </span>
                                )}
                                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center">
                                    <FaShare className="w-4 h-4 mr-1" />
                                    Share
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Main content */}
                            <div className="flex gap-6">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                  {post.title}
                                </h3>
                                <div 
                                  className="text-gray-600 dark:text-gray-300 line-clamp-3 prose dark:prose-invert max-w-none mb-4"
                                  dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <FaNewspaper className="w-4 h-4" />
                                    {post.status === 'published' ? 'Published' : 'Draft'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FaClock className="w-4 h-4" />
                                    {new Date(post.updated_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-4">
                                {post.metadata?.cover_image && (
                                  <div className="flex-shrink-0 w-32 h-32 relative">
                                    <img
                                      src={post.metadata.cover_image}
                                      alt={post.title}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end justify-center p-2">
                                      <span className="text-white text-sm font-medium">YourZ</span>
                                    </div>
                                  </div>
                                )}
                                <div className="flex-shrink-0 w-32 h-32 relative bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-lg p-4 flex flex-col items-center justify-center text-center border border-primary/20 shadow-sm">
                                  <div className="text-2xl font-bold text-primary mb-2">YourZ</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Write, Mint & Earn
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <EditProfileModal
            isOpen={isEditing}
            profile={user}
            onClose={() => setIsEditing(false)}
            onSave={handleSaveProfile}
          />
        )}

        <Toaster position="bottom-right" />
      </div>
    </div>
  )
} 