'use client';

import { useAccount } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { PlaceholderAvatar } from '@/components/PlaceholderAvatar';
import Link from 'next/link';
import { 
  FaTwitter, FaGithub, FaDiscord, FaMedium, FaLink, 
  FaTelegram, FaInstagram, FaNewspaper, FaEdit, 
  FaHeart, FaUsers, FaBookmark, FaHistory, FaStar,
  FaFire, FaClock, FaChartLine, FaCopy, FaCheck, FaCoins,
  FaImage
} from 'react-icons/fa';
// Import the Tabs components from the correct path
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast, Toaster } from 'react-hot-toast';
import EditProfileModal from '@/components/EditProfileModal';
import { WalletActivities } from '../../components/WalletActivities';
import { useWalletActivities } from '@/hooks/useWalletActivities';
import { useUserCoins } from '@/hooks/useUserCoins';
import { useUserNFTs } from '@/hooks/useUserNFTs';
import CoinCard from '@/components/CoinCard';
import NFTCard from '@/components/NFTCard';

// Function to strip HTML tags from content
const stripHtml = (html: string) => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  return html.replace(/<[^>]*>?/gm, '');
};

import { createClient } from '@supabase/supabase-js';

// Define types
interface UserStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
  collections_count?: number;
  nfts_count?: number;
  total_likes?: number;
}

interface PostType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  type?: 'created' | 'collected' | 'shared';
  metadata: {
    image?: string;
    tags?: string[];
    [key: string]: unknown;
  };
  status: string;
  is_nft?: boolean;
  updated_at?: string;
  address?: string;
}

interface User {
  id: string;
  address: string;
  username: string;
  ipfs_hash: string;
  created_at: string;
  bio: string | null;
  level: number;
  social_links: Record<string, string>;
  email: string;
  updated_at: string;
  user_stats: UserStats[];
  posts: PostType[];
  activities?: Array<{
    id: string;
    type: string;
    timestamp: string;
    // Add other activity properties as needed
  }>;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper to decode method from input
const getMethod = (tx) => {
  if (!tx.input || tx.input === '0x') return 'Transfer';
  if (tx.to === '' || tx.to === null) return 'Contract Creation';
  // Common ERC20/721/1155 methods
  const sig = tx.input.slice(2, 10);
  switch (sig) {
    case 'a9059cbb': return 'Transfer'; // transfer(address,uint256)
    case '095ea7b3': return 'Approve'; // approve(address,uint256)
    case '23b872dd': return 'TransferFrom'; // transferFrom(address,address,uint256)
    case '42842e0e': return 'SafeTransferFrom'; // safeTransferFrom(address,address,uint256)
    case 'f242432a': return 'SafeTransferFrom1155'; // safeTransferFrom(address,address,uint256,uint256,bytes)
    default: return 'Method: 0x' + sig;
  }
};

// Helper to truncate and copy
const Copyable = ({ text, truncate = 6 }) => {
  const [copied, setCopied] = useState(false);
  const short = text.length > 2 * truncate ? `${text.slice(0, truncate)}...${text.slice(-truncate)}` : text;
  
  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };
  
  return (
    <span className="inline-flex items-center gap-1 cursor-pointer group" onClick={handleCopy}>
      <span className="font-mono text-xs group-hover:underline">{short}</span>
      {copied ? <FaCheck className="text-green-500 w-3 h-3" /> : <FaCopy className="text-gray-400 w-3 h-3 group-hover:text-blue-500" />}
    </span>
  );
};

// List-style PostCard for profile page
const PostCard = ({ post }: { post: PostType }) => {
  const getTypeColor = (type?: string) => {
    switch(type) {
      case 'created': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'collected': return 'bg-gradient-to-r from-cyan-400 to-blue-500';
      case 'shared': return 'bg-gradient-to-r from-green-400 to-teal-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };
  const getTypeBadgeColor = (type?: string) => {
    switch(type) {
      case 'created': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'collected': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'shared': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  const getRandomTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-200 dark:border-purple-800',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200 border-pink-200 dark:border-pink-800',
      'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border-rose-200 dark:border-rose-800',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border-orange-200 dark:border-orange-800',
      'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-800',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
      'bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-200 border-lime-200 dark:border-lime-800',
      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800',
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
      'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border-teal-200 dark:border-teal-800',
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800',
      'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 border-sky-200 dark:border-sky-800',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
      'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border-violet-200 dark:border-violet-800',
      'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-200 border-fuchsia-200 dark:border-fuchsia-800',
    ];
    return colors[index % colors.length];
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-opacity-5 hover:bg-white hover:shadow-lg dark:hover:bg-opacity-10 dark:hover:bg-black border border-gray-100 dark:border-gray-800/50 hover:border-opacity-50">
        {/* Gradient accent */}
        <div className={`absolute left-0 top-0 h-full w-1.5 ${getTypeColor(post.type)} rounded-l-lg`}></div>
        {/* Post content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getTypeBadgeColor(post.type)}`}>{post.type ? post.type.charAt(0).toUpperCase() + post.type.slice(1) : 'Post'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline mr-1 -mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(post.created_at)}
            </span>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent truncate">{post.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">{stripHtml(post.content || '')}</p>
          {Array.isArray(post.metadata?.tags) && post.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.metadata.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={`text-xs px-2.5 py-1 rounded-full border ${getRandomTagColor(index)} font-medium`}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
        {/* Action button */}
        <button className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-md hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Link>
  );
};

// Loading component for Suspense fallback
const ProfileLoading = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  </div>
);

// Main profile component that uses useSearchParams
function ProfileContent() {
  const { address: connectedAddress, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  
  // Derived state
  const address = searchParams?.get('address') || connectedAddress;
  const isOwnProfile = address === connectedAddress;
  
  // Memoized filtered posts for each tab
  const filteredPosts = useMemo(() => {
    if (!user?.posts) return { posts: [], created: [], collected: [], activity: [] };

    // Add debug logging
    if (typeof window !== 'undefined') {
      console.log('user.posts', user.posts);
    }

    // Only assign type if it exists, otherwise leave undefined
    const allPosts = user.posts.map(post => ({
      ...post,
      // Do not default to 'created' if missing
    }));

    const created = allPosts.filter(post => post.type === 'created');
    const collected = allPosts.filter(post => post.type === 'collected');
    const activity = allPosts.filter(post => post.type === 'shared');

    // Add debug logging
    if (typeof window !== 'undefined') {
      console.log('filteredPosts', {
        posts: allPosts,
        created,
        collected,
        activity
      });
    }

    return {
      posts: allPosts,
      created,
      collected,
      activity
    };
  }, [user?.posts]);

  const userStats = useMemo(() => {
    if (!user?.user_stats || user.user_stats.length === 0) {
      return {
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    collections_count: 0,
    nfts_count: 0,
    total_likes: 0
  };
    }
    return user.user_stats[0];
  }, [user?.user_stats]);

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!address || !connectedAddress || address === connectedAddress) return;
      
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_address', connectedAddress.toLowerCase())
          .eq('following_address', address.toLowerCase())
          .single();
        
        if (!error && data) {
          setIsFollowing(true);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [address, connectedAddress]);

  const handleFollow = async () => {
    if (!connectedAddress || !address) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_address', connectedAddress.toLowerCase())
          .eq('following_address', address.toLowerCase());
        
        if (!error) {
          setIsFollowing(false);
          toast.success('Unfollowed successfully');
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_address: connectedAddress.toLowerCase(),
            following_address: address.toLowerCase(),
            created_at: new Date().toISOString()
          });
        
        if (!error) {
          setIsFollowing(true);
          toast.success('Followed successfully');
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to follow/unfollow');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleSaveProfile = async (data: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: data.username,
          bio: data.bio,
          social_links: data.social_links,
          updated_at: new Date().toISOString()
        })
        .eq('address', user.address);
      
      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, ...data } : null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Fetch user data
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

  // Handle tab change with loading state
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setTabLoading(true);
    // Simulate loading for better UX
    setTimeout(() => setTabLoading(false), 300);
  };

  // Use the wallet activities hook for the activity tab
  const { activities, loading: activityLoading, error: activityError } = useWalletActivities(
    activeTab === 'activity' ? (searchParams?.get('address') || connectedAddress) : undefined
  );

  // Use the user coins hook for the coins tab
  const userCoins = useUserCoins(
    activeTab === 'coins' ? (searchParams?.get('address') || connectedAddress) : undefined
  );

  // Use the user NFTs hook for the nfts tab
  const userNFTs = useUserNFTs(
    activeTab === 'nfts' ? (searchParams?.get('address') || connectedAddress) : undefined
  );

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
                      <span className="font-medium text-gray-900 dark:text-white">{userStats.followers_count}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{userStats.following_count}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isFollowLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <FaHeart className="w-4 h-4 mr-2" />
                  )}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
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
          </div>

          {/* User Stats */}
          <div className="mt-6 grid grid-cols-5 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats.posts_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats.followers_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userStats.following_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userCoins.coins?.length || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Coins</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userNFTs.nfts?.length || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">NFTs</div>
            </div>
            </div>
          
          <div className="mt-8">
            <div>
              <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange} 
                className="w-full transition-all duration-300 ease-in-out"
              >
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg transition-colors duration-300">
                  {[
                    { key: 'posts', label: 'Posts', icon: FaNewspaper, count: filteredPosts.posts.length },
                    { key: 'coins', label: 'Coins', icon: FaCoins, count: userCoins?.coins?.length || 0 },
                    { key: 'nfts', label: 'NFTs', icon: FaImage, count: userNFTs?.nfts?.length || 0 },
                    { key: 'activity', label: 'Activity', icon: FaHistory, count: filteredPosts.activity.length }
                  ].map(({ key, label, icon: Icon, count }) => (
                    <TabsTrigger 
                      key={key}
                      value={key}
                      className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-300 ease-in-out
                        data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 
                        data-[state=active]:shadow-lg data-[state=active]:text-purple-600 
                        data-[state=active]:dark:text-purple-400 font-medium text-gray-500 
                        dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                        overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="h-4 w-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
                        <span className="transition-all duration-300 group-data-[state=active]:font-semibold">
                          {label}
                        </span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </span>
                      {/* Active indicator */}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent 
                  value="posts" 
                  className="relative mt-6 overflow-hidden transition-all duration-300 ease-in-out"
                >
                  {tabLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800 animate-fadeIn">
                      {filteredPosts.posts.length > 0 ? (
                        filteredPosts.posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <FaNewspaper className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No posts yet</h3>
                        <p className="mt-1">When you create posts, they'll appear here</p>
                      </div>
                    )}
                  </div>
                  )}
                </TabsContent>
                
                <TabsContent 
                  value="coins"
                  className="relative mt-6 overflow-hidden transition-all duration-300 ease-in-out"
                >
                  {userCoins.loading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : userCoins.error ? (
                    <div className="text-center py-12 text-red-500">{userCoins.error}</div>
                  ) : userCoins.coins && userCoins.coins.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 animate-fadeIn">
                      {userCoins.coins.map((coin) => (
                        <CoinCard key={coin.id} coin={coin} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <FaCoins className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No coins created</h3>
                      <p className="mt-1">When you create posts with coins, they'll appear here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent 
                  value="nfts"
                  className="relative mt-6 overflow-hidden transition-all duration-300 ease-in-out"
                >
                  {userNFTs.loading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : userNFTs.error ? (
                    <div className="text-center py-12 text-red-500">{userNFTs.error}</div>
                  ) : userNFTs.nfts && userNFTs.nfts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 animate-fadeIn">
                      {userNFTs.nfts.map((nft) => (
                        <NFTCard key={nft.id} nft={nft} />
                      ))}
                    </div>
                  ) : (
                                          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <FaImage className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No NFTs created</h3>
                      <p className="mt-1">When you create posts with NFTs, they'll appear here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent 
                  value="activity"
                  className="relative mt-6 overflow-hidden transition-all duration-300 ease-in-out"
                >
                  {activityLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : activityError ? (
                    <div className="text-center py-12 text-red-500">{activityError}</div>
                  ) : activities.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                      {activities.map((tx) => {
                        const method = getMethod(tx);
                        const isIncoming = tx.to?.toLowerCase() === (searchParams?.get('address') || connectedAddress)?.toLowerCase();
                        return (
                          <div
                            key={tx.hash}
                            className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col gap-2"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${
                                method === 'Transfer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' :
                                method === 'Approve' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                                method === 'Contract Creation' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                                'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                              }`}>{method}</span>
                              <span className="ml-auto text-xs text-gray-400">{new Date(Number(tx.timeStamp) * 1000).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">Hash:</span>
                              <Copyable text={tx.hash} truncate={8} />
                                </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">From:</span>
                              <Copyable text={tx.from} />
                              </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">To:</span>
                              <Copyable text={tx.to} />
                              </div>
                            <div className="flex items-center gap-2 text-xs mt-2">
                              <span className="text-gray-500">Value:</span>
                              <span className={`font-bold text-base ${isIncoming ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{Number(tx.value) / 1e18} ETH</span>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <FaHistory className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No transactions found</h3>
                      <p className="mt-1">Your recent transactions will appear here</p>
                      </div>
                    )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Edit Profile Modal */}
          {isEditing && user && (
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
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}