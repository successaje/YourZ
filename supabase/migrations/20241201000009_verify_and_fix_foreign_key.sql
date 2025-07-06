-- Verify and fix the foreign key constraint for post_nfts
-- First, check if the constraint exists and what it references
DO $$
BEGIN
    -- Drop any existing foreign key constraint on creator_id
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_nfts_creator_id_fkey' 
        AND table_name = 'post_nfts'
    ) THEN
        ALTER TABLE post_nfts DROP CONSTRAINT post_nfts_creator_id_fkey;
    END IF;
    
    -- Add the correct foreign key constraint referencing users.address
    ALTER TABLE post_nfts ADD CONSTRAINT post_nfts_creator_id_fkey 
        FOREIGN KEY (creator_id) REFERENCES users(address) ON DELETE CASCADE;
        
    RAISE NOTICE 'Foreign key constraint updated successfully';
END $$;

-- Disable RLS for development
ALTER TABLE public.post_nfts DISABLE ROW LEVEL SECURITY; 