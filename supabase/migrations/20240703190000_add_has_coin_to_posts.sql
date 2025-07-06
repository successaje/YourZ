-- Add missing columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS has_coin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ipfs_hash TEXT,
ADD COLUMN IF NOT EXISTS nft_contract_address TEXT,
ADD COLUMN IF NOT EXISTS mint_price NUMERIC,
ADD COLUMN IF NOT EXISTS royalty_bps INTEGER,
ADD COLUMN IF NOT EXISTS coin_contract_address TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS posts_has_coin_idx ON public.posts(has_coin);
CREATE INDEX IF NOT EXISTS posts_ipfs_hash_idx ON public.posts(ipfs_hash);
CREATE INDEX IF NOT EXISTS posts_nft_contract_address_idx ON public.posts(nft_contract_address);
CREATE INDEX IF NOT EXISTS posts_coin_contract_address_idx ON public.posts(coin_contract_address);

-- Update existing posts to have has_coin = false by default
UPDATE public.posts 
SET has_coin = false 
WHERE has_coin IS NULL; 