export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  bannerImageUrl: string;
  owner: {
    address: string;
    name?: string;
    avatar?: string;
  };
  stats: {
    totalItems: number;
    totalOwners: number;
    floorPrice: number;
    volumeTraded: number;
  };
  createdAt: string;
  category: string;
  isVerified: boolean;
}

export interface CollectionCardProps {
  collection: Collection;
}

export interface CollectionFilters {
  category?: string;
  sortBy?: 'newest' | 'oldest' | 'mostItems' | 'mostOwners' | 'highestVolume';
  searchQuery?: string;
}
