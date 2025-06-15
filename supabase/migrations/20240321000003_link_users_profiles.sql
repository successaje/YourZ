-- Add wallet_address column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;

-- Add foreign key from profiles to users
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to sync wallet_address between users and profiles
CREATE OR REPLACE FUNCTION sync_wallet_address()
RETURNS TRIGGER AS $$
BEGIN
    -- When a profile is created or updated
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update the corresponding user's wallet_address
        UPDATE users
        SET wallet_address = NEW.wallet_address
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wallet_address sync
DROP TRIGGER IF EXISTS sync_wallet_address_trigger ON profiles;
CREATE TRIGGER sync_wallet_address_trigger
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_wallet_address();

-- Create function to ensure user exists when profile is created
CREATE OR REPLACE FUNCTION ensure_user_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE wallet_address = NEW.wallet_address) THEN
        -- Create user if it doesn't exist
        INSERT INTO users (wallet_address, created_at, updated_at)
        VALUES (NEW.wallet_address, NEW.created_at, NEW.updated_at)
        RETURNING id INTO NEW.user_id;
    ELSE
        -- Get existing user's id
        SELECT id INTO NEW.user_id
        FROM users
        WHERE wallet_address = NEW.wallet_address;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user existence
DROP TRIGGER IF EXISTS ensure_user_exists_trigger ON profiles;
CREATE TRIGGER ensure_user_exists_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_exists(); 