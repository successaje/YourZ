-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with proper structure
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    social_links JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT profiles_wallet_address_length CHECK (char_length(wallet_address) = 42),
    CONSTRAINT profiles_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50)
);

-- Create index on wallet_address for faster lookups
CREATE INDEX profiles_wallet_address_idx ON public.profiles (wallet_address);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Drop existing triggers first
DROP TRIGGER IF EXISTS ensure_unique_username ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.check_unique_username();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add wallet_address if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'wallet_address') THEN
        ALTER TABLE public.profiles ADD COLUMN wallet_address TEXT;
    END IF;

    -- Add username if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;

    -- Add bio if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;

    -- Add social_links if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'social_links') THEN
        ALTER TABLE public.profiles ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Update existing rows to ensure they have required fields
UPDATE public.profiles
SET 
    username = COALESCE(username, 'user_' || SUBSTRING(wallet_address FROM 3 FOR 6)),
    bio = COALESCE(bio, ''),
    social_links = COALESCE(social_links, '{}'::jsonb),
    updated_at = COALESCE(updated_at, created_at)
WHERE 
    username IS NULL 
    OR bio IS NULL 
    OR social_links IS NULL 
    OR updated_at IS NULL;

-- Add constraints if they don't exist
DO $$ 
BEGIN
    -- Add NOT NULL constraints
    ALTER TABLE public.profiles 
        ALTER COLUMN wallet_address SET NOT NULL,
        ALTER COLUMN username SET NOT NULL;

    -- Add unique constraint on wallet_address if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                  WHERE conname = 'profiles_wallet_address_key') THEN
        ALTER TABLE public.profiles 
            ADD CONSTRAINT profiles_wallet_address_key UNIQUE (wallet_address);
    END IF;

    -- Add username length constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                  WHERE conname = 'profiles_username_length') THEN
        ALTER TABLE public.profiles 
            ADD CONSTRAINT profiles_username_length 
            CHECK (char_length(username) >= 3 AND char_length(username) <= 50);
    END IF;

    -- Add wallet address format constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                  WHERE conname = 'profiles_wallet_address_format') THEN
        ALTER TABLE public.profiles 
            ADD CONSTRAINT profiles_wallet_address_format 
            CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$');
    END IF;
END $$;

-- Create index on wallet_address if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE indexname = 'profiles_wallet_address_idx') THEN
        CREATE INDEX profiles_wallet_address_idx ON public.profiles (wallet_address);
    END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger function
CREATE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create unique username function
CREATE FUNCTION public.check_unique_username()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE username = NEW.username
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Username already exists';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create unique username trigger
CREATE TRIGGER ensure_unique_username
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_unique_username(); 