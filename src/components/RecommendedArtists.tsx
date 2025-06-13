'use client';

import { PlaceholderAvatar } from './PlaceholderAvatar';

const recommendedArtists = [
  {
    id: 1,
    name: 'Alex Thompson',
    address: '0x1234...5678',
    followers: 1234,
    posts: 56
  },
  {
    id: 2,
    name: 'Sarah Chen',
    address: '0x8765...4321',
    followers: 2345,
    posts: 78
  },
  {
    id: 3,
    name: 'Marcus Rodriguez',
    address: '0x2468...1357',
    followers: 3456,
    posts: 92
  }
];

export function RecommendedArtists() {
  return (
    <div className="space-y-4">
      {recommendedArtists.map((artist) => (
        <div
          key={artist.id}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors cursor-pointer"
        >
          <PlaceholderAvatar name={artist.name} size={40} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {artist.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {artist.followers.toLocaleString()} followers
            </p>
          </div>
          <button className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
            Follow
          </button>
        </div>
      ))}
    </div>
  );
} 