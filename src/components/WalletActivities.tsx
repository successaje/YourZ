import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWalletActivities } from "@/hooks/useWalletActivities"
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface WalletActivitiesProps {
  address?: string;
}

export function WalletActivities({ address }: WalletActivitiesProps) {
  const { data: allActivities = [], isLoading } = useWalletActivities()
  
  // Filter activities by address if provided
  const activities = address 
    ? allActivities.filter(activity => 
        activity.from?.toLowerCase() === address.toLowerCase() || 
        activity.to?.toLowerCase() === address.toLowerCase()
      )
    : allActivities

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return '🔄';
      case 'MINT':
        return '✨';
      case 'SALE':
        return '💰';
      case 'LIST':
        return '📋';
      case 'BID':
        return '💸';
      default:
        return '📝';
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No activities found
      </div>
    )
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="transfers">Transfers</TabsTrigger>
        <TabsTrigger value="mints">Mints</TabsTrigger>
        <TabsTrigger value="sales">Sales</TabsTrigger>
        <TabsTrigger value="bids">Bids</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {activities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </TabsContent>
      
      <TabsContent value="transfers">
        {activities
          .filter(a => a.type === 'TRANSFER')
          .map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
      </TabsContent>
      
      <TabsContent value="mints">
        {activities
          .filter(a => a.type === 'MINT')
          .map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
      </TabsContent>
      
      <TabsContent value="sales">
        {activities
          .filter(a => a.type === 'SALE')
          .map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
      </TabsContent>
      
      <TabsContent value="bids">
        {activities
          .filter(a => a.type === 'BID')
          .map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
      </TabsContent>
    </Tabs>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getActivityIcon(activity.type)}</span>
          <div>
            <div className="font-medium">
              {activity.type === 'TRANSFER' && 'Transfer'}
              {activity.type === 'MINT' && 'Mint'}
              {activity.type === 'SALE' && 'Sale'}
              {activity.type === 'LIST' && 'List'}
              {activity.type === 'BID' && 'Bid'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </div>
          </div>
        </div>
        <div className="text-right">
          {activity.price && (
            <div className="font-medium">{activity.price} ETH</div>
          )}
          <Link 
            href={`https://basescan.org/tx/${activity.txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline flex items-center justify-end"
          >
            View on Explorer <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">From:</span>
          <span className="font-mono">{formatAddress(activity.from)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">To:</span>
          <span className="font-mono">{formatAddress(activity.to)}</span>
        </div>
        {activity.tokenId && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Token ID:</span>
            <span>{activity.tokenId}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get activity icon
function getActivityIcon(type: string) {
  switch (type) {
    case 'TRANSFER':
      return '🔄';
    case 'MINT':
      return '✨';
    case 'SALE':
      return '💰';
    case 'LIST':
      return '📋';
    case 'BID':
      return '💸';
    default:
      return '📝';
  }
}

// Helper function to format address
function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
