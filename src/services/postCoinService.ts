import { supabase } from '@/lib/supabase';
import { PostCoin, CreatePostCoinParams, PostCoinWithPost } from '@/types/post-coin';

export const createPostCoin = async (params: CreatePostCoinParams): Promise<PostCoin> => {
  const { data, error } = await supabase
    .from('post_coins')
    .insert({
      post_id: params.postId,
      contract_address: params.contractAddress,
      name: params.name,
      symbol: params.symbol,
      total_supply: params.totalSupply,
      creator_id: params.creatorId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post coin:', error);
    throw new Error(`Failed to create post coin: ${error.message}`);
  }

  return data as PostCoin;
};

export const getPostCoinByPostId = async (postId: string): Promise<PostCoin | null> => {
  const { data, error } = await supabase
    .from('post_coins')
    .select('*')
    .eq('post_id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error fetching post coin:', error);
    throw new Error(`Failed to fetch post coin: ${error.message}`);
  }

  return data as PostCoin;
};

export const getPostCoinWithPost = async (postId: string): Promise<PostCoinWithPost | null> => {
  const { data, error } = await supabase
    .from('post_coins')
    .select(`
      *,
      post:post_id (id, title, content)
    `)
    .eq('post_id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error fetching post coin with post:', error);
    throw new Error(`Failed to fetch post coin with post: ${error.message}`);
  }

  return data as unknown as PostCoinWithPost;
};

export const getPostCoinsByCreator = async (creatorId: string): Promise<PostCoinWithPost[]> => {
  const { data, error } = await supabase
    .from('post_coins')
    .select(`
      *,
      post:post_id (id, title, content)
    `)
    .eq('creator_id', creatorId);

  if (error) {
    console.error('Error fetching user post coins:', error);
    throw new Error(`Failed to fetch user post coins: ${error.message}`);
  }

  return data as unknown as PostCoinWithPost[];
};
