'use client'

import { useUserProfile } from '@/hooks/useUserProfile'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import { FaTwitter, FaGithub, FaDiscord, FaMedium, FaLink, FaTelegram, FaInstagram, FaNewspaper } from 'react-icons/fa'
import { SiMirror } from 'react-icons/si'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { profile, isLoading, error } = useUserProfile(address)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  
  // Debug logs
  useEffect(() => {
    console.log('Current address:', address)
    console.log('Profile address:', profile?.address)
    console.log('Is own profile:', address?.toLowerCase() === profile?.address?.toLowerCase())
  }, [address, profile])

  const isOwnProfile = address?.toLowerCase() === profile?.address?.toLowerCase()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!address || !profile || isOwnProfile) return
      try {
        const response = await fetch(`/api/users/follow/status?followerAddress=${address}&followedAddress=${profile.address}`)
        if (response.ok) {
          const data = await response.json()
          setIsFollowing(data.isFollowing)
        }
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }
    checkFollowStatus()
  }, [address, profile, isOwnProfile])

  const handleFollow = async () => {
    if (!address || !profile || isOwnProfile) return
    setIsFollowLoading(true)
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerAddress: address, followedAddress: profile.address })
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

  // Add migration function
  const migrateUserData = async () => {
    if (!address) return
    
    setIsMigrating(true)
    try {
      const response = await fetch('/api/users/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG' // Replace with your actual IPFS hash
        }),
      })

      if (!response.ok) {
        throw new Error('Migration failed')
      }

      // Refresh the page to load the new data
      window.location.reload()
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Failed to migrate user data')
    } finally {
      setIsMigrating(false)
    }
  }

  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
          <button
            onClick={migrateUserData}
            disabled={isMigrating}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isMigrating ? 'Migrating...' : 'Migrate User Data'}
          </button>
        </div>
      </div>
    )
  }

  // Debug log before render
  console.log('Rendering with isOwnProfile:', isOwnProfile)

  const socialLinks = profile.social_links || {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="relative -mt-24 mb-8">
          <div className="flex items-end space-x-4">
            <div className="relative">
              <PlaceholderAvatar name={profile.username} size={128} />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                <div className="h-6 w-6 flex items-center justify-center text-white text-xs font-bold">
                  {profile.level}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
                  <p className="text-gray-600 dark:text-gray-400">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                {!isOwnProfile && address && (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              {profile.bio && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">{profile.bio}</p>
              )}
              {/* Follow Stats */}
              <div className="mt-4 flex space-x-6">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.followers_count || 0}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.following_count || 0}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Following</span>
                </div>
              </div>
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="mt-4 flex space-x-4">
                  {profile.social_links.twitter && (
                    <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200">
                      <FaTwitter className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links.discord && (
                    <a href={profile.social_links.discord} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-200">
                      <FaDiscord className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links.telegram && (
                    <a href={profile.social_links.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      <FaTelegram className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links.github && (
                    <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors duration-200">
                      <FaGithub className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links.medium && (
                    <a href={profile.social_links.medium} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors duration-200">
                      <FaMedium className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links.instagram && (
                    <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors duration-200">
                      <FaInstagram className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links.mirror && (
                    <a href={profile.social_links.mirror} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors duration-200">
                      <FaNewspaper className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links.website && (
                    <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200">
                      <FaLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.posts_count || 0}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Collections</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.collections_count || 0}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">NFTs</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.nfts_count || 0}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats?.total_likes || 0}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button className="border-blue-500 text-blue-600 dark:text-blue-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Posts
            </button>
            <button className="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Collections
            </button>
            <button className="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              NFTs
            </button>
            <button className="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Likes
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
        </div>
      </div>
    </div>
  )
} 