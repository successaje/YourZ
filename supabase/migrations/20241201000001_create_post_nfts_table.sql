-- Create post_nfts table to track NFTs created for posts
create table if not exists public.post_nfts (
  id uuid not null default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  contract_address text not null,
  token_id text not null,
  name text not null,
  description text,
  image_url text,
  price numeric,
  max_supply integer not null default 1,
  current_supply integer not null default 0,
  creator_id uuid not null references auth.users(id) on delete cascade,
  creator_address text not null,
  metadata_uri text,
  collection_name text,
  collection_description text,
  attributes jsonb,
  status text not null default 'minted' check (status in ('minted', 'listed', 'sold', 'burned')),
  minted_at timestamp with time zone not null default now(),
  listed_at timestamp with time zone,
  sold_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint post_nfts_pkey primary key (id),
  constraint post_nfts_post_id_key unique (post_id),
  constraint post_nfts_contract_token_key unique (contract_address, token_id)
);

-- Enable Row Level Security
alter table public.post_nfts enable row level security;

-- Create policies for post_nfts
create policy "Public post_nfts are viewable by everyone."
  on public.post_nfts for select
  using ( true );

create policy "Users can insert their own post_nfts."
  on public.post_nfts for insert
  with check ( auth.uid() = creator_id );

create policy "Users can update their own post_nfts."
  on public.post_nfts for update
  using ( auth.uid() = creator_id );

create policy "Users can delete their own post_nfts."
  on public.post_nfts for delete
  using ( auth.uid() = creator_id );

-- Create a function to update the updated_at column
create or replace function public.handle_nft_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to update the updated_at column
create trigger handle_post_nfts_updated_at
  before update on public.post_nfts
  for each row
  execute function public.handle_nft_updated_at();

-- Create indexes for better performance
create index if not exists post_nfts_post_id_idx on public.post_nfts (post_id);
create index if not exists post_nfts_creator_id_idx on public.post_nfts (creator_id);
create index if not exists post_nfts_creator_address_idx on public.post_nfts (creator_address);
create index if not exists post_nfts_contract_address_idx on public.post_nfts (contract_address);
create index if not exists post_nfts_status_idx on public.post_nfts (status);
create index if not exists post_nfts_minted_at_idx on public.post_nfts (minted_at);
create index if not exists post_nfts_price_idx on public.post_nfts (price);

-- Create a function to get NFT statistics for a user
create or replace function public.get_user_nft_stats(user_address text)
returns table (
  total_nfts bigint,
  total_value numeric,
  avg_price numeric,
  listed_count bigint,
  sold_count bigint
) as $$
begin
  return query
  select 
    count(*) as total_nfts,
    coalesce(sum(price), 0) as total_value,
    coalesce(avg(price), 0) as avg_price,
    count(*) filter (where status = 'listed') as listed_count,
    count(*) filter (where status = 'sold') as sold_count
  from public.post_nfts
  where creator_address = user_address;
end;
$$ language plpgsql security definer;

-- Create a function to get recent NFTs
create or replace function public.get_recent_nfts(limit_count integer default 10)
returns table (
  id uuid,
  post_id uuid,
  contract_address text,
  token_id text,
  name text,
  description text,
  image_url text,
  price numeric,
  creator_address text,
  status text,
  minted_at timestamp with time zone,
  post_title text
) as $$
begin
  return query
  select 
    pn.id,
    pn.post_id,
    pn.contract_address,
    pn.token_id,
    pn.name,
    pn.description,
    pn.image_url,
    pn.price,
    pn.creator_address,
    pn.status,
    pn.minted_at,
    p.title as post_title
  from public.post_nfts pn
  join public.posts p on pn.post_id = p.id
  order by pn.minted_at desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Add NFT-related columns to posts table if they don't exist
DO $$ 
BEGIN
    -- Add nft_contract_address column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'nft_contract_address'
    ) THEN
        ALTER TABLE posts ADD COLUMN nft_contract_address TEXT;
    END IF;

    -- Add nft_token_id column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'nft_token_id'
    ) THEN
        ALTER TABLE posts ADD COLUMN nft_token_id TEXT;
    END IF;

    -- Add nft_price column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'nft_price'
    ) THEN
        ALTER TABLE posts ADD COLUMN nft_price NUMERIC;
    END IF;

    -- Add nft_status column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'nft_status'
    ) THEN
        ALTER TABLE posts ADD COLUMN nft_status TEXT DEFAULT 'not_minted';
    END IF;
END $$;

-- Create indexes for the new NFT columns in posts table
CREATE INDEX IF NOT EXISTS idx_posts_nft_contract_address ON posts(nft_contract_address);
CREATE INDEX IF NOT EXISTS idx_posts_nft_status ON posts(nft_status);
CREATE INDEX IF NOT EXISTS idx_posts_is_nft ON posts(is_nft);

-- Create a function to increment a column value
CREATE OR REPLACE FUNCTION increment_column(table_name text, column_name text, row_id uuid)
RETURNS integer AS $$
DECLARE
    current_value integer;
BEGIN
    EXECUTE format('SELECT %I FROM %I WHERE id = $1', column_name, table_name)
    INTO current_value
    USING row_id;
    
    RETURN COALESCE(current_value, 0) + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 