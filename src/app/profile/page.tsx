'use client'

import { useUserProfile } from '@/hooks/useUserProfile'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PlaceholderAvatar } from '@/components/PlaceholderAvatar'
import { FaTwitter, FaGithub, FaDiscord, FaMedium, FaLink, FaTelegram, FaInstagram, FaNewspaper, FaEdit } from 'react-icons/fa'
import { SiMirror } from 'react-icons/si'
import { toast } from 'react-hot-toast'
import EditProfileModal from '@/components/EditProfileModal'
import { motion } from 'framer-motion'
import ZoraIntegration from '@/components/ZoraIntegration'
import CreatePost from '@/components/CreatePost'
import { Toaster } from 'react-hot-toast'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { profile, isLoading, error, setProfile } = useUserProfile(address)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  
  // Debug logs
  console.log('Current address:', address)
  console.log('Profile data:', profile)

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

  const handleSaveProfile = async (data: any) => {
    if (!address) return
    try {
      console.log('Sending profile update request:', { address, data })
      const response = await fetch('/api/users/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, ...data })
      })

      const responseData = await response.json()
      console.log('Profile update response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Failed to update profile')
      }

      setProfile(responseData)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
      throw error
    }
  }

  if (!isConnected) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please try again later</p>
            <button
              onClick={migrateUserData}
              disabled={isMigrating}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isMigrating ? 'Migrating...' : 'Migrate User Data'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          {/* Banner */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black/20"></div>
            <motion.div 
              className="absolute inset-0"
              animate={{ 
                background: [
                  'linear-gradient(45deg, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 100%)',
                  'linear-gradient(45deg, rgba(147, 51, 234, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)'
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>

          {/* Profile Content */}
          <div className="relative px-6 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative -mt-20 sm:-mt-24">
                <div className="relative">
                  <PlaceholderAvatar
                    address={address}
                    name={profile?.username || 'Anonymous'}
                    size={160}
                    className="border-4 border-white dark:border-gray-800 rounded-full shadow-lg"
                  />
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 text-primary border-2 border-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all duration-200 shadow-lg"
                    title="Edit Profile"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {profile?.username || 'Anonymous'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {profile?.address?.slice(0, 6)}...{profile?.address?.slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isOwnProfile ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Edit Profile
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {/* TODO: Add write post handler */}}
                          className="px-4 py-2 text-sm font-medium text-black dark:text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Start Writing
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                          isFollowing
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {profile?.bio && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 max-w-2xl"
                  >
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  </motion.div>
                )}

                {/* Quick Actions */}
                {isOwnProfile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 flex flex-wrap gap-3"
                  >
                    <ZoraIntegration />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {/* TODO: Add create collection handler */}}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Create Collection
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {/* TODO: Add share profile handler */}}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Share Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {/* TODO: Add invite friends handler */}}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Invite Friends
                    </motion.button>
                  </motion.div>
                )}

                {/* Social Links */}
                {profile?.social_links && Object.values(profile.social_links).some(link => link) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 flex flex-wrap gap-3"
                  >
                    {profile.social_links.twitter && (
                      <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <FaTwitter className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.github && (
                      <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <FaGithub className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.discord && (
                      <a href={profile.social_links.discord} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <FaDiscord className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.medium && (
                      <a href={profile.social_links.medium} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <FaMedium className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.telegram && (
                      <a href={profile.social_links.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <FaTelegram className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.instagram && (
                      <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <FaInstagram className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.website && (
                      <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <FaLink className="w-5 h-5" />
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-8 mb-8"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">{profile?.stats?.posts_count || 0}</span>
            <span className="text-gray-500 dark:text-gray-400">Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">{profile?.followers_count || 0}</span>
            <span className="text-gray-500 dark:text-gray-400">Followers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">{profile?.following_count || 0}</span>
            <span className="text-gray-500 dark:text-gray-400">Following</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">{profile?.stats?.total_likes || 0}</span>
            <span className="text-gray-500 dark:text-gray-400">Likes</span>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800">
            {['posts', 'collections', 'activities', 'drafts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {isOwnProfile && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsCreatingPost(true)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Post
                    </button>
                  </div>
                )}
                
                {profile?.posts?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile
                        ? "You haven't created any posts yet. Start sharing your thoughts!"
                        : "This user hasn't created any posts yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Post cards will go here */}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <EditProfileModal
            profile={profile}
            onClose={() => setIsEditing(false)}
            onUpdate={setProfile}
          />
        )}

        {/* Create Post Modal */}
        {isCreatingPost && (
          <CreatePost
            onSuccess={() => {
              setIsCreatingPost(false)
              // Refresh posts
            }}
          />
        )}

        <Toaster position="bottom-right" />
      </div>
    </motion.div>
  )
} 