'use client'

import { useAccount } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PlaceholderAvatar } from '@/components/PlaceholderAvatar'
import { FaTwitter, FaGithub, FaNewspaper, FaEdit, FaBookmark, FaHistory } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import EditProfileModal from '@/components/EditProfileModal'
import ZoraIntegration from '@/components/ZoraIntegration'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { WalletActivities } from '@/components/WalletActivities'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  user_stats: any
  posts: any[]
}

export default function ProfilePage() {
  const { address: connectedAddress, isConnected } = useAccount()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showZoraModal, setShowZoraModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const address = searchParams.get('address')
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
      const response = await fetch('/api/users/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: connectedAddress, ...data })
      })

      const responseData = await response.json()
      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Failed to update profile')
      }

      setUser(responseData)
      setShowEditModal(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
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

        if (userError) throw userError
        if (!userData) throw new Error('User not found')

        setUser(userData)
      } catch (err) {
        console.error('Error in fetchUserData:', err)
        setError('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [address])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested profile could not be loaded.</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner Section */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <PlaceholderAvatar
                address={user.address}
                name={user.username}
                size={120}
                className="-mt-20 border-4 border-white dark:border-gray-800"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {user.bio || 'No bio provided'}
                </p>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{user.user_stats?.posts_count || 0} Posts</span>
                  <span>{user.user_stats?.followers_count || 0} Followers</span>
                  <span>{user.user_stats?.following_count || 0} Following</span>
                </div>
              </div>
            </div>

            {isOwnProfile ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowZoraModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                  Create NFT
                </button>
              </div>
            ) : (
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto ${
                  isFollowing
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Social Links */}
          {(user.social_links?.twitter || user.social_links?.github) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                {user.social_links?.twitter && (
                  <a
                    href={`https://twitter.com/${user.social_links.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </a>
                )}
                {user.social_links?.github && (
                  <a
                    href={`https://github.com/${user.social_links.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <FaGithub className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <Tabs 
            defaultValue="posts" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger 
                value="posts" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md"
              >
                <FaNewspaper className="h-4 w-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="created" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md"
              >
                <FaEdit className="h-4 w-4" />
                <span className="hidden sm:inline">Created</span>
              </TabsTrigger>
              <TabsTrigger 
                value="collected" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md"
              >
                <FaBookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Collected</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md"
              >
                <FaHistory className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              {user.posts?.length > 0 ? (
                user.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                  <p className="text-gray-500 dark:text-gray-400">
                    {isOwnProfile 
                      ? "You haven't created any posts yet." 
                      : "This user hasn't created any posts yet."}
                  </p>
                  {isOwnProfile && (
                    <Link 
                      href="/write" 
                      className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create your first post
                    </Link>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="created">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Created Items
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  NFTs and collections created by {isOwnProfile ? 'you' : 'this user'} will appear here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="collected">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Collected Items
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  NFTs collected by {isOwnProfile ? 'you' : 'this user'} will appear here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <WalletActivities />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      <ZoraIntegration
        isOpen={showZoraModal}
        onClose={() => setShowZoraModal(false)}
      />
    </div>
  )
}
