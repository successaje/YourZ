import { usePostCoinData } from '@/hooks/usePostCoinData';
import { CreateCoinButton } from './CreateCoinButton';
import { PostCoinInfo } from './PostCoinInfo';
import { Skeleton } from '@/components/ui/skeleton';

export function PostCoinManager({ 
  post,
  className = '' 
}: { 
  post: {
    id: string;
    title: string;
    content: string;
    author_id: string;
  };
  className?: string;
}) {
  const { postCoin, isLoading, refresh } = usePostCoinData(post.id);
  const currentUserId = 'current-user-id'; // Replace with actual auth user ID

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const isCreator = post.author_id === currentUserId;

  return (
    <div className={className}>
      {postCoin ? (
        <PostCoinInfo 
          postCoin={postCoin} 
          post={post} 
          onRefresh={refresh} 
        />
      ) : isCreator ? (
        <div className="border rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No Coin Created Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create a community token for your post to engage with your audience.
          </p>
          <CreateCoinButton 
            post={post} 
            onSuccess={refresh}
            variant="default"
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No coin has been created for this post yet.
        </div>
      )}
    </div>
  );
}
