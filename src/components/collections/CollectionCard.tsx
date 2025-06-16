import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/types/collection';

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collection/${collection.id}`}>
      <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
        {/* Banner Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {collection.bannerImageUrl && (
            <Image
              src={collection.bannerImageUrl}
              alt={`${collection.name} banner`}
              fill
              className="object-cover"
            />
          )}
        </div>
        
        <div className="p-4 relative">
          {/* Collection Image */}
          <div className="absolute -top-8 left-4 w-16 h-16 rounded-xl border-4 border-white dark:border-gray-800 overflow-hidden bg-white">
            {collection.imageUrl ? (
              <Image
                src={collection.imageUrl}
                alt={collection.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-2xl font-bold">
                  {collection.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Collection Info */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {collection.name}
              </h3>
              {collection.isVerified && (
                <span className="text-blue-500" aria-label="Verified collection">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {collection.description}
            </p>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {collection.stats.totalItems.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {collection.stats.totalOwners.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Owners</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {collection.stats.floorPrice.toFixed(2)} ETH
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Floor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
