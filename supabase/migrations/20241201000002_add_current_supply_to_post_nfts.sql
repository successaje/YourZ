-- Add current_supply column to post_nfts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_nfts' 
        AND column_name = 'current_supply'
    ) THEN
        ALTER TABLE public.post_nfts ADD COLUMN current_supply integer not null default 0;
    END IF;
END $$; 