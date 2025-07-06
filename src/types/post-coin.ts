export interface PostCoin {
  id: string;
  post_id: string;
  contract_address: string;
  name: string;
  symbol: string;
  total_supply: number;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostCoinParams {
  postId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  totalSupply: number;
  creatorId: string;
}

export interface PostCoinWithPost extends PostCoin {
  post: {
    id: string;
    title: string;
    content: string;
    // Add other post fields as needed
  };
}
