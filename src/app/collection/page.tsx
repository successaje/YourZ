'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Collection, CollectionFilters } from '@/types/collection';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

// Mock data - replace with actual API call
const mockCollections: Collection[] = [
  {
    id: 'crypto-punks',
    name: 'CryptoPunks',
    description: '10,000 uniquely generated characters. The first NFT on Ethereum.',
    imageUrl: 'https://lh3.googleusercontent.com/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7PWkFXL_zlJmFp8gfa51YpWHB2mabVJUTLcZR9XQFrpZFX6sJ3tnFQKjBBj5-0dhqVw=s0',
    bannerImageUrl: 'https://lh3.googleusercontent.com/48oVuDyfe_xhsIzBCoQQygAx52pqAPgq6TnclbCjmOxfT7HPCPmNbWjG4l-k4IHKb4Dp3iJbfpwEDHEMB449SAsOPaKBpkk7Wx3OMQ=s0',
    owner: {
      address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
      name: 'Larva Labs',
      avatar: 'https://i.seadn.io/gae/yImMWG0jWrltljz9wzjbveInafecFFoIXrkUUrhNAd7ArOysXEAZYGJjDfEr24hG-s0VEns3W0kCz2aamwrwIJ7YyEmdzMWp3jqNxQ?auto=format&w=128'
    },
    stats: {
      totalItems: 10000,
      totalOwners: 3500,
      floorPrice: 65.5,
      volumeTraded: 2500000
    },
    createdAt: '2017-06-23T00:00:00Z',
    category: 'PFP',
    isVerified: true
  },
  // Add more mock collections as needed
  {
    id: 'bored-ape-yacht-club',
    name: 'Bored Ape Yacht Club',
    description: '10,000 unique Bored Ape NFTs living on the Ethereum blockchain.',
    imageUrl: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xHIgjJJtWM46aHmgxKrIX7UTyxP69Vj6dZvu=s0',
    bannerImageUrl: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOgbdkqr74CK1VlMtFwG58IwpotxrUhMfIk2vSPlFlcE1cafBY4rnWU18jiA022aL3hhdgQxZjJZE8JATcR8Jw=s0',
    owner: {
      address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      name: 'Yuga Labs',
      avatar: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOgbdkqr74CK1VlMtFwG58IwpotxrUhMfIk2vSPlFlcE1cafBY4rnWU18jiA022aL3hhdgQxZjJZE8JATcR8Jw?auto=format&w=128'
    },
    stats: {
      totalItems: 10000,
      totalOwners: 6400,
      floorPrice: 42.8,
      volumeTraded: 1800000
    },
    createdAt: '2021-04-30T00:00:00Z',
    category: 'PFP',
    isVerified: true
  },
  {
    id: 'doodles',
    name: 'Doodles',
    description: 'A community-driven collectibles project featuring art by Burnt Toast.',
    imageUrl: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOgbdkqr74CK1VlMtFwG58IwpotxrUhMfIk2vSPlFlcE1cafBY4rnWU18jiA022aL3hhdgQxZjJZE8JATcR8Jw?auto=format&w=128',
    bannerImageUrl: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOgbdkqr74CK1VlMtFwG58IwpotxrUhMfIk2vSPlFlcE1cafBY4rnWU18jiA022aL3hhdgQxZjJZE8JATcR8Jw?auto=format&w=2000',
    owner: {
      address: '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e',
      name: 'Doodles',
      avatar: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOgbdkqr74CK1VlMtFwG58IwpotxrUhMfIk2vSPlFlcE1cafBY4rnWU18jiA022aL3hhdgQxZjJZE8JATcR8Jw?auto=format&w=128'
    },
    stats: {
      totalItems: 10000,
      totalOwners: 5200,
      floorPrice: 15.2,
      volumeTraded: 980000
    },
    createdAt: '2021-10-17T00:00:00Z',
    category: 'PFP',
    isVerified: true
  }
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CollectionFilters>({
    category: '',
    sortBy: 'newest',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'art', name: 'Art' },
    { id: 'collectibles', name: 'Collectibles' },
    { id: 'music', name: 'Music' },
    { id: 'photography', name: 'Photography' },
    { id: 'sports', name: 'Sports' },
    { id: 'trading-cards', name: 'Trading Cards' },
    { id: 'utility', name: 'Utility' },
    { id: 'virtual-worlds', name: 'Virtual Worlds' },
  ];

  // Fetch collections (in a real app, this would be an API call)
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setCollections(mockCollections);
        setFilteredCollections(mockCollections);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...collections];

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(collection => 
        collection.name.toLowerCase().includes(query) ||
        collection.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(collection => 
        collection.category.toLowerCase() === filters.category
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'mostItems':
          return b.stats.totalItems - a.stats.totalItems;
        case 'mostOwners':
          return b.stats.totalOwners - a.stats.totalOwners;
        case 'highestVolume':
          return b.stats.volumeTraded - a.stats.volumeTraded;
        default:
          return 0;
      }
    });

    setFilteredCollections(result);
  }, [collections, filters]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId === activeCategory ? null : categoryId);
    setFilters(prev => ({
      ...prev,
      category: categoryId === 'all' ? '' : categoryId
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore Collections
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discover and explore amazing NFT collections from creators around the world
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search collections..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </div>

            {/* Filter Button (Mobile) */}
            <button
              type="button"
              className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Filters
            </button>

            {/* Sort Dropdown (Desktop) */}
            <div className="hidden md:block">
              <div className="relative">
                <select
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="mostItems">Most Items</option>
                  <option value="mostOwners">Most Owners</option>
                  <option value="highestVolume">Highest Volume</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    (filters.category === category.id || 
                     (category.id === 'all' && !filters.category))
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CollectionCard collection={collection} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No collections found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {filters.searchQuery ? 'Try a different search term' : 'No collections match your filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
