-- Add missing columns to post_nfts table
DO $$ 
BEGIN
    -- Add max_supply column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'max_supply'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN max_supply integer not null default 1;
    END IF;

    -- Add current_supply column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'current_supply'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN current_supply integer not null default 0;
    END IF;

    -- Add creator_address column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'creator_address'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN creator_address text;
    END IF;

    -- Add metadata_uri column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'metadata_uri'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN metadata_uri text;
    END IF;

    -- Add collection_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'collection_name'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN collection_name text;
    END IF;

    -- Add collection_description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'collection_description'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN collection_description text;
    END IF;

    -- Add attributes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'attributes'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN attributes jsonb;
    END IF;

    -- Add minted_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'minted_at'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN minted_at timestamp with time zone not null default now();
    END IF;

    -- Add listed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'listed_at'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN listed_at timestamp with time zone;
    END IF;

    -- Add sold_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'sold_at'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN sold_at timestamp with time zone;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN status text not null default 'minted' check (status in ('minted', 'listed', 'sold', 'burned'));
    END IF;

END $$;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS post_nfts_creator_address_idx ON public.post_nfts (creator_address);
CREATE INDEX IF NOT EXISTS post_nfts_status_idx ON public.post_nfts (status);
CREATE INDEX IF NOT EXISTS post_nfts_minted_at_idx ON public.post_nfts (minted_at); 