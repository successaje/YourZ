'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCoins, FaExternalLinkAlt, FaEye, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface Coin {
  id: string;
  post_id: string;
  contract_address: string;
  name: string;
  symbol: string;
  total_supply: number;
  creator_id: string;
  metadata_uri: string;
  created_at: string;
  posts?: {
    title: string;
  };
}

export default function CoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllCoins = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('post_coins')
          .select(`
            *,
            posts!post_coins_post_id_fkey (
              title
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching coins:', error);
          return;
        }

        setCoins(data || []);
      } catch (err) {
        console.error('Error fetching coins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCoins();
  }, []);

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.posts?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1000000) {
      return `${(supply / 1000000).toFixed(1)}M`;
    } else if (supply >= 1000) {
      return `${(supply / 1000).toFixed(1)}K`;
    }
    return supply.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <FaCoins className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Coins</h1>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Discover community tokens created by content creators on YourZ
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search coins by name, symbol, or post title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{coins.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Coins</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {coins.reduce((sum, coin) => sum + coin.total_supply, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Supply</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(coins.map(coin => coin.creator_id)).size}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Unique Creators</div>
          </div>
        </div>

        {/* Coins Grid */}
        {filteredCoins.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCoins className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {searchTerm ? 'No coins found' : 'No coins created yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a coin!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoins.map((coin, index) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FaCoins className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {coin.name}
                      </h3>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {coin.symbol}
                      </span>
                    </div>
                  </div>
                </div>
                
                {coin.posts?.title && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From Post:</p>
                    <Link 
                      href={`/post/${coin.post_id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {coin.posts.title}
                    </Link>
                  </div>
                )}
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Supply:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatSupply(coin.total_supply)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(coin.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`https://testnet.zora.co/coin/bsep:${coin.contract_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <FaEye className="mr-2 w-3 h-3" />
                    View on Zora
                  </Link>
                  <Link
                    href={`https://sepolia.basescan.org/token/${coin.contract_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <FaExternalLinkAlt className="mr-2 w-3 h-3" />
                    BaseScan
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 