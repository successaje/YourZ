import { useEffect, useState } from 'react';
import { PostCoinWithPost } from '@/types/post-coin';
import { getPostCoinWithPost } from '@/services/postCoinService';

export const usePostCoinData = (postId: string) => {
  const [postCoin, setPostCoin] = useState<PostCoinWithPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPostCoin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPostCoinWithPost(postId);
      setPostCoin(data);
    } catch (err) {
      console.error('Error fetching post coin:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch post coin'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostCoin();
    }
  }, [postId]);

  return {
    postCoin,
    isLoading,
    error,
    refresh: fetchPostCoin,
  };
};

export default usePostCoinData;
