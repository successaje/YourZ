'use client';

import { PlaceholderAvatar } from './PlaceholderAvatar';

interface Earning {
  id: number;
  username: string;
  address: string;
  amount: string;
  currency: string;
}

interface NftItem {
  id: number;
  username: string;
  address: string;
  count: number;
}

const mockEarnings: Earning[] = [
  {
    id: 1,
    username: 'alex_writer',
    address: '0x1234...5678',
    amount: '2.45',
    currency: 'ETH'
  },
  {
    id: 2,
    username: 'sarah_creator',
    address: '0x8765...4321',
    amount: '1.89',
    currency: 'ETH'
  },
  {
    id: 3,
    username: 'marcus_artist',
    address: '0x2468...1357',
    amount: '3.21',
    currency: 'ETH'
  }
];

const mockNfts: NftItem[] = [
  {
    id: 1,
    username: 'nft_collector',
    address: '0x1357...2468',
    count: 42
  },
  {
    id: 2,
    username: 'digital_creator',
    address: '0x8642...9753',
    count: 28
  },
  {
    id: 3,
    username: 'art_lover',
    address: '0x9753...8642',
    count: 15
  }
];

export function UserEarnings() {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Earnings Section */}
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Top Earners
        </h2>
        <div className="space-y-3">
          {mockEarnings.map((earning) => (
            <div
              key={`earning-${earning.id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <PlaceholderAvatar name={earning.username} size={36} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    @{earning.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {truncateAddress(earning.address)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {earning.amount} {earning.currency}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NFTs Section */}
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          NFT Leaders
        </h2>
        <div className="space-y-3">
          {mockNfts.map((item) => (
            <div
              key={`nft-${item.id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <PlaceholderAvatar name={item.username} size={36} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    @{item.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {truncateAddress(item.address)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {item.count} NFTs
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
