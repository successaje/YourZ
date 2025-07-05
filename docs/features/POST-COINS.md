# Post Coins Feature

## Overview
Post Coins allow content creators to create their own community tokens for individual posts. These tokens can be used for various purposes like tipping, governance, or exclusive access.

## Database Schema

### `post_coins` Table
- `id` (UUID): Primary key
- `post_id` (UUID): Reference to the post
- `contract_address` (TEXT): On-chain contract address
- `name` (TEXT): Token name
- `symbol` (TEXT): Token symbol (3-5 characters)
- `total_supply` (NUMERIC): Total token supply
- `creator_id` (UUID): Reference to the user who created the coin
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

## Components

### `CreateCoinButton`
A button that opens a dialog to create a new coin for a post.

### `PostCoinInfo`
Displays information about a post's coin including token details and contract address.

### `PostCoinManager`
Manages the state and rendering of post coin components based on whether a coin exists.

## Hooks

### `usePostCoin`
Handles the logic for creating a new post coin, including blockchain interaction and database updates.

### `usePostCoinData`
Fetches and manages the state of a post's coin data.

## Services

### `postCoinService`
Provides functions to interact with the `post_coins` table in Supabase.

## Usage

### Creating a New Coin
```tsx
import { PostCoinManager } from '@/components/post/PostCoinManager';

function PostPage({ post }) {
  return (
    <div>
      {/* Post content */}
      <PostCoinManager post={post} className="mt-8" />
    </div>
  );
}
```

### Manually Creating a Coin
```tsx
import { usePostCoin } from '@/hooks/usePostCoin';

function SomeComponent({ post }) {
  const { createCoinForPost, isCreating, error } = usePostCoin();
  
  const handleCreate = async () => {
    const result = await createCoinForPost(post);
    if (result) {
      // Handle success
    }
  };
  
  return (
    <button onClick={handleCreate} disabled={isCreating}>
      {isCreating ? 'Creating...' : 'Create Coin'}
    </button>
  );
}
```

## Security
- Only the post author can create a coin for their post
- Contract deployment requires a connected wallet
- All database operations are protected by Row Level Security (RLS)

## Error Handling
- Invalid input validation
- Blockchain transaction errors
- Database operation failures
- Network issues

## Future Enhancements
1. Add token distribution management
2. Implement token gating for content
3. Add analytics for token usage
4. Support for multiple token standards
